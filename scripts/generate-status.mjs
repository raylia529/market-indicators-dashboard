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
    unit: "Index",
    file: "data/sp500.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "VIXCLS",
    displayName: "CBOE Volatility Index (VIX)",
    shortName: "VIX",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/VIXCLS",
    sourceUrls: [{ label: "FRED VIXCLS", url: "https://fred.stlouisfed.org/series/VIXCLS" }],
    frequency: "Daily, US trading days",
    unit: "Index",
    file: "data/vix.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "BAMLH0A0HYM2",
    displayName: "ICE BofA US High Yield Index Option-Adjusted Spread",
    shortName: "HY OAS",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2",
    sourceUrls: [{ label: "FRED BAMLH0A0HYM2", url: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2" }],
    frequency: "Daily",
    unit: "Percentage Points",
    file: "data/hy_oas.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "HYG_IEF",
    displayName: "HYG/IEF Risk Appetite Ratio",
    shortName: "HYG/IEF",
    sourceName: "Alpaca Market Data API",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Split-adjusted close ratio",
    formula: "HYG split-adjusted close / IEF split-adjusted close on matching trading dates",
    releaseNote:
      "The pre-Alpaca archive is retained. New observations use Alpaca free IEX daily bars on matching dates only; no forward fill or estimated values are used.",
    file: "data/hyg-ief.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "DFEDTARU",
    displayName: "Federal Funds Target Rate (Upper Limit)",
    shortName: "Fed Funds Rate",
    sourceName: "Federal Reserve Board via FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DFEDTARU",
    sourceUrls: [
      {
        label: "FRED DFEDTARU",
        url: "https://fred.stlouisfed.org/series/DFEDTARU",
      },
      {
        label: "Federal Reserve FOMC calendar",
        url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
      },
    ],
    frequency: "Policy decisions, normally eight scheduled FOMC meetings per year",
    unit: "Percent, target range upper limit",
    releaseNote:
      "The chart uses the discontinued DFEDTAR target rate through 2008-12-15 and DFEDTARU thereafter. Daily as-of observations are drawn as a step line. The next official update follows the scheduled FOMC decision date; unscheduled decisions can occur earlier.",
    scheduledUpdateDates: [
      "2026-07-29",
      "2026-09-16",
      "2026-10-28",
      "2026-12-09",
      "2027-01-27",
      "2027-03-17",
      "2027-04-28",
      "2027-06-09",
      "2027-07-28",
      "2027-09-15",
      "2027-10-27",
      "2027-12-08",
    ],
    file: "data/fed-funds-rate.csv",
    type: "single",
    dailyLagDays: 3,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "14:00",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "CME_EXPECTED_POLICY_RATE",
    displayName: "CME Implied Policy Rate",
    shortName: "CME Implied Rate",
    sourceName: "CME FedWatch",
    sourceUrl: "https://www.cmegroup.com/fedwatch",
    sourceUrls: [
      {
        label: "CME FedWatch",
        url: "https://www.cmegroup.com/fedwatch",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Percent, probability-weighted target range upper limit",
    releaseNote:
      "Each observation is the probability-weighted upper limit expected for the next scheduled FOMC meeting at that time. The rolling series switches to the following meeting after an FOMC decision.",
    file: "data/cme-expected-policy-rate.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "18:00",
    sourceReleaseTimeZone: "America/Chicago",
  },
  {
    key: "DGS10",
    displayName: "US 10-Year Treasury Yield",
    shortName: "US 10Y Yield",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS10",
    sourceUrls: [{ label: "FRED DGS10", url: "https://fred.stlouisfed.org/series/DGS10" }],
    frequency: "Daily",
    unit: "Percent",
    file: "data/us-10-year-treasury-yield.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "DFII10",
    displayName: "US 10-Year Real Yield",
    shortName: "US 10Y Real Yield",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DFII10",
    sourceUrls: [{ label: "FRED DFII10", url: "https://fred.stlouisfed.org/series/DFII10" }],
    frequency: "Daily, US trading days",
    unit: "Percent",
    file: "data/us-10y-real-yield.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "T10YIE",
    displayName: "US 10-Year Breakeven Inflation Rate",
    shortName: "US 10Y Breakeven Inflation",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/T10YIE",
    sourceUrls: [{ label: "FRED T10YIE", url: "https://fred.stlouisfed.org/series/T10YIE" }],
    frequency: "Daily, US trading days",
    unit: "Percent",
    file: "data/us-10y-breakeven-inflation.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "ICSA",
    displayName: "US Initial Jobless Claims",
    shortName: "US Initial Claims",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/ICSA",
    sourceUrls: [{ label: "FRED ICSA", url: "https://fred.stlouisfed.org/series/ICSA" }],
    frequency: "Weekly, Thursday release",
    unit: "Claims",
    expectedReleaseDelayDays: 7,
    releaseNote: "Weekly initial unemployment-insurance claims. The observation date is the Saturday ending the reported week, not the Thursday release date.",
    file: "data/us-initial-jobless-claims.csv",
    type: "single",
  },
  {
    key: "DTWEXBGS",
    displayName: "Broad U.S. Dollar Index",
    shortName: "Broad U.S. Dollar Index",
    sourceName: "Federal Reserve Board via FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DTWEXBGS",
    sourceUrls: [{ label: "FRED DTWEXBGS", url: "https://fred.stlouisfed.org/series/DTWEXBGS" }],
    frequency: "Daily observations, weekly H.10 release",
    unit: "Index",
    file: "data/broad-us-dollar-index.csv",
    type: "single",
    expectedReleaseDelayDays: 10,
    releaseNote:
      "The Federal Reserve publishes these daily observations in a weekly H.10 batch, so the latest observation can remain several business days behind the calendar date while still matching the source.",
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "T10Y2Y",
    displayName: "US Treasury 10-Year Minus 2-Year Yield Spread",
    shortName: "10Y-2Y Spread",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/T10Y2Y",
    sourceUrls: [{ label: "FRED T10Y2Y", url: "https://fred.stlouisfed.org/series/T10Y2Y" }],
    frequency: "Daily",
    unit: "Percentage Points",
    file: "data/us-10y-minus-2y-spread.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
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
    unit: "Percent YoY",
    expectedReleaseDelayDays: 24,
    releaseNote: "Usually published during the third week of the following month.",
    file: "data/finra-margin-debt-yoy.csv",
    type: "single",
  },
  {
    key: "MOVE",
    displayName: "MOVE Index",
    shortName: "MOVE",
    sourceName: "Google Finance",
    sourceUrl: "https://www.google.com/finance/quote/MOVE:INDEXNYSEGIS",
    sourceUrls: [
      {
        label: "Google Finance MOVE:INDEXNYSEGIS",
        url: "https://www.google.com/finance/quote/MOVE:INDEXNYSEGIS",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Index",
    file: "data/move.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
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
    unit: "Millions of U.S. Dollars",
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
    unit: "Index",
    expectedReleaseDelayDays: 12,
    file: "data/nfci.csv",
    type: "single",
    dailyLagDays: 12,
  },
  {
    key: "ISM_MANUFACTURING_PMI",
    displayName: "ISM Manufacturing Purchasing Managers' Index",
    shortName: "ISM Manufacturing PMI",
    sourceName: "Institute for Supply Management via PR Newswire",
    sourceUrl:
      "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/",
    sourceUrls: [
      {
        label: "ISM Manufacturing PMI reports",
        url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/",
      },
      {
        label: "ISM releases on PR Newswire",
        url: "https://www.prnewswire.com/news/institute-for-supply-management/",
      },
    ],
    frequency: "Monthly",
    unit: "Diffusion Index",
    releaseNote:
      "Released on the first business day of the month at 10:00 a.m. ET. The updater parses the revised rolling 12-month table in ISM's latest official press release; no proxy or estimated values are used.",
    file: "data/ism-manufacturing-pmi.csv",
    type: "single",
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
    unit: "Index",
    file: "data/skew.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "RSP_SPY",
    displayName: "Invesco S&P 500 Equal Weight ETF / SPDR S&P 500 ETF Ratio",
    shortName: "RSP/SPY",
    sourceName: "Alpaca Market Data API",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Split-adjusted close ratio",
    formula: "RSP split-adjusted close / SPY split-adjusted close on matching trading dates",
    releaseNote:
      "Uses matching Alpaca IEX daily bars only; no forward fill or estimated values are used.",
    file: "data/rsp-spy.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "SPY_TLT",
    displayName: "SPDR S&P 500 ETF / iShares 20+ Year Treasury Bond ETF Ratio",
    shortName: "SPY/TLT",
    sourceName: "Alpaca Market Data API",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Split-adjusted close ratio",
    formula: "SPY split-adjusted close / TLT split-adjusted close on matching trading dates",
    releaseNote:
      "Uses matching Alpaca IEX daily bars only; no forward fill or estimated values are used.",
    file: "data/spy-tlt.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "XLY_XLP",
    displayName: "Consumer Discretionary Select Sector SPDR / Consumer Staples Select Sector SPDR Ratio",
    shortName: "XLY/XLP",
    sourceName: "Alpaca Market Data API",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Split-adjusted close ratio",
    formula: "XLY split-adjusted close / XLP split-adjusted close on matching trading dates",
    releaseNote:
      "Uses matching Alpaca IEX daily bars only; no forward fill or estimated values are used.",
    file: "data/xly-xlp.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "IWM_SPY",
    displayName: "iShares Russell 2000 ETF / SPDR S&P 500 ETF Ratio",
    shortName: "IWM/SPY",
    sourceName: "Alpaca Market Data API",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Split-adjusted close ratio",
    formula: "IWM split-adjusted close / SPY split-adjusted close on matching trading dates",
    releaseNote:
      "Uses matching Alpaca IEX daily bars only; no forward fill or estimated values are used.",
    file: "data/iwm-spy.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "SMH_SPY",
    displayName: "VanEck Semiconductor ETF / SPDR S&P 500 ETF Ratio",
    shortName: "SMH/SPY",
    sourceName: "Alpaca Market Data API",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
      {
        label: "Nasdaq historical archive bootstrap",
        url: "https://www.nasdaq.com/market-activity/etf/smh/historical",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Split-adjusted close ratio",
    formula: "SMH split-adjusted close / SPY split-adjusted close on matching trading dates",
    releaseNote:
      "The initial archive uses matching Nasdaq historical closes. New observations use matching Alpaca IEX daily bars only; no forward fill or estimated values are used.",
    file: "data/smh-spy.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "NEW_HIGH_LOW_BREADTH",
    displayName: "S&P 500 New High / New Low Breadth",
    shortName: "New High / New Low",
    sourceName: "Calculated from Alpaca Market Data API constituent prices",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
      {
        label: "S&P 500 constituent list",
        url: "https://github.com/datasets/s-and-p-500-companies",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Percent",
    formula:
      "(Stocks at a 252-trading-day high - stocks at a 252-trading-day low) / valid constituents * 100",
    releaseNote:
      "Current-constituent proxy refreshed after each US trading day. Historical membership changes are not reconstructed; at least 95% constituent coverage is required.",
    file: "data/new-high-low-breadth.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "SP500_ABOVE_200DMA",
    displayName: "S&P 500 Percent of Stocks Above 200-Day Moving Average",
    shortName: "% Above 200DMA (Proxy)",
    sourceName: "Calculated from Alpaca Market Data API constituent prices",
    sourceUrl: "https://docs.alpaca.markets/docs/about-market-data-api",
    sourceUrls: [
      {
        label: "Alpaca Market Data API",
        url: "https://docs.alpaca.markets/docs/about-market-data-api",
      },
      {
        label: "S&P 500 constituent list",
        url: "https://github.com/datasets/s-and-p-500-companies",
      },
    ],
    frequency: "Daily, US trading days",
    unit: "Percent",
    releaseNote:
      "Calculated from current S&P 500 constituents and refreshed after each US trading day. Historical membership changes are not reconstructed; at least 95% constituent coverage is required.",
    file: "data/sp500-above-200dma.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "17:15",
    sourceReleaseTimeZone: "America/New_York",
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
    unit: "Percent YoY",
    expectedReleaseDelayDays: 41,
    releaseNote:
      "Historical archive is parsed from MOPSOV single-company monthly operating revenue for TSMC 2330. The updater merges newly available months and keeps existing history if a source request fails.",
    file: "data/tsmc-revenue-yoy.csv",
    type: "single",
    dailyLagDays: 45,
  },
  {
    key: "DEXJPUS",
    displayName: "USD/JPY Exchange Rate",
    shortName: "USD/JPY",
    sourceName: "Google Finance",
    sourceUrl: "https://www.google.com/finance/quote/USD-JPY",
    sourceUrls: [
      { label: "Google Finance USD/JPY", url: "https://www.google.com/finance/quote/USD-JPY" },
    ],
    frequency: "Daily FX market quote",
    unit: "JPY per USD",
    releaseNote:
      "The latest Google Finance USD/JPY quote is merged into the existing historical archive; no complete-history download is repeated.",
    file: "data/usd-jpy.csv",
    type: "single",
    dailyLagDays: 3,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "08:15",
    sourceReleaseTimeZone: "Asia/Tokyo",
  },
  {
    key: "BOJ_POLICY_RATE",
    displayName: "Bank of Japan Policy Rate",
    shortName: "BOJ Policy Rate",
    sourceName: "BIS Central Bank Policy Rates / Bank of Japan",
    sourceUrl: "https://data.bis.org/topics/CBPOL/BIS%2CWS_CBPOL%2C1.0/D.JP",
    sourceUrls: [
      {
        label: "BIS Central Bank Policy Rates - Japan",
        url: "https://data.bis.org/topics/CBPOL/BIS%2CWS_CBPOL%2C1.0/D.JP",
      },
      {
        label: "BIS policy-rate methodology",
        url: "https://www.bis.org/statistics/cbpol/cbpol_doc.pdf",
      },
      {
        label: "Bank of Japan monetary policy decisions",
        url: "https://www.boj.or.jp/en/mopo/mpmdeci/index.htm",
      },
    ],
    frequency: "Daily observations, weekly BIS release",
    unit: "Percent per annum",
    expectedReleaseDelayDays: 9,
    releaseNote:
      "BIS long, spliced policy-rate series D.JP, compiled with the Bank of Japan. It uses the main policy target or instrument for each regime; target ranges are represented by their midpoint unless otherwise specified.",
    file: "data/boj-policy-rate.csv",
    type: "single",
    dailyLagDays: 12,
  },
  {
    key: "BOJ_OVERNIGHT_CALL_RATE",
    displayName: "Japan Uncollateralized Overnight Call Rate",
    shortName: "Japan Overnight Rate",
    sourceName: "Bank of Japan Time-Series Data Search",
    sourceUrl: "https://www.stat-search.boj.or.jp/index_en.html",
    sourceUrls: [
      {
        label: "BOJ Time-Series Data Search",
        url: "https://www.stat-search.boj.or.jp/index_en.html",
      },
      {
        label: "BOJ Call Money Market Data",
        url: "https://www.boj.or.jp/en/statistics/market/short/mutan/index.htm",
      },
    ],
    frequency: "Daily, Japan business days",
    unit: "Percent per annum",
    releaseNote:
      "Official FM01'STRDCLUCON daily average. This is the observed uncollateralized overnight market rate, not the BOJ policy target. Missing non-business days are not filled.",
    file: "data/japan-overnight-call-rate.csv",
    type: "single",
    dailyLagDays: 4,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "10:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
  },
  {
    key: "BOJ_IMPLIED_RATE_3M_TONA",
    displayName: "BOJ Implied Rate from 3-Month TONA Futures",
    shortName: "BOJ Implied Rate (3M TONA)",
    sourceName: "JPX settlement prices",
    sourceUrl: "https://www.jpx.co.jp/english/markets/derivatives/settlement-price/index.html",
    sourceUrls: [{ label: "JPX settlement prices", url: "https://www.jpx.co.jp/english/markets/derivatives/settlement-price/index.html" }],
    frequency: "Daily, Japan business days",
    unit: "Percent",
    releaseNote: "Calculated as 100 minus the settlement price of the nearest listed 3-Month TONA futures contract. It is a market-implied short-rate proxy, not an official BOJ policy-rate forecast.",
    file: "data/boj-implied-rate.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "16:45",
    sourceReleaseTimeZone: "Asia/Tokyo",
  },
  {
    key: "JAPAN_CORE_CPI_YOY",
    displayName: "Japan Core Consumer Price Index Year-over-Year",
    shortName: "Japan Core CPI YoY",
    sourceName: "Statistics Bureau of Japan",
    sourceUrl: "https://www.stat.go.jp/english/data/cpi/index.html",
    sourceUrls: [
      {
        label: "Statistics Bureau of Japan CPI",
        url: "https://www.stat.go.jp/english/data/cpi/index.html",
      },
      {
        label: "Official CPI release schedule",
        url: "https://www.stat.go.jp/english/data/cpi/1582.htm",
      },
    ],
    frequency: "Monthly",
    unit: "Percent YoY",
    expectedReleaseDelayDays: 52,
    releaseNote:
      "Official nationwide all-items CPI excluding fresh food. The updater reads the published year-over-year series directly and merges the 2020-base and 2025-base files without interpolation.",
    file: "data/japan-core-cpi-yoy.csv",
    type: "single",
  },
  {
    key: "TOKYO_CORE_CPI_YOY",
    displayName: "Tokyo Ku-area Core Consumer Price Index Year-over-Year",
    shortName: "Tokyo Core CPI YoY",
    sourceName: "Statistics Bureau of Japan",
    sourceUrl: "https://www.stat.go.jp/english/data/cpi/index.html",
    sourceUrls: [
      {
        label: "Statistics Bureau of Japan CPI",
        url: "https://www.stat.go.jp/english/data/cpi/index.html",
      },
      {
        label: "Official CPI release schedule",
        url: "https://www.stat.go.jp/english/data/cpi/1582.htm",
      },
    ],
    frequency: "Monthly preliminary",
    unit: "Percent YoY",
    expectedReleaseDelayDays: 31,
    releaseNote:
      "Official Ku-area of Tokyo all-items CPI excluding fresh food. It is normally published before the nationwide CPI. No interpolation or forward fill is used.",
    file: "data/tokyo-core-cpi-yoy.csv",
    type: "single",
  },
  {
    key: "JAPAN_CASH_EARNINGS_YOY",
    displayName: "Japan Total Cash Earnings Year-over-Year",
    shortName: "Japan Cash Earnings YoY",
    sourceName: "Japan Ministry of Health, Labour and Welfare",
    sourceUrl: "https://www.mhlw.go.jp/toukei/list/30-1a.html",
    sourceUrls: [{ label: "MHLW Monthly Labour Survey", url: "https://www.mhlw.go.jp/toukei/list/30-1a.html" }],
    frequency: "Monthly preliminary, revised by final release",
    unit: "Percent YoY",
    expectedReleaseDelayDays: 68,
    releaseNote: "Nationwide total cash earnings, establishments with five or more employees. The latest preliminary observation is retained until the official final workbook for the same month is published, then replaced by the revised value.",
    file: "data/japan-cash-earnings-yoy.csv",
    type: "single",
  },
  {
    key: "DGS2",
    displayName: "US 2-Year Treasury Yield",
    shortName: "US 2Y Yield",
    sourceName: "FRED",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS2",
    sourceUrls: [{ label: "FRED DGS2", url: "https://fred.stlouisfed.org/series/DGS2" }],
    frequency: "Daily",
    unit: "Percent",
    file: "data/us-2-year-treasury-yield.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
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
    unit: "Percent",
    file: "data/japan-2-year-jgb-yield.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "10:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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
    unit: "Percentage Points",
    file: "data/fx.csv",
    type: "fx",
    column: "US_Japan_2Y_Spread",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "16:15",
    sourceReleaseTimeZone: "America/New_York",
  },
  {
    key: "CFTC_JPY_SPECULATIVE_NET_POSITIONS",
    displayName: "CFTC JPY Speculative Net Positions",
    shortName: "CFTC JPY Speculative Net Positions",
    sourceName: "CFTC Legacy Futures Only",
    sourceUrl: "https://publicreporting.cftc.gov/Commitments-of-Traders/Legacy-Futures-Only/6dca-aqww",
    sourceUrls: [
      {
        label: "CFTC Legacy Futures Only",
        url: "https://publicreporting.cftc.gov/Commitments-of-Traders/Legacy-Futures-Only/6dca-aqww",
      },
      {
        label: "CFTC Public Reporting API",
        url: "https://publicreporting.cftc.gov/resource/6dca-aqww.json",
      },
    ],
    frequency: "Weekly, Friday release",
    unit: "Contracts",
    expectedReleaseDelayDays: 10,
    releaseNote:
      "CFTC Legacy Futures Only report for CME Japanese Yen futures (contract 097741). Net speculative positions are non-commercial long contracts minus non-commercial short contracts. The report date is Tuesday and the report is normally published Friday; no forward fill is used.",
    file: "data/cftc-jpy-speculative-net-positions.csv",
    type: "single",
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
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "10:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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
    sourceReleaseBusinessDays: 1,
    sourceReleaseTime: "10:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
  },
  {
    key: "NIKKEI_225",
    displayName: "Nikkei 225",
    shortName: "Nikkei 225",
    sourceName: "Nikkei Indexes",
    sourceUrl: "https://indexes.nikkei.co.jp/en/nkave/index/profile",
    sourceUrls: [
      {
        label: "Nikkei 225 official index page",
        url: "https://indexes.nikkei.co.jp/en/nkave/index/profile",
      },
      {
        label: "Nikkei 225 official daily CSV",
        url: "https://indexes.nikkei.co.jp/nkave/historical/nikkei_stock_average_daily_en.csv",
      },
    ],
    frequency: "Daily, Japan trading days",
    unit: "Index",
    file: "data/nikkei-225.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "16:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
  },
  {
    key: "TOPIX",
    displayName: "TOPIX",
    shortName: "TOPIX",
    sourceName: "Japan Exchange Group",
    sourceUrl: "https://www.jpx.co.jp/english/markets/statistics-equities/monthly/",
    sourceUrls: [
      { label: "JPX monthly statistics", url: "https://www.jpx.co.jp/english/markets/statistics-equities/monthly/" },
      { label: "JPX official current index values", url: "https://www.jpx.co.jp/english/markets/indices/realvalues/" },
      { label: "JPX TOPIX definition", url: "https://www.jpx.co.jp/english/markets/indices/topix/" },
    ],
    frequency: "Daily, Japan trading days",
    unit: "Index",
    releaseNote: "Official daily closes are parsed from JPX monthly statistics PDFs; the latest close is read from JPX's official current-index file.",
    file: "data/topix.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "18:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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
    sourceName: "Taiwan Stock Exchange",
    sourceUrl: "https://www.twse.com.tw/en/indices/taiex/mi-5min-hist.html",
    sourceUrls: [
      {
        label: "TWSE TAIEX historical data",
        url: "https://www.twse.com.tw/en/indices/taiex/mi-5min-hist.html",
      },
    ],
    frequency: "Daily, Taiwan trading days",
    unit: "Index",
    file: "data/taiex.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "18:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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
    releaseNote:
      "FinMind provides the TWSE-derived bulk history; recent dates are overwritten by official TWSE BFI82U values. Historical BFI82U responses are accepted only when the response date matches the requested dayDate.",
    file: "data/taiwan-foreign-investor-net-buying.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "18:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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
    sourceName: "Central Bank of the Republic of China (Taiwan)",
    sourceUrl: "https://data.gov.tw/dataset/7232",
    sourceUrls: [
      { label: "Taiwan central bank daily exchange rates", url: "https://data.gov.tw/dataset/7232" },
      { label: "Official OpenData API", url: "https://cpx.cbc.gov.tw/api/OpenData/FTDOpenData_Day" },
    ],
    frequency: "Daily forex trading days",
    unit: "TWD per USD",
    releaseNote:
      "Definition: 1 USD = X TWD. The existing pre-2008 archive is retained; official daily interbank closing rates take priority from 2008 onward.",
    file: "data/usdtwd.csv",
    type: "single",
    dailyLagDays: 4,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "18:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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
    releaseNote:
      "FinMind provides TWSE-derived bulk history; recent official TWSE values take priority. Two isolated historical source errors are replaced with values verified in official TWSE daily reports. YoY uses the latest prior-year trading observation within seven days.",
    file: "data/taiwan-margin-financing-balance-yoy.csv",
    type: "single",
    dailyLagDays: 5,
    sourceReleaseBusinessDays: 0,
    sourceReleaseTime: "18:00",
    sourceReleaseTimeZone: "Asia/Tokyo",
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

function nextWeeklyRefreshDate(dateText, weekday) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 7);

  while (date.getUTCDay() !== weekday) {
    date.setUTCDate(date.getUTCDate() + 1);
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

  if (Array.isArray(definition.scheduledUpdateDates)) {
    return definition.scheduledUpdateDates.find((date) => date > latestAvailableDate) || null;
  }

  if (Number.isInteger(definition.expectedReleaseDelayDays)) {
    return addDays(latestAvailableDate, definition.expectedReleaseDelayDays);
  }

  if (Number.isInteger(definition.weeklyRefreshWeekday)) {
    return nextWeeklyRefreshDate(latestAvailableDate, definition.weeklyRefreshWeekday);
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

function zonedDateTimeToIso(dateText, timeText, timeZone) {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hour, minute] = timeText.split(":").map(Number);
  const intendedUtc = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(intendedUtc))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  const representedUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  const zoneOffset = representedUtc - intendedUtc;

  return new Date(intendedUtc - zoneOffset).toISOString();
}

function calculateExpectedSourceUpdate(definition, nextExpectedObservation) {
  if (!nextExpectedObservation || !Number.isInteger(definition.sourceReleaseBusinessDays)) {
    return null;
  }

  const sourceDate = addBusinessDays(
    nextExpectedObservation,
    definition.sourceReleaseBusinessDays,
  );
  return zonedDateTimeToIso(
    sourceDate,
    definition.sourceReleaseTime || "00:00",
    definition.sourceReleaseTimeZone || "UTC",
  );
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
  dashboardLatestDate,
  sourceAvailableDate,
  sourceAvailableCheckedAt,
  sourceCheckStatus,
  finishedAt,
) {
  if (definition.statusOverride) {
    return definition.statusOverride;
  }

  if (!dashboardLatestDate) {
    return "Failed";
  }

  if (sourceAvailableDate && dashboardLatestDate < sourceAvailableDate) {
    return "Failed";
  }

  const todayText = finishedAt.slice(0, 10);
  const nextExpectedUpdate = calculateNextExpectedUpdate(definition, dashboardLatestDate);
  if (nextExpectedUpdate) {
    const expectedSourceUpdate = calculateExpectedSourceUpdate(
      definition,
      nextExpectedUpdate,
    );

    if (expectedSourceUpdate) {
      if (Date.parse(finishedAt) < Date.parse(expectedSourceUpdate)) {
        return "Up to date";
      }

      if (
        sourceAvailableCheckedAt &&
        Date.parse(sourceAvailableCheckedAt) >= Date.parse(expectedSourceUpdate)
      ) {
        return "Up to date";
      }

      return sourceCheckStatus === "failed" ? "Failed" : "Update not run";
    }

    const sourceAvailableCheckedDate = sourceAvailableCheckedAt?.slice(0, 10) || "";

    if (nextExpectedUpdate >= todayText) {
      return "Up to date";
    }

    if (
      sourceAvailableCheckedDate &&
      sourceAvailableCheckedDate >= nextExpectedUpdate
    ) {
      return "Up to date";
    }

    return sourceCheckStatus === "failed" ? "Failed" : "Update not run";
  }

  const lagDays = dateDiffDays(dashboardLatestDate, todayText);
  const fallbackLagDays = definition.dailyLagDays ?? definition.expectedReleaseDelayDays ?? 5;
  if (lagDays <= fallbackLagDays) {
    return "Up to date";
  }

  return sourceCheckStatus === "failed" ? "Failed" : "Update not run";
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
  const hasUpdateResults = Object.keys(updateResults).length > 0;
  const indicators = {};
  let fedWatchExpectation = null;
  try {
    fedWatchExpectation = JSON.parse(
      fs.readFileSync(path.join("data", "fedwatch-expected-rate.json"), "utf8"),
    );
  } catch {
    fedWatchExpectation = null;
  }

  for (const definition of indicatorDefinitions) {
    const updateResult = updateResults[definition.key] || updateResults[definition.file] || null;
    const previousIndicator = previousMetadata.indicators?.[definition.key] || null;
    let latestAvailableDate = null;
    let errorMessage =
      updateResult?.error_message || (!updateResult ? previousIndicator?.error_message : null) || null;

    try {
      latestAvailableDate = getLatestAvailableDate(definition);
    } catch (error) {
      errorMessage = error.message;
    }

    const nextExpectedUpdate = calculateNextExpectedUpdate(definition, latestAvailableDate);
    const expectedSourceUpdate = calculateExpectedSourceUpdate(
      definition,
      nextExpectedUpdate,
    );
    let lastSuccessfulRefresh = previousIndicator?.last_successful_refresh || null;
    let sourceCheckedAt = previousIndicator?.source_checked_at || null;
    let sourceCheckStatus = previousIndicator?.source_check_status || null;
    let sourceAvailableDate =
      previousIndicator?.source_available_date ||
      previousIndicator?.dashboard_latest_date ||
      previousIndicator?.latest_available_date ||
      null;
    let sourceAvailableCheckedAt =
      previousIndicator?.source_available_checked_at ||
      previousIndicator?.last_successful_refresh ||
      null;
    if (definition.key === "CME_EXPECTED_POLICY_RATE" && fedWatchExpectation) {
      sourceCheckedAt =
        fedWatchExpectation.source_checked_at || sourceCheckedAt;
      sourceAvailableCheckedAt =
        fedWatchExpectation.source_checked_at || sourceAvailableCheckedAt;
      sourceAvailableDate =
        fedWatchExpectation.observation_date || sourceAvailableDate;
      sourceCheckStatus = "success";
      lastSuccessfulRefresh =
        fedWatchExpectation.source_checked_at || lastSuccessfulRefresh;
    }
    if (!sourceCheckStatus && sourceAvailableCheckedAt) {
      sourceCheckStatus = "success";
    }

    if (["success", "source_lag"].includes(updateResult?.status)) {
      const successfulCheckAt = updateResult?.source_checked_at || finishedAt;
      lastSuccessfulRefresh =
        updateResult?.last_successful_refresh || successfulCheckAt;
      sourceCheckedAt = successfulCheckAt;
      sourceCheckStatus = "success";
      sourceAvailableDate = latestAvailableDate;
      sourceAvailableCheckedAt = successfulCheckAt;
      errorMessage = null;
    } else if (updateResult?.status) {
      sourceCheckStatus = updateResult.status;
      if (updateResult?.source_checked_at) {
        sourceCheckedAt = updateResult.source_checked_at;
      }
    }

    const status = calculateStatus(
      definition,
      latestAvailableDate,
      sourceAvailableDate,
      sourceAvailableCheckedAt,
      sourceCheckStatus,
      finishedAt,
    );

    indicators[definition.key] = {
      display_name: definition.displayName,
      short_name: definition.shortName,
      source_name: definition.sourceName,
      source_url: definition.sourceUrl,
      source_urls: definition.sourceUrls,
      latest_available_date: latestAvailableDate,
      dashboard_latest_date: latestAvailableDate,
      source_available_date: sourceAvailableDate,
      next_expected_update_date: nextExpectedUpdate,
      next_expected_observation_date: nextExpectedUpdate,
      expected_source_update_at: expectedSourceUpdate,
      expected_source_update_date: expectedSourceUpdate
        ? formatJstDisplay(expectedSourceUpdate).slice(0, 10)
        : null,
      expected_source_update_display: formatJstDisplay(expectedSourceUpdate),
      source_checked_at: sourceCheckedAt,
      source_checked_display: formatJstDisplay(sourceCheckedAt),
      source_check_status: sourceCheckStatus,
      source_available_checked_at: sourceAvailableCheckedAt,
      source_available_checked_display: formatJstDisplay(sourceAvailableCheckedAt),
      last_successful_refresh: lastSuccessfulRefresh,
      last_successful_refresh_display: formatJstDisplay(lastSuccessfulRefresh),
      frequency: definition.frequency,
      unit: definition.unit || null,
      status,
      error_message: errorMessage,
      formula: definition.formula || null,
      release_note: definition.releaseNote || null,
      ...(definition.key === "CME_EXPECTED_POLICY_RATE" && fedWatchExpectation
        ? {
            next_fomc_meeting_date: fedWatchExpectation.meeting_date,
            calculation_basis: fedWatchExpectation.method,
          }
        : {}),
    };
  }

  return {
    last_dashboard_refresh: hasUpdateResults
      ? finishedAt
      : previousMetadata.last_dashboard_refresh || finishedAt,
    last_dashboard_refresh_display: formatJstDisplay(
      hasUpdateResults ? finishedAt : previousMetadata.last_dashboard_refresh || finishedAt,
    ),
    update_duration_seconds: hasUpdateResults
      ? updateDurationSeconds
      : previousMetadata.update_duration_seconds ?? updateDurationSeconds,
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
