import fs from "node:fs";
import path from "node:path";

const sourceUrl =
  "https://cmegroup-tools.quikstrike.net/User/QuikStrikeTools.aspx?viewitemid=IntegratedFedWatchTool&userId=lwolf";
const publicSourceUrl = "https://www.cmegroup.com/fedwatch";
const outputFile = path.join("data", "fedwatch-expected-rate.json");
const historyFile = path.join("data", "cme-expected-policy-rate.csv");
const force = process.argv.includes("--force");
const backfill = process.argv.includes("--backfill");
const timeoutMs = 60_000;
const fomcDecisionMinuteChicago = 13 * 60;
const backfillStartDate = "2026-01-28";
const knownHistoricalMeetings = [
  "2026-03-18",
  "2026-04-29",
  "2026-06-17",
  "2026-07-29",
];
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

function parseMeetingTargets(html) {
  const targets = new Map();
  const decoded = decodeHtml(html);
  const pattern =
    /<a\b[^>]*href="javascript:__doPostBack\('([^']+)','[^']*'\)"[^>]*>\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\d{2})\s*<\/a>/gi;

  for (const match of decoded.matchAll(pattern)) {
    const [, target, day, month, year] = match;
    const date = `20${year}-${String(monthNumbers.get(month)).padStart(2, "0")}-${day.padStart(2, "0")}`;
    targets.set(date, target);
  }

  return targets;
}

function parseHiddenFields(html) {
  const fields = new URLSearchParams();

  for (const match of html.matchAll(/<input\b[^>]*type=["']hidden["'][^>]*>/gi)) {
    const tag = match[0];
    const name = tag.match(/\bname=["']([^"']+)["']/i)?.[1];
    const value = tag.match(/\bvalue=["']([^"']*)["']/i)?.[1] || "";

    if (name) {
      fields.set(decodeHtml(name), decodeHtml(value));
    }
  }

  return fields;
}

function parseCurrentProbabilityRow(html, observationDate) {
  const table = html.match(
    /<table class="grid-thm grid-thm-v2 w-lg">([\s\S]*?)<\/table>/i,
  )?.[1];

  if (!table) {
    throw new Error("CME current probability table was not found");
  }

  const probabilities = [];
  for (const rowMatch of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (cell) => decodeHtml(cell[1].replace(/<[^>]+>/g, "").trim()),
    );
    const range = cells[0]?.match(/^(\d+)-(\d+)/);

    if (!range) {
      continue;
    }

    const now = Number((cells[1] || "0").replace("%", "").trim() || 0) / 100;
    probabilities.push({
      lowerBps: Number(range[1]),
      upperBps: Number(range[2]),
      probability: now,
    });
  }

  if (probabilities.length === 0) {
    throw new Error("CME current probability table contained no target ranges");
  }

  return { observationDate, probabilities };
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

function loadHistory() {
  try {
    return fs
      .readFileSync(historyFile, "utf8")
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((line) => {
        const [date, value, meetingDate] = line.split(",");
        return { date, value: Number(value), meetingDate };
      })
      .filter((row) => row.date && Number.isFinite(row.value) && row.meetingDate);
  } catch {
    return [];
  }
}

function atomicWriteHistory(rows) {
  const temporaryFile = `${historyFile}.tmp`;
  const body = rows
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((row) => `${row.date},${row.value.toFixed(4)},${row.meetingDate}`)
    .join("\n");
  fs.writeFileSync(temporaryFile, `date,value,meeting_date\n${body}\n`);
  fs.renameSync(temporaryFile, historyFile);
}

function calculateExpectation(row) {
  const probabilitySum = row.probabilities.reduce(
    (sum, item) => sum + item.probability,
    0,
  );
  if (probabilitySum < 0.99 || probabilitySum > 1.01) {
    throw new Error(
      `CME FedWatch probabilities for ${row.observationDate} summed to ${probabilitySum.toFixed(4)}, not 1`,
    );
  }

  return {
    probabilitySum,
    upperRate:
      row.probabilities.reduce(
        (sum, item) => sum + (item.upperBps / 100) * item.probability,
        0,
      ) / probabilitySum,
    midpointRate:
      row.probabilities.reduce(
        (sum, item) =>
          sum + ((item.lowerBps + item.upperBps) / 200) * item.probability,
        0,
      ) / probabilitySum,
  };
}

function updateHistory(previous, current) {
  const history = loadHistory();
  const upsert = (row) => {
    const existingIndex = history.findIndex((item) => item.date === row.date);
    if (existingIndex >= 0) {
      history[existingIndex] = row;
    } else {
      history.push(row);
    }
  };

  if (
    history.length === 0 &&
    previous?.observation_date &&
    Number.isFinite(previous.expected_target_upper_rate)
  ) {
    upsert({
      date: previous.observation_date,
      value: previous.expected_target_upper_rate,
      meetingDate: previous.meeting_date,
    });
  }

  const currentMeetingRows = history.filter(
    (row) => row.meetingDate === current.meeting_date,
  );
  const latestCurrentMeetingDate = currentMeetingRows
    .map((row) => row.date)
    .sort()
    .at(-1);
  if (
    latestCurrentMeetingDate &&
    current.observation_date < latestCurrentMeetingDate
  ) {
    atomicWriteHistory(history);
    return;
  }

  let historyDate = current.observation_date;
  const latestHistoryDate = history.map((row) => row.date).sort().at(-1);
  const occupiedByAnotherMeeting = history.some(
    (row) => row.date === historyDate && row.meetingDate !== current.meeting_date,
  );
  if (
    occupiedByAnotherMeeting ||
    (previous?.meeting_date &&
      current.meeting_date !== previous.meeting_date &&
      latestHistoryDate &&
      historyDate <= latestHistoryDate)
  ) {
    historyDate =
      previous?.meeting_date && previous.meeting_date > historyDate
        ? previous.meeting_date
        : chicagoDate();
  }

  upsert({
    date: historyDate,
    value: current.expected_target_upper_rate,
    meetingDate: current.meeting_date,
  });
  atomicWriteHistory(history);
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
const meetingDates = parseMeetingDates(viewHtml);
const meetingTargets = parseMeetingTargets(viewHtml);
const meetingDate = meetingDates.find((date) => meetingIsUpcoming(date));

if (!meetingDate) {
  throw new Error("No upcoming FOMC meeting was found in CME FedWatch");
}

async function downloadMeetingRows(targetMeetingDate) {
  const exportUrl = new URL(
    "/User/Export/FedWatch/MeetingExport.aspx",
    sessionUrl.origin,
  );
  exportUrl.searchParams.set(
    "MeetingDate",
    targetMeetingDate.replaceAll("-", ""),
  );
  exportUrl.searchParams.set("insid", sessionUrl.searchParams.get("insid"));
  exportUrl.searchParams.set("qsid", sessionUrl.searchParams.get("qsid"));
  const csvResponse = await request(exportUrl.href);
  const csvText = await csvResponse.text();

  try {
    return parseCsv(csvText);
  } catch (error) {
    const preview = csvText.trim().replace(/\s+/g, " ").slice(0, 160);
    throw new Error(`${error.message}; response: ${preview || "(empty)"}`);
  }
}

async function downloadCurrentMeetingRow(targetMeetingDate) {
  const target = meetingTargets.get(targetMeetingDate);
  if (!target) {
    throw new Error("CME meeting selector was not found");
  }

  const fields = parseHiddenFields(viewHtml);
  fields.set("__EVENTTARGET", target);
  fields.set("__EVENTARGUMENT", "");
  const response = await request(sessionUrl.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: fields.toString(),
  });
  return parseCurrentProbabilityRow(await response.text(), chicagoDate());
}

const rows = await downloadMeetingRows(meetingDate);
const latest = rows.filter((row) => row.observationDate <= chicagoDate()).at(-1);

if (!latest) {
  throw new Error("CME FedWatch did not provide a current probability observation");
}

const sourceCheckedAt = new Date().toISOString();
const futureCurve = [];
let currentNowRow = null;

for (const futureMeetingDate of meetingDates.filter((date) => meetingIsUpcoming(date))) {
  try {
    const currentRow =
      futureMeetingDate === meetingDate
        ? parseCurrentProbabilityRow(viewHtml, chicagoDate())
        : await downloadCurrentMeetingRow(futureMeetingDate);
    if (futureMeetingDate === meetingDate) {
      currentNowRow = currentRow;
    }
    const futureExpectation = calculateExpectation(currentRow);
    futureCurve.push({
      meeting_date: futureMeetingDate,
      observation_date: currentRow.observationDate,
      expected_target_upper_rate: Number(futureExpectation.upperRate.toFixed(4)),
      expected_target_midpoint_rate: Number(futureExpectation.midpointRate.toFixed(4)),
    });
  } catch (error) {
    console.warn(
      `CME FedWatch ${futureMeetingDate}: current probability unavailable (${error.message})`,
    );
  }
}

const currentSourceRow = currentNowRow || latest;
const currentSourceExpectation = calculateExpectation(currentSourceRow);
const probabilitySum = currentSourceExpectation.probabilitySum;
const expectedTargetUpperRate = currentSourceExpectation.upperRate;
const expectedTargetMidpointRate = currentSourceExpectation.midpointRate;

const currentExpectation = {
  meeting_date: meetingDate,
  meeting_dates: meetingDates,
  previous_meeting_date:
    meetingDate !== previous?.meeting_date
      ? previous?.meeting_date || previous?.previous_meeting_date || null
      : previous?.previous_meeting_date || null,
  observation_date: currentSourceRow.observationDate,
  expected_target_upper_rate: Number(expectedTargetUpperRate.toFixed(4)),
  expected_target_midpoint_rate: Number(expectedTargetMidpointRate.toFixed(4)),
  probability_sum: Number(probabilitySum.toFixed(6)),
  probabilities: currentSourceRow.probabilities
    .filter((item) => item.probability > 0)
    .map((item) => ({
      target_range: `${(item.lowerBps / 100).toFixed(2)}-${(item.upperBps / 100).toFixed(2)}`,
      probability: Number((item.probability / probabilitySum).toFixed(6)),
    })),
  future_curve: futureCurve,
  source_name: "CME FedWatch",
  source_url: publicSourceUrl,
  method: "Probability-weighted target-range upper limit",
  source_checked_at: sourceCheckedAt,
};

atomicWriteJson(outputFile, currentExpectation);
if (backfill) {
  const rollingMeetings = [
    ...new Set([...knownHistoricalMeetings, ...meetingDates]),
  ]
    .filter((date) => date > backfillStartDate && date <= meetingDate)
    .sort();
  const rollingHistory = [];
  let windowStart = backfillStartDate;

  for (const rollingMeetingDate of rollingMeetings) {
    const meetingRows =
      rollingMeetingDate === meetingDate
        ? rows
        : await downloadMeetingRows(rollingMeetingDate);
    const windowRows = meetingRows.filter(
      (row) =>
        row.observationDate >= windowStart &&
        row.observationDate < rollingMeetingDate,
    );

    for (const row of windowRows) {
      rollingHistory.push({
        date: row.observationDate,
        value: calculateExpectation(row).upperRate,
        meetingDate: rollingMeetingDate,
      });
    }
    windowStart = rollingMeetingDate;
  }

  const currentMeetingHasDecisionDate = rollingHistory.some(
    (row) => row.meetingDate === meetingDate && row.date >= windowStart,
  );
  if (!currentMeetingHasDecisionDate) {
    rollingHistory.push({
      date: currentExpectation.previous_meeting_date || windowStart,
      value: currentExpectation.expected_target_upper_rate,
      meetingDate,
    });
  }
  atomicWriteHistory(rollingHistory);
} else {
  updateHistory(previous, currentExpectation);
}

console.log(
  `CME FedWatch ${currentSourceRow.observationDate}: ${futureCurve.length} future meetings, next implied upper target ${expectedTargetUpperRate.toFixed(2)}%`,
);
