/**
 * 业务常量对照源（分类等）。
 * 沙盒可以 import。现网 `worker/new` 零 import，改完这里要把同样值抄进 websearch / detail。
 */

/** D1 原始 category 键 → 前端 cat 键（对照 websearch.js 数据转换） */
export const DB_CATEGORY_MAP = {
  simulators: "simulator",
  websites: "site",
  tools: "tool",
  company: "company",
  hanhua: "hanhua",
};

/** 前端 cat 键 → 中文标签（对照 websearch.js CATEGORY_LABELS） */
export const CATEGORY_LABELS = {
  home: "全部",
  site: "站点",
  tool: "工具",
  simulator: "模拟器",
  company: "会社",
  hanhua: "汉化组",
};

/** 前端 cat 键 → { id, label } 展示结构 */
export const CAT_MAP = {
  site: { id: "site", label: "站点" },
  tool: { id: "tool", label: "工具" },
  simulator: { id: "simulator", label: "模拟器" },
  company: { id: "company", label: "会社" },
  hanhua: { id: "hanhua", label: "汉化组" },
};

/** D1 navi_sites.category 允许的原始键（detail.js 校验用）：即 DB_CATEGORY_MAP 的键，禁止手写 */
export const ALLOWED_DB_CATEGORIES = Object.keys(DB_CATEGORY_MAP);

export const ALLOWED_CATEGORIES = Object.keys(CAT_MAP);

/** navi_sites.is_active：1 正常展示，2 NSFW（盾牌打开后才显示），0 下架 */
export const NAVI_IS_ACTIVE = 1;
export const NAVI_IS_NSFW = 2;
/** NSFW 开关 cookie 有效期（秒） */
export const NSFW_COOKIE_MAX_AGE = 24 * 60 * 60;
