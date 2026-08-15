/**
 * API 接口层 — 路由分发
 * error.js catch-all 路由器 + Service Binding 调度
 * 
 * 实际来源：worker/error.js
 */

/** 默认静态路由表 */
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
  "/status/": "status",
};

/** API 路由前缀 → Worker 映射 */
const API_ROUTES = {
  "/nav/api/": "websearch",
};

/** 路由缓存 TTL（5 分钟） */
const SITEMAP_TTL_MS = 300_000;

/** 动态路由缓存 */
let routeCache = null;
let routeCacheTime = 0;

/**
 * 从 sitemap.xml 解析动态路由
 * 通过 index service binding 获取 sitemap
 */
async function deriveRoutes(env) {
  try {
    if (!env.index) return {};
    const resp = await env.index.fetch(new Request("https://example.com/sitemap.xml"));
    if (!resp.ok) return {};
    const xml = await resp.text();
    const routes = {};
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      try {
        const u = new URL(match[1]);
        routes[u.pathname] = "websearch";
      } catch (e) {}
    }
    return routes;
  } catch (e) {
    return {};
  }
}

/**
 * 加载路由表（静态 + 动态，带缓存）
 */
async function loadRoutes(env) {
  const now = Date.now();
  if (routeCache && now - routeCacheTime < SITEMAP_TTL_MS) {
    return routeCache;
  }
  const dynamic = await deriveRoutes(env);
  routeCache = { ...DEFAULT_ROUTES, ...dynamic };
  routeCacheTime = now;
  return routeCache;
}

/**
 * 解析路径对应的服务名
 * @param {string} pathname - URL 路径
 * @param {Object} env - Worker env（含 service bindings）
 * @returns {string|null} 服务名或 null
 */
export async function resolveService(pathname, env) {
  // 精确匹配
  const routes = await loadRoutes(env);
  if (routes[pathname]) return routes[pathname];

  // 尾部斜杠匹配
  const withSlash = pathname.endsWith("/") ? pathname : pathname + "/";
  if (routes[withSlash]) return routes[withSlash];

  // API 前缀匹配
  for (const [prefix, service] of Object.entries(API_ROUTES)) {
    if (pathname.startsWith(prefix)) return service;
  }

  return null;
}

/**
 * 通过 service binding 转发请求
 * @param {string} serviceName - 服务名
 * @param {Request} request - 原始请求
 * @param {Object} env - Worker env（含 service bindings）
 * @returns {Response|null} 转发响应或 null
 */
export async function dispatchToService(serviceName, request, env) {
  const binding = env[serviceName];
  if (!binding) return null;
  return binding.fetch(request);
}
