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
- checks pending U.S. data at 08:15, 09:15, 10:15, 12:15, and 18:15 JST, Tuesday through Saturday;
- checks pending Japan/Taiwan data at 08:15, 18:15, 19:15, 20:15, and 22:15 JST on the applicable local business-day cycle;
- uses combined U.S./Asia profiles at 08:15 and 18:15, while the remaining times run only their assigned region;
- includes weekly, monthly, and quarterly data only after its expected release date has arrived;
- treats Japan MOF JGB yields as next-business-day releases, so the 08:15 check does not request a reference date that is not scheduled for publication until 09:30;
- skips each indicator after a successful source check on that JST date, so later retry slots contact only sources that failed or have not yet been checked;
- uses source-aware expected release dates for slow data, so a successful download of unchanged official data does not permanently suppress later overdue retries;
- refreshes the two S&P 500 Breadth indicators in an isolated weekly job at 12:45 JST every Saturday;
- can be run manually from the GitHub Actions tab for `full`, `us`, `us-fast`, `us-market`, `us-slow`, `asia`, or `breadth` with `workflow_dispatch`;
- deploys `index.html`, `style.css`, `app.js`, PWA assets, icons, and `data/` to Pages.

GitHub Actions cron expressions use UTC. The comments and times above are the intended fixed Japan Standard Time schedule. Every scheduled run evaluates freshness indicator by indicator before downloading anything. Exchange holidays can keep a daily series pending until a later check, while already complete indicators are skipped. Downloaders make no delayed retries; each configured primary or fallback endpoint is requested at most once per scheduled check. Existing committed data is retained if a source remains unavailable.

Network updates are incremental. Each updater reads the complete local CSV first, requests only a recent overlap window, and merges newer observations by date. FRED, Yahoo Finance, FinMind, TWSE, MOPS, JPX, and Japan MOF updates therefore do not bootstrap full history again when a valid local archive exists. Small Yahoo series normally request the latest five days. Breadth keeps a private 260-trading-day price cache for each current S&P 500 constituent and also requests only five days after that cache has been initialized; a constituent with no valid cache receives a one-time 420-calendar-day bootstrap so its genuine 200-day moving average can be calculated. Full-file downloads remain unavoidable for source endpoints that expose only one complete artifact: FINRA margin statistics, the New York Fed ACM workbook, Cboe SKEW history, Taiwan MOF exports, and SEC Company Facts. Freshness gates prevent those files from being requested again after the indicator is current.

In GitHub, set `Settings -> Pages -> Build and deployment -> Source` to `GitHub Actions`.

If the daily data commit step fails with a permission error, set `Settings -> Actions -> General -> Workflow permissions` to `Read and write permissions`.

## Current Features

- Macro, Breadth, Chips & AI, US Rates, JP Rates, Japan, Taiwan, FX, Data Status, and Glossary tabs with matching responsive layouts where applicable.
- Data Status tab with latest and next expected observation dates beneath each indicator plus three clear statuses: `Up to date`, `Source lag`, or `Failed`; source, frequency, formula, and error information stays available under each row's `Details` control.
- Observation dates retain each source's local market or publication date; dashboard refresh timestamps are displayed in Japan Standard Time (`JST`).
- Glossary tab with search plus collapsible indicator explanations in English, Japanese, and Chinese.
- Mobile card-to-chart swipe layout for portrait and landscape phone screens.
- Indicator cards loaded from local CSV files.
- Click cards to show or hide series.
- Macro, Breadth, Chips & AI, US Rates, JP Rates, Japan, and Taiwan comparisons support up to two indicators at a time.
- FX comparison supports USD/JPY and US-Japan 2Y yield spread.
- Interactive Plotly charts with zoom, pan, hover tooltips, and range controls.
- Range controls:
  - Macro, Breadth, Chips & AI, US Rates, JP Rates, Japan, Taiwan: 1Y, 3Y, 5Y, 10Y, Max
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
- `data/glossary.json` is treated as static app reference content and cached with the app shell.
- Market data can fall back to the most recently cached response when offline, but the app tries the network first so updated CSV data is not hidden by permanent cache.
- External CDN assets, including Plotly.js, are not added to the local application-shell cache.

## Data Files

All dashboard data is stored in `data/`.

| Indicator | Local file | Source | Earliest observation | Frequency |
| --- | --- | --- | --- | --- |
| S&P 500 | `data/sp500.csv` | Full-history CSV archive plus FRED `SP500` latest data | 1950-01-03 | Daily |
| VIX | `data/vix.csv` | FRED `VIXCLS` | 1990-01-02 | Daily |
| HY OAS | `data/hy_oas.csv` | Archived FRED `BAMLH0A0HYM2` plus current FRED rolling data | 1996-12-31 | Daily/business daily |
| HYG/IEF | `data/hyg-ief.csv` | Yahoo Finance `HYG` adjusted close divided by `IEF` adjusted close on matching dates | 2007-04-11 | Daily/US trading days |
| 10Y-2Y Spread | `data/us-10y-minus-2y-spread.csv` | FRED `T10Y2Y` | 1976-06-01 | Daily/business daily |
| Margin Debt YoY | `data/finra-margin-debt-yoy.csv` | FINRA Margin Statistics Excel, calculated YoY from debit balances | 1998-01-31 | Monthly |
| US 10Y Yield | `data/us-10-year-treasury-yield.csv` | FRED `DGS10` | 1962-01-02 | Daily/business daily |
| Fed Funds Rate | `data/fed-funds-rate.csv` | FRED `DFEDTAR` through 2008-12-15, then `DFEDTARU` | 1982-09-27 | Daily as-of values; changed by FOMC decisions |
| MOVE Index | `data/move.csv` | Yahoo Finance `^MOVE` | 2002-11-12 | Daily/business daily |
| US 10-Year Treasury Term Premium | `data/us-10y-term-premium.csv` | New York Fed ACM Term Premium, `ACM Daily` sheet, `ACMTP10` column | 1961-06-14 | Daily/business daily |
| Fed Balance Sheet | `data/fed-balance-sheet.csv` | FRED `WALCL` | 2002-12-18 | Weekly |
| NFCI | `data/nfci.csv` | FRED `NFCI` | 1971-01-08 | Weekly |
| ISM Manufacturing PMI | `data/ism-manufacturing-pmi.csv` | Institute for Supply Management official release via PR Newswire | 2025-07-31 | Monthly |
| SKEW Index | `data/skew.csv` | Cboe SKEW history CSV | 1990-01-02 | Daily/business daily |
| A/D Line (Proxy) | `data/advance-decline-line.csv` | Calculated from current S&P 500 constituents using Yahoo Finance daily closes | Preserved rolling history | Daily observations; refreshed weekly |
| % Above 200DMA (Proxy) | `data/sp500-above-200dma.csv` | Calculated from current S&P 500 constituents using Yahoo Finance daily closes | Preserved rolling history | Daily observations; refreshed weekly |
| SOX Index | `data/sox.csv` | Yahoo Finance `^SOX` | 1994-05-04 | Daily/business daily |
| TSMC Revenue YoY | `data/tsmc-revenue-yoy.csv` | MOPSOV monthly operating revenue for TSMC `2330` | 2013-01-31 | Monthly |
| AI CapEx Proxy YoY | `data/ai-capex.csv` | SEC companyfacts, calculated as YoY growth of combined reported MSFT, AMZN, GOOGL, and META total CapEx | 2018-09-30 | Quarterly |
| USD/JPY | `data/fx.csv` | FRED `DEXJPUS`, with Yahoo Finance `JPY=X` filling only recent unpublished dates | 1971-01-04 | Daily/forex trading days |
| US-JP 2Y Spread | `data/fx.csv` | FRED `DGS2` minus Japan MOF 2Y JGB yield | 1976-06-01 | Daily/business daily with forward-filled published yield observations |
| Japan 10-Year JGB Yield | `data/japan-10-year-jgb-yield.csv` | Japan Ministry of Finance JGB interest rate CSV | 1986-07-05 | Daily/Japan business days |
| Japan 10Y-2Y JGB Spread | `data/japan-10y-minus-2y-spread.csv` | Japan 10Y JGB yield minus Japan 2Y JGB yield | 1986-07-05 | Daily/Japan business days |
| Nikkei 225 | `data/nikkei-225.csv` | Yahoo Finance `^N225` | 1970-01-05 | Daily/Japan trading days |
| TOPIX | `data/topix.csv` | JPX monthly statistics PDFs (official daily closes, 2016 onward), with Yahoo Japan `998405.T` for recent gap filling | 2016-01-04 | Daily/Japan trading days |
| Foreign Investors Net Buying of Japanese Equities | `data/japan-foreign-investor-net-buying.csv` | JPX Trading by Type of Investors, Tokyo & Nagoya workbook; purchases minus sales | 2016-01-08 | Weekly |
| TAIEX | `data/taiex.csv` | Yahoo Finance `^TWII` | 1997-07-02 | Daily/Taiwan trading days |
| Foreign Investors Net Buying of Taiwan Equities | `data/taiwan-foreign-investor-net-buying.csv` | FinMind TWSE-derived bulk history, with recent official TWSE BFI82U values taking priority | 2004-04-07 | Daily/Taiwan trading days |
| Taiwan Electronics Exports YoY | `data/taiwan-electronics-exports-yoy.csv` | Taiwan Ministry of Finance exports by main commodity, electronic components in USD | 2002-01-31 | Monthly |
| USD/TWD | `data/usdtwd.csv` | FRED `DEXTAUS`, with Yahoo Finance `TWD=X` filling only recent unpublished dates | 1983-10-03 | Daily/forex trading days |
| Taiwan Margin Financing Balance YoY | `data/taiwan-margin-financing-balance-yoy.csv` | FinMind TWSE-derived total-market history, recent TWSE MI_MARGN overwrite, then calculated YoY | 2002-01-03 | Daily/Taiwan trading days |

## Source and Terms Notes

This is a personal dashboard built from publicly accessible sources. The repository keeps source attribution in Data Status, and `data/status.json` is regenerated during each refresh so the visible source list stays aligned with the update pipeline.

- Official or public-agency sources used here include FRED, SEC EDGAR companyfacts, FINRA, Japan Ministry of Finance, JPX, TWSE/MOPS, and Taiwan Ministry of Finance.
- Free market-data endpoints used here include Yahoo Finance, Yahoo Japan, and Cboe public CSV downloads where available.
- HYG/IEF uses Yahoo Finance adjusted closes because FRED does not provide matching daily HYG and IEF ETF price series. Adjusted closes reduce distribution-related price jumps; the ratio uses only dates published for both ETFs, with no forward fill or estimates.
- ISM Manufacturing PMI is parsed from the revised rolling 12-month table in ISM's official monthly press release distributed by PR Newswire. FRED removed ISM series from its services in 2016, so this repository does not label a proxy or an unverified third-party reconstruction as official history. The committed series begins in July 2025 and grows by monthly merge. ISM content and PMI trademarks remain subject to ISM's terms; review those terms before redistribution or commercial use.
- Some sources may still be subject to provider terms, third-party data rights, rate limits, or redistribution restrictions. This is especially relevant for ICE-linked HY OAS data available through FRED, ISM PMI content, Yahoo Finance data, Cboe data, and New York Fed term premium data.
- For personal, low-traffic use, the current setup is intended to be practical and transparent. Before commercial use, broad redistribution, or presenting this as a data service, review the relevant provider terms and replace any source whose terms are not suitable.

Each single-series CSV uses:

```csv
date,value
```

The consolidated FX CSV uses:

```csv
date,USDJPY,US_2Y_Yield,Japan_2Y_Yield,US_Japan_2Y_Spread
```

For analysis outside the dashboard, all historical series are also outer-joined by date into:

```text
data/consolidated.csv
```

Each indicator has its own column. Missing observations remain blank: the generator does not interpolate or forward-fill daily, weekly, monthly, or quarterly series. The dashboard does not read this file and continues to load the canonical per-indicator CSV files. Regenerate it after local data updates with:

```bash
node scripts/generate-consolidated.mjs
```

The Data Status page reads generated metadata from:

```text
data/status.json
```

The Data Status table links each indicator name to its primary source and shows the latest observation, next expected update, and current status directly beneath the indicator name. Source links, update frequency, formulas, release notes, and errors are grouped under `Details`. `Up to date` means the next observation is not overdue. `Source lag` means the source was checked after the expected update date but still had no newer observation. `Update not run` means the expected update date passed before a successful source check occurred. `Failed` means the latest refresh attempt failed or no valid data is available.

The Glossary page reads static reference text from:

```text
data/glossary.json
```

## Update Scripts

The dashboard works from the committed CSV files. Data update scripts are included for manual refreshes:

```bash
node scripts/update-sp500.mjs
node scripts/update-hy-oas.mjs
node scripts/update-fred-series.mjs
node scripts/update-extra-indicators.mjs
node scripts/update-fx.mjs
node scripts/update-us-rates.mjs
node scripts/update-japan-rates.mjs
node scripts/update-regional-markets.mjs
python3 -m pip install -r requirements.txt
python3 scripts/update-regional-official.py
python3 scripts/update-finra-margin-debt-yoy.py
node scripts/generate-status.mjs
node scripts/generate-consolidated.mjs
```

The scripts use merge-and-validate workflows where applicable and avoid replacing complete history with short rolling datasets.
The scheduled workflow can target individual groups with options such as `--series=DGS10`, `--only=taiex`, and `--profile=asia`; the FX updater can also isolate `usdjpy`, `us2y`, or `japan2y`. A manual full refresh runs every updater group, but each updater still performs an incremental merge rather than replacing complete history with a full download. `scripts/should-update.mjs` reads `data/status.json` before each scheduled download and skips indicators that are already complete for that market cycle. Data Status preserves the prior successful refresh timestamp for indicators that were not run.

Scheduled downloads have no delayed retries and use 20-second request timeouts. Each configured endpoint is contacted only once per scheduled check; Yahoo uses one chart host and regional downloads do not retry through curl. The workflow does not rerun an entire failed updater command. A failed indicator keeps its committed history and is deferred to its next assigned slot. If Yahoo returns HTTP 429, a persisted JST-date cooldown skips all remaining regular Yahoo requests that day and automatically permits requests again on the next JST date. Individual scheduled updater commands are capped at three minutes. The isolated Breadth job has a 15-minute cap because it must visit the current constituent list, but each symbol is still requested only once and the job stops issuing new requests after a Yahoo 429. Successful per-symbol cache updates survive a partial run. A per-workflow source circuit breaker still defers remaining requests after two consecutive connection failures from another provider. Manual full refreshes retain a longer command limit for validated historical processing. Freshness checks use completed market-cycle dates rather than the refresh calendar date, so a delayed Asia run finishing after midnight does not suppress the next local post-close update. Weekly, monthly, quarterly, and policy series do not enter retry slots until their metadata `next_expected_update_date` is due; after that date, an unsuccessful series participates in each applicable scheduled slot until it succeeds.

## External Schedule Backup

GitHub documents that scheduled workflow events can be delayed or dropped during periods of high Actions load. The optional Cloudflare Worker in `scheduler/` provides an independent clock while GitHub Actions continues to perform the actual update and deployment.

The Worker dispatches the existing workflow at these times:

| Profile | JST | UTC cron |
| --- | --- | --- |
| US + Asia | 08:15 Tue-Sat | `15 23 * * 1-5` |
| US | 09:15, 10:15, 12:15 Tue-Sat | `15 0,1,3 * * 2-6` |
| US + Asia | 18:15 Mon-Fri | `15 9 * * 1-5` |
| US | 18:15 Sat | `15 9 * * 6` |
| Asia | 19:15, 20:15, 22:15 Mon-Fri | `15 10,11,13 * * 1-5` |

The existing GitHub schedules remain enabled as a fallback. Duplicate dispatches do not duplicate provider downloads because `scripts/should-update.mjs` skips indicators already complete for the current market cycle.

To deploy the external scheduler:

1. Create a fine-grained GitHub personal access token restricted to this repository with only `Actions: Read and write` permission.
2. Authenticate Wrangler and store the token as a Cloudflare secret. Never add the token to a file or commit it.
3. Deploy the Worker.

```bash
cd scheduler
npx wrangler@latest login
npx wrangler@latest secret put GITHUB_ACTIONS_TOKEN
npx wrangler@latest deploy
```

Cloudflare runs the UTC cron expressions from `scheduler/wrangler.jsonc`. The Worker only calls GitHub's workflow-dispatch API; it never contacts FRED, Yahoo Finance, or another market-data provider.

The Fed Funds Rate card uses the official target-rate series rather than the effective overnight rate. Its daily as-of observations are drawn as a step line so unchanged policy periods remain hoverable at every observation. Card change is measured against the previous distinct policy setting and labeled `Last change`; this avoids implying that an unchanged FOMC decision was itself a rate move. Data Status uses the published FOMC decision calendar for the next expected update; unscheduled policy decisions may occur before that date.

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

### US Rates

- US 2Y, US 10Y, 10Y-2Y Spread, and MOVE reuse the canonical data already used by FX and Macro where applicable.
- US 10-Year Treasury Term Premium uses the Federal Reserve Bank of New York ACM term premium workbook.
- Dataset: `ACM Daily`
- Column: `ACMTP10`
- Unit: Percentage Points
- The direct New York Fed `.xls` download is automatable, but public redistribution terms for a committed derived CSV are not explicitly confirmed. Keep attribution visible in Data Status.

### JP Rates

- Visible section name is `JP Rates`.
- Japan 2-Year JGB Yield reuses the canonical `Japan_2Y_Yield` column in `data/fx.csv`.
- Japan 10-Year JGB Yield comes from the same official Japan Ministry of Finance JGB interest rate CSV family used for Japan 2Y.
- The parser detects the `Date` and `10Y` headers dynamically.
- Japan 10-Year Minus 2-Year JGB Yield Spread formula:

```text
Japan 10-Year JGB Yield - Japan 2-Year JGB Yield
```

- The spread uses an outer join and forward-fills only previously published observations.
- S&P/JPX JGB VIX Index is intentionally not implemented. A stable, legal, public automated source suitable for GitHub Pages and committed CSV storage was not confirmed.

### Japan

- Nikkei 225 uses Yahoo Finance `^N225`.
- TOPIX is not substituted with an ETF. Official daily closes are parsed from [JPX monthly statistics](https://www.jpx.co.jp/english/markets/statistics-equities/monthly/) PDFs from 2016 onward; Yahoo Japan `998405.T` only fills dates newer than the latest JPX monthly file when available.
- Japan 10-Year JGB Yield and USD/JPY reuse canonical data files.
- Foreign Investors Net Buying of Japanese Equities uses the weekly [JPX Trading by Type of Investors](https://www.jpx.co.jp/english/markets/statistics-equities/investor-type/) `Tokyo & Nagoya` value workbook. The series is `Foreigners` purchases minus sales, converted from thousand yen to JPY billions, with history from 2016.

### Taiwan

- TAIEX uses Yahoo Finance `^TWII` and is clearly labelled as a market-data source, not TWSE official historical archive.
- TSMC Revenue YoY reuses the Chips & AI canonical MOPSOV dataset.
- USD/TWD uses FRED `DEXTAUS` as the canonical history and Yahoo Finance `TWD=X` only for dates newer than FRED's latest observation; definition is `1 USD = X TWD`. Values outside 10–100 are rejected.
- Foreign Investors Net Buying of Taiwan Equities uses FinMind's TWSE-derived `TaiwanStockTotalInstitutionalInvestors` bulk history from 2004 and filters `Foreign_Investor`. Recent dates are checked against the official [TWSE BFI82U report](https://www.twse.com.tw/en/trading/foreign/bfi82u.html), whose values take priority when available. The historical request uses TWSE's `dayDate` parameter and rejects a response whose reported date does not match the requested date.
- Taiwan Electronics Exports YoY is calculated from the Taiwan Ministry of Finance [Exports by main commodity](https://data.gov.tw/en/datasets/8380) monthly CSV, using the USD electronic-components column. The resulting history begins in 2002.
- Taiwan Margin Financing Balance uses FinMind's TWSE-derived `TaiwanStockTotalMarginPurchaseShortSale` bulk history from 2001 and filters `MarginPurchaseMoney`. Recent official [TWSE MI_MARGN](https://www.twse.com.tw/en/trading/margin/mi-margn.html) balances take priority when available. Two isolated bulk-history errors (`2008-09-01` and `2020-03-24`) are replaced with values verified in the corresponding official TWSE daily reports before YoY is calculated.
- Taiwan Margin Financing Balance YoY formula:

```text
(Current margin financing balance / comparable prior-year balance - 1) * 100
```

- The prior-year comparison uses the nearest earlier trading observation within seven days; it never compares against a future observation.
- TWSE may rate-limit repeated historical requests. Each source is isolated, existing complete CSV history is preserved on failure, and the bulk source prevents one official endpoint failure from blanking the dashboard.

### Breadth

- Breadth indicators are calculated from the current S&P 500 constituent list published by the `datasets/s-and-p-500-companies` GitHub dataset and Yahoo Finance daily close data.
- Breadth is isolated from the normal U.S. market updater and runs once per week at 12:45 JST on Saturday.
- Per-constituent close history is retained under `data/internal/breadth-prices/`. A valid cache keeps 260 trading days and needs only a five-day overlap download on later weekly runs. New or newly added constituents receive a one-time 420-calendar-day bootstrap.
- The internal constituent cache is committed so future Actions runs can update incrementally, but it is excluded from the GitHub Pages artifact because the browser never reads it.
- At least 95% of the current constituent list must have valid 200-day history before a new aggregate observation is accepted. Partial cache downloads are preserved, while the existing published Breadth series remains intact when coverage is insufficient.
- The Advance / Decline Line uses daily net advances minus declines. Updates preserve its existing cumulative baseline and append only newly available dates, avoiding baseline shifts when the source window or current membership changes.
- `% Above 200DMA` calculates the percentage of downloaded constituents whose close is above their own 200-day moving average.
- This is a practical free-data approximation based on current constituents. It does not reconstruct historical S&P 500 membership changes.

### Chips & AI

- SOX uses Yahoo Finance `^SOX` daily index data.
- TSMC Revenue YoY is parsed from MOPSOV single-company monthly operating revenue for TSMC `2330`.
- The current historical archive starts in 2013 because the MOPS IFRS monthly revenue endpoint is available from ROC year 102. The updater merges newly available months and keeps existing history if a MOPSOV request fails.
- MOPSOV occasionally returns temporary 307 responses while bootstrapping many months. The bootstrap skips failed months instead of shortening the CSV; missing archive months can be filled later by rerunning or by importing a manually downloaded MOPS archive.
- AI CapEx Proxy YoY is calculated from combined total quarterly CapEx reported by Microsoft, Amazon, Alphabet, and Meta through SEC companyfacts. It is a proxy for AI infrastructure investment because company filings do not isolate all AI-only spending. The updater prefers reported single-quarter facts and, where only fiscal YTD facts exist, subtracts consecutive reported cumulative values to recover the quarter. It uses no estimates and writes only dates aligned across all four companies.

## Validation

There is no package manager or formal build step. Basic validation for this static project is:

```bash
node --check app.js
node --check sw.js
node --check scripts/generate-consolidated.mjs
node --check scripts/generate-status.mjs
node --check scripts/update-sp500.mjs
node --check scripts/update-hy-oas.mjs
node --check scripts/update-fred-series.mjs
node --check scripts/update-extra-indicators.mjs
node --check scripts/update-fx.mjs
node --check scripts/update-us-rates.mjs
node --check scripts/update-japan-rates.mjs
node --check scripts/update-regional-markets.mjs
node --check scripts/should-update.mjs
python3 -m py_compile scripts/update-finra-margin-debt-yoy.py
```

Also verify that all CSV files are sorted, have valid dates, have numeric values, and contain no duplicate dates.
