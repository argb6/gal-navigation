/**
 * 全局共享配置
 * 运行时配置常量，各 Worker 页面 import 使用
 */

/** 站点域名 */
export const SITE_DOMAIN = "example.com";

/** 站点基础 URL */
export const SITE_URL = `https://${SITE_DOMAIN}`;

/** 站点名称 */
export const SITE_NAME = "GALNAVI";

/** 站点描述 */
export const SITE_DESCRIPTION = "ACG 二次元资源聚合导航站";

/** CDN 资源基础路径 */
export const ASSET_BASE = "https://your-cdn.example.com/assets";

/** favicon 路径 */
export const ASSET_ICON = `${ASSET_BASE}/icon/favicon.png`;

/** Google Fonts 字体栈 */
export const FONT_STACK = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** 稳定运行起算日 */
export const UPTIME_BASE = "2026-06-26";

/** 统一访问记录 key */
export const VERIFIED_KEY = "site-verified";

/** 统一访问记录 cookie */
export const VERIFIED_COOKIE = `${VERIFIED_KEY}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
