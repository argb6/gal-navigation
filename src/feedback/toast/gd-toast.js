let timer = null;

export function showGdToast(message, ms = 2200) {
  // 避开展示页里的 .gd-toast.is-demo 静态预览
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
