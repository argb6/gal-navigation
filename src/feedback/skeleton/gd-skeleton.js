/**
 * gd-skeleton — 骨架屏行为：加载期渲染占位，数据到达后替换为真实内容。
 * 占位数量固定（默认 4），最终渲染以真实数据为准，不影响数据结果。
 * 用法：
 *   showGdSkeleton(container, { variant: "detail", count: 4 });
 *   // …fetch 数据后…
 *   replaceGdSkeleton(container, realHtml);   // 或直接 innerHTML = realHtml
 */

const CARD_SKELETON = `
  <div class="gd-skeleton__card">
    <div class="gd-skeleton__block gd-skeleton__card-line"></div>
    <div class="gd-skeleton__block gd-skeleton__card-line gd-skeleton__card-line--sm"></div>
  </div>`;

const VARIANT_TEMPLATES = {
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
  hero: () => `<div class="gd-skeleton gd-skeleton--hero" aria-hidden="true"></div>`,
};

export function showGdSkeleton(container, { variant = "detail", count = 3 } = {}) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) return;
  const tpl = VARIANT_TEMPLATES[variant] || VARIANT_TEMPLATES.detail;
  el.innerHTML = tpl(count);
}

export function replaceGdSkeleton(container, realHtml) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) return;
  el.innerHTML = realHtml;
}
