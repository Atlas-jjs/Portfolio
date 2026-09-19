(function initProjectCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  const projects = document.querySelectorAll(".project");
  if (projects.length === 0) return;

  // Create a single cursor element as a direct child of <body>.
  // This is critical: mix-blend-mode: difference only inverts
  // content that shares the same stacking context. Nesting the
  // cursor inside .project (which has GSAP transforms/opacity)
  // isolated it and broke the blend.
  const cursor = document.createElement("div");
  cursor.className = "project-cursor";
  cursor.setAttribute("aria-hidden", "true");

  // Rotating text ring + centered Lucide arrow-up-right.
  // White text blends via difference (inverts against backdrop).
  // Black arrow stroke on the white radial-gradient center
  // creates a contrasting cut-through effect.
  cursor.innerHTML = `
          <svg class="project-cursor__ring" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="cursor-ring-path"
                d="M 80 80 m -65,0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0"
                fill="none"/>
            </defs>
            <text fill="#ffffff" font-size="11" font-family="Manrope, sans-serif"
                  font-weight="700" letter-spacing="2">
              <textPath href="#cursor-ring-path">
                VIEW PROJECT &bull; VIEW PROJECT &bull; VIEW PROJECT &bull;
              </textPath>
            </text>
          </svg>
          <svg class="project-cursor__arrow" xmlns="http://www.w3.org/2000/svg"
               width="28" height="28" viewBox="0 0 24 24"
               fill="none" stroke="#000000" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 7h10v10"/>
            <path d="M7 17 17 7"/>
          </svg>
        `;

  document.body.appendChild(cursor);

  // GSAP quickTo for smooth tracking (uses left/top, NOT x/y
  // transforms, because GSAP transforms can add will-change
  // which creates a stacking context and breaks blend-mode).
  const xTo = gsap.quickTo(cursor, "left", {
    duration: 0.15,
    ease: "power2.out",
  });
  const yTo = gsap.quickTo(cursor, "top", {
    duration: 0.15,
    ease: "power2.out",
  });

  let isHovered = false;
  const bodyStyles = getComputedStyle(document.body);
  const defaultBg = bodyStyles.backgroundColor;
  const defaultColor = bodyStyles.color;
  const ctaBtn = document.querySelector(".footer__cta-btn");

  function showCursor(e) {
    isHovered = true;
    const proj = e.currentTarget;
    const color = proj.dataset.color;

    // Jump to position instantly, then animate scale in
    gsap.set(cursor, { left: e.clientX, top: e.clientY });
    gsap.to(cursor, {
      scale: 1,
      visibility: "visible",
      duration: 0.3,
      ease: "back.out(1.7)",
      overwrite: "auto",
    });

    // Transition body background to the project's theme color
    if (color) {
      document.body.style.backgroundColor = color;
    }

    // Switch text to white and CTA button to light for dark-themed projects
    if ("textLight" in proj.dataset) {
      document.body.style.color = "var(--color-primary-white)";
      if (ctaBtn) {
        ctaBtn.classList.remove("dark");
        ctaBtn.classList.add("light");
      }
    }
  }

  function moveCursor(e) {
    if (!isHovered) return;
    xTo(e.clientX);
    yTo(e.clientY);
  }

  function hideCursor() {
    isHovered = false;
    gsap.to(cursor, {
      scale: 0,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => gsap.set(cursor, { visibility: "hidden" }),
    });

    // Revert body background, text color, and CTA button to defaults
    document.body.style.backgroundColor = defaultBg;
    document.body.style.color = defaultColor;
    if (ctaBtn) {
      ctaBtn.classList.remove("light");
      ctaBtn.classList.add("dark");
    }
  }

  projects.forEach((proj) => {
    proj.addEventListener("mouseenter", showCursor);
    proj.addEventListener("mousemove", moveCursor);
    proj.addEventListener("mouseleave", hideCursor);
  });
})();
