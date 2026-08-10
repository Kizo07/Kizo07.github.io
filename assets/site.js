(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");
  var filterButtons = document.querySelectorAll("[data-filter]");
  var projectCards = document.querySelectorAll("[data-project]");

  /* ---- Tearsheet iframe theme injection (quantstats pages) ---- */
  var tearsheetThemeCss = `
    :root[data-parent-theme="light"] {
      --ts-bg: #f6f4ef;
      --ts-panel: #ffffff;
      --ts-text: #171d26;
      --ts-muted: #556070;
      --ts-line: rgba(24, 30, 40, 0.22);
      --ts-grid: rgba(24, 30, 40, 0.1);
      --ts-accent: #a4701f;
    }

    :root[data-parent-theme="dark"] {
      --ts-bg: #0a0d12;
      --ts-panel: #10151d;
      --ts-text: #e7eaf0;
      --ts-muted: #9aa4b2;
      --ts-line: rgba(148, 163, 184, 0.28);
      --ts-grid: rgba(148, 163, 184, 0.12);
      --ts-accent: #d9a54e;
    }

    html[data-parent-theme],
    html[data-parent-theme] body {
      background: var(--ts-bg) !important;
      color: var(--ts-text) !important;
    }

    html[data-parent-theme] body,
    html[data-parent-theme] p,
    html[data-parent-theme] table,
    html[data-parent-theme] td,
    html[data-parent-theme] th {
      color: var(--ts-text) !important;
    }

    html[data-parent-theme] h1,
    html[data-parent-theme] h2,
    html[data-parent-theme] h3 {
      color: var(--ts-text) !important;
    }

    html[data-parent-theme] h4,
    html[data-parent-theme] small {
      color: var(--ts-muted) !important;
    }

    html[data-parent-theme] a {
      color: var(--ts-accent) !important;
    }

    html[data-parent-theme] hr {
      border-top-color: var(--ts-line) !important;
    }

    html[data-parent-theme] table thead th {
      background: var(--ts-panel) !important;
      color: var(--ts-text) !important;
    }

    html[data-parent-theme] table td,
    html[data-parent-theme] table th {
      border-color: var(--ts-line) !important;
    }

    html[data-parent-theme] svg {
      background: var(--ts-bg) !important;
    }

    html[data-parent-theme="dark"] svg [style*="fill: #ffffff"],
    html[data-parent-theme="dark"] svg [style*="fill:#ffffff"] {
      fill: var(--ts-panel) !important;
    }

    html[data-parent-theme="dark"] svg [style*="fill: #666666"],
    html[data-parent-theme="dark"] svg [style*="fill:#666666"],
    html[data-parent-theme="dark"] svg [style*="fill: #333333"],
    html[data-parent-theme="dark"] svg [style*="fill:#333333"],
    html[data-parent-theme="dark"] svg [style*="fill: #262626"],
    html[data-parent-theme="dark"] svg [style*="fill:#262626"],
    html[data-parent-theme="dark"] svg [style*="fill: #000000"],
    html[data-parent-theme="dark"] svg [style*="fill:#000000"],
    html[data-parent-theme="dark"] svg [style*="fill: #808080"],
    html[data-parent-theme="dark"] svg [style*="fill:#808080"],
    html[data-parent-theme="dark"] svg text {
      fill: var(--ts-text) !important;
    }

    html[data-parent-theme="dark"] svg g[id^="text_"],
    html[data-parent-theme="dark"] svg g[id^="text_"] use {
      fill: var(--ts-text) !important;
      color: var(--ts-text) !important;
    }

    html[data-parent-theme="dark"] svg [style*="stroke: #dddddd"],
    html[data-parent-theme="dark"] svg [style*="stroke:#dddddd"] {
      stroke: var(--ts-grid) !important;
    }

    html[data-parent-theme="dark"] svg [style*="stroke: #808080"],
    html[data-parent-theme="dark"] svg [style*="stroke:#808080"],
    html[data-parent-theme="dark"] svg [style*="stroke: #494949"],
    html[data-parent-theme="dark"] svg [style*="stroke:#494949"],
    html[data-parent-theme="dark"] svg [style*="stroke: #cccccc"],
    html[data-parent-theme="dark"] svg [style*="stroke:#cccccc"] {
      stroke: var(--ts-line) !important;
    }

    html[data-parent-theme="dark"] svg [style*="stroke: #000000"],
    html[data-parent-theme="dark"] svg [style*="stroke:#000000"] {
      stroke: var(--ts-text) !important;
    }
  `;

  function preferredTheme() {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return "dark";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      toggle.setAttribute(
        "title",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    applyTearsheetTheme(theme);
  }

  function injectTearsheetTheme(frame, theme) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.documentElement || !doc.head) {
        return;
      }
      doc.documentElement.setAttribute("data-parent-theme", theme);
      var style = doc.getElementById("portfolio-tearsheet-theme");
      if (!style) {
        style = doc.createElement("style");
        style.id = "portfolio-tearsheet-theme";
        style.textContent = tearsheetThemeCss;
        doc.head.appendChild(style);
      }
      recolorTearsheetSvgText(doc, theme);
    } catch (error) {
      frame.classList.add("tearsheet-theme-unavailable");
    }
  }

  function recolorTearsheetSvgText(doc, theme) {
    var textColor = theme === "dark" ? "#e7eaf0" : "#171d26";
    var mutedColor = theme === "dark" ? "#9aa4b2" : "#556070";
    var gridColor = theme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(24,30,40,0.1)";
    var panelColor = theme === "dark" ? "#10151d" : "#ffffff";

    doc.querySelectorAll('svg g[id^="text_"], svg g[id^="text_"] use').forEach(function (node) {
      node.style.fill = textColor;
      node.style.color = textColor;
      node.setAttribute("fill", textColor);
    });

    doc.querySelectorAll('svg [style*="fill: #666666"], svg [style*="fill:#666666"], svg [style*="fill: #808080"], svg [style*="fill:#808080"]').forEach(function (node) {
      node.style.fill = mutedColor;
      node.style.color = mutedColor;
      node.setAttribute("fill", mutedColor);
    });

    doc.querySelectorAll('svg [style*="stroke: #dddddd"], svg [style*="stroke:#dddddd"], svg [style*="stroke: #494949"], svg [style*="stroke:#494949"]').forEach(function (node) {
      node.style.stroke = gridColor;
      node.setAttribute("stroke", gridColor);
    });

    doc.querySelectorAll('svg [style*="fill: #ffffff"], svg [style*="fill:#ffffff"]').forEach(function (node) {
      node.style.fill = panelColor;
      node.setAttribute("fill", panelColor);
    });
  }

  function applyTearsheetTheme(theme) {
    document.querySelectorAll(".tearsheet-frame").forEach(function (frame) {
      if (!frame.dataset.themeBound) {
        frame.dataset.themeBound = "true";
        frame.addEventListener("load", function () {
          injectTearsheetTheme(frame, root.getAttribute("data-theme") || preferredTheme());
        });
      }
      injectTearsheetTheme(frame, theme);
    });
  }

  setTheme(preferredTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---- Mobile nav ---- */
  if (navToggle && nav) {
    if (!nav.id) {
      nav.id = "site-nav";
    }
    navToggle.setAttribute("aria-controls", nav.id);
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Project filters ---- */
  filterButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      filterButtons.forEach(function (item) {
        var isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      projectCards.forEach(function (card) {
        var tags = (card.getAttribute("data-project") || "").split(/\s+/);
        var visible = filter === "all" || tags.indexOf(filter) !== -1;
        card.hidden = !visible;
      });
    });
  });

  /* ---- Ticker: duplicate track content for a seamless loop.
     The ticker container is aria-hidden in markup (decorative),
     so the duplicated half never reaches screen readers. ---- */
  var tickerTrack = document.querySelector("[data-ticker-track]");
  if (tickerTrack) {
    tickerTrack.innerHTML += tickerTrack.innerHTML;
  }

  /* ---- Scroll reveal ---- */
  var revealTargets = document.querySelectorAll(".reveal");
  if (revealTargets.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---- Footer year ---- */
  var yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
})();
