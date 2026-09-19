// * Force webpage to be on the very top every refresh
(function resetScrollOnReload() {
  const nav = performance.getEntriesByType("navigation")[0];
  if (!nav || nav.type !== "reload") return;

  if (window.ScrollTrigger) ScrollTrigger.clearScrollMemory("manual");
  else if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  window.scrollTo(0, 0);
})();

// * Clock on the header
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

/* * ==========================================================================
   GSAP Page Reveal (header + hero on load, everything else on scroll)
   ========================================================================== */

// base.css hides these three until the initial states below are in place.
// If anything fails, showPage() (or the CSS failsafe) makes the page visible.
const PAGE_SHELL = ".header, .main, .footer";

function showPage() {
  document
    .querySelectorAll(PAGE_SHELL)
    .forEach((el) => (el.style.visibility = "visible"));
}

// Runs the callback once images have loaded so scroll positions are final
// (or after maxWait ms, whichever comes first).
function afterPageLoad(callback, maxWait = 3000) {
  let called = false;
  const run = () => {
    if (!called) {
      called = true;
      callback();
    }
  };
  if (document.readyState === "complete") return run();
  window.addEventListener("load", run, { once: true });
  setTimeout(run, maxWait);
}

function initPageReveal() {
  // Some selectors below only exist on certain pages; don't warn about them.
  gsap.config({ nullTargetWarn: false });

  const SHOW = {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: "power3.out",
    clearProps: "transform,opacity", // hand hover transforms/opacity back to CSS
  };

  // Header content and the hero (except the h1, which SplitText handles)
  const headerItems = ".header__details, .header__link";
  const loadItems = '.hero .tag, .hero__thumbnail, [data-reveal="load"]';

  // Everything else reveals as it scrolls into view, footer included.
  // Add your other pages' classes here, or put data-reveal="scroll" on any element.
  const scrollItems = [
    ".overview__line",
    ".overview__group",
    ".overview__video",
    ".copy > *",
    ".highlight__image",
    ".feature__thumbnail",
    ".more-projects__header",
    ".more-projects .project",
    ".footer__cta-container",
    ".footer__footnotes",
    '[data-reveal="scroll"]',
  ].join(",");

  // 1. Set the hidden starting states first, THEN show the page (no flash)
  gsap.set(headerItems, { autoAlpha: 0, y: -20 });
  gsap.set(loadItems, { autoAlpha: 0, y: 30 });
  gsap.set(scrollItems, { autoAlpha: 0, y: 30 });
  showPage();

  // 2. On load: header first, then the hero content
  gsap
    .timeline({ delay: 0.1 })
    .to(headerItems, { ...SHOW, stagger: 0.08 })
    .to(".hero .tag", { ...SHOW, stagger: 0.1 }, 0.5)
    .to(".hero__thumbnail", { ...SHOW, duration: 1.1 }, 0.7)
    .to('[data-reveal="load"]', { ...SHOW, stagger: 0.1 }, 0.7);

  // 3. Scroll: items entering together are staggered as a batch
  afterPageLoad(() => {
    ScrollTrigger.batch(scrollItems, {
      start: "clamp(top 92%)",
      once: true,
      onEnter: (batch) => gsap.to(batch, { ...SHOW, stagger: 0.1 }),
    });
    ScrollTrigger.refresh();
  });
}

/* * ==========================================================================
   GSAP Text Reveal Animations (SplitText & ScrollTrigger)
   ========================================================================== */

function initTextAnimations() {
  const allAnimatedHeadings = document.querySelectorAll(
    ".hero__heading .heading, .hero__heading h1, h1.hero__heading, #title.heading, .section__heading",
  );

  if (
    typeof gsap === "undefined" ||
    typeof SplitText === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    allAnimatedHeadings.forEach((el) => (el.style.visibility = "visible"));
    showPage();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Check user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    allAnimatedHeadings.forEach((el) => (el.style.visibility = "visible"));
    showPage();
    return;
  }

  // 1. Hero Heading Reveal on Page Load (domino / stagger effect from bottom)
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

  // 2. Reveal the rest of the page (header, hero content, scroll sections, footer)
  initPageReveal();

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
