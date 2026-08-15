/** 本页内容 TOC：滚动高亮 + 手机端汉堡竖列索引 */
export function initGdOverviewToc(root = document) {
  const nav = typeof root === "string" ? document.querySelector(root) : root;
  const mobile = document.querySelector("[data-gd-mobile-toc]");
  const desktopLinks = nav
    ? [...nav.querySelectorAll(".gd-otp__link[href^='#']")]
    : [];
  const mobileLinks = mobile
    ? [...mobile.querySelectorAll(".gd-overview-mobile-list__link[href^='#']")]
    : [];
  const links = [...desktopLinks, ...mobileLinks];
  if (!links.length && !mobile) return;

  const sectionIds = [
    ...new Set(
      links
        .map((a) => a.getAttribute("href")?.slice(1))
        .filter(Boolean)
    ),
  ];
  const sections = sectionIds
    .map((id) => {
      const el = document.getElementById(id);
      return el ? { id, el } : null;
    })
    .filter(Boolean);

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
    // 触底时（页脚等矮 section 顶部到不了 marker 线）强制高亮最后一个
    const last = sections[sections.length - 1].el;
    if (last.getBoundingClientRect().bottom <= window.innerHeight + 1) {
      current = sections[sections.length - 1].id;
    }
    setActive(current);
  };

  window.addEventListener("scroll", syncActive, { passive: true });
  window.addEventListener("resize", syncActive, { passive: true });
  // 等布局稳定后再算一次（避免 offset 未就绪）
  requestAnimationFrame(syncActive);
  setTimeout(syncActive, 100);

  if (!mobile) return;

  const btn = mobile.querySelector("[data-gd-mobile-toc-toggle]");
  const panel = mobile.querySelector("[data-gd-mobile-toc-panel]");
  if (!btn || !panel) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "关闭本页索引" : "打开本页索引");
    panel.setAttribute("aria-hidden", String(!open));

    if (open) {
      panel.removeAttribute("hidden");
      // 下一帧再开，保证 opacity/transform 动效能播
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
