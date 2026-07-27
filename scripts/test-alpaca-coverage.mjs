import fs from "node:fs";

const apiKeyId = process.env.ALPACA_API_KEY_ID;
const apiSecretKey = process.env.ALPACA_API_SECRET_KEY;
const apiUrl = "https://data.alpaca.markets/v2/stocks/bars";
const constituentUrl =
  "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv";
const batchSize = 100;
const minimumTradingDays = 200;
const minimumCoverageRatio = 0.95;

if (!apiKeyId || !apiSecretKey) {
  throw new Error(
    "ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY must be configured as Actions secrets.",
  );
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
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

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}: ${body}`);
  }

  return response.text();
}

async function getSp500Constituents() {
  const text = await fetchText(constituentUrl);
  const symbols = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => splitCsvLine(line)[0])
    .filter(Boolean);

  if (symbols.length < 490 || symbols.length > 520) {
    throw new Error(`Unexpected S&P 500 constituent count: ${symbols.length}`);
  }

  return [...new Set(symbols)];
}

async function getAlpacaBars(symbols, start, end) {
  const barsBySymbol = new Map(symbols.map((symbol) => [symbol, []]));
  let pageToken = null;
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

    if (pageToken) {
      parameters.set("page_token", pageToken);
    }

    const payload = JSON.parse(
      await fetchText(`${apiUrl}?${parameters}`, {
        headers: {
          "APCA-API-KEY-ID": apiKeyId,
          "APCA-API-SECRET-KEY": apiSecretKey,
          Accept: "application/json",
        },
      }),
    );

    for (const [symbol, rows] of Object.entries(payload.bars || {})) {
      if (!barsBySymbol.has(symbol)) {
        barsBySymbol.set(symbol, []);
      }
      barsBySymbol.get(symbol).push(...rows);
    }

    pageToken = payload.next_page_token || null;
    pages += 1;

    if (pages > 25) {
      throw new Error(`Alpaca pagination exceeded 25 pages for a ${symbols.length}-symbol batch.`);
    }
  } while (pageToken);

  return { barsBySymbol, pages };
}

function matchingDates(leftRows, rightRows) {
  const rightDates = new Set(rightRows.map((row) => row.t.slice(0, 10)));
  return leftRows.filter((row) => rightDates.has(row.t.slice(0, 10))).length;
}

function latestDate(rows) {
  return rows.at(-1)?.t?.slice(0, 10) || "none";
}

function appendSummary(lines) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    fs.appendFileSync(summaryFile, `${lines.join("\n")}\n`);
  }
}

async function main() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + 1);
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 430);
  const startDate = isoDate(start);
  const endDate = isoDate(end);

  console.log("Alpaca read-only coverage test");
  console.log(`Window: ${startDate} through ${endDate}`);
  console.log("Feed: IEX");
  console.log("Adjustment: split");

  const ratioSymbols = ["RSP", "SPY", "HYG", "IEF"];
  const ratioResult = await getAlpacaBars(ratioSymbols, startDate, endDate);
  const ratioCounts = Object.fromEntries(
    ratioSymbols.map((symbol) => [symbol, ratioResult.barsBySymbol.get(symbol)?.length || 0]),
  );
  const rspSpyMatching = matchingDates(
    ratioResult.barsBySymbol.get("RSP") || [],
    ratioResult.barsBySymbol.get("SPY") || [],
  );
  const hygIefMatching = matchingDates(
    ratioResult.barsBySymbol.get("HYG") || [],
    ratioResult.barsBySymbol.get("IEF") || [],
  );

  for (const symbol of ratioSymbols) {
    const rows = ratioResult.barsBySymbol.get(symbol) || [];
    console.log(`${symbol}: ${rows.length} bars, latest ${latestDate(rows)}`);
  }
  console.log(`RSP/SPY matching dates: ${rspSpyMatching}`);
  console.log(`HYG/IEF matching dates: ${hygIefMatching}`);

  const constituents = await getSp500Constituents();
  const counts = new Map(constituents.map((symbol) => [symbol, 0]));
  let totalPages = 0;

  for (let offset = 0; offset < constituents.length; offset += batchSize) {
    const batch = constituents.slice(offset, offset + batchSize);
    const result = await getAlpacaBars(batch, startDate, endDate);
    totalPages += result.pages;

    for (const symbol of batch) {
      counts.set(symbol, result.barsBySymbol.get(symbol)?.length || 0);
    }

    console.log(
      `Constituent batch ${Math.floor(offset / batchSize) + 1}: ${batch.length} symbols, ${result.pages} pages`,
    );
  }

  const readySymbols = constituents.filter(
    (symbol) => (counts.get(symbol) || 0) >= minimumTradingDays,
  );
  const missingSymbols = constituents.filter((symbol) => (counts.get(symbol) || 0) === 0);
  const shortSymbols = constituents.filter((symbol) => {
    const count = counts.get(symbol) || 0;
    return count > 0 && count < minimumTradingDays;
  });
  const coverageRatio = readySymbols.length / constituents.length;
  const coveragePassed = coverageRatio >= minimumCoverageRatio;
  const ratiosPassed =
    ratioCounts.RSP >= minimumTradingDays &&
    ratioCounts.SPY >= minimumTradingDays &&
    ratioCounts.HYG >= minimumTradingDays &&
    ratioCounts.IEF >= minimumTradingDays &&
    rspSpyMatching >= minimumTradingDays &&
    hygIefMatching >= minimumTradingDays;

  console.log(`S&P 500 symbols tested: ${constituents.length}`);
  console.log(`Symbols with at least ${minimumTradingDays} bars: ${readySymbols.length}`);
  console.log(`Coverage: ${(coverageRatio * 100).toFixed(1)}%`);
  console.log(`Symbols with no bars: ${missingSymbols.join(", ") || "none"}`);
  console.log(
    `Symbols with fewer than ${minimumTradingDays} bars: ${shortSymbols.join(", ") || "none"}`,
  );
  console.log(`Alpaca pages requested: ${totalPages + ratioResult.pages}`);
  console.log(`ETF ratio readiness: ${ratiosPassed ? "PASS" : "FAIL"}`);
  console.log(`Breadth coverage threshold: ${coveragePassed ? "PASS" : "FAIL"}`);

  appendSummary([
    "## Alpaca read-only coverage test",
    "",
    "| Check | Result |",
    "| --- | --- |",
    `| Feed | IEX |`,
    `| Price adjustment | Split |`,
    `| RSP/SPY matching dates | ${rspSpyMatching} |`,
    `| HYG/IEF matching dates | ${hygIefMatching} |`,
    `| S&P 500 symbols tested | ${constituents.length} |`,
    `| Symbols with at least ${minimumTradingDays} bars | ${readySymbols.length} |`,
    `| Breadth coverage | ${(coverageRatio * 100).toFixed(1)}% |`,
    `| ETF ratio readiness | ${ratiosPassed ? "PASS" : "FAIL"} |`,
    `| Breadth threshold | ${coveragePassed ? "PASS" : "FAIL"} |`,
    "",
    `Missing symbols: ${missingSymbols.join(", ") || "none"}`,
    "",
    `Short-history symbols: ${shortSymbols.join(", ") || "none"}`,
  ]);

  if (!ratiosPassed || !coveragePassed) {
    console.warn(
      "Alpaca authentication succeeded, but the free IEX feed did not meet every migration threshold.",
    );
  }
}

await main();
