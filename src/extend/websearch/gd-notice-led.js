/**
 * gd-notice-led — 顶栏通知跑马灯。
 * 复制文案填满两倍宽度后，按约 48px/s 写入 --gd-notice-led-duration，循环次数 infinite。
 */
export function initGdNoticeLed(root) {
  const led = typeof root === "string" ? document.querySelector(root) : (root || document.querySelector(".gd-notice-led"));
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
