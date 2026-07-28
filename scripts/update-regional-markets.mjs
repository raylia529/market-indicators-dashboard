import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const downloadTimeoutMs = 20_000;
const retryBackoffMs = [];
const files = {
  nikkei225: path.join("data", "nikkei-225.csv"),
  taiex: path.join("data", "taiex.csv"),
  usdTwd: path.join("data", "usdtwd.csv"),
};
const onlyArg = process.argv.find((argument) => argument.startsWith("--only="));
const requestedUpdates = onlyArg
  ? new Set(
      onlyArg
        .slice("--only=".length)
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    )
  : null;

function download(url, headers = {}, timeoutMs = downloadTimeoutMs) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      { headers: { "User-Agent": userAgent, ...headers } },
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          download(response.headers.location, headers, timeoutMs).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Download failed: ${url} (${response.statusCode})`));
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Download timed out after ${timeoutMs / 1000}s: ${url}`));
    });
    request.on("error", reject);
  });
}

async function downloadWithRetry(
  url,
  headers = {},
  backoffMs = retryBackoffMs,
  timeoutMs = downloadTimeoutMs,
) {
  let lastError;
  for (let attempt = 0; attempt <= backoffMs.length; attempt += 1) {
    try {
      return await download(url, headers, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt < backoffMs.length) {
        const delayMs = backoffMs[attempt];
        console.warn(
          `Download failed (${lastError.message}); retry ${attempt + 1}/${backoffMs.length} in ${delayMs / 1000}s.`,
        );
      }
    }
  }
  throw lastError;
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
      const [date, value] = splitCsvLine(line);
      return { date, value: Number(value) };
    })
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function mergeRows(existingRows, nextRows) {
  const byDate = new Map(existingRows.map((row) => [row.date, row.value]));
  for (const row of nextRows) {
    byDate.set(row.date, row.value);
  }
  return Array.from(byDate, ([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
}

function validateRows(rows, label, existingRows = [], { allowEmpty = false } = {}) {
  if (!allowEmpty && rows.length === 0) {
    throw new Error(`${label} has no valid observations.`);
  }
  if (rows.some((row) => !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(row.value))) {
    throw new Error(`${label} contains invalid dates or values.`);
  }
  if (!rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date)) {
    throw new Error(`${label} dates are not sorted.`);
  }
  if (rows.length - new Set(rows.map((row) => row.date)).size > 0) {
    throw new Error(`${label} contains duplicate dates.`);
  }
  if (existingRows.length > 0 && rows.length < existingRows.length * 0.98) {
    throw new Error(`${label} update would shorten existing history.`);
  }
}

function atomicWriteCsv(file, rows, label, decimals = 2, options = {}) {
  validateRows(rows, label, [], options);
  const output = `date,value\n${rows.map((row) => `${row.date},${row.value.toFixed(decimals)}`).join("\n")}\n`;
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, output);
  validateRows(loadSingleCsv(tempFile), label, [], options);
  fs.renameSync(tempFile, file);
}

function parseYahooChart(text, label) {
  const payload = JSON.parse(text);
  const result = payload?.chart?.result?.[0];
  const error = payload?.chart?.error;

  if (error) {
    throw new Error(`${label} Yahoo error: ${error.description || error.code}`);
  }

  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;

  if (!Array.isArray(timestamps) || !Array.isArray(closes)) {
    throw new Error(`Unexpected Yahoo response for ${label}.`);
  }

  const timeZone = result.meta?.exchangeTimezoneName || "UTC";
  const regularMarketTime = result.meta?.regularMarketTime;
  const regularMarketEnd = result.meta?.currentTradingPeriod?.regular?.end;
  const marketIsOpen = Number.isFinite(regularMarketEnd) && Date.now() / 1000 < regularMarketEnd;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return timestamps
    .map((timestamp, index) => ({
      date: formatter.format(new Date(timestamp * 1000)),
      timestamp,
      value: Number(closes[index]),
    }))
    .filter(
      (row) =>
        row.date &&
        Number.isFinite(row.value) &&
        row.value !== 0 &&
        !(marketIsOpen && row.timestamp === regularMarketTime),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function updateYahooSeries({ symbol, label, file, decimals = 2 }) {
  const existingRows = loadSingleCsv(file);
  const latestDate = existingRows.at(-1)?.date;
  const windowQuery = latestDate ? "range=5d" : "period1=0";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?${windowQuery}&interval=1d&events=history`;
  const downloadedRows = parseYahooChart(await download(url, { "User-Agent": "Mozilla/5.0" }), label);
  const rows = mergeRows(existingRows, downloadedRows);
  validateRows(rows, label, existingRows);
  atomicWriteCsv(file, rows, label, decimals);
  console.log(`${label} validation`);
  console.log(`Source: Yahoo Finance ${symbol}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Downloaded observations: ${downloadedRows.length}`);
  console.log(`Request mode: ${latestDate ? "latest 5 days" : "full bootstrap"}`);
}

async function updateUsdTwd() {
  const label = "USD/TWD";
  const existingRows = loadSingleCsv(files.usdTwd).filter(
    (row) => row.value >= 10 && row.value <= 100,
  );
  const removedInvalidRows = loadSingleCsv(files.usdTwd).length - existingRows.length;
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    "TWD=X",
  )}?range=5d&interval=1d&events=history`;
  const yahooRows = parseYahooChart(
    await download(yahooUrl, { "User-Agent": "Mozilla/5.0" }),
    label,
  ).filter((row) => row.value >= 10 && row.value <= 100);

  const rows = mergeRows(existingRows, yahooRows);
  validateRows(rows, label, existingRows);
  atomicWriteCsv(files.usdTwd, rows, label, 4);
  console.log(`${label} validation`);
  console.log("Source: Yahoo Finance TWD=X recent daily closes");
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Invalid existing observations removed: ${removedInvalidRows}`);
  console.log(`Yahoo observations downloaded: ${yahooRows.length}`);
  console.log("Request mode: latest 5 days");
}

async function main() {
  const updateDefinitions = [
    {
      key: "nikkei",
      update: () => updateYahooSeries({ symbol: "^N225", label: "Nikkei 225", file: files.nikkei225 }),
    },
    {
      key: "taiex",
      update: () => updateYahooSeries({ symbol: "^TWII", label: "TAIEX", file: files.taiex }),
    },
    {
      key: "usdtwd",
      update: updateUsdTwd,
    },
  ];
  const selectedUpdates = requestedUpdates
    ? updateDefinitions.filter((definition) => requestedUpdates.has(definition.key))
    : updateDefinitions;

  if (selectedUpdates.length === 0) {
    throw new Error(`No matching regional update requested: ${Array.from(requestedUpdates || []).join(",")}`);
  }

  const results = await Promise.allSettled(selectedUpdates.map((definition) => definition.update()));
  let failed = false;

  for (const result of results) {
    if (result.status === "rejected") {
      console.warn(`WARNING: ${result.reason.message}`);
      failed = true;
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
