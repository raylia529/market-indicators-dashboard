import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const downloadTimeoutMs = 20_000;
const retryBackoffMs = [];
const sources = {
  nikkei225:
    "https://indexes.nikkei.co.jp/nkave/historical/nikkei_stock_average_daily_en.csv",
  usdTwdCbc: "https://cpx.cbc.gov.tw/api/OpenData/FTDOpenData_Day",
};
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

function parseNikkei225(text) {
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [rawDate, rawClose] = splitCsvLine(line);
      return {
        date: /^\d{4}\/\d{2}\/\d{2}$/.test(rawDate) ? rawDate.replaceAll("/", "-") : "",
        value: Number(rawClose),
      };
    })
    .filter(
      (row) =>
        /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
        Number.isFinite(row.value) &&
        row.value > 0,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

function parseTaiex(text) {
  const payload = JSON.parse(text);
  const entries = Array.isArray(payload)
    ? payload.map((entry) => [
        entry?.Date,
        entry?.OpeningIndex,
        entry?.HighestIndex,
        entry?.LowestIndex,
        entry?.ClosingIndex,
      ])
    : payload?.stat === "OK" && Array.isArray(payload.data)
      ? payload.data
      : null;

  if (!entries) {
    throw new Error("Unexpected TWSE TAIEX response.");
  }

  return entries
    .map((entry) => {
      const rawDate = String(entry?.[0] || "").trim();
      const compactDate = rawDate.replaceAll("/", "");
      const isGregorianDate = /^\d{8}$/.test(compactDate);
      const rocYear = Number(compactDate.slice(0, 3));
      return {
        date: isGregorianDate
          ? `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`
          : /^\d{7}$/.test(compactDate) && Number.isFinite(rocYear)
            ? `${rocYear + 1911}-${compactDate.slice(3, 5)}-${compactDate.slice(5, 7)}`
            : "",
        value: Number(String(entry?.[4] || "").replaceAll(",", "")),
      };
    })
    .filter(
      (row) =>
        /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
        Number.isFinite(row.value) &&
        row.value > 0,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

function taiexOfficialUrl() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const date = `${dateParts.year}${dateParts.month}${dateParts.day}`;
  return `https://www.twse.com.tw/rwd/en/TAIEX/MI_5MINS_HIST?date=${date}&response=json`;
}

function parseCbcUsdTwd(text) {
  const payload = JSON.parse(text);
  if (!Array.isArray(payload)) {
    throw new Error("Unexpected Taiwan central bank USD/TWD response.");
  }

  return payload
    .map((entry) => {
      const compactDate = String(entry?.["日期"] || "").trim();
      return {
        date:
          compactDate.length === 8
            ? `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`
            : "",
        value: Number(entry?.NTD_USD),
      };
    })
    .filter(
      (row) =>
        /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
        Number.isFinite(row.value) &&
        row.value >= 10 &&
        row.value <= 100,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function updateOfficialSeries({ url, parse, label, file, source, decimals = 2 }) {
  const existingRows = loadSingleCsv(file);
  const downloadedRows = parse(await download(url, { Accept: "text/csv,application/json" }));
  const rows = mergeRows(existingRows, downloadedRows);
  validateRows(rows, label, existingRows);
  atomicWriteCsv(file, rows, label, decimals);
  console.log(`${label} validation`);
  console.log(`Source: ${source}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Official observations downloaded: ${downloadedRows.length}`);
  console.log("Merge priority: existing archive < official observations");
}

async function updateUsdTwd() {
  const label = "USD/TWD";
  const existingRows = loadSingleCsv(files.usdTwd).filter(
    (row) => row.value >= 10 && row.value <= 100,
  );
  const removedInvalidRows = loadSingleCsv(files.usdTwd).length - existingRows.length;
  const officialRows = parseCbcUsdTwd(await download(sources.usdTwdCbc));

  const rows = mergeRows(existingRows, officialRows);
  validateRows(rows, label, existingRows);
  atomicWriteCsv(files.usdTwd, rows, label, 4);
  console.log(`${label} validation`);
  console.log("Source: Central Bank of the Republic of China (Taiwan) daily interbank close");
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Invalid existing observations removed: ${removedInvalidRows}`);
  console.log(`Official observations downloaded: ${officialRows.length}`);
  console.log("Merge priority: existing archive < official central bank observations");
  console.log("Request mode: official endpoint exposes one complete daily artifact");
}

async function main() {
  const updateDefinitions = [
    {
      key: "nikkei",
      update: () =>
        updateOfficialSeries({
          url: sources.nikkei225,
          parse: parseNikkei225,
          label: "Nikkei 225",
          file: files.nikkei225,
          source: "Nikkei Indexes official daily CSV",
        }),
    },
    {
      key: "taiex",
      update: () =>
        updateOfficialSeries({
          url: taiexOfficialUrl(),
          parse: parseTaiex,
          label: "TAIEX",
          file: files.taiex,
          source: "Taiwan Stock Exchange official historical report",
        }),
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
