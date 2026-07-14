# Market Indicators Dashboard

A static, CSV-driven market indicators dashboard built with plain HTML, CSS, JavaScript, and Plotly.js.

## Local Preview

This dashboard must be served from a local web server so the browser can load CSV files from `data/`.

From the project folder:

```bash
python3 -m http.server 8001
```

Then open:

```text
http://localhost:8001/
```

Opening `index.html` directly with `file://` is not recommended because browser security rules can block local CSV loading.

## GitHub Pages

The dashboard is designed to deploy as a static GitHub Pages site:

```text
https://raylia529.github.io/market-indicators-dashboard/
```

The repository includes `.github/workflows/pages.yml`, which:

- deploys the current static dashboard when changes are pushed to `main`;
- refreshes CSV data after the U.S. close and then every two hours through 23:00 JST using GitHub Actions;
- can be run manually from the GitHub Actions tab with `workflow_dispatch`;
- deploys `index.html`, `style.css`, `app.js`, PWA assets, icons, and `data/` to Pages.

In GitHub, set `Settings -> Pages -> Build and deployment -> Source` to `GitHub Actions`.

If the daily data commit step fails with a permission error, set `Settings -> Actions -> General -> Workflow permissions` to `Read and write permissions`.

## Current Features

- Macro, Breadth, Chips & AI, FX, and Data Status tabs with matching responsive layouts where applicable.
- Data Status tab with source transparency, latest observation dates, refresh timestamps, and status badges.
- Mobile card-to-chart swipe layout for portrait and landscape phone screens.
- Indicator cards loaded from local CSV files.
- Click cards to show or hide series.
- Macro, Breadth, and Chips & AI comparisons support up to two indicators at a time.
- FX comparison supports USD/JPY and US-Japan 2Y yield spread.
- Interactive Plotly charts with zoom, pan, hover tooltips, and range controls.
- Range controls:
  - Macro, Breadth, Chips & AI: 1Y, 3Y, 5Y, 10Y, Max
  - FX: 3M, 6M, 1Y, 2Y, 5Y, 10Y, MAX
- Macro Max display starts at 1997/1.
- Dual-series charts use independent Y axes and original units.
- Data is not normalized.
- Log scale is available only when the selected range contains positive values.
- Line colors can be adjusted from the cards.
- Installable iPhone PWA with a web app manifest, app icons, and service worker.

## Install on iPhone

Open the GitHub Pages site in Safari:

```text
https://raylia529.github.io/market-indicators-dashboard/
```

Then install it:

1. Tap the Safari Share button.
2. Tap `Add to Home Screen`.
3. Confirm the name `Markets`.
4. Launch `Markets` from the Home Screen.

When launched from the Home Screen, the dashboard uses standalone display mode without the normal Safari address bar.

## PWA Cache Behavior

The service worker is configured for GitHub Pages under:

```text
/market-indicators-dashboard/
```

Caching strategy:

- HTML, CSS, JavaScript, manifest, offline page, and local icons use cache-first loading.
- Market CSV and JSON files under `data/` use network-first loading.
- Market data can fall back to the most recently cached response when offline, but the app tries the network first so updated CSV data is not hidden by permanent cache.
- External CDN assets, including Plotly.js, are not added to the local application-shell cache.

## Data Files

All dashboard data is stored in `data/`.

| Indicator | Local file | Source | Earliest observation | Frequency |
| --- | --- | --- | --- | --- |
| S&P 500 | `data/sp500.csv` | Full-history CSV archive plus FRED `SP500` latest data | 1950-01-03 | Daily |
| VIX | `data/vix.csv` | FRED `VIXCLS` | 1990-01-02 | Daily |
| HY OAS | `data/hy_oas.csv` | Archived FRED `BAMLH0A0HYM2` plus current FRED rolling data | 1996-12-31 | Daily/business daily |
| 10Y-2Y Spread | `data/us-10y-minus-2y-spread.csv` | FRED `T10Y2Y` | 1976-06-01 | Daily/business daily |
| Margin Debt YoY | `data/finra-margin-debt-yoy.csv` | FINRA Margin Statistics Excel, calculated YoY from debit balances | 1998-01-31 | Monthly |
| US 10Y Yield | `data/us-10-year-treasury-yield.csv` | FRED `DGS10` | 1962-01-02 | Daily/business daily |
| MOVE Index | `data/move.csv` | Yahoo Finance `^MOVE` | 2002-11-12 | Daily/business daily |
| Fed Balance Sheet | `data/fed-balance-sheet.csv` | FRED `WALCL` | 2002-12-18 | Weekly |
| NFCI | `data/nfci.csv` | FRED `NFCI` | 1971-01-08 | Weekly |
| SKEW Index | `data/skew.csv` | Cboe SKEW history CSV | 1990-01-02 | Daily/business daily |
| Advance / Decline Line | `data/advance-decline-line.csv` | Calculated from current S&P 500 constituents using Yahoo Finance daily closes | 10-year rolling history | Daily/business daily |
| % Above 200DMA | `data/sp500-above-200dma.csv` | Calculated from current S&P 500 constituents using Yahoo Finance daily closes | 10-year rolling history | Daily/business daily |
| SOX Index | `data/sox.csv` | Yahoo Finance `^SOX` | 1994-05-04 | Daily/business daily |
| TSMC Revenue YoY | `data/tsmc-revenue-yoy.csv` | MOPSOV monthly operating revenue for TSMC `2330` | 2013-01-31 | Monthly |
| AI CapEx | `data/ai-capex.csv` | SEC companyfacts, calculated from MSFT, AMZN, GOOGL, and META CapEx facts | 2014-12-31 currently aligned | Quarterly |
| USD/JPY | `data/fx.csv` | FRED `DEXJPUS`, with Yahoo Finance `JPY=X` filling only recent unpublished dates | 1971-01-04 | Daily/forex trading days |
| US-JP 2Y Spread | `data/fx.csv` | FRED `DGS2` minus Japan MOF 2Y JGB yield | 1976-06-01 | Daily/business daily with forward-filled published yield observations |

Each single-series CSV uses:

```csv
date,value
```

The consolidated FX CSV uses:

```csv
date,USDJPY,US_2Y_Yield,Japan_2Y_Yield,US_Japan_2Y_Spread
```

The Data Status page reads generated metadata from:

```text
data/status.json
```

The Data Status table links each indicator name to its official source and shows its latest available observation and current update status.

## Update Scripts

The dashboard works from the committed CSV files. Data update scripts are included for manual refreshes:

```bash
node scripts/update-sp500.mjs
node scripts/update-hy-oas.mjs
node scripts/update-fred-series.mjs
node scripts/update-extra-indicators.mjs
node scripts/update-fx.mjs
python3 -m pip install -r requirements.txt
python3 scripts/update-finra-margin-debt-yoy.py
node scripts/generate-status.mjs
```

The scripts use merge-and-validate workflows where applicable and avoid replacing complete history with short rolling datasets.

## Data Notes

### S&P 500

- Indicator: S&P 500
- Series ID: SP500
- Unit: Index
- Historical source: `https://raw.githubusercontent.com/vijinho/sp500/refs/heads/master/csv/sp500.csv`
- Latest source: FRED daily `SP500` observations
- The CSV can retain data before 1997, while dashboard Max displays from 1997/1.

### US High Yield OAS

- Indicator: ICE BofA US High Yield Index Option-Adjusted Spread
- Series ID: BAMLH0A0HYM2
- Unit: Percentage Points
- Historical data comes from a third-party archive preserved before FRED access limitations changed.
- Latest data is merged from the current FRED rolling three-year dataset.
- Updates merge archive, existing local data, and current FRED data; they do not overwrite the complete CSV with only recent data.
- This data may be subject to ICE Data Indices data licensing terms.

### FX

- USD/JPY source: FRED `DEXJPUS` remains the official complete-history source. Yahoo Finance `JPY=X` only fills recent dates that FRED has not published; duplicate dates always use FRED.
- US 2-Year Treasury source: FRED `DGS2`
- Japan 2-Year JGB source: Japan Ministry of Finance JGB interest rate CSV files:
  - Historical: `https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/historical/jgbcme_all.csv`
  - Current: `https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/jgbcme.csv`
- The MOF parser locates the header row containing `Date` and `2Y`; it does not rely on fixed column positions.
- US and Japan 2Y yields are outer-joined by date and forward-filled only from already published observations before calculating the spread.

### Breadth

- Breadth indicators are calculated from the current S&P 500 constituent list published by the `datasets/s-and-p-500-companies` GitHub dataset and Yahoo Finance daily close data.
- The Advance / Decline Line uses daily net advances minus declines and accumulates the result over the downloaded window.
- `% Above 200DMA` calculates the percentage of downloaded constituents whose close is above their own 200-day moving average.
- This is a practical free-data approximation based on current constituents. It does not reconstruct historical S&P 500 membership changes.

### Chips & AI

- SOX uses Yahoo Finance `^SOX` daily index data.
- TSMC Revenue YoY is parsed from MOPSOV single-company monthly operating revenue for TSMC `2330`.
- The current historical archive starts in 2013 because the MOPS IFRS monthly revenue endpoint is available from ROC year 102. The updater merges newly available months and keeps existing history if a MOPSOV request fails.
- MOPSOV occasionally returns temporary 307 responses while bootstrapping many months. The bootstrap skips failed months instead of shortening the CSV; missing archive months can be filled later by rerunning or by importing a manually downloaded MOPS archive.
- AI CapEx combines quarterly CapEx from Microsoft, Amazon, Alphabet, and Meta using SEC companyfacts. SEC taxonomy and fiscal-period reporting are not perfectly uniform across companies, so the script uses actual reported 10-Q/10-K facts and only writes quarters where all four companies can be aligned.

## Validation

There is no package manager or formal build step. Basic validation for this static project is:

```bash
node --check app.js
node --check sw.js
node --check scripts/generate-status.mjs
node --check scripts/update-sp500.mjs
node --check scripts/update-hy-oas.mjs
node --check scripts/update-fred-series.mjs
node --check scripts/update-extra-indicators.mjs
node --check scripts/update-fx.mjs
python3 -m py_compile scripts/update-finra-margin-debt-yoy.py
```

Also verify that all CSV files are sorted, have valid dates, have numeric values, and contain no duplicate dates.
