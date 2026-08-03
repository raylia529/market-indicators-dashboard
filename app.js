const maxStartDate = "1997-01-01";

const indicators = [
  {
    id: "sp500",
    name: "S&P 500",
    file: "data/sp500.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
  },
  {
    id: "high-yield-oas",
    name: "HY OAS",
    file: "data/hy_oas.csv",
    unitLabel: "Percentage Points",
    valueSuffix: " pp",
    category: "spread",
    color: "#f97316",
    decimals: 2,
  },
  {
    id: "hyg-ief",
    name: "HYG/IEF",
    file: "data/hyg-ief.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#06b6d4",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "vix",
    name: "VIX",
    file: "data/vix.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "volatility",
    color: "#ef4444",
    decimals: 2,
  },
  {
    id: "move",
    name: "MOVE Index",
    file: "data/move.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "volatility",
    color: "#ec4899",
    decimals: 2,
  },
  {
    id: "skew",
    name: "SKEW Index",
    file: "data/skew.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "volatility",
    color: "#111827",
    decimals: 2,
  },
  {
    id: "margin-debt-yoy",
    name: "Margin Debt YoY",
    file: "data/finra-margin-debt-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#10b981",
    decimals: 1,
    cadence: "monthly",
  },
  {
    id: "fed-balance-sheet",
    name: "Fed Balance Sheet",
    file: "data/fed-balance-sheet.csv",
    unitLabel: "USD bn",
    valueSuffix: "",
    category: "balance-sheet",
    color: "#64748b",
    decimals: 0,
    cadence: "weekly",
    displayDivisor: 1000,
    displayDecimals: 1,
    displaySuffix: "bn",
  },
  {
    id: "nfci",
    name: "NFCI",
    file: "data/nfci.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "financial-conditions",
    color: "#b45309",
    decimals: 3,
    cadence: "weekly",
  },
  {
    id: "ism-manufacturing-pmi",
    name: "ISM Manufacturing PMI",
    file: "data/ism-manufacturing-pmi.csv",
    unitLabel: "Diffusion Index",
    valueSuffix: "",
    category: "index",
    axisBounds: { min: 0, max: 100 },
    color: "#4f46e5",
    decimals: 1,
    cadence: "monthly",
    changeFormat: "points",
  },
];

const breadthIndicators = [
  {
    id: "breadth-sp500",
    name: "S&P 500",
    file: "data/sp500.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
  },
  {
    id: "rsp-spy",
    name: "RSP/SPY",
    file: "data/rsp-spy.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#10b981",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "new-high-low-breadth",
    name: "New High / New Low",
    file: "data/new-high-low-breadth.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "percentage",
    axisBounds: { min: -100, max: 100 },
    color: "#6559bd",
    decimals: 1,
  },
  {
    id: "sp500-above-200dma",
    name: "% Above 200DMA (Proxy)",
    file: "data/sp500-above-200dma.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "percentage",
    axisBounds: { min: 0, max: 100 },
    color: "#f97316",
    decimals: 1,
  },
];

const flowsIndicators = [
  {
    id: "flows-rsp-spy",
    name: "RSP/SPY",
    descriptor: "Market Breadth",
    file: "data/rsp-spy.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#d77d32",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "flows-hyg-ief",
    name: "HYG/IEF",
    descriptor: "Credit Risk",
    file: "data/hyg-ief.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#218c83",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "spy-tlt",
    name: "SPY/TLT",
    descriptor: "Stocks vs Bonds",
    file: "data/spy-tlt.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#3f6fcb",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "xly-xlp",
    name: "XLY/XLP",
    descriptor: "Cyclical vs Defensive",
    file: "data/xly-xlp.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#9254aa",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "iwm-spy",
    name: "IWM/SPY",
    descriptor: "Risk Appetite",
    file: "data/iwm-spy.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#d44d5c",
    decimals: 4,
    changeFormat: "percent",
  },
  {
    id: "smh-spy",
    name: "SMH/SPY",
    descriptor: "Semiconductor Leadership",
    file: "data/smh-spy.csv",
    unitLabel: "Ratio",
    valueSuffix: "",
    category: "ratio",
    color: "#2b83ae",
    decimals: 4,
    changeFormat: "percent",
  },
];

const usRatesIndicators = [
  {
    id: "fed-funds-rate",
    name: "Fed Funds Rate",
    file: "data/fed-funds-rate.csv",
    unitLabel: "%",
    valueSuffix: "%",
    category: "rate",
    color: "#d77d32",
    decimals: 2,
    cadence: "policy",
    changeFormat: "bps",
    lineShape: "hv",
  },
  {
    id: "cme-expected-policy-rate",
    name: "CME Implied Rate",
    file: "data/cme-expected-policy-rate.csv",
    unitLabel: "%",
    valueSuffix: "%",
    category: "rate",
    color: "#9254aa",
    decimals: 2,
    changeFormat: "bps",
    lineShape: "hv",
  },
  {
    id: "us-2y-yield",
    name: "US 2Y Yield",
    file: "data/us-2-year-treasury-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#2563eb",
    decimals: 2,
  },
  {
    id: "us-rates-10y-yield",
    name: "US 10Y Yield",
    file: "data/us-10-year-treasury-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#14b8a6",
    decimals: 2,
  },
  {
    id: "us-rates-10y-2y-spread",
    name: "10Y-2Y Spread",
    file: "data/us-10y-minus-2y-spread.csv",
    unitLabel: "Percentage Points",
    valueSuffix: " pp",
    category: "spread",
    color: "#8b5cf6",
    decimals: 2,
  },
  {
    id: "us-10y-real-yield",
    name: "US 10Y Real Yield",
    file: "data/us-10y-real-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#0f766e",
    decimals: 2,
  },
  {
    id: "us-10y-breakeven-inflation",
    name: "US 10Y Breakeven Inflation",
    file: "data/us-10y-breakeven-inflation.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#b45309",
    decimals: 2,
  },
  {
    id: "us-rates-move",
    name: "MOVE Index",
    file: "data/move.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "volatility",
    color: "#ec4899",
    decimals: 2,
  },
  {
    id: "us-10y-term-premium",
    name: "US 10-Year Treasury Term Premium",
    file: "data/us-10y-term-premium.csv",
    unitLabel: "Percentage Points",
    valueSuffix: " pp",
    category: "spread",
    color: "#f97316",
    decimals: 2,
  },
  {
    id: "us-initial-jobless-claims",
    name: "US Initial Jobless Claims",
    file: "data/us-initial-jobless-claims.csv",
    unitLabel: "Claims",
    valueSuffix: "",
    category: "flow",
    color: "#be185d",
    decimals: 0,
    cadence: "weekly",
  },
];

const jpRatesIndicators = [
  {
    id: "boj-policy-rate",
    name: "BOJ Policy Rate",
    file: "data/boj-policy-rate.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#111827",
    decimals: 2,
    cadence: "policy",
    lineShape: "hv",
  },
  {
    id: "boj-implied-rate",
    name: "BOJ Implied Rate",
    file: "data/boj-implied-rate.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#9f1239",
    decimals: 3,
  },
  {
    id: "japan-overnight-call-rate",
    name: "Japan Overnight Call Rate",
    file: "data/japan-overnight-call-rate.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#d77d32",
    decimals: 3,
  },
  {
    id: "japan-2y-jgb-yield",
    name: "Japan 2-Year JGB Yield",
    file: "data/japan-2-year-jgb-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#2563eb",
    decimals: 3,
  },
  {
    id: "japan-10y-jgb-yield",
    name: "Japan 10-Year JGB Yield",
    file: "data/japan-10-year-jgb-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#14b8a6",
    decimals: 3,
  },
  {
    id: "japan-10y-2y-jgb-spread",
    name: "Japan 10-Year Minus 2-Year JGB Yield Spread",
    file: "data/japan-10y-minus-2y-spread.csv",
    unitLabel: "Percentage Points",
    valueSuffix: " pp",
    category: "spread",
    color: "#8b5cf6",
    decimals: 3,
  },
  {
    id: "japan-cash-earnings-yoy",
    name: "Japan Cash Earnings YoY",
    file: "data/japan-cash-earnings-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#15803d",
    decimals: 1,
    cadence: "monthly",
  },
  {
    id: "japan-core-cpi-yoy",
    name: "Japan Core CPI YoY",
    file: "data/japan-core-cpi-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#9254aa",
    decimals: 1,
    cadence: "monthly",
  },
  {
    id: "tokyo-core-cpi-yoy",
    name: "Tokyo Core CPI YoY",
    file: "data/tokyo-core-cpi-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#218c83",
    decimals: 1,
    cadence: "monthly",
  },
];

const japanIndicators = [
  {
    id: "topix",
    name: "TOPIX",
    file: "data/topix.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#64748b",
    decimals: 2,
  },
  {
    id: "nikkei-225",
    name: "Nikkei 225",
    file: "data/nikkei-225.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
  },
  {
    id: "japan-foreign-investor-net-buying",
    name: "Foreign Investors Net Buying of Japanese Equities",
    file: "data/japan-foreign-investor-net-buying.csv",
    unitLabel: "JPY bn",
    valueSuffix: "",
    category: "flow",
    color: "#10b981",
    decimals: 1,
    cadence: "weekly",
    displayDecimals: 1,
    displaySuffix: "bn",
  },
  {
    id: "japan-tab-usdjpy",
    name: "USD/JPY",
    file: "data/usd-jpy.csv",
    unitLabel: "JPY per USD",
    valueSuffix: "",
    category: "currency",
    color: "#f97316",
    decimals: 2,
  },
  {
    id: "japan-tab-10y-jgb-yield",
    name: "Japan 10-Year JGB Yield",
    file: "data/japan-10-year-jgb-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#14b8a6",
    decimals: 3,
  },
];

const taiwanIndicators = [
  {
    id: "taiex",
    name: "TAIEX",
    file: "data/taiex.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
  },
  {
    id: "taiwan-tsmc-revenue-yoy",
    name: "TSMC Revenue YoY",
    file: "data/tsmc-revenue-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#14b8a6",
    decimals: 1,
    cadence: "monthly",
  },
  {
    id: "taiwan-foreign-investor-net-buying",
    name: "Foreign Investors Net Buying of Taiwan Equities",
    file: "data/taiwan-foreign-investor-net-buying.csv",
    unitLabel: "TWD bn",
    valueSuffix: "",
    category: "flow",
    color: "#10b981",
    decimals: 0,
    displayDivisor: 1000,
    displayDecimals: 1,
    displaySuffix: "bn",
  },
  {
    id: "usdtwd",
    name: "USD/TWD",
    file: "data/usdtwd.csv",
    unitLabel: "TWD per USD",
    valueSuffix: "",
    category: "currency",
    color: "#8b5cf6",
    decimals: 2,
  },
  {
    id: "taiwan-margin-financing-balance-yoy",
    name: "Taiwan Margin Financing Balance YoY",
    file: "data/taiwan-margin-financing-balance-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#ec4899",
    decimals: 1,
  },
  {
    id: "taiwan-electronics-exports-yoy",
    name: "Taiwan Electronics Exports YoY",
    file: "data/taiwan-electronics-exports-yoy.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#f97316",
    decimals: 1,
    cadence: "monthly",
  },
];

const indicatorColorAliases = {
  "breadth-sp500": "sp500",
  "flows-rsp-spy": "rsp-spy",
  "flows-hyg-ief": "hyg-ief",
  "us-rates-move": "move",
  "japan-tab-usdjpy": "USDJPY",
  "japan-tab-10y-jgb-yield": "japan-10y-jgb-yield",
  "taiwan-tsmc-revenue-yoy": "tsmc-revenue-yoy",
};

const defaultIndicatorColors = {
  sp500: "#111111",
  "high-yield-oas": "#d84b63",
  "hyg-ief": "#4f78c9",
  vix: "#ff3cac",
  move: "#00d9ff",
  skew: "#c0a34e",
  "margin-debt-yoy": "#39ff88",
  "fed-balance-sheet": "#945bb0",
  nfci: "#e87952",
  "ism-manufacturing-pmi": "#46b9c9",
  "rsp-spy": "#dc944b",
  "spy-tlt": "#6a61b7",
  "xly-xlp": "#945bb0",
  "iwm-spy": "#d84b63",
  "smh-spy": "#39ff88",
  "new-high-low-breadth": "#945bb0",
  "sp500-above-200dma": "#39ff88",
  "fed-funds-rate": "#dc944b",
  "cme-expected-policy-rate": "#945bb0",
  "us-2y-yield": "#46b9c9",
  "us-rates-10y-yield": "#2a9d8f",
  "us-rates-10y-2y-spread": "#e87952",
  "us-10y-real-yield": "#65b779",
  "us-10y-breakeven-inflation": "#c0a34e",
  "us-10y-term-premium": "#6a61b7",
  "us-initial-jobless-claims": "#ff3cac",
  "boj-policy-rate": "#111111",
  "japan-overnight-call-rate": "#dc944b",
  "boj-implied-rate": "#d84b63",
  "japan-2y-jgb-yield": "#46b9c9",
  "japan-10y-jgb-yield": "#2a9d8f",
  "japan-10y-2y-jgb-spread": "#6a61b7",
  "japan-core-cpi-yoy": "#c0a34e",
  "tokyo-core-cpi-yoy": "#ff3cac",
  "japan-cash-earnings-yoy": "#65b779",
  BROAD_US_DOLLAR_INDEX: "#6a61b7",
  USDJPY: "#dc944b",
  US_Japan_2Y_Spread: "#4f78c9",
  CFTC_JPY_SPECULATIVE_NET_POSITIONS: "#65b779",
  topix: "#46b9c9",
  "nikkei-225": "#945bb0",
  "tsmc-revenue-yoy": "#2a9d8f",
  "taiwan-foreign-investor-net-buying": "#39ff88",
  usdtwd: "#945bb0",
  "taiwan-margin-financing-balance-yoy": "#ff3cac",
  "taiwan-electronics-exports-yoy": "#dc944b",
};

function getIndicatorColorKey(id) {
  return indicatorColorAliases[id] || id;
}

[
  ...indicators,
  ...breadthIndicators,
  ...flowsIndicators,
  ...usRatesIndicators,
  ...jpRatesIndicators,
  ...japanIndicators,
  ...taiwanIndicators,
].forEach((indicator) => {
  indicator.color = defaultIndicatorColors[getIndicatorColorKey(indicator.id)] || indicator.color;
});

const colorPalette = [
  "#111111",
  "#d84b63",
  "#e87952",
  "#dc944b",
  "#c0a34e",
  "#a0ad51",
  "#65b779",
  "#39ff88",
  "#2a9d8f",
  "#46b9c9",
  "#00d9ff",
  "#4f78c9",
  "#6a61b7",
  "#945bb0",
  "#ff3cac",
];

const fxSeriesDefinitions = [
  {
    id: "USDJPY",
    name: "USD/JPY",
    unitLabel: "JPY per USD",
    field: "USDJPY",
    valueElementId: "fx-usdjpy-value",
    changeElementId: "fx-usdjpy-change",
    category: "currency",
    changeIndicatorId: "japan-tab-usdjpy",
    decimals: 2,
    suffix: "",
  },
  {
    id: "US_Japan_2Y_Spread",
    name: "US-JP 2Y Spread",
    unitLabel: "Percentage Points",
    field: "US_Japan_2Y_Spread",
    valueElementId: "fx-spread-value",
    changeElementId: "fx-spread-change",
    category: "spread",
    changeIndicatorId: "us-japan-2y-spread",
    decimals: 2,
    suffix: " pp",
  },
  {
    id: "BROAD_US_DOLLAR_INDEX",
    name: "Broad U.S. Dollar Index",
    unitLabel: "Index",
    field: "BROAD_US_DOLLAR_INDEX",
    valueElementId: "fx-broad-dollar-value",
    changeElementId: "fx-broad-dollar-change",
    category: "price",
    changeIndicatorId: "broad-us-dollar-index",
    decimals: 2,
    suffix: "",
  },
  {
    id: "CFTC_JPY_SPECULATIVE_NET_POSITIONS",
    name: "CFTC JPY Speculative Net Positions",
    unitLabel: "k",
    field: "CFTC_JPY_SPECULATIVE_NET_POSITIONS",
    valueElementId: "fx-cftc-jpy-value",
    changeElementId: "fx-cftc-jpy-change",
    category: "flow",
    cadence: "weekly",
    changeIndicatorId: "cftc-jpy-speculative-net-positions",
    decimals: 1,
    displayDivisor: 1000,
    displayDecimals: 1,
    displaySuffix: "k",
    suffix: "",
  },
];

function usesPercentageAxis(indicator) {
  return (
    indicator?.category === "percentage" ||
    indicator?.category === "rate" ||
    ["%", "Percent", "Percent YoY"].includes(indicator?.unitLabel)
  );
}

function getAxisGroups(ids, getDefinition) {
  const percentageIds = ids.filter((id) => usesPercentageAxis(getDefinition(id)));
  const otherIds = ids.filter((id) => !percentageIds.includes(id));

  if (percentageIds.length === 0 && otherIds.length === 2) {
    return { leftIds: [otherIds[0]], rightIds: [otherIds[1]] };
  }

  return { leftIds: otherIds, rightIds: percentageIds };
}

function canShareComparisonAxes(ids, getDefinition) {
  const percentageCount = ids.filter((id) => usesPercentageAxis(getDefinition(id))).length;
  const otherCount = ids.length - percentageCount;

  return otherCount <= 1 || (percentageCount === 0 && otherCount <= 2);
}

function comparisonLimitMessage() {
  return "Percentage series share the right axis. Compare them with one non-percentage series, or compare two non-percentage series.";
}

function combineRows(ids, getRows) {
  return ids.flatMap((id) => getRows(id));
}

const indicatorGlossaryIds = {
  sp500: "SP500",
  "breadth-sp500": "SP500",
  "high-yield-oas": "BAMLH0A0HYM2",
  "hyg-ief": "HYG_IEF",
  "flows-hyg-ief": "HYG_IEF",
  vix: "VIXCLS",
  move: "MOVE",
  "us-rates-move": "MOVE",
  skew: "SKEW",
  "margin-debt-yoy": "FINRA_MARGIN_DEBT_YOY",
  "fed-balance-sheet": "WALCL",
  nfci: "NFCI",
  "ism-manufacturing-pmi": "ISM_MANUFACTURING_PMI",
  "rsp-spy": "RSP_SPY",
  "flows-rsp-spy": "RSP_SPY",
  "new-high-low-breadth": "NEW_HIGH_LOW_BREADTH",
  "sp500-above-200dma": "SP500_ABOVE_200DMA",
  "spy-tlt": "SPY_TLT",
  "xly-xlp": "XLY_XLP",
  "iwm-spy": "IWM_SPY",
  "smh-spy": "SMH_SPY",
  "taiwan-tsmc-revenue-yoy": "TSMC_REVENUE_YOY",
  "fed-funds-rate": "DFEDTARU",
  "cme-expected-policy-rate": "CME_EXPECTED_POLICY_RATE",
  "us-2y-yield": "DGS2",
  "us-rates-10y-yield": "DGS10",
  "us-10y-real-yield": "DFII10",
  "us-10y-breakeven-inflation": "T10YIE",
  "us-rates-10y-2y-spread": "T10Y2Y",
  "us-10y-term-premium": "ACMTP10",
  "us-initial-jobless-claims": "ICSA",
  "boj-policy-rate": "BOJ_POLICY_RATE",
  "japan-overnight-call-rate": "BOJ_OVERNIGHT_CALL_RATE",
  "boj-implied-rate": "BOJ_IMPLIED_RATE_3M_TONA",
  "japan-2y-jgb-yield": "JAPAN_2Y_JGB",
  "japan-10y-jgb-yield": "JAPAN_10Y_JGB",
  "japan-tab-10y-jgb-yield": "JAPAN_10Y_JGB",
  "japan-10y-2y-jgb-spread": "JAPAN_10Y_2Y_SPREAD",
  "japan-core-cpi-yoy": "JAPAN_CORE_CPI_YOY",
  "tokyo-core-cpi-yoy": "TOKYO_CORE_CPI_YOY",
  "japan-cash-earnings-yoy": "JAPAN_CASH_EARNINGS_YOY",
  topix: "TOPIX",
  "nikkei-225": "NIKKEI_225",
  "japan-foreign-investor-net-buying": "JAPAN_FOREIGN_NET_BUYING",
  "japan-tab-usdjpy": "DEXJPUS",
  taiex: "TAIEX",
  "taiwan-foreign-investor-net-buying": "TAIWAN_FOREIGN_NET_BUYING",
  usdtwd: "USDTWD",
  "broad-us-dollar-index": "DTWEXBGS",
  "cftc-jpy-speculative-net-positions": "CFTC_JPY_SPECULATIVE_NET_POSITIONS",
  "taiwan-margin-financing-balance-yoy": "TAIWAN_MARGIN_FINANCING_BALANCE_YOY",
  "taiwan-electronics-exports-yoy": "TAIWAN_ELECTRONICS_EXPORTS_YOY",
};

const glossaryDashboardTargets = {
  SP500: { tab: "macro", selector: '[data-indicator="sp500"]' },
  BAMLH0A0HYM2: { tab: "macro", selector: '[data-indicator="high-yield-oas"]' },
  HYG_IEF: { tab: "flows", selector: '[data-flows-indicator="flows-hyg-ief"]' },
  VIXCLS: { tab: "macro", selector: '[data-indicator="vix"]' },
  MOVE: { tab: "macro", selector: '[data-indicator="move"]' },
  SKEW: { tab: "macro", selector: '[data-indicator="skew"]' },
  FINRA_MARGIN_DEBT_YOY: { tab: "macro", selector: '[data-indicator="margin-debt-yoy"]' },
  WALCL: { tab: "macro", selector: '[data-indicator="fed-balance-sheet"]' },
  NFCI: { tab: "macro", selector: '[data-indicator="nfci"]' },
  ISM_MANUFACTURING_PMI: { tab: "macro", selector: '[data-indicator="ism-manufacturing-pmi"]' },
  RSP_SPY: { tab: "flows", selector: '[data-flows-indicator="flows-rsp-spy"]' },
  SPY_TLT: { tab: "flows", selector: '[data-flows-indicator="spy-tlt"]' },
  XLY_XLP: { tab: "flows", selector: '[data-flows-indicator="xly-xlp"]' },
  IWM_SPY: { tab: "flows", selector: '[data-flows-indicator="iwm-spy"]' },
  SMH_SPY: { tab: "flows", selector: '[data-flows-indicator="smh-spy"]' },
  NEW_HIGH_LOW_BREADTH: {
    tab: "breadth",
    selector: '[data-breadth-indicator="new-high-low-breadth"]',
  },
  SP500_ABOVE_200DMA: {
    tab: "breadth",
    selector: '[data-breadth-indicator="sp500-above-200dma"]',
  },
  TSMC_REVENUE_YOY: {
    tab: "taiwan",
    selector: '[data-taiwan-indicator="taiwan-tsmc-revenue-yoy"]',
  },
  DFEDTARU: { tab: "us-rates", selector: '[data-us-rates-indicator="fed-funds-rate"]' },
  CME_EXPECTED_POLICY_RATE: {
    tab: "us-rates",
    selector: '[data-us-rates-indicator="cme-expected-policy-rate"]',
  },
  DGS2: { tab: "us-rates", selector: '[data-us-rates-indicator="us-2y-yield"]' },
  DGS10: { tab: "us-rates", selector: '[data-us-rates-indicator="us-rates-10y-yield"]' },
  DFII10: { tab: "us-rates", selector: '[data-us-rates-indicator="us-10y-real-yield"]' },
  T10YIE: { tab: "us-rates", selector: '[data-us-rates-indicator="us-10y-breakeven-inflation"]' },
  ICSA: { tab: "us-rates", selector: '[data-us-rates-indicator="us-initial-jobless-claims"]' },
  T10Y2Y: { tab: "us-rates", selector: '[data-us-rates-indicator="us-rates-10y-2y-spread"]' },
  ACMTP10: { tab: "us-rates", selector: '[data-us-rates-indicator="us-10y-term-premium"]' },
  BOJ_POLICY_RATE: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="boj-policy-rate"]',
  },
  BOJ_OVERNIGHT_CALL_RATE: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="japan-overnight-call-rate"]',
  },
  BOJ_IMPLIED_RATE_3M_TONA: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="boj-implied-rate"]',
  },
  JAPAN_2Y_JGB: { tab: "jp-rates", selector: '[data-jp-rates-indicator="japan-2y-jgb-yield"]' },
  JAPAN_10Y_JGB: { tab: "jp-rates", selector: '[data-jp-rates-indicator="japan-10y-jgb-yield"]' },
  JAPAN_10Y_2Y_SPREAD: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="japan-10y-2y-jgb-spread"]',
  },
  JAPAN_CORE_CPI_YOY: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="japan-core-cpi-yoy"]',
  },
  TOKYO_CORE_CPI_YOY: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="tokyo-core-cpi-yoy"]',
  },
  JAPAN_CASH_EARNINGS_YOY: {
    tab: "jp-rates",
    selector: '[data-jp-rates-indicator="japan-cash-earnings-yoy"]',
  },
  TOPIX: { tab: "japan", selector: '[data-japan-indicator="topix"]' },
  NIKKEI_225: { tab: "japan", selector: '[data-japan-indicator="nikkei-225"]' },
  JAPAN_FOREIGN_NET_BUYING: {
    tab: "japan",
    selector: '[data-japan-indicator="japan-foreign-investor-net-buying"]',
  },
  DEXJPUS: { tab: "fx", selector: '[data-fx-card="USDJPY"]' },
  DTWEXBGS: { tab: "fx", selector: '[data-fx-card="BROAD_US_DOLLAR_INDEX"]' },
  US_JAPAN_2Y_SPREAD: { tab: "fx", selector: '[data-fx-card="US_Japan_2Y_Spread"]' },
  CFTC_JPY_SPECULATIVE_NET_POSITIONS: {
    tab: "fx",
    selector: '[data-fx-card="CFTC_JPY_SPECULATIVE_NET_POSITIONS"]',
  },
  TAIEX: { tab: "taiwan", selector: '[data-taiwan-indicator="taiex"]' },
  TAIWAN_FOREIGN_NET_BUYING: {
    tab: "taiwan",
    selector: '[data-taiwan-indicator="taiwan-foreign-investor-net-buying"]',
  },
  USDTWD: { tab: "taiwan", selector: '[data-taiwan-indicator="usdtwd"]' },
  TAIWAN_MARGIN_FINANCING_BALANCE_YOY: {
    tab: "taiwan",
    selector: '[data-taiwan-indicator="taiwan-margin-financing-balance-yoy"]',
  },
  TAIWAN_ELECTRONICS_EXPORTS_YOY: {
    tab: "taiwan",
    selector: '[data-taiwan-indicator="taiwan-electronics-exports-yoy"]',
  },
};

const ranges = {
  "1Y": 1,
  "3Y": 3,
  "5Y": 5,
  "10Y": 10,
  Max: Infinity,
};

const indicatorChangeFormatOverrides = {
  sp500: "percent",
  "breadth-sp500": "percent",
  "rsp-spy": "percent",
  "flows-rsp-spy": "percent",
  "flows-hyg-ief": "percent",
  "spy-tlt": "percent",
  "xly-xlp": "percent",
  "iwm-spy": "percent",
  "smh-spy": "percent",
  topix: "percent",
  "nikkei-225": "percent",
  taiex: "percent",
  "japan-tab-usdjpy": "percent",
  usdtwd: "percent",
  "us-2y-yield": "bps",
  "treasury-10y": "bps",
  "us-rates-10y-yield": "bps",
  "boj-policy-rate": "bps",
  "japan-overnight-call-rate": "bps",
  "japan-2y-jgb-yield": "bps",
  "japan-10y-jgb-yield": "bps",
  "japan-tab-10y-jgb-yield": "bps",
  "high-yield-oas": "bps",
  "10y-2y-spread": "bps",
  "us-rates-10y-2y-spread": "bps",
  "japan-10y-2y-jgb-spread": "bps",
  "japan-core-cpi-yoy": "pp",
  "tokyo-core-cpi-yoy": "pp",
  "move": "percent",
  "us-rates-move": "percent",
  vix: "percent",
  "margin-debt-yoy": "pp",
  "tsmc-revenue-yoy": "pp",
  "taiwan-tsmc-revenue-yoy": "pp",
  "taiwan-electronics-exports-yoy": "pp",
  "taiwan-margin-financing-balance-yoy": "pp",
  nfci: "points",
  "fed-balance-sheet": "percent",
};

const indicatorGrid = document.getElementById("indicator-grid");
const chartElement = document.getElementById("indicator-chart");
const chartTitle = document.getElementById("chart-title");
const selectionNotice = document.getElementById("selection-notice");
const selectionNoticeText = document.getElementById("selection-notice-text");
const selectionNoticeClose = document.getElementById("selection-notice-close");
const macroLogScaleInput = document.getElementById("macro-log-scale");
const rangeButtons = Array.from(document.querySelectorAll("[data-range]:not([data-comparison-range])"));
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabBar = document.querySelector(".tab-bar");
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const mobileViewButtons = Array.from(document.querySelectorAll("[data-mobile-view-button]"));
const fxChartElement = document.getElementById("fx-chart");
const fxRangeButtons = Array.from(document.querySelectorAll("[data-fx-range]"));
const fxCards = Array.from(document.querySelectorAll("[data-fx-card]"));
const fxSelectionNotice = document.getElementById("fx-selection-notice");
const fxSelectionNoticeText = document.getElementById("fx-selection-notice-text");
const fxSelectionNoticeClose = document.getElementById("fx-selection-notice-close");
const dataStatusUpdated = document.getElementById("data-status-updated");
const dataStatusBody = document.getElementById("data-status-body");
const glossaryBody = document.getElementById("glossary-body");
const glossarySearchInput = document.getElementById("glossary-search");
const glossaryLanguageButtons = Array.from(document.querySelectorAll("[data-glossary-global-language]"));
const DEFAULT_RANGE = "1Y";

document.querySelectorAll(".mobile-view-switch").forEach((switchElement) => {
  const section = switchElement.closest(".dashboard-section");
  const track = section?.querySelector(".mobile-swipe-track");
  if (section && track) {
    section.insertBefore(switchElement, track);
  }
});

let indicatorData = new Map();
let fedWatchExpectation = null;
const sharedIndicatorColorStorageKey = "marketIndicatorColorsV3";
const legacyDefaultColorMigrations = new Map([
  ["hyg-ief", new Set(["#218c83", "#2a9d8f"])],
  ["margin-debt-yoy", new Set(["#339267"])],
  ["nfci", new Set(["#2b83ae"])],
  ["move", new Set(["#6559bd", "#4f78c9"])],
  ["spy-tlt", new Set(["#3f6fcb"])],
]);
const sharedIndicatorColorDefaults = new Map([
  ...[
    ...indicators,
    ...breadthIndicators,
    ...flowsIndicators,
    ...usRatesIndicators,
    ...jpRatesIndicators,
    ...japanIndicators,
    ...taiwanIndicators,
  ].map((indicator) => [getIndicatorColorKey(indicator.id), indicator.color]),
  ["USDJPY", defaultIndicatorColors.USDJPY],
  ["US_Japan_2Y_Spread", defaultIndicatorColors.US_Japan_2Y_Spread],
]);
let sharedIndicatorColors = loadSharedIndicatorColors(sharedIndicatorColorDefaults);
let selectedIndicatorIds = ["sp500"];
let axisOrder = ["sp500"];
let manualAxisOrder = false;
let activeRange = DEFAULT_RANGE;
let macroScale = "linear";
let fxData = [];
let activeFxRange = DEFAULT_RANGE;
let visibleFxSeries = new Set(["USDJPY", "BROAD_US_DOLLAR_INDEX"]);
let glossaryEntries = [];
let glossarySearchText = "";
let activeGlossaryLanguage = getGlossaryLanguageFromUrl();
let expandedGlossaryId = null;
let dataStatusMetadata = null;
let expandedStatusKey = null;
const localTextRequests = new Map();

function getGlossaryLanguageFromUrl() {
  const languageAliases = {
    us: "en",
    jp: "ja",
    tw: "zh",
    en: "en",
    ja: "ja",
    zh: "zh",
  };
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  return languageAliases[requestedLanguage?.toLowerCase()] || "zh";
}

function updateGlossaryLanguageUrl(language) {
  const publicLanguageCodes = {
    en: "us",
    ja: "jp",
    zh: "tw",
  };
  const url = new URL(window.location.href);
  url.searchParams.set("lang", publicLanguageCodes[language] || "tw");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function consumeLongPressClick(element) {
  if (element.dataset.longPressActivated !== "true") {
    return false;
  }

  delete element.dataset.longPressActivated;
  return true;
}

function attachLongPress(element, callback, options = {}) {
  let timer = null;
  let startX = 0;
  let startY = 0;
  const shouldIgnoreTarget = options.shouldIgnoreTarget || (() => false);

  function cancel() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  element.addEventListener("pointerdown", (event) => {
    if (
      event.button !== 0 ||
      shouldIgnoreTarget(event.target) ||
      event.target.closest("[data-color-control], button, input, a")
    ) {
      return;
    }

    startX = event.clientX;
    startY = event.clientY;
    cancel();
    timer = window.setTimeout(() => {
      timer = null;
      element.dataset.longPressActivated = "true";
      callback();
    }, longPressDelayMs);
  });
  element.addEventListener("pointermove", (event) => {
    if (
      Math.abs(event.clientX - startX) > longPressMoveLimit ||
      Math.abs(event.clientY - startY) > longPressMoveLimit
    ) {
      cancel();
    }
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    element.addEventListener(eventName, cancel);
  });
  element.addEventListener("contextmenu", (event) => {
    if (!shouldIgnoreTarget(event.target)) {
      event.preventDefault();
    }
  });
}

function openGlossaryEntry(id) {
  if (!id) {
    return;
  }

  expandedGlossaryId = id;
  glossarySearchText = "";
  if (glossarySearchInput) {
    glossarySearchInput.value = "";
  }
  activateTab("glossary");
  if (glossaryEntries.length > 0) {
    renderGlossary({ indicators: glossaryEntries });
    scrollGlossaryEntryIntoView(id);
  }
}

function scrollDashboardCardIntoView(target, attempt = 0) {
  const card = document.querySelector(target.selector);
  if (!card && attempt < 8) {
    window.setTimeout(() => scrollDashboardCardIntoView(target, attempt + 1), 80);
    return;
  }
  if (!card) {
    return;
  }

  card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  card.classList.remove("long-press-target");
  requestAnimationFrame(() => card.classList.add("long-press-target"));
  window.setTimeout(() => card.classList.remove("long-press-target"), 1500);
}

function openDashboardForGlossary(id) {
  const target = glossaryDashboardTargets[id];
  if (!target) {
    return;
  }

  activateTab(target.tab);
  scrollDashboardCardIntoView(target);
}

function fetchLocalText(file) {
  if (!localTextRequests.has(file)) {
    const request = fetch(`${file}?updated=${Date.now()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${file}`);
        }
        return response.text();
      })
      .catch((error) => {
        localTextRequests.delete(file);
        throw error;
      });
    localTextRequests.set(file, request);
  }

  return localTextRequests.get(file);
}

const clampingCharts = new WeakSet();
const longPressTimers = new WeakMap();
const mobileYAxisGestureStates = new WeakMap();
const mobileYAxisTapStates = new WeakMap();
const longPressMoveLimit = 12;
const longPressDelayMs = 700;
const turningPointLookbackDays = 365;
const turningPointLookaheadDays = 365;
const marginDebtExtremeThresholds = {
  high: 55,
  low: -25,
};
const thresholdZoneColors = {
  favorable: "rgba(16, 185, 129, 0.07)",
  unfavorable: "rgba(239, 68, 68, 0.07)",
};
const thresholdEdgeColors = {
  favorable: [
    "rgba(16, 185, 129, 0.045)",
    "rgba(16, 185, 129, 0.025)",
    "rgba(16, 185, 129, 0.010)",
  ],
  unfavorable: [
    "rgba(239, 68, 68, 0.045)",
    "rgba(239, 68, 68, 0.025)",
    "rgba(239, 68, 68, 0.010)",
  ],
};
const indicatorThresholdZones = {
  "margin-debt-yoy": [
    { to: marginDebtExtremeThresholds.low, tone: "favorable" },
    { from: marginDebtExtremeThresholds.high, tone: "unfavorable" },
  ],
  vix: [
    { to: 15, tone: "favorable" },
    { from: 30, tone: "unfavorable" },
  ],
  "high-yield-oas": [
    { to: 4, tone: "favorable" },
    { from: 6, tone: "unfavorable" },
  ],
  nfci: [
    { to: -0.5, tone: "favorable" },
    { from: 0.5, tone: "unfavorable" },
  ],
  "sp500-above-200dma": [
    { to: 30, tone: "unfavorable" },
    { from: 50, to: 70, tone: "favorable" },
    { from: 80, tone: "unfavorable" },
  ],
  skew: [
    { to: 120, tone: "favorable" },
    { from: 140, tone: "unfavorable" },
  ],
  move: [
    { to: 100, tone: "favorable" },
    { from: 110, tone: "unfavorable" },
  ],
  "us-rates-move": [
    { to: 100, tone: "favorable" },
    { from: 110, tone: "unfavorable" },
  ],
  "taiwan-margin-financing-balance-yoy": [
    { to: -30, tone: "favorable" },
    { from: 50, tone: "unfavorable" },
  ],
};
const glossaryLinkAliasMaxLength = 72;

const statusClassNames = {
  "Up to date": "up-to-date",
  "Source lag": "source-lag",
  "Update not run": "update-not-run",
  Failed: "failed",
};

function usesTouchChartMode() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function usesMobilePaneLayout() {
  return window.matchMedia(
    "(max-width: 760px), (max-width: 900px) and (orientation: landscape)",
  ).matches;
}

function isMobileLandscape() {
  return usesMobilePaneLayout() && window.matchMedia("(orientation: landscape)").matches;
}

function getChartDragMode() {
  return usesTouchChartMode() ? "pan" : "zoom";
}

function getPlotlyConfig() {
  return {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "toImage",
      "zoom2d",
      "pan2d",
      "select2d",
      "lasso2d",
      "zoomIn2d",
      "zoomOut2d",
      "autoScale2d",
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "toggleSpikelines",
    ],
    responsive: true,
    scrollZoom: !usesTouchChartMode(),
  };
}

const chartDetailRegistry = new Set();
const chartDetailTraces = new WeakMap();
let chartDetailDocumentReady = false;

function getCompactHoverTemplate(color, valueExpression) {
  const safeColor = /^#[0-9a-f]{6}$/i.test(color || "") ? color : "#64748b";
  return `<span style="color:${safeColor}">&#9679;</span> ${valueExpression}<extra></extra>`;
}

function clearChartDetail(chartNode) {
  if (!chartNode) {
    return;
  }

  if (window.Plotly?.Fx?.unhover) {
    try {
      window.Plotly.Fx.unhover(chartNode);
    } catch {
      // Plotly can finish rebuilding a chart between the outside tap and this call.
    }
  }

  chartNode.classList.remove("chart-selection-active");
  chartNode.querySelectorAll(".chart-selection-popover, .chart-selection-guide").forEach((element) => {
    element.hidden = true;
  });
  delete chartNode.dataset.selectedDate;
}

function clearOtherChartDetails(activeChart) {
  chartDetailRegistry.forEach((chartNode) => {
    if (chartNode !== activeChart) {
      clearChartDetail(chartNode);
    }
  });
}

function isInsideChartPlotArea(chartNode, event) {
  const rect = chartNode?.getBoundingClientRect?.();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  // The chart's visual canvas includes useful blank space above the plot. Use
  // the whole canvas for date selection so a tap does not have to land near
  // the x-axis labels or the data line itself.
  const inset = 4;

  return (
    event.clientX >= rect.left + inset &&
    event.clientX <= rect.right - inset &&
    event.clientY >= rect.top + inset &&
    event.clientY <= rect.bottom - inset
  );
}

function getNearestChartPointRefs(chartNode, dateText) {
  const targetTime = Date.parse(`${dateText}T00:00:00Z`);
  const traces = chartDetailTraces.get(chartNode) || chartNode?.data;

  if (!Number.isFinite(targetTime) || !Array.isArray(traces)) {
    return [];
  }

  return traces.flatMap((trace, curveNumber) => {
    if (!Array.isArray(trace?.x) || trace.x.length === 0) {
      return [];
    }

    let nearestPointNumber = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;
    trace.x.forEach((value, pointNumber) => {
      const time = Date.parse(value);
      if (!Number.isFinite(time)) {
        return;
      }

      const distance = Math.abs(time - targetTime);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPointNumber = pointNumber;
      }
    });

    return nearestPointNumber >= 0 ? [{ curveNumber, pointNumber: nearestPointNumber }] : [];
  });
}

function getChartDetailValue(trace, pointNumber) {
  if (trace?.meta?.dashboardNormalized) {
    const normalizedValue = Number(trace.y?.[pointNumber]);
    return Number.isFinite(normalizedValue)
      ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(normalizedValue)
      : "--";
  }

  const customdata = trace?.customdata?.[pointNumber];
  const formattedValue = Array.isArray(customdata) ? customdata[0] : customdata;

  if (formattedValue !== undefined && formattedValue !== null && formattedValue !== "") {
    return String(formattedValue);
  }

  const value = Number(trace?.y?.[pointNumber]);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
    : "--";
}

function getChartDetailColor(trace) {
  const lineColor = trace?.line?.color;
  const markerColor = Array.isArray(trace?.marker?.color) ? trace.marker.color[0] : trace?.marker?.color;
  return lineColor || markerColor || getCssColor("--muted", "#64748b");
}

function renderChartDetail(chartNode, dateText, pointRefs, anchor = null) {
  const traces = chartDetailTraces.get(chartNode) || chartNode.data || [];
  let popover = chartNode.querySelector(":scope > .chart-selection-popover");
  let guide = chartNode.querySelector(":scope > .chart-selection-guide");

  if (!popover) {
    popover = document.createElement("div");
    popover.className = "chart-selection-popover";
    popover.setAttribute("role", "status");
    popover.setAttribute("aria-live", "polite");
    chartNode.append(popover);
  }

  if (!guide) {
    guide = document.createElement("div");
    guide.className = "chart-selection-guide";
    guide.setAttribute("aria-hidden", "true");
    chartNode.append(guide);
  }

  popover.replaceChildren();
  const dateElement = document.createElement("div");
  dateElement.className = "chart-selection-date";
  dateElement.textContent = formatFullDate(dateText);
  popover.append(dateElement);

  const seenCurves = new Set();
  pointRefs.forEach(({ curveNumber, pointNumber }) => {
    if (seenCurves.has(curveNumber) || !traces[curveNumber]) {
      return;
    }

    seenCurves.add(curveNumber);
    const row = document.createElement("div");
    row.className = "chart-selection-value";
    const swatch = document.createElement("span");
    swatch.className = "chart-selection-swatch";
    swatch.style.backgroundColor = getChartDetailColor(traces[curveNumber]);
    const value = document.createElement("span");
    value.textContent = getChartDetailValue(traces[curveNumber], pointNumber);
    row.append(swatch, value);
    popover.append(row);
  });

  const rect = chartNode.getBoundingClientRect();
  const plotSize = chartNode?._fullLayout?._size;
  const dragRect = chartNode.querySelector(".nsewdrag")?.getBoundingClientRect();
  let localX = Number.isFinite(anchor?.clientX) ? anchor.clientX - rect.left : rect.width / 2;
  let localY = Number.isFinite(anchor?.clientY) ? anchor.clientY - rect.top : rect.height / 2;
  const plotLeft = dragRect ? dragRect.left - rect.left : plotSize?.l ?? 8;
  const plotRight = dragRect ? dragRect.right - rect.left : plotLeft + (plotSize?.w ?? Math.max(rect.width - plotLeft - 8, 0));
  const plotTop = dragRect ? dragRect.top - rect.top : plotSize?.t ?? 8;
  const plotBottom = dragRect ? dragRect.bottom - rect.top : plotTop + (plotSize?.h ?? Math.max(rect.height - plotTop - 8, 0));
  localX = Math.min(Math.max(localX, plotLeft), plotRight);
  localY = Math.min(Math.max(localY, plotTop), plotBottom);
  guide.style.left = `${localX}px`;
  guide.style.top = `${plotTop}px`;
  guide.style.height = `${Math.max(plotBottom - plotTop, 0)}px`;
  guide.hidden = false;
  popover.hidden = false;

  const popoverWidth = popover.offsetWidth || 120;
  const popoverHeight = popover.offsetHeight || 52;
  popover.style.left = `${Math.min(Math.max(localX + 12, 8), Math.max(rect.width - popoverWidth - 8, 8))}px`;
  popover.style.top = `${Math.min(Math.max(localY - popoverHeight - 12, 8), Math.max(rect.height - popoverHeight - 8, 8))}px`;
}

function showChartDetail(chartNode, dateText, eventPoints = [], anchor = null) {
  if (!chartNode || !dateText) {
    return;
  }

  chartNode.dataset.selectedDate = dateText;
  chartNode.classList.add("chart-selection-active");
  const nearestRefs = getNearestChartPointRefs(chartNode, dateText);
  const pointRefs = [
    ...nearestRefs,
    ...eventPoints
      .filter((point) => Number.isFinite(point?.curveNumber) && Number.isFinite(point?.pointNumber))
      .map(({ curveNumber, pointNumber }) => ({ curveNumber, pointNumber })),
  ];

  if (window.Plotly?.Fx?.unhover) {
    try {
      window.Plotly.Fx.unhover(chartNode);
    } catch {
      // The custom detail remains usable while Plotly is rebuilding.
    }
  }

  renderChartDetail(chartNode, dateText, pointRefs, anchor);
}

function setupChartDetailInteraction(chartNode) {
  if (!chartNode || typeof chartNode.addEventListener !== "function" || chartNode.dataset.chartDetailReady === "true") {
    return;
  }

  chartNode.dataset.chartDetailReady = "true";
  chartDetailRegistry.add(chartNode);

  if (!chartDetailDocumentReady) {
    chartDetailDocumentReady = true;
    const clearOutside = (event) => {
      const clickedChart = event.target.closest?.(".js-plotly-plot");
      if (event.target.closest?.(".modebar, .hovertext, .chart-selection-popover")) {
        return;
      }

      chartDetailRegistry.forEach((registeredChart) => {
        if (registeredChart !== clickedChart || !clickedChart) {
          clearChartDetail(registeredChart);
        }
      });
    };
    document.addEventListener("pointerdown", clearOutside, { capture: true });
    document.addEventListener("click", clearOutside, { capture: true });
  }

  // Plotly does not consistently emit a click event for a short touch on every
  // mobile browser. Keep the chart tap separate from axis pan/zoom gestures so
  // a stationary tap still opens the compact detail overlay.
  let touchTap = null;
  const tapMoveTolerance = 14;
  const tapDurationMs = 450;

  function beginTouchTap(clientX, clientY, target = null) {
    if (target?.closest?.(".modebar, .hovertext, .legend, .axis, .colorbar, .chart-selection-popover")) {
      touchTap = null;
      return;
    }

    if (!isInsideChartPlotArea(chartNode, { clientX, clientY })) {
      touchTap = null;
      return;
    }

    touchTap = {
      clientX,
      clientY,
      startedAt: Date.now(),
      moved: false,
    };
  }

  function updateTouchTap(clientX, clientY) {
    if (!touchTap) {
      return;
    }

    touchTap.moved =
      touchTap.moved ||
      Math.hypot(clientX - touchTap.clientX, clientY - touchTap.clientY) > tapMoveTolerance;
  }

  function finishTouchTap(clientX, clientY) {
    const tap = touchTap;
    touchTap = null;

    if (
      !tap ||
      tap.moved ||
      Date.now() - tap.startedAt > tapDurationMs ||
      !isInsideChartPlotArea(chartNode, { clientX, clientY })
    ) {
      return;
    }

    const dateText = getDateFromChartPointer(chartNode, { clientX, clientY });
    if (dateText) {
      clearOtherChartDetails(chartNode);
      showChartDetail(chartNode, dateText, [], { clientX, clientY });
    }
  }

  chartNode.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "mouse") {
        beginTouchTap(event.clientX, event.clientY, event.target);
      }
    },
    { capture: true },
  );
  chartNode.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        updateTouchTap(event.clientX, event.clientY);
      }
    },
    { capture: true },
  );
  chartNode.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerType !== "mouse") {
        finishTouchTap(event.clientX, event.clientY);
      }
    },
    { capture: true },
  );
  chartNode.addEventListener(
    "pointercancel",
    (event) => {
      if (event.pointerType !== "mouse") {
        touchTap = null;
      }
    },
    { capture: true },
  );
  chartNode.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length === 1 && !touchTap) {
        const touch = event.touches[0];
        beginTouchTap(touch.clientX, touch.clientY, event.target);
      } else if (event.touches.length !== 1) {
        touchTap = null;
      }
    },
    { capture: true, passive: true },
  );
  chartNode.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        updateTouchTap(touch.clientX, touch.clientY);
      } else {
        touchTap = null;
      }
    },
    { capture: true, passive: true },
  );
  chartNode.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      if (touch) {
        finishTouchTap(touch.clientX, touch.clientY);
      } else {
        touchTap = null;
      }
    },
    { capture: true, passive: true },
  );
  chartNode.addEventListener(
    "touchcancel",
    () => {
      touchTap = null;
    },
    { capture: true, passive: true },
  );

  chartNode.addEventListener("click", (event) => {
    if (event.target.closest?.(".modebar, .hovertext, .legend, .axis, .colorbar, .chart-selection-popover")) {
      return;
    }

    if (!isInsideChartPlotArea(chartNode, event)) {
      clearChartDetail(chartNode);
      return;
    }

    const dateText = getDateFromChartPointer(chartNode, event);
    if (dateText) {
      clearOtherChartDetails(chartNode);
      showChartDetail(chartNode, dateText, [], event);
    }
  }, { capture: true });

  if (typeof chartNode.on === "function") {
    chartNode.on("plotly_click", (eventData) => {
      const dateText = normalizePlotlyDate(eventData?.points?.[0]?.x);
      if (!dateText) {
        clearChartDetail(chartNode);
        return;
      }

      const pointerEvent = eventData?.event;
      const anchor = Number.isFinite(pointerEvent?.clientX) && Number.isFinite(pointerEvent?.clientY)
        ? { clientX: pointerEvent.clientX, clientY: pointerEvent.clientY }
        : null;
      clearOtherChartDetails(chartNode);
      showChartDetail(chartNode, dateText, eventData.points, anchor);
    });
  }
}

const chartInitialAxisRanges = new WeakMap();

function resetChartToInitialRanges(chartNode) {
  const initialRanges = chartInitialAxisRanges.get(chartNode);
  if (!initialRanges || !window.Plotly) {
    return;
  }

  const update = {};
  Object.entries(initialRanges).forEach(([axisName, range]) => {
    update[`${axisName}.range`] = [...range];
    update[`${axisName}.autorange`] = false;
  });

  Plotly.relayout(chartNode, update);
}

function setupChartModebar(chartNode, logScaleInput = null, normalizedInput = null, zoneControl = null) {
  if (!chartNode) {
    return;
  }

  const toolbar = chartNode.closest(".chart-pane")?.querySelector(".chart-toolbar, .fx-controls");
  const modebar = chartNode.querySelector(".modebar") || toolbar?.querySelector(".modebar");
  if (!modebar) {
    return;
  }

  const initialRanges = {};
  ["xaxis", "yaxis", "yaxis2"].forEach((axisName) => {
    const range = chartNode.layout?.[axisName]?.range || chartNode._fullLayout?.[axisName]?.range;
    if (Array.isArray(range) && range.length === 2) {
      initialRanges[axisName] = [...range];
    }
  });
  chartInitialAxisRanges.set(chartNode, initialRanges);

  const modebarGroup = document.createElement("div");
  modebarGroup.className = "modebar-group dashboard-modebar-group";

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "modebar-btn dashboard-reset-control";
  resetButton.setAttribute("aria-label", "Reset scale");

  const resetLabel = document.createElement("span");
  resetLabel.className = "modebar-button-label";
  resetLabel.textContent = "Reset scale";
  resetButton.append(resetLabel);
  resetButton.addEventListener("click", () => {
    resetChartToInitialRanges(chartNode);
    requestAnimationFrame(() => centerMobileChartPane(chartNode.closest("[data-mobile-track]")));
  });
  modebarGroup.append(resetButton);

  const control = logScaleInput?.closest(".toggle-pill");
  if (control) {
    control.classList.add("modebar-toggle-control", "modebar-log-control");
    if (normalizedInput) {
      control.classList.add("modebar-log-control-hidden");
      control.hidden = true;
    } else {
      modebarGroup.append(control);
    }
  }

  const normalizedControl = normalizedInput?.closest(".toggle-pill");
  if (normalizedControl) {
    normalizedControl.classList.add("modebar-toggle-control", "modebar-normalized-control");
    modebarGroup.append(normalizedControl);
  }

  if (zoneControl) {
    zoneControl.classList.add("modebar-toggle-control", "modebar-zone-control");
    modebarGroup.append(zoneControl);
  }

  modebar.replaceChildren(modebarGroup);
  modebar.classList.add("dashboard-modebar");

  if (toolbar) {
    const previousModebar = toolbar.querySelector(".modebar");
    if (previousModebar && previousModebar !== modebar) {
      previousModebar.remove();
    }

    const chartActions = toolbar.querySelector(".chart-actions");
    if (chartActions) {
      chartActions.hidden = true;
    }

    toolbar.append(modebar);
  }

  requestAnimationFrame(() => centerActiveLandscapeChart());
}

function getCssColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function getChartTheme() {
  return {
    ink: getCssColor("--ink", "#111827"),
    muted: getCssColor("--muted", "#64748b"),
    line: getCssColor("--line", "#e5e7eb"),
    grid: getCssColor("--chart-grid", "#e5e7eb"),
    guide: getCssColor("--chart-guide", "#94a3b8"),
    zero: getCssColor("--chart-zero", "#d1d5db"),
    surface: getCssColor("--surface", "#ffffff"),
  };
}

function parseStoredColors(storageKey) {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function loadSharedIndicatorColors(fallbackColors) {
  const colors = new Map(fallbackColors);
  const stored = parseStoredColors(sharedIndicatorColorStorageKey);
  Object.entries(stored).forEach(([id, color]) => {
    const key = getIndicatorColorKey(id);
    if (typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)) {
      const normalizedColor = color.toLowerCase();
      const isLegacyDefault = legacyDefaultColorMigrations.get(key)?.has(normalizedColor);
      colors.set(key, isLegacyDefault ? defaultIndicatorColors[key] : normalizedColor);
    }
  });

  return colors;
}

function getIndicatorColor(id) {
  const key = getIndicatorColorKey(id);
  return sharedIndicatorColors.get(key) || defaultIndicatorColors[key] || "#2563eb";
}

function getChartSeriesColor(id) {
  const color = getIndicatorColor(id);
  if (color === "#111111" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "#f8fafc";
  }
  return color;
}

function setIndicatorColor(id, color) {
  if (typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color)) {
    return;
  }
  sharedIndicatorColors.set(getIndicatorColorKey(id), color.toLowerCase());
  storeSharedIndicatorColors();
}

function storeSharedIndicatorColors() {
  try {
    window.localStorage.setItem(
      sharedIndicatorColorStorageKey,
      JSON.stringify(Object.fromEntries(sharedIndicatorColors)),
    );
  } catch {
    // Some privacy modes disable localStorage; color changes still work for the current page.
  }
}

function renderColorPalette({ activeColor, targetId, targetType }) {
  return `
    <div class="color-control" data-color-control>
      ${renderColorPaletteContent({ activeColor, targetId, targetType })}
    </div>
  `;
}

function renderColorPaletteContent({ activeColor, targetId, targetType }) {
  const controlAttribute =
    targetType === "macro"
      ? `data-color-panel-for="${targetId}"`
      : targetType === "fx"
        ? `data-fx-color-panel-for="${targetId}"`
        : `data-${targetType}-color-panel-for="${targetId}"`;

  return `
    <div class="color-picker">
      <button
        class="current-color"
        type="button"
        data-color-menu-toggle
        data-swatch-color="${activeColor.toLowerCase()}"
        style="--swatch-color: ${activeColor}"
        aria-label="Change line color"
        aria-expanded="false"
      ></button>
      <div class="color-panel" ${controlAttribute} hidden>
        <div class="color-swatch-grid" role="group" aria-label="Line color">
          ${colorPalette
            .map((color) => {
              const active = color.toLowerCase() === activeColor.toLowerCase();
              const dataAttribute =
                targetType === "macro"
                  ? `data-color-indicator="${targetId}"`
                  : targetType === "fx"
                    ? `data-fx-color="${targetId}"`
                    : `data-${targetType}-color="${targetId}"`;

              return `
                <button
                  class="color-swatch ${active ? "active" : ""}"
                  type="button"
                  ${dataAttribute}
                  data-color-value="${color}"
                  data-swatch-color="${color.toLowerCase()}"
                  style="--swatch-color: ${color}"
                  aria-label="Use ${color}"
                  aria-pressed="${active}"
                ></button>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function closeColorPanels(exceptPanel = null) {
  document.querySelectorAll(".color-panel").forEach((panel) => {
    if (panel === exceptPanel) {
      return;
    }

    panel.hidden = true;
    panel.closest(".color-picker")?.querySelector("[data-color-menu-toggle]")?.setAttribute("aria-expanded", "false");
  });
}

function toggleColorPanel(toggleButton) {
  const picker = toggleButton.closest(".color-picker");
  const panel = picker?.querySelector(".color-panel");

  if (!panel) {
    return;
  }

  const willOpen = panel.hidden;
  closeColorPanels(panel);
  panel.hidden = !willOpen;
  toggleButton.setAttribute("aria-expanded", String(willOpen));
}

function parseCsv(csvText) {
  return csvText
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, value, meetingDate] = line.split(",");
      const rawValue = value?.trim();
      return {
        date: date.trim(),
        rawValue,
        value: rawValue === "" ? Number.NaN : Number(rawValue),
        meetingDate: meetingDate?.trim() || null,
      };
    })
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function parseFxCsv(csvText) {
  const [headerLine, ...lines] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(",");

  return lines
    .map((line) => {
      const columns = line.split(",");
      const row = {};
      headers.forEach((header, index) => {
        row[header] = index === 0 ? columns[index] : columns[index] === "" ? null : Number(columns[index]);
      });
      return row;
    })
    .filter((row) => row.date);
}

function parseIndicatorRows(csvText, indicator) {
  const rows = !indicator.column
    ? parseCsv(csvText)
    : parseFxCsv(csvText)
        .map((row) => ({
          date: row.date,
          value: row[indicator.column],
        }))
        .filter((row) => row.date && Number.isFinite(row.value))
        .sort((a, b) => a.date.localeCompare(b.date));

  if (!indicator.compressRepeatedValues || rows.length < 2) {
    return rows;
  }

  const policyRows = rows.filter(
    (row, index) => index === 0 || row.value !== rows[index - 1].value,
  );
  const latest = rows.at(-1);

  if (policyRows.at(-1)?.date !== latest.date) {
    policyRows.push(latest);
  }

  return policyRows;
}

function getIndicator(id) {
  return indicators.find((indicator) => indicator.id === id);
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return `${date.getFullYear()}/${date.getMonth() + 1}`;
}

function formatFullDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function toDate(dateText) {
  return new Date(`${dateText}T00:00:00`);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDisplayDivisor(indicator) {
  return Number.isFinite(indicator?.displayDivisor) && indicator.displayDivisor !== 0
    ? indicator.displayDivisor
    : 1;
}

function getDisplayDecimals(indicator) {
  return indicator?.displayDecimals ?? indicator?.decimals ?? 0;
}

function getDisplaySuffix(indicator) {
  return indicator?.displaySuffix ?? indicator?.valueSuffix ?? "";
}

function getDisplayValue(value, indicator) {
  return Number(value) / getDisplayDivisor(indicator);
}

function getUnitDisplayRows(rows, indicator) {
  return rows.map((row) => ({
    ...row,
    value: getDisplayValue(row.value, indicator),
  }));
}

function getDisplayIndicator(indicator) {
  if (!indicator?.displayDivisor && !indicator?.displayDecimals && !indicator?.displaySuffix) {
    return indicator;
  }

  const axisBounds = indicator.axisBounds
    ? Object.fromEntries(
        Object.entries(indicator.axisBounds).map(([key, value]) => [
          key,
          Number.isFinite(value) ? getDisplayValue(value, indicator) : value,
        ]),
      )
    : indicator.axisBounds;

  return {
    ...indicator,
    axisBounds,
    decimals: getDisplayDecimals(indicator),
    valueSuffix: getDisplaySuffix(indicator),
  };
}

function formatValue(value, indicator) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: getDisplayDecimals(indicator),
    maximumFractionDigits: getDisplayDecimals(indicator),
  }).format(getDisplayValue(value, indicator));

  return `${formatted}${getDisplaySuffix(indicator)}`;
}

function formatDisplayNumber(value, indicator) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: getDisplayDecimals(indicator),
    maximumFractionDigits: getDisplayDecimals(indicator),
  }).format(getDisplayValue(value, indicator));
}

function getDisplayHoverUnit(indicator) {
  return indicator?.displayDivisor ? getDisplaySuffix(indicator) : indicator?.unitLabel || "";
}

function getDisplayHoverMarkup(indicator) {
  const unit = getDisplayHoverUnit(indicator);
  if (!unit) {
    return "";
  }

  return indicator?.displayDivisor ? unit : ` ${unit}`;
}

function getIndicatorChangeFormat(indicator) {
  if (indicator.changeFormat) {
    return indicator.changeFormat;
  }

  if (indicatorChangeFormatOverrides[indicator.id]) {
    return indicatorChangeFormatOverrides[indicator.id];
  }

  if (indicator.category === "price" || indicator.category === "currency") {
    return "percent";
  }

  if (indicator.category === "rate" || indicator.category === "spread") {
    return "bps";
  }

  if (indicator.category === "percentage") {
    return "pp";
  }

  if (indicator.category === "volatility" || indicator.category === "balance-sheet" || indicator.category === "capex") {
    return "percent";
  }

  return "points";
}

function formatSignedChange(value, decimals, suffix) {
  const sign = value > 0 ? "+" : "";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return `${sign}${formatted}${suffix}`;
}

function getIndicatorChange(latest, previous, indicator) {
  if (!latest || !previous || !Number.isFinite(latest.value) || !Number.isFinite(previous.value)) {
    return null;
  }

  const rawChange = latest.value - previous.value;
  const direction = rawChange > 0 ? "up" : rawChange < 0 ? "down" : "flat";
  const arrow = rawChange > 0 ? "▲" : rawChange < 0 ? "▼" : "•";
  const format = getIndicatorChangeFormat(indicator);

  if (format === "percent") {
    if (previous.value === 0) {
      return null;
    }

    return {
      direction,
      text: `${arrow} ${formatSignedChange((rawChange / Math.abs(previous.value)) * 100, 2, "%")}`,
    };
  }

  if (format === "bps") {
    return {
      direction,
      text: `${arrow} ${formatSignedChange(rawChange * 100, 1, " bps")}`,
    };
  }

  if (format === "pp") {
    return {
      direction,
      text: `${arrow} ${formatSignedChange(rawChange, 1, " pp")}`,
    };
  }

  return {
    direction,
    text: `${arrow} ${formatSignedChange(rawChange, indicator.decimals, getDisplaySuffix(indicator))}`,
  };
}

function findPreviousActualObservation(rows, observationsBack, indicator) {
  const latestMeetingDate = rows.at(-1)?.meetingDate;
  const actualRows = rows.filter(
    (row) =>
      Number.isFinite(row.value) &&
      (indicator.id !== "cme-expected-policy-rate" ||
        !latestMeetingDate ||
        row.meetingDate === latestMeetingDate),
  );
  return actualRows.at(-(observationsBack + 1)) || null;
}

function findPreviousDistinctObservation(rows) {
  const latest = rows.at(-1);
  if (!latest) {
    return null;
  }

  return rows.findLast((row) => Number.isFinite(row.value) && row.value !== latest.value) || null;
}

function renderIndicatorChange(rows, indicator) {
  const displayRows = getUnitDisplayRows(rows, indicator);
  const displayIndicator = getDisplayIndicator(indicator);
  const latest = displayRows.at(-1);

  if (!latest) {
    return "";
  }

  const periodsByCadence = {
    daily: [
      { label: "1D", observationsBack: 1 },
      { label: "20D", observationsBack: 20 },
    ],
    weekly: [
      { label: "1W", observationsBack: 1 },
      { label: "4W", observationsBack: 4 },
    ],
    monthly: [
      { label: "1M", observationsBack: 1 },
      { label: "3M", observationsBack: 3 },
    ],
    quarterly: [
      { label: "1Q", observationsBack: 1 },
      { label: "2Q", observationsBack: 2 },
    ],
    policy: [{ label: "Last meeting", policyMeeting: true }],
  };
  const periods = periodsByCadence[indicator.cadence || "daily"];
  const changes = periods
    .map(({ label, observationsBack, distinctValue, policyMeeting }) => ({
      label,
      change: getIndicatorChange(
        latest,
        policyMeeting
          ? findPolicyRateBeforePreviousMeeting(displayRows)
          : distinctValue
          ? findPreviousDistinctObservation(displayRows)
          : findPreviousActualObservation(displayRows, observationsBack, displayIndicator),
        displayIndicator,
      ),
    }))
    .filter((item) => item.change);

  if (changes.length === 0) {
    return "";
  }

  return `<small class="indicator-change">${changes
    .map(
      ({ label, change }) =>
        `<span class="change-period ${change.direction} ${label === "Last meeting" ? "policy-change" : ""}"><b>${label}</b><span class="change-value">${change.text}</span></span>`,
    )
    .join("")}</small>`;
}

function findPolicyRateBeforePreviousMeeting(rows) {
  const previousMeetingDate = fedWatchExpectation?.previous_meeting_date;
  if (!previousMeetingDate) {
    return findPreviousDistinctObservation(rows);
  }

  return (
    rows.findLast(
      (row) => Number.isFinite(row.value) && row.date < previousMeetingDate,
    ) || findPreviousDistinctObservation(rows)
  );
}

function renderCardChange(rows, indicator) {
  return renderIndicatorChange(rows, indicator);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} JST`;
}

function getTodayJst() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function shiftDateByRange(endDate, rangeKey) {
  const startDate = new Date(endDate);

  if (rangeKey.endsWith("M")) {
    startDate.setMonth(startDate.getMonth() - Number(rangeKey.slice(0, -1)));
  } else {
    startDate.setFullYear(startDate.getFullYear() - ranges[rangeKey]);
  }

  return startDate;
}

function getDateTickFormat(rangeKey) {
  return rangeKey === "1M" ? "%-m/%-d" : "%Y/%-m";
}

function getMacroXBounds() {
  const selected = axisOrder;
  const latestDateText = selected
    .flatMap((id) => indicatorData.get(id) || [])
    .map((row) => row.date)
    .sort((a, b) => a.localeCompare(b))
    .at(-1);

  if (!latestDateText) {
    return null;
  }

  const endDate = toDate(latestDateText);
  const startDate = activeRange === "Max" ? toDate(maxStartDate) : shiftDateByRange(endDate, activeRange);

  return {
    start: toIsoDate(startDate),
    end: toIsoDate(endDate),
  };
}

function getRangeStart(rows) {
  if (activeRange === "Max") {
    return toDate(maxStartDate);
  }

  return shiftDateByRange(toDate(rows.at(-1).date), activeRange);
}

function getFilteredRows(indicatorId) {
  const rows = indicatorData.get(indicatorId) || [];
  const bounds = getMacroXBounds();

  if (rows.length === 0) {
    return [];
  }

  if (!bounds) {
    const start = getRangeStart(rows);
    return rows.filter((row) => toDate(row.date) >= start);
  }

  return rows.filter((row) => row.date >= bounds.start && row.date <= bounds.end);
}

function getAutoAxisOrder(ids) {
  if (ids.length !== 2) {
    return ids;
  }

  const [first, second] = ids.map(getIndicator);
  const firstIsPrice = first.category === "price";
  const secondIsPrice = second.category === "price";

  if (firstIsPrice && !secondIsPrice) {
    return [first.id, second.id];
  }

  if (secondIsPrice && !firstIsPrice) {
    return [second.id, first.id];
  }

  return ids;
}

function syncAxisOrder() {
  axisOrder = axisOrder.filter((id) => selectedIndicatorIds.includes(id));

  for (const id of selectedIndicatorIds) {
    if (!axisOrder.includes(id)) {
      axisOrder.push(id);
    }
  }

  if (!manualAxisOrder) {
    axisOrder = getAutoAxisOrder(selectedIndicatorIds);
  }
}

function showNotice(message) {
  selectionNoticeText.textContent = message;
  selectionNotice.hidden = false;
}

function clearNotice() {
  selectionNotice.hidden = true;
  selectionNoticeText.textContent = "";
}

function showCopyToast(message, action = null) {
  let toast = document.getElementById("copy-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copy-toast";
    toast.className = "copy-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.onclick = null;
  toast.classList.toggle("actionable", Boolean(action));
  toast.setAttribute("aria-label", action ? message : "");

  if (action) {
    toast.onclick = action;
  }

  toast.classList.add("show");
  window.clearTimeout(showCopyToast.timeoutId);
  showCopyToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.remove("actionable");
    toast.onclick = null;
  }, 1400);
}

async function copyText(text) {
  const clipboard = globalThis.navigator?.clipboard;

  if (clipboard?.writeText && window.isSecureContext) {
    await clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = typeof document.execCommand === "function" && document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Copy command failed.");
  }
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function getAutoRange(rows, scale, axisBounds = null, includeZero = false) {
  const values = rows.map((row) => row.value).filter((value) => Number.isFinite(value));
  const visibleValues = scale === "log" ? values.filter((value) => value > 0) : values;

  if (visibleValues.length === 0) {
    return undefined;
  }

  let min = Math.min(...visibleValues);
  let max = Math.max(...visibleValues);

  if (includeZero && scale === "linear") {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }

  if (min === max) {
    const padding = Math.abs(min || 1) * 0.1;
    min -= padding;
    max += padding;
  } else {
    const padding = (max - min) * 0.1;
    min -= padding;
    max += padding;
  }

  if (scale === "log") {
    min = Math.max(min, Math.min(...visibleValues) * 0.8, 0.0001);
  }

  if (axisBounds) {
    if (Number.isFinite(axisBounds.min)) {
      min = Math.max(min, axisBounds.min);
    }

    if (Number.isFinite(axisBounds.max)) {
      max = Math.min(max, axisBounds.max);
    }

    if (min >= max) {
      return [
        Number.isFinite(axisBounds.min) ? axisBounds.min : min,
        Number.isFinite(axisBounds.max) ? axisBounds.max : max,
      ];
    }
  }

  return [min, max];
}

function clampDateRange(nextStart, nextEnd, bounds) {
  const min = Date.parse(bounds.start);
  const max = Date.parse(bounds.end);
  let start = Date.parse(nextStart);
  let end = Date.parse(nextEnd);

  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    return [bounds.start, bounds.end];
  }

  const allowedSpan = max - min;
  let span = end - start;

  if (span >= allowedSpan) {
    return [bounds.start, bounds.end];
  }

  if (start < min) {
    start = min;
    end = start + span;
  }

  if (end > max) {
    end = max;
    start = end - span;
  }

  start = Math.max(start, min);
  end = Math.min(end, max);

  return [toIsoDate(new Date(start)), toIsoDate(new Date(end))];
}

function addDays(dateText, days) {
  const date = toDate(dateText);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function findNearestRow(rows, targetDateText, valueField = "value") {
  const target = Date.parse(`${targetDateText}T00:00:00`);
  let nearest = null;
  let smallestDistance = Infinity;

  rows.forEach((row) => {
    const value = row[valueField];
    const rowTime = Date.parse(`${row.date}T00:00:00`);

    if (!Number.isFinite(value) || !Number.isFinite(rowTime)) {
      return;
    }

    const distance = Math.abs(rowTime - target);

    if (distance < smallestDistance) {
      nearest = row;
      smallestDistance = distance;
    }
  });

  return nearest;
}

function formatPromptValue(value, decimals, suffix = "") {
  return `${Number(value).toFixed(decimals)}${suffix}`;
}

function daysBetween(firstDateText, secondDateText) {
  const first = Date.parse(`${firstDateText}T00:00:00`);
  const second = Date.parse(`${secondDateText}T00:00:00`);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }

  return Math.round((second - first) / 86400000);
}

function formatSignedNumber(value, decimals, suffix = "") {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPromptValue(value, decimals, suffix)}`;
}

function formatMove(fromRow, toRow, valueField, decimals, suffix = "") {
  if (!fromRow || !toRow || fromRow.date === toRow.date) {
    return "not enough data to calculate a move";
  }

  const change = toRow[valueField] - fromRow[valueField];
  const days = Math.abs(daysBetween(fromRow.date, toRow.date));
  const pctChange =
    fromRow[valueField] !== 0 && Number.isFinite(fromRow[valueField])
      ? ` (${formatSignedNumber((change / Math.abs(fromRow[valueField])) * 100, 1, "%")})`
      : "";

  return `${formatSignedNumber(change, decimals, suffix)}${pctChange} over ${days} days`;
}

function getRowsWithinWindow(rows, dateText, beforeDays, afterDays, valueField) {
  const start = addDays(dateText, -beforeDays);
  const end = addDays(dateText, afterDays);

  return rows.filter((row) => row.date >= start && row.date <= end && Number.isFinite(row[valueField]));
}

function medianDayGap(rows) {
  const gaps = rows
    .slice(1)
    .map((row, index) => Math.abs(daysBetween(rows[index].date, row.date)))
    .filter((gap) => Number.isFinite(gap) && gap > 0)
    .sort((a, b) => a - b);

  if (gaps.length === 0) {
    return 30;
  }

  return gaps[Math.floor(gaps.length / 2)];
}

function getTurningWindowSize(rows) {
  const gap = medianDayGap(rows);

  if (gap >= 20) {
    return 3;
  }

  if (gap >= 5) {
    return 8;
  }

  return 21;
}

function getTurningPointCandidates(rows, valueField) {
  if (rows.length < 5) {
    return [];
  }

  const windowSize = Math.min(getTurningWindowSize(rows), Math.max(1, Math.floor((rows.length - 1) / 2)));
  const values = rows.map((row) => row[valueField]).filter(Number.isFinite);
  const fullRange = Math.max(...values) - Math.min(...values) || Math.max(Math.abs(values[0] || 1), 1);
  const candidates = [];

  for (let index = 0; index < rows.length; index += 1) {
    const startIndex = Math.max(0, index - windowSize);
    const endIndex = Math.min(rows.length - 1, index + windowSize);
    const segment = rows.slice(startIndex, endIndex + 1);
    const value = rows[index][valueField];
    const segmentValues = segment.map((row) => row[valueField]);
    const segmentMin = Math.min(...segmentValues);
    const segmentMax = Math.max(...segmentValues);
    const segmentRange = segmentMax - segmentMin;

    if (segmentRange <= fullRange * 0.015) {
      continue;
    }

    if (value === segmentMax && value > segmentMin) {
      candidates.push({
        ...rows[index],
        type: "local high",
        score: segmentRange / fullRange,
      });
    } else if (value === segmentMin && value < segmentMax) {
      candidates.push({
        ...rows[index],
        type: "local low",
        score: segmentRange / fullRange,
      });
    }
  }

  return candidates.filter((candidate, index, allCandidates) => {
    const previous = allCandidates[index - 1];
    return !previous || previous.type !== candidate.type || Math.abs(daysBetween(previous.date, candidate.date)) > 7;
  });
}

function pickNearestTurningPoint(candidates, dateText) {
  return [...candidates].sort((a, b) => {
    const distanceA = Math.abs(daysBetween(dateText, a.date));
    const distanceB = Math.abs(daysBetween(dateText, b.date));

    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }

    return b.score - a.score;
  })[0];
}

function pickImportantTurningPoint(candidates) {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.date.localeCompare(b.date);
  })[0];
}

function formatMarginDebtExtremeLine(windowRows) {
  const highRows = windowRows.filter((row) => row.value >= marginDebtExtremeThresholds.high);
  const lowRows = windowRows.filter((row) => row.value <= marginDebtExtremeThresholds.low);
  const parts = [];

  if (highRows.length > 0) {
    const peak = highRows.reduce((max, row) => (row.value > max.value ? row : max), highRows[0]);
    parts.push(
      `  - Margin Debt YoY expansion zone: crossed above ${marginDebtExtremeThresholds.high}% ${highRows.length} time(s) within +/- 1Y; highest was ${formatPromptValue(peak.value, 1, "%")} on ${peak.date}`,
    );
  }

  if (lowRows.length > 0) {
    const trough = lowRows.reduce((min, row) => (row.value < min.value ? row : min), lowRows[0]);
    parts.push(
      `  - Margin Debt YoY contraction zone: crossed below ${marginDebtExtremeThresholds.low}% ${lowRows.length} time(s) within +/- 1Y; lowest was ${formatPromptValue(trough.value, 1, "%")} on ${trough.date}`,
    );
  }

  if (parts.length === 0) {
    parts.push(
      `  - Margin Debt YoY did not cross the ${marginDebtExtremeThresholds.high}% expansion or ${marginDebtExtremeThresholds.low}% contraction threshold within +/- 1Y.`,
    );
  }

  return parts.join("\n");
}

function analyzeTurningPoints({ id, name, unit, rows, dateText, valueField, decimals, suffix }) {
  const nearest = findNearestRow(rows, dateText, valueField);

  if (!nearest) {
    return {
      name,
      nearest,
      turningPoint: null,
      line: `- ${name}: no available observation near ${dateText}.`,
    };
  }

  const windowRows = getRowsWithinWindow(rows, dateText, turningPointLookbackDays, turningPointLookaheadDays, valueField);
  const analysisRows = windowRows.length > 0 ? windowRows : [nearest];
  const candidates = getTurningPointCandidates(windowRows, valueField);
  const turningPoint =
    pickNearestTurningPoint(candidates, nearest.date) ||
    pickImportantTurningPoint([
      {
        ...analysisRows.reduce((min, row) => (row[valueField] < min[valueField] ? row : min), analysisRows[0]),
        type: "window low",
        score: 0,
      },
      {
        ...analysisRows.reduce((max, row) => (row[valueField] > max[valueField] ? row : max), analysisRows[0]),
        type: "window high",
        score: 0,
      },
    ].filter(Boolean));
  const priorTurningPoint = pickImportantTurningPoint(
    candidates.filter((candidate) => candidate.date < nearest.date && Math.abs(daysBetween(candidate.date, nearest.date)) <= turningPointLookbackDays),
  );
  const nextTurningPoint = pickImportantTurningPoint(
    candidates.filter((candidate) => candidate.date > nearest.date && Math.abs(daysBetween(nearest.date, candidate.date)) <= turningPointLookaheadDays),
  );
  const parts = [
    `- ${name}: ${formatPromptValue(nearest[valueField], decimals, suffix)} on ${nearest.date} (${unit})`,
  ];

  if (turningPoint) {
    parts.push(
      `  - nearest turning point within +/- 1Y: ${turningPoint.type || "turning point"} on ${turningPoint.date}, ${formatPromptValue(turningPoint[valueField], decimals, suffix)} (${Math.abs(daysBetween(nearest.date, turningPoint.date))} days from selected observation)`,
    );
  }

  if (priorTurningPoint) {
    parts.push(
      `  - important prior turning point within 1Y: ${priorTurningPoint.type} on ${priorTurningPoint.date}, ${formatPromptValue(priorTurningPoint[valueField], decimals, suffix)}; move to selected observation: ${formatMove(priorTurningPoint, nearest, valueField, decimals, suffix)}`,
    );
  }

  if (nextTurningPoint) {
    parts.push(
      `  - important next turning point within 1Y: ${nextTurningPoint.type} on ${nextTurningPoint.date}, ${formatPromptValue(nextTurningPoint[valueField], decimals, suffix)}; move from selected observation: ${formatMove(nearest, nextTurningPoint, valueField, decimals, suffix)}`,
    );
  }

  if (id === "margin-debt-yoy") {
    parts.push(formatMarginDebtExtremeLine(windowRows));
  }

  return {
    name,
    nearest,
    turningPoint,
    line: parts.join("\n"),
  };
}

function formatLeadLag(analyses) {
  if (analyses.length !== 2 || !analyses[0].turningPoint || !analyses[1].turningPoint) {
    return "Lead/lag: not enough turning point information for both selected indicators.";
  }

  const [first, second] = analyses;
  const lagDays = daysBetween(first.turningPoint.date, second.turningPoint.date);

  if (lagDays === 0) {
    return `Lead/lag: ${first.name} and ${second.name} had nearest turning points on the same date (${first.turningPoint.date}).`;
  }

  const leader = lagDays > 0 ? first : second;
  const follower = lagDays > 0 ? second : first;

  return `Lead/lag: ${leader.name} turned ${Math.abs(lagDays)} days before ${follower.name} (${leader.turningPoint.date} vs ${follower.turningPoint.date}).`;
}

function normalizePlotlyDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return toIsoDate(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return toIsoDate(new Date(value));
  }

  if (typeof value === "string") {
    const time = Date.parse(value);

    if (Number.isFinite(time)) {
      return toIsoDate(new Date(time));
    }
  }

  return null;
}

function getDateFromChartPointer(chartNode, event) {
  const fullLayout = chartNode?._fullLayout;
  const xaxis = fullLayout?.xaxis;
  const plotSize = fullLayout?._size;
  const rect = chartNode.getBoundingClientRect();

  if (xaxis?.p2d && plotSize) {
    const xPixel = Math.min(Math.max(event.clientX - rect.left - plotSize.l, 0), plotSize.w);
    const plotlyDate = xaxis.p2d(xPixel);
    const normalizedDate = normalizePlotlyDate(plotlyDate);

    if (normalizedDate) {
      return normalizedDate;
    }
  }

  const start = chartNode.dataset.promptStart;
  const end = chartNode.dataset.promptEnd;

  if (start && end) {
    const left = plotSize ? rect.left + plotSize.l : rect.left;
    const width = plotSize?.w || rect.width;
    const ratio = Math.min(Math.max((event.clientX - left) / width, 0), 1);
    const startTime = Date.parse(`${start}T00:00:00`);
    const endTime = Date.parse(`${end}T00:00:00`);

    if (Number.isFinite(startTime) && Number.isFinite(endTime)) {
      return toIsoDate(new Date(startTime + (endTime - startTime) * ratio));
    }
  }

  return chartNode.dataset.promptDate || null;
}

function buildMacroPrompt(dateText) {
  const selected = axisOrder;
  const analyses = selected.map((id) => {
    const indicator = getIndicator(id);
    return analyzeTurningPoints({
      id: indicator.id,
      name: indicator.name,
      unit: indicator.unitLabel,
      rows: indicatorData.get(id) || [],
      dateText,
      valueField: "value",
      decimals: indicator.decimals,
      suffix: indicator.valueSuffix,
    });
  });

  return [
    "Market indicator analysis request",
    "",
    `Selected date: ${dateText}`,
    `Dashboard section: US Macro`,
    `Visible range selected in dashboard: ${activeRange}`,
    `Selected indicators: ${selected.map((id) => getIndicator(id).name).join(", ") || "none"}`,
    "",
    "Turning point scan:",
    "- The dashboard searched up to 1 year before and 1 year after the selected date.",
    "- Turning points are detected from actual observations only; no forward fill or interpolation is used.",
    analyses.map((analysis) => analysis.line).join("\n"),
    "",
    formatLeadLag(analyses),
    "",
    "Please explain what was happening around this date and why these indicators may have moved up or down.",
    "Pay attention to the detected turning points and any lead/lag between the selected indicators.",
    "Use historical macro/market context, mention uncertainty, and avoid implying causation when the evidence is only correlation.",
  ].join("\n");
}

function buildFxPrompt(dateText) {
  const seriesDefinitions = fxSeriesDefinitions
    .filter((series) => visibleFxSeries.has(series.id))
    .map((series) => ({ ...series, unit: series.unitLabel }));

  const analyses = seriesDefinitions.map((series) =>
    analyzeTurningPoints({
      id: series.id,
      name: series.name,
      unit: series.unit,
      rows: fxData.map((row) => ({
        ...row,
        [series.field]: getFxDisplayValue(row[series.field], series),
      })),
      dateText,
      valueField: series.field,
      decimals: getFxDisplayDecimals(series),
      suffix: getFxDisplaySuffix(series),
    }),
  );

  return [
    "Market indicator analysis request",
    "",
    `Selected date: ${dateText}`,
    `Dashboard section: FX`,
    `Visible range selected in dashboard: ${activeFxRange}`,
    `Selected indicators: ${seriesDefinitions.map((series) => series.name).join(", ") || "none"}`,
    "",
    "Turning point scan:",
    "- The dashboard searched up to 1 year before and 1 year after the selected date.",
    "- Turning points are detected from actual observations only; no forward fill or interpolation is used.",
    analyses.map((analysis) => analysis.line).join("\n"),
    "",
    formatLeadLag(analyses),
    "",
    "Please explain what was happening around this date and why these indicators may have moved up or down.",
    "Pay attention to the detected turning points and any lead/lag between the selected indicators.",
    "Discuss relevant rate differentials, inflation trends, central bank expectations, risk sentiment, and major market events around the date.",
  ].join("\n");
}

function setupPromptCopy(chartNode, buildPrompt) {
  if (!chartNode || typeof chartNode.addEventListener !== "function" || chartNode.dataset.promptCopyReady === "true") {
    return;
  }

  chartNode.dataset.promptCopyReady = "true";

  if (typeof chartNode.on === "function") {
    chartNode.on("plotly_hover", (eventData) => {
      const hoveredDate = normalizePlotlyDate(eventData?.points?.[0]?.x);

      if (hoveredDate) {
        chartNode.dataset.promptDate = hoveredDate;
      }
    });
  }

  function clearLongPress() {
    const timer = longPressTimers.get(chartNode);

    if (timer?.timeoutId) {
      window.clearTimeout(timer.timeoutId);
    }

    longPressTimers.delete(chartNode);
  }

  async function finishLongPressCopy() {
    const timer = longPressTimers.get(chartNode);

    if (!timer?.ready || !timer.prompt || timer.copied) {
      clearLongPress();
      return;
    }

    timer.copied = true;

    try {
      await copyText(timer.prompt);
      showCopyToast("Copied");
    } catch {
      const prompt = timer.prompt;
      showCopyToast("Tap to copy", async () => {
        try {
          await copyText(prompt);
          showCopyToast("Copied");
        } catch {
          showCopyToast("Copy failed");
        }
      });
    } finally {
      clearLongPress();
    }
  }

  function startLongPress(event, clientX, clientY) {
    clearLongPress();
    const timer = {
      timeoutId: null,
      startX: clientX,
      startY: clientY,
      ready: false,
      copied: false,
      prompt: "",
    };

    timer.timeoutId = window.setTimeout(() => {
      const dateText = getDateFromChartPointer(chartNode, { clientX, clientY });

      if (!dateText) {
        clearLongPress();
        return;
      }

      timer.ready = true;
      timer.prompt = buildPrompt(dateText);
    }, longPressDelayMs);

    longPressTimers.set(chartNode, timer);
  }

  chartNode.addEventListener("pointerdown", (event) => {
    if (event.button && event.button !== 0) {
      return;
    }

    startLongPress(event, event.clientX, event.clientY);
  });

  function cancelWhenMoved(clientX, clientY) {
    const timer = longPressTimers.get(chartNode);

    if (!timer) {
      return;
    }

    const moved = Math.hypot(clientX - timer.startX, clientY - timer.startY);

    if (moved > longPressMoveLimit) {
      clearLongPress();
    }
  }

  chartNode.addEventListener("pointermove", (event) => {
    cancelWhenMoved(event.clientX, event.clientY);
  });

  chartNode.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) {
        clearLongPress();
        return;
      }

      const touch = event.touches[0];
      startLongPress(event, touch.clientX, touch.clientY);
    },
    { passive: true },
  );

  chartNode.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length !== 1) {
        clearLongPress();
        return;
      }

      const touch = event.touches[0];
      cancelWhenMoved(touch.clientX, touch.clientY);
    },
    { passive: true },
  );

  chartNode.addEventListener("touchend", finishLongPressCopy);
  chartNode.addEventListener("touchcancel", clearLongPress);

  chartNode.addEventListener("contextmenu", (event) => {
    if (longPressTimers.has(chartNode)) {
      event.preventDefault();
    }
  });

  chartNode.addEventListener("pointerup", finishLongPressCopy);

  ["pointercancel", "pointerleave"].forEach((eventName) => {
    chartNode.addEventListener(eventName, clearLongPress);
  });
}

function setupBoundedXAxis(chartNode, getBounds) {
  if (!chartNode || typeof chartNode.on !== "function" || chartNode.dataset.xBoundsGuard === "true") {
    return;
  }

  chartNode.dataset.xBoundsGuard = "true";
  chartNode.on("plotly_relayout", (eventData) => {
    if (clampingCharts.has(chartNode)) {
      return;
    }

    const bounds = getBounds();

    if (!bounds) {
      return;
    }

    const start = eventData["xaxis.range[0]"] || eventData["xaxis.range"]?.[0];
    const end = eventData["xaxis.range[1]"] || eventData["xaxis.range"]?.[1];
    const resetRequested = eventData["xaxis.autorange"] === true;

    if (!start || !end) {
      if (resetRequested) {
        clampingCharts.add(chartNode);
        Plotly.relayout(chartNode, { "xaxis.range": [bounds.start, bounds.end] }).then(() => {
          clampingCharts.delete(chartNode);
        });
      }
      return;
    }

    const allowedBounds = {
      start: bounds.allowedStart || bounds.start,
      end: bounds.allowedEnd || bounds.end,
    };
    const [clampedStart, clampedEnd] = clampDateRange(start, end, allowedBounds);

    const normalizedStart = toIsoDate(new Date(start));
    const normalizedEnd = toIsoDate(new Date(end));

    if (clampedStart !== normalizedStart || clampedEnd !== normalizedEnd) {
      clampingCharts.add(chartNode);
      Plotly.relayout(chartNode, { "xaxis.range": [clampedStart, clampedEnd] }).then(() => {
        clampingCharts.delete(chartNode);
      });
    }
  });
}

function getMobileYAxisAtPoint(chartNode, clientX) {
  const fullLayout = chartNode?._fullLayout;
  const plotSize = fullLayout?._size;

  if (!fullLayout || !plotSize) {
    return null;
  }

  const localX = clientX - chartNode.getBoundingClientRect().left;
  const axisPadding = 18;

  if (fullLayout.yaxis && fullLayout.yaxis.visible !== false && localX <= plotSize.l + axisPadding) {
    return "yaxis";
  }

  const rightPlotEdge = plotSize.l + plotSize.w;

  if (fullLayout.yaxis2 && fullLayout.yaxis2.visible !== false && localX >= rightPlotEdge - axisPadding) {
    return "yaxis2";
  }

  return null;
}

function setupMobileYAxisGestures(chartNode) {
  if (!chartNode || chartNode.dataset.mobileYAxisGesturesReady === "true") {
    return;
  }

  chartNode.dataset.mobileYAxisGesturesReady = "true";
  const doubleTapWindowMs = 420;
  const doubleTapDistancePx = 34;
  const tapMoveTolerancePx = 10;
  const tapDurationMs = 320;

  function getTouchCenter(touches) {
    const points = Array.from(touches);

    return {
      x: points.reduce((sum, touch) => sum + touch.clientX, 0) / points.length,
      y: points.reduce((sum, touch) => sum + touch.clientY, 0) / points.length,
    };
  }

  function getYAxisGestureMode(axisName, center) {
    const now = Date.now();
    const previousTap = mobileYAxisTapStates.get(chartNode);
    const isDoubleTap =
      previousTap &&
      previousTap.axisName === axisName &&
      now - previousTap.time <= doubleTapWindowMs &&
      Math.hypot(center.x - previousTap.x, center.y - previousTap.y) <= doubleTapDistancePx;

    if (isDoubleTap) {
      mobileYAxisTapStates.delete(chartNode);
      return "zoom";
    }

    return "pan";
  }

  function beginGesture(touches) {
    if (!usesTouchChartMode() || touches.length < 1 || touches.length > 2) {
      return false;
    }

    const center = getTouchCenter(touches);
    const axisName = getMobileYAxisAtPoint(chartNode, center.x);
    const range = chartNode._fullLayout?.[axisName]?.range?.map(Number);

    if (!axisName || range?.length !== 2 || range.some((value) => !Number.isFinite(value))) {
      return false;
    }

    const distance =
      touches.length === 2 ? Math.max(Math.abs(touches[0].clientY - touches[1].clientY), 24) : null;
    const gestureMode = touches.length === 2 ? "zoom" : getYAxisGestureMode(axisName, center);

    mobileYAxisGestureStates.set(chartNode, {
      axisName,
      mode: gestureMode,
      startX: center.x,
      startY: center.y,
      startedAt: Date.now(),
      maxMovement: 0,
      startDistance: distance,
      startRange: range,
      touchCount: touches.length,
      pendingRange: null,
      animationFrame: null,
    });
    chartNode.dataset.mobileYAxisActive = axisName;
    return true;
  }

  function scheduleRange(state, range) {
    const axis = chartNode._fullLayout?.[state.axisName];
    let nextRange = range;

    if (axis && Number.isFinite(axis.minallowed) && Number.isFinite(axis.maxallowed)) {
      const span = Math.min(nextRange[1] - nextRange[0], axis.maxallowed - axis.minallowed);
      let start = nextRange[0];
      let end = nextRange[0] + span;

      if (start < axis.minallowed) {
        start = axis.minallowed;
        end = start + span;
      }

      if (end > axis.maxallowed) {
        end = axis.maxallowed;
        start = end - span;
      }

      nextRange = [start, end];
    }

    state.pendingRange = nextRange;

    if (state.animationFrame) {
      return;
    }

    state.animationFrame = window.requestAnimationFrame(() => {
      state.animationFrame = null;
      const nextRange = state.pendingRange;
      state.pendingRange = null;

      if (nextRange && window.Plotly) {
        Plotly.relayout(chartNode, {
          [`${state.axisName}.autorange`]: false,
          [`${state.axisName}.range`]: nextRange,
        });
      }
    });
  }

  function clearGesture(recordTap = false) {
    const state = mobileYAxisGestureStates.get(chartNode);

    if (
      recordTap &&
      state?.mode === "pan" &&
      state.touchCount === 1 &&
      state.maxMovement <= tapMoveTolerancePx &&
      Date.now() - state.startedAt <= tapDurationMs
    ) {
      mobileYAxisTapStates.set(chartNode, {
        axisName: state.axisName,
        time: Date.now(),
        x: state.startX,
        y: state.startY,
      });
    }

    if (state?.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
    }

    if (state?.pendingRange && window.Plotly) {
      Plotly.relayout(chartNode, {
        [`${state.axisName}.autorange`]: false,
        [`${state.axisName}.range`]: state.pendingRange,
      });
    }

    mobileYAxisGestureStates.delete(chartNode);
    delete chartNode.dataset.mobileYAxisActive;
  }

  chartNode.addEventListener(
    "pointerdown",
    (event) => {
      if (!usesTouchChartMode() || event.pointerType === "mouse") {
        return;
      }

      const axisName = getMobileYAxisAtPoint(chartNode, event.clientX);

      if (axisName) {
        chartNode.dataset.mobileYAxisActive = axisName;
        event.stopImmediatePropagation();
      }
    },
    { capture: true },
  );

  chartNode.addEventListener(
    "touchstart",
    (event) => {
      if (!beginGesture(event.touches)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true, passive: false },
  );

  chartNode.addEventListener(
    "touchmove",
    (event) => {
      const state = mobileYAxisGestureStates.get(chartNode);

      if (!state || event.touches.length !== state.touchCount) {
        return;
      }

      const center = getTouchCenter(event.touches);
      state.maxMovement = Math.max(
        state.maxMovement,
        Math.hypot(center.x - state.startX, center.y - state.startY),
      );

      if (state.mode === "pan") {
        const fullLayout = chartNode._fullLayout;
        const plotHeight = Math.max(fullLayout?._size?.h || chartNode.clientHeight || 1, 1);
        const span = state.startRange[1] - state.startRange[0];
        const shift = ((center.y - state.startY) / plotHeight) * span;
        scheduleRange(state, [state.startRange[0] + shift, state.startRange[1] + shift]);
      } else {
        let scale;

        if (state.touchCount === 2) {
          const distance = Math.max(Math.abs(event.touches[0].clientY - event.touches[1].clientY), 24);
          scale = state.startDistance / distance;
        } else {
          scale = Math.exp((center.y - state.startY) / 180);
        }

        scale = Math.min(Math.max(scale, 0.15), 6);
        const midpoint = (state.startRange[0] + state.startRange[1]) / 2;
        const halfSpan = ((state.startRange[1] - state.startRange[0]) / 2) * scale;
        scheduleRange(state, [midpoint - halfSpan, midpoint + halfSpan]);
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true, passive: false },
  );

  ["touchend", "touchcancel"].forEach((eventName) => {
    chartNode.addEventListener(
      eventName,
      (event) => {
        if (!mobileYAxisGestureStates.has(chartNode)) {
          return;
        }

        clearGesture(eventName === "touchend");
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true, passive: false },
    );
  });

  ["pointerup", "pointercancel"].forEach((eventName) => {
    chartNode.addEventListener(
      eventName,
      () => {
        if (!mobileYAxisGestureStates.has(chartNode)) {
          delete chartNode.dataset.mobileYAxisActive;
        }
      },
      { capture: true },
    );
  });
}

function setupMobileXAxisGestures(chartNode) {
  if (!chartNode || chartNode.dataset.mobileXAxisGesturesReady === "true") {
    return;
  }

  chartNode.dataset.mobileXAxisGesturesReady = "true";
  const doubleTapWindowMs = 420;
  const doubleTapDistancePx = 34;
  let lastTap = null;
  let state = null;

  function isXAxisTarget(touch) {
    const layout = chartNode._fullLayout;
    const size = layout?._size;
    const rect = chartNode.getBoundingClientRect();
    if (!size) return false;
    const localX = touch.clientX - rect.left;
    const localY = touch.clientY - rect.top;
    return (
      localX >= size.l &&
      localX <= size.l + size.w &&
      localY >= size.t + size.h - 24 &&
      localY <= size.t + size.h + 38
    );
  }

  function rangeToMillis(range) {
    const values = range?.map((value) => Date.parse(value));
    return values?.length === 2 && values.every(Number.isFinite) ? values : null;
  }

  function clampRange(range) {
    const axis = chartNode._fullLayout?.xaxis;
    const min = Date.parse(axis?.minallowed);
    const max = Date.parse(axis?.maxallowed);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return range;
    const span = Math.min(range[1] - range[0], max - min);
    let start = range[0];
    let end = start + span;
    if (start < min) {
      start = min;
      end = start + span;
    }
    if (end > max) {
      end = max;
      start = end - span;
    }
    return [start, end];
  }

  function applyRange(range) {
    const [start, end] = clampRange(range);
    Plotly.relayout(chartNode, {
      "xaxis.autorange": false,
      "xaxis.range": [toIsoDate(new Date(start)), toIsoDate(new Date(end))],
    });
  }

  chartNode.addEventListener(
    "touchstart",
    (event) => {
      if (!usesTouchChartMode() || event.touches.length < 1 || event.touches.length > 2) return;
      const touches = Array.from(event.touches);
      if (!touches.every(isXAxisTarget)) return;
      const centerX = touches.reduce((total, touch) => total + touch.clientX, 0) / touches.length;
      const range = rangeToMillis(chartNode._fullLayout?.xaxis?.range);
      if (!range) return;
      const now = Date.now();
      const isDoubleTap =
        touches.length === 1 &&
        lastTap &&
        now - lastTap.time <= doubleTapWindowMs &&
        Math.abs(centerX - lastTap.x) <= doubleTapDistancePx;
      state = {
        mode: touches.length === 2 || isDoubleTap ? "zoom" : "pan",
        startX: centerX,
        startRange: range,
        startDistance: touches.length === 2 ? Math.max(Math.abs(touches[0].clientX - touches[1].clientX), 24) : null,
        touchCount: touches.length,
        moved: false,
      };
      lastTap = null;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true, passive: false },
  );

  chartNode.addEventListener(
    "touchmove",
    (event) => {
      if (!state || event.touches.length !== state.touchCount) return;
      const touches = Array.from(event.touches);
      const centerX = touches.reduce((total, touch) => total + touch.clientX, 0) / touches.length;
      const plotWidth = Math.max(chartNode._fullLayout?._size?.w || chartNode.clientWidth, 1);
      const span = state.startRange[1] - state.startRange[0];
      state.moved ||= Math.abs(centerX - state.startX) > 4;
      if (state.mode === "pan") {
        const shift = ((centerX - state.startX) / plotWidth) * span;
        applyRange([state.startRange[0] - shift, state.startRange[1] - shift]);
      } else {
        const distance = state.touchCount === 2
          ? Math.max(Math.abs(touches[0].clientX - touches[1].clientX), 24)
          : Math.max(Math.abs(centerX - state.startX), 24);
        const scale = state.touchCount === 2
          ? Math.min(Math.max(state.startDistance / distance, 0.15), 6)
          : Math.min(Math.max(Math.exp((centerX - state.startX) / 180), 0.15), 6);
        const center = (state.startRange[0] + state.startRange[1]) / 2;
        const halfSpan = (span / 2) * scale;
        applyRange([center - halfSpan, center + halfSpan]);
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true, passive: false },
  );

  ["touchend", "touchcancel"].forEach((eventName) => {
    chartNode.addEventListener(
      eventName,
      (event) => {
        if (!state) return;
        if (eventName === "touchend" && state.touchCount === 1 && !state.moved) {
          lastTap = { time: Date.now(), x: state.startX };
        }
        state = null;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true, passive: false },
    );
  });
}

function canUseLog(rows) {
  return rows.length > 0 && rows.every((row) => row.value > 0);
}

function selectedRowsAllowLog() {
  return axisOrder.every((id) => canUseLog(getFilteredRows(id)));
}

function renderCards() {
  indicatorGrid.innerHTML = indicators
    .map((indicator) => {
      const rows = indicatorData.get(indicator.id) || [];
      const latest = rows.at(-1);
      const isActive = selectedIndicatorIds.includes(indicator.id);
      const isUnavailable = !latest;

      return `
        <article class="metric-card indicator-card ${isActive ? "active" : ""} ${isUnavailable ? "unavailable" : ""}" data-indicator="${indicator.id}" data-glossary-id="${indicatorGlossaryIds[indicator.id] || ""}" tabindex="0" ${isUnavailable ? 'aria-disabled="true"' : ""}>
          <span class="indicator-label">${indicator.name}</span>
          <strong>${latest ? formatValue(latest.value, indicator) : "--"}</strong>
          ${renderIndicatorChange(rows, indicator)}
          ${latest ? "" : '<small class="indicator-date">Unavailable</small>'}
          ${renderColorPalette({
            activeColor: getIndicatorColor(indicator.id),
            targetId: indicator.id,
            targetType: "macro",
          })}
        </article>
      `;
    })
    .join("");

  function toggleCard(card) {
      const id = card.dataset.indicator;

      if ((indicatorData.get(id) || []).length === 0) {
        showNotice(`${getIndicator(id).name} data is currently unavailable.`);
        return;
      }

      if (selectedIndicatorIds.includes(id)) {
        selectedIndicatorIds = selectedIndicatorIds.filter((selectedId) => selectedId !== id);
      } else {
        const nextIds = [...selectedIndicatorIds, id];
        if (!canShareComparisonAxes(nextIds, getIndicator)) {
          showNotice(comparisonLimitMessage());
          return;
        }
        selectedIndicatorIds = nextIds;
      }

      clearNotice();
      manualAxisOrder = false;
      syncAxisOrder();
      validateMacroScale();
      renderAll();
  }

  indicatorGrid.querySelectorAll("[data-indicator]").forEach((card) => {
    card.addEventListener("click", () => {
      if (consumeLongPressClick(card)) {
        return;
      }
      toggleCard(card);
    });
    attachLongPress(card, () => openGlossaryEntry(card.dataset.glossaryId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard(card);
      }
    });
  });

  indicatorGrid.querySelectorAll("[data-color-control]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    control.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });
  });

  indicatorGrid.querySelectorAll("[data-color-menu-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleColorPanel(button);
    });
  });

  indicatorGrid.querySelectorAll("[data-color-indicator]").forEach((swatch) => {
    swatch.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });
    swatch.addEventListener("click", (event) => {
      event.stopPropagation();
      setIndicatorColor(swatch.dataset.colorIndicator, swatch.dataset.colorValue);
      closeColorPanels();
      renderCards();
      renderChart();
    });
  });
}

function renderRangeButtons() {
  rangeButtons.forEach((button) => {
    const isActive = button.dataset.range === activeRange;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const compactAxisNameOverrides = {
  "rsp-spy": "RSP/SPY",
  "new-high-low-breadth": "New High-Low",
  "sp500-above-200dma": "% Above 200DMA",
  "us-10y-term-premium": "US 10Y Term Premium",
  "japan-2y-jgb-yield": "Japan 2Y Yield",
  "japan-10y-jgb-yield": "Japan 10Y Yield",
  "japan-tab-10y-jgb-yield": "Japan 10Y Yield",
  "japan-10y-2y-jgb-spread": "Japan 10Y-2Y Spread",
  "japan-foreign-investor-net-buying": "Japan Foreign Net Buying",
  "taiwan-foreign-investor-net-buying": "Taiwan Foreign Net Buying",
  "taiwan-margin-financing-balance-yoy": "Taiwan Margin Balance YoY",
  "taiwan-electronics-exports-yoy": "Taiwan Electronics Exports YoY",
  "ism-manufacturing-pmi": "ISM PMI",
};

function getCompactAxisUnit(unitLabel) {
  const unitAliases = {
    "Percentage Points": "pp",
    Percent: "%",
    "Percent YoY": "% YoY",
    "Millions of U.S. Dollars": "USD mn",
    "TWD Millions": "TWD mn",
    "JPY Billions": "JPY bn",
    "Cumulative Net Advances": "Net Advances",
    "Diffusion Index": "Index",
    "Adjusted-close ratio": "Ratio",
  };

  return unitAliases[unitLabel] || unitLabel;
}

function getVisibleAxisUnit(name, unitLabel) {
  const unit = getCompactAxisUnit(unitLabel);

  if (unit === "% YoY" && /\bYoY\b/i.test(name)) {
    return "%";
  }

  if (unit === "JPY per USD" || unit === "TWD per USD") {
    return "";
  }

  return unit;
}

const axisLabelOverrides = {
  "japan-10y-jgb-yield": "Japan 10Y<br>Yield",
  "japan-tab-10y-jgb-yield": "Japan 10Y<br>Yield",
  "japan-foreign-investor-net-buying": "Japan<br>Foreign<br>Net Buying",
  "us-initial-jobless-claims": "US Initial<br>Jobless<br>Claims",
};

// Official BOJ meeting end dates, published with the annual MPM schedule.
const bojPolicyMeetingDates = [
  "2025-01-24", "2025-03-19", "2025-05-01", "2025-06-17",
  "2025-07-31", "2025-09-19", "2025-10-30", "2025-12-19",
  "2026-01-23", "2026-03-19", "2026-04-28", "2026-06-16",
  "2026-07-31", "2026-09-18", "2026-10-30", "2026-12-18",
  "2027-01-22", "2027-03-18", "2027-04-28", "2027-06-11",
  "2027-07-22", "2027-09-22", "2027-10-29", "2027-12-17",
];

const quarterPointRateIds = new Set([
  "fed-funds-rate",
  "cme-expected-policy-rate",
  "boj-policy-rate",
  "boj-implied-rate",
]);

function wrapHorizontalAxisLabel(indicator) {
  if (axisLabelOverrides[indicator.id]) {
    return axisLabelOverrides[indicator.id];
  }

  let label = compactAxisNameOverrides[indicator.id] || indicator.name;
  const unit = getVisibleAxisUnit(label, indicator.unitLabel);

  if (unit === "Index" && /\sIndex$/i.test(label)) {
    label = label.replace(/\sIndex$/i, "");
  }

  if (unit === "%" && label.startsWith("% ")) {
    label = label.slice(2);
  }

  if (label.length <= 12) {
    return label;
  }

  const words = label.split(/\s+/);
  const lineCount = label.length > 28 && words.length >= 4 ? 4 : label.length > 16 && words.length >= 3 ? 3 : 2;
  const lines = [];
  let start = 0;

  for (let lineIndex = 0; lineIndex < lineCount - 1; lineIndex += 1) {
    const remainingLines = lineCount - lineIndex;
    const targetLength = words.slice(start).join(" ").length / remainingLines;
    let end = start + 1;

    while (
      end < words.length - (remainingLines - 1) &&
      words.slice(start, end + 1).join(" ").length <= targetLength
    ) {
      end += 1;
    }

    lines.push(words.slice(start, end).join(" "));
    start = end;
  }

  lines.push(words.slice(start).join(" "));
  return lines.join("<br>");
}

function getHorizontalAxisAnnotations(indicator, side, color) {
  const compactLayout = usesTouchChartMode();
  const nameOffset = compactLayout ? 68 : 76;
  const axisFontSize = compactLayout ? 10 : 11;
  const unit = getVisibleAxisUnit(indicator.name, indicator.unitLabel);

  return [
    {
      text: `<b>${wrapHorizontalAxisLabel(indicator)}</b>`,
      xref: "paper",
      yref: "paper",
      x: side === "left" ? 0 : 1,
      y: 0.5,
      xanchor: "center",
      yanchor: "middle",
      xshift: side === "left" ? -nameOffset : nameOffset,
      showarrow: false,
      align: "center",
      font: { size: axisFontSize, color },
    },
    unit
      ? {
          text: `<b>${unit}</b>`,
          xref: "paper",
          yref: "paper",
          x: side === "left" ? 0 : 1,
          y: 1,
          xanchor: side === "left" ? "right" : "left",
          yanchor: "middle",
          xshift: side === "left" ? -48 : 48,
          showarrow: false,
          font: { size: axisFontSize, color },
        }
      : null,
  ].filter(Boolean);
}

function getAxisGroupAnnotations(ids, side, getDefinition, theme) {
  if (ids.length === 0) {
    return [];
  }

  if (ids.length === 1) {
    return getHorizontalAxisAnnotations(
      getDefinition(ids[0]),
      side,
      getChartSeriesColor(ids[0]),
    );
  }

  return [
    {
      text: "<b>%</b>",
      xref: "paper",
      yref: "paper",
      x: side === "left" ? 0 : 1,
      y: 1,
      xanchor: side === "left" ? "right" : "left",
      yanchor: "middle",
      xshift: side === "left" ? -48 : 48,
      showarrow: false,
      font: { size: usesTouchChartMode() ? 10 : 11, color: theme.ink },
    },
  ];
}

function getHorizontalAxisMargins(hasRightAxis, hasLeftAxis = true) {
  const sideMargin = usesTouchChartMode() ? 100 : 110;
  return {
    t: usesTouchChartMode() ? 42 : 48,
    r: hasRightAxis ? sideMargin : 22,
    b: usesTouchChartMode() ? 58 : 92,
    l: hasLeftAxis ? sideMargin : 22,
  };
}

function getAxisGroupColor(ids, theme) {
  return ids.length === 1 ? getChartSeriesColor(ids[0]) : theme.ink;
}

function getYAxisLayout(side, indicator, rows, theme = getChartTheme(), axisColor = theme.ink) {
  const scale = macroScale === "log" && canUseLog(rows) ? "log" : "linear";
  const range = getAutoRange(rows, scale, indicator.axisBounds, indicator.chartType === "bar");
  const axis = {
    gridcolor: side === "left" ? theme.grid : "rgba(0,0,0,0)",
    zeroline: true,
    zerolinecolor: theme.zero,
    tickfont: { color: axisColor, size: usesTouchChartMode() ? 10 : 11, weight: 700 },
    type: scale,
  };

  if (indicator.axisBounds) {
    axis.minallowed = indicator.axisBounds.min;
    axis.maxallowed = indicator.axisBounds.max;
  }

  if (range) {
    axis.range = scale === "log" ? range.map((value) => Math.log10(value)) : range;
  }

  if (side === "right") {
    axis.overlaying = "y";
    axis.side = "right";
    axis.showgrid = false;
  }

  return axis;
}

function getLinearAxisRange(axis) {
  if (!axis || axis.type === "log" || !Array.isArray(axis.range)) {
    return null;
  }

  const [first, second] = axis.range.map(Number);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }

  return [Math.min(first, second), Math.max(first, second)];
}

function getChartIndicatorDefinition(id) {
  return [
    ...indicators,
    ...breadthIndicators,
    ...usRatesIndicators,
    ...jpRatesIndicators,
    ...japanIndicators,
    ...taiwanIndicators,
  ].find((indicator) => indicator.id === id);
}

function getThresholdRect(yref, y0, y1, fillcolor) {
  if (!Number.isFinite(y0) || !Number.isFinite(y1) || y1 <= y0) {
    return null;
  }

  return {
    type: "rect",
    xref: "paper",
    yref,
    x0: 0,
    x1: 1,
    y0,
    y1,
    fillcolor,
    line: { width: 0 },
    layer: "below",
  };
}

function getThresholdEdgeShapes(zone, yref, min, max) {
  const span = Math.max(max - min, 0.000001);
  const bandSize = span * 0.018;
  const edgeColors = thresholdEdgeColors[zone.tone] || [];
  const shapes = [];

  function addBands(anchor, direction) {
    edgeColors.forEach((color, index) => {
      const inner = anchor + direction * bandSize * index;
      const outer = anchor + direction * bandSize * (index + 1);
      const y0 = Math.max(Math.min(inner, outer), min);
      const y1 = Math.min(Math.max(inner, outer), max);
      const shape = getThresholdRect(yref, y0, y1, color);

      if (shape) {
        shapes.push(shape);
      }
    });
  }

  if (Number.isFinite(zone.to) && zone.to > min && zone.to < max) {
    addBands(zone.to, 1);
  }

  if (Number.isFinite(zone.from) && zone.from > min && zone.from < max) {
    addBands(zone.from, -1);
  }

  return shapes;
}

function getThresholdZoneShapes(selected, layout, axisById = null) {
  if (selected.length !== 1) {
    return [];
  }

  const selectedWithZones = selected.filter((indicatorId) => indicatorThresholdZones[indicatorId]);
  if (selectedWithZones.length !== 1) {
    return [];
  }

  return selectedWithZones.flatMap((indicatorId) => {
    const zones = indicatorThresholdZones[indicatorId];
    const indicator = getChartIndicatorDefinition(indicatorId);

    if (!zones) {
      return [];
    }

    const assignedAxis = axisById?.get(indicatorId) || "y";
    const axisName = assignedAxis === "y" ? "yaxis" : "yaxis2";
    const yref = assignedAxis;
    const range = getLinearAxisRange(layout[axisName]);

    if (!range) {
      return [];
    }

    const [min, max] = range;
    const extension = Math.max((max - min) * 100, 1000000);
    const lowerLimit = Number.isFinite(indicator?.axisBounds?.min) ? indicator.axisBounds.min : min - extension;
    const upperLimit = Number.isFinite(indicator?.axisBounds?.max) ? indicator.axisBounds.max : max + extension;

    return zones.flatMap((zone) => {
      const y0 = zone.from ?? lowerLimit;
      const y1 = zone.to ?? upperLimit;
      const baseShape = getThresholdRect(yref, y0, y1, thresholdZoneColors[zone.tone]);

      return [baseShape, ...getThresholdEdgeShapes(zone, yref, min, max)].filter(Boolean);
    });
  });
}

function renderChart() {
  validateMacroScale();
  const selected = axisOrder;
  const { leftIds, rightIds } = getAxisGroups(selected, getIndicator);
  const axisById = new Map([
    ...leftIds.map((id) => [id, "y"]),
    ...rightIds.map((id) => [id, "y2"]),
  ]);
  const traces = selected.map((id) => {
    const indicator = getIndicator(id);
    const rawRows = getFilteredRows(id);
    const rows = getUnitDisplayRows(rawRows, indicator);
    const hoverTemplate = getCompactHoverTemplate(
      getChartSeriesColor(indicator.id),
      "%{customdata[0]}",
    );

    return {
      x: rows.map((row) => row.date),
      y: rows.map((row) => row.value),
      customdata: rawRows.map((row) => [formatDisplayNumber(row.value, indicator)]),
      type: indicator.chartType || "scatter",
      name: indicator.name,
      yaxis: axisById.get(id),
      ...(indicator.chartType === "bar"
        ? { marker: { color: getChartSeriesColor(indicator.id), opacity: 0.82 } }
        : {
            mode: rows.length === 1 ? "lines+markers" : "lines",
            line: {
              color: getChartSeriesColor(indicator.id),
              width: 1.5,
              dash: "solid",
              shape: indicator.lineShape || "linear",
            },
            ...(rows.length === 1
              ? { marker: { size: 8, color: getChartSeriesColor(indicator.id) } }
              : {}),
          }),
      hovertemplate: hoverTemplate,
    };
  });

  const title = selected.map((id) => getIndicator(id).name).join(" vs ");
  chartTitle.textContent = title || "Select indicators";

  const xBounds = getMacroXBounds();
  const getDisplayChartRows = (id) => getUnitDisplayRows(getFilteredRows(id), getIndicator(id));
  const leftRows = combineRows(leftIds, getDisplayChartRows);
  const rightRows = combineRows(rightIds, getDisplayChartRows);
  const leftIndicator = leftIds[0] ? getDisplayIndicator(getIndicator(leftIds[0])) : null;
  const rightIndicator = rightIds[0] ? getDisplayIndicator(getIndicator(rightIds[0])) : null;
  if (rightIndicator && rightIds.length > 1) {
    delete rightIndicator.axisBounds;
  }
  const theme = getChartTheme();
  const axisAnnotations = [
    ...getAxisGroupAnnotations(leftIds, "left", getIndicator, theme),
    ...getAxisGroupAnnotations(rightIds, "right", getIndicator, theme),
  ];

  const layout = {
    margin: getHorizontalAxisMargins(rightIds.length > 0, leftIds.length > 0),
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: theme.ink,
    },
    legend: {
      orientation: "h",
      x: 0.5,
      xanchor: "center",
      y: usesTouchChartMode() ? -0.1 : -0.22,
      yanchor: "top",
    },
    annotations: axisAnnotations,
    xaxis: {
      range: xBounds ? [xBounds.start, xBounds.end] : undefined,
      minallowed: xBounds?.start,
      maxallowed: xBounds?.end,
      showgrid: false,
      tickformat: getDateTickFormat(activeRange),
      hoverformat: "%Y/%-m/%-d",
      tickfont: { color: theme.muted, weight: 700 },
    },
    hoverlabel: {
      bgcolor: theme.surface,
      bordercolor: theme.line,
      font: { color: theme.ink },
    },
    hovermode: "x unified",
    dragmode: getChartDragMode(),
  };

  if (leftIndicator) {
    layout.yaxis = getYAxisLayout(
      "left",
      leftIndicator,
      leftRows,
      theme,
      getAxisGroupColor(leftIds, theme),
    );
  } else {
    layout.yaxis = { visible: false };
  }

  if (rightIndicator) {
    layout.yaxis2 = getYAxisLayout(
      "right",
      rightIndicator,
      rightRows,
      theme,
      getAxisGroupColor(rightIds, theme),
    );
  }

  layout.shapes = getThresholdZoneShapes(selected, layout, axisById);

  if (chartElement && window.Plotly) {
    chartDetailTraces.set(chartElement, traces);
    Plotly.react(chartElement, traces, layout, getPlotlyConfig()).then(() => {
      setupChartModebar(
        chartElement,
        macroLogScaleInput,
        null,
        null,
      );

      if (xBounds) {
        chartElement.dataset.promptStart = xBounds.start;
        chartElement.dataset.promptEnd = xBounds.end;
      }

      setupBoundedXAxis(chartElement, getMacroXBounds);
      setupMobileYAxisGestures(chartElement);
      setupMobileXAxisGestures(chartElement);
      setupChartDetailInteraction(chartElement);
      setupPromptCopy(chartElement, buildMacroPrompt);
    });
  }
}

function shiftFxDateByRange(endDate, rangeKey) {
  const startDate = new Date(endDate);
  const amount = Number(rangeKey.slice(0, -1));
  const unit = rangeKey.slice(-1);

  if (unit === "M") {
    startDate.setMonth(startDate.getMonth() - amount);
  } else {
    startDate.setFullYear(startDate.getFullYear() - amount);
  }

  return startDate;
}

function getFxXBounds() {
  if (fxData.length === 0) {
    return null;
  }

  const latestDateText = fxData.at(-1).date;
  const endDate = toDate(latestDateText);
  const startDate = activeFxRange === "Max" ? toDate(fxData[0].date) : shiftFxDateByRange(endDate, activeFxRange);

  return {
    start: toIsoDate(startDate),
    end: toIsoDate(endDate),
  };
}

function getFxRangeStart(rows) {
  if (activeFxRange === "Max") {
    return null;
  }

  return shiftFxDateByRange(toDate(rows.at(-1).date), activeFxRange);
}

function getFilteredFxRows() {
  if (fxData.length === 0) {
    return [];
  }

  const bounds = getFxXBounds();

  if (!bounds) {
    return fxData;
  }

  return fxData.filter((row) => row.date >= bounds.start && row.date <= bounds.end);
}

function latestWith(field) {
  return [...fxData].reverse().find((row) => Number.isFinite(row[field]));
}

function setFxText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function setFxHtml(id, html) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = html;
  }
}

function getFxDisplayValue(value, series) {
  if (value === null || value === undefined || value === "") {
    return Number.NaN;
  }

  const divisor = Number.isFinite(series.displayDivisor) && series.displayDivisor !== 0 ? series.displayDivisor : 1;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue / divisor : Number.NaN;
}

function getFxDisplayDecimals(series) {
  return series.displayDecimals ?? series.decimals;
}

function getFxDisplaySuffix(series) {
  return series.displaySuffix ?? series.suffix;
}

function formatFxCardValue(value, series) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: getFxDisplayDecimals(series),
    maximumFractionDigits: getFxDisplayDecimals(series),
  }).format(getFxDisplayValue(value, series));

  return `${formatted}${getFxDisplaySuffix(series)}`;
}

function renderFxCards() {
  const latestAny = fxData.at(-1);

  fxSeriesDefinitions.forEach((series) => {
    const latest = latestWith(series.field);
    const rows = fxData
      .filter((row) => Number.isFinite(row[series.field]))
      .map((row) => ({ date: row.date, value: row[series.field] }));

    setFxText(
      series.valueElementId,
      latest ? formatFxCardValue(latest[series.field], series) : "--",
    );
    setFxHtml(
      series.changeElementId,
      renderIndicatorChange(rows, {
        ...series,
        id: series.changeIndicatorId,
      }),
    );
  });

  setFxText(
    "fx-updated",
    latestAny ? `Latest observation ${formatFullDate(latestAny.date)}` : "FX data unavailable",
  );

  fxCards.forEach((card) => {
    const active = visibleFxSeries.has(card.dataset.fxCard);
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("[data-fx-color-control]").forEach((control) => {
    const id = control.dataset.fxColorControl;
    control.innerHTML = renderColorPaletteContent({
      activeColor: getIndicatorColor(id),
      targetId: id,
      targetType: "fx",
    });

    control.querySelectorAll("[data-fx-color]").forEach((swatch) => {
      swatch.addEventListener("click", (event) => {
        event.stopPropagation();
        setIndicatorColor(swatch.dataset.fxColor, swatch.dataset.colorValue);
        closeColorPanels();
        renderFxCards();
        renderFxChart();
      });
      swatch.addEventListener("keydown", (event) => {
        event.stopPropagation();
      });
    });

    control.querySelectorAll("[data-color-menu-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleColorPanel(button);
      });
    });
  });
}

function fxAxisRange(values, includeZero = false) {
  const finiteValues = values.filter((value) => Number.isFinite(value));

  if (finiteValues.length === 0) {
    return undefined;
  }

  let min = Math.min(...finiteValues);
  let max = Math.max(...finiteValues);

  if (includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }

  if (min === max) {
    const padding = Math.abs(min || 1) * 0.12;
    min -= padding;
    max += padding;
  } else {
    const padding = max - min;
    min -= padding * 0.08;
    max += padding * 0.16;
  }

  return [min, max];
}

function renderFxChart() {
  if (!fxChartElement || !window.Plotly || fxData.length === 0) {
    return;
  }

  const rows = getFilteredFxRows();
  const fxSeries = fxSeriesDefinitions
    .filter((series) => visibleFxSeries.has(series.id))
    .map((series) => ({ ...series, color: getChartSeriesColor(series.id) }));
  const getFxDefinition = (id) => fxSeriesDefinitions.find((series) => series.id === id);
  const selectedIds = fxSeries.map((series) => series.id);
  const { leftIds, rightIds } = getAxisGroups(selectedIds, getFxDefinition);
  const axisById = new Map([
    ...leftIds.map((id) => [id, "y"]),
    ...rightIds.map((id) => [id, "y2"]),
  ]);

  const traces = fxSeries.map((series) => {
    const seriesRows = rows.filter((row) => Number.isFinite(row[series.field]));

    return {
      x: seriesRows.map((row) => row.date),
      y: seriesRows.map((row) => getFxDisplayValue(row[series.field], series)),
      customdata: seriesRows.map((row) => [
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: getFxDisplayDecimals(series),
          maximumFractionDigits: getFxDisplayDecimals(series),
        }).format(getFxDisplayValue(row[series.field], series)),
      ]),
      type: series.chartType || "scatter",
      ...(series.chartType === "bar"
        ? { marker: { color: series.color, opacity: 0.82 } }
        : {
            mode: seriesRows.length === 1 ? "lines+markers" : "lines",
            line: { color: series.color, width: 1.5 },
          }),
      name: series.name,
      yaxis: axisById.get(series.id),
      ...(series.chartType !== "bar" && seriesRows.length === 1
        ? { marker: { size: 8, color: series.color } }
        : {}),
      hovertemplate: getCompactHoverTemplate(series.color, "%{customdata[0]}"),
    };
  });

  const leftValues = leftIds.flatMap((id) => {
    const series = getFxDefinition(id);
    return rows.map((row) => getFxDisplayValue(row[series.field], series));
  });
  const rightValues = rightIds.flatMap((id) => {
    const series = getFxDefinition(id);
    return rows.map((row) => getFxDisplayValue(row[series.field], series));
  });
  const xBounds = getFxXBounds();
  const theme = getChartTheme();
  const yaxis = leftIds.length
    ? {
        range: fxAxisRange(leftValues, leftIds.some((id) => getFxDefinition(id).chartType === "bar")),
        tickfont: {
          color: getAxisGroupColor(leftIds, theme),
          size: usesTouchChartMode() ? 10 : 11,
          weight: 700,
        },
        gridcolor: theme.grid,
        zeroline: false,
      }
    : {
        visible: false,
      };
  const yaxis2 = rightIds.length
    ? {
        range: fxAxisRange(rightValues, rightIds.some((id) => getFxDefinition(id).chartType === "bar")),
        tickfont: {
          color: getAxisGroupColor(rightIds, theme),
          size: usesTouchChartMode() ? 10 : 11,
          weight: 700,
        },
        overlaying: "y",
        side: "right",
        showgrid: false,
        zeroline: false,
      }
    : {
        visible: false,
        overlaying: "y",
        side: "right",
        showgrid: false,
      };

  const fxAxisAnnotations = [
    ...getAxisGroupAnnotations(leftIds, "left", getFxDefinition, theme),
    ...getAxisGroupAnnotations(rightIds, "right", getFxDefinition, theme),
  ];

  chartDetailTraces.set(fxChartElement, traces);
  Plotly.react(
    fxChartElement,
    traces,
    {
      margin: getHorizontalAxisMargins(rightIds.length > 0, leftIds.length > 0),
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: theme.ink,
      },
      legend: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: usesTouchChartMode() ? -0.1 : -0.22,
        yanchor: "top",
      },
      annotations: fxAxisAnnotations,
      xaxis: {
        range: xBounds ? [xBounds.start, xBounds.end] : undefined,
        minallowed: xBounds?.start,
        maxallowed: xBounds?.end,
        showgrid: false,
        tickformat: getDateTickFormat(activeFxRange),
        hoverformat: "%Y/%-m/%-d",
        tickfont: { color: theme.muted, weight: 700 },
      },
      yaxis,
      yaxis2,
      hoverlabel: {
        bgcolor: theme.surface,
        bordercolor: theme.line,
        font: { color: theme.ink },
      },
      hovermode: "x unified",
      dragmode: getChartDragMode(),
    },
    getPlotlyConfig(),
  ).then(() => {
    setupChartModebar(fxChartElement);

    if (xBounds) {
      fxChartElement.dataset.promptStart = xBounds.start;
      fxChartElement.dataset.promptEnd = xBounds.end;
    }

    setupBoundedXAxis(fxChartElement, getFxXBounds);
    setupMobileYAxisGestures(fxChartElement);
    setupMobileXAxisGestures(fxChartElement);
    setupChartDetailInteraction(fxChartElement);
    setupPromptCopy(fxChartElement, buildFxPrompt);
  });
}

function renderFx() {
  renderFxCards();
  renderFxChart();
}

function renderAll() {
  syncAxisOrder();
  renderRangeButtons();
  renderCards();
  renderChart();
}

function createComparisonSection(config) {
  const defaultNormalized = Boolean(config.defaultNormalized);
  const state = {
    data: new Map(),
    loaded: false,
    loadingPromise: null,
    selectedIds: [...config.defaultSelectedIds],
    axisOrder: [...config.defaultSelectedIds],
    manualAxisOrder: false,
    activeRange: config.defaultRange || DEFAULT_RANGE,
    scale: "linear",
    normalized: defaultNormalized,
    selectionBeforeNormalized: defaultNormalized
      ? [...(config.defaultNonNormalizedSelectedIds || config.defaultSelectedIds.slice(0, 1))]
      : null,
  };

  const elements = {
    grid: document.getElementById(`${config.key}-indicator-grid`),
    chart: document.getElementById(`${config.key}-chart`),
    title: document.getElementById(`${config.key}-chart-title`),
    notice: document.getElementById(`${config.key}-selection-notice`),
    noticeText: document.getElementById(`${config.key}-selection-notice-text`),
    noticeClose: document.getElementById(`${config.key}-selection-notice-close`),
    logScaleInput: document.getElementById(`${config.key}-log-scale`),
    normalizedInput: document.getElementById(`${config.key}-normalized`),
    rangeButtons: Array.from(document.querySelectorAll(`[data-comparison-range="${config.key}"]`)),
  };

  if (elements.normalizedInput) {
    elements.normalizedInput.checked = defaultNormalized;
  }
  if (elements.logScaleInput) {
    elements.logScaleInput.disabled = defaultNormalized;
    if (elements.normalizedInput) {
      elements.logScaleInput.closest(".toggle-pill")?.setAttribute("hidden", "");
    }
  }

  function getLocalIndicator(id) {
    return config.indicators.find((indicator) => indicator.id === id);
  }

  function showLocalNotice(message) {
    elements.noticeText.textContent = message;
    elements.notice.hidden = false;
  }

  function clearLocalNotice() {
    elements.notice.hidden = true;
    elements.noticeText.textContent = "";
  }

  function getXBounds() {
    const selected = state.axisOrder;
    const latestDateText = selected
      .flatMap((id) => state.data.get(id) || [])
      .map((row) => row.date)
      .sort((a, b) => a.localeCompare(b))
      .at(-1);

    if (!latestDateText) {
      return null;
    }

    const today = getTodayJst();
    const endDate = toDate(today > latestDateText ? today : latestDateText);
    const startDate =
      state.activeRange === "Max" ? toDate(maxStartDate) : shiftDateByRange(endDate, state.activeRange);

    return {
      start: toIsoDate(startDate),
      end: toIsoDate(endDate),
    };
  }

  function getFilteredRows(indicatorId) {
    const rows = state.data.get(indicatorId) || [];
    const bounds = getXBounds();
    const displayRows = getDisplayRows(rows, bounds);

    return displayRows;
  }

  function getNormalizedRows(indicatorId) {
    const bounds = getXBounds();
    const rows = state.data.get(indicatorId) || [];
    const visibleRows = bounds
      ? rows.filter((row) => row.date >= bounds.start && row.date <= bounds.end)
      : rows;
    const baseRow = visibleRows.find(
      (row) => Number.isFinite(row.value) && row.value !== 0,
    );

    if (!baseRow) {
      return [];
    }

    const denominator = Math.abs(baseRow.value);
    return visibleRows
      .filter((row) => row.date >= baseRow.date && Number.isFinite(row.value))
      .map((row) => ({
        ...row,
        originalValue: row.value,
        baseDate: baseRow.date,
        value: ((row.value - baseRow.value) / denominator) * 100,
      }));
  }

  function getChartRows(indicatorId) {
    const rows = state.normalized
      ? getNormalizedRows(indicatorId)
      : getFilteredRows(indicatorId);

    if (
      !state.normalized &&
      indicatorId === "cme-expected-policy-rate" &&
      rows.length > 0 &&
      Array.isArray(fedWatchExpectation?.future_curve)
    ) {
      const futureRows = [];
      const futureCurve = fedWatchExpectation.future_curve.filter(
        (item) =>
          item.meeting_date > rows.at(-1).date &&
          Number.isFinite(item.expected_target_upper_rate),
      );

      futureCurve.forEach((item, index) => {
        const segmentStart =
          index === 0 ? addDays(rows.at(-1).date, 1) : futureCurve[index - 1].meeting_date;
        const segmentEnd = addDays(item.meeting_date, -1);

        let date = segmentStart;
        while (date <= segmentEnd) {
          futureRows.push({
            date,
            value: item.expected_target_upper_rate,
            meetingDate: item.meeting_date,
            projected: true,
          });
          date = addDays(date, 1);
        }
      });

      return [...rows, ...futureRows];
    }

    return rows;
  }

  function getDisplayRows(rows, bounds) {
    if (rows.length === 0) {
      return [];
    }

    if (!bounds) {
      const start = state.activeRange === "Max" ? toDate(maxStartDate) : shiftDateByRange(toDate(rows.at(-1).date), state.activeRange);
      const visibleRows = rows.filter((row) => toDate(row.date) >= start);
      const anchorIndex = rows.indexOf(visibleRows[0] || rows.at(-1));
      return visibleRows.length >= 2 ? visibleRows : rows.slice(Math.max(0, anchorIndex - 1), anchorIndex + 1);
    }

    const visibleRows = rows.filter((row) => row.date >= bounds.start && row.date <= bounds.end);

    if (visibleRows.length >= 2 || rows.length < 2) {
      return visibleRows;
    }

    const firstAfterEndIndex = rows.findIndex((row) => row.date > bounds.end);
    const fallbackEnd = visibleRows.length
      ? rows.indexOf(visibleRows.at(-1)) + 1
      : firstAfterEndIndex > 0
        ? firstAfterEndIndex
        : rows.length;
    return rows.slice(Math.max(0, fallbackEnd - 2), fallbackEnd);
  }

  function getDisplayXBounds(selected) {
    const baseBounds = getXBounds();

    if (!baseBounds) {
      return null;
    }

    if (state.normalized) {
      return {
        ...baseBounds,
        minallowed: baseBounds.start,
      };
    }

    const displayStart = selected
      .flatMap((id) => getDisplayRows(state.data.get(id) || [], baseBounds))
      .map((row) => row.date)
      .sort((a, b) => a.localeCompare(b))
      .at(0);
    const futureFomcMeetings =
      config.key === "us-rates" &&
      selected.includes("cme-expected-policy-rate")
        ? (fedWatchExpectation?.future_curve || []).map((item) => item.meeting_date)
        : [];
    const futureBojMeetings =
      config.key === "jp-rates" &&
      selected.some((id) => ["boj-policy-rate", "boj-implied-rate"].includes(id))
        ? bojPolicyMeetingDates
        : [];
    const allowedEnd = [...futureFomcMeetings, ...futureBojMeetings]
      .filter(Boolean)
      .sort()
      .at(-1) || baseBounds.end;

    return {
      start: displayStart && displayStart < baseBounds.start
          ? displayStart
          : baseBounds.start,
      end: baseBounds.end,
      allowedStart: baseBounds.start,
      allowedEnd: allowedEnd > baseBounds.end ? allowedEnd : baseBounds.end,
    };
  }

  function shiftMeetingMarker(date) {
    return addDays(date, -1);
  }

  function getPolicyMeetingShapes(selected, xBounds, theme) {
    if (!xBounds) {
      return [];
    }

    let markerDates = [];
    if (config.key === "us-rates" && selected.includes("cme-expected-policy-rate")) {
      markerDates = [
        ...(state.data.get("cme-expected-policy-rate") || [])
          .map((row) => row.meetingDate)
          .filter(Boolean),
        ...(fedWatchExpectation?.future_curve || []).map((item) => item.meeting_date),
      ].map(shiftMeetingMarker);
    }

    if (
      config.key === "jp-rates" &&
      selected.some((id) => ["boj-policy-rate", "boj-implied-rate"].includes(id))
    ) {
      markerDates = bojPolicyMeetingDates;
    }

    return [...new Set(markerDates)]
      .filter(Boolean)
      .filter(
        (date) =>
          date >= (xBounds.allowedStart || xBounds.start) &&
          date <= (xBounds.allowedEnd || xBounds.end),
      )
      .map((markerDate) => ({
        type: "line",
        xref: "x",
        yref: "paper",
        x0: markerDate,
        x1: markerDate,
        y0: 0,
        y1: 1,
        layer: "below",
        line: {
          color: theme.guide,
          width: 1,
          dash: "dot",
        },
      }));
  }

  function getAutoOrder(ids) {
    if (ids.length !== 2) {
      return ids;
    }

    const [first, second] = ids.map(getLocalIndicator);
    const firstIsPrice = first.category === "price";
    const secondIsPrice = second.category === "price";

    if (firstIsPrice && !secondIsPrice) {
      return [first.id, second.id];
    }

    if (secondIsPrice && !firstIsPrice) {
      return [second.id, first.id];
    }

    return ids;
  }

  function syncLocalAxisOrder() {
    state.axisOrder = state.axisOrder.filter((id) => state.selectedIds.includes(id));

    for (const id of state.selectedIds) {
      if (!state.axisOrder.includes(id)) {
        state.axisOrder.push(id);
      }
    }

    if (!state.manualAxisOrder) {
      state.axisOrder = getAutoOrder(state.selectedIds);
    }
  }

  function canUseLocalLog(rows) {
    return rows.length > 0 && rows.every((row) => row.value > 0);
  }

  function selectedRowsAllowLocalLog() {
    return state.axisOrder.every((id) => canUseLocalLog(getFilteredRows(id)));
  }

  function validateLocalScale() {
    if (state.scale === "log" && !selectedRowsAllowLocalLog()) {
      state.scale = "linear";
      elements.logScaleInput.checked = false;
      showLocalNotice("Log scale is unavailable because the selected range includes zero or negative values.");
    }
  }

  function getLocalYAxisLayout(
    side,
    indicator,
    rows,
    theme = getChartTheme(),
    axisColor = theme.ink,
  ) {
    const scale = state.scale === "log" && canUseLocalLog(rows) ? "log" : "linear";
    const range = getAutoRange(rows, scale, indicator.axisBounds, indicator.chartType === "bar");
    const axis = {
      gridcolor: side === "left" ? theme.grid : "rgba(0,0,0,0)",
      zeroline: true,
      zerolinecolor: theme.zero,
      tickfont: { color: axisColor, size: usesTouchChartMode() ? 10 : 11, weight: 700 },
      type: scale,
    };

    if (indicator.axisBounds) {
      axis.minallowed = indicator.axisBounds.min;
      axis.maxallowed = indicator.axisBounds.max;
    }

    if (range) {
      axis.range = scale === "log" ? range.map((value) => Math.log10(value)) : range;
    }

    if (side === "right") {
      axis.overlaying = "y";
      axis.side = "right";
      axis.showgrid = false;
    }

    return axis;
  }

  function renderLocalRangeButtons() {
    elements.rangeButtons.forEach((button) => {
      const isActive = button.dataset.range === state.activeRange;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function renderLocalCards() {
    elements.grid.innerHTML = config.indicators
      .map((indicator) => {
        const rows = state.data.get(indicator.id) || [];
        const latest = rows.at(-1);
        const isActive = state.selectedIds.includes(indicator.id);
        const isUnavailable = state.loaded && !latest;

        return `
          <article class="metric-card indicator-card ${isActive ? "active" : ""} ${isUnavailable ? "unavailable" : ""}" data-${config.key}-indicator="${indicator.id}" data-glossary-id="${indicatorGlossaryIds[indicator.id] || ""}" tabindex="0" ${isUnavailable ? 'aria-disabled="true"' : ""}>
            <div class="indicator-title-row">
              <span class="indicator-label">${indicator.name}</span>
              ${indicator.descriptor ? `<span class="indicator-label-detail">${indicator.descriptor}</span>` : ""}
            </div>
            <strong>${latest ? formatValue(latest.value, indicator) : "--"}</strong>
            ${renderCardChange(rows, indicator)}
            ${latest ? "" : `<small class="indicator-date">${state.loaded ? "Unavailable" : "Loading"}</small>`}
            ${renderColorPalette({
              activeColor: getIndicatorColor(indicator.id),
              targetId: indicator.id,
              targetType: config.key,
            })}
          </article>
        `;
      })
      .join("");

    function toggleCard(card) {
      const id = card.getAttribute(`data-${config.key}-indicator`);

      if (state.loaded && (state.data.get(id) || []).length === 0) {
        showLocalNotice(`${getLocalIndicator(id).name} data is currently unavailable.`);
        return;
      }

      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
      } else {
        const nextIds = [...state.selectedIds, id];
        if (!state.normalized && !canShareComparisonAxes(nextIds, getLocalIndicator)) {
          showLocalNotice(comparisonLimitMessage());
          return;
        }
        state.selectedIds = nextIds;
      }

      clearLocalNotice();
      state.manualAxisOrder = false;
      renderLocalAll();
    }

    elements.grid.querySelectorAll(`[data-${config.key}-indicator]`).forEach((card) => {
      card.addEventListener("click", () => {
        if (consumeLongPressClick(card)) {
          return;
        }
        toggleCard(card);
      });
      attachLongPress(card, () => openGlossaryEntry(card.dataset.glossaryId));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleCard(card);
        }
      });
    });

    elements.grid.querySelectorAll("[data-color-control]").forEach((control) => {
      control.addEventListener("click", (event) => event.stopPropagation());
      control.addEventListener("keydown", (event) => event.stopPropagation());
    });

    elements.grid.querySelectorAll("[data-color-menu-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleColorPanel(button);
      });
    });

    elements.grid.querySelectorAll(`[data-${config.key}-color]`).forEach((swatch) => {
      swatch.addEventListener("keydown", (event) => event.stopPropagation());
      swatch.addEventListener("click", (event) => {
        event.stopPropagation();
        setIndicatorColor(
          swatch.getAttribute(`data-${config.key}-color`),
          swatch.dataset.colorValue,
        );
        closeColorPanels();
        renderLocalCards();
        renderLocalChart();
      });
    });
  }

  function renderLocalChart() {
    validateLocalScale();
    const selected = state.axisOrder;
    const { leftIds, rightIds } = state.normalized
      ? { leftIds: selected, rightIds: [] }
      : getAxisGroups(selected, getLocalIndicator);
    const axisById = new Map([
      ...leftIds.map((id) => [id, "y"]),
      ...rightIds.map((id) => [id, "y2"]),
    ]);
    const traces = selected.map((id) => {
      const indicator = getLocalIndicator(id);
      const rawRows = getChartRows(id);
      const rows = state.normalized ? rawRows : getUnitDisplayRows(rawRows, indicator);
      const normalizedHover = state.normalized
        ? getCompactHoverTemplate(getChartSeriesColor(indicator.id), "%{y:.2f}")
        : getCompactHoverTemplate(getChartSeriesColor(indicator.id), "%{customdata[0]}");

      return {
        x: rows.map((row) => row.date),
        y: rows.map((row) => row.value),
        customdata: rawRows.map((row) => [
          formatDisplayNumber(row.originalValue ?? row.value, indicator),
          row.baseDate ?? "",
        ]),
        meta: { dashboardNormalized: state.normalized },
        type: indicator.chartType || "scatter",
        name: indicator.name,
        yaxis: axisById.get(id),
        ...(indicator.chartType === "bar"
          ? { marker: { color: getChartSeriesColor(indicator.id), opacity: 0.82 } }
          : {
              mode: rows.length === 1 ? "lines+markers" : "lines",
              line: {
                color: getChartSeriesColor(indicator.id),
                width: 1.5,
                dash: "solid",
                shape: indicator.lineShape || "linear",
              },
              ...(rows.length === 1
                ? { marker: { size: 8, color: getChartSeriesColor(indicator.id) } }
                : {}),
            }),
        hovertemplate: normalizedHover,
      };
    });

    const title = selected.map((id) => getLocalIndicator(id).name).join(" vs ");
    elements.title.textContent = title || "Select indicators";

    const xBounds = getDisplayXBounds(selected);
    const requestedBounds = getXBounds();
    const includesTrendAnchor = Boolean(
      xBounds && requestedBounds && xBounds.start < requestedBounds.start,
    );
    const getDisplayChartRows = (id) => {
      const rows = getChartRows(id);
      return state.normalized ? rows : getUnitDisplayRows(rows, getLocalIndicator(id));
    };
    const leftRows = combineRows(leftIds, getDisplayChartRows);
    const rightRows = combineRows(rightIds, getDisplayChartRows);
    const normalizedIndicator = {
      id: "normalized-change",
      name: "Change from base",
      unitLabel: "Percent",
      decimals: 2,
    };
    const leftIndicator = state.normalized
      ? normalizedIndicator
      : leftIds[0]
        ? getDisplayIndicator(getLocalIndicator(leftIds[0]))
        : null;
    const rightIndicator = rightIds[0] ? getDisplayIndicator(getLocalIndicator(rightIds[0])) : null;
    if (rightIndicator && rightIds.length > 1) {
      delete rightIndicator.axisBounds;
    }
    const theme = getChartTheme();
    const horizontalAxisAnnotations = state.normalized
      ? getHorizontalAxisAnnotations(normalizedIndicator, "left", theme.ink)
      : [
          ...getAxisGroupAnnotations(leftIds, "left", getLocalIndicator, theme),
          ...getAxisGroupAnnotations(rightIds, "right", getLocalIndicator, theme),
        ];
    const trendAnnotations = includesTrendAnchor
      ? [
          {
            text: "Prior actual observation included for trend",
            xref: "paper",
            yref: "paper",
            x: 0,
            y: 1,
            xanchor: "left",
            yanchor: "bottom",
            yshift: 6,
            showarrow: false,
            font: { size: 10, color: theme.muted },
          },
        ]
      : [];
    const layout = {
      margin: getHorizontalAxisMargins(rightIds.length > 0, leftIds.length > 0),
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: theme.ink,
      },
      legend: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: usesTouchChartMode() ? -0.1 : -0.22,
        yanchor: "top",
      },
      annotations: [...horizontalAxisAnnotations, ...trendAnnotations],
      xaxis: {
        range: xBounds ? [xBounds.start, xBounds.end] : undefined,
        minallowed: xBounds?.allowedStart || xBounds?.start,
        maxallowed: xBounds?.allowedEnd || xBounds?.end,
        showgrid: false,
        tickformat: getDateTickFormat(state.activeRange),
        hoverformat: "%Y/%-m/%-d",
        tickfont: { color: theme.muted, weight: 700 },
      },
      hoverlabel: {
        bgcolor: theme.surface,
        bordercolor: theme.line,
        font: { color: theme.ink },
      },
      hovermode: "x unified",
      dragmode:
        selected.includes("cme-expected-policy-rate") ||
        (config.key === "jp-rates" &&
          selected.some((id) => ["boj-policy-rate", "boj-implied-rate"].includes(id)))
          ? "pan"
          : getChartDragMode(),
    };

    if (leftIndicator) {
      layout.yaxis = getLocalYAxisLayout(
        "left",
        leftIndicator,
        leftRows,
        theme,
        state.normalized ? theme.ink : getAxisGroupColor(leftIds, theme),
      );
      if (
        leftIds.some((id) => quarterPointRateIds.has(id))
      ) {
        layout.yaxis.griddash = "dot";
        layout.yaxis.gridcolor = theme.guide;
        if (layout.yaxis.type === "linear") {
          layout.yaxis.tick0 = 0;
          layout.yaxis.dtick = 0.25;
        }
      }
    } else {
      layout.yaxis = { visible: false };
    }

    if (rightIndicator) {
      layout.yaxis2 = getLocalYAxisLayout(
        "right",
        rightIndicator,
        rightRows,
        theme,
        getAxisGroupColor(rightIds, theme),
      );
      if (
        rightIds.some((id) => quarterPointRateIds.has(id))
      ) {
        layout.yaxis2.griddash = "dot";
        layout.yaxis2.gridcolor = theme.guide;
        layout.yaxis2.showgrid = true;
        if (layout.yaxis2.type === "linear") {
          layout.yaxis2.tick0 = 0;
          layout.yaxis2.dtick = 0.25;
        }
      }
    }

    layout.shapes = [
      ...(state.normalized
        ? []
        : getThresholdZoneShapes(selected, layout, axisById)),
      ...getPolicyMeetingShapes(selected, xBounds, theme),
    ];

    if (elements.chart && window.Plotly) {
      chartDetailTraces.set(elements.chart, traces);
      Plotly.react(elements.chart, traces, layout, getPlotlyConfig()).then(() => {
        setupChartModebar(
          elements.chart,
          elements.logScaleInput,
          config.allowNormalized ? elements.normalizedInput : null,
          null,
        );

        if (xBounds) {
          elements.chart.dataset.promptStart = xBounds.start;
          elements.chart.dataset.promptEnd = xBounds.end;
        }

        setupBoundedXAxis(elements.chart, () => getDisplayXBounds(state.axisOrder));
        setupMobileYAxisGestures(elements.chart);
        setupMobileXAxisGestures(elements.chart);
        setupChartDetailInteraction(elements.chart);
        setupPromptCopy(elements.chart, (dateText) => buildComparisonPrompt(config.label, state, config.indicators, dateText));
      });
    }
  }

  function renderLocalAll() {
    syncLocalAxisOrder();
    renderLocalRangeButtons();
    renderLocalCards();
    renderLocalChart();
  }

  elements.rangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDashboardRange(button.dataset.range);
    });
  });

  elements.logScaleInput.addEventListener("change", () => {
    if (state.normalized) {
      elements.logScaleInput.checked = false;
      return;
    }

    if (elements.logScaleInput.checked && !selectedRowsAllowLocalLog()) {
      elements.logScaleInput.checked = false;
      state.scale = "linear";
      showLocalNotice("Log scale is unavailable because the selected range includes zero or negative values.");
      renderLocalChart();
      return;
    }

    state.scale = elements.logScaleInput.checked ? "log" : "linear";
    clearLocalNotice();
    renderLocalChart();
  });

  if (config.allowNormalized && elements.normalizedInput) {
    elements.normalizedInput.addEventListener("change", () => {
      state.normalized = elements.normalizedInput.checked;

      if (state.normalized) {
        state.selectionBeforeNormalized = [...state.selectedIds];
        state.scale = "linear";
        elements.logScaleInput.checked = false;
        elements.logScaleInput.disabled = true;
        state.selectedIds = config.indicators
          .filter((indicator) => (state.data.get(indicator.id) || []).length > 0)
          .map((indicator) => indicator.id);
        state.axisOrder = [...state.selectedIds];
      } else {
        elements.logScaleInput.disabled = false;
        if (state.selectionBeforeNormalized?.length) {
          state.selectedIds = [...state.selectionBeforeNormalized];
          state.axisOrder = [...state.selectionBeforeNormalized];
        }
        state.selectionBeforeNormalized = null;
      }

      state.manualAxisOrder = false;
      clearLocalNotice();
      renderLocalAll();
    });
  }

  elements.noticeClose.addEventListener("click", clearLocalNotice);

  return {
    key: config.key,
    chartElement: elements.chart,
    get loaded() {
      return state.loaded;
    },
    load() {
      if (state.loaded) {
        return Promise.resolve();
      }
      if (state.loadingPromise) {
        return state.loadingPromise;
      }

      state.loadingPromise = Promise.all(
        config.indicators.map(async (indicator) => {
          try {
            return [indicator.id, parseIndicatorRows(await fetchLocalText(indicator.file), indicator)];
          } catch (error) {
            console.warn(`${indicator.name} unavailable:`, error);
            return [indicator.id, []];
          }
        }),
      ).then((datasets) => {
        state.data = new Map(datasets);
        state.loaded = true;
        renderLocalAll();
      });

      return state.loadingPromise;
    },
    renderChart() {
      renderLocalChart();
    },
    setRange(range) {
      state.activeRange = range;
      renderLocalRangeButtons();
      if (state.loaded) {
        validateLocalScale();
        renderLocalAll();
      }
    },
    showError(error) {
      elements.grid.innerHTML = `<p class="error-message">${error.message}</p>`;
    },
  };
}

function buildComparisonPrompt(sectionLabel, state, definitions, dateText) {
  const selected = state.axisOrder;
  const analyses = selected.map((id) => {
    const indicator = definitions.find((item) => item.id === id);
    return analyzeTurningPoints({
      id: indicator.id,
      name: indicator.name,
      unit: indicator.unitLabel,
      rows: state.data.get(id) || [],
      dateText,
      valueField: "value",
      decimals: indicator.decimals,
      suffix: indicator.valueSuffix,
    });
  });

  return [
    "Market indicator analysis request",
    "",
    `Selected date: ${dateText}`,
    `Dashboard section: ${sectionLabel}`,
    `Visible range selected in dashboard: ${state.activeRange}`,
    `Selected indicators: ${selected.map((id) => definitions.find((item) => item.id === id).name).join(", ") || "none"}`,
    "",
    "Turning point scan:",
    "- The dashboard searched up to 1 year before and 1 year after the selected date.",
    "- Turning points are detected from actual observations only; no forward fill or interpolation is used.",
    analyses.map((analysis) => analysis.line).join("\n"),
    "",
    formatLeadLag(analyses),
    "",
    "Please explain what was happening around this date and why these indicators may have moved up or down.",
    "Use historical market context, mention uncertainty, and avoid implying causation when the evidence is only correlation.",
  ].join("\n");
}

const comparisonSections = [
  createComparisonSection({
    key: "breadth",
    label: "US Breadth",
    indicators: breadthIndicators,
    defaultSelectedIds: ["breadth-sp500", "rsp-spy", "sp500-above-200dma"],
    defaultNonNormalizedSelectedIds: ["breadth-sp500"],
    defaultNormalized: true,
    defaultRange: DEFAULT_RANGE,
    storageKey: "breadthIndicatorColors",
    allowNormalized: true,
  }),
  createComparisonSection({
    key: "flows",
    label: "US Flows",
    indicators: flowsIndicators,
    defaultSelectedIds: flowsIndicators.map((indicator) => indicator.id),
    defaultNonNormalizedSelectedIds: ["flows-rsp-spy"],
    defaultNormalized: true,
    defaultRange: DEFAULT_RANGE,
    storageKey: "flowsIndicatorColors",
    allowNormalized: true,
  }),
  createComparisonSection({
    key: "us-rates",
    label: "US Rates",
    indicators: usRatesIndicators,
    defaultSelectedIds: ["fed-funds-rate", "cme-expected-policy-rate"],
    defaultRange: DEFAULT_RANGE,
    storageKey: "usRatesIndicatorColors",
  }),
  createComparisonSection({
    key: "jp-rates",
    label: "JP Rates",
    indicators: jpRatesIndicators,
    defaultSelectedIds: ["boj-policy-rate", "boj-implied-rate"],
    defaultRange: DEFAULT_RANGE,
    storageKey: "jpRatesIndicatorColors",
  }),
  createComparisonSection({
    key: "japan",
    label: "JP Market",
    indicators: japanIndicators,
    defaultSelectedIds: ["topix"],
    defaultRange: DEFAULT_RANGE,
    storageKey: "japanIndicatorColors",
  }),
  createComparisonSection({
    key: "taiwan",
    label: "TW Market",
    indicators: taiwanIndicators,
    defaultSelectedIds: ["taiex"],
    defaultRange: DEFAULT_RANGE,
    storageKey: "taiwanIndicatorColors",
  }),
];

function resizeVisibleCharts() {
  if (!window.Plotly) {
    return;
  }

  if (chartElement) {
    Plotly.Plots.resize(chartElement);
  }

  if (fxChartElement) {
    Plotly.Plots.resize(fxChartElement);
  }

  comparisonSections.forEach((section) => {
    if (section.loaded && section.chartElement) {
      Plotly.Plots.resize(section.chartElement);
    }
  });
}

function centerMobileChartPane(track) {
  if (!track || !isMobileLandscape()) {
    return;
  }

  const chartPane = track.querySelector('[data-mobile-pane="charts"]');
  const chart = chartPane?.querySelector("#indicator-chart, #fx-chart, .comparison-chart");

  if (!chartPane) {
    return;
  }

  (chart || chartPane).scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
}

function centerActiveMobileTab() {
  if (!tabBar || !usesMobilePaneLayout()) {
    return;
  }

  const activeTab = tabBar.querySelector(".tab-button.active");
  if (!activeTab) {
    return;
  }

  const navRect = tabBar.getBoundingClientRect();
  const activeRect = activeTab.getBoundingClientRect();
  const maxScroll = Math.max(tabBar.scrollWidth - tabBar.clientWidth, 0);
  const desiredLeft = navRect.left + (navRect.width - activeRect.width) / 2;
  const targetScroll = tabBar.scrollLeft + activeRect.left - desiredLeft;
  tabBar.scrollLeft = Math.min(Math.max(targetScroll, 0), maxScroll);
}

function resetMobilePortraitPosition() {
  if (!usesMobilePaneLayout() || isMobileLandscape()) {
    return;
  }

  const reset = () => {
    const scrollingElement = document.scrollingElement || document.documentElement;
    scrollingElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    centerActiveMobileTab();
  };

  reset();
  requestAnimationFrame(() => {
    reset();
    requestAnimationFrame(reset);
  });
  window.setTimeout(reset, 120);
  window.setTimeout(reset, 300);
}

function centerActiveLandscapeChart() {
  if (!usesMobilePaneLayout() || !window.matchMedia("(orientation: landscape)").matches) {
    return;
  }

  const activePanel = document.querySelector(".tab-panel.active");
  const track = activePanel?.querySelector("[data-mobile-track]");
  const chartPane = track?.querySelector('[data-mobile-pane="charts"].active');

  if (!track || !chartPane) {
    return;
  }

  requestAnimationFrame(() => {
    resizeVisibleCharts();
    requestAnimationFrame(() => centerMobileChartPane(track));
  });
}

function setMobileView(group, view, { center = true } = {}) {
  const track = document.querySelector(`[data-mobile-track="${group}"]`);

  if (!track) {
    return;
  }

  track.querySelectorAll("[data-mobile-pane]").forEach((pane) => {
    pane.classList.toggle("active", pane.dataset.mobilePane === view);
  });

  mobileViewButtons
    .filter((button) => button.dataset.mobileViewButton === group)
    .forEach((button) => {
      const active = button.dataset.mobileView === view;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

  if (view === "charts" && center && isMobileLandscape()) {
    requestAnimationFrame(() => {
      resizeVisibleCharts();
      requestAnimationFrame(() => {
        centerMobileChartPane(track);
      });
    });
  }
}

function syncMobileViewsForOrientation({ center = true, force = false } = {}) {
  const mobileLayout = usesMobilePaneLayout();
  const nextView = isMobileLandscape() ? "charts" : "cards";
  const layoutKey = mobileLayout ? nextView : "desktop";

  if (!force && syncMobileViewsForOrientation.lastLayoutKey === layoutKey) {
    return;
  }

  syncMobileViewsForOrientation.lastLayoutKey = layoutKey;
  if (!mobileLayout) {
    return;
  }

  document.querySelectorAll("[data-mobile-track]").forEach((track) => {
    setMobileView(track.dataset.mobileTrack, nextView, { center: false });
  });

  if (nextView === "charts" && center) {
    centerActiveLandscapeChart();
  }
}

syncMobileViewsForOrientation.lastLayoutKey = null;

function validateMacroScale() {
  if (macroScale === "log" && !selectedRowsAllowLog()) {
    macroScale = "linear";
    if (macroLogScaleInput) {
      macroLogScaleInput.checked = false;
    }
    showNotice("Log scale is unavailable because the selected range includes zero or negative values.");
  }
}

async function loadIndicatorData() {
  const [datasets] = await Promise.all([
    Promise.all(
      indicators.map(async (indicator) => {
        try {
          return [indicator.id, parseIndicatorRows(await fetchLocalText(indicator.file), indicator)];
        } catch (error) {
          console.warn(`${indicator.name} unavailable:`, error);
          return [indicator.id, []];
        }
      }),
    ),
    loadFedWatchExpectation(),
  ]);

  indicatorData = new Map(datasets);
}

async function loadFedWatchExpectation() {
  try {
    const response = await fetch(`data/fedwatch-expected-rate.json?updated=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    fedWatchExpectation = await response.json();
  } catch (error) {
    fedWatchExpectation = null;
    console.warn("CME FedWatch expectation unavailable:", error);
  }
}

async function loadFxData() {
  const [fxText, broadDollarText, cftcJpyText] = await Promise.all([
    fetchLocalText("data/fx.csv"),
    fetchLocalText("data/broad-us-dollar-index.csv"),
    fetchLocalText("data/cftc-jpy-speculative-net-positions.csv"),
  ]);
  const rowsByDate = new Map(parseFxCsv(fxText).map((row) => [row.date, { ...row }]));

  parseCsv(broadDollarText).forEach((row) => {
    const target = rowsByDate.get(row.date) || { date: row.date };
    target.BROAD_US_DOLLAR_INDEX = row.value;
    rowsByDate.set(row.date, target);
  });

  parseCsv(cftcJpyText).forEach((row) => {
    const target = rowsByDate.get(row.date) || { date: row.date };
    target.CFTC_JPY_SPECULATIVE_NET_POSITIONS = row.value;
    rowsByDate.set(row.date, target);
  });

  fxData = Array.from(rowsByDate.values()).sort((left, right) => left.date.localeCompare(right.date));
}

async function loadDataStatus() {
  const response = await fetch(`data/status.json?updated=${Date.now()}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load data/status.json");
  }

  return response.json();
}

async function loadGlossary() {
  const response = await fetch(`data/glossary.json?updated=${Date.now()}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load data/glossary.json");
  }

  return response.json();
}

function getStatusIndicatorNames(id, indicator) {
  const glossaryEntry = glossaryEntries.find((entry) => entry.id === id);
  return {
    fullName: glossaryEntry?.full_name || indicator.display_name,
    shortName: glossaryEntry?.short_name || indicator.short_name || indicator.display_name,
  };
}

function renderIndicatorLinks(indicator, id) {
  const names = getStatusIndicatorNames(id, indicator);
  return `
    <strong>${escapeHtml(names.shortName)}</strong>
  `;
}

function renderStatusSourceNote(indicator) {
  const sources = Array.isArray(indicator.source_urls)
    ? indicator.source_urls.filter((source) => source?.url)
    : [];

  if (!sources.length) {
    return `<p class="status-detail-line"><strong>Source:</strong> ${escapeHtml(indicator.source_name || "--")}</p>`;
  }

  return `<p class="status-detail-line"><strong>Source:</strong> ${sources
    .map(
      (source) =>
        `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label || indicator.source_name || "Source")}</a>`,
    )
    .join(" / ")}</p>`;
}

function renderStatusBadge(status) {
  const className = statusClassNames[status] || "unknown";
  return `<span class="data-status-badge ${className}">${escapeHtml(status || "Unknown")}</span>`;
}

function summarizeStatusError(message) {
  if (!message) {
    return "";
  }

  if (/timed out|timeout/i.test(message)) {
    return "Source check timed out. Existing data was retained.";
  }

  if (/circuit breaker|deferred/i.test(message)) {
    return "Source check was deferred to the next scheduled run.";
  }

  if (/\b429\b|rate limit/i.test(message)) {
    return "Source rate limit reached. The next check will run later.";
  }

  if (/connection|ECONNRESET|ENOTFOUND|EAI_AGAIN|fetch failed|TLS/i.test(message)) {
    return "Could not connect to the source. Existing data was retained.";
  }

  return "Source update failed. Existing data was retained.";
}

function renderStatusExpandedDetails(indicator) {
  const sourceAvailableDate = indicator.source_available_date || "--";
  const sourceCheckedAt =
    indicator.source_available_checked_display ||
    indicator.last_successful_refresh_display ||
    "--";
  const sourceDueDate =
    indicator.expected_source_update_date ||
    indicator.expected_source_update_display?.slice(0, 10);
  const sourceDue = sourceDueDate
    ? `<span><strong>Source due</strong> ${escapeHtml(sourceDueDate)}</span>`
    : "";

  return `
    <div class="status-expanded-grid">
      <span><strong>Source available</strong> ${escapeHtml(sourceAvailableDate)}</span>
      <span><strong>Next observation</strong> ${escapeHtml(indicator.next_expected_observation_date || indicator.next_expected_update_date || "--")}</span>
      ${sourceDue}
      <span><strong>Source checked</strong> ${escapeHtml(sourceCheckedAt)}</span>
      <span><strong>Update frequency</strong> ${escapeHtml(indicator.frequency || "--")}</span>
    </div>
  `;
}

function getAlphabeticalIndicatorLabel(indicator) {
  return String(
    indicator?.short_name || indicator?.display_name || indicator?.full_name || indicator?.id || "",
  );
}

function compareAlphabeticalIndicators(left, right) {
  const labelComparison = getAlphabeticalIndicatorLabel(left).localeCompare(
    getAlphabeticalIndicatorLabel(right),
    "en",
    { sensitivity: "base", numeric: true },
  );
  if (labelComparison !== 0) {
    return labelComparison;
  }

  return String(left?.id || "").localeCompare(String(right?.id || ""), "en", {
    sensitivity: "base",
    numeric: true,
  });
}
function renderDataStatus(metadata) {
  if (!metadata || !metadata.indicators) {
    throw new Error("Data status metadata is missing indicators.");
  }

  dataStatusMetadata = metadata;
  const indicators = Object.entries(metadata.indicators).sort(
    ([leftKey, left], [rightKey, right]) =>
      compareAlphabeticalIndicators(left, right) || leftKey.localeCompare(rightKey),
  );
  if (dataStatusUpdated) {
    dataStatusUpdated.textContent = metadata.last_dashboard_refresh_display
      ? `Last dashboard refresh ${metadata.last_dashboard_refresh_display}`
      : "Data status loaded";
  }

  if (dataStatusBody) {
    dataStatusBody.innerHTML = indicators
      .map(([key, indicator]) => {
        const expanded = expandedStatusKey === key;
        const names = getStatusIndicatorNames(key, indicator);
        const dashboardLatestDate =
          indicator.dashboard_latest_date || indicator.latest_available_date || "--";
        const formula = indicator.formula
          ? `<p class="formula-text"><strong>Formula:</strong> ${escapeHtml(indicator.formula)}</p>`
          : "";
        const releaseNote = indicator.release_note
          ? `<p class="formula-text">${escapeHtml(indicator.release_note)}</p>`
          : "";
        const errorSummary = summarizeStatusError(indicator.error_message);
        const errorDetails = errorSummary
          ? `<p class="formula-text"><strong>Last check:</strong> ${escapeHtml(errorSummary)}</p>`
          : "";
        const details = expanded
          ? `
            <div class="status-expanded-content">
              ${renderStatusExpandedDetails(indicator)}
              ${formula}${releaseNote}${errorDetails}
              ${renderStatusSourceNote(indicator)}
            </div>
          `
          : "";

        return `
          <tr
            class="${expanded ? "status-row-expanded" : ""}"
            data-status-row="${escapeHtml(key)}"
            tabindex="0"
            aria-expanded="${expanded}"
          >
            <td>
              <div class="status-card-head">
                <div class="status-card-summary">
                  <div class="indicator-source-links">${renderIndicatorLinks(indicator, key)}</div>
                  <span class="status-dashboard-date">
                    <strong>Dashboard latest</strong> ${escapeHtml(dashboardLatestDate)}
                  </span>
                </div>
                <div class="status-card-actions">
                  ${renderStatusBadge(indicator.status)}
                  <button
                    class="glossary-expand-button"
                    type="button"
                    data-status-expand="${escapeHtml(key)}"
                    aria-label="${expanded ? "Collapse" : "Expand"} ${escapeHtml(names.shortName)} data status"
                    aria-expanded="${expanded}"
                  >
                    ▾
                  </button>
                </div>
              </div>
              ${details}
            </td>
          </tr>
        `;
      })
      .join("");
  }
}

function renderDataStatusError(error) {
  if (dataStatusUpdated) {
    dataStatusUpdated.textContent = "Data status unavailable";
  }

  if (dataStatusBody) {
    dataStatusBody.innerHTML = `
      <tr>
        <td colspan="2">
          <details class="error-details" open>
            <summary>Could not load data status metadata</summary>
            <p>${escapeHtml(error.message)}</p>
          </details>
        </td>
      </tr>
    `;
  }
}

function normalizeGlossaryAlias(alias) {
  return typeof alias === "string" ? alias.replace(/\s+/g, " ").trim() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getGlossaryLinkAliases(currentEntryId) {
  const aliases = new Map();

  glossaryEntries.forEach((entry) => {
    if (!entry?.id || entry.id === currentEntryId) {
      return;
    }

    [
      entry.short_name,
      entry.full_name,
      ...(entry.aliases || []),
      ...Object.values(entry.headings || {}),
    ].forEach((alias) => {
      const normalized = normalizeGlossaryAlias(alias);
      if (!normalized || normalized.length > glossaryLinkAliasMaxLength) {
        return;
      }

      const key = normalized.toLowerCase();
      if (!aliases.has(key) || normalized.length > aliases.get(key).alias.length) {
        aliases.set(key, {
          alias: normalized,
          id: entry.id,
        });
      }
    });

    [
      entry.full_name,
      ...Object.values(entry.headings || {}),
    ].forEach((label) => {
      const matches = String(label || "").matchAll(/[\(（]([A-Za-z][A-Za-z0-9/%.-]{1,14})[\)）]/g);
      for (const match of matches) {
        const normalized = normalizeGlossaryAlias(match[1]);
        if (!normalized) {
          continue;
        }

        const key = normalized.toLowerCase();
        if (!aliases.has(key)) {
          aliases.set(key, {
            alias: normalized,
            id: entry.id,
          });
        }
      }
    });
  });

  return Array.from(aliases.values()).sort((a, b) => b.alias.length - a.alias.length);
}

function renderGlossaryLinkedText(text, currentEntryId) {
  const aliases = getGlossaryLinkAliases(currentEntryId);
  let segments = [{ type: "text", value: escapeHtml(text) }];

  aliases.forEach(({ alias, id }) => {
    const escapedAlias = escapeHtml(alias);
    const flexibleAlias = escapeRegex(escapedAlias).replaceAll("/", "\\s*/\\s*");
    const pattern = new RegExp(`(^|[^A-Za-z0-9_])(${flexibleAlias})(?=$|[^A-Za-z0-9_])`, "g");

    segments = segments.flatMap((segment) => {
      if (segment.type !== "text") {
        return [segment];
      }

      const linkedSegments = [];
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(segment.value)) !== null) {
        const matchedAlias = match[2];
        const aliasStart = match.index + match[1].length;
        const aliasEnd = aliasStart + matchedAlias.length;

        if (aliasStart > lastIndex) {
          linkedSegments.push({ type: "text", value: segment.value.slice(lastIndex, aliasStart) });
        }

        linkedSegments.push({
          type: "html",
          value: `<button class="glossary-inline-link" type="button" data-glossary-link="${escapeHtml(id)}">${matchedAlias}</button>`,
        });
        lastIndex = aliasEnd;
      }

      if (!linkedSegments.length) {
        return [segment];
      }

      if (lastIndex < segment.value.length) {
        linkedSegments.push({ type: "text", value: segment.value.slice(lastIndex) });
      }

      return linkedSegments;
    });
  });

  return segments.map((segment) => segment.value).join("");
}

function renderGlossaryText(text, currentEntryId) {
  if (!text) {
    return `<p>No glossary text available.</p>`;
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${renderGlossaryLinkedText(paragraph, currentEntryId)}</p>`)
    .join("");
}

function glossarySearchHaystack(entry) {
  const descriptions = Object.values(entry.descriptions || {}).join(" ");
  const headings = Object.values(entry.headings || {}).join(" ");

  return [
    entry.short_name,
    entry.full_name,
    headings,
    descriptions,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterGlossaryEntries(entries) {
  const query = glossarySearchText.trim().toLowerCase();

  if (!query) {
    return entries;
  }

  return entries.filter((entry) => glossarySearchHaystack(entry).includes(query));
}

function sortGlossaryEntries(entries) {
  return entries
    .map((entry, sourceIndex) => ({ entry, sourceIndex }))
    .sort((left, right) =>
      compareAlphabeticalIndicators(left.entry, right.entry) || left.sourceIndex - right.sourceIndex,
    )
    .map(({ entry }) => entry);
}

function syncGlossaryLanguageButtons() {
  glossaryLanguageButtons.forEach((button) => {
    const active = button.dataset.glossaryGlobalLanguage === activeGlossaryLanguage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function scrollGlossaryEntryIntoView(id) {
  if (!glossaryBody || !id) {
    return;
  }

  requestAnimationFrame(() => {
    const targetRow = Array.from(glossaryBody.querySelectorAll("[data-glossary-row]")).find(
      (row) => row.dataset.glossaryRow === id,
    );
    targetRow?.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

function renderGlossary(glossary) {
  glossaryEntries = sortGlossaryEntries(
    Array.isArray(glossary?.indicators) ? glossary.indicators : [],
  );
  const visibleEntries = filterGlossaryEntries(glossaryEntries);


  syncGlossaryLanguageButtons();

  if (!glossaryBody) {
    return;
  }

  if (!visibleEntries.length) {
    glossaryBody.innerHTML = `
      <tr>
        <td colspan="3">No matching indicators.</td>
      </tr>
    `;
    return;
  }

  glossaryBody.innerHTML = visibleEntries
    .map((entry) => {
      const activeLanguage = activeGlossaryLanguage;
      const description = entry.descriptions?.[activeLanguage] || "";
      const expanded = expandedGlossaryId === entry.id;

      return `
        <tr
          class="${expanded ? "glossary-row-expanded" : ""}"
          data-glossary-row="${escapeHtml(entry.id)}"
          tabindex="0"
          aria-expanded="${expanded}"
        >
          <td>
            <div class="glossary-card-head">
              <div>
                <strong class="glossary-name-short">${escapeHtml(entry.short_name)}</strong>
                <div class="status-mobile-meta glossary-mobile-meta">
                  <span>${escapeHtml(entry.full_name)}</span>
                </div>
              </div>
              <button
                class="glossary-expand-button"
                type="button"
                data-glossary-expand="${escapeHtml(entry.id)}"
                aria-label="${expanded ? "Collapse" : "Expand"} ${escapeHtml(entry.short_name)} glossary"
                aria-expanded="${expanded}"
              >
                ▾
              </button>
            </div>
          </td>
          <td>${escapeHtml(entry.full_name)}</td>
          <td class="glossary-description-cell">
            ${
              expanded
                ? `
                  <div class="glossary-description" lang="${escapeHtml(activeLanguage)}">
                    ${renderGlossaryText(description, entry.id)}
                  </div>
                `
                : ""
            }
          </td>
        </tr>
      `;
    })
    .join("");

  glossaryBody.querySelectorAll("[data-glossary-row]").forEach((row) => {
    attachLongPress(row, () => openDashboardForGlossary(row.dataset.glossaryRow), {
      shouldIgnoreTarget: (target) => Boolean(target.closest(".glossary-description")),
    });
  });
}

function renderGlossaryError(error) {

  if (glossaryBody) {
    glossaryBody.innerHTML = `
      <tr>
        <td colspan="3">
          <details class="error-details" open>
            <summary>Could not load glossary</summary>
            <p>${escapeHtml(error.message)}</p>
          </details>
        </td>
      </tr>
    `;
  }
}

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDashboardRange(button.dataset.range);
  });
});

function renderFxRangeButtons() {
  fxRangeButtons.forEach((button) => {
    const active = button.dataset.fxRange === activeFxRange;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setDashboardRange(range) {
  const sharedRange = range === "MAX" ? "Max" : range;
  activeRange = sharedRange;
  activeFxRange = sharedRange;

  validateMacroScale();
  renderAll();
  renderFxRangeButtons();
  if (fxData.length > 0) {
    renderFxChart();
  }
  comparisonSections.forEach((section) => section.setRange(sharedRange));
  requestAnimationFrame(() => centerActiveLandscapeChart());
}

function activateTab(tab) {
  tabButtons.forEach((item) => {
    const active = item.dataset.tab === tab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tab);
  });

  if (tab === "fx" && fxData.length === 0) {
    loadFxData().then(renderFx).catch((error) => setFxText("fx-updated", error.message));
  }

  const comparisonSection = comparisonSections.find((section) => section.key === tab);
  comparisonSection?.load().catch((error) => comparisonSection.showError(error));

  requestAnimationFrame(() => {
    resizeVisibleCharts();
    centerActiveMobileTab();
    syncMobileViewsForOrientation({ center: false, force: true });
    centerActiveLandscapeChart();
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

mobileViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMobileView(button.dataset.mobileViewButton, button.dataset.mobileView);
  });
});

document.addEventListener("click", () => {
  closeColorPanels();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeColorPanels();
  }
});

fxRangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDashboardRange(button.dataset.fxRange);
  });
});

function showFxNotice(message) {
  if (fxSelectionNotice && fxSelectionNoticeText) {
    fxSelectionNoticeText.textContent = message;
    fxSelectionNotice.hidden = false;
  }
}

function clearFxNotice() {
  if (fxSelectionNotice && fxSelectionNoticeText) {
    fxSelectionNotice.hidden = true;
    fxSelectionNoticeText.textContent = "";
  }
}

function toggleFxCard(card) {
  const series = card.dataset.fxCard;

  if (visibleFxSeries.has(series)) {
    visibleFxSeries.delete(series);
  } else {
    const nextIds = [...visibleFxSeries, series];
    const getDefinition = (id) => fxSeriesDefinitions.find((item) => item.id === id);
    if (!canShareComparisonAxes(nextIds, getDefinition)) {
      showFxNotice(comparisonLimitMessage());
      return;
    }
    visibleFxSeries.add(series);
  }

  clearFxNotice();
  renderFxCards();
  renderFxChart();
}

fxSelectionNoticeClose?.addEventListener("click", clearFxNotice);

fxCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (consumeLongPressClick(card)) {
      return;
    }
    toggleFxCard(card);
  });
  attachLongPress(card, () => openGlossaryEntry(card.dataset.glossaryId));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFxCard(card);
    }
  });

  card.querySelectorAll(".color-control").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    control.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });
  });
});

if (macroLogScaleInput) {
  macroLogScaleInput.addEventListener("change", () => {
    if (macroLogScaleInput.checked && !selectedRowsAllowLog()) {
      macroLogScaleInput.checked = false;
      macroScale = "linear";
      showNotice("Log scale is unavailable because the selected range includes zero or negative values.");
      renderChart();
      return;
    }

    macroScale = macroLogScaleInput.checked ? "log" : "linear";
    clearNotice();
    renderChart();
  });

}

if (selectionNoticeClose) {
  selectionNoticeClose.addEventListener("click", clearNotice);
}

if (glossaryBody) {
  glossaryBody.addEventListener("click", (event) => {
    const glossaryLink = event.target.closest("[data-glossary-link]");

    if (glossaryLink) {
      event.stopPropagation();
      expandedGlossaryId = glossaryLink.dataset.glossaryLink;
      glossarySearchText = "";
      if (glossarySearchInput) {
        glossarySearchInput.value = "";
      }
      renderGlossary({ indicators: glossaryEntries });
      scrollGlossaryEntryIntoView(expandedGlossaryId);
      return;
    }

    if (event.target.closest(".glossary-description")) {
      return;
    }

    const target = event.target.closest("[data-glossary-expand], [data-glossary-row]");

    if (target) {
      const row = target.closest("[data-glossary-row]");
      if (row && consumeLongPressClick(row)) {
        return;
      }
      const id = target.dataset.glossaryExpand || target.dataset.glossaryRow;
      const willExpand = expandedGlossaryId !== id;
      expandedGlossaryId = willExpand ? id : null;
      renderGlossary({ indicators: glossaryEntries });
      if (willExpand) {
        scrollGlossaryEntryIntoView(id);
      }
      return;
    }
  });

  glossaryBody.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const row = event.target.closest("[data-glossary-row]");

    if (!row) {
      return;
    }

    event.preventDefault();
    const id = row.dataset.glossaryRow;
    const willExpand = expandedGlossaryId !== id;
    expandedGlossaryId = willExpand ? id : null;
    renderGlossary({ indicators: glossaryEntries });
    if (willExpand) {
      scrollGlossaryEntryIntoView(id);
    }
  });
}

if (dataStatusBody) {
  dataStatusBody.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      return;
    }

    const target = event.target.closest("[data-status-expand], [data-status-row]");
    if (!target) {
      return;
    }

    const row = target.closest("[data-status-row]");
    const key = target.dataset.statusExpand || row?.dataset.statusRow;
    if (!key) {
      return;
    }

    expandedStatusKey = expandedStatusKey === key ? null : key;
    renderDataStatus(dataStatusMetadata);
  });

  dataStatusBody.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const row = event.target.closest("[data-status-row]");
    if (!row || event.target.closest("a, button")) {
      return;
    }

    event.preventDefault();
    const key = row.dataset.statusRow;
    expandedStatusKey = expandedStatusKey === key ? null : key;
    renderDataStatus(dataStatusMetadata);
  });
}

glossaryLanguageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeGlossaryLanguage = button.dataset.glossaryGlobalLanguage;
    updateGlossaryLanguageUrl(activeGlossaryLanguage);
    renderGlossary({ indicators: glossaryEntries });
  });
});

if (glossarySearchInput) {
  glossarySearchInput.addEventListener("input", () => {
    glossarySearchText = glossarySearchInput.value;
    renderGlossary({ indicators: glossaryEntries });
  });
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  renderChart();
  if (fxData.length > 0) {
    renderFxChart();
  }
  comparisonSections.filter((section) => section.loaded).forEach((section) => section.renderChart());
});

const landscapeMediaQuery = window.matchMedia("(orientation: landscape)");
let responsiveLayoutKey = `${usesMobilePaneLayout()}-${isMobileLandscape()}`;

function handleResponsiveLayoutChange() {
  const nextKey = `${usesMobilePaneLayout()}-${isMobileLandscape()}`;
  if (nextKey === responsiveLayoutKey) {
    return;
  }

  responsiveLayoutKey = nextKey;
  window.setTimeout(() => {
    syncMobileViewsForOrientation({ center: true, force: true });
    if (usesMobilePaneLayout() && !isMobileLandscape()) {
      resetMobilePortraitPosition();
    } else {
      centerActiveMobileTab();
    }
  }, 120);
}

landscapeMediaQuery.addEventListener("change", handleResponsiveLayoutChange);
window.addEventListener("resize", handleResponsiveLayoutChange);

syncMobileViewsForOrientation({ center: false, force: true });

loadIndicatorData()
  .then(() => {
    renderAll();
    syncMobileViewsForOrientation({ center: true, force: true });
  })
  .catch((error) => {
    indicatorGrid.innerHTML = `<p class="error-message">${error.message}</p>`;
  });

renderFxRangeButtons();

loadDataStatus().then(renderDataStatus).catch(renderDataStatusError);

loadGlossary()
  .then((glossary) => {
    renderGlossary(glossary);
    if (dataStatusMetadata) renderDataStatus(dataStatusMetadata);
  })
  .catch(renderGlossaryError);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}
