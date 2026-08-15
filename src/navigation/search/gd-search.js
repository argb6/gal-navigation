export function initGdSearch(root) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const input = el.querySelector(".gd-search__input");
  const clear = el.querySelector(".gd-search__clear");
  if (!input) return;

  const sync = () => {
    const has = Boolean(input.value);
    clear?.classList.toggle("is-visible", has);
    el.classList.toggle("is-expanded", has || document.activeElement === input);
  };

  input.addEventListener("focus", () => el.classList.add("is-expanded"));
  input.addEventListener("blur", () => {
    if (!input.value) el.classList.remove("is-expanded");
  });
  input.addEventListener("input", sync);
  clear?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    sync();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  sync();
}

class GdSearch extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector(".gd-search")) {
      const toolbar = this.getAttribute("variant") === "toolbar";
      const ariaLabel = this.getAttribute("aria-label") || "搜索";
      this.innerHTML = `
        <div class="gd-search${toolbar ? " gd-search--toolbar" : ""}">
          <div class="gd-search__box">
            <span class="gd-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
            </span>
            <input class="gd-search__input" type="search" placeholder="${this.getAttribute("placeholder") || "搜索"}" aria-label="${ariaLabel}">
            <button type="button" class="gd-search__clear" aria-label="清除">×</button>
          </div>
        </div>`;
    }
    initGdSearch(this.querySelector(".gd-search"));
  }
}
if (!customElements.get("gd-search")) customElements.define("gd-search", GdSearch);
