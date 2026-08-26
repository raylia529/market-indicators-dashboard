import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const settlementPageUrl = "https://www.jpx.co.jp/english/markets/derivatives/settlement-price/index.html";
const tfxDailyBaseUrl = "https://www.tfx.co.jp/publication/document";
const outputFile = path.join("data", "boj-implied-rate.csv");
const metadataFile = path.join("data", "boj-implied-rate-latest.json");
const policyRateFile = path.join("data", "boj-policy-rate.csv");
const overnightRateFile = path.join("data", "japan-overnight-call-rate.csv");
const timeoutMs = 30_000;
const backfill = process.argv.includes("--backfill");
const backfillStartDate = "2026-08-01";
const policyRateIncrement = 0.25;

// Official BOJ Monetary Policy Meeting end dates.
const bojPolicyMeetingDates = [
  "2026-09-18", "2026-10-30", "2026-12-18",
  "2027-01-22", "2027-03-18", "2027-04-28", "2027-06-11",
  "2027-07-22", "2027-09-22", "2027-10-29", "2027-12-17",
];

function download(url, allowNotFound = false) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { "User-Agent": "market-indicators-dashboard/1.0" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(new URL(response.headers.location, url).href, allowNotFound).then(resolve, reject);
        return;
      }
      if (allowNotFound && response.statusCode === 404) {
        response.resume();
        resolve(null);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed: HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    });
    request.setTimeout(timeoutMs, () => request.destroy(new Error(`Download timed out after ${timeoutMs / 1000}s.`)));
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
      values.push(value.trim());
      value = "";
    } else value += character;
  }
  values.push(value.trim());
  return values.map((item) => item.replace(/^"|"$/g, ""));
}

function parseUtcDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function formatUtcDate(date) {
  return date.toISOString().slice(0, 10);
}

function compactDate(date) {
  return date.replaceAll("-", "");
}

function addUtcDays(date, days) {
  return new Date(date.getTime() + days * 86_400_000);
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

function normalizeTfxContractMonth(value) {
  const match = /^(\d{2})\.(\d{2})$/.exec(value);
  return match ? `20${match[1]}${match[2]}` : null;
}

function readSeries(file) {
  return fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1)
    .map((line) => line.split(","))
    .filter(([date, value]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Number(value)))
    .map(([date, value]) => ({ date, value: Number(value) }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function latestAtOrBefore(rows, date) {
  const row = rows.filter((item) => item.date <= date).at(-1);
  if (!row) throw new Error(`No rate observation is available on or before ${date}.`);
  return row;
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

function findContractForMeeting(contracts, meetingDateText) {
  const meetingDate = parseUtcDate(meetingDateText);
  return contracts
    .map((contract) => {
      const period = contractReferencePeriod(contract.contractMonth);
      return { contract, distance: Math.abs(daysBetween(period.start, meetingDate)) };
    })
    .filter((candidate) => candidate.distance <= 7)
    .sort((left, right) => left.distance - right.distance)[0]?.contract || null;
}

function calculateExpectation(contract, meetingDateText, preMeetingOvernightRate, policyTonaBasis) {
  const meetingDate = parseUtcDate(meetingDateText);
  const period = contractReferencePeriod(contract.contractMonth);
  const totalDays = daysBetween(period.start, period.endExclusive);
  const preMeetingDays = Math.max(0, Math.min(totalDays, daysBetween(period.start, meetingDate)));
  const postMeetingDays = totalDays - preMeetingDays;
  if (postMeetingDays <= 0) throw new Error(`Contract ${contract.contractMonth} has no days after ${meetingDateText}.`);

  const contractImpliedTona = 100 - contract.price;
  const postMeetingTona = (
    (contractImpliedTona * totalDays) - (preMeetingOvernightRate * preMeetingDays)
  ) / postMeetingDays;
  const rawImpliedPolicyRate = postMeetingTona + policyTonaBasis;
  if (rawImpliedPolicyRate < -1 || rawImpliedPolicyRate > 10) {
    throw new Error(`Unexpected BOJ implied policy rate: ${rawImpliedPolicyRate}`);
  }
  const impliedPolicyRate = Math.round(rawImpliedPolicyRate / policyRateIncrement) * policyRateIncrement;
  return {
    contractImpliedTona,
    postMeetingTona,
    rawImpliedPolicyRate,
    impliedPolicyRate,
    period,
    preMeetingDays,
    postMeetingDays,
  };
}

function parseJpxContracts(text) {
  return text.split(/\r?\n/).map(parseCsvLine)
    .filter((row) => row[1]?.startsWith("FUT_TOA3M_") && /^\d{6}$/.test(row[3]) && Number.isFinite(Number(row[5])))
    .map((row) => ({ name: row[1], contractMonth: row[3], price: Number(row[5]), source: "JPX" }));
}

function parseTfxContracts(buffer) {
  const text = new TextDecoder("shift_jis").decode(buffer);
  return text.split(/\r?\n/).map(parseCsvLine)
    .filter((row) => row[0] === "TSTL01OR" && row[8] === "Three-month TONA Futures")
    .map((row) => ({
      name: `TFX_TONA_${row[9]}`,
      contractMonth: normalizeTfxContractMonth(row[9]),
      price: Number(row[20]),
      source: "TFX",
    }))
    .filter((contract) => contract.contractMonth && Number.isFinite(contract.price));
}

function buildFutureCurve(contracts, observationDate, currentOvernightRate, policyTonaBasis) {
  const meetings = bojPolicyMeetingDates.filter((date) => date > observationDate);
  const matched = meetings
    .map((meetingDate) => ({ meetingDate, contract: findContractForMeeting(contracts, meetingDate) }))
    .filter((item) => item.contract)
    .filter((item, index, rows) => rows.findIndex((row) => row.contract.contractMonth === item.contract.contractMonth) === index);

  let expectedOvernightRate = currentOvernightRate;
  return matched.map(({ meetingDate, contract }) => {
    const expectation = calculateExpectation(
      contract,
      meetingDate,
      expectedOvernightRate,
      policyTonaBasis,
    );
    expectedOvernightRate = expectation.impliedPolicyRate - policyTonaBasis;
    return {
      meeting_date: meetingDate,
      contract_month: contract.contractMonth,
      settlement_price: contract.price,
      raw_implied_policy_rate: Number(expectation.rawImpliedPolicyRate.toFixed(4)),
      implied_policy_rate: Number(expectation.impliedPolicyRate.toFixed(4)),
    };
  });
}

async function backfillHistory(rowsByDate, observationDate, policyRows, overnightRows) {
  for (const date of [...rowsByDate.keys()]) {
    if (date <= observationDate) rowsByDate.delete(date);
  }

  let updated = 0;
  for (
    let date = parseUtcDate(backfillStartDate), end = parseUtcDate(observationDate);
    date <= end;
    date = addUtcDays(date, 1)
  ) {
    if ([0, 6].includes(date.getUTCDay())) continue;
    const dateText = formatUtcDate(date);
    const buffer = await download(`${tfxDailyBaseUrl}/daily_statis_${compactDate(dateText)}.csv`, true);
    if (!buffer) continue;
    const contracts = parseTfxContracts(buffer);
    const nextMeetingDate = bojPolicyMeetingDates.find((meeting) => meeting > dateText);
    const contract = nextMeetingDate ? findContractForMeeting(contracts, nextMeetingDate) : null;
    if (!contract) continue;
    const policyRate = latestAtOrBefore(policyRows, dateText);
    const overnightRate = latestAtOrBefore(overnightRows, dateText);
    const expectation = calculateExpectation(
      contract,
      nextMeetingDate,
      overnightRate.value,
      policyRate.value - overnightRate.value,
    );
    rowsByDate.set(dateText, expectation.impliedPolicyRate);
    updated += 1;
  }
  return updated;
}

async function main() {
  const page = (await download(settlementPageUrl)).toString("utf8");
  const csvPath = page.match(/href="([^"]*rb_e\d{8}\.csv)"/i)?.[1];
  if (!csvPath) throw new Error("Could not find JPX's current settlement-price CSV.");
  const observationDate = csvPath.match(/rb_e(\d{4})(\d{2})(\d{2})\.csv/i)?.slice(1).join("-");
  if (!observationDate) throw new Error("Could not determine the JPX settlement date.");

  const jpxText = new TextDecoder("shift_jis").decode(
    await download(new URL(csvPath, settlementPageUrl).href),
  );
  const contracts = parseJpxContracts(jpxText);
  const policyRows = readSeries(policyRateFile);
  const overnightRows = readSeries(overnightRateFile);
  const policyRate = latestAtOrBefore(policyRows, observationDate);
  const overnightRate = latestAtOrBefore(overnightRows, observationDate);
  const policyTonaBasis = policyRate.value - overnightRate.value;
  const futureCurve = buildFutureCurve(contracts, observationDate, overnightRate.value, policyTonaBasis);
  const nextExpectation = futureCurve[0];
  if (!nextExpectation) throw new Error(`No quarterly TONA contract could be mapped after ${observationDate}.`);
  const nextContract = contracts.find((contract) => contract.contractMonth === nextExpectation.contract_month);
  const expectation = calculateExpectation(
    nextContract,
    nextExpectation.meeting_date,
    overnightRate.value,
    policyTonaBasis,
  );

  const rowsByDate = readExisting();
  const backfilledRows = backfill
    ? await backfillHistory(rowsByDate, observationDate, policyRows, overnightRows)
    : 0;
  rowsByDate.set(observationDate, expectation.impliedPolicyRate);
  const lines = ["date,value", ...Array.from(rowsByDate, ([date, value]) => `${date},${value.toFixed(3)}`)
    .sort((left, right) => left.localeCompare(right))];
  atomicWrite(outputFile, `${lines.join("\n")}\n`);

  const previousMetadata = fs.existsSync(metadataFile)
    ? JSON.parse(fs.readFileSync(metadataFile, "utf8"))
    : {};
  const metadata = {
    observation_date: observationDate,
    next_boj_meeting_date: nextExpectation.meeting_date,
    contract_name: nextContract.name,
    contract_month: nextContract.contractMonth,
    contract_reference_start: formatUtcDate(expectation.period.start),
    contract_reference_end: formatUtcDate(addUtcDays(expectation.period.endExclusive, -1)),
    settlement_price: nextContract.price,
    contract_implied_tona: Number(expectation.contractImpliedTona.toFixed(4)),
    current_policy_rate: policyRate.value,
    current_policy_rate_date: policyRate.date,
    current_overnight_rate: overnightRate.value,
    current_overnight_rate_date: overnightRate.date,
    policy_tona_basis: Number(policyTonaBasis.toFixed(4)),
    pre_meeting_days: expectation.preMeetingDays,
    post_meeting_days: expectation.postMeetingDays,
    implied_post_meeting_tona: Number(expectation.postMeetingTona.toFixed(4)),
    raw_implied_policy_rate: Number(expectation.rawImpliedPolicyRate.toFixed(4)),
    policy_rate_increment: policyRateIncrement,
    implied_policy_rate: Number(expectation.impliedPolicyRate.toFixed(4)),
    future_curve: futureCurve,
    historical_backfill_source: "TFX official daily statistics",
    historical_backfill_start_date: backfillStartDate,
    method_effective_date: backfill ? backfillStartDate : (previousMetadata.method_effective_date || observationDate),
    method: "Quarterly TONA contract mapped to the nearest BOJ meeting; pre-meeting days removed at the latest applicable overnight rate; dynamic policy-minus-overnight basis added; display rounded to the nearest 0.25 percentage-point BOJ policy step.",
  };
  atomicWrite(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log(
    `BOJ implied policy rate: ${observationDate} = ${expectation.impliedPolicyRate.toFixed(2)}% ` +
    `(raw ${expectation.rawImpliedPolicyRate.toFixed(4)}%) for ${nextExpectation.meeting_date}; ` +
    `${futureCurve.length} quarterly meeting levels; ${backfilledRows} historical rows backfilled.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
