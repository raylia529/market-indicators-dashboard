import fs from "node:fs";
import path from "node:path";

const sourceDefinitions = [
  {
    key: "JAPAN_CORE_CPI_YOY",
    label: "Japan Core CPI YoY",
    outputFile: path.join("data", "japan-core-cpi-yoy.csv"),
    urls: [
      "https://www.e-stat.go.jp/en/stat-search/file-download?fileKind=1&statInfId=000032103934",
      "https://www.stat.go.jp/data/cpi/2025/youshiki/csv/zmy2025s.csv",
    ],
  },
  {
    key: "TOKYO_CORE_CPI_YOY",
    label: "Tokyo Core CPI YoY",
    outputFile: path.join("data", "tokyo-core-cpi-yoy.csv"),
    urls: [
      "https://www.e-stat.go.jp/en/stat-search/file-download?fileKind=1&statInfId=000032104013",
      "https://www.stat.go.jp/data/cpi/2025/youshiki/csv/tmy2025s.csv",
    ],
  },
];

const requestTimeoutMs = 60_000;
const coreCpiHeaders = [
  "All items, less fresh food",
  "生鮮食品を除く総合",
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
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function parseOfficialCpi(buffer) {
  const text = new TextDecoder("shift_jis").decode(buffer);
  const rows = parseCsv(text);
  const headerIndex = rows.findIndex((row) =>
    row.some((heading) => coreCpiHeaders.includes(heading.trim())),
  );

  if (headerIndex < 0) {
    throw new Error("Official CPI CSV is missing the core CPI header.");
  }

  const valueIndex = rows[headerIndex].findIndex(
    (heading) => coreCpiHeaders.includes(heading.trim()),
  );

  if (valueIndex < 0) {
    throw new Error("Official CPI CSV is missing the all-items-less-fresh-food series.");
  }

  return rows
    .slice(headerIndex + 1)
    .filter((row) => /^\d{6}$/.test(row[0]?.trim()))
    .map((row) => {
      const month = row[0].trim();
      const valueText = row[valueIndex]?.trim() || "";
      const value = Number(valueText);
      const year = Number(month.slice(0, 4));
      const monthNumber = Number(month.slice(4, 6));
      const date = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);

      return { date, value, valid: valueText !== "" };
    })
    .filter((row) => row.valid && Number.isFinite(row.value))
    .map(({ date, value }) => ({ date, value }));
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
      const [date, valueText] = line.split(",");
      return { date, value: Number(valueText) };
    })
    .filter(
      (row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.value),
    );
}

function mergeRows(...groups) {
  const merged = new Map();

  for (const rows of groups) {
    for (const row of rows) {
      merged.set(row.date, row);
    }
  }

  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function validate(rows) {
  if (rows.length === 0) {
    throw new Error("CPI dataset has no valid observations.");
  }

  const dates = rows.map((row) => row.date);
  const duplicateDates = dates.length - new Set(dates).size;
  const sorted = rows.every(
    (row, index) => index === 0 || rows[index - 1].date < row.date,
  );

  if (!sorted) {
    throw new Error("CPI dates are not strictly sorted.");
  }

  if (duplicateDates > 0) {
    throw new Error("CPI dataset contains duplicate dates.");
  }

  if (rows.some((row) => !Number.isFinite(row.value))) {
    throw new Error("CPI dataset contains non-numeric values.");
  }

  return { duplicateDates };
}

function atomicWrite(file, rows) {
  const tempFile = `${file}.tmp`;
  const csv = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(1)}`)
    .join("\n")}\n`;

  fs.writeFileSync(tempFile, csv);
  validate(loadExisting(tempFile));
  fs.renameSync(tempFile, file);
}

async function download(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "market-indicators-dashboard/1.0" },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function updateSeries(definition) {
  const existingRows = loadExisting(definition.outputFile);
  const downloadedGroups = [];
  const warnings = [];

  for (const url of definition.urls) {
    try {
      const rows = parseOfficialCpi(await download(url));

      if (rows.length > 0) {
        downloadedGroups.push(rows);
      }
    } catch (error) {
      warnings.push(`${url}: ${error.message}`);
    }
  }

  if (downloadedGroups.length === 0) {
    if (existingRows.length === 0) {
      throw new Error(`${definition.label} download failed: ${warnings.join(" | ")}`);
    }

    throw new Error(
      `${definition.label} sources returned no usable update; existing history was preserved. ${warnings.join(
        " | ",
      )}`,
    );
  }

  const finalRows = mergeRows(existingRows, ...downloadedGroups);
  const validation = validate(finalRows);
  atomicWrite(definition.outputFile, finalRows);

  console.log(`${definition.label} validation`);
  console.log(`Earliest date: ${finalRows[0].date}`);
  console.log(`Latest date: ${finalRows.at(-1).date}`);
  console.log(`Valid observations: ${finalRows.length}`);
  console.log(`Duplicate dates: ${validation.duplicateDates}`);
  console.log(`Latest value: ${finalRows.at(-1).value.toFixed(1)}%`);
}

async function main() {
  let failed = false;

  for (const definition of sourceDefinitions) {
    try {
      await updateSeries(definition);
    } catch (error) {
      failed = true;
      console.warn(`WARNING: ${error.message}`);
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
