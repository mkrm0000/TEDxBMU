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
    const percent = total ? Math.round((loaded / total) * 100) : 100;
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

  if (total === 0) finishLoading();

  // Safety timeout — always show page after 5 s
  const timeout = setTimeout(() => {
    console.warn("Preloader timeout after 5 s");
    finishLoading();
  }, 5000);

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

  // ===== Active Navbar Link Highlight (desktop + mobile), exclude logo =====
  // Select anchors that link to page sections (href starts with "#") in both nav and mobile menu.
  // Exclude logo anchor by filtering anchors that contain a child with class 'tedx' or that have class 'logo-link'.
  const allNavAnchors = Array.from(
    document.querySelectorAll('nav a[href^="#"], #mobile-menu a[href^="#"]')
  );

  const navLinks = allNavAnchors.filter((a) => {
    // Exclude logo by any of:
    // - anchor has class "logo-link" (you can add this in HTML to be explicit), OR
    // - anchor contains an element with class "tedx" (your logo markup), OR
    // - anchor contains an element with class "bmu" (defensive)
    if (a.classList.contains("logo-link")) return false;
    if (a.querySelector(".tedx")) return false;
    if (a.querySelector(".bmu")) return false;
    return true;
  });

  const sections = Array.from(document.querySelectorAll("section[id]"));

  function updateActiveLink() {
    const offset = 50; // tweak if your navbar height differs
    const scrollY = window.pageYOffset + offset;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      const isActive = scrollY >= top && scrollY < top + height;

      navLinks.forEach((link) => {
        // match links by their href (#about, #speakers, ...)
        const href = link.getAttribute("href");
        if (!href) return;
        if (href === `#${id}`) {
          // apply active classes when in view, remove otherwise
          if (isActive) {
            link.classList.add("text-red-500", "font-semibold");
            link.classList.remove("text-white", "text-gray-300");
          } else {
            link.classList.remove("text-red-500", "font-semibold");
            // restore default neutral color (choose one you use)
            link.classList.add("text-white/80");
          }
        }
      });
    });
  }

  // On load + on scroll
  window.addEventListener("scroll", updateActiveLink);
  // Run once to set initial state
setTimeout(updateActiveLink, 200);  // give layout time to settle
window.dispatchEvent(new Event("scroll"));  // force proper color refresh

  updateActiveLink();

  // Also update active state on click (smooth scroll scenario)
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Let default hash navigation happen, but update active link shortly after.
      // Optionally, implement smooth scroll instead of default jump:
      // e.preventDefault();
      // document.querySelector(link.getAttribute('href')).scrollIntoView({behavior: 'smooth', block: 'start'});
      setTimeout(updateActiveLink, 100);
    });
  });

// ===== Speaker "Read More" Dropdown (smooth expand/collapse) =====
const speakerParas = document.querySelectorAll("#speakers p[data-full-text]");

speakerParas.forEach((para) => {
  const fullText = (para.dataset.fullText || "").trim();
  const shortText = fullText.length > 220 ? fullText.slice(0, 220) + "..." : fullText;

  // Start with short text if truncated
  const isTruncated = fullText.length > 220;
  para.textContent = isTruncated ? shortText : fullText;

  // Set initial styles for animation
  para.style.overflow = "hidden";
  para.style.transition = "max-height 0.5s ease, opacity 0.5s ease";
  para.style.maxHeight = isTruncated ? "6rem" : "none"; // ~24px * 4 lines

  if (isTruncated) {
    const btn = document.createElement("button");
    btn.className = "read-more text-red-500 text-sm mt-2 hover:underline focus:outline-none";
    btn.textContent = "Read more";
    btn.dataset.expanded = "false";
    para.insertAdjacentElement("afterend", btn);

    btn.addEventListener("click", () => {
      const expanded = btn.dataset.expanded === "true";
      if (expanded) {
        // Collapse
        para.style.maxHeight = "6rem";
        para.style.opacity = "0.8";
        setTimeout(() => {
          para.textContent = shortText;
          para.style.opacity = "1";
        }, 250);
        btn.textContent = "Read more";
        btn.dataset.expanded = "false";
      } else {
        // Expand
        para.textContent = fullText;
        para.style.opacity = "0.8";
        requestAnimationFrame(() => {
          para.style.maxHeight = para.scrollHeight + "px";
          para.style.opacity = "1";
        });
        btn.textContent = "Read less";
        btn.dataset.expanded = "true";
      }
    });
  }
});

});
