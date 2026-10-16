(function () {
  "use strict";

  var REDIRECT_URL = "main.html";

  var intro = document.getElementById("intro");
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cs = getComputedStyle(root);
  var left = false;

  function ms(name) {
    var v = cs.getPropertyValue(name).trim();
    return v.slice(-2) === "ms" ? parseFloat(v) : parseFloat(v) * 1000;
  }

  function go() {
    if (left) return;

    left = true;
    window.location.replace(REDIRECT_URL);
  }

  var pf = document.createElement("link");
  pf.rel = "prefetch";
  pf.href = REDIRECT_URL;
  document.head.appendChild(pf);

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

      setTimeout(function () {
        intro.classList.add("is-exit");
      }, ms("--t-reduced") - 400);

      setTimeout(go, ms("--t-reduced"));
      return;
    }

    var steps = [
      ["--t-jump", "is-jump"],
      ["--t-spread", "is-spread"],
      ["--t-expand", "is-expand"],
      ["--t-tagline", "is-tagline"],
      ["--t-flash", "is-flash"]
    ];

    requestAnimationFrame(function () {
      steps.forEach(function (s) {
        setTimeout(function () {
          intro.classList.add(s[1]);
        }, ms(s[0]));
      });

      setTimeout(function () {
        intro.classList.add("is-flash-peak");
      }, ms("--t-flash") + ms("--d-flash") * 0.3);

      setTimeout(function () {
        intro.classList.add("is-exit");
      }, ms("--t-flash") + ms("--d-flash") * 0.6);

      setTimeout(go, ms("--t-redirect"));
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

  setTimeout(go, 12000);
})();
