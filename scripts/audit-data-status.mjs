import fs from "node:fs";

const statusFile = "data/status.json";
const allowedStatuses = new Set(["Up to date", "Update not run", "Failed", "Unavailable"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function fail(message) {
  console.error(`Data Status audit failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(statusFile)) {
  throw new Error(`${statusFile} is missing.`);
}

const metadata = JSON.parse(fs.readFileSync(statusFile, "utf8"));
const indicators = metadata.indicators || {};
const entries = Object.entries(indicators);

if (entries.length !== 47) {
  fail(`expected 47 indicators, found ${entries.length}.`);
}

for (const [key, indicator] of entries) {
  const dashboardDate = indicator.dashboard_latest_date;
  const sourceDate = indicator.source_available_date;
  const sourceCheckedAt = indicator.source_available_checked_at;
  const expectedSourceAt = indicator.expected_source_update_at;

  if (dashboardDate && !datePattern.test(dashboardDate)) {
    fail(`${key} has an invalid dashboard date: ${dashboardDate}.`);
  }
  if (sourceDate && !datePattern.test(sourceDate)) {
    fail(`${key} has an invalid source date: ${sourceDate}.`);
  }
  if (!allowedStatuses.has(indicator.status)) {
    fail(`${key} has an unsupported status: ${indicator.status}.`);
  }
  if (sourceDate && dashboardDate && dashboardDate < sourceDate && indicator.status === "Up to date") {
    fail(`${key} is Up to date while dashboard ${dashboardDate} trails source ${sourceDate}.`);
  }

  if (indicator.status !== "Up to date" || !expectedSourceAt) {
    continue;
  }

  const expectedTime = Date.parse(expectedSourceAt);
  const refreshTime = Date.parse(metadata.last_dashboard_refresh);
  if (!Number.isFinite(expectedTime) || !Number.isFinite(refreshTime) || refreshTime < expectedTime) {
    continue;
  }

  const checkedTime = Date.parse(sourceCheckedAt);
  if (!Number.isFinite(checkedTime) || checkedTime < expectedTime) {
    fail(
      `${key} is Up to date without a successful source confirmation after ${expectedSourceAt}.`,
    );
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Data Status audit passed for ${entries.length} indicators.`);
