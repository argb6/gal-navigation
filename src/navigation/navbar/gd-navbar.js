export function initGdNavbar(root) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el || el.dataset.gdNavbarReady === "1") return;

  const toggle = el.querySelector("[data-gd-nav-toggle]");
  const drawerId = toggle?.getAttribute("aria-controls");
  const scope = el.closest(".gd-navbar-stage--mobile") || el.parentElement || document;
  const drawer =
    (drawerId && document.getElementById(drawerId)) ||
    scope.querySelector?.(".gd-navbar-drawer") ||
    el.parentElement?.querySelector(".gd-navbar-drawer");
  const overlay =
    scope.querySelector?.(".gd-navbar-drawer-overlay") ||
    el.parentElement?.querySelector(".gd-navbar-drawer-overlay");
  if (!toggle || !drawer) return;
  el.dataset.gdNavbarReady = "1";

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    el.classList.toggle("is-drawer-open", open);
    drawer.classList.toggle("is-open", open);
    overlay?.classList.toggle("is-open", open);
    const inMobileStage = el.closest(".gd-navbar-stage--mobile");
    if (!inMobileStage) {
      document.body.classList.toggle("drawer-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    } else {
      // 预览舞台：用舞台 class 驱动遮罩/图标，不污染整页 body
      inMobileStage.classList.toggle("is-drawer-open", open);
    }
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(open);
  });
  overlay?.addEventListener("click", () => setOpen(false));
  drawer.querySelectorAll("a, button.gd-navbar__link").forEach((n) => {
    n.addEventListener("click", () => setOpen(false));
  });
  drawer.querySelectorAll(".gd-navbar-drawer__acc").forEach((acc) => {
    const btn = acc.querySelector(".gd-navbar-drawer__acc-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

export function initGdNavLinks(root) {
  const nodes = typeof root === "string" ? document.querySelectorAll(root) : [root];
  nodes.forEach((el) => {
    if (!el || el.dataset.gdNavLinksReady === "1") return;
    const links = [...el.querySelectorAll(".gd-navbar__link")];
    if (!links.length) return;
    el.dataset.gdNavLinksReady = "1";

    links.forEach((link) => {
      link.addEventListener("click", () => {
        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      });
    });
  });
}

/**
 * navbar 分类计数：按 items 数据统计各分类数量，写入徽章。
 * 自动覆盖导航栏 + 抽屉内所有带 data-nav-cat 的链接。
 * 用法：
 *   initGdNavCounts({
 *     items: [{ cat: "site" }, ...],
 *     catKey: "cat",                 // 默认按 cat 字段统计
 *     homeLabel: "home",             // 统计全量的链接 data-nav-cat
 *   });
 * 徽章元素：<span class="gd-badge" data-gd-nav-count>（无则跳过）
 */
export function initGdNavCounts({ items = [], catKey = "cat", homeLabel = "home" } = {}) {
  if (typeof arguments[0] === "string" || arguments[0] instanceof Element) {
    // 兼容旧签名 initGdNavCounts(root, opts)
    const opts = arguments[1] || {};
    items = opts.items || [];
    catKey = opts.catKey || "cat";
    homeLabel = opts.homeLabel || "home";
  }
  const countBy = (cat) => items.filter((it) => it[catKey] === cat).length;
  document.querySelectorAll(".gd-navbar__link[data-nav-cat]").forEach((link) => {
    const badge = link.querySelector("[data-gd-nav-count]");
    if (!badge) return;
    const cat = link.dataset.navCat;
    const n = cat === homeLabel ? items.length : countBy(cat);
    badge.textContent = String(n);
  });
}

export function initGdCatNav(root) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el || el.dataset.gdCatNavReady === "1") return;
  const tabs = [...el.querySelectorAll(".gd-cat-tab")];
  if (!tabs.length) return;
  el.dataset.gdCatNavReady = "1";

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
    });
  });
}

class GdNavbar extends HTMLElement {
  connectedCallback() {
    initGdNavbar(this.querySelector(".gd-navbar") || this);
  }
}
if (!customElements.get("gd-navbar")) customElements.define("gd-navbar", GdNavbar);
