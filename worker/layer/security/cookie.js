/**
 * 安全层 — Cookie
 * 对照 worker/new：年龄门已卸掉；NSFW 用 gd-nsfw；欢迎窗用 localStorage
 */

export {
  NSFW_COOKIE,
  readNsfwFlag,
  nsfwSetCookie,
} from "../../shared/security.js";

export { NSFW_COOKIE_MAX_AGE } from "../../shared/constants.js";

/** 欢迎弹窗标记 — 浏览器 localStorage，不是 Cookie */
export const WELCOME_STORAGE_KEY = "galnavi-welcome-seen";
