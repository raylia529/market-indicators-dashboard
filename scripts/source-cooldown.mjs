import fs from "node:fs";
import path from "node:path";

const stateFile = process.env.SOURCE_COOLDOWN_FILE || path.join("data", "source-cooldowns.json");
const [command, source, ...messageParts] = process.argv.slice(2);

function jstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function readState() {
  if (!fs.existsSync(stateFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch (error) {
    throw new Error(`Invalid ${stateFile}: ${error.message}`);
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const temporaryFile = `${stateFile}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(temporaryFile, stateFile);
}

if (!source || !["check", "set", "clear"].includes(command)) {
  console.error("Usage: node scripts/source-cooldown.mjs <check|set|clear> <source> [reason]");
  process.exit(2);
}

const currentTime = process.env.UPDATE_NOW ? new Date(process.env.UPDATE_NOW) : new Date();
if (Number.isNaN(currentTime.getTime())) {
  throw new Error(`Invalid UPDATE_NOW value: ${process.env.UPDATE_NOW}`);
}
const today = jstDate(currentTime);
const state = readState();

if (command === "check") {
  const cooldown = state[source];
  if (cooldown?.blocked_date_jst === today) {
    console.log(
      `${source} is paused for ${today} JST after ${cooldown.reason || "a source rate limit"}.`,
    );
    process.exit(4);
  }
  process.exit(0);
}

if (command === "clear") {
  if (state[source]) {
    delete state[source];
    writeState(state);
  }
  process.exit(0);
}

state[source] = {
  blocked_date_jst: today,
  reason: messageParts.join(" ") || "HTTP 429",
  recorded_at: new Date().toISOString(),
};
writeState(state);
console.log(`${source} paused until the next JST date.`);
