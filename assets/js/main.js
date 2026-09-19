function updateClock() {
  const now = new Date();

  // Formats the time as "8:33 PM"
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Formats the timezone as "GMT+8"
  const tzString = now
    .toLocaleDateString("en-US", {
      timeZoneName: "shortOffset",
    })
    .split(", ")[1]; // Extracts just the "GMT+8" part

  document.getElementById("header-clock").textContent =
    `${timeString} ${tzString}`;
}

// Updates the clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// * Text Reveal Page Headers
function initTextAnimations() {
  const allAnimatedHeadings = document.querySelectorAll(
    ".hero__heading .heading, .hero__heading h1, h1.hero__heading, #title.heading, .section__heading",
  );

  if (typeof gsap === "undefined" || typeof SplitText === "undefined") {
    allAnimatedHeadings.forEach((el) => (el.style.visibility = "visible"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Check user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    allAnimatedHeadings.forEach((el) => (el.style.visibility = "visible"));
    return;
  }

  // Hero Heading Reveal on Page Load (domino / stagger effect from bottom)
  const heroHeadings = document.querySelectorAll(
    ".hero__heading .heading, .hero__heading h1, h1.hero__heading, #title.heading",
  );

  heroHeadings.forEach((heading) => {
    const split = new SplitText(heading, {
      type: "words,chars",
      charsClass: "split-char",
    });

    gsap.set(heading, { visibility: "visible" });

    gsap.from(split.chars, {
      y: 30,
      autoAlpha: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.05, // Domino / cascading effect
      delay: 0.15,
      clearProps: "transform,opacity",
    });
  });

  // Refresh ScrollTrigger calculations after text splitting
  ScrollTrigger.refresh();
}

// Ensure custom fonts are loaded before SplitText calculates text geometry
let animationsInitialized = false;
function triggerInit() {
  if (!animationsInitialized) {
    animationsInitialized = true;
    initTextAnimations();
  }
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(triggerInit);
  // Fallback in case font loading takes longer
  setTimeout(triggerInit, 500);
} else {
  window.addEventListener("DOMContentLoaded", triggerInit);
}
