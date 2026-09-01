/**
 * gd-orb — 右下角快捷入口。
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
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!el.classList.contains("is-open"));
  });
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
