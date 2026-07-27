import fs from "node:fs";
import path from "node:path";

const outputFile = path.join("data", "boj-policy-rate.csv");
const apiBaseUrl =
  "https://stats.bis.org/api/v2/data/dataflow/BIS/WS_CBPOL/1.0/D.JP";
const requestTimeoutMs = 60_000;
const fullHistoryStart = "1946-01-01";

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

function subtractDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function parseResponse(csvText) {
  const [headerLine, ...lines] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.replace(/^\uFEFF/, "").split(",");
  const frequencyIndex = headers.indexOf("FREQ");
  const areaIndex = headers.indexOf("REF_AREA");
  const dateIndex = headers.indexOf("TIME_PERIOD");
  const valueIndex = headers.indexOf("OBS_VALUE");

  if ([frequencyIndex, areaIndex, dateIndex, valueIndex].some((index) => index < 0)) {
    throw new Error("BIS policy-rate response is missing required columns.");
  }

  return lines
    .map((line) => {
      const fields = line.split(",");
      return {
        frequency: fields[frequencyIndex],
        area: fields[areaIndex],
        date: fields[dateIndex],
        value: Number(fields[valueIndex]),
      };
    })
    .filter(
      (row) =>
        row.frequency === "D" &&
        row.area === "JP" &&
        /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
        Number.isFinite(row.value),
    )
    .map(({ date, value }) => ({ date, value }));
}

function mergeRows(existingRows, downloadedRows) {
  const rows = new Map(existingRows.map((row) => [row.date, row]));
  downloadedRows.forEach((row) => rows.set(row.date, row));
  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function validate(rows, existingRows = []) {
  if (rows.length === 0) {
    throw new Error("BOJ Policy Rate has no valid observations.");
  }
  if (rows[0].date !== fullHistoryStart) {
    throw new Error(`Unexpected earliest date: ${rows[0].date}`);
  }
  if (rows.some((row) => !Number.isFinite(row.value))) {
    throw new Error("BOJ Policy Rate contains non-numeric values.");
  }
  if (rows.some((row, index) => index > 0 && rows[index - 1].date >= row.date)) {
    throw new Error("BOJ Policy Rate dates are not strictly sorted.");
  }
  if (existingRows.length > 0 && rows.length < existingRows.length) {
    throw new Error("BOJ Policy Rate update would shorten existing history.");
  }
}

function atomicWrite(rows) {
  const tempFile = `${outputFile}.tmp-${process.pid}`;
  const csv = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(4)}`)
    .join("\n")}\n`;
  fs.writeFileSync(tempFile, csv, "utf8");
  validate(loadCsv(tempFile));
  fs.renameSync(tempFile, outputFile);
}

async function main() {
  const existingRows = loadCsv();
  const startDate =
    existingRows.length === 0
      ? fullHistoryStart
      : subtractDays(existingRows.at(-1).date, 60);
  const url = new URL(apiBaseUrl);
  url.searchParams.set("startPeriod", startDate);
  url.searchParams.set("format", "csvfile");
  url.searchParams.set("labels", "id");
  url.searchParams.set("detail", "dataonly");

  const response = await fetch(url, {
    headers: {
      Accept: "text/csv",
      "User-Agent": "market-indicators-dashboard/1.0",
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`BIS policy-rate request failed with HTTP ${response.status}.`);
  }

  const downloadedRows = parseResponse(await response.text());
  if (downloadedRows.length === 0) {
    throw new Error("BIS returned no Japan policy-rate observations.");
  }

  const finalRows = mergeRows(existingRows, downloadedRows);
  validate(finalRows, existingRows);
  atomicWrite(finalRows);

  console.log("BOJ Policy Rate validation");
  console.log("Source: BIS Central Bank Policy Rates, reported by Bank of Japan");
  console.log("Series: BIS,WS_CBPOL,1.0 / D.JP");
  console.log(`Requested from: ${startDate}`);
  console.log(`Earliest date: ${finalRows[0].date}`);
  console.log(`Latest date: ${finalRows.at(-1).date}`);
  console.log(`Valid observations: ${finalRows.length}`);
  console.log(`Latest value: ${finalRows.at(-1).value.toFixed(4)}%`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
