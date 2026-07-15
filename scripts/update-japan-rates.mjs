import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const userAgent = "market-indicators-dashboard/1.0 raylia529";
const sources = {
  historical: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/historical/jgbcme_all.csv",
  current: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/jgbcme.csv",
};
const files = {
  tenYear: path.join("data", "japan-10-year-jgb-yield.csv"),
  spread: path.join("data", "japan-10y-minus-2y-spread.csv"),
  fx: path.join("data", "fx.csv"),
};

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": userAgent } }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
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

function toIsoDate(dateText) {
  const normalized = String(dateText || "").trim().replaceAll("/", "-");
  const parts = normalized.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return "";
  }
  const [year, month, day] = parts;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseMofYield(text, maturity) {
  const lines = text.trim().split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    const headers = splitCsvLine(line);
    return headers.includes("Date") && headers.includes(maturity);
  });

  if (headerIndex < 0) {
    throw new Error(`Could not find MOF Date/${maturity} header row.`);
  }

  const headers = splitCsvLine(lines[headerIndex]);
  const dateIndex = headers.indexOf("Date");
  const valueIndex = headers.indexOf(maturity);

  return lines
    .slice(headerIndex + 1)
    .map((line) => {
      const columns = splitCsvLine(line);
      const date = toIsoDate(columns[dateIndex]);
      const rawValue = columns[valueIndex] || "";
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter((row) => row.date && row.rawValue !== "" && row.rawValue !== "-" && Number.isFinite(row.value));
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

function loadJapan2yFromFx() {
  const [headerLine, ...lines] = fs.readFileSync(files.fx, "utf8").trim().split(/\r?\n/);
  const headers = splitCsvLine(headerLine);
  const dateIndex = headers.indexOf("date");
  const valueIndex = headers.indexOf("Japan_2Y_Yield");

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error("data/fx.csv is missing Japan_2Y_Yield.");
  }

  return lines
    .map((line) => {
      const columns = splitCsvLine(line);
      const value = Number(columns[valueIndex]);
      return { date: columns[dateIndex], value };
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

function validateRows(rows, label, existingRows = []) {
  if (rows.length === 0) {
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

function atomicWriteCsv(file, rows, label, decimals = 4) {
  validateRows(rows, label);
  const output = `date,value\n${rows.map((row) => `${row.date},${row.value.toFixed(decimals)}`).join("\n")}\n`;
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, output);
  validateRows(loadSingleCsv(tempFile), label);
  fs.renameSync(tempFile, file);
}

function buildSpreadRows(twoYearRows, tenYearRows) {
  const twoYear = new Map(twoYearRows.map((row) => [row.date, row.value]));
  const tenYear = new Map(tenYearRows.map((row) => [row.date, row.value]));
  const dates = Array.from(new Set([...twoYear.keys(), ...tenYear.keys()])).sort();
  const rows = [];
  let lastTwoYear = null;
  let lastTenYear = null;

  for (const date of dates) {
    if (twoYear.has(date)) {
      lastTwoYear = twoYear.get(date);
    }
    if (tenYear.has(date)) {
      lastTenYear = tenYear.get(date);
    }
    if (lastTwoYear !== null && lastTenYear !== null) {
      rows.push({ date, value: lastTenYear - lastTwoYear });
    }
  }

  return rows;
}

async function main() {
  const existingTenYear = loadSingleCsv(files.tenYear);
  const existingSpread = loadSingleCsv(files.spread);
  const downloadedRows = mergeRows([], [
    ...parseMofYield(await download(sources.historical), "10Y"),
    ...parseMofYield(await download(sources.current), "10Y"),
  ]);
  const tenYearRows = mergeRows(existingTenYear, downloadedRows);
  validateRows(tenYearRows, "Japan 10-Year JGB Yield", existingTenYear);
  atomicWriteCsv(files.tenYear, tenYearRows, "Japan 10-Year JGB Yield", 4);

  const japan2yRows = loadJapan2yFromFx();
  const spreadRows = mergeRows(existingSpread, buildSpreadRows(japan2yRows, tenYearRows));
  validateRows(spreadRows, "Japan 10Y-2Y JGB Yield Spread", existingSpread);
  atomicWriteCsv(files.spread, spreadRows, "Japan 10Y-2Y JGB Yield Spread", 4);

  console.log("Japan rates validation");
  console.log("Source: Japan Ministry of Finance JGB interest rate CSV");
  console.log(`Japan 10Y earliest date: ${tenYearRows[0].date}`);
  console.log(`Japan 10Y latest date: ${tenYearRows.at(-1).date}`);
  console.log(`Japan 10Y valid observations: ${tenYearRows.length}`);
  console.log(`Japan 10Y-2Y spread earliest date: ${spreadRows[0].date}`);
  console.log(`Japan 10Y-2Y spread latest date: ${spreadRows.at(-1).date}`);
  console.log(`Japan 10Y-2Y spread valid observations: ${spreadRows.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
