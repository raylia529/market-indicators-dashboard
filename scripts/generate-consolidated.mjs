import fs from "node:fs";
import path from "node:path";

const outputFile = path.join("data", "consolidated.csv");

const sources = [
  { file: "sp500.csv", columns: { value: "SP500" } },
  { file: "hy_oas.csv", columns: { value: "HY_OAS" } },
  { file: "hyg-ief.csv", columns: { value: "HYG_IEF" } },
  { file: "vix.csv", columns: { value: "VIX" } },
  { file: "move.csv", columns: { value: "MOVE" } },
  { file: "skew.csv", columns: { value: "SKEW" } },
  { file: "finra-margin-debt-yoy.csv", columns: { value: "FINRA_MARGIN_DEBT_YOY" } },
  { file: "fed-balance-sheet.csv", columns: { value: "FED_BALANCE_SHEET" } },
  { file: "nfci.csv", columns: { value: "NFCI" } },
  { file: "ism-manufacturing-pmi.csv", columns: { value: "ISM_MANUFACTURING_PMI" } },
  { file: "advance-decline-line.csv", columns: { value: "ADVANCE_DECLINE_LINE" } },
  { file: "sp500-above-200dma.csv", columns: { value: "SP500_ABOVE_200DMA" } },
  { file: "sox.csv", columns: { value: "SOX" } },
  { file: "tsmc-revenue-yoy.csv", columns: { value: "TSMC_REVENUE_YOY" } },
  { file: "ai-capex.csv", columns: { value: "AI_CAPEX_YOY" } },
  { file: "fed-funds-rate.csv", columns: { value: "FED_FUNDS_RATE" } },
  {
    file: "fx.csv",
    columns: {
      USDJPY: "USDJPY",
      US_2Y_Yield: "US_2Y_YIELD",
      Japan_2Y_Yield: "JAPAN_2Y_YIELD",
      US_Japan_2Y_Spread: "US_JAPAN_2Y_SPREAD",
    },
  },
  { file: "us-10-year-treasury-yield.csv", columns: { value: "US_10Y_YIELD" } },
  { file: "us-10y-minus-2y-spread.csv", columns: { value: "US_10Y_2Y_SPREAD" } },
  { file: "us-10y-term-premium.csv", columns: { value: "US_10Y_TERM_PREMIUM" } },
  { file: "japan-10-year-jgb-yield.csv", columns: { value: "JAPAN_10Y_YIELD" } },
  { file: "japan-10y-minus-2y-spread.csv", columns: { value: "JAPAN_10Y_2Y_SPREAD" } },
  { file: "topix.csv", columns: { value: "TOPIX" } },
  { file: "nikkei-225.csv", columns: { value: "NIKKEI_225" } },
  {
    file: "japan-foreign-investor-net-buying.csv",
    columns: { value: "JAPAN_FOREIGN_NET_BUYING" },
  },
  { file: "taiex.csv", columns: { value: "TAIEX" } },
  {
    file: "taiwan-foreign-investor-net-buying.csv",
    columns: { value: "TAIWAN_FOREIGN_NET_BUYING" },
  },
  { file: "usdtwd.csv", columns: { value: "USDTWD" } },
  {
    file: "taiwan-margin-financing-balance.csv",
    columns: { value: "TAIWAN_MARGIN_FINANCING_BALANCE" },
  },
  {
    file: "taiwan-margin-financing-balance-yoy.csv",
    columns: { value: "TAIWAN_MARGIN_FINANCING_BALANCE_YOY" },
  },
  {
    file: "taiwan-electronics-exports-yoy.csv",
    columns: { value: "TAIWAN_ELECTRONICS_EXPORTS_YOY" },
  },
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (quoted) throw new Error("Unterminated quoted CSV field");
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function readSource(source) {
  const filePath = path.join("data", source.file);
  if (!fs.existsSync(filePath)) throw new Error(`Missing source file: ${filePath}`);

  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  if (rows.length < 2) throw new Error(`No observations in ${filePath}`);

  const headers = rows[0].map((header) => header.trim());
  const dateIndex = headers.indexOf("date");
  if (dateIndex === -1) throw new Error(`Missing date column in ${filePath}`);

  const sourceColumns = Object.entries(source.columns).map(([input, output]) => {
    const index = headers.indexOf(input);
    if (index === -1) throw new Error(`Missing ${input} column in ${filePath}`);
    return { index, output };
  });

  const observations = new Map();
  for (const row of rows.slice(1)) {
    if (row.every((value) => value.trim() === "")) continue;
    const date = (row[dateIndex] ?? "").trim();
    if (!isIsoDate(date)) throw new Error(`Invalid date ${JSON.stringify(date)} in ${filePath}`);
    if (observations.has(date)) throw new Error(`Duplicate date ${date} in ${filePath}`);

    const values = {};
    for (const { index, output } of sourceColumns) {
      const raw = (row[index] ?? "").trim();
      if (raw === "") continue;
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) {
        throw new Error(`Invalid numeric value ${JSON.stringify(raw)} for ${output} on ${date}`);
      }
      values[output] = raw;
    }
    observations.set(date, values);
  }

  return { observations, columns: sourceColumns.map(({ output }) => output) };
}

function atomicWrite(filePath, contents) {
  const tempFile = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tempFile, contents, "utf8");
  fs.renameSync(tempFile, filePath);
}

const allColumns = [];
const byDate = new Map();

for (const source of sources) {
  const { observations, columns } = readSource(source);
  for (const column of columns) {
    if (allColumns.includes(column)) throw new Error(`Duplicate output column: ${column}`);
    allColumns.push(column);
  }
  for (const [date, values] of observations) {
    byDate.set(date, { ...(byDate.get(date) ?? {}), ...values });
  }
}

const dates = [...byDate.keys()].sort();
const lines = [
  ["date", ...allColumns].join(","),
  ...dates.map((date) => {
    const values = byDate.get(date);
    return [date, ...allColumns.map((column) => values[column] ?? "")].join(",");
  }),
];

atomicWrite(outputFile, `${lines.join("\n")}\n`);

console.log("Consolidated data validation");
console.log(`Earliest date: ${dates[0]}`);
console.log(`Latest date: ${dates.at(-1)}`);
console.log(`Dates: ${dates.length}`);
console.log(`Indicator columns: ${allColumns.length}`);
console.log(`Output: ${outputFile}`);
