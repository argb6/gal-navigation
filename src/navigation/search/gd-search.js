export function initGdSearch(root) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const input = el.querySelector(".gd-search__input");
  const clear = el.querySelector(".gd-search__clear");
  if (!input) return;

  const expandable = Boolean(el.closest("gd-search")?.hasAttribute("expandable"));
  const sync = () => {
    const has = Boolean(input.value);
    clear?.classList.toggle("is-visible", has);
    if (expandable) {
      el.classList.toggle("is-expanded", has || document.activeElement === input);
    }
  };

  if (expandable) {
    input.addEventListener("focus", () => el.classList.add("is-expanded"));
    input.addEventListener("blur", () => {
      if (!input.value) el.classList.remove("is-expanded");
    });
  }
  input.addEventListener("input", sync);
  clear?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    sync();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  bindSearchHelp(el);
  sync();
}

function bindSearchHelp(root) {
  const wrap = root.querySelector(".gd-search__help-wrap");
  const btn = wrap && wrap.querySelector(".gd-search__help");
  if (!wrap || !btn) return;
  const show = () => wrap.classList.add("is-open");
  const hide = () => wrap.classList.remove("is-open");
  wrap.addEventListener("mouseenter", show);
  wrap.addEventListener("mouseleave", hide);
  btn.addEventListener("focus", show);
  btn.addEventListener("blur", hide);
  btn.addEventListener("mousedown", (e) => e.preventDefault());
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    show();
  });
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) hide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
  ));
}

const DEFAULT_HELP =
  "ACG[空格]小说 包含ACG或小说的卡片\nACG[空格]+小说，同时包含ACG和小说的卡片\nACG[空格]-小说，包含ACG但不能有小说的卡片";

class GdSearch extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector(".gd-search")) {
      const toolbar = this.getAttribute("variant") === "toolbar";
      const ariaLabel = this.getAttribute("aria-label") || "搜索";
      const help = this.hasAttribute("help");
      const helpText = escapeHtml(this.getAttribute("help-text") || DEFAULT_HELP);
      const helpId = help ? "gd-search-help-" + Math.random().toString(36).slice(2, 8) : "";
      const helpHtml = help
        ? `<span class="gd-search__help-wrap gd-tooltip-wrap">
            <button type="button" class="gd-search__help" aria-label="搜索规则" aria-describedby="${helpId}">?</button>
            <span class="gd-tooltip gd-search__help-tip" id="${helpId}" role="tooltip">${helpText}</span>
          </span>`
        : "";
      this.innerHTML = `
        <div class="gd-search${toolbar ? " gd-search--toolbar" : ""}">
          <div class="gd-search__box">
            <span class="gd-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
            </span>
            <input class="gd-search__input" type="search" placeholder="${this.getAttribute("placeholder") || "搜索"}" aria-label="${ariaLabel}">
            <button type="button" class="gd-search__clear" aria-label="清除">×</button>
            ${helpHtml}
          </div>
        </div>`;
    }
    initGdSearch(this.querySelector(".gd-search"));
  }
}
if (!customElements.get("gd-search")) customElements.define("gd-search", GdSearch);
