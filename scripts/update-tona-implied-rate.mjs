import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const settlementPageUrl = "https://www.jpx.co.jp/english/markets/derivatives/settlement-price/index.html";
const outputFile = path.join("data", "boj-implied-rate.csv");
const timeoutMs = 30_000;

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

function readExisting() {
  if (!fs.existsSync(outputFile)) return new Map();
  return new Map(
    fs.readFileSync(outputFile, "utf8").trim().split(/\r?\n/).slice(1)
      .map((line) => line.split(","))
      .filter(([date, value]) => date && Number.isFinite(Number(value)))
      .map(([date, value]) => [date, Number(value)]),
  );
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
  const rows = text.split(/\r?\n/).map(parseCsvLine);
  const tonaContracts = rows
    .filter((row) => row[1]?.startsWith("FUT_TOA3M_") && Number.isFinite(Number(row[5])))
    .map((row) => ({ name: row[1], price: Number(row[5]) }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const frontContract = tonaContracts[0];
  if (!frontContract) throw new Error("JPX settlement CSV did not include a 3-Month TONA futures contract.");
  const impliedRate = 100 - frontContract.price;
  if (impliedRate < -1 || impliedRate > 10) throw new Error(`Unexpected implied 3-Month TONA rate: ${impliedRate}`);
  const rowsByDate = readExisting();
  rowsByDate.set(observationDate, impliedRate);
  const lines = ["date,value", ...Array.from(rowsByDate, ([date, value]) => `${date},${value.toFixed(3)}`)
    .sort((left, right) => left.localeCompare(right))];
  fs.writeFileSync(`${outputFile}.tmp`, `${lines.join("\n")}\n`);
  fs.renameSync(`${outputFile}.tmp`, outputFile);
  console.log(`BOJ implied rate (3M TONA): ${observationDate} = ${impliedRate.toFixed(3)}% from ${frontContract.name}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
