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
    id: "treasury-10y",
    name: "US 10Y Yield",
    file: "data/us-10-year-treasury-yield.csv",
    unitLabel: "Percent",
    valueSuffix: "%",
    category: "rate",
    color: "#14b8a6",
    decimals: 2,
  },
  {
    id: "10y-2y-spread",
    name: "10Y-2Y Spread",
    file: "data/us-10y-minus-2y-spread.csv",
    unitLabel: "Percentage Points",
    valueSuffix: " pp",
    category: "spread",
    color: "#8b5cf6",
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
    id: "fed-balance-sheet",
    name: "Fed Balance Sheet",
    file: "data/fed-balance-sheet.csv",
    unitLabel: "Millions of U.S. Dollars",
    valueSuffix: "",
    category: "balance-sheet",
    color: "#64748b",
    decimals: 0,
    cadence: "weekly",
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
    id: "skew",
    name: "SKEW Index",
    file: "data/skew.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "volatility",
    color: "#111827",
    decimals: 2,
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
    id: "advance-decline-line",
    name: "A/D Line (Proxy)",
    file: "data/advance-decline-line.csv",
    unitLabel: "Cumulative Net Advances",
    valueSuffix: "",
    category: "breadth",
    color: "#10b981",
    decimals: 0,
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

const semiconductorIndicators = [
  {
    id: "sox",
    name: "SOX Index",
    file: "data/sox.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
  },
  {
    id: "tsmc-revenue-yoy",
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
    id: "ai-capex",
    name: "AI CapEx Proxy YoY",
    file: "data/ai-capex.csv",
    unitLabel: "Percent YoY",
    valueSuffix: "%",
    category: "percentage",
    color: "#8b5cf6",
    decimals: 1,
    cadence: "quarterly",
  },
];

const usRatesIndicators = [
  {
    id: "us-2y-yield",
    name: "US 2Y Yield",
    file: "data/fx.csv",
    column: "US_2Y_Yield",
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
    id: "us-rates-sp500",
    name: "S&P 500",
    file: "data/sp500.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
  },
];

const jpRatesIndicators = [
  {
    id: "japan-2y-jgb-yield",
    name: "Japan 2-Year JGB Yield",
    file: "data/fx.csv",
    column: "Japan_2Y_Yield",
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
    id: "jp-rates-topix",
    name: "TOPIX",
    file: "data/topix.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#64748b",
    decimals: 2,
  },
  {
    id: "jp-rates-nikkei-225",
    name: "Nikkei 225",
    file: "data/nikkei-225.csv",
    unitLabel: "Index",
    valueSuffix: "",
    category: "price",
    color: "#2563eb",
    decimals: 2,
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
    unitLabel: "JPY Billions",
    valueSuffix: "",
    category: "flow",
    color: "#10b981",
    decimals: 1,
    cadence: "weekly",
  },
  {
    id: "japan-tab-usdjpy",
    name: "USD/JPY",
    file: "data/fx.csv",
    column: "USDJPY",
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
    unitLabel: "TWD Millions",
    valueSuffix: "",
    category: "flow",
    color: "#10b981",
    decimals: 0,
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

const colorPalette = [
  "#111827",
  "#2563eb",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#84cc16",
  "#facc15",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
  "#39ff14",
  "#00f5ff",
  "#ff2bd6",
];

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
  "us-rates-sp500": "percent",
  topix: "percent",
  "jp-rates-topix": "percent",
  "nikkei-225": "percent",
  "jp-rates-nikkei-225": "percent",
  taiex: "percent",
  "japan-tab-usdjpy": "percent",
  usdtwd: "percent",
  "us-2y-yield": "bps",
  "treasury-10y": "bps",
  "us-rates-10y-yield": "bps",
  "japan-2y-jgb-yield": "bps",
  "japan-10y-jgb-yield": "bps",
  "japan-tab-10y-jgb-yield": "bps",
  "high-yield-oas": "bps",
  "10y-2y-spread": "bps",
  "us-rates-10y-2y-spread": "bps",
  "japan-10y-2y-jgb-spread": "bps",
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
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const mobileViewButtons = Array.from(document.querySelectorAll("[data-mobile-view-button]"));
const fxChartElement = document.getElementById("fx-chart");
const fxRangeButtons = Array.from(document.querySelectorAll("[data-fx-range]"));
const fxCards = Array.from(document.querySelectorAll("[data-fx-card]"));
const dataStatusUpdated = document.getElementById("data-status-updated");
const dataStatusBody = document.getElementById("data-status-body");
const glossaryMeta = document.getElementById("glossary-meta");
const glossaryBody = document.getElementById("glossary-body");
const glossarySearchInput = document.getElementById("glossary-search");
const glossaryLanguageButtons = Array.from(document.querySelectorAll("[data-glossary-global-language]"));

document.querySelectorAll(".mobile-view-switch").forEach((switchElement) => {
  const section = switchElement.closest(".dashboard-section");
  const track = section?.querySelector(".mobile-swipe-track");
  if (section && track) {
    section.insertBefore(switchElement, track);
  }
});

let indicatorData = new Map();
let indicatorColors = loadStoredColors(
  "macroIndicatorColors",
  new Map(indicators.map((indicator) => [indicator.id, indicator.color])),
);
let selectedIndicatorIds = ["sp500"];
let axisOrder = ["sp500"];
let manualAxisOrder = false;
let activeRange = "5Y";
let macroScale = "linear";
let fxData = [];
let activeFxRange = "3M";
let visibleFxSeries = new Set(["USDJPY", "US_Japan_2Y_Spread"]);
let glossaryEntries = [];
let glossarySearchText = "";
let activeGlossaryLanguage = "zh";
let expandedGlossaryId = null;
let fxColors = loadStoredColors(
  "fxIndicatorColors",
  new Map([
    ["USDJPY", "#2563eb"],
    ["US_Japan_2Y_Spread", "#f97316"],
  ]),
);
const localTextRequests = new Map();

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
    { from: 140, tone: "unfavorable" },
  ],
  "us-rates-move": [
    { to: 100, tone: "favorable" },
    { from: 140, tone: "unfavorable" },
  ],
  "taiwan-margin-financing-balance-yoy": [
    { to: -20, tone: "favorable" },
    { from: 20, tone: "unfavorable" },
  ],
};
const glossaryLinkAliasMaxLength = 24;

const statusClassNames = {
  "Up to date": "up-to-date",
  "Source lag": "source-lag",
  Failed: "failed",
};

function usesTouchChartMode() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function getChartDragMode() {
  return usesTouchChartMode() ? "pan" : "zoom";
}

function getPlotlyConfig() {
  return {
    displayModeBar: true,
    responsive: true,
    scrollZoom: !usesTouchChartMode(),
  };
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
    zero: getCssColor("--chart-zero", "#d1d5db"),
    surface: getCssColor("--surface", "#ffffff"),
  };
}

function loadStoredColors(storageKey, fallbackColors) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    const merged = new Map(fallbackColors);

    Object.entries(stored).forEach(([id, color]) => {
      if (typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)) {
        merged.set(id, color.toLowerCase());
      }
    });

    return merged;
  } catch {
    return new Map(fallbackColors);
  }
}

function storeColors(storageKey, colors) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(colors)));
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
      const [date, value] = line.split(",");
      return {
        date: date.trim(),
        value: Number(value),
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
  if (!indicator.column) {
    return parseCsv(csvText);
  }

  return parseFxCsv(csvText)
    .map((row) => ({
      date: row.date,
      value: row[indicator.column],
    }))
    .filter((row) => row.date && Number.isFinite(row.value))
    .sort((a, b) => a.date.localeCompare(b.date));
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

function formatValue(value, indicator) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: indicator.decimals,
    maximumFractionDigits: indicator.decimals,
  }).format(value);

  return `${formatted}${indicator.valueSuffix}`;
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
    text: `${arrow} ${formatSignedChange(rawChange, indicator.decimals, "")}`,
  };
}

function findPreviousActualObservation(rows, observationsBack) {
  const actualRows = rows.filter((row) => Number.isFinite(row.value));
  return actualRows.at(-(observationsBack + 1)) || null;
}

function renderIndicatorChange(rows, indicator) {
  const latest = rows.at(-1);

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
  };
  const periods = periodsByCadence[indicator.cadence || "daily"];
  const changes = periods
    .map(({ label, observationsBack }) => ({
      label,
      change: getIndicatorChange(
        latest,
        findPreviousActualObservation(rows, observationsBack),
        indicator,
      ),
    }))
    .filter((item) => item.change);

  if (changes.length === 0) {
    return "";
  }

  return `<small class="indicator-change">${changes
    .map(
      ({ label, change }) =>
        `<span class="change-period ${change.direction}"><b>${label}</b> ${change.text}</span>`,
    )
    .join("")}</small>`;
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

function shiftDateByRange(endDate, rangeKey) {
  const startDate = new Date(endDate);

  if (rangeKey.endsWith("M")) {
    startDate.setMonth(startDate.getMonth() - Number(rangeKey.slice(0, -1)));
  } else {
    startDate.setFullYear(startDate.getFullYear() - ranges[rangeKey]);
  }

  return startDate;
}

function getMacroXBounds() {
  const selected = axisOrder.slice(0, 2);
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

function getAutoRange(rows, scale, axisBounds = null) {
  const values = rows.map((row) => row.value).filter((value) => Number.isFinite(value));
  const visibleValues = scale === "log" ? values.filter((value) => value > 0) : values;

  if (visibleValues.length === 0) {
    return undefined;
  }

  let min = Math.min(...visibleValues);
  let max = Math.max(...visibleValues);

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
  const selected = axisOrder.slice(0, 2);
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
    `Dashboard section: Macro`,
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
  const seriesDefinitions = [
    {
      id: "USDJPY",
      name: "USD/JPY",
      unit: "Exchange Rate",
      field: "USDJPY",
      decimals: 2,
      suffix: "",
    },
    {
      id: "US_Japan_2Y_Spread",
      name: "US-JP 2Y Spread",
      unit: "Percentage Points",
      field: "US_Japan_2Y_Spread",
      decimals: 2,
      suffix: " pp",
    },
  ].filter((series) => visibleFxSeries.has(series.id));

  const analyses = seriesDefinitions.map((series) =>
    analyzeTurningPoints({
      id: series.id,
      name: series.name,
      unit: series.unit,
      rows: fxData,
      dateText,
      valueField: series.field,
      decimals: series.decimals,
      suffix: series.suffix,
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
    "For USD/JPY and the US-JP 2Y spread, discuss rate differentials, central bank expectations, risk sentiment, and any major market events around the date.",
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

    const [clampedStart, clampedEnd] = clampDateRange(start, end, bounds);

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

function canUseLog(rows) {
  return rows.length > 0 && rows.every((row) => row.value > 0);
}

function selectedRowsAllowLog() {
  return axisOrder.slice(0, 2).every((id) => canUseLog(getFilteredRows(id)));
}

function renderCards() {
  indicatorGrid.innerHTML = indicators
    .map((indicator) => {
      const rows = indicatorData.get(indicator.id) || [];
      const latest = rows.at(-1);
      const isActive = selectedIndicatorIds.includes(indicator.id);
      const isUnavailable = !latest;

      return `
        <article class="metric-card indicator-card ${isActive ? "active" : ""} ${isUnavailable ? "unavailable" : ""}" data-indicator="${indicator.id}" tabindex="0" ${isUnavailable ? 'aria-disabled="true"' : ""}>
          <span class="indicator-label">${indicator.name}</span>
          <strong>${latest ? formatValue(latest.value, indicator) : "--"}</strong>
          ${renderIndicatorChange(rows, indicator)}
          ${latest ? "" : '<small class="indicator-date">Unavailable</small>'}
          ${renderColorPalette({
            activeColor: indicatorColors.get(indicator.id),
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
      } else if (selectedIndicatorIds.length < 2) {
        selectedIndicatorIds.push(id);
      } else {
        showNotice("You can compare up to two indicators at a time.");
        return;
      }

      clearNotice();
      manualAxisOrder = false;
      syncAxisOrder();
      validateMacroScale();
      renderAll();
  }

  indicatorGrid.querySelectorAll("[data-indicator]").forEach((card) => {
    card.addEventListener("click", () => {
      toggleCard(card);
    });
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
      indicatorColors.set(swatch.dataset.colorIndicator, swatch.dataset.colorValue);
      storeColors("macroIndicatorColors", indicatorColors);
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

function getYAxisLayout(side, indicator, rows, theme = getChartTheme()) {
  const color = indicatorColors.get(indicator.id);
  const scale = macroScale === "log" && canUseLog(rows) ? "log" : "linear";
  const range = getAutoRange(rows, scale, indicator.axisBounds);
  const axis = {
    title: {
      text: `${indicator.name}<br>${indicator.unitLabel}`,
      font: { color },
    },
    gridcolor: side === "left" ? theme.grid : "rgba(0,0,0,0)",
    zeroline: true,
    zerolinecolor: theme.zero,
    tickfont: { color, weight: 700 },
    type: scale,
  };

  if (indicator.axisBounds) {
    axis.minallowed = indicator.axisBounds.min;
    axis.maxallowed = indicator.axisBounds.max;
  }

  axis.title.font.weight = 700;

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
    ...semiconductorIndicators,
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

function getThresholdZoneShapes(selected, layout) {
  return selected.flatMap((indicatorId, index) => {
    const zones = indicatorThresholdZones[indicatorId];
    const indicator = getChartIndicatorDefinition(indicatorId);

    if (!zones) {
      return [];
    }

    const axisName = index === 0 ? "yaxis" : "yaxis2";
    const yref = index === 0 ? "y" : "y2";
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
  const selected = axisOrder.slice(0, 2);
  const traces = selected.map((id, index) => {
    const indicator = getIndicator(id);
    const rows = getFilteredRows(id);

    return {
      x: rows.map((row) => row.date),
      y: rows.map((row) => row.value),
      type: "scatter",
      mode: "lines",
      name: indicator.name,
      yaxis: index === 0 ? "y" : "y2",
      line: {
        color: indicatorColors.get(indicator.id),
        width: 1.5,
        dash: "solid",
      },
      hovertemplate: `<b>${indicator.name}</b><br>%{y:.${indicator.decimals}f} ${indicator.unitLabel}<extra></extra>`,
    };
  });

  const title = selected.map((id) => getIndicator(id).name).join(" vs ");
  chartTitle.textContent = title || "Select up to two indicators";

  const xBounds = getMacroXBounds();
  const firstRows = selected[0] ? getFilteredRows(selected[0]) : [];
  const secondRows = selected[1] ? getFilteredRows(selected[1]) : [];
  const firstIndicator = selected[0] ? getIndicator(selected[0]) : null;
  const secondIndicator = selected[1] ? getIndicator(selected[1]) : null;
  const theme = getChartTheme();

  const layout = {
    margin: { t: 18, r: selected.length === 2 ? 72 : 22, b: 92, l: 72 },
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
      y: -0.22,
      yanchor: "top",
    },
    xaxis: {
      range: xBounds ? [xBounds.start, xBounds.end] : undefined,
      minallowed: xBounds?.start,
      maxallowed: xBounds?.end,
      showgrid: false,
      tickformat: "%Y/%-m",
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

  if (firstIndicator) {
    layout.yaxis = getYAxisLayout("left", firstIndicator, firstRows, theme);
  }

  if (secondIndicator) {
    layout.yaxis2 = getYAxisLayout("right", secondIndicator, secondRows, theme);
  }

  layout.shapes = getThresholdZoneShapes(selected, layout);

  if (chartElement && window.Plotly) {
    Plotly.react(chartElement, traces, layout, getPlotlyConfig()).then(() => {
      if (xBounds) {
        chartElement.dataset.promptStart = xBounds.start;
        chartElement.dataset.promptEnd = xBounds.end;
      }

      setupBoundedXAxis(chartElement, getMacroXBounds);
      setupMobileYAxisGestures(chartElement);
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
  const startDate = activeFxRange === "MAX" ? toDate(fxData[0].date) : shiftFxDateByRange(endDate, activeFxRange);

  return {
    start: toIsoDate(startDate),
    end: toIsoDate(endDate),
  };
}

function getFxRangeStart(rows) {
  if (activeFxRange === "MAX") {
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

function renderFxCards() {
  const latestUsdJpy = latestWith("USDJPY");
  const latestSpread = latestWith("US_Japan_2Y_Spread");
  const latestAny = fxData.at(-1);

  setFxText("fx-usdjpy-value", latestUsdJpy ? latestUsdJpy.USDJPY.toFixed(2) : "--");
  setFxText(
    "fx-usdjpy-date",
    latestUsdJpy ? `Latest observation ${formatFullDate(latestUsdJpy.date)}` : "Unavailable",
  );
  setFxText(
    "fx-spread-value",
    latestSpread ? `${latestSpread.US_Japan_2Y_Spread.toFixed(2)} pp` : "--",
  );
  setFxText(
    "fx-spread-date",
    latestSpread ? `Latest observation ${formatFullDate(latestSpread.date)}` : "Unavailable",
  );
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
      activeColor: fxColors.get(id),
      targetId: id,
      targetType: "fx",
    });

    control.querySelectorAll("[data-fx-color]").forEach((swatch) => {
      swatch.addEventListener("click", (event) => {
        event.stopPropagation();
        fxColors.set(swatch.dataset.fxColor, swatch.dataset.colorValue);
        storeColors("fxIndicatorColors", fxColors);
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

function fxAxisRange(values) {
  const finiteValues = values.filter((value) => Number.isFinite(value));

  if (finiteValues.length === 0) {
    return undefined;
  }

  let min = Math.min(...finiteValues);
  let max = Math.max(...finiteValues);

  if (min === max) {
    const padding = Math.abs(min || 1) * 0.08;
    min -= padding;
    max += padding;
  } else {
    const padding = (max - min) * 0.08;
    min -= padding;
    max += padding;
  }

  return [min, max];
}

function renderFxChart() {
  if (!fxChartElement || !window.Plotly || fxData.length === 0) {
    return;
  }

  const rows = getFilteredFxRows();
  const usdJpyColor = fxColors.get("USDJPY");
  const spreadColor = fxColors.get("US_Japan_2Y_Spread");
  const fxSeries = [
    {
      id: "USDJPY",
      name: "USD/JPY",
      axisTitle: "USD/JPY",
      field: "USDJPY",
      color: usdJpyColor,
      decimals: 2,
      suffix: "",
    },
    {
      id: "US_Japan_2Y_Spread",
      name: "US-Japan 2Y Spread",
      axisTitle: "US-Japan 2Y Spread<br>Percentage Points",
      field: "US_Japan_2Y_Spread",
      color: spreadColor,
      decimals: 2,
      suffix: " pp",
    },
  ].filter((series) => visibleFxSeries.has(series.id));

  const traces = fxSeries.map((series, index) => {
    const seriesRows = rows.filter((row) => Number.isFinite(row[series.field]));

    return {
      x: seriesRows.map((row) => row.date),
      y: seriesRows.map((row) => row[series.field]),
      type: "scatter",
      mode: "lines",
      name: series.name,
      yaxis: index === 0 ? "y" : "y2",
      line: { color: series.color, width: 1.5 },
      hovertemplate: `<b>${series.name}</b><br>%{y:.${series.decimals}f}${series.suffix}<extra></extra>`,
    };
  });

  const primarySeries = fxSeries[0];
  const secondarySeries = fxSeries[1];
  const primaryValues = primarySeries ? rows.map((row) => row[primarySeries.field]) : [];
  const secondaryValues = secondarySeries ? rows.map((row) => row[secondarySeries.field]) : [];
  const xBounds = getFxXBounds();
  const theme = getChartTheme();
  const yaxis = primarySeries
    ? {
        title: { text: primarySeries.axisTitle, font: { color: primarySeries.color } },
        range: fxAxisRange(primaryValues),
        tickfont: { color: primarySeries.color, weight: 700 },
        gridcolor: theme.grid,
        zeroline: false,
      }
    : {
        visible: false,
      };
  const yaxis2 = secondarySeries
    ? {
        title: { text: secondarySeries.axisTitle, font: { color: secondarySeries.color } },
        range: fxAxisRange(secondaryValues),
        tickfont: { color: secondarySeries.color, weight: 700 },
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

  if (yaxis.title) {
    yaxis.title.font.weight = 700;
  }

  if (yaxis2.title) {
    yaxis2.title.font.weight = 700;
  }

  Plotly.react(
    fxChartElement,
    traces,
    {
      margin: { t: 18, r: 74, b: 92, l: 64 },
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
        y: -0.22,
        yanchor: "top",
      },
      xaxis: {
        range: xBounds ? [xBounds.start, xBounds.end] : undefined,
        minallowed: xBounds?.start,
        maxallowed: xBounds?.end,
        showgrid: false,
        tickformat: "%Y/%-m",
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
    if (xBounds) {
      fxChartElement.dataset.promptStart = xBounds.start;
      fxChartElement.dataset.promptEnd = xBounds.end;
    }

    setupBoundedXAxis(fxChartElement, getFxXBounds);
    setupMobileYAxisGestures(fxChartElement);
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
  const state = {
    data: new Map(),
    loaded: false,
    loadingPromise: null,
    colors: loadStoredColors(
      config.storageKey,
      new Map(config.indicators.map((indicator) => [indicator.id, indicator.color])),
    ),
    selectedIds: [...config.defaultSelectedIds],
    axisOrder: [...config.defaultSelectedIds],
    manualAxisOrder: false,
    activeRange: config.defaultRange || "5Y",
    scale: "linear",
  };

  const elements = {
    grid: document.getElementById(`${config.key}-indicator-grid`),
    chart: document.getElementById(`${config.key}-chart`),
    title: document.getElementById(`${config.key}-chart-title`),
    notice: document.getElementById(`${config.key}-selection-notice`),
    noticeText: document.getElementById(`${config.key}-selection-notice-text`),
    noticeClose: document.getElementById(`${config.key}-selection-notice-close`),
    logScaleInput: document.getElementById(`${config.key}-log-scale`),
    rangeButtons: Array.from(document.querySelectorAll(`[data-comparison-range="${config.key}"]`)),
  };

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
    const selected = state.axisOrder.slice(0, 2);
    const latestDateText = selected
      .flatMap((id) => state.data.get(id) || [])
      .map((row) => row.date)
      .sort((a, b) => a.localeCompare(b))
      .at(-1);

    if (!latestDateText) {
      return null;
    }

    const endDate = toDate(latestDateText);
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

    const displayStart = selected
      .flatMap((id) => getDisplayRows(state.data.get(id) || [], baseBounds))
      .map((row) => row.date)
      .sort((a, b) => a.localeCompare(b))
      .at(0);

    return {
      start: displayStart && displayStart < baseBounds.start ? displayStart : baseBounds.start,
      end: baseBounds.end,
      minallowed: baseBounds.start,
    };
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
    return state.axisOrder.slice(0, 2).every((id) => canUseLocalLog(getFilteredRows(id)));
  }

  function validateLocalScale() {
    if (state.scale === "log" && !selectedRowsAllowLocalLog()) {
      state.scale = "linear";
      elements.logScaleInput.checked = false;
      showLocalNotice("Log scale is unavailable because the selected range includes zero or negative values.");
    }
  }

  function getLocalYAxisLayout(side, indicator, rows, theme = getChartTheme()) {
    const color = state.colors.get(indicator.id);
    const scale = state.scale === "log" && canUseLocalLog(rows) ? "log" : "linear";
    const range = getAutoRange(rows, scale, indicator.axisBounds);
    const axis = {
      title: {
        text: `${indicator.name}<br>${indicator.unitLabel}`,
        font: { color, weight: 700 },
      },
      gridcolor: side === "left" ? theme.grid : "rgba(0,0,0,0)",
      zeroline: true,
      zerolinecolor: theme.zero,
      tickfont: { color, weight: 700 },
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
          <article class="metric-card indicator-card ${isActive ? "active" : ""} ${isUnavailable ? "unavailable" : ""}" data-${config.key}-indicator="${indicator.id}" tabindex="0" ${isUnavailable ? 'aria-disabled="true"' : ""}>
            <span class="indicator-label">${indicator.name}</span>
            <strong>${latest ? formatValue(latest.value, indicator) : "--"}</strong>
            ${renderIndicatorChange(rows, indicator)}
            ${latest ? "" : `<small class="indicator-date">${state.loaded ? "Unavailable" : "Loading"}</small>`}
            ${renderColorPalette({
              activeColor: state.colors.get(indicator.id),
              targetId: indicator.id,
              targetType: config.key,
            })}
          </article>
        `;
      })
      .join("");

    function toggleCard(card) {
      const id = card.dataset[`${config.key}Indicator`];

      if (state.loaded && (state.data.get(id) || []).length === 0) {
        showLocalNotice(`${getLocalIndicator(id).name} data is currently unavailable.`);
        return;
      }

      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
      } else if (state.selectedIds.length < 2) {
        state.selectedIds.push(id);
      } else {
        showLocalNotice("You can compare up to two indicators at a time.");
        return;
      }

      clearLocalNotice();
      state.manualAxisOrder = false;
      renderLocalAll();
    }

    elements.grid.querySelectorAll(`[data-${config.key}-indicator]`).forEach((card) => {
      card.addEventListener("click", () => toggleCard(card));
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
        state.colors.set(swatch.dataset[`${config.key}Color`], swatch.dataset.colorValue);
        storeColors(config.storageKey, state.colors);
        closeColorPanels();
        renderLocalCards();
        renderLocalChart();
      });
    });
  }

  function renderLocalChart() {
    validateLocalScale();
    const selected = state.axisOrder.slice(0, 2);
    const traces = selected.map((id, index) => {
      const indicator = getLocalIndicator(id);
      const rows = getFilteredRows(id);

      return {
        x: rows.map((row) => row.date),
        y: rows.map((row) => row.value),
        type: "scatter",
        mode: "lines",
        name: indicator.name,
        yaxis: index === 0 ? "y" : "y2",
        line: {
          color: state.colors.get(indicator.id),
          width: 1.5,
          dash: "solid",
        },
        hovertemplate: `<b>${indicator.name}</b><br>%{y:.${indicator.decimals}f} ${indicator.unitLabel}<extra></extra>`,
      };
    });

    const title = selected.map((id) => getLocalIndicator(id).name).join(" vs ");
    elements.title.textContent = title || "Select up to two indicators";

    const xBounds = getDisplayXBounds(selected);
    const requestedBounds = getXBounds();
    const includesTrendAnchor = Boolean(
      xBounds && requestedBounds && xBounds.start < requestedBounds.start,
    );
    const firstRows = selected[0] ? getFilteredRows(selected[0]) : [];
    const secondRows = selected[1] ? getFilteredRows(selected[1]) : [];
    const firstIndicator = selected[0] ? getLocalIndicator(selected[0]) : null;
    const secondIndicator = selected[1] ? getLocalIndicator(selected[1]) : null;
    const theme = getChartTheme();
    const layout = {
      margin: { t: 18, r: selected.length === 2 ? 72 : 22, b: 92, l: 72 },
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
        y: -0.22,
        yanchor: "top",
      },
      annotations: includesTrendAnchor
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
        : [],
      xaxis: {
        range: xBounds ? [xBounds.start, xBounds.end] : undefined,
        minallowed: xBounds?.start,
        maxallowed: xBounds?.end,
        showgrid: false,
        tickformat: "%Y/%-m",
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

    if (firstIndicator) {
      layout.yaxis = getLocalYAxisLayout("left", firstIndicator, firstRows, theme);
    }

    if (secondIndicator) {
      layout.yaxis2 = getLocalYAxisLayout("right", secondIndicator, secondRows, theme);
    }

    layout.shapes = getThresholdZoneShapes(selected, layout);

    if (elements.chart && window.Plotly) {
      Plotly.react(elements.chart, traces, layout, getPlotlyConfig()).then(() => {
        if (xBounds) {
          elements.chart.dataset.promptStart = xBounds.start;
          elements.chart.dataset.promptEnd = xBounds.end;
        }

        setupBoundedXAxis(elements.chart, () => getDisplayXBounds(state.axisOrder.slice(0, 2)));
        setupMobileYAxisGestures(elements.chart);
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
      state.activeRange = button.dataset.range;
      validateLocalScale();
      renderLocalAll();
    });
  });

  elements.logScaleInput.addEventListener("change", () => {
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
    showError(error) {
      elements.grid.innerHTML = `<p class="error-message">${error.message}</p>`;
    },
  };
}

function buildComparisonPrompt(sectionLabel, state, definitions, dateText) {
  const selected = state.axisOrder.slice(0, 2);
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
    label: "Breadth",
    indicators: breadthIndicators,
    defaultSelectedIds: ["breadth-sp500"],
    defaultRange: "5Y",
    storageKey: "breadthIndicatorColors",
  }),
  createComparisonSection({
    key: "semiconductor",
    label: "Chips & AI",
    indicators: semiconductorIndicators,
    defaultSelectedIds: ["sox", "ai-capex"],
    defaultRange: "5Y",
    storageKey: "semiconductorIndicatorColors",
  }),
  createComparisonSection({
    key: "us-rates",
    label: "US Rates",
    indicators: usRatesIndicators,
    defaultSelectedIds: ["us-rates-10y-yield"],
    defaultRange: "5Y",
    storageKey: "usRatesIndicatorColors",
  }),
  createComparisonSection({
    key: "jp-rates",
    label: "JP Rates",
    indicators: jpRatesIndicators,
    defaultSelectedIds: ["japan-10y-jgb-yield"],
    defaultRange: "5Y",
    storageKey: "jpRatesIndicatorColors",
  }),
  createComparisonSection({
    key: "japan",
    label: "Japan",
    indicators: japanIndicators,
    defaultSelectedIds: ["nikkei-225"],
    defaultRange: "5Y",
    storageKey: "japanIndicatorColors",
  }),
  createComparisonSection({
    key: "taiwan",
    label: "Taiwan",
    indicators: taiwanIndicators,
    defaultSelectedIds: ["taiex"],
    defaultRange: "5Y",
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
  if (!usesTouchChartMode()) {
    return;
  }

  const chartPane = track.querySelector('[data-mobile-pane="charts"]');

  if (!chartPane) {
    return;
  }

  chartPane.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
}

function setMobileView(group, view) {
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

  if (view === "charts") {
    requestAnimationFrame(() => {
      resizeVisibleCharts();
      requestAnimationFrame(() => {
        centerMobileChartPane(track);
      });
    });
  }
}

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
  const datasets = await Promise.all(
    indicators.map(async (indicator) => {
      try {
        return [indicator.id, parseIndicatorRows(await fetchLocalText(indicator.file), indicator)];
      } catch (error) {
        console.warn(`${indicator.name} unavailable:`, error);
        return [indicator.id, []];
      }
    }),
  );

  indicatorData = new Map(datasets);
}

async function loadFxData() {
  fxData = parseFxCsv(await fetchLocalText("data/fx.csv"));
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

function renderIndicatorLinks(indicator) {
  const sourceUrls =
    Array.isArray(indicator.source_urls) && indicator.source_urls.length > 0
      ? indicator.source_urls
      : [{ label: indicator.source_name, url: indicator.source_url }];

  const validSources = sourceUrls.filter((source) => source?.url);

  if (validSources.length === 0) {
    return `<strong>
      <span class="status-name-full">${escapeHtml(indicator.display_name)}</span>
      <span class="status-name-short">${escapeHtml(indicator.short_name || indicator.display_name)}</span>
    </strong>`;
  }

  return `
    <a class="indicator-source-link" href="${escapeHtml(validSources[0].url)}" target="_blank" rel="noopener noreferrer">
      <strong>
        <span class="status-name-full">${escapeHtml(indicator.display_name)}</span>
        <span class="status-name-short">${escapeHtml(indicator.short_name || indicator.display_name)}</span>
      </strong>
    </a>
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

function renderStatusDates(indicator) {
  return `
    <div class="status-date-stack">
      <span>${escapeHtml(indicator.latest_available_date || "--")}</span>
    </div>
  `;
}

function renderDataStatus(metadata) {
  if (!metadata || !metadata.indicators) {
    throw new Error("Data status metadata is missing indicators.");
  }

  const indicators = Object.values(metadata.indicators);
  if (dataStatusUpdated) {
    dataStatusUpdated.textContent = metadata.last_dashboard_refresh_display
      ? `Last dashboard refresh ${metadata.last_dashboard_refresh_display}`
      : "Data status loaded";
  }

  if (dataStatusBody) {
    dataStatusBody.innerHTML = indicators
      .map((indicator) => {
        const formula = indicator.formula
          ? `<p class="formula-text"><strong>Formula:</strong> ${escapeHtml(indicator.formula)}</p>`
          : "";
        const releaseNote = indicator.release_note
          ? `<p class="formula-text">${escapeHtml(indicator.release_note)}</p>`
          : "";
        const errorDetails = indicator.error_message
          ? `<p class="formula-text"><strong>Error:</strong> ${escapeHtml(indicator.error_message)}</p>`
          : "";
        const details = `
          <details class="status-details">
            <summary>Details</summary>
            <div class="status-details-content">
              ${renderStatusSourceNote(indicator)}
              <p class="status-detail-line"><strong>Update frequency:</strong> ${escapeHtml(indicator.frequency || "--")}</p>
              <p class="status-detail-line"><strong>Next expected update:</strong> ${escapeHtml(indicator.next_expected_update_date || "--")}</p>
              ${formula}${releaseNote}${errorDetails}
            </div>
          </details>
        `;

        return `
          <tr>
            <td>
              <div class="indicator-source-links">${renderIndicatorLinks(indicator)}</div>
              <div class="status-mobile-meta">
                ${renderStatusDates(indicator)}
                ${renderStatusBadge(indicator.status)}
              </div>
              ${details}
            </td>
            <td>${renderStatusDates(indicator)}</td>
            <td>${renderStatusBadge(indicator.status)}</td>
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
        <td colspan="3">
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
    const pattern = new RegExp(`(^|[^A-Za-z0-9_])(${escapeRegex(escapedAlias)})(?=$|[^A-Za-z0-9_])`, "g");

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
    targetRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function renderGlossary(glossary) {
  glossaryEntries = Array.isArray(glossary?.indicators) ? glossary.indicators : [];
  const visibleEntries = filterGlossaryEntries(glossaryEntries);

  if (glossaryMeta) {
    glossaryMeta.textContent = glossarySearchText
      ? `${visibleEntries.length} of ${glossaryEntries.length} indicators`
      : `${glossaryEntries.length} indicators`;
  }

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
}

function renderGlossaryError(error) {
  if (glossaryMeta) {
    glossaryMeta.textContent = "Glossary unavailable";
  }

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
    activeRange = button.dataset.range;
    validateMacroScale();
    renderAll();
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

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
    });
  });
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
    activeFxRange = button.dataset.fxRange;
    fxRangeButtons.forEach((item) => {
      const active = item.dataset.fxRange === activeFxRange;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderFxChart();
  });
});

function toggleFxCard(card) {
  const series = card.dataset.fxCard;

  if (visibleFxSeries.has(series)) {
    visibleFxSeries.delete(series);
  } else {
    visibleFxSeries.add(series);
  }

  renderFxCards();
  renderFxChart();
}

fxCards.forEach((card) => {
  card.addEventListener("click", () => {
    toggleFxCard(card);
  });
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

    const target = event.target.closest("[data-glossary-expand], [data-glossary-row]");

    if (target) {
      const id = target.dataset.glossaryExpand || target.dataset.glossaryRow;
      expandedGlossaryId = expandedGlossaryId === id ? null : id;
      renderGlossary({ indicators: glossaryEntries });
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
    expandedGlossaryId = expandedGlossaryId === id ? null : id;
    renderGlossary({ indicators: glossaryEntries });
  });
}

glossaryLanguageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeGlossaryLanguage = button.dataset.glossaryGlobalLanguage;
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

loadIndicatorData()
  .then(() => {
    renderAll();
  })
  .catch((error) => {
    indicatorGrid.innerHTML = `<p class="error-message">${error.message}</p>`;
  });

loadDataStatus().then(renderDataStatus).catch(renderDataStatusError);

loadGlossary().then(renderGlossary).catch(renderGlossaryError);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}
