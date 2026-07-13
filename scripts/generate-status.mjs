import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const outputFile = path.join("data", "status.json");
const updateResultsFile = ".update-results.json";
const dashboardVersion = "1.0.0";

const indicatorDefinitions = [
  {
    key: "SP500",
    displayName: "S&P 500 Index",
    shortName: "S&P 500",
    sourceName: "FRED SP500",
    sourceUrl: "https://fred.stlouisfed.org/series/SP500",
    sourceUrls: [{ label: "FRED SP500", url: "https://fred.stlouisfed.org/series/SP500" }],
    frequency: "Daily, US trading days",
    file: "data/sp500.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "VIXCLS",
    displayName: "CBOE Volatility Index (VIX)",
    shortName: "VIX",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/VIXCLS",
    sourceUrls: [{ label: "FRED VIXCLS", url: "https://fred.stlouisfed.org/series/VIXCLS" }],
    frequency: "Daily, US trading days",
    file: "data/vix.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "BAMLH0A0HYM2",
    displayName: "ICE BofA US High Yield Index Option-Adjusted Spread",
    shortName: "HY OAS",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2",
    sourceUrls: [{ label: "FRED BAMLH0A0HYM2", url: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2" }],
    frequency: "Daily",
    file: "data/hy_oas.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "DGS10",
    displayName: "US 10-Year Treasury Yield",
    shortName: "US 10Y Yield",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS10",
    sourceUrls: [{ label: "FRED DGS10", url: "https://fred.stlouisfed.org/series/DGS10" }],
    frequency: "Daily",
    file: "data/us-10-year-treasury-yield.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "T10Y2Y",
    displayName: "US Treasury 10-Year Minus 2-Year Yield Spread",
    shortName: "10Y-2Y Spread",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/T10Y2Y",
    sourceUrls: [{ label: "FRED T10Y2Y", url: "https://fred.stlouisfed.org/series/T10Y2Y" }],
    frequency: "Daily",
    file: "data/us-10y-minus-2y-spread.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "FINRA_MARGIN_DEBT_YOY",
    displayName: "FINRA Margin Debt Year-over-Year Growth",
    shortName: "Margin Debt YoY",
    sourceName: "FINRA Margin Statistics",
    sourceUrl: "https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics",
    sourceUrls: [
      {
        label: "FINRA Margin Statistics",
        url: "https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics",
      },
    ],
    frequency: "Monthly",
    releaseNote: "Usually published during the third week of the following month.",
    file: "data/finra-margin-debt-yoy.csv",
    type: "single",
  },
  {
    key: "DEXJPUS",
    displayName: "USD/JPY Exchange Rate",
    shortName: "USD/JPY",
    sourceName: "FRED + Yahoo Finance gap fill",
    sourceUrl: "https://fred.stlouisfed.org/series/DEXJPUS",
    sourceUrls: [
      { label: "FRED DEXJPUS", url: "https://fred.stlouisfed.org/series/DEXJPUS" },
      { label: "Yahoo Finance JPY=X", url: "https://finance.yahoo.com/quote/JPY%3DX/history/" },
    ],
    frequency: "Daily forex trading days",
    releaseNote: "FRED remains the official historical source. Yahoo Finance only fills recent dates that FRED has not published yet.",
    file: "data/fx.csv",
    type: "fx",
    column: "USDJPY",
    dailyLagDays: 4,
  },
  {
    key: "DGS2",
    displayName: "US 2-Year Treasury Yield",
    shortName: "US 2Y Yield",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS2",
    sourceUrls: [{ label: "FRED DGS2", url: "https://fred.stlouisfed.org/series/DGS2" }],
    frequency: "Daily",
    file: "data/fx.csv",
    type: "fx",
    column: "US_2Y_Yield",
    dailyLagDays: 5,
  },
  {
    key: "JAPAN_2Y_JGB",
    displayName: "Japan 2-Year JGB Yield",
    shortName: "Japan 2Y Yield",
    sourceName: "Japan Ministry of Finance",
    sourceUrl: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
    sourceUrls: [
      {
        label: "Japan Ministry of Finance",
        url: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
      },
    ],
    frequency: "Daily, Japan business days",
    file: "data/fx.csv",
    type: "fx",
    column: "Japan_2Y_Yield",
    dailyLagDays: 5,
  },
  {
    key: "US_JAPAN_2Y_SPREAD",
    displayName: "US-Japan 2-Year Government Bond Yield Spread",
    shortName: "US-JP 2Y Spread",
    sourceName: "Calculated",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS2",
    sourceUrls: [
      { label: "FRED DGS2", url: "https://fred.stlouisfed.org/series/DGS2" },
      {
        label: "Japan Ministry of Finance",
        url: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
      },
    ],
    formula: "US 2-Year Treasury Yield - Japan 2-Year JGB Yield",
    frequency: "Daily",
    file: "data/fx.csv",
    type: "fx",
    column: "US_Japan_2Y_Spread",
    dailyLagDays: 5,
  },
];

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

function readSingleLatest(file) {
  const rows = fs
    .readFileSync(file, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, rawValue] = splitCsvLine(line);
      return { date, value: Number(rawValue) };
    })
    .filter((row) => row.date && Number.isFinite(row.value));

  return rows.at(-1)?.date || null;
}

function readFxLatest(file, column) {
  const [headerLine, ...lines] = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = splitCsvLine(headerLine);
  const dateIndex = headers.indexOf("date");
  const valueIndex = headers.indexOf(column);

  if (dateIndex < 0 || valueIndex < 0) {
    throw new Error(`Missing ${column} in ${file}.`);
  }

  const rows = lines
    .map((line) => {
      const columns = splitCsvLine(line);
      const rawValue = columns[valueIndex];
      return { date: columns[dateIndex], rawValue, value: Number(rawValue) };
    })
    .filter((row) => row.date && row.rawValue !== "" && Number.isFinite(row.value));

  return rows.at(-1)?.date || null;
}

function getLatestAvailableDate(definition) {
  if (definition.type === "single") {
    return readSingleLatest(definition.file);
  }

  return readFxLatest(definition.file, definition.column);
}

function getJstParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return parts;
}

function nowJstIso() {
  const parts = getJstParts();
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
}

function formatJstDisplay(isoText) {
  if (!isoText) {
    return null;
  }

  const date = new Date(isoText);
  const parts = getJstParts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} JST`;
}

function dateDiffDays(fromDateText, toDateText) {
  const from = Date.parse(`${fromDateText}T00:00:00Z`);
  const to = Date.parse(`${toDateText}T00:00:00Z`);
  return Math.floor((to - from) / 86400000);
}

function addMonths(year, month, offset) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function isFinraWaitingForRelease(latestDate, todayText) {
  const [latestYear, latestMonth] = latestDate.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = todayText.split("-").map(Number);
  const nextMonth = addMonths(latestYear, latestMonth, 1);
  const followingMonth = addMonths(latestYear, latestMonth, 2);

  if (todayYear === nextMonth.year && todayMonth === nextMonth.month) {
    return todayDay <= 24;
  }

  if (todayYear === followingMonth.year && todayMonth === followingMonth.month) {
    return todayDay <= 7;
  }

  return false;
}

function loadUpdateResults() {
  if (!fs.existsSync(updateResultsFile)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(updateResultsFile, "utf8"));
  } catch {
    return {};
  }
}

function readGitCommit() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function readPythonVersion() {
  try {
    return execFileSync("python3", ["--version"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function calculateStatus(definition, latestAvailableDate, updateResult, todayText) {
  if (updateResult?.status === "failed") {
    return "Failed to update";
  }

  if (!latestAvailableDate) {
    return "Failed to update";
  }

  if (definition.key === "FINRA_MARGIN_DEBT_YOY") {
    if (isFinraWaitingForRelease(latestAvailableDate, todayText)) {
      return "Waiting";
    }

    return dateDiffDays(latestAvailableDate, todayText) > 70 ? "Stale data" : "Up to date";
  }

  const lagDays = dateDiffDays(latestAvailableDate, todayText);

  const dailyLagDays = definition.dailyLagDays ?? 5;

  if (lagDays <= dailyLagDays) {
    return lagDays <= 2 ? "Up to date" : "Waiting";
  }

  return "Stale data";
}

function buildMetadata() {
  const startedAt = process.env.DASHBOARD_REFRESH_STARTED_AT || nowJstIso();
  const finishedAt = nowJstIso();
  const started = Date.parse(startedAt);
  const finished = Date.parse(finishedAt);
  const updateDurationSeconds =
    Number.isFinite(started) && Number.isFinite(finished)
      ? Number(((finished - started) / 1000).toFixed(1))
      : null;
  const todayText = finishedAt.slice(0, 10);
  const updateResults = loadUpdateResults();
  const indicators = {};

  for (const definition of indicatorDefinitions) {
    const updateResult = updateResults[definition.key] || updateResults[definition.file] || null;
    let latestAvailableDate = null;
    let errorMessage = updateResult?.error_message || null;

    try {
      latestAvailableDate = getLatestAvailableDate(definition);
    } catch (error) {
      errorMessage = error.message;
    }

    const status = calculateStatus(definition, latestAvailableDate, updateResult, todayText);
    const lastSuccessfulRefresh = status === "Failed to update" ? updateResult?.last_successful_refresh || null : finishedAt;

    indicators[definition.key] = {
      display_name: definition.displayName,
      short_name: definition.shortName,
      source_name: definition.sourceName,
      source_url: definition.sourceUrl,
      source_urls: definition.sourceUrls,
      latest_available_date: latestAvailableDate,
      last_successful_refresh: lastSuccessfulRefresh,
      last_successful_refresh_display: formatJstDisplay(lastSuccessfulRefresh),
      frequency: definition.frequency,
      status,
      error_message: errorMessage,
      formula: definition.formula || null,
      release_note: definition.releaseNote || null,
    };
  }

  return {
    last_dashboard_refresh: finishedAt,
    last_dashboard_refresh_display: formatJstDisplay(finishedAt),
    update_duration_seconds: updateDurationSeconds,
    dashboard_version: dashboardVersion,
    last_git_commit: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : readGitCommit(),
    python_version: readPythonVersion(),
    indicators,
  };
}

function atomicWriteJson(file, data) {
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(data, null, 2)}\n`);
  JSON.parse(fs.readFileSync(tempFile, "utf8"));
  fs.renameSync(tempFile, file);
}

const metadata = buildMetadata();
atomicWriteJson(outputFile, metadata);

console.log("Data Status metadata");
console.log(`Dashboard refresh: ${metadata.last_dashboard_refresh_display}`);
console.log(`Indicators: ${Object.keys(metadata.indicators).length}`);
for (const [key, indicator] of Object.entries(metadata.indicators)) {
  console.log(`${key}: ${indicator.status} (${indicator.latest_available_date || "no date"})`);
}
