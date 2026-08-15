/**
 * 全局共享常量
 * 分类映射、标签、允许列表等业务常量权威源
 */

/** D1 原始 category 键 → 前端 cat 键 */
export const DB_CATEGORY_MAP = {
  simulators: "simulator",
  websites: "site",
  tools: "tool",
  company: "company",
  hanhua: "hanhua",
};

/** 前端 cat 键 → 中文标签 */
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

/** D1 sites.category 允许的原始键 */
export const ALLOWED_DB_CATEGORIES = Object.keys(DB_CATEGORY_MAP);

/** 前端 cat 键允许列表 */
export const ALLOWED_CATEGORIES = Object.keys(CAT_MAP);
