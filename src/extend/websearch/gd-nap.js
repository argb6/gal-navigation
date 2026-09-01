/**
 * gd-nap — 纳普彩蛋弹窗。
 * 数据由页面传入，组件只负责内容轮换与开关。
 * 用法：
 *   import { initGdNap } from "./nap/gd-nap.js";
 *   initGdNap("#napOverlay", {
 *     items: [...],            // { image, title, content }
 *     openSelector: "#napOpen",
 *     onOpen: (i) => {},       // 可选：每次打开回调（拿当前索引）
 *   });
 */

let napCount = 0;

export function showGdNap(overlay, items, index) {
  const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
  if (!el || !items || !items.length) return;
  const i = (index ?? napCount) % items.length;
  const item = items[i];
  const img = el.querySelector("[data-gd-nap-image]");
  const title = el.querySelector("[data-gd-nap-title]");
  const content = el.querySelector("[data-gd-nap-content]");
  if (!img || !title || !content) return;

  img.onerror = () => {
    img.onerror = null;
    img.src =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="380" height="380" viewBox="0 0 380 380"><rect fill="#0e1525" width="380" height="380"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#4f7cff" font-size="16">图片加载失败</text></svg>'
      );
  };
  img.src = item.image || "";
  title.innerHTML = item.title || "";
  content.innerHTML = item.content || "";

  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
  document.body.classList.add("gd-nap-open");
}

export function closeGdNap(overlay) {
  const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
  if (!el) return;
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gd-nap-open");
}

export function initGdNap(root, { items = [], openSelector = "", onOpen } = {}) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el || el.dataset.gdNapReady === "1") return;
  el.dataset.gdNapReady = "1";

  const show = () => {
    showGdNap(el, items, napCount);
    onOpen?.(napCount);
    napCount += 1;
  };

  const openBtn = openSelector ? document.querySelector(openSelector) : null;
  openBtn?.addEventListener("click", show);

  el.querySelectorAll("[data-gd-nap-close]").forEach((n) => {
    n.addEventListener("click", (e) => {
      e.stopPropagation();
      closeGdNap(el);
    });
  });
  el.addEventListener("click", (e) => {
    if (e.target === el) closeGdNap(el);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.classList.contains("is-open")) closeGdNap(el);
  });
}
