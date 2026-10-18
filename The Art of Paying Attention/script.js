const glow = document.querySelector(".cursor-glow");
if (glow) {
  window.addEventListener("pointermove", (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const orbOne = document.querySelector(".orb-one"),
  orbTwo = document.querySelector(".orb-two");
if ((orbOne || orbTwo) && !prefersReducedMotion) {
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (orbOne) orbOne.style.transform = `translateY(${y * 0.18}px)`;
      if (orbTwo) orbTwo.style.transform = `translateY(${y * -0.12}px)`;
    },
    { passive: true },
  );
}
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal,.reveal-card").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 70, 250)}ms`;
  observer.observe(el);
});
document.querySelectorAll(".quote-tile").forEach((tile) => {
  tile.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    tile.classList.toggle("open");
  });
  tile.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tile.classList.toggle("open");
    }
  });
});

const form = document.querySelector(".signup-form"),
  message = document.querySelector(".form-message");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = new FormData(form).get("email");
    message.textContent = `Lovely. We'll write to ${email} on Sunday.`;
    form.reset();
  });
}
/* =====================================================
   BLOG CATEGORY THREADS
   ("Follow a thread" cards on blog.html — filters the
   story grid by category and updates counts live.)
===================================================== */

const threadCards = document.querySelectorAll(".thread-card");
const storyCards = document.querySelectorAll("#stories .card[data-category]");
const threadStatus = document.querySelector(".thread-status");

if (threadCards.length && storyCards.length) {
  const categoryLabels = {
    "field-notes": "Field notes",
    "wandering": "Wandering",
    "slow-living": "Slow living",
    "far-away": "Far away",
  };

  // Count how many posts belong to each category and show it on the card.
  threadCards.forEach((card) => {
    const cat = card.dataset.thread;
    const count = Array.from(storyCards).filter((story) =>
      story.dataset.category.split(",").includes(cat),
    ).length;
    const countEl = card.querySelector(".thread-count");
    if (countEl) countEl.textContent = count;
  });

  const applyFilter = (cat) => {
    if (!cat) {
      storyCards.forEach((story) => story.removeAttribute("hidden"));
      threadCards.forEach((card) => card.classList.remove("active-thread"));
      if (threadStatus) threadStatus.innerHTML = "";
      return;
    }

    let shown = 0;
    storyCards.forEach((story) => {
      const match = story.dataset.category.split(",").includes(cat);
      story.toggleAttribute("hidden", !match);
      if (match) shown += 1;
    });

    threadCards.forEach((card) =>
      card.classList.toggle("active-thread", card.dataset.thread === cat),
    );

    if (threadStatus) {
      const label = categoryLabels[cat] || cat;
      threadStatus.innerHTML =
        shown > 0
          ? `Showing ${shown} ${shown === 1 ? "story" : "stories"} tagged “${label}.” <a data-clear-thread>Show all →</a>`
          : `No stories tagged “${label}” yet — check back soon. <a data-clear-thread>Show all →</a>`;
    }
  };

  threadCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = card.dataset.thread;
      history.replaceState(null, "", `#cat=${cat}`);
      applyFilter(cat);
      document
        .getElementById("stories")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (threadStatus) {
    threadStatus.addEventListener("click", (e) => {
      if (e.target.matches("[data-clear-thread]")) {
        history.replaceState(null, "", location.pathname);
        applyFilter(null);
      }
    });
  }

  const hashMatch = location.hash.match(/^#cat=([\w-]+)/);
  if (hashMatch) applyFilter(hashMatch[1]);
}

const contactForm = document.querySelector(".contact-form"),
  contactMessage = document.querySelector(".contact-message");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = new FormData(contactForm).get("name");
    contactMessage.textContent = `Thanks, ${name}. I'll get back to you soon.`;
    contactForm.reset();
  });
}

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const setScrolled = () =>
    siteHeader.classList.toggle("scrolled", window.scrollY > 12);
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });
}

const menuToggle = document.querySelector(".menu-toggle"),
  siteNav = document.querySelector("nav");
if (menuToggle && siteNav) {
  const setNavOpen = (isOpen) => {
    siteNav.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.classList.toggle("nav-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    setNavOpen(!siteNav.classList.contains("open"));
  });

  // Close the mobile menu after tapping a nav link (skip the dropdown
  // trigger itself, since that opens the Quotes submenu instead).
  siteNav.querySelectorAll("a").forEach((link) => {
    if (link.classList.contains("dropdown-trigger")) return;
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("open")) {
      setNavOpen(false);
    }
  });
}



/* =====================================================
   NAVIGATION DROPDOWN
===================================================== */

const navDropdown = document.querySelector(".nav-dropdown");

if (navDropdown) {
    const trigger = navDropdown.querySelector(".dropdown-trigger");

    // Mobile click support (tablet range only — on phones the dropdown
    // is always expanded inline via CSS, so "Quotes" should navigate
    // normally instead of being intercepted).
    trigger.addEventListener("click", (e) => {

        if (window.innerWidth > 720 && window.innerWidth <= 992) {

            e.preventDefault();

            navDropdown.classList.toggle("open");

        }

    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {

        if (!navDropdown.contains(e.target)) {

            navDropdown.classList.remove("open");

        }

    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            navDropdown.classList.remove("open");

        }

    });

    // Reset when resizing to desktop
    window.addEventListener("resize", () => {

        if (window.innerWidth > 992) {

            navDropdown.classList.remove("open");

        }

    });

}

if (typeof startMusic === "function") {
  window.addEventListener('scroll', startMusic, { once: true });
  window.addEventListener('click', startMusic, { once: true });
}