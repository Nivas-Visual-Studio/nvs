(function () {
  "use strict";

  var REDIRECT_URL = "main.html";

  var intro = document.getElementById("intro");
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cs = getComputedStyle(root);
  var left = false;

  // Read a CSS time variable (e.g. "450ms" or "0.45s") as milliseconds.
  // Falls back to `fallback` if the variable is missing or invalid, so a
  // typo in the CSS can never make a timer fire instantly.
  function ms(name, fallback) {
    var v = cs.getPropertyValue(name).trim();
    var n = v.slice(-2) === "ms" ? parseFloat(v) : parseFloat(v) * 1000;
    return isNaN(n) ? (fallback || 0) : n;
  }

  function go() {
    if (left) return;
    left = true;

    window.location.replace(REDIRECT_URL);
  }

  // Warm the cache while the intro plays so main.html appears instantly.
  [
    ["prefetch", REDIRECT_URL, null],
    ["prefetch", "css/style.css", "style"],
    ["prefetch", "js/script.js", "script"],
    ["prefetch", "images/hero_bg.jpg", "image"]
  ].forEach(function (item) {
    var l = document.createElement("link");
    l.rel = item[0];
    l.href = item[1];
    if (item[2]) l.as = item[2];
    document.head.appendChild(l);
  });

  function measure() {
    document.querySelectorAll("[data-measure]").forEach(function (el) {
      var inner = el.firstElementChild;
      var f = parseFloat(getComputedStyle(el).fontSize);
      var w = inner.getBoundingClientRect().width + 1;

      el.style.setProperty("--w", (w / f).toFixed(4));
    });
  }

  function run() {
    measure();

    if (reduce) {
      intro.classList.add(
        "reduced",
        "is-jump",
        "is-spread",
        "is-expand",
        "is-tagline"
      );

      var reducedTotal = ms("--t-reduced", 1400);

      setTimeout(function () {
        intro.classList.add("is-exit");
      }, Math.max(0, reducedTotal - 400));

      setTimeout(go, reducedTotal);
      return;
    }

    var steps = [
      ["--t-jump", "is-jump", 300],
      ["--t-spread", "is-spread", 450],
      ["--t-expand", "is-expand", 850],
      ["--t-tagline", "is-tagline", 1450],
      ["--t-flash", "is-flash", 3450]
    ];

    requestAnimationFrame(function () {
      steps.forEach(function (s) {
        setTimeout(function () {
          intro.classList.add(s[1]);
        }, ms(s[0], s[2]));
      });

      var flashAt = ms("--t-flash", 3450);
      var flashDur = ms("--d-flash", 420);

      setTimeout(function () {
        intro.classList.add("is-flash-peak");
      }, flashAt + flashDur * 0.3);

      setTimeout(function () {
        intro.classList.add("is-exit");
      }, flashAt + flashDur * 0.6);

      setTimeout(go, ms("--t-redirect", 4200));
    });
  }

  var fonts = document.fonts && document.fonts.load
    ? Promise.all([
        document.fonts.load('1em "Decadence Straight"', "NIVAS"),
        document.fonts.load('700 1em "Gotham"', "ivasualtdo")
      ])
    : Promise.resolve();

  var started = false;

  function start() {
    if (!started) {
      started = true;
      run();
    }
  }

  fonts.then(start, start);
  setTimeout(start, 1200);

  intro.addEventListener("click", go);

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      go();
    }
  });

  // Safety net: never leave a visitor stuck on the intro
  setTimeout(go, 12000);
})();
