/**
 * gd-detail — 浏览器 Ctrl+/- 缩小时，正文栏反向放大，避免 1100px 锁宽缩成一团。
 *
 * Chrome Ctrl+/- 改的是布局视口 CSS 像素（visualViewport.scale 仍为 1，见 MDN Viewport concepts）。
 * 用 innerWidth / outerWidth（及 screen.availWidth）判断缩小：比值 > 1 就把整栏 zoom 上去。
 * 放大页面不反向缩小，方便把字看大（WCAG 1.4.4）。页脚不参与 zoom，继续贴视口底。
 *
 * 用法：initGdInverseZoom();
 */
import { initGdStickyViewport } from "../../foundation/layout/gd-layout.js";

var DESIGN_WIDTH = 1100;

function getZoomOutScale() {
  var inner = document.documentElement.clientWidth || window.innerWidth || 1;
  var outer = window.outerWidth || 0;
  var screenW = (window.screen && (window.screen.availWidth || window.screen.width)) || 0;
  var rOuter = 0;
  if (outer >= 480) {
    var cand = inner / outer;
    if (cand > 0 && cand <= 4.2) rOuter = cand;
  }
  var rScreen = screenW > 0 ? inner / screenW : 0;
  var pageZoomOut = Math.max(rOuter, rScreen);
  if (!(pageZoomOut > 1.08)) return 1;
  var shell = document.querySelector(".gd-detail__container");
  var avail = (shell && shell.clientWidth) || inner;
  var fill = avail / DESIGN_WIDTH;
  var inv = Math.min(pageZoomOut, Math.max(fill, 1), 4);
  if (!isFinite(inv) || inv < 1) return 1;
  return Math.round(inv * 1000) / 1000;
}

export function initGdInverseZoom() {
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
