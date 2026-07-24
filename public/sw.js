// Minimaler Service Worker für die PWA: macht die App installierbar und liefert
// einen Offline-Fallback. Bewusst NETWORK-FIRST → online kommt immer die frische
// Version, offline die zuletzt gesehene. Nur gleiche Herkunft (kein Supabase/
// Stripe/Google), nur GET.
const CACHE = "gs-cache-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/dashboard"))),
  );
});
