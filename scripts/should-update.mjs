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

function latestCompletedUsMarketDate(date = currentTime) {
  const parts = datePartsInTimeZone("America/New_York", date);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  return Number(parts.hour) >= 16 ? localDate : previousIsoDate(localDate);
}

function latestCompletedAsiaMarketDate(date = currentTime) {
  const parts = datePartsInTimeZone("Asia/Tokyo", date);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  return Number(parts.hour) >= 18 ? localDate : previousIsoDate(localDate);
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
const targetDate =
  profile === "us"
    ? latestCompletedUsMarketDate()
    : profile === "asia"
      ? latestCompletedAsiaMarketDate()
      : todayJst;
const pending = [];

for (const key of keys) {
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
    ? profile === "us"
      ? latestCompletedUsMarketDate(lastRefreshTime)
      : profile === "asia"
        ? latestCompletedAsiaMarketDate(lastRefreshTime)
        : lastRefreshDate
    : null;

  if (indicator.status === "Up to date" && lastRefreshTargetDate === targetDate) {
    continue;
  }

  if (mode === "slow-overdue" || mode === "slow-baseline") {
    const overdue =
      indicator.status === "Failed" ||
      !indicator.latest_available_date ||
      (indicator.next_expected_update_date && indicator.next_expected_update_date <= todayJst);

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

console.log(`Update skipped: ${keys.join(", ")} already satisfy the ${targetDate} ${profile} cycle.`);
process.exit(3);
