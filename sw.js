const CACHE_VERSION = "market-dashboard-v30";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=glossary-links-v2",
  "./app.js?v=glossary-links-v2",
  "./data/glossary.json",
  "./manifest.json",
  "./offline.html",
  "./icons/icon-192.png?v=2",
  "./icons/icon-512.png?v=2",
  "./icons/apple-touch-icon.png?v=2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("market-dashboard-") && ![APP_SHELL_CACHE, DATA_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isLocalRequest(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isMarketDataRequest(request) {
  const url = new URL(request.url);
  return (
    isLocalRequest(request) &&
    url.pathname.includes("/data/") &&
    !url.pathname.endsWith("/data/glossary.json") &&
    /\.(csv|json)$/.test(url.pathname)
  );
}

function isAppShellRequest(request) {
  if (!isLocalRequest(request) || request.method !== "GET") {
    return false;
  }

  const url = new URL(request.url);
  return (
    request.mode === "navigate" ||
    [".html", ".css", ".js", ".png", ".webmanifest"].some((extension) => url.pathname.endsWith(extension)) ||
    url.pathname.endsWith("/manifest.json") ||
    url.pathname.endsWith("/data/glossary.json")
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok && isLocalRequest(request)) {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    if (request.mode === "navigate") {
      return caches.match("./offline.html");
    }

    throw error;
  }
}

async function networkFirstAppShell(request) {
  try {
    const response = await fetch(request);

    if (response.ok && isLocalRequest(request)) {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    return caches.match("./offline.html");
  }
}

async function networkFirstData(request) {
  const url = new URL(request.url);
  const cacheKey = new Request(`${url.origin}${url.pathname}`, { method: "GET" });
  const cache = await caches.open(DATA_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(cacheKey, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(cacheKey);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (isMarketDataRequest(request)) {
    event.respondWith(networkFirstData(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstAppShell(request));
    return;
  }

  if (isAppShellRequest(request)) {
    event.respondWith(cacheFirst(request));
  }
});
