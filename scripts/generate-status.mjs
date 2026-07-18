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
    expectedReleaseDelayDays: 24,
    releaseNote: "Usually published during the third week of the following month.",
    file: "data/finra-margin-debt-yoy.csv",
    type: "single",
  },
  {
    key: "MOVE",
    displayName: "MOVE Index",
    shortName: "MOVE",
    sourceName: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/%5EMOVE/",
    sourceUrls: [{ label: "Yahoo Finance ^MOVE", url: "https://finance.yahoo.com/quote/%5EMOVE/" }],
    frequency: "Daily, US trading days",
    file: "data/move.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "ACMTP10",
    displayName: "US 10-Year Treasury Term Premium",
    shortName: "US Term Premium",
    sourceName: "Federal Reserve Bank of New York",
    sourceUrl: "https://www.newyorkfed.org/research/data_indicators/term-premia-tabs",
    sourceUrls: [
      {
        label: "New York Fed Treasury Term Premia",
        url: "https://www.newyorkfed.org/research/data_indicators/term-premia-tabs",
      },
      {
        label: "ACMTermPremium.xls",
        url: "https://www.newyorkfed.org/medialibrary/media/research/data_indicators/ACMTermPremium.xls",
      },
    ],
    frequency: "Daily, business days",
    unit: "Percentage Points",
    releaseNote:
      "Adrian, Crump, and Moench ACM Daily sheet, column ACMTP10. Public redistribution terms for committed derived CSV data are not explicitly confirmed.",
    file: "data/us-10y-term-premium.csv",
    type: "single",
    dailyLagDays: 7,
  },
  {
    key: "WALCL",
    displayName: "Federal Reserve Balance Sheet",
    shortName: "Fed Balance Sheet",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/WALCL",
    sourceUrls: [{ label: "FRED WALCL", url: "https://fred.stlouisfed.org/series/WALCL" }],
    frequency: "Weekly, Wednesday level",
    expectedReleaseDelayDays: 9,
    file: "data/fed-balance-sheet.csv",
    type: "single",
    dailyLagDays: 10,
  },
  {
    key: "NFCI",
    displayName: "Chicago Fed National Financial Conditions Index",
    shortName: "NFCI",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/NFCI",
    sourceUrls: [{ label: "FRED NFCI", url: "https://fred.stlouisfed.org/series/NFCI" }],
    frequency: "Weekly, ending Friday",
    expectedReleaseDelayDays: 12,
    file: "data/nfci.csv",
    type: "single",
    dailyLagDays: 12,
  },
  {
    key: "SKEW",
    displayName: "CBOE SKEW Index",
    shortName: "SKEW",
    sourceName: "Cboe",
    sourceUrl: "https://www.cboe.com/us/indices/dashboard/skew/",
    sourceUrls: [
      { label: "Cboe SKEW", url: "https://www.cboe.com/us/indices/dashboard/skew/" },
      {
        label: "Cboe SKEW history CSV",
        url: "https://cdn.cboe.com/api/global/us_indices/daily_prices/SKEW_History.csv",
      },
    ],
    frequency: "Daily, US trading days",
    file: "data/skew.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "ADVANCE_DECLINE_LINE",
    displayName: "S&P 500 Advance / Decline Line",
    shortName: "A/D Line (Proxy)",
    sourceName: "Calculated from Yahoo Finance constituent prices",
    sourceUrl: "https://finance.yahoo.com/",
    sourceUrls: [
      { label: "Yahoo Finance", url: "https://finance.yahoo.com/" },
      {
        label: "S&P 500 constituent list",
        url: "https://github.com/datasets/s-and-p-500-companies",
      },
    ],
    frequency: "Daily, US trading days",
    releaseNote: "Current-constituent proxy. Historical membership changes are not reconstructed, and each refresh preserves the existing cumulative baseline before appending new dates.",
    file: "data/advance-decline-line.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "SP500_ABOVE_200DMA",
    displayName: "S&P 500 Percent of Stocks Above 200-Day Moving Average",
    shortName: "% Above 200DMA (Proxy)",
    sourceName: "Calculated from Yahoo Finance constituent prices",
    sourceUrl: "https://finance.yahoo.com/",
    sourceUrls: [
      { label: "Yahoo Finance", url: "https://finance.yahoo.com/" },
      {
        label: "S&P 500 constituent list",
        url: "https://github.com/datasets/s-and-p-500-companies",
      },
    ],
    frequency: "Daily, US trading days",
    releaseNote: "Calculated from current S&P 500 constituents; historical membership changes are not reconstructed.",
    file: "data/sp500-above-200dma.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "SOX",
    displayName: "PHLX Semiconductor Sector Index",
    shortName: "SOX",
    sourceName: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/%5ESOX/",
    sourceUrls: [{ label: "Yahoo Finance ^SOX", url: "https://finance.yahoo.com/quote/%5ESOX/" }],
    frequency: "Daily, US trading days",
    file: "data/sox.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "TSMC_REVENUE_YOY",
    displayName: "TSMC Revenue Year-over-Year Growth",
    shortName: "TSMC Rev YoY",
    sourceName: "MOPS monthly operating revenue",
    sourceUrl: "https://mops.twse.com.tw/mops/#/web/t05st10_ifrs",
    sourceUrls: [
      { label: "MOPS monthly operating revenue", url: "https://mops.twse.com.tw/mops/#/web/t05st10_ifrs" },
      { label: "MOPSOV monthly revenue endpoint", url: "https://mopsov.twse.com.tw/mops/web/t05st10_ifrs" },
    ],
    frequency: "Monthly",
    expectedReleaseDelayDays: 41,
    releaseNote:
      "Historical archive is parsed from MOPSOV single-company monthly operating revenue for TSMC 2330. The updater merges newly available months and keeps existing history if a source request fails.",
    file: "data/tsmc-revenue-yoy.csv",
    type: "single",
    dailyLagDays: 45,
  },
  {
    key: "AI_CAPEX",
    displayName: "Hyperscaler CapEx Year-over-Year Growth: Microsoft, Amazon, Alphabet, and Meta",
    shortName: "AI CapEx Proxy YoY",
    sourceName: "SEC companyfacts",
    sourceUrl: "https://www.sec.gov/edgar/sec-api-documentation",
    sourceUrls: [
      { label: "SEC companyfacts API", url: "https://www.sec.gov/edgar/sec-api-documentation" },
    ],
    formula: "Year-over-year growth of Microsoft CapEx + Amazon CapEx + Alphabet CapEx + Meta CapEx",
    releaseNote: "Proxy for AI infrastructure investment using total reported CapEx. Single-quarter SEC facts are used where available; otherwise a quarter is derived from consecutive reported fiscal YTD values. No estimates are used.",
    frequency: "Quarterly",
    expectedReleaseDelayDays: 130,
    file: "data/ai-capex.csv",
    type: "single",
    dailyLagDays: 120,
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
  {
    key: "JAPAN_10Y_JGB",
    displayName: "Japan 10-Year JGB Yield",
    shortName: "Japan 10Y JGB",
    sourceName: "Japan Ministry of Finance",
    sourceUrl: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
    sourceUrls: [
      {
        label: "Japan Ministry of Finance JGB yields",
        url: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
      },
    ],
    frequency: "Daily, Japan business days",
    unit: "Percent",
    file: "data/japan-10-year-jgb-yield.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "JAPAN_10Y_2Y_SPREAD",
    displayName: "Japan 10-Year Minus 2-Year JGB Yield Spread",
    shortName: "Japan 10Y-2Y",
    sourceName: "Calculated",
    sourceUrl: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
    sourceUrls: [
      {
        label: "Japan Ministry of Finance JGB yields",
        url: "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/",
      },
    ],
    formula: "Japan 10-Year JGB Yield - Japan 2-Year JGB Yield",
    frequency: "Daily, Japan business days",
    unit: "Percentage Points",
    file: "data/japan-10y-minus-2y-spread.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "NIKKEI_225",
    displayName: "Nikkei 225",
    shortName: "Nikkei 225",
    sourceName: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/%5EN225/",
    sourceUrls: [{ label: "Yahoo Finance ^N225", url: "https://finance.yahoo.com/quote/%5EN225/" }],
    frequency: "Daily, Japan trading days",
    unit: "Index",
    file: "data/nikkei-225.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "TOPIX",
    displayName: "TOPIX",
    shortName: "TOPIX",
    sourceName: "JPX / Yahoo Japan",
    sourceUrl: "https://www.jpx.co.jp/english/markets/statistics-equities/monthly/",
    sourceUrls: [
      { label: "JPX monthly statistics", url: "https://www.jpx.co.jp/english/markets/statistics-equities/monthly/" },
      { label: "Yahoo Japan recent TOPIX history", url: "https://finance.yahoo.co.jp/quote/998405.T/history" },
      { label: "JPX TOPIX definition", url: "https://www.jpx.co.jp/english/markets/indices/topix/" },
    ],
    frequency: "Daily, Japan trading days",
    unit: "Index",
    releaseNote: "Official daily closes are parsed from JPX monthly statistics PDFs from 2016 onward; Yahoo Japan fills recent dates when available.",
    file: "data/topix.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "JAPAN_FOREIGN_NET_BUYING",
    displayName: "Foreign Investors Net Buying of Japanese Equities",
    shortName: "Japan Foreign Net Buying",
    sourceName: "JPX Trading by Type of Investors",
    sourceUrl: "https://www.jpx.co.jp/english/markets/statistics-equities/investor-type/",
    sourceUrls: [
      { label: "JPX Trading by Type of Investors", url: "https://www.jpx.co.jp/english/markets/statistics-equities/investor-type/" },
    ],
    frequency: "Weekly",
    expectedReleaseDelayDays: 13,
    unit: "JPY Billions",
    releaseNote: "Weekly purchases minus sales for Foreigners in the JPX Tokyo & Nagoya value workbook.",
    file: "data/japan-foreign-investor-net-buying.csv",
    type: "single",
    dailyLagDays: 14,
  },
  {
    key: "TAIEX",
    displayName: "TAIEX",
    shortName: "TAIEX",
    sourceName: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/%5ETWII/",
    sourceUrls: [{ label: "Yahoo Finance ^TWII", url: "https://finance.yahoo.com/quote/%5ETWII/" }],
    frequency: "Daily, Taiwan trading days",
    unit: "Index",
    file: "data/taiex.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "TAIWAN_FOREIGN_NET_BUYING",
    displayName: "Foreign Investors Net Buying of Taiwan Equities",
    shortName: "Taiwan Foreign Net Buying",
    sourceName: "TWSE / FinMind",
    sourceUrl: "https://www.twse.com.tw/en/trading/foreign/bfi82u.html",
    sourceUrls: [
      { label: "TWSE institutional investor trading", url: "https://www.twse.com.tw/en/trading/foreign/bfi82u.html" },
      { label: "FinMind total-market history", url: "https://finmind.github.io/en/tutor/TaiwanMarket/Chip/" },
    ],
    frequency: "Daily, Taiwan trading days",
    unit: "TWD Millions",
    releaseNote: "FinMind provides the TWSE-derived bulk history; recent dates are overwritten by official TWSE BFI82U values.",
    file: "data/taiwan-foreign-investor-net-buying.csv",
    type: "single",
    dailyLagDays: 5,
  },
  {
    key: "TAIWAN_ELECTRONICS_EXPORTS_YOY",
    displayName: "Taiwan Electronics Exports YoY",
    shortName: "Taiwan Electronics Exports YoY",
    sourceName: "Taiwan Ministry of Finance",
    sourceUrl: "https://data.gov.tw/en/datasets/8380",
    sourceUrls: [
      { label: "Taiwan MOF exports by main commodity", url: "https://data.gov.tw/en/datasets/8380" },
      { label: "Taiwan Ministry of Finance trade statistics", url: "https://web02.mof.gov.tw/njswww/" },
    ],
    frequency: "Monthly",
    expectedReleaseDelayDays: 38,
    unit: "Percent YoY",
    releaseNote: "Calculated from the Ministry of Finance monthly electronic-components export value in USD.",
    file: "data/taiwan-electronics-exports-yoy.csv",
    type: "single",
    dailyLagDays: 45,
  },
  {
    key: "USDTWD",
    displayName: "USD/TWD Exchange Rate",
    shortName: "USD/TWD",
    sourceName: "Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/TWD%3DX/",
    sourceUrls: [{ label: "Yahoo Finance TWD=X", url: "https://finance.yahoo.com/quote/TWD%3DX/" }],
    frequency: "Daily forex trading days",
    unit: "TWD per USD",
    releaseNote: "Definition: 1 USD = X TWD.",
    file: "data/usdtwd.csv",
    type: "single",
    dailyLagDays: 4,
  },
  {
    key: "TAIWAN_MARGIN_FINANCING_BALANCE_YOY",
    displayName: "Taiwan Margin Financing Balance YoY",
    shortName: "Taiwan Margin YoY",
    sourceName: "TWSE / FinMind",
    sourceUrl: "https://www.twse.com.tw/en/trading/margin/mi-margn.html",
    sourceUrls: [
      { label: "TWSE margin trading", url: "https://www.twse.com.tw/exchangeReport/MI_MARGN?response=html" },
      { label: "FinMind total-market history", url: "https://finmind.github.io/en/tutor/TaiwanMarket/Chip/" },
    ],
    frequency: "Daily, Taiwan trading days",
    unit: "Percent YoY",
    formula: "(Current margin financing balance / comparable prior-year balance - 1) * 100",
    releaseNote: "FinMind provides TWSE-derived bulk history; recent official TWSE values take priority. YoY uses the latest prior-year trading observation within seven days.",
    file: "data/taiwan-margin-financing-balance-yoy.csv",
    type: "single",
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

function formatDateText(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateText(date);
}

function addBusinessDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  let remaining = days;

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();

    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return formatDateText(date);
}

function addMonths(year, month, offset) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function endOfMonth(year, month) {
  return formatDateText(new Date(Date.UTC(year, month, 0)));
}

function calculateNextExpectedUpdate(definition, latestAvailableDate) {
  if (!latestAvailableDate || definition.statusOverride) {
    return null;
  }

  if (Number.isInteger(definition.expectedReleaseDelayDays)) {
    return addDays(latestAvailableDate, definition.expectedReleaseDelayDays);
  }

  const normalizedFrequency = definition.frequency.toLowerCase();

  if (normalizedFrequency.includes("monthly")) {
    const [year, month] = latestAvailableDate.split("-").map(Number);
    const nextMonth = addMonths(year, month, 1);
    return endOfMonth(nextMonth.year, nextMonth.month);
  }

  if (normalizedFrequency.includes("weekly")) {
    return addDays(latestAvailableDate, 7);
  }

  if (normalizedFrequency.includes("daily")) {
    return addBusinessDays(latestAvailableDate, 1);
  }

  return null;
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

function loadPreviousMetadata() {
  if (!fs.existsSync(outputFile)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(outputFile, "utf8"));
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

function calculateStatus(
  definition,
  latestAvailableDate,
  updateResult,
  previousSuccessfulRefresh,
  todayText,
) {
  if (definition.statusOverride) {
    return definition.statusOverride;
  }

  if (updateResult?.status === "failed") {
    return "Failed";
  }

  if (!latestAvailableDate) {
    return "Failed";
  }

  if (updateResult?.status === "success") {
    return "Up to date";
  }

  const nextExpectedUpdate = calculateNextExpectedUpdate(definition, latestAvailableDate);
  if (nextExpectedUpdate) {
    const successfulRefreshDate = previousSuccessfulRefresh?.slice(0, 10) || "";
    if (successfulRefreshDate >= todayText) {
      return "Up to date";
    }
    return nextExpectedUpdate < todayText ? "Source lag" : "Up to date";
  }

  const lagDays = dateDiffDays(latestAvailableDate, todayText);
  const fallbackLagDays = definition.dailyLagDays ?? definition.expectedReleaseDelayDays ?? 5;
  return lagDays <= fallbackLagDays ? "Up to date" : "Source lag";
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
  const previousMetadata = loadPreviousMetadata();
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

    const previousIndicator = previousMetadata.indicators?.[definition.key] || null;
    const status = calculateStatus(
      definition,
      latestAvailableDate,
      updateResult,
      previousIndicator?.last_successful_refresh,
      todayText,
    );
    const nextExpectedUpdate = calculateNextExpectedUpdate(definition, latestAvailableDate);
    let lastSuccessfulRefresh = previousIndicator?.last_successful_refresh || null;
    if (updateResult?.status === "success") {
      lastSuccessfulRefresh = finishedAt;
    } else if (!lastSuccessfulRefresh && status !== "Failed") {
      lastSuccessfulRefresh = finishedAt;
    }

    indicators[definition.key] = {
      display_name: definition.displayName,
      short_name: definition.shortName,
      source_name: definition.sourceName,
      source_url: definition.sourceUrl,
      source_urls: definition.sourceUrls,
      latest_available_date: latestAvailableDate,
      next_expected_update_date: nextExpectedUpdate,
      last_successful_refresh: lastSuccessfulRefresh,
      last_successful_refresh_display: formatJstDisplay(lastSuccessfulRefresh),
      frequency: definition.frequency,
      unit: definition.unit || null,
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
