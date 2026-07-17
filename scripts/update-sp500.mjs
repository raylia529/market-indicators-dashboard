import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const archiveUrl =
  "https://raw.githubusercontent.com/vijinho/sp500/refs/heads/master/csv/sp500.csv";
const latestUrl = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500";
const outputFile = path.join("data", "sp500.csv");

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

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function downloadWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await download(url);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await wait(2500 * attempt);
      }
    }
  }
  throw lastError;
}

function parseCsvLine(line) {
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
  return fields.map((field) => field.trim());
}

function normalizeDate(rawDate) {
  const trimmed = rawDate.replaceAll('"', "").trim();
  return trimmed.slice(0, 10);
}

function parseRows(text, dateColumn, valueColumn) {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]).map((header) => header.replaceAll('"', ""));
  const dateIndex = headers.indexOf(dateColumn);
  const valueIndex = headers.indexOf(valueColumn);

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Unexpected CSV header: ${headers.join(",")}`);
  }

  return lines
    .slice(1)
    .map((line) => {
      const columns = parseCsvLine(line);
      const date = normalizeDate(columns[dateIndex] || "");
      const rawValue = columns[valueIndex]?.replaceAll('"', "").trim();
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter(
      (row) =>
        /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
        row.rawValue !== "" &&
        row.rawValue !== "." &&
        Number.isFinite(row.value),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

function readExisting() {
  if (!fs.existsSync(outputFile)) {
    return [];
  }

  return parseRows(fs.readFileSync(outputFile, "utf8"), "date", "value");
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

function yearCount(rows, year) {
  return rows.filter((row) => row.date.startsWith(`${year}-`)).length;
}

function validate(rows, existingRows) {
  const dates = rows.map((row) => row.date);
  const duplicateDates = dates.length - new Set(dates).size;
  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);
  const invalidValues = rows.filter((row) => !Number.isFinite(row.value));
  const earliest = rows[0]?.date;

  if (!sorted) {
    throw new Error("S&P 500 dates are not sorted.");
  }

  if (duplicateDates > 0) {
    throw new Error("S&P 500 contains duplicate dates.");
  }

  if (invalidValues.length > 0) {
    throw new Error("S&P 500 contains invalid numeric values.");
  }

  if (!earliest || earliest > "1997-01-02") {
    throw new Error(`Refusing to write S&P 500 because earliest date is ${earliest}.`);
  }

  for (const year of [2000, 2008, 2020]) {
    if (yearCount(rows, year) === 0) {
      throw new Error(`S&P 500 is missing ${year} observations.`);
    }
  }

  if (existingRows.length > 0 && rows.length < existingRows.length * 0.95) {
    throw new Error("Refusing to write S&P 500 because row count shrank unexpectedly.");
  }

  return {
    duplicateDates,
    observations1997: yearCount(rows, 1997),
    observations2008: yearCount(rows, 2008),
    observations2020: yearCount(rows, 2020),
  };
}

function monthSamples(rows, yearMonth) {
  const matches = rows.filter((row) => row.date.startsWith(`${yearMonth}-`));

  if (matches.length === 0) {
    return "missing";
  }

  const picks = [matches[0], matches[Math.floor(matches.length / 2)], matches.at(-1)];
  return picks.map((row) => `${row.date}: ${row.value.toFixed(2)}`).join("; ");
}

async function main() {
  const existingRows = readExisting();
  let archiveRows = [];
  let latestRows = [];
  let latestSource = "FRED SP500";

  try {
    const archiveText = await downloadWithRetry(archiveUrl);
    archiveRows = parseRows(archiveText, "Date", "Close");
  } catch (error) {
    console.warn(`WARNING: S&P 500 archive download/parse failed. ${error.message}`);
  }

  try {
    const latestText = await downloadWithRetry(latestUrl);
    latestRows = parseRows(latestText, "observation_date", "SP500");
  } catch (error) {
    latestSource = "not updated; preserved existing/latest archive rows";
    console.warn(`WARNING: S&P 500 latest download/parse failed. ${error.message}`);
  }

  const mergedRows = mergeRows([archiveRows, existingRows, latestRows]);
  const validation = validate(mergedRows, existingRows);
  const csv = `date,value\n${mergedRows
    .map((row) => `${row.date},${row.value.toFixed(2)}`)
    .join("\n")}\n`;
  const tempFile = `${outputFile}.tmp`;

  fs.writeFileSync(tempFile, csv);
  validate(parseRows(fs.readFileSync(tempFile, "utf8"), "date", "value"), existingRows);
  fs.renameSync(tempFile, outputFile);

  console.log("S&P 500 validation");
  console.log(`Archive earliest date: ${archiveRows[0]?.date || "unavailable"}`);
  console.log(`Archive latest date: ${archiveRows.at(-1)?.date || "unavailable"}`);
  console.log(`Final earliest date: ${mergedRows[0].date}`);
  console.log(`Final latest date: ${mergedRows.at(-1).date}`);
  console.log(`Valid observations: ${mergedRows.length}`);
  console.log(`Duplicate dates: ${validation.duplicateDates}`);
  console.log(`1997 observations: ${validation.observations1997}`);
  console.log(`2008 observations: ${validation.observations2008}`);
  console.log(`2020 observations: ${validation.observations2020}`);
  console.log(`Data source used for latest update: ${latestSource}`);
  console.log(`2000-03 close samples: ${monthSamples(mergedRows, "2000-03")}`);
  console.log(`2008-10 close samples: ${monthSamples(mergedRows, "2008-10")}`);
  console.log(`2020-03 close samples: ${monthSamples(mergedRows, "2020-03")}`);
  console.log(`2022-10 close samples: ${monthSamples(mergedRows, "2022-10")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
