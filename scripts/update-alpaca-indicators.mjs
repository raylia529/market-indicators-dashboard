import fs from "node:fs";
import path from "node:path";

const apiKeyId = process.env.ALPACA_API_KEY_ID;
const apiSecretKey = process.env.ALPACA_API_SECRET_KEY;
const alpacaBarsUrl = "https://data.alpaca.markets/v2/stocks/bars";
const constituentUrl =
  "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv";
const requestTimeoutMs = 30_000;
const batchSize = 100;
const minimumCoverageRatio = 0.95;
const ratioBootstrapDate = "2016-01-01";
const breadthBootstrapDate = "2016-01-01";
const overlapCalendarDays = 14;
const rollingWindowCalendarDays = 430;

const files = {
  hygIef: path.join("data", "hyg-ief.csv"),
  rspSpy: path.join("data", "rsp-spy.csv"),
  above200: path.join("data", "sp500-above-200dma.csv"),
  newHighLow: path.join("data", "new-high-low-breadth.csv"),
};

const onlyArg = process.argv.find((argument) => argument.startsWith("--only="));
const requestedUpdates = new Set(
  onlyArg
    ? onlyArg
        .slice("--only=".length)
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    : ["ratios", "breadth"],
);

for (const update of requestedUpdates) {
  if (!["ratios", "breadth"].includes(update)) {
    throw new Error(`Unsupported Alpaca update selection: ${update}`);
  }
}

if (!apiKeyId || !apiSecretKey) {
  throw new Error(
    "ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY must be configured as environment secrets.",
  );
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysBefore(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return isoDate(date);
}

function rollingStartDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - rollingWindowCalendarDays);
  return isoDate(date);
}

function requestEndDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return isoDate(date);
}

function splitCsvLine(line) {
  const fields = [];
  let value = "";
  let inQuotes = false;

  for (const character of line) {
    if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      fields.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  fields.push(value);
  return fields.map((field) => field.trim());
}

function loadSingleCsv(file) {
  if (!fs.existsSync(file)) {
    return [];
  }

  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, rawValue] = splitCsvLine(line);
      return { date, value: Number(rawValue) };
    })
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.value))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function mergeRowsByDate(...collections) {
  const byDate = new Map();
  for (const rows of collections) {
    for (const row of rows) {
      byDate.set(row.date, row);
    }
  }
  return Array.from(byDate.values()).sort((left, right) => left.date.localeCompare(right.date));
}

function validateRows(rows, label, { earliestDate = null, minimumRows = 1 } = {}) {
  if (rows.length < minimumRows) {
    throw new Error(`${label} has only ${rows.length} valid observations.`);
  }

  const dates = rows.map((row) => row.date);
  if (new Set(dates).size !== dates.length) {
    throw new Error(`${label} contains duplicate dates.`);
  }

  if (rows.some((row, index) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(row.value)) {
      return true;
    }
    return index > 0 && rows[index - 1].date >= row.date;
  })) {
    throw new Error(`${label} contains invalid or unsorted observations.`);
  }

  if (earliestDate && rows[0].date > earliestDate) {
    throw new Error(`${label} starts unexpectedly late at ${rows[0].date}.`);
  }
}

function prepareCsv(file, rows, label, decimals, options = {}) {
  validateRows(rows, label, options);
  const temporaryFile = `${file}.tmp`;
  const output = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(decimals)}`)
    .join("\n")}\n`;
  fs.writeFileSync(temporaryFile, output);
  validateRows(loadSingleCsv(temporaryFile), label, options);
  return temporaryFile;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}: ${body}`);
  }

  return response.text();
}

async function getAlpacaBars(symbols, start, end) {
  const barsBySymbol = new Map(symbols.map((symbol) => [symbol, []]));
  let nextPageToken = null;
  let pages = 0;

  do {
    const parameters = new URLSearchParams({
      symbols: symbols.join(","),
      timeframe: "1Day",
      start,
      end,
      limit: "10000",
      adjustment: "split",
      feed: "iex",
      sort: "asc",
    });

    if (nextPageToken) {
      parameters.set("page_token", nextPageToken);
    }

    const payload = JSON.parse(
      await fetchText(`${alpacaBarsUrl}?${parameters}`, {
        headers: {
          "APCA-API-KEY-ID": apiKeyId,
          "APCA-API-SECRET-KEY": apiSecretKey,
          Accept: "application/json",
        },
      }),
    );

    for (const [symbol, rows] of Object.entries(payload.bars || {})) {
      barsBySymbol.get(symbol)?.push(...rows);
    }

    nextPageToken = payload.next_page_token || null;
    pages += 1;

    if (pages > 30) {
      throw new Error(`Alpaca pagination exceeded 30 pages for ${symbols.length} symbols.`);
    }
  } while (nextPageToken);

  for (const [symbol, rows] of barsBySymbol) {
    const byDate = new Map();
    for (const row of rows) {
      const date = row.t?.slice(0, 10);
      const close = Number(row.c);
      if (date && Number.isFinite(close) && close > 0) {
        byDate.set(date, { date, value: close });
      }
    }
    barsBySymbol.set(
      symbol,
      Array.from(byDate.values()).sort((left, right) => left.date.localeCompare(right.date)),
    );
  }

  return { barsBySymbol, pages };
}

async function getSp500Constituents() {
  const text = await fetchText(constituentUrl);
  const symbols = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => splitCsvLine(line)[0])
    .filter(Boolean);
  const uniqueSymbols = [...new Set(symbols)];

  if (uniqueSymbols.length < 490 || uniqueSymbols.length > 520) {
    throw new Error(`Unexpected S&P 500 constituent count: ${uniqueSymbols.length}`);
  }

  return uniqueSymbols;
}

function calculateRatio(leftRows, rightRows) {
  const rightByDate = new Map(rightRows.map((row) => [row.date, row.value]));
  return leftRows
    .filter((row) => Number.isFinite(rightByDate.get(row.date)) && rightByDate.get(row.date) > 0)
    .map((row) => ({ date: row.date, value: row.value / rightByDate.get(row.date) }));
}

async function updateRatios() {
  const existingRspSpy = loadSingleCsv(files.rspSpy);
  const existingHygIef = loadSingleCsv(files.hygIef);
  const rspStart = existingRspSpy.length
    ? daysBefore(existingRspSpy.at(-1).date, overlapCalendarDays)
    : ratioBootstrapDate;
  const hygStart = existingHygIef.length
    ? daysBefore(existingHygIef.at(-1).date, overlapCalendarDays)
    : ratioBootstrapDate;
  const requestStart = rspStart < hygStart ? rspStart : hygStart;
  const { barsBySymbol, pages } = await getAlpacaBars(
    ["RSP", "SPY", "HYG", "IEF"],
    requestStart,
    requestEndDate(),
  );

  const downloadedRspSpy = calculateRatio(
    barsBySymbol.get("RSP") || [],
    barsBySymbol.get("SPY") || [],
  ).filter((row) => row.date >= rspStart);
  const downloadedHygIef = calculateRatio(
    barsBySymbol.get("HYG") || [],
    barsBySymbol.get("IEF") || [],
  ).filter((row) => row.date >= hygStart);
  const finalRspSpy = mergeRowsByDate(existingRspSpy, downloadedRspSpy);
  const finalHygIef = mergeRowsByDate(existingHygIef, downloadedHygIef);

  const rspSpyTemporaryFile = prepareCsv(
    files.rspSpy,
    finalRspSpy,
    "RSP/SPY split-adjusted close ratio",
    6,
    {
    earliestDate: "2016-01-05",
    minimumRows: 200,
    },
  );
  const hygIefTemporaryFile = prepareCsv(
    files.hygIef,
    finalHygIef,
    "HYG/IEF split-adjusted close ratio",
    6,
    {
      earliestDate: "2007-04-12",
      minimumRows: existingHygIef.length || 200,
    },
  );
  fs.renameSync(rspSpyTemporaryFile, files.rspSpy);
  fs.renameSync(hygIefTemporaryFile, files.hygIef);

  console.log("Alpaca ETF ratio validation");
  console.log("Source: Alpaca Market Data API, free IEX daily bars");
  console.log("Adjustment: split");
  console.log(`Pages requested: ${pages}`);
  console.log(`RSP/SPY earliest date: ${finalRspSpy[0].date}`);
  console.log(`RSP/SPY latest date: ${finalRspSpy.at(-1).date}`);
  console.log(`RSP/SPY valid observations: ${finalRspSpy.length}`);
  console.log(`HYG/IEF earliest date: ${finalHygIef[0].date}`);
  console.log(`HYG/IEF latest date: ${finalHygIef.at(-1).date}`);
  console.log(`HYG/IEF valid observations: ${finalHygIef.length}`);
}

function increment(map, date, amount = 1) {
  map.set(date, (map.get(date) || 0) + amount);
}

function calculateBreadthForSymbol(
  rows,
  aboveByDate,
  aboveTotalByDate,
  highsByDate,
  lowsByDate,
  highLowTotalByDate,
) {
  const closes = rows.map((row) => row.value);
  let rolling200Total = 0;
  const highIndexes = [];
  const lowIndexes = [];
  let highStart = 0;
  let lowStart = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const current = closes[index];
    const date = rows[index].date;
    rolling200Total += current;

    if (index >= 200) {
      rolling200Total -= closes[index - 200];
    }

    if (index >= 199) {
      increment(aboveTotalByDate, date);
      if (current > rolling200Total / 200) {
        increment(aboveByDate, date);
      }
    }

    while (
      highIndexes.length > highStart &&
      closes[highIndexes.at(-1)] <= current
    ) {
      highIndexes.pop();
    }
    highIndexes.push(index);
    while (highIndexes[highStart] < index - 251) {
      highStart += 1;
    }

    while (
      lowIndexes.length > lowStart &&
      closes[lowIndexes.at(-1)] >= current
    ) {
      lowIndexes.pop();
    }
    lowIndexes.push(index);
    while (lowIndexes[lowStart] < index - 251) {
      lowStart += 1;
    }

    if (index >= 251) {
      increment(highLowTotalByDate, date);
      if (current >= closes[highIndexes[highStart]]) {
        increment(highsByDate, date);
      }
      if (current <= closes[lowIndexes[lowStart]]) {
        increment(lowsByDate, date);
      }
    }
  }
}

async function updateBreadth() {
  const existingAbove200 = loadSingleCsv(files.above200);
  const existingNewHighLow = loadSingleCsv(files.newHighLow);
  const bootstrap = existingNewHighLow.length === 0;
  const start = bootstrap ? breadthBootstrapDate : rollingStartDate();
  const end = requestEndDate();
  const symbols = await getSp500Constituents();
  const minimumCoverage = Math.ceil(symbols.length * minimumCoverageRatio);
  const aboveByDate = new Map();
  const aboveTotalByDate = new Map();
  const highsByDate = new Map();
  const lowsByDate = new Map();
  const highLowTotalByDate = new Map();
  let totalPages = 0;
  let symbolsWithAtLeast252Bars = 0;

  for (let offset = 0; offset < symbols.length; offset += batchSize) {
    const batch = symbols.slice(offset, offset + batchSize);
    const result = await getAlpacaBars(batch, start, end);
    totalPages += result.pages;

    for (const symbol of batch) {
      const rows = result.barsBySymbol.get(symbol) || [];
      if (rows.length >= 252) {
        symbolsWithAtLeast252Bars += 1;
      }
      calculateBreadthForSymbol(
        rows,
        aboveByDate,
        aboveTotalByDate,
        highsByDate,
        lowsByDate,
        highLowTotalByDate,
      );
    }

    console.log(
      `Alpaca breadth batch ${Math.floor(offset / batchSize) + 1}: ${batch.length} symbols, ${result.pages} pages`,
    );
  }

  if (symbolsWithAtLeast252Bars < minimumCoverage) {
    throw new Error(
      `Only ${symbolsWithAtLeast252Bars}/${symbols.length} constituents have 252 daily bars; ` +
        `${minimumCoverage} are required.`,
    );
  }

  const calculatedAbove200 = Array.from(aboveTotalByDate)
    .filter(([, total]) => total >= minimumCoverage)
    .map(([date, total]) => ({
      date,
      value: ((aboveByDate.get(date) || 0) / total) * 100,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
  const calculatedNewHighLow = Array.from(highLowTotalByDate)
    .filter(([, total]) => total >= minimumCoverage)
    .map(([date, total]) => ({
      date,
      value: (((highsByDate.get(date) || 0) - (lowsByDate.get(date) || 0)) / total) * 100,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  const finalAbove200 = bootstrap
    ? calculatedAbove200
    : mergeRowsByDate(
        existingAbove200,
        calculatedAbove200.filter((row) => row.date > existingAbove200.at(-1).date),
      );
  const finalNewHighLow = bootstrap
    ? calculatedNewHighLow
    : mergeRowsByDate(
        existingNewHighLow,
        calculatedNewHighLow.filter((row) => row.date > existingNewHighLow.at(-1).date),
      );

  const aboveTemporaryFile = prepareCsv(
    files.above200,
    finalAbove200,
    "% Stocks Above 200DMA (Alpaca current-constituent proxy)",
    1,
    { minimumRows: 30 },
  );
  const highLowTemporaryFile = prepareCsv(
    files.newHighLow,
    finalNewHighLow,
    "New High-Low Breadth (Alpaca current-constituent proxy)",
    1,
    { minimumRows: 30 },
  );
  fs.renameSync(aboveTemporaryFile, files.above200);
  fs.renameSync(highLowTemporaryFile, files.newHighLow);

  console.log("Alpaca breadth validation");
  console.log("Source: Alpaca Market Data API, free IEX daily bars");
  console.log("Method: current S&P 500 constituent proxy; no historical membership reconstruction");
  console.log(`Request window: ${start} through ${end}`);
  console.log(`Pages requested: ${totalPages}`);
  console.log(`Constituents: ${symbols.length}`);
  console.log(`Constituents with at least 252 bars: ${symbolsWithAtLeast252Bars}`);
  console.log(`Minimum daily calculation coverage: ${minimumCoverage} (95%)`);
  console.log(`Above 200DMA earliest date: ${finalAbove200[0].date}`);
  console.log(`Above 200DMA latest date: ${finalAbove200.at(-1).date}`);
  console.log(`Above 200DMA observations: ${finalAbove200.length}`);
  console.log(`New High-Low earliest date: ${finalNewHighLow[0].date}`);
  console.log(`New High-Low latest date: ${finalNewHighLow.at(-1).date}`);
  console.log(`New High-Low observations: ${finalNewHighLow.length}`);
}

async function main() {
  if (requestedUpdates.has("ratios")) {
    await updateRatios();
  }
  if (requestedUpdates.has("breadth")) {
    await updateBreadth();
  }
}

await main();
