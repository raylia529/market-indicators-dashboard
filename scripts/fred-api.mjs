const fredApiBaseUrl = "https://api.stlouisfed.org/fred/series/observations";
const defaultTimeoutMs = 30_000;

function fredApiKey() {
  const apiKey = process.env.FRED_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("FRED_API_KEY is not configured.");
  }

  if (!/^[a-z0-9]{32}$/i.test(apiKey)) {
    throw new Error("FRED_API_KEY has an unexpected format.");
  }

  return apiKey;
}

export function parseFredObservations(payload, seriesId) {
  if (!payload || !Array.isArray(payload.observations)) {
    const message = payload?.error_message || "response did not contain observations";
    throw new Error(`FRED API ${seriesId} returned an invalid response: ${message}`);
  }

  return payload.observations
    .map((observation) => {
      const date = String(observation?.date || "").slice(0, 10);
      const rawValue = String(observation?.value ?? "").trim();
      const value = Number(rawValue);
      return { date, rawValue, value };
    })
    .filter(
      (row) =>
        /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
        row.rawValue !== "" &&
        row.rawValue !== "." &&
        Number.isFinite(row.value),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchFredObservations(
  seriesId,
  { observationStart = null, timeoutMs = defaultTimeoutMs } = {},
) {
  const parameters = new URLSearchParams({
    series_id: seriesId,
    api_key: fredApiKey(),
    file_type: "json",
    sort_order: "asc",
  });

  if (observationStart) {
    parameters.set("observation_start", observationStart);
  }

  let response;
  try {
    response = await fetch(`${fredApiBaseUrl}?${parameters}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "market-indicators-dashboard",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const reason =
      error?.name === "TimeoutError" || error?.name === "AbortError"
        ? `timed out after ${timeoutMs / 1000}s`
        : error?.message || "network request failed";
    throw new Error(`FRED API ${seriesId} ${reason}.`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`FRED API ${seriesId} returned non-JSON HTTP ${response.status}.`);
  }

  if (!response.ok || payload?.error_code) {
    const message = String(payload?.error_message || "request failed").slice(0, 300);
    throw new Error(`FRED API ${seriesId} failed with HTTP ${response.status}: ${message}`);
  }

  return parseFredObservations(payload, seriesId);
}
