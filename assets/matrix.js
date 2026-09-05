/* Decorative digital rain. No dependencies; no content or pointer handling. */
(function () {
  "use strict";

  var host = document.querySelector(".hero, .page-hero");
  if (!host) return;

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canvas = document.createElement("canvas");
  canvas.className = "matrix-canvas";
  canvas.setAttribute("aria-hidden", "true");
  var context = canvas.getContext("2d");
  if (!context) return;
  host.prepend(canvas);

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "matrix-toggle";
  toggle.innerHTML = '<svg class="motion-pause" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 3v10M11 3v10"/></svg><svg class="motion-play" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 3 8 5-8 5Z"/></svg>';
  host.appendChild(toggle);

  var paused = false;
  try { paused = localStorage.getItem("portfolio-motion") === "paused"; } catch (error) {}
  var visible = true;
  var width = 0;
  var height = 0;
  var streams = [];
  var elapsed = 0;
  var lastFrame = 0;
  var frame = 0;
  var light = root.getAttribute("data-theme") === "light";
  var glyphs = "01アイウエオカキクケコサシスセソタチツテトナニヌネノラリルレロΣλΔΩπ";

  // Stable initial composition: immediately visible, including without motion.
  function noise(value) {
    var n = Math.sin(value * 127.1 + 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.font = '12px "IBM Plex Mono", monospace';
    context.textAlign = "center";
    streams.forEach(function (stream, column) {
      var cycle = height + stream.length * 20;
      var head = (stream.start + elapsed * stream.speed) % cycle;
      for (var row = 0; row < stream.length; row++) {
        var y = head - row * 20;
        if (y < -20 || y > height + 20) continue;
        var alpha = Math.pow(1 - row / stream.length, 1.4) * stream.brightness;
        context.fillStyle = light ? "rgba(0,108,160," + alpha + ")" : "rgba(0,178,255," + alpha + ")";
        if (row === 0) {
          context.fillStyle = light ? "#0074a5" : "#a2e9ff";
          context.shadowColor = "#00bfff";
          context.shadowBlur = light ? 0 : 10;
        }
        var index = Math.floor(noise(column * 41 + row + Math.floor(elapsed * 0.7)) * glyphs.length);
        context.fillText(glyphs[index], stream.x, y);
        if (row === 0) context.shadowBlur = 0;
      }
    });
  }

  function tick(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    var delta = timestamp - lastFrame;
    // Cap drawing at 20fps and avoid catch-up work after a suspended tab.
    if (delta >= 50) {
      elapsed += Math.min(delta, 100) / 1000;
      lastFrame = timestamp;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    root.setAttribute("data-motion", paused || reducedMotion.matches ? "paused" : "running");
    root.toggleAttribute("data-page-hidden", document.hidden);
    toggle.hidden = reducedMotion.matches;
    var label = paused ? "Play background animation" : "Pause background animation";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    if (!paused && !reducedMotion.matches && visible && !document.hidden) {
      frame = requestAnimationFrame(tick);
    }
  }

  function resize() {
    var nextWidth = host.clientWidth;
    var nextHeight = host.clientHeight;
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    var ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    streams = [];
    var spacing = width < 640 ? 26 : 23;
    for (var i = 0; i < Math.ceil(width / spacing); i++) {
      streams.push({
        x: i * spacing + 8,
        start: noise(i + 1) * (height + 480),
        length: 14 + Math.floor(noise(i + 31) * 22),
        speed: 18 + noise(i + 73) * 28,
        brightness: 0.18 + noise(i + 111) * 0.6
      });
    }
    draw();
  }

  toggle.addEventListener("click", function () {
    paused = !paused;
    try { localStorage.setItem("portfolio-motion", paused ? "paused" : "running"); } catch (error) {}
    syncMotion();
  });
  reducedMotion.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  window.addEventListener("pagehide", function () { cancelAnimationFrame(frame); });
  window.addEventListener("pageshow", syncMotion);

  new MutationObserver(function () {
    light = root.getAttribute("data-theme") === "light";
    draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      syncMotion();
    }).observe(host);
  }
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(host);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();
  syncMotion();
})();
