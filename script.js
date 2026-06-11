/* ============================================================
   Harjas Singh — Portfolio interactions
   Vanilla JS, no dependencies. Respects reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Enable entrance-animation styling only when JS runs. Without this class,
     .reveal elements stay fully visible (no-JS / SEO / fallback safety). */
  if (!reduceMotion) document.documentElement.classList.add("anim-on");

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    toggle.classList.remove("open");
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  function revealAll() { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* Force final visible state instantly — used when the tab is backgrounded
     or observers/transitions/rAF are frozen, so content is never stuck. */
  function forceReveal() {
    document.documentElement.classList.add("reveal-forced");
    revealAll();
    document.querySelectorAll(".stat .num").forEach(function (n) {
      n.querySelector(".val").textContent = n.getAttribute("data-count");
    });
    document.querySelectorAll(".fill").forEach(function (f) {
      f.style.width = f.getAttribute("data-pct") + "%";
    });
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    /* Safety net: if the observer never delivers (backgrounded/throttled tab),
       force everything visible so content is never stuck hidden. */
    setTimeout(function () {
      if (document.querySelectorAll(".reveal.in").length === 0) forceReveal();
    }, 1600);
  } else {
    forceReveal();
  }

  /* ---------- Typed role ---------- */
  var typedEl = document.getElementById("typed");
  var roles = [
    "Software Developer",
    "Network Engineer",
    "Full-Stack Builder",
    "Cloud & AWS Enthusiast",
    "Problem Solver"
  ];
  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = roles[0];
    } else {
      var rIdx = 0, cIdx = 0, deleting = false;
      function tick() {
        var word = roles[rIdx];
        if (!deleting) {
          cIdx++;
          typedEl.textContent = word.slice(0, cIdx);
          if (cIdx === word.length) { deleting = true; return setTimeout(tick, 1500); }
        } else {
          cIdx--;
          typedEl.textContent = word.slice(0, cIdx);
          if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; }
        }
        setTimeout(tick, deleting ? 45 : 80);
      }
      tick();
    }
  }

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var valEl = el.querySelector(".val");
    if (reduceMotion) { valEl.textContent = target; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      valEl.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Skill bars + stats observer ---------- */
  function fillBars(card) {
    card.querySelectorAll(".fill").forEach(function (f, i) {
      var pct = f.getAttribute("data-pct") + "%";
      if (reduceMotion) { f.style.width = pct; }
      else { setTimeout(function () { f.style.width = pct; }, i * 120); }
    });
  }
  if ("IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target.querySelector(".num")); statObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".stat").forEach(function (s) { statObs.observe(s); });

    var barObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fillBars(e.target); barObs.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".skill-card").forEach(function (c) { barObs.observe(c); });

    /* Safety net for backgrounded/throttled tabs */
    setTimeout(function () {
      if (document.querySelectorAll(".reveal.in").length === document.querySelectorAll(".reveal").length
          && document.querySelector(".reveal-forced")) return;
      document.querySelectorAll(".stat .num").forEach(function (n) {
        if (n.querySelector(".val").textContent === "0") n.querySelector(".val").textContent = n.getAttribute("data-count");
      });
      document.querySelectorAll(".fill").forEach(function (f) {
        if (!f.style.width) f.style.width = f.getAttribute("data-pct") + "%";
      });
    }, 2000);
  } else {
    document.querySelectorAll(".fill").forEach(function (f) { f.style.width = f.getAttribute("data-pct") + "%"; });
    document.querySelectorAll(".stat .num").forEach(function (n) { n.querySelector(".val").textContent = n.getAttribute("data-count"); });
  }

  /* ---------- Project filter ---------- */
  var filters = document.querySelectorAll(".filter");
  var projects = document.querySelectorAll(".project");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      projects.forEach(function (p) {
        var cats = (p.getAttribute("data-cat") || "").split(" ");
        var show = f === "all" || cats.indexOf(f) !== -1;
        p.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Scroll-spy nav highlight ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navAnchors.map(function (a) {
    var id = a.getAttribute("href").slice(1);
    return document.getElementById(id);
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute("id");
          navAnchors.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- Particle constellation background ---------- */
  var canvas = document.getElementById("bgCanvas");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, particles, mouse = { x: -9999, y: -9999 };

    // Accent color for particles, read from the live --accent CSS variable so
    // it follows the Tweaks theme control.
    var accentRGB = { r: 52, g: 211, b: 153 };
    function refreshAccent() {
      var hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (m) accentRGB = { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
    }
    refreshAccent();
    window.addEventListener("accentchange", refreshAccent);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var area = W * H;
      var count = Math.max(24, Math.min(64, Math.round(area / 26000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // mouse repel
        var dxm = p.x - mouse.x, dym = p.y - mouse.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 120) {
          p.x += (dxm / dm) * 0.6;
          p.y += (dym / dm) * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + accentRGB.r + "," + accentRGB.g + "," + accentRGB.b + ",0.42)";
        ctx.fill();
      }
      // links
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 128) {
            var op = (1 - dist / 128) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = "rgba(" + accentRGB.r + "," + accentRGB.g + "," + accentRGB.b + "," + op + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });
    resize();
    draw();
  }

  /* ---------- Smooth anchor offset for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (el) {
        ev.preventDefault();
        var y = el.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });

})();
