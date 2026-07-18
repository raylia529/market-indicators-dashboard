import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const oneDayMs = 86400000;

const files = {
  move: path.join("data", "move.csv"),
  skew: path.join("data", "skew.csv"),
  sox: path.join("data", "sox.csv"),
  adLine: path.join("data", "advance-decline-line.csv"),
  above200: path.join("data", "sp500-above-200dma.csv"),
  tsmcRevenueYoy: path.join("data", "tsmc-revenue-yoy.csv"),
  aiCapex: path.join("data", "ai-capex.csv"),
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

function download(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": userAgent, ...headers } }, (response) => {
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

function shouldSkipRecent(file) {
  const latest = loadSingleCsv(file).at(-1)?.date;
  if (!latest) {
    return false;
  }

  return Date.now() - Date.parse(`${latest}T00:00:00Z`) < oneDayMs * 1.5;
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

async function updateYahooIndex({ symbol, label, file, decimals = 2 }) {
  const period2 = Math.floor(Date.now() / 1000) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?period1=0&period2=${period2}&interval=1d&events=history`;
  const rows = parseYahooChart(await download(url), label);
  atomicWriteCsv(file, rows, label, decimals);
  console.log(`${label} validation`);
  console.log(`Source: Yahoo Finance ${symbol}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
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
    await downloadWithRetry(url, { Referer: "https://mops.twse.com.tw/mops/web/t05st10_ifrs" }, 4),
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

function extractQuarterlyFactRows(fact) {
  const periodFacts = new Map();
  for (const item of fact.units.USD || []) {
    const value = Math.abs(Number(item.val));
    if (
      !item.start ||
      !item.end ||
      !Number.isFinite(value) ||
      !["10-Q", "10-K"].includes(item.form)
    ) {
      continue;
    }

    const key = `${item.start}|${item.end}`;
    const existing = periodFacts.get(key);
    if (!existing || String(item.filed || "") > String(existing.filed || "")) {
      periodFacts.set(key, { ...item, value: value / 1000000 });
    }
  }

  const facts = Array.from(periodFacts.values());
  const quarterRows = new Map();
  const durationDays = (item) =>
    Math.round((Date.parse(`${item.end}T00:00:00Z`) - Date.parse(`${item.start}T00:00:00Z`)) / oneDayMs) + 1;

  // Prefer reported single-quarter facts whenever the filing provides them.
  for (const item of facts) {
    const days = durationDays(item);
    if (days >= 65 && days <= 115) {
      const existing = quarterRows.get(item.end);
      if (!existing || String(item.filed || "") > String(existing.filed || "")) {
        quarterRows.set(item.end, { value: item.value, filed: item.filed });
      }
    }
  }

  // Alphabet and Meta commonly report Q2/Q3 CapEx as fiscal YTD. Subtract
  // consecutive cumulative facts from the same filing period to recover the
  // actual quarter; this is arithmetic on reported values, not an estimate.
  const cumulativeByStart = new Map();
  for (const item of facts) {
    const group = cumulativeByStart.get(item.start) || [];
    group.push(item);
    cumulativeByStart.set(item.start, group);
  }

  for (const group of cumulativeByStart.values()) {
    group.sort((a, b) => a.end.localeCompare(b.end));
    if (group.length < 2 || durationDays(group[0]) < 65 || durationDays(group[0]) > 115) {
      continue;
    }

    let previous = 0;
    let previousEnd = null;
    for (const item of group) {
      const days = durationDays(item);
      const intervalDays = previousEnd
        ? Math.round((Date.parse(`${item.end}T00:00:00Z`) - Date.parse(`${previousEnd}T00:00:00Z`)) / oneDayMs)
        : days;
      const value = item.value - previous;

      if (days <= 380 && intervalDays >= 65 && intervalDays <= 115 && value >= 0 && !quarterRows.has(item.end)) {
        quarterRows.set(item.end, { value, filed: item.filed });
      }
      previous = item.value;
      previousEnd = item.end;
    }
  }

  return Array.from(quarterRows, ([date, item]) => ({ date, value: item.value }))
    .filter((row) => Number.isFinite(row.value) && row.value >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function updateAiCapex() {
  const companies = [
    { name: "Microsoft", cik: "0000789019", tag: "PaymentsToAcquirePropertyPlantAndEquipment" },
    { name: "Amazon", cik: "0001018724", tag: "PaymentsToAcquireProductiveAssets" },
    { name: "Alphabet", cik: "0001652044", tag: "PaymentsToAcquirePropertyPlantAndEquipment" },
    { name: "Meta", cik: "0001326801", tag: "PaymentsToAcquirePropertyPlantAndEquipment" },
  ];
  const totals = new Map();
  const companyCounts = new Map();

  for (const company of companies) {
    const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${company.cik}.json`;
    const facts = JSON.parse(await download(url));
    const usGaap = facts?.facts?.["us-gaap"] || {};
    const fact = usGaap[company.tag];

    if (!fact) {
      throw new Error(`Could not find CapEx tag for ${company.name}.`);
    }

    for (const row of extractQuarterlyFactRows(fact)) {
      totals.set(row.date, (totals.get(row.date) || 0) + row.value);
      companyCounts.set(row.date, (companyCounts.get(row.date) || 0) + 1);
    }
  }

  const rows = Array.from(totals, ([date, value]) => ({ date, value }))
    .filter((row) => companyCounts.get(row.date) === companies.length)
    .sort((a, b) => a.date.localeCompare(b.date));
  const recentQuarterDates = rows.filter((row) => row.date >= "2023-01-01").map((row) => row.date);
  for (let index = 1; index < recentQuarterDates.length; index += 1) {
    const gapDays = Math.round(
      (Date.parse(`${recentQuarterDates[index]}T00:00:00Z`) -
        Date.parse(`${recentQuarterDates[index - 1]}T00:00:00Z`)) /
        oneDayMs,
    );
    if (gapDays > 115) {
      throw new Error(`AI CapEx has a missing reported quarter after ${recentQuarterDates[index - 1]}.`);
    }
  }
  const valuesByDate = new Map(rows.map((row) => [row.date, row.value]));
  const yoyRows = rows
    .map((row) => {
      const priorYearDate = `${Number(row.date.slice(0, 4)) - 1}${row.date.slice(4)}`;
      const priorYearValue = valuesByDate.get(priorYearDate);

      if (!Number.isFinite(priorYearValue) || priorYearValue === 0) {
        return null;
      }

      return {
        date: row.date,
        value: ((row.value / priorYearValue) - 1) * 100,
      };
    })
    .filter(Boolean);

  atomicWriteCsv(files.aiCapex, yoyRows, "AI CapEx Proxy YoY", 1);
  console.log("AI CapEx Proxy YoY validation");
  console.log("Source: SEC companyfacts, combined reported MSFT/AMZN/GOOGL/META quarterly CapEx");
  console.log("Method: single-quarter facts, or differences of consecutive reported fiscal YTD facts; no estimates");
  console.log(`Earliest date: ${yoyRows[0].date}`);
  console.log(`Latest date: ${yoyRows.at(-1).date}`);
  console.log(`Valid observations: ${yoyRows.length}`);
}

async function getSp500Constituents() {
  const url = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv";
  const text = await download(url);
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => splitCsvLine(line)[0])
    .filter(Boolean)
    .map((symbol) => symbol.replaceAll(".", "-"));
}

async function withConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;

  async function run() {
    while (index < items.length) {
      const itemIndex = index;
      index += 1;
      results[itemIndex] = await worker(items[itemIndex], itemIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function movingAverage(values, index, windowSize) {
  if (index + 1 < windowSize) {
    return null;
  }

  let total = 0;
  for (let offset = index - windowSize + 1; offset <= index; offset += 1) {
    total += values[offset];
  }
  return total / windowSize;
}

async function updateBreadth() {
  if (shouldSkipRecent(files.adLine) && shouldSkipRecent(files.above200)) {
    console.log("Breadth validation");
    console.log("Existing breadth files are recent; skipped constituent refresh.");
    return;
  }

  const symbols = await getSp500Constituents();
  const advancesByDate = new Map();
  const declinesByDate = new Map();
  const aboveByDate = new Map();
  const totalByDate = new Map();
  let successCount = 0;

  await withConcurrency(symbols, 8, async (symbol) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol,
      )}?range=10y&interval=1d&events=history`;
      const rows = parseYahooChart(await download(url), symbol);
      const closes = rows.map((row) => row.value);

      for (let index = 1; index < rows.length; index += 1) {
        const previous = closes[index - 1];
        const current = closes[index];
        const date = rows[index].date;

        if (current > previous) {
          advancesByDate.set(date, (advancesByDate.get(date) || 0) + 1);
        } else if (current < previous) {
          declinesByDate.set(date, (declinesByDate.get(date) || 0) + 1);
        }

        const average200 = movingAverage(closes, index, 200);
        if (average200) {
          totalByDate.set(date, (totalByDate.get(date) || 0) + 1);
          if (current > average200) {
            aboveByDate.set(date, (aboveByDate.get(date) || 0) + 1);
          }
        }
      }

      successCount += 1;
    } catch (error) {
      console.warn(`WARNING: ${symbol} breadth download failed. ${error.message}`);
    }
  });

  if (successCount < 250) {
    throw new Error(`Only ${successCount} S&P 500 constituents downloaded; keeping existing breadth files.`);
  }

  const dates = Array.from(new Set([...advancesByDate.keys(), ...totalByDate.keys()])).sort();
  let cumulative = 0;
  const adLineRows = [];
  const above200Rows = [];

  for (const date of dates) {
    const advances = advancesByDate.get(date) || 0;
    const declines = declinesByDate.get(date) || 0;
    cumulative += advances - declines;
    adLineRows.push({ date, value: cumulative });

    const total = totalByDate.get(date) || 0;
    if (total >= 250) {
      above200Rows.push({
        date,
        value: ((aboveByDate.get(date) || 0) / total) * 100,
      });
    }
  }

  const existingAdLine = loadSingleCsv(files.adLine);
  const existingAbove200 = loadSingleCsv(files.above200);
  const latestExistingAdDate = existingAdLine.at(-1)?.date;
  let finalAdLineRows = adLineRows;

  if (latestExistingAdDate) {
    const newByDate = new Map(adLineRows.map((row) => [row.date, row.value]));
    const anchor = [...existingAdLine].reverse().find((row) => newByDate.has(row.date));
    if (!anchor) {
      throw new Error("Breadth update has no overlap with the existing A/D Line history.");
    }

    const offset = anchor.value - newByDate.get(anchor.date);
    const appended = adLineRows
      .filter((row) => row.date > latestExistingAdDate)
      .map((row) => ({ date: row.date, value: row.value + offset }));
    finalAdLineRows = mergeRowsByDate(existingAdLine, appended);
  }

  const latestExistingAboveDate = existingAbove200.at(-1)?.date;
  const appendedAbove200 = latestExistingAboveDate
    ? above200Rows.filter((row) => row.date > latestExistingAboveDate)
    : above200Rows;
  const finalAbove200Rows = mergeRowsByDate(existingAbove200, appendedAbove200);

  atomicWriteCsv(files.adLine, finalAdLineRows, "Advance / Decline Line (current-constituent proxy)", 0);
  atomicWriteCsv(files.above200, finalAbove200Rows, "% Stocks Above 200-Day Moving Average (current-constituent proxy)", 1);
  console.log("Breadth validation");
  console.log(`S&P 500 constituents downloaded: ${successCount}/${symbols.length}`);
  console.log("Method: current S&P 500 constituent proxy; existing history is preserved and only new dates are appended");
  console.log(`Advance/Decline latest date: ${finalAdLineRows.at(-1).date}`);
  console.log(`Above 200DMA latest date: ${finalAbove200Rows.at(-1).date}`);
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
    {
      key: "sox",
      label: "SOX Index",
      update: () => updateYahooIndex({ symbol: "^SOX", label: "SOX Index", file: files.sox }),
    },
    { key: "tsmc", label: "TSMC Revenue YoY", update: updateTsmcRevenueYoy },
    { key: "ai-capex", label: "AI CapEx Proxy YoY", update: updateAiCapex },
    { key: "breadth", label: "Breadth indicators", update: updateBreadth },
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
