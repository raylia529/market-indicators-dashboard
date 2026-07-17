import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const sources = {
  usdJpy: "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXJPUS",
  usdJpyYahoo:
    "https://query2.finance.yahoo.com/v8/finance/chart/JPY%3DX?range=1mo&interval=1d&events=history",
  us2y: "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS2",
  japan2yHistorical:
    "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/historical/jgbcme_all.csv",
  japan2yCurrent:
    "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/jgbcme.csv",
};

const outputFile = path.join("data", "fx.csv");
const profileArg = process.argv.find((argument) => argument.startsWith("--profile="));
const updateProfile = profileArg ? profileArg.slice("--profile=".length).toLowerCase() : "full";
const onlyArg = process.argv.find((argument) => argument.startsWith("--only="));

if (!["full", "us", "asia"].includes(updateProfile)) {
  throw new Error(`Unsupported FX update profile: ${updateProfile}`);
}

const defaultSourcesByProfile = {
  full: ["usdjpy", "us2y", "japan2y"],
  us: ["usdjpy", "us2y"],
  asia: ["japan2y"],
};
const requestedSources = new Set(
  onlyArg
    ? onlyArg
        .slice("--only=".length)
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    : defaultSourcesByProfile[updateProfile],
);
const unsupportedSources = Array.from(requestedSources).filter(
  (source) => !["usdjpy", "us2y", "japan2y"].includes(source),
);

if (requestedSources.size === 0 || unsupportedSources.length > 0) {
  throw new Error(`Unsupported FX source selection: ${Array.from(requestedSources).join(",")}`);
}

function isValidUsdJpyValue(value) {
  return Number.isFinite(value) && value > 50 && value < 300;
}

function download(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers }, (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          download(response.headers.location, headers).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Download failed: ${url} (${response.statusCode})`));
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function downloadWithRetry(url, headers = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await download(url, headers);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await wait(2500 * attempt);
      }
    }
  }
  throw lastError;
}

function parseYahooUsdJpy(text) {
  const payload = JSON.parse(text);
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;

  if (!Array.isArray(timestamps) || !Array.isArray(closes) || timestamps.length !== closes.length) {
    throw new Error("Unexpected Yahoo Finance JPY=X response.");
  }

  const timeZone = result.meta?.exchangeTimezoneName || "UTC";
  const regularMarketTime = result.meta?.regularMarketTime;
  const regularMarketEnd = result.meta?.currentTradingPeriod?.regular?.end;
  const marketIsOpen = Number.isFinite(regularMarketEnd) && Date.now() / 1000 < regularMarketEnd;
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return timestamps
    .map((timestamp, index) => ({
      date: dateFormatter.format(new Date(timestamp * 1000)),
      timestamp,
      value: Number(closes[index]),
    }))
    .filter(
      (row) =>
        row.date &&
        isValidUsdJpyValue(row.value) &&
        !(marketIsOpen && row.timestamp === regularMarketTime),
    );
}

function splitCsvLine(line) {
  const fields = [];
  let value = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  fields.push(value);
  return fields.map((field) => field.replaceAll('"', "").trim());
}

function toIsoDate(dateText) {
  const normalized = dateText.trim().replaceAll("/", "-");
  const parts = normalized.split("-").map((part) => Number(part));

  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return "";
  }

  const [year, month, day] = parts;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function parseFred(text, seriesId) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  const dateIndex = headers.indexOf("observation_date");
  const valueIndex = headers.indexOf(seriesId);

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Unexpected ${seriesId} header: ${headers.join(",")}`);
  }

  return lines
    .slice(1)
    .map((line) => {
      const columns = splitCsvLine(line);
      const date = toIsoDate(columns[dateIndex] || "");
      const rawValue = columns[valueIndex] || "";
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter(
      (row) =>
        row.date && row.rawValue !== "" && row.rawValue !== "." && Number.isFinite(row.value),
    );
}

function parseMofJapan2y(text) {
  const lines = text.trim().split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    const headers = splitCsvLine(line);
    return headers.includes("Date") && headers.includes("2Y");
  });

  if (headerIndex < 0) {
    throw new Error("Could not find MOF Date/2Y header row.");
  }

  const headers = splitCsvLine(lines[headerIndex]);
  const dateIndex = headers.indexOf("Date");
  const valueIndex = headers.indexOf("2Y");

  return lines
    .slice(headerIndex + 1)
    .map((line) => {
      const columns = splitCsvLine(line);
      const date = toIsoDate(columns[dateIndex] || "");
      const rawValue = columns[valueIndex] || "";
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter(
      (row) =>
        row.date && row.rawValue !== "" && row.rawValue !== "-" && Number.isFinite(row.value),
    );
}

function mergeSeries(rows) {
  const merged = new Map();

  for (const row of rows) {
    merged.set(row.date, row.value);
  }

  return Array.from(merged, ([date, value]) => ({ date, value })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function loadExisting() {
  if (!fs.existsSync(outputFile)) {
    return [];
  }

  return fs
    .readFileSync(outputFile, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, usdjpy, us2y, japan2y, spread] = splitCsvLine(line);
      return {
        date,
        USDJPY: usdjpy ? Number(usdjpy) : null,
        US_2Y_Yield: us2y ? Number(us2y) : null,
        Japan_2Y_Yield: japan2y ? Number(japan2y) : null,
        US_Japan_2Y_Spread: spread ? Number(spread) : null,
      };
    })
    .filter((row) => row.date);
}

function consolidate({ usdJpyRows, us2yRows, japan2yRows }) {
  const usdJpy = new Map(usdJpyRows.map((row) => [row.date, row.value]));
  const us2y = new Map(us2yRows.map((row) => [row.date, row.value]));
  const japan2y = new Map(japan2yRows.map((row) => [row.date, row.value]));
  const dates = Array.from(new Set([...usdJpy.keys(), ...us2y.keys(), ...japan2y.keys()])).sort();
  const rows = [];
  let lastUs2y = null;
  let lastJapan2y = null;

  for (const date of dates) {
    if (us2y.has(date)) {
      lastUs2y = us2y.get(date);
    }

    if (japan2y.has(date)) {
      lastJapan2y = japan2y.get(date);
    }

    rows.push({
      date,
      USDJPY: usdJpy.has(date) ? usdJpy.get(date) : null,
      US_2Y_Yield: lastUs2y,
      Japan_2Y_Yield: lastJapan2y,
      US_Japan_2Y_Spread:
        lastUs2y !== null && lastJapan2y !== null ? lastUs2y - lastJapan2y : null,
    });
  }

  return rows;
}

function validate(rows) {
  const dates = rows.map((row) => row.date);
  const duplicateDates = dates.length - new Set(dates).size;
  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);
  const validSpreadRows = rows.filter((row) => Number.isFinite(row.US_Japan_2Y_Spread));
  const validUsdJpyRows = rows.filter((row) => isValidUsdJpyValue(row.USDJPY));

  if (!sorted) {
    throw new Error("FX dataset dates are not sorted.");
  }

  if (duplicateDates > 0) {
    throw new Error("FX dataset contains duplicate dates.");
  }

  if (validSpreadRows.length === 0 || validUsdJpyRows.length === 0) {
    throw new Error("FX dataset is missing usable USDJPY or spread observations.");
  }

  return {
    duplicateDates,
    validSpreadRows,
    validUsdJpyRows,
  };
}

function fmt(value, digits = 4) {
  return Number.isFinite(value) ? value.toFixed(digits) : "";
}

function atomicWrite(rows) {
  const csv = `date,USDJPY,US_2Y_Yield,Japan_2Y_Yield,US_Japan_2Y_Spread\n${rows
    .map(
      (row) =>
        `${row.date},${fmt(row.USDJPY, 4)},${fmt(row.US_2Y_Yield, 4)},${fmt(
          row.Japan_2Y_Yield,
          4,
        )},${fmt(row.US_Japan_2Y_Spread, 4)}`,
    )
    .join("\n")}\n`;
  const tempFile = `${outputFile}.tmp`;
  fs.writeFileSync(tempFile, csv);
  validate(loadRowsFromFile(tempFile));
  fs.renameSync(tempFile, outputFile);
}

function loadRowsFromFile(file) {
  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, usdjpy, us2y, japan2y, spread] = splitCsvLine(line);
      return {
        date,
        USDJPY: usdjpy === "" ? null : Number(usdjpy),
        US_2Y_Yield: us2y === "" ? null : Number(us2y),
        Japan_2Y_Yield: japan2y === "" ? null : Number(japan2y),
        US_Japan_2Y_Spread: spread === "" ? null : Number(spread),
      };
    });
}

async function main() {
  const existingRows = loadExisting();
  let usdJpyRows = [];
  let yahooUsdJpyRows = [];
  let us2yRows = [];
  let japan2yRows = [];
  const warnings = [];

  let usdJpySourceSucceeded = false;
  let us2ySourceSucceeded = false;
  let japan2ySourceSucceeded = false;

  if (requestedSources.has("usdjpy")) {
    try {
      usdJpyRows = parseFred(await downloadWithRetry(sources.usdJpy), "DEXJPUS");
      usdJpySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: USDJPY download/parse failed. ${error.message}`);
    }

    try {
      yahooUsdJpyRows = parseYahooUsdJpy(
        await downloadWithRetry(sources.usdJpyYahoo, { "User-Agent": "Mozilla/5.0" }),
      );
      usdJpySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: Yahoo USDJPY gap-fill download/parse failed. ${error.message}`);
    }

  }

  if (requestedSources.has("us2y")) {
    try {
      us2yRows = parseFred(await downloadWithRetry(sources.us2y), "DGS2");
      us2ySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: US 2Y download/parse failed. ${error.message}`);
    }
  }

  if (requestedSources.has("japan2y")) {
    try {
      japan2yRows = mergeSeries([
        ...parseMofJapan2y(await downloadWithRetry(sources.japan2yHistorical)),
        ...parseMofJapan2y(await downloadWithRetry(sources.japan2yCurrent)),
      ]);
      japan2ySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: Japan 2Y download/parse failed. ${error.message}`);
    }
  }

  for (const warning of warnings) {
    console.warn(warning);
  }

  const existingUsdJpy = existingRows
    .filter((row) => isValidUsdJpyValue(row.USDJPY))
    .map((row) => ({ date: row.date, value: row.USDJPY }));
  const existingUs2y = existingRows
    .filter((row) => Number.isFinite(row.US_2Y_Yield))
    .map((row) => ({ date: row.date, value: row.US_2Y_Yield }));
  const existingJapan2y = existingRows
    .filter((row) => Number.isFinite(row.Japan_2Y_Yield))
    .map((row) => ({ date: row.date, value: row.Japan_2Y_Yield }));

  // Existing values survive download failures. Yahoo fills recent gaps, while FRED
  // is merged last so its official observations always take precedence by date.
  const combinedUsdJpy = mergeSeries([...existingUsdJpy, ...yahooUsdJpyRows, ...usdJpyRows]);
  const combinedUs2y = mergeSeries([...existingUs2y, ...us2yRows]);
  const combinedJapan2y = mergeSeries([...existingJapan2y, ...japan2yRows]);
  const finalRows = consolidate({
    usdJpyRows: combinedUsdJpy,
    us2yRows: combinedUs2y,
    japan2yRows: combinedJapan2y,
  });

  if (finalRows.length === 0) {
    throw new Error("No existing or newly downloaded FX data is available.");
  }

  const validation = validate(finalRows);
  atomicWrite(finalRows);

  const latestUsdJpy = [...finalRows].reverse().find((row) => Number.isFinite(row.USDJPY));
  const latestSpread = [...finalRows]
    .reverse()
    .find((row) => Number.isFinite(row.US_Japan_2Y_Spread));

  console.log("FX validation");
  console.log(`Earliest date: ${finalRows[0].date}`);
  console.log(`Latest date: ${finalRows.at(-1).date}`);
  console.log(`Valid USDJPY observations: ${validation.validUsdJpyRows.length}`);
  console.log(`Yahoo USDJPY gap-fill observations downloaded: ${yahooUsdJpyRows.length}`);
  console.log("USDJPY merge priority: existing < Yahoo gap fill < FRED official");
  console.log(`Valid spread observations: ${validation.validSpreadRows.length}`);
  console.log(`Duplicate dates: ${validation.duplicateDates}`);
  console.log(`Latest USDJPY: ${latestUsdJpy.date} ${latestUsdJpy.USDJPY.toFixed(4)}`);
  console.log(`Latest US 2Y: ${latestSpread.date} ${latestSpread.US_2Y_Yield.toFixed(4)}`);
  console.log(`Latest Japan 2Y: ${latestSpread.date} ${latestSpread.Japan_2Y_Yield.toFixed(4)}`);
  console.log(
    `Latest US-Japan 2Y Spread: ${latestSpread.date} ${latestSpread.US_Japan_2Y_Spread.toFixed(
      4,
    )}`,
  );

  const selectedSourceFailed =
    (requestedSources.has("usdjpy") && !usdJpySourceSucceeded) ||
    (requestedSources.has("us2y") && !us2ySourceSucceeded) ||
    (requestedSources.has("japan2y") && !japan2ySourceSucceeded);
  if (selectedSourceFailed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
