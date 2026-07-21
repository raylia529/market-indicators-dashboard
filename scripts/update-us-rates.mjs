import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const sourceUrl = "https://www.newyorkfed.org/medialibrary/media/research/data_indicators/ACMTermPremium.xls";
const outputFile = path.join("data", "us-10y-term-premium.csv");
const downloadTimeoutMs = 20_000;
const retryBackoffMs = [5_000, 15_000];

function downloadBuffer(url, timeoutMs = downloadTimeoutMs) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { "User-Agent": userAgent } }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          downloadBuffer(response.headers.location, timeoutMs).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Download failed: ${url} (${response.statusCode})`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      });

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Download timed out after ${timeoutMs / 1000}s: ${url}`));
    });
    request.on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadBufferWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt <= retryBackoffMs.length; attempt += 1) {
    try {
      return await downloadBuffer(url);
    } catch (error) {
      lastError = error;
      if (attempt < retryBackoffMs.length) await wait(retryBackoffMs[attempt]);
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

function loadExisting(file) {
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

function validateRows(rows, existingRows) {
  if (rows.length === 0) {
    throw new Error("US 10-Year Treasury Term Premium has no valid observations.");
  }

  if (rows.some((row) => !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(row.value))) {
    throw new Error("US 10-Year Treasury Term Premium contains invalid dates or values.");
  }

  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);
  const duplicateDates = rows.length - new Set(rows.map((row) => row.date)).size;

  if (!sorted) {
    throw new Error("US 10-Year Treasury Term Premium dates are not sorted.");
  }

  if (duplicateDates > 0) {
    throw new Error("US 10-Year Treasury Term Premium contains duplicate dates.");
  }

  if (existingRows.length > 0 && rows.length < existingRows.length * 0.98) {
    throw new Error("US 10-Year Treasury Term Premium update would shorten existing history.");
  }
}

function atomicWrite(file, rows) {
  const output = `date,value\n${rows.map((row) => `${row.date},${row.value.toFixed(6)}`).join("\n")}\n`;
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, output);
  validateRows(loadExisting(tempFile), []);
  fs.renameSync(tempFile, file);
}

async function parseAcmWithPython(buffer) {
  const tempXls = path.join("/tmp", `ACMTermPremium-${process.pid}.xls`);
  const tempJson = path.join("/tmp", `ACMTermPremium-${process.pid}.json`);
  fs.writeFileSync(tempXls, buffer);

  const { spawnSync } = await import("node:child_process");
  const script = `
import json
from datetime import datetime, date
from openpyxl import load_workbook
try:
    import xlrd
except Exception as exc:
    raise SystemExit(f"xlrd is required to read the New York Fed .xls file: {exc}")

path = ${JSON.stringify(tempXls)}
out = ${JSON.stringify(tempJson)}
workbook = xlrd.open_workbook(path)
sheet = workbook.sheet_by_name("ACM Daily")
headers = [str(sheet.cell_value(0, col)).strip() for col in range(sheet.ncols)]
date_idx = headers.index("DATE")
value_idx = headers.index("ACMTP10")
rows = []
for row_idx in range(1, sheet.nrows):
    raw_date = sheet.cell_value(row_idx, date_idx)
    raw_value = sheet.cell_value(row_idx, value_idx)
    if raw_value in ("", None):
        continue
    if sheet.cell_type(row_idx, date_idx) == xlrd.XL_CELL_DATE:
        dt = xlrd.xldate_as_datetime(raw_date, workbook.datemode).date()
    else:
        raw_text = str(raw_date).strip()
        try:
            dt = datetime.strptime(raw_text, "%d-%b-%Y").date()
        except ValueError:
            dt = datetime.strptime(raw_text, "%d-%b-%y").date()
    value = float(raw_value)
    rows.append({"date": dt.isoformat(), "value": value})
with open(out, "w", encoding="utf-8") as handle:
    json.dump(rows, handle)
`;
  const pythonBin = process.env.PYTHON_BIN || "python3";
  const result = spawnSync(pythonBin, ["-c", script], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "ACM parser failed.");
  }

  const rows = JSON.parse(fs.readFileSync(tempJson, "utf8"));
  fs.rmSync(tempXls, { force: true });
  fs.rmSync(tempJson, { force: true });
  return rows;
}

async function main() {
  const existingRows = loadExisting(outputFile);
  const buffer = await downloadBufferWithRetry(sourceUrl);
  const parsedRows = await parseAcmWithPython(buffer);
  const rows = mergeRows(existingRows, parsedRows);
  validateRows(rows, existingRows);
  atomicWrite(outputFile, rows);

  console.log("US 10-Year Treasury Term Premium validation");
  console.log("Source: Federal Reserve Bank of New York ACM Term Premium");
  console.log("Dataset: ACM Daily");
  console.log("Column: ACMTP10");
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
