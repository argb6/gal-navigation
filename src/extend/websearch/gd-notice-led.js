/**
 * gd-notice-led — 顶栏通知跑马灯。
 * 先铺满一屏，再复制一整段。位移用 --gd-notice-led-shift（像素），
 * 时长用 --gd-notice-led-duration，按约 48px/s，循环次数 infinite。
 */
export function initGdNoticeLed(root) {
  const led = typeof root === "string" ? document.querySelector(root) : (root || document.querySelector(".gd-notice-led"));
  const track = led && led.querySelector(".gd-notice-led__track");
  if (!led || !track) return;
  const first = track.querySelector(".gd-notice-led__item");
  const html = first ? first.innerHTML : "";

  function mute(node) {
    node.setAttribute("aria-hidden", "true");
    node.querySelectorAll("a").forEach((a) => { a.tabIndex = -1; });
  }

  function fillLed() {
    if (!html) return;
    track.style.animation = "none";
    track.style.transform = "none";
    track.innerHTML = "";
    const nodes = [];
    let guard = 0;
    do {
      const s = document.createElement("span");
      s.className = "gd-notice-led__item";
      s.innerHTML = html;
      if (nodes.length) mute(s);
      track.appendChild(s);
      nodes.push(s);
      guard += 1;
    } while (track.scrollWidth < led.clientWidth && guard < 8);
    const clones = nodes.map((node) => {
      const clone = node.cloneNode(true);
      mute(clone);
      track.appendChild(clone);
      return clone;
    });
    let shift = Math.round(clones[0].getBoundingClientRect().left - nodes[0].getBoundingClientRect().left);
    if (shift < 1) shift = Math.round(track.scrollWidth / 2);
    track.style.setProperty("--gd-notice-led-shift", (-shift) + "px");
    track.style.setProperty("--gd-notice-led-duration", (shift / 48) + "s");
    track.style.animation = "";
    track.style.transform = "";
  }

  fillLed();
  window.addEventListener("resize", fillLed);
}
