import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const downloadTimeoutMs = 20_000;
const retryBackoffMs = [];

const files = {
  move: path.join("data", "move.csv"),
  skew: path.join("data", "skew.csv"),
  tsmcRevenueYoy: path.join("data", "tsmc-revenue-yoy.csv"),
  ismManufacturingPmi: path.join("data", "ism-manufacturing-pmi.csv"),
};

const tsmcArchiveStartRocYear = 102;
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
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
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

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function downloadWithRetry(url, headers = {}, backoffMs = retryBackoffMs) {
  let lastError;
  for (let attempt = 0; attempt <= backoffMs.length; attempt += 1) {
    try {
      return await download(url, headers);
    } catch (error) {
      lastError = error;
      if (attempt < backoffMs.length) {
        await wait(backoffMs[attempt]);
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

function toIsoDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

function parseUsDate(dateText) {
  const [month, day, year] = dateText.split("/").map(Number);
  if (![month, day, year].every(Number.isFinite)) {
    return "";
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function validateRows(rows, label, { allowEmpty = false } = {}) {
  const duplicateDates = rows.length - new Set(rows.map((row) => row.date)).size;
  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);

  if (!allowEmpty && rows.length === 0) {
    throw new Error(`${label} has no valid observations.`);
  }

  if (!sorted) {
    throw new Error(`${label} dates are not sorted.`);
  }

  if (duplicateDates > 0) {
    throw new Error(`${label} contains duplicate dates.`);
  }

  if (rows.some((row) => !row.date || !Number.isFinite(row.value))) {
    throw new Error(`${label} contains invalid values.`);
  }

  return { duplicateDates };
}

function atomicWriteCsv(file, rows, label, decimals = 2, options = {}) {
  validateRows(rows, label, options);
  const output = `date,value\n${rows.map((row) => `${row.date},${row.value.toFixed(decimals)}`).join("\n")}\n`;
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, output);
  validateRows(loadSingleCsv(tempFile), label, options);
  fs.renameSync(tempFile, file);
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
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function parseYahooChart(text, label, { adjusted = false } = {}) {
  const payload = JSON.parse(text);
  const result = payload?.chart?.result?.[0];
  const error = payload?.chart?.error;

  if (error) {
    throw new Error(`${label} Yahoo error: ${error.description || error.code}`);
  }

  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;
  const adjustedCloses = result?.indicators?.adjclose?.[0]?.adjclose;

  if (!Array.isArray(timestamps) || !Array.isArray(closes)) {
    throw new Error(`Unexpected Yahoo response for ${label}.`);
  }

  if (adjusted && !Array.isArray(adjustedCloses)) {
    throw new Error(`Yahoo adjusted-close data is unavailable for ${label}.`);
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
      value: Number(adjusted ? adjustedCloses[index] : closes[index]),
    }))
    .filter((row) => row.date && Number.isFinite(row.value) && row.value !== 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function downloadYahooChart(symbol, label, { period1 = 0, range = null } = {}) {
  const period2 = Math.floor(Date.now() / 1000) + 86400;
  const windowQuery = range
    ? `range=${encodeURIComponent(range)}`
    : `period1=${period1}&period2=${period2}`;
  const chartPath = `/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?${windowQuery}&interval=1d&events=history`;
  const headers = {
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36",
  };
  return downloadWithRetry(`https://query2.finance.yahoo.com${chartPath}`, headers);
}

async function updateYahooIndex({ symbol, label, file, decimals = 2 }) {
  const existingRows = loadSingleCsv(file);
  const latestDate = existingRows.at(-1)?.date;
  const downloadedRows = parseYahooChart(
    await downloadYahooChart(symbol, label, latestDate ? { range: "5d" } : { period1: 0 }),
    label,
  );
  const rows = mergeRowsByDate(existingRows, downloadedRows);
  atomicWriteCsv(file, rows, label, decimals);
  console.log(`${label} validation`);
  console.log(`Source: Yahoo Finance ${symbol}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Downloaded observations: ${downloadedRows.length}`);
  console.log(`Request mode: ${latestDate ? "latest 5 days" : "full bootstrap"}`);
}

const prNewswireUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36";
const ismPublisherUrl = "https://www.prnewswire.com/news/institute-for-supply-management/";

function decodeHtmlText(text) {
  return String(text || "")
    .replace(/<br\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&reg;|&#174;/gi, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function findLatestIsmManufacturingReleaseUrl(publisherHtml) {
  const links = Array.from(
    publisherHtml.matchAll(/href=["']([^"']+\.html)["']/gi),
    (match) => match[1],
  );
  const path = links.find((link) =>
    /\/news-releases\/manufacturing-pmi-at-[^"']+-ism-manufacturing-pmi-report-[^"']+\.html$/i.test(
      link,
    ),
  );

  if (!path) {
    throw new Error("Could not find the latest ISM Manufacturing PMI press release.");
  }

  return new URL(path, "https://www.prnewswire.com").toString();
}

function parseIsmRollingHistory(releaseHtml) {
  const sectionStart = releaseHtml.search(/THE LAST 12 MONTHS/i);
  const sectionEnd = releaseHtml.search(/Average for 12 months/i);

  if (sectionStart < 0 || sectionEnd <= sectionStart) {
    throw new Error("The ISM release does not contain the expected rolling 12-month table.");
  }

  const tokens = Array.from(
    releaseHtml.slice(sectionStart, sectionEnd).matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/gi),
    (match) => decodeHtmlText(match[1]),
  ).filter(Boolean);
  const monthIndexes = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const rows = [];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const match = tokens[index].match(/^([A-Z][a-z]{2})\s+(\d{4})$/);
    const value = Number(tokens[index + 1]);

    if (!match || !Number.isFinite(value) || value < 0 || value > 100) {
      continue;
    }

    const monthIndex = monthIndexes[match[1]];
    const year = Number(match[2]);
    if (!Number.isInteger(monthIndex) || !Number.isInteger(year)) {
      continue;
    }

    rows.push({
      date: toIsoDate(new Date(Date.UTC(year, monthIndex + 1, 0))),
      value,
    });
  }

  const uniqueRows = mergeRowsByDate([], rows);
  if (uniqueRows.length !== 12) {
    throw new Error(`Expected 12 ISM PMI observations, received ${uniqueRows.length}.`);
  }

  return uniqueRows;
}

async function updateIsmManufacturingPmi() {
  const headers = { "User-Agent": prNewswireUserAgent };
  const publisherHtml = await downloadWithRetry(ismPublisherUrl, headers);
  const releaseUrl = findLatestIsmManufacturingReleaseUrl(publisherHtml);
  const downloadedRows = parseIsmRollingHistory(
    await downloadWithRetry(releaseUrl, headers),
  );
  const existingRows = loadSingleCsv(files.ismManufacturingPmi);
  const rows = mergeRowsByDate(existingRows, downloadedRows);

  if (existingRows.length > 0 && rows.length < existingRows.length) {
    throw new Error("Refusing to shorten existing ISM Manufacturing PMI history.");
  }

  atomicWriteCsv(files.ismManufacturingPmi, rows, "ISM Manufacturing PMI", 1);
  console.log("ISM Manufacturing PMI validation");
  console.log("Source: Institute for Supply Management official release via PR Newswire");
  console.log(`Release URL: ${releaseUrl}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Downloaded observations: ${downloadedRows.length}`);
}

async function updateSkew() {
  const url = "https://cdn.cboe.com/api/global/us_indices/daily_prices/SKEW_History.csv";
  const text = await download(url);
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(headerLine);
  const dateIndex = headers.indexOf("DATE");
  const valueIndex = headers.indexOf("SKEW");

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Unexpected Cboe SKEW header: ${headers.join(",")}`);
  }

  const rows = lines
    .map((line) => {
      const columns = splitCsvLine(line);
      return {
        date: parseUsDate(columns[dateIndex] || ""),
        value: Number(columns[valueIndex]),
      };
    })
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));

  atomicWriteCsv(files.skew, rows, "SKEW Index", 2);
  console.log("SKEW Index validation");
  console.log("Source: Cboe SKEW_History.csv");
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
}

function monthEndDate(year, month) {
  return toIsoDate(new Date(Date.UTC(year, month, 0)));
}

function parseNumber(text) {
  return Number(String(text || "").replace(/[,％%&nbsp;\s]/g, ""));
}

function parseMopsTsmcRevenue(text, rocYear, month) {
  if (!text.includes("台積電") || !text.includes("營業收入淨額")) {
    return null;
  }

  const labels = Array.from(
    text.matchAll(/<TH[^>]*class=['"]tblHead['"][^>]*>([^<]+)<\/TH><TD[^>]*>(.*?)<\/TD>/gi),
  ).map((match) => ({
    label: match[1].replace(/<[^>]+>/g, "").trim(),
    value: parseNumber(match[2].replace(/<[^>]+>/g, "")),
  }));

  const currentRevenue = labels.find((row) => row.label === "本月")?.value;
  const yoy = labels.find((row) => row.label === "增減百分比")?.value;

  if (!Number.isFinite(currentRevenue) || !Number.isFinite(yoy)) {
    return null;
  }

  return {
    date: monthEndDate(rocYear + 1911, month),
    revenue: currentRevenue,
    value: yoy,
  };
}

async function fetchTsmcRevenueMonth(rocYear, month) {
  const url = `https://mopsov.twse.com.tw/mops/web/ajax_t05st10_ifrs?encodeURIComponent=1&step=1&firstin=1&off=1&keyword4=&code1=&TYPEK2=&checkbtn=&queryName=co_id&inpuType=co_id&TYPEK=all&co_id=2330&year=${rocYear}&month=${String(
    month,
  ).padStart(2, "0")}`;
  return parseMopsTsmcRevenue(
    await downloadWithRetry(url, { Referer: "https://mops.twse.com.tw/mops/web/t05st10_ifrs" }),
    rocYear,
    month,
  );
}

function mergeRowsByDate(existingRows, nextRows) {
  const byDate = new Map(existingRows.map((row) => [row.date, row]));
  for (const row of nextRows) {
    byDate.set(row.date, row);
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function writeTsmcRevenueCsv(rows) {
  validateRows(rows, "TSMC Revenue YoY");
  const output = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(2)}`)
    .join("\n")}\n`;
  const tempFile = `${files.tsmcRevenueYoy}.tmp`;
  fs.writeFileSync(tempFile, output);
  validateRows(loadSingleCsv(tempFile), "TSMC Revenue YoY");
  fs.renameSync(tempFile, files.tsmcRevenueYoy);
}

async function updateTsmcRevenueYoy() {
  const existingRows = loadSingleCsv(files.tsmcRevenueYoy);
  const now = new Date();
  const currentRocYear = now.getUTCFullYear() - 1911;
  const currentMonth = now.getUTCMonth() + 1;
  const bootstrap = existingRows.length < 120;
  const startYear = bootstrap
    ? tsmcArchiveStartRocYear
    : Number(existingRows.at(-1).date.slice(0, 4)) - 1911;
  const rows = [];
  let failedMonths = 0;

  for (let rocYear = startYear; rocYear <= currentRocYear; rocYear += 1) {
    for (let month = 1; month <= 12; month += 1) {
      if (rocYear === currentRocYear && month > currentMonth) {
        continue;
      }

      if (!bootstrap) {
        const date = monthEndDate(rocYear + 1911, month);
        const latestExistingDate = existingRows.at(-1)?.date;
        if (latestExistingDate && date < latestExistingDate.slice(0, 8) + "01") {
          continue;
        }
      }

      try {
        const row = await fetchTsmcRevenueMonth(rocYear, month);
        if (row) {
          rows.push(row);
        }
      } catch (error) {
        failedMonths += 1;
        console.warn(
          `WARNING: TSMC Revenue YoY ${rocYear}/${String(month).padStart(2, "0")} failed. ${error.message}`,
        );
        await wait(1500);
      }

      if (bootstrap) {
        await wait(350);
      }
    }
  }

  const mergedRows = mergeRowsByDate(existingRows, rows);
  if (bootstrap && mergedRows.length < 100) {
    throw new Error(`TSMC Revenue YoY bootstrap only produced ${mergedRows.length} observations.`);
  }
  if (mergedRows.length < existingRows.length) {
    throw new Error("TSMC Revenue YoY update would shorten existing history.");
  }

  writeTsmcRevenueCsv(mergedRows);
  console.log("TSMC Revenue YoY validation");
  console.log("Source: MOPSOV monthly operating revenue, TSMC 2330");
  console.log(`Historical bootstrap: ${bootstrap ? "yes" : "no"}`);
  console.log(`Earliest date: ${mergedRows[0].date}`);
  console.log(`Latest date: ${mergedRows.at(-1).date}`);
  console.log(`Valid observations: ${mergedRows.length}`);
  console.log(`Failed months skipped: ${failedMonths}`);
}

async function runStep(label, fn) {
  try {
    await fn();
    return true;
  } catch (error) {
    console.warn(`WARNING: ${label} failed. ${error.message}`);
    return false;
  }
}

async function main() {
  const steps = [
    {
      key: "move",
      label: "MOVE Index",
      update: () => updateYahooIndex({ symbol: "^MOVE", label: "MOVE Index", file: files.move }),
    },
    { key: "skew", label: "CBOE SKEW Index", update: updateSkew },
    { key: "tsmc", label: "TSMC Revenue YoY", update: updateTsmcRevenueYoy },
    {
      key: "ism-pmi",
      label: "ISM Manufacturing PMI",
      update: updateIsmManufacturingPmi,
    },
  ];
  const selectedSteps = requestedUpdates
    ? steps.filter((step) => requestedUpdates.has(step.key))
    : steps;

  if (selectedSteps.length === 0) {
    throw new Error(`No matching extra indicator update requested: ${Array.from(requestedUpdates || []).join(",")}`);
  }

  let failed = false;
  for (const step of selectedSteps) {
    const succeeded = await runStep(step.label, step.update);
    failed ||= !succeeded;
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
