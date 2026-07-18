#!/usr/bin/env python3
"""Update regional indicators from public Japan and Taiwan data sources."""

from __future__ import annotations

import argparse
import calendar
import csv
import io
import json
import os
import re
import tempfile
import time
from bisect import bisect_right
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Callable, Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import xlrd
from pypdf import PdfReader


DATA_DIR = Path("data")
USER_AGENT = "market-indicators-dashboard/1.0 (+https://github.com/raylia529/market-indicators-dashboard)"
TOPIX_FILE = DATA_DIR / "topix.csv"
JAPAN_FOREIGN_FILE = DATA_DIR / "japan-foreign-investor-net-buying.csv"
TAIWAN_FOREIGN_FILE = DATA_DIR / "taiwan-foreign-investor-net-buying.csv"
TAIWAN_EXPORTS_FILE = DATA_DIR / "taiwan-electronics-exports-yoy.csv"
TAIWAN_MARGIN_FILE = DATA_DIR / "taiwan-margin-financing-balance.csv"
TAIWAN_MARGIN_YOY_FILE = DATA_DIR / "taiwan-margin-financing-balance-yoy.csv"
TAIEX_FILE = DATA_DIR / "taiex.csv"

JPX_ARCHIVE = "https://www.jpx.co.jp/english/markets/statistics-equities/investor-type/"
JPX_MONTHLY = "https://www.jpx.co.jp/english/markets/statistics-equities/monthly/"
TWSE_FOREIGN = "https://www.twse.com.tw/rwd/en/fund/BFI82U"
TWSE_MARGIN = "https://www.twse.com.tw/exchangeReport/MI_MARGN"
TAIWAN_EXPORTS = (
    "https://web02.mof.gov.tw/njswww/webMain.aspx?"
    "codlst0=1101111010100011110111100111110110100&compmode=00&cycle=41&fld0=1&"
    "funid=i8121&kind=21&outkind=1&outmode=12&sys=220&type=4&utf=1&ym=9000"
)
FINMIND_API = "https://api.finmindtrade.com/api/v4/data"

# FinMind's bulk history contains two isolated TWSE balance errors. These values
# are verified against the official MI_MARGN daily reports.
TAIWAN_MARGIN_OFFICIAL_CORRECTIONS = {
    "2008-09-01": 258.059480,
    "2020-03-24": 91.572304,
}


def fetch(url: str, *, binary: bool = False, retries: int = 3) -> bytes | str:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            with urlopen(request, timeout=30) as response:
                body = response.read()
            return body if binary else body.decode("utf-8-sig", errors="replace")
        except (HTTPError, URLError, TimeoutError) as error:
            last_error = error
            if attempt + 1 < retries:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Download failed after {retries} attempts: {url}: {last_error}")


def load_rows(path: Path) -> list[dict[str, float | str]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = []
        for row in csv.DictReader(handle):
            try:
                rows.append({"date": row["date"], "value": float(row["value"])})
            except (KeyError, TypeError, ValueError):
                continue
    return sorted(rows, key=lambda row: str(row["date"]))


def validate_rows(
    rows: list[dict[str, float | str]], label: str, existing: list[dict[str, float | str]] | None = None
) -> None:
    if not rows:
        raise ValueError(f"{label} has no valid observations")
    dates = [str(row["date"]) for row in rows]
    if any(not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value) for value in dates):
        raise ValueError(f"{label} contains an invalid date")
    if dates != sorted(dates) or len(dates) != len(set(dates)):
        raise ValueError(f"{label} dates are unsorted or duplicated")
    if any(not isinstance(row["value"], (int, float)) for row in rows):
        raise ValueError(f"{label} contains a non-numeric value")
    if existing and len(rows) < len(existing):
        raise ValueError(f"{label} update would shorten existing history")


def merge_rows(*groups: Iterable[dict[str, float | str]]) -> list[dict[str, float | str]]:
    merged: dict[str, float] = {}
    for rows in groups:
        for row in rows:
            merged[str(row["date"])] = float(row["value"])
    return [{"date": key, "value": merged[key]} for key in sorted(merged)]


def atomic_write(path: Path, rows: list[dict[str, float | str]], label: str, decimals: int) -> None:
    existing = load_rows(path)
    validate_rows(rows, label, existing)
    path.parent.mkdir(parents=True, exist_ok=True)
    file_descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent, text=True)
    try:
        with os.fdopen(file_descriptor, "w", encoding="utf-8", newline="") as handle:
            writer = csv.writer(handle, lineterminator="\n")
            writer.writerow(["date", "value"])
            for row in rows:
                writer.writerow([row["date"], f"{float(row['value']):.{decimals}f}"])
        validate_rows(load_rows(Path(temp_name)), label)
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)


def print_validation(label: str, rows: list[dict[str, float | str]], source: str) -> None:
    print(f"{label} validation")
    print(f"Source: {source}")
    print(f"Earliest date: {rows[0]['date']}")
    print(f"Latest date: {rows[-1]['date']}")
    print(f"Valid observations: {len(rows)}")
    print("Duplicate dates: 0")


def parse_topix_page(html: str) -> tuple[list[dict[str, float | str]], int]:
    item_pattern = re.compile(
        r'\\"date\\":\\"(\d{4}/\d{1,2}/\d{1,2})\\".*?'
        r'\\"closePrice\\":\\"([\d,.]+)\\"'
    )
    rows = []
    for raw_date, raw_close in item_pattern.findall(html):
        parsed_date = datetime.strptime(raw_date, "%Y/%m/%d").date().isoformat()
        rows.append({"date": parsed_date, "value": float(raw_close.replace(",", ""))})
    page_counts = [int(value) for value in re.findall(r'\\"totalPage\\":(\d+)', html)]
    return rows, max(page_counts, default=1)


def topix_url(year: int, page: int) -> str:
    query = urlencode(
        {
            "from": f"{year}0101",
            "to": f"{year}1231",
            "timeFrame": "d",
            "page": page,
        }
    )
    return f"https://finance.yahoo.co.jp/quote/998405.T/history?{query}"


def parse_jpx_topix_pdf(body: bytes, year: int, month: int) -> list[dict[str, float | str]]:
    reader = PdfReader(io.BytesIO(body))
    if not reader.pages:
        raise ValueError("JPX TOPIX PDF has no pages")
    text = reader.pages[0].extract_text() or ""
    daily_marker = re.compile(rf"(?m)^(?:{year}[ \t]+)?{month}\.1(?:[ \t]|$)").search(text)
    if not daily_marker:
        raise ValueError(f"JPX TOPIX PDF daily section not found for {year}-{month:02d}")
    daily_text = text[daily_marker.start() :]
    daily_text = re.split(r"(?m)^平均(?:\s|$)", daily_text, maxsplit=1)[0]

    rows = []
    daily_pattern = re.compile(
        rf"(?m)^(?:{year}[ \t]+)?(?:{month}\.)?(\d{{1,2}})[ \t]+([\d,]+\.\d{{2}})(?:[ \t]|$)"
    )
    for raw_day, raw_value in daily_pattern.findall(daily_text):
        try:
            value_date = date(year, month, int(raw_day))
        except ValueError:
            continue
        rows.append({"date": value_date.isoformat(), "value": float(raw_value.replace(",", ""))})
    if not rows:
        raise ValueError(f"JPX TOPIX PDF parser found no daily rows for {year}-{month:02d}")
    return rows


def extract_jpx_topix_pdf_links(html: str) -> list[tuple[str, int, int]]:
    links = re.findall(r'href="([^"]+/03_sisu(\d{2})(\d{2})\.pdf)"', html)
    return [
        (link if link.startswith("http") else f"https://www.jpx.co.jp{link}", 2000 + int(year), int(month))
        for link, year, month in links
    ]


def update_topix() -> None:
    existing = load_rows(TOPIX_FILE)
    page_names = ["index.html"]
    if len(existing) < 2550:
        page_names.extend(f"00-archives-{index:02d}.html" for index in range(1, 11))
    links = []
    for page_name in page_names:
        links.extend(extract_jpx_topix_pdf_links(str(fetch(f"{JPX_MONTHLY}{page_name}"))))
    links = list(dict.fromkeys(links))
    if existing:
        overlap_start = date.fromisoformat(str(existing[-1]["date"])) - timedelta(days=45)
        links = [
            item for item in links
            if date(item[1], item[2], 1) >= overlap_start.replace(day=1)
        ]
    if not links and not existing:
        raise ValueError("JPX monthly archive contained no TOPIX index PDFs")

    official_rows: list[dict[str, float | str]] = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(fetch, link, binary=True): (link, year, month)
            for link, year, month in links
        }
        for future in as_completed(futures):
            link, year, month = futures[future]
            try:
                official_rows.extend(parse_jpx_topix_pdf(bytes(future.result()), year, month))
            except Exception as error:
                print(f"WARNING: JPX TOPIX PDF skipped: {link}: {error}")

    recent_rows: list[dict[str, float | str]] = []
    try:
        current_year = date.today().year
        recent_html = str(fetch(topix_url(current_year, 1)))
        recent_rows, _ = parse_topix_page(recent_html)
    except Exception as error:
        print(f"WARNING: Yahoo Japan recent TOPIX gap fill unavailable: {error}")

    merged = merge_rows(existing, official_rows, recent_rows)
    atomic_write(TOPIX_FILE, merged, "TOPIX", 2)
    print_validation(
        "TOPIX",
        merged,
        "JPX monthly statistics daily closes, with Yahoo Japan recent daily gap fill when available",
    )


def parse_jpx_workbook(body: bytes) -> dict[str, float | str]:
    workbook = xlrd.open_workbook(file_contents=body)
    sheet = next(
        (candidate for candidate in workbook.sheets() if "Tokyo & Nagoya" in candidate.name),
        workbook.sheets()[-1],
    )
    title = " ".join(str(sheet.cell_value(row, 0)) for row in range(min(6, sheet.nrows)))
    period_match = re.search(r"(20\d{2}).*?\(\s*\d{1,2}/\d{1,2}\s*[-~～]\s*(\d{1,2})/(\d{1,2})\s*\)", title)
    if not period_match:
        raise ValueError("Could not identify the JPX weekly period")
    year, end_month, end_day = map(int, period_match.groups())

    foreign_row = next(
        row
        for row in range(sheet.nrows)
        if any(str(sheet.cell_value(row, column)).strip() == "Foreigners" for column in range(sheet.ncols))
    )
    header_row = max(0, foreign_row - 20)
    value_columns = []
    for row in range(header_row, foreign_row):
        for column in range(sheet.ncols):
            if "Value" in str(sheet.cell_value(row, column)):
                value_columns.append(min(column + 1, sheet.ncols - 1))
    if not value_columns:
        raise ValueError("Could not identify JPX value columns")
    latest_value_column = max(value_columns)
    sales = float(str(sheet.cell_value(foreign_row - 1, latest_value_column)).replace(",", ""))
    purchases = float(str(sheet.cell_value(foreign_row, latest_value_column)).replace(",", ""))
    return {
        "date": date(year, end_month, end_day).isoformat(),
        "value": (purchases - sales) / 1_000_000,
    }


def extract_jpx_xls_links(html: str) -> list[str]:
    links = re.findall(r'href="([^"]+stock_val[^"]+\.xls)"', html)
    return [link if link.startswith("http") else f"https://www.jpx.co.jp{link}" for link in links]


def update_japan_foreign() -> None:
    existing = load_rows(JAPAN_FOREIGN_FILE)
    page_names = ["00-00-archives-00.html"]
    if not existing:
        page_names.extend(f"00-00-archives-{index:02d}.html" for index in range(1, 11))
    links: list[str] = []
    for page_name in page_names:
        links.extend(extract_jpx_xls_links(str(fetch(f"{JPX_ARCHIVE}{page_name}"))))
    links = list(dict.fromkeys(links))
    if existing:
        links = links[:2]
    if not links:
        raise ValueError("JPX archive contained no investor-value workbooks")

    parsed_rows = []
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(fetch, link, binary=True): link for link in links}
        for future in as_completed(futures):
            try:
                parsed_rows.append(parse_jpx_workbook(bytes(future.result())))
            except Exception as error:  # Keep one malformed historical workbook from losing the series.
                print(f"WARNING: JPX workbook skipped: {futures[future]}: {error}")
    merged = merge_rows(existing, parsed_rows)
    atomic_write(JAPAN_FOREIGN_FILE, merged, "Japan foreign investor net buying", 3)
    print_validation(
        "Japan foreign investor net buying",
        merged,
        "JPX Trading by Type of Investors, Tokyo & Nagoya, weekly purchases minus sales",
    )


def trading_dates(start: date, *, include_recent_weekdays: bool = True) -> list[date]:
    dates = []
    for row in load_rows(TAIEX_FILE):
        parsed = date.fromisoformat(str(row["date"]))
        if parsed >= start:
            dates.append(parsed)
    if include_recent_weekdays:
        cursor = max(start, date.today() - timedelta(days=14))
        while cursor <= date.today():
            if cursor.weekday() < 5:
                dates.append(cursor)
            cursor += timedelta(days=1)
    return sorted(set(dates))


def parallel_daily_fetch(
    dates: list[date], parser: Callable[[date], dict[str, float | str] | None], label: str, max_workers: int = 3
) -> list[dict[str, float | str]]:
    rows = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(parser, value): value for value in dates}
        for index, future in enumerate(as_completed(futures), start=1):
            try:
                row = future.result()
                if row:
                    rows.append(row)
            except Exception as error:
                print(f"WARNING: {label} {futures[future].isoformat()} skipped: {error}")
            if index % 500 == 0:
                print(f"{label}: checked {index}/{len(dates)} dates")
    return rows


def fetch_finmind(dataset: str, start: date) -> list[dict]:
    query = urlencode(
        {
            "dataset": dataset,
            "start_date": start.isoformat(),
            "end_date": date.today().isoformat(),
        }
    )
    payload = json.loads(str(fetch(f"{FINMIND_API}?{query}")))
    if payload.get("status") != 200 or not isinstance(payload.get("data"), list):
        raise ValueError(f"FinMind {dataset} response failed: {payload.get('msg', 'unknown error')}")
    return payload["data"]


def parse_twse_foreign(value_date: date) -> dict[str, float | str] | None:
    url = f"{TWSE_FOREIGN}?{urlencode({'dayDate': value_date.strftime('%Y%m%d'), 'response': 'json'})}"
    payload = json.loads(str(fetch(url)))
    if payload.get("stat") != "OK":
        return None
    response_date = str(payload.get("date", ""))
    if response_date != value_date.strftime("%Y%m%d"):
        raise ValueError(
            f"TWSE foreign response date mismatch: requested {value_date:%Y%m%d}, got {response_date or 'missing'}"
        )
    fields = payload.get("fields", [])
    difference_index = next(
        (index for index, value in enumerate(fields) if str(value).strip().lower() == "difference"), None
    )
    if difference_index is None:
        raise ValueError("TWSE foreign investor response has no Difference field")
    row = next(
        (
            item
            for item in payload.get("data", [])
            if str(item[0]).startswith("Foreign Investors include Mainland Area Investors")
        ),
        None,
    )
    if not row:
        raise ValueError("TWSE foreign investor category was not found")
    return {
        "date": value_date.isoformat(),
        "value": float(str(row[difference_index]).replace(",", "")) / 1_000_000,
    }


def update_taiwan_foreign() -> None:
    existing = load_rows(TAIWAN_FOREIGN_FILE)
    start = date(2004, 4, 1) if not existing else date.fromisoformat(str(existing[-1]["date"])) - timedelta(days=30)
    bulk_rows = []
    for row in fetch_finmind("TaiwanStockTotalInstitutionalInvestors", start):
        if row.get("name") != "Foreign_Investor":
            continue
        try:
            bulk_rows.append(
                {
                    "date": str(row["date"]),
                    "value": (float(row["buy"]) - float(row["sell"])) / 1_000_000,
                }
            )
        except (KeyError, TypeError, ValueError):
            continue
    official_start = max(start, date.today() - timedelta(days=10))
    official_rows = parallel_daily_fetch(
        trading_dates(official_start), parse_twse_foreign, "Taiwan foreign net buying", max_workers=2
    )
    merged = merge_rows(existing, bulk_rows, official_rows)
    atomic_write(TAIWAN_FOREIGN_FILE, merged, "Taiwan foreign investor net buying", 3)
    print_validation(
        "Taiwan foreign investor net buying",
        merged,
        "FinMind total-market history (TWSE-derived), overwritten by recent official TWSE BFI82U values",
    )


def month_end(year: int, month: int) -> str:
    return date(year, month, calendar.monthrange(year, month)[1]).isoformat()


def update_taiwan_exports() -> None:
    text = str(fetch(TAIWAN_EXPORTS))
    reader = csv.reader(io.StringIO(text.lstrip("\ufeff")))
    rows = list(reader)
    if not rows:
        raise ValueError("Taiwan MOF export CSV is empty")
    electronics_index = next(
        (
            index
            for index, heading in enumerate(rows[0])
            if "電子零組件" in heading and "美元" in heading
        ),
        None,
    )
    if electronics_index is None:
        raise ValueError("Taiwan MOF export CSV has no electronic-components USD column")
    monthly_values: dict[tuple[int, int], float] = {}
    for row in rows[1:]:
        if not row:
            continue
        match = re.fullmatch(r"\s*(\d+)年\s*(\d+)月\s*", row[0])
        if not match or len(row) <= electronics_index:
            continue
        try:
            year = int(match.group(1)) + 1911
            month = int(match.group(2))
            monthly_values[(year, month)] = float(row[electronics_index].replace(",", ""))
        except ValueError:
            continue
    yoy_rows = []
    for (year, month), value in sorted(monthly_values.items()):
        prior = monthly_values.get((year - 1, month))
        if prior and prior != 0:
            yoy_rows.append({"date": month_end(year, month), "value": (value / prior - 1) * 100})
    existing = load_rows(TAIWAN_EXPORTS_FILE)
    merged = merge_rows(existing, yoy_rows)
    atomic_write(TAIWAN_EXPORTS_FILE, merged, "Taiwan electronics exports YoY", 2)
    print_validation(
        "Taiwan electronics exports YoY",
        merged,
        "Taiwan Ministry of Finance exports by main commodity, electronic components in USD",
    )


def parse_twse_margin(value_date: date) -> dict[str, float | str] | None:
    url = f"{TWSE_MARGIN}?{urlencode({'date': value_date.strftime('%Y%m%d'), 'response': 'json', 'selectType': 'MS'})}"
    text = str(fetch(url))
    if text.lstrip().startswith("<"):
        return None
    payload = json.loads(text)
    if payload.get("stat") != "OK":
        return None
    for table in payload.get("tables", []):
        fields = table.get("fields", [])
        balance_index = next((index for index, field in enumerate(fields) if "今日餘額" in str(field)), None)
        if balance_index is None:
            continue
        for row in table.get("data", []):
            if row and str(row[0]).startswith("融資金額"):
                raw_value = float(str(row[balance_index]).replace(",", ""))
                return {"date": value_date.isoformat(), "value": raw_value / 1_000_000}
    raise ValueError("TWSE margin response has no margin-financing current balance")


def calculate_yoy(rows: list[dict[str, float | str]]) -> list[dict[str, float | str]]:
    values = {date.fromisoformat(str(row["date"])): float(row["value"]) for row in rows}
    sorted_dates = sorted(values)
    result = []
    for current_date in sorted_dates:
        try:
            target = current_date.replace(year=current_date.year - 1)
        except ValueError:
            target = current_date.replace(year=current_date.year - 1, day=28)
        prior_index = bisect_right(sorted_dates, target) - 1
        if prior_index < 0:
            continue
        prior_date = sorted_dates[prior_index]
        if prior_date < target - timedelta(days=7):
            continue
        prior_value = values[prior_date]
        if prior_value == 0:
            continue
        result.append({"date": current_date.isoformat(), "value": (values[current_date] / prior_value - 1) * 100})
    return result


def update_taiwan_margin() -> None:
    existing = load_rows(TAIWAN_MARGIN_FILE)
    start = date(2001, 1, 1) if not existing else date.fromisoformat(str(existing[-1]["date"])) - timedelta(days=30)
    bulk_rows = []
    for row in fetch_finmind("TaiwanStockTotalMarginPurchaseShortSale", start):
        if row.get("name") != "MarginPurchaseMoney":
            continue
        try:
            bulk_rows.append({"date": str(row["date"]), "value": float(row["TodayBalance"]) / 1_000_000_000})
        except (KeyError, TypeError, ValueError):
            continue
    official_start = max(start, date.today() - timedelta(days=10))
    official_rows = parallel_daily_fetch(
        trading_dates(official_start), parse_twse_margin, "Taiwan margin financing", max_workers=2
    )
    merged = merge_rows(existing, bulk_rows, official_rows)
    merged = merge_rows(
        merged,
        [
            {"date": value_date, "value": value}
            for value_date, value in TAIWAN_MARGIN_OFFICIAL_CORRECTIONS.items()
        ],
    )
    atomic_write(TAIWAN_MARGIN_FILE, merged, "Taiwan margin financing balance", 3)
    yoy_rows = calculate_yoy(merged)
    atomic_write(TAIWAN_MARGIN_YOY_FILE, yoy_rows, "Taiwan margin financing balance YoY", 3)
    print_validation(
        "Taiwan margin financing balance",
        merged,
        "FinMind total-market history (TWSE-derived), overwritten by recent official TWSE MI_MARGN values",
    )
    print_validation(
        "Taiwan margin financing balance YoY",
        yoy_rows,
        "Calculated from TWSE daily balance using the latest prior-year trading observation within 7 days",
    )


UPDATES: dict[str, Callable[[], None]] = {
    "topix": update_topix,
    "japan-foreign": update_japan_foreign,
    "taiwan-foreign": update_taiwan_foreign,
    "taiwan-exports": update_taiwan_exports,
    "taiwan-margin": update_taiwan_margin,
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="Comma-separated update keys")
    arguments = parser.parse_args()
    requested = [value.strip() for value in arguments.only.split(",")] if arguments.only else list(UPDATES)
    unknown = [value for value in requested if value not in UPDATES]
    if unknown:
        raise SystemExit(f"Unknown update key(s): {', '.join(unknown)}")

    failures = []
    for key in requested:
        try:
            UPDATES[key]()
        except Exception as error:
            failures.append((key, error))
            print(f"WARNING: {key} update failed; existing CSV was preserved: {error}")
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
