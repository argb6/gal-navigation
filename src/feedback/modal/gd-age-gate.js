/**
 * gd-age-gate — 年龄门行为。
 * 用法：
 *   initGdAgeGate("#ageGate", {
 *     storageKey: "galnavi-age-verified",
 *     autoShow: true,   // 默认 true：初始化即弹出；false：由页面手动触发
 *     onDeny: () => { window.location.replace("/"); },
 *   });
 */

export function initGdAgeGate(root, { storageKey = "gd-age-verified", autoShow = true, onDeny } = {}) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el || el.dataset.gdAgeGateReady === "1") return;

  const open = () => {
    el.classList.add("is-active");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("gd-age-gate-open");
    const focusTarget = el.querySelector("[data-gd-age-yes]");
    focusTarget?.focus();
  };

  const close = () => {
    el.classList.remove("is-active");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gd-age-gate-open");
  };

  el.dataset.gdAgeGateReady = "1";

  /* 按钮始终绑定：已确认场景下页面手动重开弹窗时，确认/拒绝仍可正常关闭 */
  const yesBtn = el.querySelector("[data-gd-age-yes]");
  const noBtn = el.querySelector("[data-gd-age-no]");

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      try {
        localStorage.setItem(storageKey, "1");
      } catch {
        /* 存不上也放行，避免用户被卡在门口 */
      }
      close();
    });
  }

  if (noBtn) {
    noBtn.addEventListener("click", () => {
      if (typeof onDeny === "function") onDeny();
      close();
    });
  }

  let ok = false;
  try {
    ok = localStorage.getItem(storageKey) === "1";
  } catch {
    /* 隐私模式等场景直接放行 */
  }

  if (ok) {
    /* 已确认过：不自动弹出，但仍返回句柄，供页面手动重新触发（如预览演示） */
    return { open, close };
  }

  if (autoShow) open();
  return { open, close };
}
