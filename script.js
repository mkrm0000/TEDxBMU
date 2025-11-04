document.addEventListener("DOMContentLoaded", () => {
  // ===== Letter Animation =====
  const letters = document.querySelectorAll(".tedx span, .BMU span");
  letters.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.08}s`;
  });

  const loader = document.getElementById("loader");
  const main = document.getElementById("main-content");
  const progress = document.querySelector(".progress");
  const loadingText = document.getElementById("loading-text");

  // ===== Real Progress Preload =====
  const images = Array.from(document.images);
  const total = images.length;
  let loaded = 0;
  let finished = false;

  function updateProgress() {
    const percent = Math.round((loaded / total) * 100);
    if (progress) progress.style.width = `${percent}%`;
    if (loadingText) loadingText.textContent = `Loading assets... ${percent}%`;
  }

  function finishLoading() {
    if (finished) return;
    finished = true;

    if (progress) progress.style.width = "100%";
    if (loadingText) loadingText.textContent = "Ready!";

    setTimeout(() => {
      loader.classList.add("fade-out");
      setTimeout(() => {
        loader.style.display = "none";
        document.body.classList.add("loaded");
      }, 550);
    }, 400);
  }

  // If no images, skip straight to main
  if (total === 0) finishLoading();

  // Safety timeout — always show page after 5 s
  const timeout = setTimeout(() => {
    console.warn("Preloader timeout after 5 s");
    finishLoading();
  }, 5000);

  // Start preloading each image
  images.forEach((img) => {
    const temp = new Image();
    temp.onload = temp.onerror = () => {
      loaded++;
      updateProgress();
      if (loaded >= total) {
        clearTimeout(timeout);
        finishLoading();
      }
    };
    temp.src = img.src;
  });

  // ===== Mobile Menu Logic =====
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeMenu = document.getElementById("close-menu");
  const overlay = document.getElementById("mobile-overlay");

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("translate-x-full");
    mobileMenu.classList.add("translate-x-0");
    if (overlay) overlay.classList.remove("hidden");
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("translate-x-0");
    mobileMenu.classList.add("translate-x-full");
    if (overlay) overlay.classList.add("hidden");
  }

  if (menuBtn) menuBtn.addEventListener("click", openMobileMenu);
  if (closeMenu) closeMenu.addEventListener("click", closeMobileMenu);
  if (overlay) overlay.addEventListener("click", closeMobileMenu);

  document.querySelectorAll("#mobile-menu a").forEach((a) => {
    a.addEventListener("click", closeMobileMenu);
  });

  // ===== Reveal on Scroll =====
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => {
      el.classList.add(
        "opacity-0",
        "translate-y-6",
        "transition",
        "duration-700"
      );
      io.observe(el);
    });
  }
});
