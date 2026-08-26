import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const settlementPageUrl = "https://www.jpx.co.jp/english/markets/derivatives/settlement-price/index.html";
const outputFile = path.join("data", "boj-implied-rate.csv");
const metadataFile = path.join("data", "boj-implied-rate-latest.json");
const policyRateFile = path.join("data", "boj-policy-rate.csv");
const overnightRateFile = path.join("data", "japan-overnight-call-rate.csv");
const timeoutMs = 30_000;

// Official BOJ Monetary Policy Meeting end dates.
const bojPolicyMeetingDates = [
  "2026-09-18", "2026-10-30", "2026-12-18",
  "2027-01-22", "2027-03-18", "2027-04-28", "2027-06-11",
  "2027-07-22", "2027-09-22", "2027-10-29", "2027-12-17",
];

function download(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { "User-Agent": "market-indicators-dashboard/1.0" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(new URL(response.headers.location, url).href).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`JPX download failed: HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    });
    request.setTimeout(timeoutMs, () => request.destroy(new Error(`JPX download timed out after ${timeoutMs / 1000}s.`)));
    request.on("error", reject);
  });
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (const character of line) {
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      values.push(value.replaceAll('"', "").trim());
      value = "";
    } else value += character;
  }
  values.push(value.replaceAll('"', "").trim());
  return values;
}

function parseUtcDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function formatUtcDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function thirdWednesday(year, monthIndex) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  const firstWednesday = 1 + ((3 - date.getUTCDay() + 7) % 7);
  return new Date(Date.UTC(year, monthIndex, firstWednesday + 14));
}

function contractReferencePeriod(contractMonth) {
  const match = /^(\d{4})(\d{2})$/.exec(contractMonth);
  if (!match) throw new Error(`Unexpected TONA contract month: ${contractMonth}`);
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return {
    start: thirdWednesday(year, monthIndex),
    endExclusive: thirdWednesday(year, monthIndex + 3),
  };
}

function readLatestSeriesValue(file) {
  const rows = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1)
    .map((line) => line.split(","))
    .filter(([date, value]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Number(value)))
    .sort(([left], [right]) => left.localeCompare(right));
  const latest = rows.at(-1);
  if (!latest) throw new Error(`No usable observations in ${file}.`);
  return { date: latest[0], value: Number(latest[1]) };
}

function readExisting() {
  if (!fs.existsSync(outputFile)) return new Map();
  return new Map(
    fs.readFileSync(outputFile, "utf8").trim().split(/\r?\n/).slice(1)
      .map((line) => line.split(","))
      .filter(([date, value]) => date && Number.isFinite(Number(value)))
      .map(([date, value]) => [date, Number(value)]),
  );
}

function atomicWrite(file, contents) {
  fs.writeFileSync(`${file}.tmp`, contents);
  fs.renameSync(`${file}.tmp`, file);
}

async function main() {
  const page = (await download(settlementPageUrl)).toString("utf8");
  const csvPath = page.match(/href="([^"]*rb_e\d{8}\.csv)"/i)?.[1];
  if (!csvPath) throw new Error("Could not find JPX's current settlement-price CSV.");
  const observationDate = csvPath.match(/rb_e(\d{4})(\d{2})(\d{2})\.csv/i)?.slice(1).join("-");
  if (!observationDate) throw new Error("Could not determine the JPX settlement date.");

  const text = new TextDecoder("shift_jis").decode(
    await download(new URL(csvPath, settlementPageUrl).href),
  );
  const contracts = text.split(/\r?\n/).map(parseCsvLine)
    .filter((row) => row[1]?.startsWith("FUT_TOA3M_") && /^\d{6}$/.test(row[3]) && Number.isFinite(Number(row[5])))
    .map((row) => ({ name: row[1], contractMonth: row[3], price: Number(row[5]) }));

  const nextMeetingDate = bojPolicyMeetingDates.find((date) => date > observationDate);
  if (!nextMeetingDate) throw new Error(`No BOJ meeting configured after ${observationDate}.`);
  const meetingDate = parseUtcDate(nextMeetingDate);
  const contract = contracts.find((candidate) => {
    const period = contractReferencePeriod(candidate.contractMonth);
    return period.start <= meetingDate && meetingDate < period.endExclusive;
  });
  if (!contract) throw new Error(`No listed 3-Month TONA contract covers the ${nextMeetingDate} BOJ meeting.`);

  const period = contractReferencePeriod(contract.contractMonth);
  const totalDays = daysBetween(period.start, period.endExclusive);
  const preMeetingDays = Math.max(0, Math.min(totalDays, daysBetween(period.start, meetingDate)));
  const postMeetingDays = totalDays - preMeetingDays;
  if (postMeetingDays <= 0) throw new Error(`The selected TONA contract has no days after ${nextMeetingDate}.`);

  const policyRate = readLatestSeriesValue(policyRateFile);
  const overnightRate = readLatestSeriesValue(overnightRateFile);
  const contractImpliedTona = 100 - contract.price;
  const postMeetingTona = (
    (contractImpliedTona * totalDays) - (overnightRate.value * preMeetingDays)
  ) / postMeetingDays;
  const policyTonaBasis = policyRate.value - overnightRate.value;
  const rawImpliedPolicyRate = postMeetingTona + policyTonaBasis;
  if (rawImpliedPolicyRate < -1 || rawImpliedPolicyRate > 10) {
    throw new Error(`Unexpected BOJ implied policy rate: ${rawImpliedPolicyRate}`);
  }
  const policyRateIncrement = 0.25;
  const impliedPolicyRate = Math.round(rawImpliedPolicyRate / policyRateIncrement) * policyRateIncrement;

  const rowsByDate = readExisting();
  rowsByDate.set(observationDate, impliedPolicyRate);
  const lines = ["date,value", ...Array.from(rowsByDate, ([date, value]) => `${date},${value.toFixed(3)}`)
    .sort((left, right) => left.localeCompare(right))];
  atomicWrite(outputFile, `${lines.join("\n")}\n`);

  const previousMetadata = fs.existsSync(metadataFile)
    ? JSON.parse(fs.readFileSync(metadataFile, "utf8"))
    : {};
  const metadata = {
    observation_date: observationDate,
    next_boj_meeting_date: nextMeetingDate,
    contract_name: contract.name,
    contract_month: contract.contractMonth,
    contract_reference_start: formatUtcDate(period.start),
    contract_reference_end: formatUtcDate(new Date(period.endExclusive.getTime() - 86_400_000)),
    settlement_price: contract.price,
    contract_implied_tona: Number(contractImpliedTona.toFixed(4)),
    current_policy_rate: policyRate.value,
    current_policy_rate_date: policyRate.date,
    current_overnight_rate: overnightRate.value,
    current_overnight_rate_date: overnightRate.date,
    policy_tona_basis: Number(policyTonaBasis.toFixed(4)),
    pre_meeting_days: preMeetingDays,
    post_meeting_days: postMeetingDays,
    implied_post_meeting_tona: Number(postMeetingTona.toFixed(4)),
    raw_implied_policy_rate: Number(rawImpliedPolicyRate.toFixed(4)),
    policy_rate_increment: policyRateIncrement,
    implied_policy_rate: Number(impliedPolicyRate.toFixed(4)),
    method_effective_date: previousMetadata.method_effective_date || observationDate,
    method: "Contract covering the next BOJ meeting; day-weighted removal of the pre-meeting period at the latest observed overnight rate; dynamic policy-minus-overnight basis added; final display rounded to the nearest 0.25 percentage-point BOJ policy step.",
  };
  atomicWrite(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log(
    `BOJ implied policy rate: ${observationDate} = ${impliedPolicyRate.toFixed(3)}% ` +
    `for ${nextMeetingDate}, from ${contract.contractMonth} TONA futures; ` +
    `dynamic policy/TONA basis ${policyTonaBasis.toFixed(3)}%.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
