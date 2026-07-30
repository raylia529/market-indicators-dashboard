import fs from "node:fs";
import path from "node:path";

const sourceUrl =
  "https://cmegroup-tools.quikstrike.net/User/QuikStrikeTools.aspx?viewitemid=IntegratedFedWatchTool&userId=lwolf";
const publicSourceUrl = "https://www.cmegroup.com/fedwatch";
const outputFile = path.join("data", "fedwatch-expected-rate.json");
const force = process.argv.includes("--force");
const timeoutMs = 60_000;
const fomcDecisionMinuteChicago = 13 * 60;
const monthNumbers = new Map(
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
    (month, index) => [month, index + 1],
  ),
);
const cookies = new Map();

function jstDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function chicagoDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function chicagoMinuteOfDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function meetingIsUpcoming(meetingDate, date = new Date()) {
  const today = chicagoDate(date);
  return (
    meetingDate > today ||
    (meetingDate === today && chicagoMinuteOfDay(date) < fomcDecisionMinuteChicago)
  );
}

function loadPrevious() {
  try {
    return JSON.parse(fs.readFileSync(outputFile, "utf8"));
  } catch {
    return null;
  }
}

function rememberCookies(response) {
  const values =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : (response.headers.get("set-cookie") || "").split(/,(?=[^;,]+=)/);

  for (const value of values) {
    const pair = value.split(";", 1)[0];
    const separator = pair.indexOf("=");
    if (separator > 0) {
      cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
    }
  }
}

async function request(url, options = {}, redirectCount = 0) {
  if (redirectCount > 5) {
    throw new Error("CME redirected too many times");
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has("Referer")) {
    headers.set("Referer", publicSourceUrl);
  }
  if (cookies.size > 0) {
    headers.set(
      "Cookie",
      [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "),
    );
  }
  headers.set("User-Agent", "Market Indicators Dashboard/1.0");

  const response = await fetch(url, {
    ...options,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });
  rememberCookies(response);

  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`CME returned redirect ${response.status} without a location`);
    }
    return request(new URL(location, url).href, { method: "GET" }, redirectCount + 1);
  }

  if (!response.ok) {
    throw new Error(`CME request failed with HTTP ${response.status}`);
  }

  return response;
}

function decodeHtml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("&quot;", '"');
}

function parseSessionUrl(html) {
  const formAction = html.match(
    /action=["']([^"']*QuikStrikeTools\.aspx\?[^"']*viewitemid=IntegratedFedWatchTool[^"']*)["']/i,
  )?.[1];

  if (!formAction) {
    throw new Error("CME FedWatch session parameters were not found");
  }

  return new URL(decodeHtml(formAction), sourceUrl);
}

function parseMeetingDates(html) {
  const dates = new Set();
  const datePattern = /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\d{2})\b/g;

  for (const match of html.matchAll(datePattern)) {
    const [, day, month, year] = match;
    dates.add(`20${year}-${String(monthNumbers.get(month)).padStart(2, "0")}-${day.padStart(2, "0")}`);
  }

  return [...dates].sort();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("CME FedWatch download did not contain observations");
  }

  const headers = lines[0].split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
  const dateIndex = headers.findIndex((header) => header.toLowerCase() === "date");
  const ranges = headers
    .map((header, index) => {
      const match = header.match(/^\((\d+)-(\d+)\)$/);
      return match
        ? { index, lowerBps: Number(match[1]), upperBps: Number(match[2]) }
        : null;
    })
    .filter(Boolean);

  if (dateIndex < 0 || ranges.length === 0) {
    throw new Error("CME FedWatch download used an unexpected CSV format");
  }

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    const dateMatch = values[dateIndex]?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const observationDate = dateMatch
      ? `${dateMatch[3]}-${dateMatch[1].padStart(2, "0")}-${dateMatch[2].padStart(2, "0")}`
      : null;
    const probabilities = ranges.map((range) => ({
      ...range,
      probability: Number(values[range.index]),
    }));
    return { observationDate, probabilities };
  });

  return rows
    .filter(
      (row) =>
        row.observationDate &&
        row.probabilities.every((item) => Number.isFinite(item.probability)),
    )
    .sort((a, b) => a.observationDate.localeCompare(b.observationDate));
}

function atomicWriteJson(file, data) {
  const temporaryFile = `${file}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(data, null, 2)}\n`);
  JSON.parse(fs.readFileSync(temporaryFile, "utf8"));
  fs.renameSync(temporaryFile, file);
}

const previous = loadPrevious();
if (
  !force &&
  previous?.source_checked_at &&
  jstDate(new Date(previous.source_checked_at)) === jstDate() &&
  meetingIsUpcoming(previous.meeting_date)
) {
  console.log(`CME FedWatch already checked today (${jstDate()}); keeping ${previous.observation_date}.`);
  process.exit(0);
}

const shellResponse = await request(sourceUrl);
const shellHtml = await shellResponse.text();
const sessionUrl = parseSessionUrl(shellHtml);
sessionUrl.pathname = sessionUrl.pathname.replace("QuikStrikeTools.aspx", "QuikStrikeView.aspx");

const viewResponse = await request(sessionUrl.href);
const viewHtml = await viewResponse.text();
const meetingDate = parseMeetingDates(viewHtml).find((date) => meetingIsUpcoming(date));

if (!meetingDate) {
  throw new Error("No upcoming FOMC meeting was found in CME FedWatch");
}

const meetingDateCompact = meetingDate.replaceAll("-", "");
const exportUrl = new URL("/User/Export/FedWatch/MeetingExport.aspx", sessionUrl.origin);
exportUrl.searchParams.set("MeetingDate", meetingDateCompact);
exportUrl.searchParams.set("insid", sessionUrl.searchParams.get("insid"));
exportUrl.searchParams.set("qsid", sessionUrl.searchParams.get("qsid"));

const csvResponse = await request(exportUrl.href);
const rows = parseCsv(await csvResponse.text());
const latest = rows.filter((row) => row.observationDate <= chicagoDate()).at(-1);

if (!latest) {
  throw new Error("CME FedWatch did not provide a current probability observation");
}

const probabilitySum = latest.probabilities.reduce((sum, item) => sum + item.probability, 0);
if (probabilitySum < 0.99 || probabilitySum > 1.01) {
  throw new Error(`CME FedWatch probabilities summed to ${probabilitySum.toFixed(4)}, not 1`);
}

const expectedTargetUpperRate =
  latest.probabilities.reduce(
    (sum, item) => sum + (item.upperBps / 100) * item.probability,
    0,
  ) / probabilitySum;
const expectedTargetMidpointRate =
  latest.probabilities.reduce(
    (sum, item) => sum + ((item.lowerBps + item.upperBps) / 200) * item.probability,
    0,
  ) / probabilitySum;
const sourceCheckedAt = new Date().toISOString();

atomicWriteJson(outputFile, {
  meeting_date: meetingDate,
  observation_date: latest.observationDate,
  expected_target_upper_rate: Number(expectedTargetUpperRate.toFixed(4)),
  expected_target_midpoint_rate: Number(expectedTargetMidpointRate.toFixed(4)),
  probability_sum: Number(probabilitySum.toFixed(6)),
  probabilities: latest.probabilities
    .filter((item) => item.probability > 0)
    .map((item) => ({
      target_range: `${(item.lowerBps / 100).toFixed(2)}-${(item.upperBps / 100).toFixed(2)}`,
      probability: Number((item.probability / probabilitySum).toFixed(6)),
    })),
  source_name: "CME FedWatch",
  source_url: publicSourceUrl,
  method: "Probability-weighted target-range upper limit",
  source_checked_at: sourceCheckedAt,
});

console.log(
  `CME FedWatch ${latest.observationDate}: next FOMC ${meetingDate}, expected upper target ${expectedTargetUpperRate.toFixed(2)}%`,
);
