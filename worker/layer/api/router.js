/**
 * API 接口层 — 路由分发
 * 对照 worker/new/error.js
 */

const SITEMAP_TTL_MS = 300_000;
const SITEMAP_URL = "https://galnavi.top/sitemap.xml";

const DEFAULT_ROUTES = {
  "/": "index",
  "/robots.txt": "index",
  "/sitemap.xml": "index",
  "/favicon.ico": "index",
  "/nav/": "websearch",
  "/nav/detail/": "detail",
  "/nav/about/": "about",
  "/nav/help/": "help",
  "/nav/palace/": "palace",
  "/nav/donate/": "donate",
  "/nav/friend/": "friend",
};

const API_PREFIX = "/nav/api/";

let sitemapCache = { routes: null, ts: 0 };

function deriveRoutes(xml) {
  const routes = {};
  const re = /<loc[^>]*>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    let path;
    try {
      path = new URL(m[1].trim()).pathname;
    } catch {
      continue;
    }
    if (path === "/") {
      routes[path] = "index";
      continue;
    }
    if (path === "/robots.txt" || path === "/sitemap.xml" || path === "/favicon.ico") {
      routes[path] = "index";
      continue;
    }
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "nav" && parts.length === 2) {
      routes[path] = parts[1];
    }
  }
  return routes;
}

async function loadRoutes(env) {
  const now = Date.now();
  if (sitemapCache.routes && now - sitemapCache.ts < SITEMAP_TTL_MS) {
    return sitemapCache.routes;
  }
  const fallbackRoutes = { ...DEFAULT_ROUTES };
  if (env && env.index) {
    try {
      const resp = await env.index.fetch(new Request(SITEMAP_URL));
      if (resp.ok) {
        const xml = await resp.text();
        const derived = deriveRoutes(xml);
        if (Object.keys(derived).length > 0) {
          const routes = { ...DEFAULT_ROUTES, ...derived };
          sitemapCache = { routes, ts: now };
          return routes;
        }
      }
    } catch { /* sitemap 拉取失败则用默认路由 */ }
  }
  sitemapCache = { routes: fallbackRoutes, ts: now };
  return fallbackRoutes;
}

export async function resolveService(pathname, env) {
  const routes = await loadRoutes(env);
  if (routes[pathname]) return routes[pathname];
  if (pathname.startsWith(API_PREFIX)) return "websearch";
  return null;
}

export async function dispatchToService(serviceName, request, env) {
  const binding = env[serviceName];
  if (!binding) return null;
  return binding.fetch(request);
}
