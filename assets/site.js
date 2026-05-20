(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");
  var filterButtons = document.querySelectorAll("[data-filter]");
  var projectCards = document.querySelectorAll("[data-project]");
  var tearsheetThemeCss = `
    :root[data-parent-theme="light"] {
      --ts-bg: #fbfff9;
      --ts-panel: #e6fbe9;
      --ts-text: #06110a;
      --ts-muted: #445846;
      --ts-line: #9bc9a5;
      --ts-grid: #c5ebce;
      --ts-accent: #00c853;
    }

    :root[data-parent-theme="dark"] {
      --ts-bg: #010503;
      --ts-panel: #06110a;
      --ts-text: #eaffef;
      --ts-muted: #93b99d;
      --ts-line: #145d2d;
      --ts-grid: #0f3f22;
      --ts-accent: #00ff66;
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

    html[data-parent-theme] h4 a,
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
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      toggle.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
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
    var textColor = theme === "dark" ? "#eaffef" : "#06110a";
    var mutedColor = theme === "dark" ? "#93b99d" : "#445846";
    var gridColor = theme === "dark" ? "#0f3f22" : "#c5ebce";
    var panelColor = theme === "dark" ? "#06110a" : "#fbfff9";

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

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      projectCards.forEach(function (card) {
        var visible = filter === "all" || card.getAttribute("data-project") === filter;
        card.hidden = !visible;
      });
    });
  });
})();
