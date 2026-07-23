import fs from "node:fs";

const statusFile = "data/status.json";
const [profile = "full", mode = "force", keyText = ""] = process.argv.slice(2);
const keys = keyText
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);
const currentTime = process.env.UPDATE_NOW ? new Date(process.env.UPDATE_NOW) : new Date();

if (Number.isNaN(currentTime.getTime())) {
  throw new Error(`Invalid UPDATE_NOW value: ${process.env.UPDATE_NOW}`);
}

function datePartsInTimeZone(timeZone, date = currentTime) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return parts;
}

function dateInTimeZone(timeZone, date = currentTime) {
  const parts = datePartsInTimeZone(timeZone, date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function previousIsoDate(dateText) {
  const date = new Date(`${dateText}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function previousWeekday(dateText) {
  let candidate = previousIsoDate(dateText);
  while ([0, 6].includes(new Date(`${candidate}T12:00:00Z`).getUTCDay())) {
    candidate = previousIsoDate(candidate);
  }
  return candidate;
}

function latestCompletedUsMarketDate(date = currentTime) {
  const parts = datePartsInTimeZone("America/New_York", date);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  const day = new Date(`${localDate}T12:00:00Z`).getUTCDay();
  return Number(parts.hour) >= 16 && ![0, 6].includes(day)
    ? localDate
    : previousWeekday(localDate);
}

function latestCompletedAsiaMarketDate(date = currentTime) {
  const parts = datePartsInTimeZone("Asia/Tokyo", date);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  const day = new Date(`${localDate}T12:00:00Z`).getUTCDay();
  return Number(parts.hour) >= 18 && ![0, 6].includes(day)
    ? localDate
    : previousWeekday(localDate);
}

function latestPublishedJapanJgbDate(date = currentTime) {
  const parts = datePartsInTimeZone("Asia/Tokyo", date);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  const priorBusinessDay = previousWeekday(localDate);
  return Number(parts.hour) >= 10
    ? priorBusinessDay
    : previousWeekday(priorBusinessDay);
}

const japanJgbKeys = new Set([
  "JAPAN_2Y_JGB",
  "US_JAPAN_2Y_SPREAD",
  "JAPAN_10Y_JGB",
  "JAPAN_10Y_2Y_SPREAD",
]);

function targetDateFor(profileName, key, date = currentTime) {
  if (profileName === "us") {
    return latestCompletedUsMarketDate(date);
  }
  if (profileName === "asia") {
    return japanJgbKeys.has(key)
      ? latestPublishedJapanJgbDate(date)
      : latestCompletedAsiaMarketDate(date);
  }
  return dateInTimeZone("Asia/Tokyo", date);
}

if (mode === "force" || profile === "full") {
  console.log(`Update required: forced ${profile} refresh for ${keys.join(", ")}.`);
  process.exit(0);
}

if (!fs.existsSync(statusFile)) {
  console.log("Update required: data/status.json is missing.");
  process.exit(0);
}

const metadata = JSON.parse(fs.readFileSync(statusFile, "utf8"));
const todayJst = dateInTimeZone("Asia/Tokyo");
const pending = [];

for (const key of keys) {
  const targetDate = targetDateFor(profile, key);
  const indicator = metadata.indicators?.[key];
  if (!indicator) {
    pending.push(`${key} (missing metadata)`);
    continue;
  }

  if (indicator.status === "Unavailable") {
    continue;
  }

  const lastRefreshTime = indicator.last_successful_refresh
    ? new Date(indicator.last_successful_refresh)
    : null;
  const lastRefreshDate = lastRefreshTime
    ? dateInTimeZone("Asia/Tokyo", lastRefreshTime)
    : null;
  const lastRefreshTargetDate = lastRefreshTime
    ? targetDateFor(profile, key, lastRefreshTime)
    : null;

  if (indicator.status === "Up to date" && lastRefreshTargetDate === targetDate) {
    continue;
  }

  if (mode === "slow-overdue" || mode === "slow-baseline") {
    const expectedDate = indicator.next_expected_update_date;
    const overdue =
      !indicator.latest_available_date ||
      (expectedDate && expectedDate <= todayJst);

    if (overdue) {
      pending.push(
        `${key} (${indicator.next_expected_update_date || "no expected release date"} due)`,
      );
    } else if (mode === "slow-baseline") {
      if (lastRefreshDate !== todayJst) {
        pending.push(`${key} (not checked today)`);
      }
    }
    continue;
  }

  if (mode === "once") {
    if (lastRefreshDate !== todayJst) {
      pending.push(`${key} (not checked today)`);
    }
    continue;
  }

  if (!indicator.latest_available_date || indicator.latest_available_date < targetDate) {
    pending.push(`${key} (${indicator.latest_available_date || "no data"} < ${targetDate})`);
  }
}

if (pending.length > 0) {
  console.log(`Update required for ${profile}: ${pending.join("; ")}.`);
  process.exit(0);
}

console.log(`Update skipped: ${keys.join(", ")} already satisfy the current ${profile} cycle.`);
process.exit(3);
