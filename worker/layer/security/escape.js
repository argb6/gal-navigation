/**
 * 安全层 — HTML/属性转义
 * 权威实现在 shared/security.js，这里再导出给 layer 内部用
 */

export { escapeHtml, escapeAttr, isSafeHttpUrl } from "../../shared/security.js";
