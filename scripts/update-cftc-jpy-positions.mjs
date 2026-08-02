import fs from "node:fs";
import path from "node:path";

const apiEndpoint = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";
const outputFile = path.join("data", "cftc-jpy-speculative-net-positions.csv");
const contractMarketCode = "097741";
const timeoutMs = 20_000;

function splitCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      fields.push(field.trim());
      field = "";
    } else {
      field += char;
    }
  }

  fields.push(field.trim());
  return fields.map((value) => value.replace(/^"|"$/g, ""));
}

function loadExistingRows() {
  if (!fs.existsSync(outputFile)) {
    return [];
  }

  return fs
    .readFileSync(outputFile, "utf8")
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

function normalizeDate(value) {
  const date = String(value || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

async function fetchRows(existingRows) {
  const latestExistingDate = existingRows.at(-1)?.date;
  const where = [
    `cftc_contract_market_code='${contractMarketCode}'`,
    latestExistingDate
      ? `report_date_as_yyyy_mm_dd >= '${latestExistingDate}T00:00:00.000'`
      : null,
  ].filter(Boolean);
  const url = new URL(apiEndpoint);
  url.searchParams.set(
    "$select",
    "report_date_as_yyyy_mm_dd,noncomm_positions_long_all,noncomm_positions_short_all",
  );
  url.searchParams.set("$where", where.join(" AND "));
  url.searchParams.set("$order", "report_date_as_yyyy_mm_dd ASC");
  url.searchParams.set("$limit", "5000");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  let payload;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "market-indicators-dashboard/1.0 raylia529",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`CFTC API request failed with HTTP ${response.status}.`);
    }

    payload = await response.json();
  } finally {
    clearTimeout(timeout);
  }

  if (!Array.isArray(payload)) {
    throw new Error("CFTC API returned an unexpected response.");
  }

  const rows = payload
    .map((row) => {
      const date = normalizeDate(row.report_date_as_yyyy_mm_dd);
      const long = Number(row.noncomm_positions_long_all);
      const short = Number(row.noncomm_positions_short_all);
      return { date, value: long - short };
    })
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((left, right) => left.date.localeCompare(right.date));

  if (rows.length === 0) {
    throw new Error("CFTC API returned no valid Japanese Yen observations.");
  }

  return rows;
}

function mergeRows(existingRows, downloadedRows) {
  const byDate = new Map(existingRows.map((row) => [row.date, row]));
  downloadedRows.forEach((row) => byDate.set(row.date, row));
  return Array.from(byDate.values()).sort((left, right) => left.date.localeCompare(right.date));
}

function writeRows(rows) {
  if (rows.length === 0) {
    throw new Error("CFTC JPY speculative net positions has no observations.");
  }

  const output = `date,value\n${rows
    .map((row) => `${row.date},${Math.round(row.value)}`)
    .join("\n")}\n`;
  const tempFile = `${outputFile}.tmp`;
  fs.writeFileSync(tempFile, output);
  fs.renameSync(tempFile, outputFile);
}

async function main() {
  const existingRows = loadExistingRows();
  const downloadedRows = await fetchRows(existingRows);
  const latestExistingDate = existingRows.at(-1)?.date;

  if (latestExistingDate && downloadedRows.every((row) => row.date <= latestExistingDate)) {
    throw new Error(`CFTC has no report newer than ${latestExistingDate}.`);
  }

  const rows = mergeRows(existingRows, downloadedRows);
  if (existingRows.length === 0 && rows.length < 100) {
    throw new Error(`CFTC historical bootstrap only produced ${rows.length} observations.`);
  }

  writeRows(rows);
  console.log("CFTC JPY speculative net positions validation");
  console.log("Source: CFTC Legacy Commitments of Traders, Futures Only, CME Japanese Yen 097741");
  console.log("Formula: non-commercial long positions - non-commercial short positions");
  console.log(`Historical bootstrap: ${existingRows.length === 0 ? "yes" : "no"}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
