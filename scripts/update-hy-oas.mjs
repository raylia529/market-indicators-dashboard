import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const archiveUrl =
  "https://raw.githubusercontent.com/csaladenes/eco-archive/refs/heads/main/BAMLH0A0HYM2.csv";
const fredUrl = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2";
const outputFile = path.join("data", "hy_oas.csv");
const seriesColumn = "BAMLH0A0HYM2";

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          download(response.headers.location).then(resolve, reject);
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

function parseCsv(text, dateColumns) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());
  const dateIndex = dateColumns.map((name) => headers.indexOf(name)).find((index) => index >= 0);
  const valueIndex = headers.indexOf(seriesColumn) >= 0 ? headers.indexOf(seriesColumn) : headers.indexOf("value");

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Unexpected CSV header: ${headers.join(",")}`);
  }

  return lines
    .slice(1)
    .map((line) => {
      const columns = line.split(",");
      const date = columns[dateIndex]?.trim();
      const rawValue = columns[valueIndex]?.trim();
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter(
      (row) =>
        row.date &&
        row.rawValue !== "" &&
        row.rawValue !== "." &&
        Number.isFinite(row.value) &&
        row.value > 0 &&
        !isWeekend(row.date),
    );
}

function isWeekend(dateText) {
  const day = new Date(`${dateText}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function readExisting(file) {
  if (!fs.existsSync(file)) {
    return [];
  }

  return parseCsv(fs.readFileSync(file, "utf8"), ["date", "DATE", "observation_date"]);
}

function mergeRows(sources) {
  const merged = new Map();

  for (const rows of sources) {
    for (const row of rows) {
      merged.set(row.date, row.value);
    }
  }

  return Array.from(merged, ([date, value]) => ({ date, value })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function validate(rows) {
  const dates = rows.map((row) => row.date);
  const duplicateDates = dates.length - new Set(dates).size;
  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);
  const invalidValues = rows.filter((row) => !Number.isFinite(row.value));
  const earliest = rows[0]?.date;

  if (!sorted) {
    throw new Error("HY OAS dates are not sorted.");
  }

  if (duplicateDates > 0) {
    throw new Error("HY OAS contains duplicate dates.");
  }

  if (invalidValues.length > 0) {
    throw new Error("HY OAS contains invalid numeric values.");
  }

  if (earliest !== "1996-12-31") {
    throw new Error(`HY OAS earliest date changed to ${earliest}.`);
  }

  for (const year of ["1997", "2008", "2020"]) {
    if (!rows.some((row) => row.date.startsWith(year))) {
      throw new Error(`HY OAS is missing ${year} observations.`);
    }
  }

  const yearMax = (year) =>
    rows
      .filter((row) => row.date.startsWith(year))
      .reduce((max, row) => (row.value > max.value ? row : max), { date: "", value: -Infinity });

  return {
    earliest,
    latest: rows.at(-1).date,
    validObservations: rows.length,
    duplicateDates,
    maximum2008: yearMax("2008"),
    maximum2020: yearMax("2020"),
    p01: percentile(
      rows.map((row) => row.value),
      0.01,
    ),
    p99: percentile(
      rows.map((row) => row.value),
      0.99,
    ),
  };
}

async function main() {
  const existingHyOas = readExisting(outputFile);
  let archiveRows = [];
  let fredRows = [];

  try {
    const archiveText = await download(archiveUrl);
    const archiveHeaders = archiveText.trim().split(/\r?\n/)[0];

    if (archiveHeaders !== "DATE,BAMLH0A0HYM2") {
      throw new Error(`Archive header mismatch: ${archiveHeaders}`);
    }

    archiveRows = parseCsv(archiveText, ["DATE"]);

    if (archiveRows[0]?.date !== "1996-12-31") {
      throw new Error(`Archive earliest date mismatch: ${archiveRows[0]?.date}`);
    }
  } catch (error) {
    console.warn(`WARNING: archive download/parse failed. ${error.message}`);
  }

  try {
    const fredText = await download(fredUrl);
    fredRows = parseCsv(fredText, ["observation_date", "DATE"]);
  } catch (error) {
    console.warn(`WARNING: FRED rolling download/parse failed. ${error.message}`);
  }

  const baseRows = archiveRows.length > 0 ? archiveRows : existingHyOas;
  const mergedRows = mergeRows([existingHyOas, baseRows, fredRows]);

  if (mergedRows[0]?.date > "1996-12-31") {
    throw new Error("Refusing to write HY OAS because history would be shortened.");
  }

  const validation = validate(mergedRows);
  const csv = `date,value\n${mergedRows
    .map((row) => `${row.date},${row.value.toFixed(2)}`)
    .join("\n")}\n`;
  const tempFile = `${outputFile}.tmp`;

  fs.writeFileSync(tempFile, csv);
  validate(readExisting(tempFile));
  fs.renameSync(tempFile, outputFile);

  console.log("HY OAS validation");
  console.log(`Earliest date: ${validation.earliest}`);
  console.log(`Latest date: ${validation.latest}`);
  console.log(`Valid observations: ${validation.validObservations}`);
  console.log(`Duplicate dates: ${validation.duplicateDates}`);
  console.log(`2008 maximum: ${validation.maximum2008.value.toFixed(2)}`);
  console.log(`2008 maximum date: ${validation.maximum2008.date}`);
  console.log(`2020 maximum: ${validation.maximum2020.value.toFixed(2)}`);
  console.log(`2020 maximum date: ${validation.maximum2020.date}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
