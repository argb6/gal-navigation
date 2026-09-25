/**
 * gd-orb — 右下角扩展按钮。
 * 菜单项约定：标签、仓库、弹窗、殿堂。
 * 用法：initGdOrb("#gdOrb", { onAction: (act) => {} })
 * 菜单用 role="region"，不要 role="menu"。
 */

export function initGdOrb(root, options) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const toggle = el.querySelector(".gd-orb__toggle");
  const menu = el.querySelector(".gd-orb__menu");
  if (!toggle || !menu) return;
  const onAction = options && typeof options.onAction === "function" ? options.onAction : null;

  function setOpen(open) {
    el.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "关闭快捷入口" : "打开快捷入口");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    menu.inert = !open;
  }

  menu.inert = true;
  menu.setAttribute("aria-hidden", "true");

  if (!el.classList.contains("gd-orb--demo")) {
    const POS_KEY = "galnavi-orb-pos";
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
      const maxL = Math.max(edge, window.innerWidth - s - edge);
      // 上界：通知条（#belowNav / .gd-below-nav）下沿，不能拖进/盖住通知区
      let minT = edge;
      const below = document.getElementById("belowNav") || document.querySelector(".gd-below-nav");
      if (below) {
        minT = Math.max(edge, Math.ceil(below.getBoundingClientRect().bottom));
      } else {
        const nav = document.getElementById("mainNav") || document.querySelector(".gd-navbar");
        if (nav) minT = Math.max(edge, Math.ceil(nav.getBoundingClientRect().bottom));
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
      const rect = el.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      originL = rect.left;
      originT = rect.top;
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
        const rect = el.getBoundingClientRect();
        try { localStorage.setItem(POS_KEY, JSON.stringify(clamp(rect.left, rect.top))); } catch { /* 隐私模式可能拒绝写入 */ }
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
        const rect = el.getBoundingClientRect();
        place(rect.left, rect.top);
      } else placeMenu();
    });
    restore();
  } else {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!el.classList.contains("is-open"));
    });
  }
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
