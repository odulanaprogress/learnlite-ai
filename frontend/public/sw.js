/**
 * LearnLite AI - Offline Service Worker
 * Pre-caches the application shell and enables offline access for students.
 */

const CACHE_NAME = "learnlite-offline-v2";
const APP_SHELL = [
  "/",
  "/dashboard",
  "/dashboard/tutor",
  "/dashboard/flashcards",
  "/dashboard/quizzes",
  "/dashboard/library",
  "/dashboard/settings",
  "/login",
  "/signup",
  "/manifest.json",
  "/file.svg",
  "/globe.svg"
];

// 1. Install & pre-cache critical routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL).catch((err) => {
          console.warn("[SW] Some assets could not be pre-cached:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate & clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== "GET") return;

  // For external or Render backend API requests: attempt network, if fails return JSON error
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // If offline, retrieve cached page
          const cached = await caches.match(request);
          if (cached) return cached;

          // Fallback to cached dashboard
          const fallback = await caches.match("/dashboard");
          if (fallback) return fallback;

          const rootFallback = await caches.match("/");
          return rootFallback || new Response("LearnLite Offline — Please connect to load new pages.", {
            headers: { "Content-Type": "text/plain" }
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, SVGs, images, fonts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return nothing or cached version
          return cached;
        });
    })
  );
});

