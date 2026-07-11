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

const indicatorGrid = document.getElementById("indicator-grid");
const chartElement = document.getElementById("indicator-chart");
const chartTitle = document.getElementById("chart-title");
const chartMeta = document.getElementById("chart-meta");
const compareNote = document.getElementById("compare-note");
const selectionNotice = document.getElementById("selection-notice");
const selectionNoticeText = document.getElementById("selection-notice-text");
const selectionNoticeClose = document.getElementById("selection-notice-close");
const clearButton = document.getElementById("clear-selection");
const swapButton = document.getElementById("swap-axes");
const macroLogScaleInput = document.getElementById("macro-log-scale");
const rangeButtons = Array.from(document.querySelectorAll("[data-range]"));
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const swipeTracks = Array.from(document.querySelectorAll("[data-swipe-track]"));
const fxChartElement = document.getElementById("fx-chart");
const fxRangeButtons = Array.from(document.querySelectorAll("[data-fx-range]"));
const fxCards = Array.from(document.querySelectorAll("[data-fx-card]"));

let indicatorData = new Map();
let indicatorColors = loadStoredColors(
  "macroIndicatorColors",
  new Map(indicators.map((indicator) => [indicator.id, indicator.color])),
);
let selectedIndicatorIds = ["sp500", "high-yield-oas"];
let axisOrder = ["sp500", "high-yield-oas"];
let manualAxisOrder = false;
let activeRange = "5Y";
let macroScale = "linear";
let fxData = [];
let activeFxRange = "3M";
let visibleFxSeries = new Set(["USDJPY", "US_Japan_2Y_Spread"]);
let fxColors = loadStoredColors(
  "fxIndicatorColors",
  new Map([
    ["USDJPY", "#2563eb"],
    ["US_Japan_2Y_Spread", "#f97316"],
  ]),
);
let swipeResizeTimer = null;

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
    targetType === "macro" ? `data-color-panel-for="${targetId}"` : `data-fx-color-panel-for="${targetId}"`;

  return `
    <span>Line color</span>
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
                  : `data-fx-color="${targetId}"`;

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

function getIndicator(id) {
  return indicators.find((indicator) => indicator.id === id);
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return `${date.getFullYear()}/${date.getMonth() + 1}`;
}

function formatYearMonth(dateText) {
  return formatDate(dateText);
}

function formatValue(value, indicator) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: indicator.decimals,
    maximumFractionDigits: indicator.decimals,
  }).format(value);

  return `${formatted}${indicator.valueSuffix}`;
}

function getRangeStart(rows) {
  if (activeRange === "Max") {
    return new Date(`${maxStartDate}T00:00:00`);
  }

  const latestDate = new Date(`${rows.at(-1).date}T00:00:00`);
  latestDate.setFullYear(latestDate.getFullYear() - ranges[activeRange]);
  return latestDate;
}

function getFilteredRows(indicatorId) {
  const rows = indicatorData.get(indicatorId) || [];

  if (rows.length === 0) {
    return [];
  }

  const start = getRangeStart(rows);
  return rows.filter((row) => new Date(`${row.date}T00:00:00`) >= start);
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

function getAutoRange(rows, scale) {
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

  return [min, max];
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

      return `
        <article class="metric-card indicator-card ${isActive ? "active" : ""}" data-indicator="${indicator.id}" tabindex="0">
          <span class="indicator-label">${indicator.name}</span>
          <strong>${latest ? formatValue(latest.value, indicator) : "--"}</strong>
          <small class="indicator-date">${latest ? `Updated ${formatDate(latest.date)}` : "Loading"}</small>
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

function getYAxisLayout(side, indicator, rows) {
  const color = indicatorColors.get(indicator.id);
  const scale = macroScale === "log" && canUseLog(rows) ? "log" : "linear";
  const range = getAutoRange(rows, scale);
  const axis = {
    title: {
      text: `${indicator.name}<br>${indicator.unitLabel}`,
      font: { color },
    },
    gridcolor: side === "left" ? "#e5e7eb" : "rgba(229,231,235,0)",
    zeroline: true,
    zerolinecolor: "#d1d5db",
    tickfont: { color, weight: 700 },
    type: scale,
  };

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

function renderChart() {
  validateMacroScale();
  const selected = axisOrder.slice(0, 2);
  const traces = selected.map((id, index) => {
    const side = index === 0 ? "left" : "right";
    const indicator = getIndicator(id);
    const rows = getFilteredRows(id);

    return {
      x: rows.map((row) => row.date),
      y: rows.map((row) => row.value),
      type: "scatter",
      mode: "lines",
      name: `${indicator.name} (${side === "left" ? "left" : "right"} axis)`,
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
  chartMeta.textContent = `${activeRange} range · Max starts ${formatYearMonth(maxStartDate)}`;
  compareNote.hidden = selected.length !== 2;
  swapButton.disabled = selected.length !== 2;

  const firstRows = selected[0] ? getFilteredRows(selected[0]) : [];
  const secondRows = selected[1] ? getFilteredRows(selected[1]) : [];
  const firstIndicator = selected[0] ? getIndicator(selected[0]) : null;
  const secondIndicator = selected[1] ? getIndicator(selected[1]) : null;

  const layout = {
    margin: { t: 18, r: selected.length === 2 ? 72 : 22, b: 48, l: 72 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#111827",
    },
    legend: {
      orientation: "h",
      x: 0,
      y: 1.14,
    },
    xaxis: {
      range: activeRange === "Max" ? [maxStartDate, undefined] : undefined,
      showgrid: false,
      tickformat: "%Y/%-m",
      hoverformat: "%Y/%-m/%-d",
      tickfont: { color: "#64748b", weight: 700 },
    },
    hovermode: "x unified",
    dragmode: "zoom",
  };

  if (firstIndicator) {
    layout.yaxis = getYAxisLayout("left", firstIndicator, firstRows);
  }

  if (secondIndicator) {
    layout.yaxis2 = getYAxisLayout("right", secondIndicator, secondRows);
  }

  const config = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
  };

  if (chartElement && window.Plotly) {
    Plotly.react(chartElement, traces, layout, config);
  }
}

function getFxRangeStart(rows) {
  if (activeFxRange === "MAX") {
    return null;
  }

  const latestDate = new Date(`${rows.at(-1).date}T00:00:00`);
  const amount = Number(activeFxRange.slice(0, -1));
  const unit = activeFxRange.slice(-1);

  if (unit === "M") {
    latestDate.setMonth(latestDate.getMonth() - amount);
  } else {
    latestDate.setFullYear(latestDate.getFullYear() - amount);
  }

  return latestDate;
}

function getFilteredFxRows() {
  if (fxData.length === 0) {
    return [];
  }

  const start = getFxRangeStart(fxData);

  if (!start) {
    return fxData;
  }

  return fxData.filter((row) => new Date(`${row.date}T00:00:00`) >= start);
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
    latestUsdJpy ? `Updated ${formatDate(latestUsdJpy.date)}` : "Unavailable",
  );
  setFxText(
    "fx-spread-value",
    latestSpread ? `${latestSpread.US_Japan_2Y_Spread.toFixed(2)} pp` : "--",
  );
  setFxText(
    "fx-spread-date",
    latestSpread ? `Updated ${formatDate(latestSpread.date)}` : "Unavailable",
  );
  setFxText(
    "fx-updated",
    latestAny ? `Dataset through ${formatDate(latestAny.date)}` : "FX data unavailable",
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
  const yaxis = primarySeries
    ? {
        title: { text: primarySeries.axisTitle, font: { color: primarySeries.color } },
        range: fxAxisRange(primaryValues),
        tickfont: { color: primarySeries.color, weight: 700 },
        gridcolor: "#e5e7eb",
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
      margin: { t: 18, r: 74, b: 42, l: 64 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111827",
      },
      legend: { orientation: "h", x: 0, y: 1.14 },
      xaxis: {
        showgrid: false,
        tickformat: "%Y/%-m",
        hoverformat: "%Y/%-m/%-d",
        tickfont: { color: "#64748b", weight: 700 },
      },
      yaxis,
      yaxis2,
      hovermode: "x unified",
      dragmode: "zoom",
    },
    {
      displayModeBar: true,
      responsive: true,
      scrollZoom: true,
    },
  );
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
      const response = await fetch(`${indicator.file}?updated=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Could not load ${indicator.file}`);
      }

      return [indicator.id, parseCsv(await response.text())];
    }),
  );

  indicatorData = new Map(datasets);
}

async function loadFxData() {
  const response = await fetch(`data/fx.csv?updated=${Date.now()}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load data/fx.csv");
  }

  fxData = parseFxCsv(await response.text());
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

    requestAnimationFrame(() => {
      resizeVisibleCharts();
    });
  });
});

swipeTracks.forEach((track) => {
  track.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(swipeResizeTimer);
      swipeResizeTimer = window.setTimeout(resizeVisibleCharts, 140);
    },
    { passive: true },
  );
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

clearButton.addEventListener("click", () => {
  selectedIndicatorIds = [];
  axisOrder = [];
  manualAxisOrder = false;
  clearNotice();
  renderAll();
});

swapButton.addEventListener("click", () => {
  if (axisOrder.length === 2) {
    axisOrder = [axisOrder[1], axisOrder[0]];
    selectedIndicatorIds = [...axisOrder];
    manualAxisOrder = true;
    renderAll();
  }
});

loadIndicatorData()
  .then(() => {
    renderAll();
  })
  .catch((error) => {
    indicatorGrid.innerHTML = `<p class="error-message">${error.message}</p>`;
  });

loadFxData()
  .then(() => {
    renderFx();
  })
  .catch((error) => {
    setFxText("fx-updated", error.message);
  });
