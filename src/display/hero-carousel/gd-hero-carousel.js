export function initGdHero(root) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const slides = [...el.querySelectorAll(".gd-hero__slide")];
  const dots = [...el.querySelectorAll(".gd-hero__dot")];
  if (!slides.length) return;
  let i = slides.findIndex((s) => s.classList.contains("is-active"));
  if (i < 0) i = 0;
  let timer;

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
  function next() { go(i + 1); }
  function prev() { go(i - 1); }
  function arm() {
    clearInterval(timer);
    timer = setInterval(next, 4500);
  }

  el.querySelector(".gd-hero__arrow--next")?.addEventListener("click", () => { next(); arm(); });
  el.querySelector(".gd-hero__arrow--prev")?.addEventListener("click", () => { prev(); arm(); });
  dots.forEach((d, idx) => d.addEventListener("click", () => { go(idx); arm(); }));
  go(i);
  arm();
}
