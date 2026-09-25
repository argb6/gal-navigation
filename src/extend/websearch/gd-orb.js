/**
 * gd-orb — 右下角扩展按钮。
 * 菜单约定：标签、仓库、弹窗、殿堂。
 * 用法：initGdOrb("#gdOrb", { onAction: (act) => {} })
 * 菜单用 role="region"，不要 role="menu"。
 * .gd-orb--demo：预览框内可拖（限制在 .demo-preview--orb），不写 localStorage。
 */

export function initGdOrb(root, options) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const toggle = el.querySelector(".gd-orb__toggle");
  const menu = el.querySelector(".gd-orb__menu");
  if (!toggle || !menu) return;
  const onAction = options && typeof options.onAction === "function" ? options.onAction : null;
  const isDemo = el.classList.contains("gd-orb--demo");
  const contain = isDemo ? el.closest(".demo-preview--orb") : null;
  const POS_KEY = isDemo ? null : "galnavi-orb-pos";

  function setOpen(open) {
    el.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "关闭扩展菜单" : "打开扩展菜单");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    menu.inert = !open;
  }

  menu.inert = true;
  menu.setAttribute("aria-hidden", "true");

  let dragging = false;
  let moved = false;
  let suppressClick = false;
  let startX = 0;
  let startY = 0;
  let originL = 0;
  let originT = 0;

  function clamp(left, top) {
    const edge = 8;
    const s = 56;
    if (contain) {
      const maxL = Math.max(edge, contain.clientWidth - s - edge);
      const maxT = Math.max(edge, contain.clientHeight - s - edge);
      return {
        left: Math.min(Math.max(edge, left), maxL),
        top: Math.min(Math.max(edge, top), maxT),
      };
    }
    const maxL = Math.max(edge, window.innerWidth - s - edge);
    // 上界：通知栏（#belowNav / .gd-below-nav）下沿，避免上穿/挡住通知。
    // 若测得 bottom 异常大（包住整页或离屏），忽略以免把可拖高度夹成 0。
    let minT = edge;
    const below = document.getElementById("belowNav") || document.querySelector(".gd-below-nav");
    if (below) {
      const bb = below.getBoundingClientRect().bottom;
      const ceiling = window.innerHeight - s - edge;
      if (bb > 0 && bb < ceiling) minT = Math.max(edge, Math.ceil(bb));
    } else {
      const nav = document.getElementById("mainNav") || document.querySelector(".gd-navbar");
      if (nav) {
        const nb = nav.getBoundingClientRect().bottom;
        const ceiling = window.innerHeight - s - edge;
        if (nb > 0 && nb < ceiling) minT = Math.max(edge, Math.ceil(nb));
      }
    }
    const maxT = Math.max(minT, window.innerHeight - s - edge);
    return {
      left: Math.min(Math.max(edge, left), maxL),
      top: Math.min(Math.max(minT, top), maxT),
    };
  }

  function placeMenu() {
    const rect = el.getBoundingClientRect();
    const menuW = menu.offsetWidth || 160;
    const menuH = menu.offsetHeight || 220;
    const need = menuH + 10;
    const roomAbove = rect.top;
    const roomBelow = window.innerHeight - rect.bottom;
    el.classList.toggle("is-menu-down", roomAbove < need && roomBelow > roomAbove);
    el.classList.toggle("is-menu-right", rect.right < menuW + 8 && window.innerWidth - rect.left > rect.right);
  }

  function place(left, top) {
    const p = clamp(left, top);
    el.style.left = p.left + "px";
    el.style.top = p.top + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
    placeMenu();
    return p;
  }

  function restore() {
    if (!POS_KEY) {
      placeMenu();
      return;
    }
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) {
        placeMenu();
        return;
      }
      const p = JSON.parse(raw);
      if (!p || typeof p.left !== "number" || typeof p.top !== "number") {
        placeMenu();
        return;
      }
      place(p.left, p.top);
    } catch {
      placeMenu();
    }
  }

  toggle.addEventListener("pointerdown", (e) => {
    if (e.button != null && e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    if (contain) {
      originL = el.offsetLeft;
      originT = el.offsetTop;
    } else {
      const rect = el.getBoundingClientRect();
      originL = rect.left;
      originT = rect.top;
    }
    try { toggle.setPointerCapture(e.pointerId); } catch { /* 合成事件没有有效指针 */ }
  });
  toggle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!moved && dx * dx + dy * dy < 36) return;
    if (!moved) {
      moved = true;
      el.classList.add("is-dragging");
    }
    place(originL + dx, originT + dy);
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("is-dragging");
    if (moved) {
      suppressClick = true;
      if (POS_KEY) {
        const rect = el.getBoundingClientRect();
        try { localStorage.setItem(POS_KEY, JSON.stringify(clamp(rect.left, rect.top))); } catch { /* 隐私模式可能拒绝写入 */ }
      }
    }
    try {
      if (e && toggle.hasPointerCapture(e.pointerId)) toggle.releasePointerCapture(e.pointerId);
    } catch { /* 指针已释放 */ }
  }
  toggle.addEventListener("pointerup", endDrag);
  toggle.addEventListener("pointercancel", endDrag);
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (suppressClick) {
      suppressClick = false;
      e.preventDefault();
      return;
    }
    setOpen(!el.classList.contains("is-open"));
    placeMenu();
  });
  window.addEventListener("resize", () => {
    if (el.style.left) {
      if (contain) place(el.offsetLeft, el.offsetTop);
      else {
        const rect = el.getBoundingClientRect();
        place(rect.left, rect.top);
      }
    } else placeMenu();
  });
  restore();

  menu.addEventListener("click", (e) => {
    const item = e.target.closest("[data-gd-orb]");
    if (!item) {
      if (e.target.closest(".gd-orb__item")) setOpen(false);
      return;
    }
    const act = item.getAttribute("data-gd-orb");
    setOpen(false);
    if (act && onAction) {
      e.preventDefault();
      onAction(act);
    }
  });
  document.addEventListener("click", (e) => {
    if (el.classList.contains("is-open") && !el.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}
