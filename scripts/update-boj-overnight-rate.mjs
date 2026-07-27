import fs from "node:fs";
import path from "node:path";

const outputFile = path.join("data", "japan-overnight-call-rate.csv");
const apiBaseUrl = "https://www.stat-search.boj.or.jp/api/v1/getDataCode";
const seriesCode = "STRDCLUCON";
const requestTimeoutMs = 60_000;

function loadCsv(file = outputFile) {
  if (!fs.existsSync(file)) {
    return [];
  }

  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, valueText] = line.split(",");
      return { date, value: Number(valueText) };
    })
    .filter(
      (row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.value),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

function monthText(dateText) {
  return dateText.slice(0, 7).replace("-", "");
}

function previousMonth(month) {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(4, 6)) - 1;
  return new Date(Date.UTC(year, monthIndex - 1, 1))
    .toISOString()
    .slice(0, 7)
    .replace("-", "");
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7).replace("-", "");
}

function toIsoDate(value) {
  const text = String(value);
  return /^\d{8}$/.test(text)
    ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
    : "";
}

function parseResponse(payload) {
  if (payload?.STATUS !== 200 || !Array.isArray(payload.RESULTSET)) {
    throw new Error(payload?.MESSAGE || "BOJ API returned an invalid response.");
  }

  const result = payload.RESULTSET.find((item) => item.SERIES_CODE === seriesCode);
  const dates = result?.VALUES?.SURVEY_DATES;
  const values = result?.VALUES?.VALUES;

  if (!Array.isArray(dates) || !Array.isArray(values) || dates.length !== values.length) {
    throw new Error(`BOJ API response is missing ${seriesCode} observations.`);
  }

  return dates
    .map((date, index) => ({
      date: toIsoDate(date),
      value: values[index] === null ? Number.NaN : Number(values[index]),
    }))
    .filter((row) => row.date && Number.isFinite(row.value));
}

function mergeRows(existingRows, downloadedRows) {
  const rows = new Map(existingRows.map((row) => [row.date, row]));
  downloadedRows.forEach((row) => rows.set(row.date, row));
  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function validate(rows, existingRows = []) {
  if (rows.length === 0) {
    throw new Error("Japan Overnight Call Rate has no valid observations.");
  }
  if (rows[0].date !== "1998-01-05") {
    throw new Error(`Unexpected earliest date: ${rows[0].date}`);
  }
  if (rows.some((row) => !Number.isFinite(row.value))) {
    throw new Error("Japan Overnight Call Rate contains non-numeric values.");
  }
  if (rows.some((row, index) => index > 0 && rows[index - 1].date >= row.date)) {
    throw new Error("Japan Overnight Call Rate dates are not strictly sorted.");
  }
  if (existingRows.length > 0 && rows.length < existingRows.length) {
    throw new Error("Japan Overnight Call Rate update would shorten existing history.");
  }
}

function atomicWrite(rows) {
  const tempFile = `${outputFile}.tmp-${process.pid}`;
  const csv = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(3)}`)
    .join("\n")}\n`;
  fs.writeFileSync(tempFile, csv, "utf8");
  validate(loadCsv(tempFile));
  fs.renameSync(tempFile, outputFile);
}

async function main() {
  const existingRows = loadCsv();
  const startDate =
    existingRows.length === 0
      ? "199801"
      : previousMonth(monthText(existingRows.at(-1).date));
  const endDate = currentMonth();
  const url = new URL(apiBaseUrl);
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "en");
  url.searchParams.set("db", "FM01");
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  url.searchParams.set("code", seriesCode);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "User-Agent": "market-indicators-dashboard/1.0",
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`BOJ API request failed with HTTP ${response.status}.`);
  }

  const finalRows = mergeRows(existingRows, parseResponse(await response.json()));
  validate(finalRows, existingRows);
  atomicWrite(finalRows);

  console.log("Japan Overnight Call Rate validation");
  console.log("Source: Bank of Japan Time-Series Data Search API");
  console.log(`Series: FM01'${seriesCode}`);
  console.log(`Requested period: ${startDate}-${endDate}`);
  console.log(`Earliest date: ${finalRows[0].date}`);
  console.log(`Latest date: ${finalRows.at(-1).date}`);
  console.log(`Valid observations: ${finalRows.length}`);
  console.log(`Latest value: ${finalRows.at(-1).value.toFixed(3)}%`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
