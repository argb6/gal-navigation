/**
 * gd-layout — 视口高度锁定。
 * 浏览器缩放后把 --gd-vvh 写成当前可视高度，配合 .gd-page / .gd-footer 把页脚贴在底部。
 * 用法：initGdStickyViewport();
 */
export function initGdStickyViewport() {
  function apply() {
    var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    document.documentElement.style.setProperty("--gd-vvh", h + "px");
  }
  apply();
  window.addEventListener("resize", apply);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", apply);
  return { update: apply };
}
