import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const series = [
  {
    id: "VIXCLS",
    outputFile: path.join("data", "vix.csv"),
    label: "VIX",
  },
  {
    id: "T10Y2Y",
    outputFile: path.join("data", "us-10y-minus-2y-spread.csv"),
    label: "US 10Y minus 2Y Treasury spread",
  },
  {
    id: "DGS10",
    outputFile: path.join("data", "us-10-year-treasury-yield.csv"),
    label: "US 10-Year Treasury yield",
  },
  {
    id: "WALCL",
    outputFile: path.join("data", "fed-balance-sheet.csv"),
    label: "Fed Balance Sheet",
    decimals: 0,
  },
  {
    id: "NFCI",
    outputFile: path.join("data", "nfci.csv"),
    label: "Chicago Fed National Financial Conditions Index",
    decimals: 3,
  },
];

const seriesArg = process.argv.find((argument) => argument.startsWith("--series="));
const requestedSeries = seriesArg
  ? new Set(
      seriesArg
        .slice("--series=".length)
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean),
    )
  : null;

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

function parseFredCsv(text, seriesId) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());
  const dateIndex = headers.indexOf("observation_date");
  const valueIndex = headers.indexOf(seriesId);

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Unexpected ${seriesId} header: ${headers.join(",")}`);
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
        row.date && row.rawValue !== "" && row.rawValue !== "." && Number.isFinite(row.value),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

function validate(rows, label) {
  const duplicateDates = rows.length - new Set(rows.map((row) => row.date)).size;
  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);

  if (rows.length === 0) {
    throw new Error(`${label} has no valid observations.`);
  }

  if (!sorted) {
    throw new Error(`${label} dates are not sorted.`);
  }

  if (duplicateDates > 0) {
    throw new Error(`${label} contains duplicate dates.`);
  }

  return { duplicateDates };
}

async function updateSeries(item) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${item.id}`;
  const text = await downloadWithRetry(url);
  const rows = parseFredCsv(text, item.id);
  const validation = validate(rows, item.label);
  const decimals = item.decimals ?? 2;
  const output = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(decimals)}`)
    .join("\n")}\n`;
  const tempFile = `${item.outputFile}.tmp`;

  fs.writeFileSync(tempFile, output);
  validate(parseFredCsv(output.replace("date,value", `observation_date,${item.id}`), item.id), item.label);
  fs.renameSync(tempFile, item.outputFile);

  console.log(`${item.label} validation`);
  console.log(`Series ID: ${item.id}`);
  console.log(`Earliest date: ${rows[0].date}`);
  console.log(`Latest date: ${rows.at(-1).date}`);
  console.log(`Valid observations: ${rows.length}`);
  console.log(`Duplicate dates: ${validation.duplicateDates}`);
}

async function main() {
  const selectedSeries = requestedSeries
    ? series.filter((item) => requestedSeries.has(item.id))
    : series;

  if (selectedSeries.length === 0) {
    throw new Error(`No matching FRED series requested: ${Array.from(requestedSeries || []).join(",")}`);
  }

  for (const item of selectedSeries) {
    await updateSeries(item);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
