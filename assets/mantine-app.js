(function () {
  "use strict";
  if (!window.MantineCore || !window.ReactDOMClient || !window.React) return;
  var R = window.React;
  var MC = window.MantineCore;
  var MH = window.MantineHooks;
  var RCC = window.ReactDOMClient;
  var RD = window.ReactDOM;
  var h = R.createElement;

  function currentScheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  var MATRIX = ["#e9faff", "#cef2ff", "#a0e8ff", "#6bdbff", "#36ceff", "#08bfff", "#009ed9", "#007ea9", "#006484", "#004a63"];

  var theme = MC.createTheme({
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontFamilyMonospace: "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
    headings: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: "500" },
    defaultRadius: "sm",
    primaryColor: "matrix",
    primaryShade: { dark: 5, light: 7 },
    colors: { matrix: MATRIX }
  });

  function captureAttrs(el) {
    var out = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      out[a.name] = a.value;
    }
    return out;
  }

  function swapWithPlaceholder(el) {
    var ph = document.createElement("span");
    ph.setAttribute("data-kizo-mount", "");
    if (el.parentNode) {
      el.parentNode.replaceChild(ph, el);
      return ph;
    }
    return null;
  }

  var mounts = [];

  function registerMount(node, factory) {
    if (!node) return;
    mounts.push({ node: node, factory: factory });
  }

  /* ---- Header ---- */
  var headerConfig = null;
  var navInner = document.querySelector(".site-header .nav-inner");
  if (navInner) {
    var brandEl = navInner.querySelector(".brand");
    var navEl = navInner.querySelector(".site-nav");
    var toggleBtn = navInner.querySelector("[data-theme-toggle]");
    headerConfig = {
      brandHtml: brandEl ? brandEl.innerHTML : "",
      brandAttrs: brandEl ? captureAttrs(brandEl) : {},
      links: navEl
        ? Array.prototype.map.call(navEl.querySelectorAll("a"), function (a) {
            return {
              href: a.getAttribute("href"),
              label: a.textContent,
              active: a.classList.contains("active")
            };
          })
        : [],
      sunIconHtml: toggleBtn ? (toggleBtn.querySelector(".sun-icon") || {}).innerHTML || "" : "",
      moonIconHtml: toggleBtn ? (toggleBtn.querySelector(".moon-icon") || {}).innerHTML || "" : ""
    };
    while (navInner.firstChild) navInner.removeChild(navInner.firstChild);
    var headerPh = document.createElement("span");
    headerPh.style.display = "contents";
    navInner.appendChild(headerPh);
    registerMount(headerPh, function (scheme) { return h(HeaderApp, { scheme: scheme }); });
  }

  function HeaderApp(props) {
    var cfg = headerConfig;
    var scheme = props.scheme;
    var _d = R.useState(false);
    var drawerOpen = _d[0];
    var setDrawerOpen = _d[1];

    function onToggleTheme() {
      var next = scheme === "dark" ? "light" : "dark";
      if (typeof window.__kizoSetTheme === "function") {
        window.__kizoSetTheme(next);
      } else {
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
      }
    }

    var sunSvg = h("span", {
      className: "sun-icon",
      "aria-hidden": "true",
      dangerouslySetInnerHTML: { __html: cfg.sunIconHtml }
    });
    var moonSvg = h("span", {
      className: "moon-icon",
      "aria-hidden": "true",
      dangerouslySetInnerHTML: { __html: cfg.moonIconHtml }
    });

    var brandAttrs = Object.assign({}, cfg.brandAttrs, {
      key: "brand",
      className: "brand",
      dangerouslySetInnerHTML: { __html: cfg.brandHtml }
    });

    return h(
      R.Fragment,
      null,
      h("a", brandAttrs),
      h(
        "nav",
        { className: "site-nav", "aria-label": "Primary navigation" },
        cfg.links.map(function (l, i) {
          return h(
            "a",
            {
              key: i,
              href: l.href,
              className: l.active ? "active" : undefined,
              onClick: function () { setDrawerOpen(false); }
            },
            l.label
          );
        })
      ),
      h(
        "div",
        { className: "nav-actions" },
        h(
          MC.Tooltip,
          { label: scheme === "dark" ? "Switch to light mode" : "Switch to dark mode", position: "bottom", withArrow: true },
          h(
            MC.ActionIcon,
            {
              className: "km-theme-action",
              variant: "default",
              size: "lg",
              radius: "sm",
              "aria-label": scheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
              onClick: onToggleTheme
            },
            sunSvg,
            moonSvg
          )
        ),
        h(MC.Burger, {
          className: "km-burger",
          opened: drawerOpen,
          onClick: function () { setDrawerOpen(!drawerOpen); },
          size: "sm",
          "aria-label": drawerOpen ? "Close navigation" : "Open navigation"
        })
      ),
      h(
        MC.Drawer,
        {
          opened: drawerOpen,
          onClose: function () { setDrawerOpen(false); },
          position: "right",
          size: "300px",
          styles: {
            content: { background: "var(--surface)", borderLeft: "1px solid var(--line)" },
            header: { background: "transparent", color: "var(--muted)", borderBottom: "1px solid var(--line)" },
            title: { fontFamily: "var(--font-mono)", fontSize: "11.5px", letterSpacing: "0.14em", textTransform: "uppercase" }
          },
          title: "Navigation"
        },
        h(
          MC.Stack,
          { gap: 4 },
          cfg.links.map(function (l, i) {
            return h(
              "a",
              {
                key: i,
                href: l.href,
                className: "km-drawer-link" + (l.active ? " active" : ""),
                onClick: function () { setDrawerOpen(false); }
              },
              l.label
            );
          }),
          h("a", { className: "km-drawer-link km-drawer-mail", href: "mailto:kanavdbz@gmail.com" }, "kanavdbz@gmail.com")
        )
      )
    );
  }

  function htmlToVnodes(html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = html;
    return Array.prototype.map.call(tpl.content.childNodes, function toNode(n, idx) {
      if (n.nodeType === 3) return n.textContent;
      return h(n.tagName.toLowerCase(), {
        key: "v" + idx,
        className: n.getAttribute("class") || undefined,
        "aria-hidden": n.getAttribute("aria-hidden") || undefined,
        dangerouslySetInnerHTML: { __html: n.innerHTML }
      });
    });
  }

  /* ---- Buttons ---- */
  var BUTTON_VARS = {
    gold: {
      dark: {
        "--button-bg": "var(--accent)",
        "--button-hover": "var(--ice)",
        "--button-color": "var(--accent-ink)",
        "--button-bd": "1px solid var(--accent)"
      },
      light: {
        "--button-bg": "var(--accent)",
        "--button-hover": "var(--ice)",
        "--button-color": "var(--accent-ink)",
        "--button-bd": "1px solid var(--accent)"
      }
    },
    lagoon: {
      dark: {
        "--button-bg": "var(--cyan-soft)",
        "--button-hover": "var(--surface-2)",
        "--button-color": "var(--cyan)",
        "--button-bd": "1px solid var(--line-strong)"
      },
      light: {
        "--button-bg": "var(--cyan-soft)",
        "--button-hover": "var(--surface-2)",
        "--button-color": "var(--cyan)",
        "--button-bd": "1px solid var(--line-strong)"
      }
    },
    ghost: {
      dark: {
        "--button-bg": "transparent",
        "--button-hover": "var(--surface)",
        "--button-color": "var(--text)",
        "--button-bd": "1px solid var(--line-strong)"
      },
      light: {
        "--button-bg": "transparent",
        "--button-hover": "var(--surface)",
        "--button-color": "var(--text)",
        "--button-bd": "1px solid var(--line-strong)"
      }
    }
  };

  document.querySelectorAll("a.button").forEach(function (el) {
    var cls = el.className;
    var kind = /primary|accent/.test(cls) ? "gold" : /cyan/.test(cls) ? "lagoon" : "ghost";
    var size = /small/.test(cls) ? "sm" : "md";
    var vnodes = htmlToVnodes(el.innerHTML);
    var attrs = captureAttrs(el);
    var ph = swapWithPlaceholder(el);
    registerMount(ph, function (scheme) {
      return h(
        MC.Button,
        {
          component: "a",
          href: attrs.href || "#",
          target: attrs.target || undefined,
          rel: attrs.rel || undefined,
          variant: "filled",
          size: size,
          radius: "sm",
          className: "km-btn km-" + kind + (size === "sm" ? " km-btn-sm" : ""),
          "data-kind": kind,
          style: BUTTON_VARS[kind][scheme]
        },
        vnodes
      );
    });
  });

  /* ---- Filter bar (projects page) ---- */
  var filterBar = document.querySelector(".filter-bar");
  var projectCards = Array.prototype.slice.call(document.querySelectorAll("[data-project]"));
  var filterDefs = [];
  if (filterBar && projectCards.length) {
    filterDefs = Array.prototype.map.call(filterBar.querySelectorAll("[data-filter]"), function (b) {
      return { value: b.getAttribute("data-filter"), label: b.textContent.trim() };
    });
    while (filterBar.firstChild) filterBar.removeChild(filterBar.firstChild);
    var fph = document.createElement("span");
    filterBar.appendChild(fph);
    registerMount(fph, function () { return h(FilterButtons); });
  }

  function applyFilter(value) {
    projectCards.forEach(function (card) {
      var tags = (card.getAttribute("data-project") || "").split(/\s+/);
      card.hidden = value !== "all" && tags.indexOf(value) === -1;
    });
  }

  function FilterButtons() {
    var _v = R.useState(filterDefs.length ? filterDefs[0].value : "all");
    var value = _v[0];
    var setValue = _v[1];
    return h(
      MC.Group,
      { gap: 9, wrap: "wrap", role: "group", "aria-label": "Project filters" },
      filterDefs.map(function (f) {
        var active = f.value === value;
        return h(
          MC.Button,
          {
            key: f.value,
            type: "button",
            variant: "filled",
            size: "compact-sm",
            radius: "xl",
            "aria-pressed": String(active),
            className: "km-btn km-filter-btn " + (active ? "km-gold" : "km-ghost"),
            style: active
              ? BUTTON_VARS.gold[currentScheme()]
              : Object.assign({}, BUTTON_VARS.ghost[currentScheme()], {
                  "--button-color": "var(--muted)",
                  "--button-hover": "var(--surface)"
                }),
            onClick: function () {
              setValue(f.value);
              applyFilter(f.value);
            }
          },
          f.label
        );
      })
    );
  }

  /* ---- Tags ---- */
  document.querySelectorAll(".tag").forEach(function (el) {
    var text = el.textContent;
    var ph = swapWithPlaceholder(el);
    registerMount(ph, function () {
      return h(
        MC.Badge,
        {
          variant: "default",
          radius: "xl",
          size: "sm",
          className: "km-tag",
          style: {
            "--badge-bg": "var(--bg-soft)",
            "--badge-bd": "var(--line)",
            "--badge-color": "var(--muted)"
          }
        },
        text
      );
    });
  });

  /* ---- Back to top ---- */
  var topPh = document.createElement("span");
  topPh.style.display = "contents";
  document.body.appendChild(topPh);
  registerMount(topPh, function () { return h(BackToTop); });

  function BackToTop() {
    var scroll = MH.useWindowScroll();
    var y = scroll[0].y;
    var visible = y > 600;
    return h(
      MC.Affix,
      { position: { bottom: 24, right: 24 }, zIndex: 120 },
      h(
        MC.Transition,
        { mounted: visible, transition: "slide-up", duration: 220, timingFunction: "ease" },
        function (styles) {
          return h(
            MC.Tooltip,
            { label: "Back to top", position: "left", withArrow: true },
            h(
              MC.ActionIcon,
              {
                variant: "default",
                size: "xl",
                radius: "xl",
                className: "km-top",
                style: Object.assign({}, styles, { boxShadow: "var(--shadow-card)" }),
                "aria-label": "Back to top",
                onClick: function () {
                  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
                }
              },
              h(
                "svg",
                {
                  viewBox: "0 0 24 24",
                  width: 18,
                  height: 18,
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  "aria-hidden": "true"
                },
                h("path", { d: "M12 19V5M5 12l7-7 7 7" })
              )
            )
          );
        }
      )
    );
  }

  /* ---- Root render ---- */
  function AppRoot() {
    var _s = R.useState(currentScheme());
    var scheme = _s[0];
    var setScheme = _s[1];

    R.useEffect(function () {
      var obs = new MutationObserver(function () {
        setScheme(currentScheme());
      });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return function () { obs.disconnect(); };
    }, []);

    var portals = mounts.map(function (m, i) {
      return h(R.Fragment, { key: "p" + i }, RD.createPortal(m.factory(scheme), m.node));
    });

    return h.apply(null, [MC.MantineProvider, { theme: theme, forceColorScheme: scheme }].concat(portals));
  }

  if (mounts.length) {
    var rootDiv = document.createElement("div");
    rootDiv.setAttribute("data-kizo-root", "");
    rootDiv.style.display = "contents";
    document.body.appendChild(rootDiv);
    window.ReactDOMClient.createRoot(rootDiv).render(h(AppRoot));
  }
})();
