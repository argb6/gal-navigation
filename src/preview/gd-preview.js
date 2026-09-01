(() => {
  // src/feedback/modal/gd-modal.js
  var stack = [];
  var inertApplied = false;
  function applyBackgroundInert() {
    if (inertApplied) return;
    const bodyChildren = [...document.body.children];
    const modalEls = new Set(
      [...document.querySelectorAll("gd-modal, [role='dialog']")].map((n) => n)
    );
    bodyChildren.forEach((child) => {
      if (modalEls.has(child)) return;
      if (typeof child.inert === "boolean") child.inert = true;
      else child.setAttribute("inert", "");
    });
    inertApplied = true;
  }
  function removeBackgroundInert() {
    if (!inertApplied) return;
    const bodyChildren = [...document.body.children];
    bodyChildren.forEach((child) => {
      if (typeof child.inert === "boolean") child.inert = false;
      else child.removeAttribute("inert");
    });
    inertApplied = false;
  }
  function trapFocus(container, e) {
    if (e.key !== "Tab") return;
    const focusables = [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (n) => !n.hasAttribute("disabled") && n.offsetParent !== null
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  function openGdModal(overlay, { returnFocus } = {}) {
    const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
    if (!el) return;
    const trigger = returnFocus || document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    applyBackgroundInert();
    stack.push({ el, trigger });
    const focusTarget = el.querySelector("[data-gd-autofocus], button, .gd-button, .gd-link");
    focusTarget == null ? void 0 : focusTarget.focus();
  }
  function closeGdModal(overlay) {
    var _a;
    const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    const idx = stack.findIndex((s) => s.el === el);
    if (idx >= 0) {
      const { trigger } = stack.splice(idx, 1)[0];
      (_a = trigger == null ? void 0 : trigger.focus) == null ? void 0 : _a.call(trigger);
    }
    if (!stack.length) {
      document.body.style.overflow = "";
      removeBackgroundInert();
    }
  }
  function bindGdModal(overlaySelector, openBtnSelector) {
    const overlay = document.querySelector(overlaySelector);
    const btn = document.querySelector(openBtnSelector);
    if (!overlay || !btn) return;
    bindModalControls(overlay);
    btn.addEventListener("click", () => openGdModal(overlay, { returnFocus: btn }));
  }
  function bindModalControls(overlay) {
    if (overlay.dataset.gdModalReady === "1") return;
    overlay.dataset.gdModalReady = "1";
    overlay.setAttribute("aria-hidden", overlay.classList.contains("is-open") ? "false" : "true");
    overlay.querySelectorAll("[data-gd-close]").forEach((n) => {
      n.addEventListener("click", () => closeGdModal(overlay));
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && overlay.hasAttribute("data-close-on-backdrop")) {
        closeGdModal(overlay);
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (!stack.length) return;
    const top = stack[stack.length - 1];
    if (e.key === "Escape") {
      e.preventDefault();
      closeGdModal(top.el);
      return;
    }
    trapFocus(top.el, e);
  });
  function startGdRedirectCountdown(overlay, seconds = 3, onDone) {
    const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
    if (!el) return () => {
    };
    openGdModal(el);
    const countEl = el.querySelector("[data-gd-countdown]");
    let left = seconds;
    if (countEl) countEl.textContent = String(left);
    const id = setInterval(() => {
      left -= 1;
      if (countEl) countEl.textContent = String(Math.max(left, 0));
      if (left <= 0) {
        clearInterval(id);
        closeGdModal(el);
        onDone == null ? void 0 : onDone();
      }
    }, 1e3);
    const cancel = el.querySelector("[data-gd-close]");
    const onCancel = () => {
      clearInterval(id);
      closeGdModal(el);
    };
    cancel == null ? void 0 : cancel.addEventListener("click", onCancel, { once: true });
    return () => clearInterval(id);
  }
  var GdModal = class extends HTMLElement {
    connectedCallback() {
      bindModalControls(this);
    }
  };
  if (!customElements.get("gd-modal")) customElements.define("gd-modal", GdModal);

  // src/navigation/navbar/gd-navbar.js
  function initGdNavbar(root) {
    var _a, _b, _c, _d;
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el || el.dataset.gdNavbarReady === "1") return;
    const toggle = el.querySelector("[data-gd-nav-toggle]");
    const drawerId = toggle == null ? void 0 : toggle.getAttribute("aria-controls");
    const scope = el.closest(".gd-navbar-stage--mobile") || el.parentElement || document;
    const drawer = drawerId && document.getElementById(drawerId) || ((_a = scope.querySelector) == null ? void 0 : _a.call(scope, ".gd-navbar-drawer")) || ((_b = el.parentElement) == null ? void 0 : _b.querySelector(".gd-navbar-drawer"));
    const overlay = ((_c = scope.querySelector) == null ? void 0 : _c.call(scope, ".gd-navbar-drawer-overlay")) || ((_d = el.parentElement) == null ? void 0 : _d.querySelector(".gd-navbar-drawer-overlay"));
    if (!toggle || !drawer) return;
    el.dataset.gdNavbarReady = "1";
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      el.classList.toggle("is-drawer-open", open);
      drawer.classList.toggle("is-open", open);
      overlay == null ? void 0 : overlay.classList.toggle("is-open", open);
      const inMobileStage = el.closest(".gd-navbar-stage--mobile");
      if (!inMobileStage) {
        document.body.classList.toggle("drawer-open", open);
        document.body.style.overflow = open ? "hidden" : "";
      } else {
        inMobileStage.classList.toggle("is-drawer-open", open);
      }
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });
    overlay == null ? void 0 : overlay.addEventListener("click", () => setOpen(false));
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
  function initGdNavLinks(root) {
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
  function initGdNavCounts({ items = [], catKey = "cat", homeLabel = "home" } = {}) {
    if (typeof arguments[0] === "string" || arguments[0] instanceof Element) {
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
  var NSFW_LABEL_OFF = "NSFW \u5185\u5BB9\u5DF2\u9690\u85CF";
  var NSFW_LABEL_ON = "NSFW \u5185\u5BB9\u5DF2\u663E\u793A";
  var NSFW_FLASH_MS = 1200;
  function initGdNsfwToggle(root, { storageKey = "gd-nsfw-visible", onChange } = {}) {
    const scope = typeof root === "string" ? document.querySelector(root) : root || document;
    if (!scope || !scope.querySelectorAll) return;
    const buttons = [...scope.querySelectorAll("[data-gd-nsfw]")];
    if (!buttons.length) return;
    if (buttons.some((b) => b.dataset.gdNsfwReady === "1")) return;
    buttons.forEach((b) => {
      b.dataset.gdNsfwReady = "1";
    });
    let visible = false;
    let flashTimer = null;
    try {
      visible = localStorage.getItem(storageKey) === "1";
    } catch (e) {
    }
    const reduceMotion = () => {
      try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (e) {
        return false;
      }
    };
    const flashButtons = buttons.filter((btn) => btn.querySelector("[data-gd-nsfw-msg]"));
    const clearFlash = () => {
      if (flashTimer) {
        clearTimeout(flashTimer);
        flashTimer = null;
      }
      flashButtons.forEach((btn) => {
        btn.classList.remove("is-flash");
        const face = btn.querySelector("[data-gd-nsfw-face]");
        const msg = btn.querySelector("[data-gd-nsfw-msg]");
        if (face) face.style.visibility = "";
        if (msg) msg.hidden = true;
      });
    };
    const flashMsg = (text) => {
      clearFlash();
      const delay = reduceMotion() ? 0 : NSFW_FLASH_MS;
      flashButtons.forEach((btn) => {
        const compact = btn.classList.contains("gd-navbar__nsfw");
        const face = btn.querySelector("[data-gd-nsfw-face]");
        const msg = btn.querySelector("[data-gd-nsfw-msg]");
        if (!msg) return;
        msg.textContent = compact ? text === "\u5DF2\u5F00\u542F" ? "\u5F00" : "\u5173" : text;
        btn.classList.add("is-flash");
        if (face) face.style.visibility = "hidden";
        msg.hidden = false;
      });
      flashTimer = setTimeout(() => {
        flashButtons.forEach((btn) => {
          btn.classList.remove("is-flash");
          const face = btn.querySelector("[data-gd-nsfw-face]");
          const msg = btn.querySelector("[data-gd-nsfw-msg]");
          if (face) face.style.visibility = "";
          if (msg) msg.hidden = true;
        });
        flashTimer = null;
      }, delay);
    };
    const apply = (on, persist, flash) => {
      visible = !!on;
      const label = visible ? NSFW_LABEL_ON : NSFW_LABEL_OFF;
      buttons.forEach((btn) => {
        var _a;
        btn.classList.toggle("is-on", visible);
        btn.setAttribute("aria-pressed", String(visible));
        btn.setAttribute("aria-label", label);
        const tip = (_a = btn.closest(".gd-tooltip-wrap")) == null ? void 0 : _a.querySelector("[data-gd-nsfw-tip]");
        if (tip) tip.textContent = label;
      });
      document.documentElement.classList.toggle("gd-nsfw-on", visible);
      try {
        document.cookie = "gd-nsfw=" + (visible ? "1" : "0") + "; Path=/; Max-Age=31536000; SameSite=Lax";
      } catch (e) {
      }
      if (typeof onChange === "function") onChange(visible);
      if (persist) {
        try {
          localStorage.setItem(storageKey, visible ? "1" : "0");
        } catch (e) {
        }
      }
      if (flash) flashMsg(visible ? "\u5DF2\u5F00\u542F" : "\u5DF2\u5173\u95ED");
    };
    apply(visible, false, false);
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => apply(!visible, true, true));
    });
    return {
      get visible() {
        return visible;
      },
      set: (on) => apply(!!on, true, false)
    };
  }
  function initGdCatNav(root) {
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
  var GdNavbar = class extends HTMLElement {
    connectedCallback() {
      initGdNavbar(this.querySelector(".gd-navbar") || this);
    }
  };
  if (!customElements.get("gd-navbar")) customElements.define("gd-navbar", GdNavbar);

  // src/navigation/search/gd-search.js
  function initGdSearch(root) {
    var _a;
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el) return;
    const input = el.querySelector(".gd-search__input");
    const clear = el.querySelector(".gd-search__clear");
    if (!input) return;
    const expandable = Boolean((_a = el.closest("gd-search")) == null ? void 0 : _a.hasAttribute("expandable"));
    const sync = () => {
      const has = Boolean(input.value);
      clear == null ? void 0 : clear.classList.toggle("is-visible", has);
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
    clear == null ? void 0 : clear.addEventListener("click", () => {
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
    return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }
  var DEFAULT_HELP = "ACG[\u7A7A\u683C]\u5C0F\u8BF4 \u5305\u542BACG\u6216\u5C0F\u8BF4\u7684\u5361\u7247\nACG[\u7A7A\u683C]+\u5C0F\u8BF4\uFF0C\u540C\u65F6\u5305\u542BACG\u548C\u5C0F\u8BF4\u7684\u5361\u7247\nACG[\u7A7A\u683C]-\u5C0F\u8BF4\uFF0C\u5305\u542BACG\u4F46\u4E0D\u80FD\u6709\u5C0F\u8BF4\u7684\u5361\u7247";
  var GdSearch = class extends HTMLElement {
    connectedCallback() {
      if (!this.querySelector(".gd-search")) {
        const toolbar = this.getAttribute("variant") === "toolbar";
        const ariaLabel = this.getAttribute("aria-label") || "\u641C\u7D22";
        const help = this.hasAttribute("help");
        const helpText = escapeHtml(this.getAttribute("help-text") || DEFAULT_HELP);
        const helpId = help ? "gd-search-help-" + Math.random().toString(36).slice(2, 8) : "";
        const helpHtml = help ? `<span class="gd-search__help-wrap gd-tooltip-wrap">
            <button type="button" class="gd-search__help" aria-label="\u641C\u7D22\u89C4\u5219" aria-describedby="${helpId}">?</button>
            <span class="gd-tooltip gd-search__help-tip" id="${helpId}" role="tooltip">${helpText}</span>
          </span>` : "";
        this.innerHTML = `
        <div class="gd-search${toolbar ? " gd-search--toolbar" : ""}">
          <div class="gd-search__box">
            <span class="gd-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
            </span>
            <input class="gd-search__input" type="search" placeholder="${this.getAttribute("placeholder") || "\u641C\u7D22"}" aria-label="${ariaLabel}">
            <button type="button" class="gd-search__clear" aria-label="\u6E05\u9664">\xD7</button>
            ${helpHtml}
          </div>
        </div>`;
      }
      initGdSearch(this.querySelector(".gd-search"));
    }
  };
  if (!customElements.get("gd-search")) customElements.define("gd-search", GdSearch);

  // src/extend/overview/gd-overview-toc.js
  function initGdOverviewToc(root = document) {
    const nav = typeof root === "string" ? document.querySelector(root) : root;
    const mobile = document.querySelector("[data-gd-mobile-toc]");
    const desktopLinks = nav ? [...nav.querySelectorAll(".gd-otp__link[href^='#']")] : [];
    const mobileLinks = mobile ? [...mobile.querySelectorAll(".gd-overview-mobile-list__link[href^='#']")] : [];
    const links = [...desktopLinks, ...mobileLinks];
    if (!links.length && !mobile) return;
    const sectionIds = [
      ...new Set(
        links.map((a) => {
          var _a;
          return (_a = a.getAttribute("href")) == null ? void 0 : _a.slice(1);
        }).filter(Boolean)
      )
    ];
    const sections = sectionIds.map((id) => {
      const el = document.getElementById(id);
      return el ? { id, el } : null;
    }).filter(Boolean);
    const setActive = (id) => {
      links.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
      });
    };
    const syncActive = () => {
      if (!sections.length) return;
      const marker = 100;
      let current = sections[0].id;
      for (const s of sections) {
        if (s.el.getBoundingClientRect().top <= marker) current = s.id;
      }
      const last = sections[sections.length - 1].el;
      if (last.getBoundingClientRect().bottom <= window.innerHeight + 1) {
        current = sections[sections.length - 1].id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive, { passive: true });
    requestAnimationFrame(syncActive);
    setTimeout(syncActive, 100);
    if (!mobile) return;
    const btn = mobile.querySelector("[data-gd-mobile-toc-toggle]");
    const panel = mobile.querySelector("[data-gd-mobile-toc-panel]");
    if (!btn || !panel) return;
    const setOpen = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "\u5173\u95ED\u672C\u9875\u7D22\u5F15" : "\u6253\u5F00\u672C\u9875\u7D22\u5F15");
      panel.setAttribute("aria-hidden", String(!open));
      if (open) {
        panel.removeAttribute("hidden");
        requestAnimationFrame(() => {
          mobile.classList.add("is-open");
        });
        return;
      }
      mobile.classList.remove("is-open");
      const hide = () => {
        if (!mobile.classList.contains("is-open")) panel.setAttribute("hidden", "");
      };
      panel.addEventListener("transitionend", hide, { once: true });
      setTimeout(hide, 320);
    };
    setOpen(false);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!mobile.classList.contains("is-open"));
    });
    mobileLinks.forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("click", (e) => {
      if (!mobile.classList.contains("is-open")) return;
      if (!mobile.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // src/display/hero-carousel/gd-hero-carousel.js
  function initGdHero(root) {
    var _a, _b;
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el) return;
    const slides = [...el.querySelectorAll(".gd-hero__slide")];
    const dots = [...el.querySelectorAll(".gd-hero__dot")];
    if (!slides.length) return;
    let i = slides.findIndex((s) => s.classList.contains("is-active"));
    if (i < 0) i = 0;
    let timer2;
    function go(n) {
      slides[i].classList.remove("is-active");
      if (dots[i]) {
        dots[i].classList.remove("is-active");
        dots[i].removeAttribute("aria-current");
      }
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active");
      if (dots[i]) {
        dots[i].classList.add("is-active");
        dots[i].setAttribute("aria-current", "true");
      }
    }
    function next() {
      go(i + 1);
    }
    function prev() {
      go(i - 1);
    }
    function arm() {
      clearInterval(timer2);
      timer2 = setInterval(next, 4500);
    }
    (_a = el.querySelector(".gd-hero__arrow--next")) == null ? void 0 : _a.addEventListener("click", () => {
      next();
      arm();
    });
    (_b = el.querySelector(".gd-hero__arrow--prev")) == null ? void 0 : _b.addEventListener("click", () => {
      prev();
      arm();
    });
    dots.forEach((d, idx) => d.addEventListener("click", () => {
      go(idx);
      arm();
    }));
    go(i);
    arm();
  }

  // src/extend/websearch/gd-nap.js
  var napCount = 0;
  function showGdNap(overlay, items, index) {
    const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
    if (!el || !items || !items.length) return;
    const i = (index != null ? index : napCount) % items.length;
    const item = items[i];
    const img = el.querySelector("[data-gd-nap-image]");
    const title = el.querySelector("[data-gd-nap-title]");
    const content = el.querySelector("[data-gd-nap-content]");
    if (!img || !title || !content) return;
    img.onerror = () => {
      img.onerror = null;
      img.src = "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="380" height="380" viewBox="0 0 380 380"><rect fill="#0e1525" width="380" height="380"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#4f7cff" font-size="16">\u56FE\u7247\u52A0\u8F7D\u5931\u8D25</text></svg>'
      );
    };
    img.src = item.image || "";
    title.innerHTML = item.title || "";
    content.innerHTML = item.content || "";
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("gd-nap-open");
  }
  function closeGdNap(overlay) {
    const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gd-nap-open");
  }
  function initGdNap(root, { items = [], openSelector = "", onOpen } = {}) {
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el || el.dataset.gdNapReady === "1") return;
    el.dataset.gdNapReady = "1";
    const show = () => {
      showGdNap(el, items, napCount);
      onOpen == null ? void 0 : onOpen(napCount);
      napCount += 1;
    };
    const openBtn = openSelector ? document.querySelector(openSelector) : null;
    openBtn == null ? void 0 : openBtn.addEventListener("click", show);
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

  // src/extend/websearch/gd-notice-led.js
  function initGdNoticeLed(root) {
    const led = typeof root === "string" ? document.querySelector(root) : root || document.querySelector(".gd-notice-led");
    const track = led && led.querySelector(".gd-notice-led__track");
    if (!led || !track) return;
    const first = track.querySelector(".gd-notice-led__item");
    const text = first ? first.textContent : "";
    function fillLed() {
      if (!text) return;
      track.innerHTML = "";
      let i = 0;
      do {
        const s = document.createElement("span");
        s.className = "gd-notice-led__item";
        s.textContent = text;
        if (i) s.setAttribute("aria-hidden", "true");
        track.appendChild(s);
        i += 1;
      } while (track.scrollWidth < led.clientWidth * 2 && i < 12);
      if (i < 2) {
        const extra = document.createElement("span");
        extra.className = "gd-notice-led__item";
        extra.textContent = text;
        extra.setAttribute("aria-hidden", "true");
        track.appendChild(extra);
      }
      const half = track.scrollWidth / 2;
      const dur = half > 0 ? half / 48 : 22;
      track.style.setProperty("--gd-notice-led-duration", dur + "s");
    }
    fillLed();
    window.addEventListener("resize", fillLed);
  }

  // src/extend/websearch/gd-orb.js
  function initGdOrb(root, options) {
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el) return;
    const toggle = el.querySelector(".gd-orb__toggle");
    const menu = el.querySelector(".gd-orb__menu");
    if (!toggle || !menu) return;
    const onAction = options && typeof options.onAction === "function" ? options.onAction : null;
    function setOpen(open) {
      el.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "\u5173\u95ED\u5FEB\u6377\u5165\u53E3" : "\u6253\u5F00\u5FEB\u6377\u5165\u53E3");
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

  // src/feedback/toast/gd-toast.js
  var timer = null;
  function showGdToast(message, ms = 2200) {
    let el = document.querySelector(".gd-toast:not(.is-demo)");
    if (!el) {
      el = document.createElement("div");
      el.className = "gd-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-open");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-open"), ms);
  }

  // src/feedback/skeleton/gd-skeleton.js
  var CARD_SKELETON = `
  <div class="gd-skeleton__card">
    <div class="gd-skeleton__block gd-skeleton__card-line"></div>
    <div class="gd-skeleton__block gd-skeleton__card-line gd-skeleton__card-line--sm"></div>
  </div>`;
  var VARIANT_TEMPLATES = {
    detail: (count) => `
    <div class="gd-skeleton gd-skeleton--detail" aria-hidden="true">
      <div class="gd-skeleton__banner"></div>
      <div class="gd-skeleton__grid">
        ${Array.from({ length: count }, () => CARD_SKELETON).join("")}
      </div>
    </div>`,
    card: () => `
    <div class="gd-skeleton gd-skeleton--card" aria-hidden="true">
      <div class="gd-skeleton__header">
        <div class="gd-skeleton__block gd-skeleton__icon"></div>
        <div class="gd-skeleton__title-wrap">
          <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div>
          <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div>
        </div>
      </div>
      <div class="gd-skeleton__tags">
        <div class="gd-skeleton__block gd-skeleton__tag"></div>
        <div class="gd-skeleton__block gd-skeleton__tag"></div>
        <div class="gd-skeleton__block gd-skeleton__tag"></div>
      </div>
      <div class="gd-skeleton__actions">
        <div class="gd-skeleton__block gd-skeleton__btn"></div>
        <div class="gd-skeleton__block gd-skeleton__btn"></div>
      </div>
    </div>`,
    hero: () => `<div class="gd-skeleton gd-skeleton--hero" aria-hidden="true"></div>`
  };
  function showGdSkeleton(container, { variant = "detail", count = 3 } = {}) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;
    const tpl = VARIANT_TEMPLATES[variant] || VARIANT_TEMPLATES.detail;
    el.innerHTML = tpl(count);
  }
  function replaceGdSkeleton(container, realHtml) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = realHtml;
  }

  // src/foundation/layout/gd-layout.js
  function initGdStickyViewport() {
    function apply() {
      var h = window.visualViewport && window.visualViewport.height || window.innerHeight;
      document.documentElement.style.setProperty("--gd-vvh", h + "px");
    }
    apply();
    window.addEventListener("resize", apply);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", apply);
    return { update: apply };
  }

  // src/extend/detail/gd-detail.js
  var DESIGN_WIDTH = 1100;
  function getZoomOutScale() {
    var inner = document.documentElement.clientWidth || window.innerWidth || 1;
    var outer = window.outerWidth || 0;
    var screenW = window.screen && (window.screen.availWidth || window.screen.width) || 0;
    var rOuter = 0;
    if (outer >= 480) {
      var cand = inner / outer;
      if (cand > 0 && cand <= 4.2) rOuter = cand;
    }
    var rScreen = screenW > 0 ? inner / screenW : 0;
    var pageZoomOut = Math.max(rOuter, rScreen);
    if (!(pageZoomOut > 1.08)) return 1;
    var shell = document.querySelector(".gd-detail__container");
    var avail = shell && shell.clientWidth || inner;
    var fill = avail / DESIGN_WIDTH;
    var inv = Math.min(pageZoomOut, Math.max(fill, 1), 4);
    if (!isFinite(inv) || inv < 1) return 1;
    return Math.round(inv * 1e3) / 1e3;
  }
  function initGdInverseZoom() {
    var viewport = initGdStickyViewport();
    function apply() {
      viewport.update();
      document.documentElement.style.setProperty("--gd-inv-zoom", String(getZoomOutScale()));
    }
    apply();
    window.addEventListener("resize", apply);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", apply);
    }
    return { update: apply };
  }

  // temp/gd-preview-entry.js
  var ASSET_MASCOT = "https://assets.galnavi.top/mascot";
  var DEMO_CATS = [
    { cat: "site", n: 128 },
    { cat: "tool", n: 36 },
    { cat: "simulator", n: 14 },
    { cat: "company", n: 22 },
    { cat: "hanhua", n: 26 }
  ];
  var demoItems = DEMO_CATS.flatMap(function({ cat, n }) {
    return Array.from({ length: n }, function() {
      return { cat };
    });
  });
  initGdOverviewToc("[data-gd-overview-toc]");
  initGdInverseZoom();
  initGdOrb("#previewOrb");
  var demoToc = document.querySelector("[data-extend-ui-toc]");
  var demoTocBtn = demoToc && demoToc.querySelector("[data-extend-ui-toc-toggle]");
  var demoTocPanel = demoToc && demoToc.querySelector("[data-extend-ui-toc-panel]");
  if (demoTocBtn && demoTocPanel) {
    setDemoOpen = function(open) {
      demoTocBtn.setAttribute("aria-expanded", String(open));
      demoTocBtn.setAttribute("aria-label", open ? "\u5173\u95ED\u672C\u9875\u7D22\u5F15" : "\u6253\u5F00\u672C\u9875\u7D22\u5F15");
      demoTocPanel.setAttribute("aria-hidden", String(!open));
      if (open) {
        demoTocPanel.removeAttribute("hidden");
        requestAnimationFrame(function() {
          demoToc.classList.add("is-open");
        });
      } else {
        demoToc.classList.remove("is-open");
        var hide = function() {
          if (!demoToc.classList.contains("is-open")) demoTocPanel.setAttribute("hidden", "");
        };
        demoTocPanel.addEventListener("transitionend", hide, { once: true });
        setTimeout(hide, 320);
      }
    };
    demoTocBtn.addEventListener("click", function() {
      setDemoOpen(!demoToc.classList.contains("is-open"));
    });
    document.addEventListener("click", function(e) {
      if (demoToc.classList.contains("is-open") && !demoToc.contains(e.target)) setDemoOpen(false);
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") setDemoOpen(false);
    });
  }
  var setDemoOpen;
  initGdHero("#demoHero");
  initGdNavLinks("[data-gd-nav-links]");
  initGdCatNav("[data-gd-cat-nav]");
  initGdNavCounts("[data-gd-nav-links]", { items: demoItems });
  initGdNsfwToggle(document);
  initGdNoticeLed("#previewNoticeLed");
  initGdNap("#napModal", {
    items: [
      {
        image: ASSET_MASCOT + "/1.png",
        title: "\u5440\uFF0C\u88AB\u4F60\u53D1\u73B0\u5566\uFF01",
        content: "\u4F60\u597D\uFF0C\u6211\u662F\u7EB3\u666E\uFF0C\u8FD9\u5EA7\u8D44\u6E90\u4E2D\u67A2\u7684\u5B88\u62A4\u8005\u3002<br><br>\u795D\u4F60\u65C5\u9014\u6109\u5FEB\uFF0C\u613F\u6BCF\u4E00\u6B21\u63A2\u7D22\u90FD\u6709\u65B0\u7684\u6536\u83B7\u3002"
      },
      {
        image: ASSET_MASCOT + "/2.png",
        title: "\u55EF\uFF1F\u600E\u4E48\u5566\uFF0C\u8FF7\u9014\u7684\u65C5\u4EBA\uFF1F",
        content: "\u6240\u6709\u8D44\u6E90\u90FD\u5DF2\u7ECF\u6574\u7406\u597D\uFF0C\u6CBF\u7740\u5BFC\u822A\u6162\u6162\u5BFB\u627E\uFF0C\u5F88\u5FEB\u5C31\u80FD\u62B5\u8FBE\u76EE\u7684\u5730\u3002"
      },
      {
        image: ASSET_MASCOT + "/3.png",
        title: "\u563F\u563F\uFF0C\u5C31\u7B97\u5173\u7CFB\u518D\u597D...",
        content: "\u732B\u8033\u6735\u4E5F\u662F\u4E0D\u80FD\u968F\u4FBF\u6478\u7684\u5566\uFF01"
      }
    ],
    openSelector: "#btnNap"
  });
  var btnToast = document.getElementById("btnToast");
  if (btnToast) {
    btnToast.addEventListener("click", function() {
      showGdToast("\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF08\u6F14\u793A\uFF09");
    });
  }
  bindGdModal("#releaseModal", "#btnRelease");
  var publishGo = document.querySelector("[data-gd-publish-go]");
  if (publishGo) {
    publishGo.addEventListener("click", function() {
      window.location.href = "https://galnavi.top/";
    });
  }
  document.querySelectorAll("[data-gd-demo-inert]").forEach(function(root) {
    root.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  var btnRedirect = document.getElementById("btnRedirect");
  if (btnRedirect) {
    btnRedirect.addEventListener("click", function(e) {
      startGdRedirectCountdown("#redirectModal", 3);
      e.currentTarget.blur();
    });
  }
  var btnSkeleton = document.getElementById("btnSkeleton");
  if (btnSkeleton) {
    btnSkeleton.addEventListener("click", function() {
      var demoGrid = document.getElementById("skeletonGrid");
      if (!demoGrid) return;
      showGdSkeleton(demoGrid, { variant: "detail", count: 3 });
      setTimeout(function() {
        var realItems = [1, 2, 3].map(function(i) {
          return '<div class="gd-section-card"><div class="gd-section-card__header"><span class="gd-section-card__title">\u771F\u5B9E\u6570\u636E ' + i + '</span></div><div class="gd-section-card__links"><span class="gd-section-card__entry"><span class="gd-section-card__label">\u7B2C ' + i + " \u6761\u52A0\u8F7D\u5B8C\u6210</span></span></div></div>";
        }).join("");
        replaceGdSkeleton(demoGrid, '<div class="gd-section-card-grid">' + realItems + "</div>");
      }, 1500);
    });
  }
})();
