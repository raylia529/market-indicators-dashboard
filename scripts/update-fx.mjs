import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fetchFredObservations } from "./fred-api.mjs";

const downloadTimeoutMs = 20_000;
const defaultRetryBackoffMs = [];

const sources = {
  usdJpyBojBase:
    "https://www.stat-search.boj.or.jp/api/v1/getDataCode?format=json&lang=en&db=FM08&code=FXERD04",
  japan2yHistorical:
    "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/historical/jgbcme_all.csv",
  japan2yCurrent:
    "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/jgbcme.csv",
};
const recentOverlapDays = 90;

const outputFile = path.join("data", "fx.csv");
const usdJpyOutputFile = path.join("data", "usd-jpy.csv");
const us2yOutputFile = path.join("data", "us-2-year-treasury-yield.csv");
const japan2yOutputFile = path.join("data", "japan-2-year-jgb-yield.csv");
const profileArg = process.argv.find((argument) => argument.startsWith("--profile="));
const updateProfile = profileArg ? profileArg.slice("--profile=".length).toLowerCase() : "full";
const onlyArg = process.argv.find((argument) => argument.startsWith("--only="));

if (!["full", "us", "asia"].includes(updateProfile)) {
  throw new Error(`Unsupported FX update profile: ${updateProfile}`);
}

const defaultSourcesByProfile = {
  full: ["usdjpy", "us2y", "japan2y"],
  us: ["us2y"],
  asia: ["usdjpy", "japan2y"],
};
const requestedSources = new Set(
  onlyArg
    ? onlyArg
        .slice("--only=".length)
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    : defaultSourcesByProfile[updateProfile],
);
const unsupportedSources = Array.from(requestedSources).filter(
  (source) => !["usdjpy", "us2y", "japan2y"].includes(source),
);

if (requestedSources.size === 0 || unsupportedSources.length > 0) {
  throw new Error(`Unsupported FX source selection: ${Array.from(requestedSources).join(",")}`);
}

function isValidUsdJpyValue(value) {
  // The pre-1973 fixed-rate era includes observations near JPY 360 per USD.
  return Number.isFinite(value) && value > 40 && value < 500;
}

function download(url, headers = {}, timeoutMs = downloadTimeoutMs) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          download(response.headers.location, headers, timeoutMs).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Download failed: ${url} (${response.statusCode})`));
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      });

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Download timed out after ${timeoutMs / 1000}s: ${url}`));
    });
    request.on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function downloadWithRetry(
  url,
  headers = {},
  backoffMs = defaultRetryBackoffMs,
  timeoutMs = downloadTimeoutMs,
) {
  let lastError;
  for (let attempt = 0; attempt <= backoffMs.length; attempt += 1) {
    try {
      return await download(url, headers, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt < backoffMs.length) {
        const delayMs = backoffMs[attempt];
        console.warn(
          `Download failed (${error.message}); retry ${attempt + 1}/${backoffMs.length} in ${delayMs / 1000}s.`,
        );
        await wait(delayMs);
      }
    }
  }
  throw lastError;
}

function parseBojUsdJpy(text) {
  const payload = JSON.parse(text);
  const result = payload?.RESULTSET?.find((series) => series.SERIES_CODE === "FXERD04");
  const dates = result?.VALUES?.SURVEY_DATES;
  const values = result?.VALUES?.VALUES;

  if (
    payload?.STATUS !== 200 ||
    !Array.isArray(dates) ||
    !Array.isArray(values) ||
    dates.length !== values.length
  ) {
    throw new Error("Unexpected Bank of Japan FXERD04 response.");
  }

  return dates
    .map((rawDate, index) => {
      const compactDate = String(rawDate);
      return {
        date:
          compactDate.length === 8
            ? `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`
            : "",
        value: values[index] === null ? null : Number(values[index]),
      };
    })
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && isValidUsdJpyValue(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function bojUsdJpyUrl(existingRows) {
  const now = new Date();
  const endDate = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  if (existingRows.length === 0) {
    return `${sources.usdJpyBojBase}&startDate=199801&endDate=${endDate}`;
  }

  const latestDate = new Date(`${existingRows.at(-1).date}T00:00:00Z`);
  latestDate.setUTCMonth(latestDate.getUTCMonth() - 2);
  const startDate = `${latestDate.getUTCFullYear()}${String(latestDate.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
  return `${sources.usdJpyBojBase}&startDate=${startDate}&endDate=${endDate}`;
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
  const normalized = dateText.trim().replaceAll("/", "-");
  const parts = normalized.split("-").map((part) => Number(part));

  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return "";
  }

  const [year, month, day] = parts;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function parseMofJapan2y(text) {
  const lines = text.trim().split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    const headers = splitCsvLine(line);
    return headers.includes("Date") && headers.includes("2Y");
  });

  if (headerIndex < 0) {
    throw new Error("Could not find MOF Date/2Y header row.");
  }

  const headers = splitCsvLine(lines[headerIndex]);
  const dateIndex = headers.indexOf("Date");
  const valueIndex = headers.indexOf("2Y");

  return lines
    .slice(headerIndex + 1)
    .map((line) => {
      const columns = splitCsvLine(line);
      const date = toIsoDate(columns[dateIndex] || "");
      const rawValue = columns[valueIndex] || "";
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter(
      (row) =>
        row.date && row.rawValue !== "" && row.rawValue !== "-" && Number.isFinite(row.value),
    );
}

function mergeSeries(rows) {
  const merged = new Map();

  for (const row of rows) {
    merged.set(row.date, row.value);
  }

  return Array.from(merged, ([date, value]) => ({ date, value })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function loadSingleSeries(file) {
  if (!fs.existsSync(file)) {
    return [];
  }

  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, rawValue] = splitCsvLine(line);
      return { date, value: Number(rawValue) };
    })
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function atomicWriteSingleSeries(file, rows, label) {
  if (rows.length === 0) {
    throw new Error(`${label} has no valid observations.`);
  }

  const output = `date,value\n${rows
    .map((row) => `${row.date},${row.value.toFixed(4)}`)
    .join("\n")}\n`;
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, output);
  const verifiedRows = loadSingleSeries(tempFile);
  if (
    verifiedRows.length !== rows.length ||
    verifiedRows.some((row, index) => index > 0 && verifiedRows[index - 1].date >= row.date)
  ) {
    throw new Error(`${label} canonical CSV validation failed.`);
  }
  fs.renameSync(tempFile, file);
}

function recentStartDate(existingRows, requiredEarliestDate = null) {
  const latestDate = existingRows.at(-1)?.date;
  if (
    !latestDate ||
    (requiredEarliestDate && existingRows[0]?.date > requiredEarliestDate)
  ) {
    return null;
  }

  const startDate = new Date(`${latestDate}T00:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - recentOverlapDays);
  return startDate.toISOString().slice(0, 10);
}

function loadExisting() {
  if (!fs.existsSync(outputFile)) {
    return [];
  }

  return fs
    .readFileSync(outputFile, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, usdjpy, us2y, japan2y, spread] = splitCsvLine(line);
      return {
        date,
        USDJPY: usdjpy ? Number(usdjpy) : null,
        US_2Y_Yield: us2y ? Number(us2y) : null,
        Japan_2Y_Yield: japan2y ? Number(japan2y) : null,
        US_Japan_2Y_Spread: spread ? Number(spread) : null,
      };
    })
    .filter((row) => row.date);
}

function consolidate({ usdJpyRows, us2yRows, japan2yRows }) {
  const usdJpy = new Map(usdJpyRows.map((row) => [row.date, row.value]));
  const us2y = new Map(us2yRows.map((row) => [row.date, row.value]));
  const japan2y = new Map(japan2yRows.map((row) => [row.date, row.value]));
  const dates = Array.from(new Set([...usdJpy.keys(), ...us2y.keys(), ...japan2y.keys()])).sort();
  const rows = [];
  let lastUs2y = null;
  let lastJapan2y = null;

  for (const date of dates) {
    if (us2y.has(date)) {
      lastUs2y = us2y.get(date);
    }

    if (japan2y.has(date)) {
      lastJapan2y = japan2y.get(date);
    }

    rows.push({
      date,
      USDJPY: usdJpy.has(date) ? usdJpy.get(date) : null,
      US_2Y_Yield: lastUs2y,
      Japan_2Y_Yield: lastJapan2y,
      US_Japan_2Y_Spread:
        lastUs2y !== null && lastJapan2y !== null ? lastUs2y - lastJapan2y : null,
    });
  }

  return rows;
}

function validate(rows) {
  const dates = rows.map((row) => row.date);
  const duplicateDates = dates.length - new Set(dates).size;
  const sorted = rows.every((row, index) => index === 0 || rows[index - 1].date <= row.date);
  const validSpreadRows = rows.filter((row) => Number.isFinite(row.US_Japan_2Y_Spread));
  const validUsdJpyRows = rows.filter((row) => isValidUsdJpyValue(row.USDJPY));

  if (!sorted) {
    throw new Error("FX dataset dates are not sorted.");
  }

  if (duplicateDates > 0) {
    throw new Error("FX dataset contains duplicate dates.");
  }

  if (validSpreadRows.length === 0 || validUsdJpyRows.length === 0) {
    throw new Error("FX dataset is missing usable USDJPY or spread observations.");
  }

  return {
    duplicateDates,
    validSpreadRows,
    validUsdJpyRows,
  };
}

function fmt(value, digits = 4) {
  return Number.isFinite(value) ? value.toFixed(digits) : "";
}

function atomicWrite(rows) {
  const csv = `date,USDJPY,US_2Y_Yield,Japan_2Y_Yield,US_Japan_2Y_Spread\n${rows
    .map(
      (row) =>
        `${row.date},${fmt(row.USDJPY, 4)},${fmt(row.US_2Y_Yield, 4)},${fmt(
          row.Japan_2Y_Yield,
          4,
        )},${fmt(row.US_Japan_2Y_Spread, 4)}`,
    )
    .join("\n")}\n`;
  const tempFile = `${outputFile}.tmp`;
  fs.writeFileSync(tempFile, csv);
  validate(loadRowsFromFile(tempFile));
  fs.renameSync(tempFile, outputFile);
}

function loadRowsFromFile(file) {
  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, usdjpy, us2y, japan2y, spread] = splitCsvLine(line);
      return {
        date,
        USDJPY: usdjpy === "" ? null : Number(usdjpy),
        US_2Y_Yield: us2y === "" ? null : Number(us2y),
        Japan_2Y_Yield: japan2y === "" ? null : Number(japan2y),
        US_Japan_2Y_Spread: spread === "" ? null : Number(spread),
      };
    });
}

async function main() {
  const existingRows = loadExisting();
  const canonicalUsdJpy = loadSingleSeries(usdJpyOutputFile);
  const archiveUsdJpy = existingRows
      .filter((row) => isValidUsdJpyValue(row.USDJPY))
      .map((row) => ({ date: row.date, value: row.USDJPY }));
  const existingUsdJpy = canonicalUsdJpy.length > 0 ? canonicalUsdJpy : archiveUsdJpy;
  const canonicalUs2y = loadSingleSeries(us2yOutputFile);
  const canonicalJapan2y = loadSingleSeries(japan2yOutputFile);
  const existingUs2y = canonicalUs2y.length > 0
    ? canonicalUs2y
    : requestedSources.has("us2y")
      ? []
      : existingRows
          .filter((row) => Number.isFinite(row.US_2Y_Yield))
          .map((row) => ({ date: row.date, value: row.US_2Y_Yield }));
  const existingJapan2y = canonicalJapan2y.length > 0
    ? canonicalJapan2y
    : requestedSources.has("japan2y")
      ? []
      : existingRows
          .filter((row) => Number.isFinite(row.Japan_2Y_Yield))
          .map((row) => ({ date: row.date, value: row.Japan_2Y_Yield }));
  let bojUsdJpyRows = [];
  let us2yRows = [];
  let japan2yRows = [];
  const warnings = [];

  let usdJpySourceSucceeded = false;
  let us2ySourceSucceeded = false;
  let japan2ySourceSucceeded = false;

  if (requestedSources.has("usdjpy")) {
    try {
      bojUsdJpyRows = parseBojUsdJpy(
        await downloadWithRetry(bojUsdJpyUrl(canonicalUsdJpy)),
      );
      usdJpySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: Bank of Japan USDJPY download/parse failed. ${error.message}`);
    }

  }

  if (requestedSources.has("us2y")) {
    try {
      us2yRows = await fetchFredObservations("DGS2", {
        observationStart: recentStartDate(existingUs2y),
      });
      us2ySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: US 2Y download/parse failed. ${error.message}`);
    }
  }

  if (requestedSources.has("japan2y")) {
    try {
      const currentRows = parseMofJapan2y(await downloadWithRetry(sources.japan2yCurrent));
      const historicalRows = existingJapan2y.length === 0
        ? parseMofJapan2y(await downloadWithRetry(sources.japan2yHistorical))
        : [];
      japan2yRows = mergeSeries([...historicalRows, ...currentRows]);
      if (existingJapan2y.length > 0) {
        console.log("Japan 2Y historical MOF archive skipped; local history is already present.");
      }
      japan2ySourceSucceeded = true;
    } catch (error) {
      warnings.push(`WARNING: Japan 2Y download/parse failed. ${error.message}`);
    }
  }

  for (const warning of warnings) {
    console.warn(warning);
  }

  // Preserve the pre-BOJ archive. Official BOJ observations take priority on
  // overlapping dates and future runs request only a recent overlap window.
  const combinedUsdJpy = mergeSeries([...existingUsdJpy, ...bojUsdJpyRows]);
  const combinedUs2y = mergeSeries([...existingUs2y, ...us2yRows]);
  const combinedJapan2y = mergeSeries([...existingJapan2y, ...japan2yRows]);
  if (us2ySourceSucceeded) {
    atomicWriteSingleSeries(
      us2yOutputFile,
      combinedUs2y,
      "US 2-Year Treasury Yield",
    );
  }
  if (usdJpySourceSucceeded) {
    atomicWriteSingleSeries(usdJpyOutputFile, combinedUsdJpy, "USD/JPY");
  }
  if (japan2ySourceSucceeded) {
    atomicWriteSingleSeries(
      japan2yOutputFile,
      combinedJapan2y,
      "Japan 2-Year JGB Yield",
    );
  }
  const finalRows = consolidate({
    usdJpyRows: combinedUsdJpy,
    us2yRows: combinedUs2y,
    japan2yRows: combinedJapan2y,
  });

  if (finalRows.length === 0) {
    throw new Error("No existing or newly downloaded FX data is available.");
  }

  const validation = validate(finalRows);
  atomicWrite(finalRows);

  const latestUsdJpy = [...finalRows].reverse().find((row) => Number.isFinite(row.USDJPY));
  const latestSpread = [...finalRows]
    .reverse()
    .find((row) => Number.isFinite(row.US_Japan_2Y_Spread));
  const latestUs2y = combinedUs2y.at(-1);
  const latestJapan2y = combinedJapan2y.at(-1);

  console.log("FX validation");
  console.log(`Earliest date: ${finalRows[0].date}`);
  console.log(`Latest date: ${finalRows.at(-1).date}`);
  console.log(`Valid USDJPY observations: ${validation.validUsdJpyRows.length}`);
  console.log(`Bank of Japan USDJPY observations downloaded: ${bojUsdJpyRows.length}`);
  console.log("USDJPY merge priority: existing archive < official BOJ FXERD04 observations");
  console.log(`Valid spread observations: ${validation.validSpreadRows.length}`);
  console.log(`Duplicate dates: ${validation.duplicateDates}`);
  console.log(`Latest USDJPY: ${latestUsdJpy.date} ${latestUsdJpy.USDJPY.toFixed(4)}`);
  console.log(`Latest US 2Y: ${latestUs2y.date} ${latestUs2y.value.toFixed(4)}`);
  console.log(`Latest Japan 2Y: ${latestJapan2y.date} ${latestJapan2y.value.toFixed(4)}`);
  console.log(
    `Latest US-Japan 2Y Spread: ${latestSpread.date} ${latestSpread.US_Japan_2Y_Spread.toFixed(
      4,
    )}`,
  );

  const selectedSourceFailed =
    (requestedSources.has("usdjpy") && !usdJpySourceSucceeded) ||
    (requestedSources.has("us2y") && !us2ySourceSucceeded) ||
    (requestedSources.has("japan2y") && !japan2ySourceSucceeded);
  if (selectedSourceFailed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
