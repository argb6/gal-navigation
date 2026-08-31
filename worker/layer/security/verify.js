/**
 * 安全层 — NSFW 开关（年龄门已卸掉）
 * 对照 worker/new/websearch.js、detail.js
 */

export { readNsfwFlag, nsfwSetCookie, NSFW_COOKIE } from "../../shared/security.js";
export { NAVI_IS_ACTIVE, NAVI_IS_NSFW } from "../../shared/constants.js";
