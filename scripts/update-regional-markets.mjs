import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { execFile } from "node:child_process";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const recentOverlapDays = 90;
const downloadTimeoutMs = 30_000;
const fredRetryBackoffMs = [15_000, 30_000, 60_000, 180_000, 300_000];
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

function download(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      { headers: { "User-Agent": userAgent, ...headers } },
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          download(response.headers.location, headers).then(resolve, reject);
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

    request.setTimeout(downloadTimeoutMs, () => {
      request.destroy(new Error(`Download timed out after ${downloadTimeoutMs / 1000}s: ${url}`));
    });
    request.on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function downloadWithCurl(url) {
  return new Promise((resolve, reject) => {
    execFile(
      "curl",
      ["-L", "--fail", "--silent", "--show-error", "--max-time", "30", url],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr.trim() || error.message));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

async function downloadWithRetry(url, headers = {}, backoffMs = fredRetryBackoffMs) {
  let lastError;
  for (let attempt = 0; attempt <= backoffMs.length; attempt += 1) {
    try {
      return await download(url, headers);
    } catch (error) {
      try {
        console.warn(`HTTPS download failed (${error.message}); trying curl fallback.`);
        return await downloadWithCurl(url);
      } catch (curlError) {
        lastError = new Error(`${error.message}; curl fallback: ${curlError.message}`);
      }
      if (attempt < backoffMs.length) {
        const delayMs = backoffMs[attempt];
        console.warn(
          `Download failed (${lastError.message}); retry ${attempt + 1}/${backoffMs.length} in ${delayMs / 1000}s.`,
        );
        await wait(delayMs);
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
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return timestamps
    .map((timestamp, index) => ({
      date: formatter.format(new Date(timestamp * 1000)),
      value: Number(closes[index]),
    }))
    .filter((row) => row.date && Number.isFinite(row.value) && row.value !== 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function parseFredCsv(text, seriesId) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim());
  const dateIndex = headers.indexOf("observation_date");
  const valueIndex = headers.indexOf(seriesId);

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Unexpected ${seriesId} header: ${headers.join(",")}`);
  }

  return lines
    .map((line) => {
      const columns = line.split(",");
      const rawValue = columns[valueIndex]?.trim();
      return {
        date: columns[dateIndex]?.trim(),
        rawValue,
        value: Number(rawValue),
      };
    })
    .filter(
      (row) =>
        row.date &&
        row.rawValue !== "" &&
        row.rawValue !== "." &&
        Number.isFinite(row.value),
    )
    .map(({ date, value }) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function updateYahooSeries({ symbol, label, file, decimals = 2 }) {
  const existingRows = loadSingleCsv(file);
  const latestDate = existingRows.at(-1)?.date;
  const startDate = latestDate ? new Date(`${latestDate}T00:00:00Z`) : null;
  if (startDate) {
    startDate.setUTCDate(startDate.getUTCDate() - recentOverlapDays);
  }
  const period1 = startDate ? Math.floor(startDate.getTime() / 1000) : 0;
  const period2 = Math.floor(Date.now() / 1000) + 86400;
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
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
  console.log(`Request mode: ${startDate ? `incremental from ${startDate.toISOString().slice(0, 10)}` : "full bootstrap"}`);
}

async function updateUsdTwd() {
  const label = "USD/TWD";
  const existingRows = loadSingleCsv(files.usdTwd).filter(
    (row) => row.value >= 10 && row.value <= 100,
  );
  const removedInvalidRows = loadSingleCsv(files.usdTwd).length - existingRows.length;
  const latestDate = existingRows.at(-1)?.date;
  const startDate = latestDate && removedInvalidRows === 0
    ? new Date(`${latestDate}T00:00:00Z`)
    : null;
  if (startDate) {
    startDate.setUTCDate(startDate.getUTCDate() - recentOverlapDays);
  }

  const fredUrl = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXTAUS${
    startDate ? `&cosd=${startDate.toISOString().slice(0, 10)}` : ""
  }`;
  const fredRows = parseFredCsv(await downloadWithRetry(fredUrl), "DEXTAUS").filter(
    (row) => row.value >= 10 && row.value <= 100,
  );
  const latestFredDate = fredRows.at(-1)?.date;
  if (!latestFredDate) {
    throw new Error("FRED DEXTAUS returned no valid observations.");
  }

  const yahooStart = new Date(`${latestFredDate}T00:00:00Z`);
  yahooStart.setUTCDate(yahooStart.getUTCDate() - 7);
  const period1 = Math.floor(yahooStart.getTime() / 1000);
  const period2 = Math.floor(Date.now() / 1000) + 86400;
  const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    "TWD=X",
  )}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
  let yahooRows = [];
  try {
    yahooRows = parseYahooChart(
      await download(yahooUrl, { "User-Agent": "Mozilla/5.0" }),
      label,
    ).filter(
      (row) => row.date > latestFredDate && row.value >= 10 && row.value <= 100,
    );
  } catch (error) {
    console.warn(`WARNING: Yahoo USD/TWD recent gap fill unavailable: ${error.message}`);
  }

  const rows = mergeRows(mergeRows(existingRows, fredRows), yahooRows);
  validateRows(rows, label, existingRows);
  atomicWriteCsv(files.usdTwd, rows, label, 4);
  console.log(`${label} validation`);
  console.log("Source: FRED DEXTAUS full history, with Yahoo Finance TWD=X recent gap fill");
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Invalid existing observations removed: ${removedInvalidRows}`);
  console.log(`FRED observations downloaded: ${fredRows.length}`);
  console.log(`Yahoo gap-fill observations: ${yahooRows.length}`);
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
