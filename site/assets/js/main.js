/* ============================================================
   CONSTELLATION — shared behaviors
   Header state, scroll reveals, and the ambient starfield that
   runs behind every site in the family.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- header state ---------- */
  const header = document.getElementById("siteHeader");
  if (header) {
    const onScrollHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* ---------- ambient starfield ---------- */
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let W, H, dpr;

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedStars() {
    const count = Math.round(Math.min(130, Math.max(60, (W * H) / 18000)));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 0.026,
        vy: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.4 + Math.random() * 0.6
      });
    }
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);

    ctx.lineWidth = 0.5;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i], b = stars[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const alpha = (1 - d2 / 12000) * 0.06;
          ctx.strokeStyle = "rgba(217, 179, 108, " + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.0004 * s.twinkle + s.phase));
      ctx.fillStyle = "rgba(240, 236, 228, " + (glow * 0.7).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -4) s.x = W + 4; else if (s.x > W + 4) s.x = -4;
      if (s.y < -4) s.y = H + 4; else if (s.y > H + 4) s.y = -4;
    }
  }

  sizeCanvas();
  seedStars();
  window.addEventListener("resize", function () { sizeCanvas(); seedStars(); });

  if (reduceMotion) {
    drawStars(0);
  } else {
    (function loop(t) {
      drawStars(t);
      window.requestAnimationFrame(loop);
    })(0);
  }
})();
