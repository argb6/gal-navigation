const stack = [];
let inertApplied = false;

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

export function openGdModal(overlay, { returnFocus } = {}) {
  const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
  if (!el) return;
  const trigger = returnFocus || document.activeElement;
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  applyBackgroundInert();
  stack.push({ el, trigger });
  const focusTarget = el.querySelector("[data-gd-autofocus], button, .gd-button, .gd-link, .gd-icon-button");
  focusTarget?.focus();
}

export function closeGdModal(overlay) {
  const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
  if (!el) return;
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
  const idx = stack.findIndex((s) => s.el === el);
  if (idx >= 0) {
    const { trigger } = stack.splice(idx, 1)[0];
    trigger?.focus?.();
  }
  if (!stack.length) {
    document.body.style.overflow = "";
    removeBackgroundInert();
  }
}

export function bindGdModal(overlaySelector, openBtnSelector) {
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

/** 永久发布页：复制域名按钮 */
function announceCopy(text) {
  let region = document.querySelector("[data-gd-copy-status]");
  if (!region) {
    region = document.createElement("div");
    region.dataset.gdCopyStatus = "";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;";
    document.body.appendChild(region);
  }
  region.textContent = `已复制 ${text}`;
}

export function bindGdReleaseCopy(root, { onCopied } = {}) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  el.querySelectorAll("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy-url") || "/";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.classList.add("is-copied");
      const prev = btn.textContent;
      btn.textContent = "已复制";
      announceCopy(text);
      onCopied?.(text);
      setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.textContent = prev || "复制";
      }, 1600);
    });
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

/** redirect countdown display only — jump is host's job */
export function startGdRedirectCountdown(overlay, seconds = 3, onDone) {
  const el = typeof overlay === "string" ? document.querySelector(overlay) : overlay;
  if (!el) return () => {};
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
      onDone?.();
    }
  }, 1000);
  const cancel = el.querySelector("[data-gd-close]");
  const onCancel = () => {
    clearInterval(id);
    closeGdModal(el);
  };
  cancel?.addEventListener("click", onCancel, { once: true });
  return () => clearInterval(id);
}

class GdModal extends HTMLElement {
  connectedCallback() {
    bindModalControls(this);
  }
}
if (!customElements.get("gd-modal")) customElements.define("gd-modal", GdModal);
