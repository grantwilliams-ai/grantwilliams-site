/* ============================================================
   THE SHELF — every game lives in this one file.
   To add a game: copy the entry below, fill in the details,
   and push. If the game has a playable build, set playUrl and
   the card gains a "play" link.
   ============================================================ */

const GAMES = [
  {
    slug: "run-run-robots",
    name: "Run Run Robots",
    essence: "Run. Be run after. Laugh.",
    maker: "Grant Williams",
    withNote: "built in collaboration with AI",
    status: "playable now",
    playUrl: "/games/run-run-robots/",
    description:
      "A small arcade game of pursuit and escape.",
    screenshot: "/assets/img/games/run-run-robots-glasshouse.jpg",
    screenshotAlt: "The Glasshouse level: bright planter aisles patrolled by two arachnid robots.",
    attract: "chase" // fallback animation if no screenshot is set
  }
];

/* ============================================================
   Rendering + attract modes. Edit the data above; this part
   needs no changes when a new game joins the shelf.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = document.getElementById("games-list");
  if (!list || typeof GAMES === "undefined") return;

  GAMES.forEach(function (game, i) {
    const card = document.createElement("article");
    card.className = "game-card reveal";
    card.id = game.slug;

    const number = String(i + 1).padStart(2, "0");
    const status = game.playUrl
      ? '<a class="game-status" href="' + game.playUrl + '">play ' + game.name + '</a>'
      : '<span class="game-status">' + game.status + "</span>";

    const screen = game.screenshot
      ? '<a href="' + (game.playUrl || "#") + '"><img src="' + game.screenshot + '" alt="' + (game.screenshotAlt || game.name) + '" loading="lazy"></a>' +
        '<span class="screen-label">in-game</span>'
      : '<canvas id="screen-' + game.slug + '" width="960" height="600"></canvas>' +
        '<span class="screen-label">attract mode</span>';

    card.innerHTML =
      '<div class="game-screen">' + screen + "</div>" +
      '<div class="game-info">' +
        '<p class="micro-label">game ' + number + "</p>" +
        '<h3 class="game-name">' + game.name + "</h3>" +
        '<p class="game-essence">' + game.essence + "</p>" +
        '<p class="game-meta">made by <b>' + game.maker + "</b> · " + game.withNote + "</p>" +
        '<p class="game-desc">' + game.description + "</p>" +
        status +
      "</div>";

    list.appendChild(card);

    if (!game.screenshot && game.attract === "chase") {
      startChaseAttract(document.getElementById("screen-" + game.slug));
    }
  });

  /* ---------- attract mode: the chase ----------
     A small brass robot wanders; something pale follows.
     Decorative only — the real game arrives later.            */
  function startChaseAttract(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const robot = { x: W * 0.3, y: H * 0.5, tx: 0, ty: 0, speed: 1.5 };
    const hunter = { x: W * 0.7, y: H * 0.4, speed: 0.9 };
    const trail = [];
    let waypointTimer = 0;

    function pickWaypoint() {
      robot.tx = W * 0.12 + Math.random() * W * 0.76;
      robot.ty = H * 0.16 + Math.random() * H * 0.68;
      waypointTimer = 160 + Math.random() * 220;
    }
    pickWaypoint();

    function step() {
      // robot drifts toward its waypoint
      const dx = robot.tx - robot.x, dy = robot.ty - robot.y;
      const dist = Math.hypot(dx, dy) || 1;
      robot.x += (dx / dist) * robot.speed;
      robot.y += (dy / dist) * robot.speed;
      if (--waypointTimer <= 0 || dist < 24) pickWaypoint();

      // hunter pursues, slower, with a little sway
      const hx = robot.x - hunter.x, hy = robot.y - hunter.y;
      const hdist = Math.hypot(hx, hy) || 1;
      hunter.x += (hx / hdist) * hunter.speed + Math.sin(Date.now() * 0.0011) * 0.35;
      hunter.y += (hy / hdist) * hunter.speed + Math.cos(Date.now() * 0.0009) * 0.35;

      trail.push({ x: hunter.x, y: hunter.y });
      if (trail.length > 26) trail.shift();
    }

    function drawGrid() {
      ctx.fillStyle = "rgba(217, 179, 108, 0.06)";
      for (let gx = 40; gx < W; gx += 48) {
        for (let gy = 36; gy < H; gy += 48) {
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }
    }

    function drawRobot() {
      const s = 13;
      ctx.save();
      ctx.translate(robot.x, robot.y);
      // body
      ctx.fillStyle = "#d9b36c";
      ctx.fillRect(-s / 2, -s / 2, s, s);
      // eyes
      ctx.fillStyle = "#0d0b0f";
      ctx.fillRect(-3.6, -2.5, 2.4, 2.4);
      ctx.fillRect(1.4, -2.5, 2.4, 2.4);
      // antenna
      ctx.strokeStyle = "#d9b36c";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(0, -s / 2 - 6);
      ctx.stroke();
      ctx.fillStyle = "#f0ece4";
      ctx.beginPath();
      ctx.arc(0, -s / 2 - 8, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawHunter() {
      // fading trail
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        ctx.fillStyle = "rgba(240, 236, 228, " + (i / trail.length * 0.16).toFixed(3) + ")";
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      ctx.save();
      ctx.translate(hunter.x, hunter.y);
      ctx.strokeStyle = "rgba(240, 236, 228, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-6.5, -6.5, 13, 13);
      ctx.fillStyle = "rgba(240, 236, 228, 0.85)";
      ctx.fillRect(-1.5, -1.5, 3, 3);
      ctx.restore();
    }

    function frame() {
      ctx.fillStyle = "#08070a";
      ctx.fillRect(0, 0, W, H);
      drawGrid();
      step();
      drawHunter();
      drawRobot();
    }

    if (reduceMotion) {
      frame();
      return;
    }
    (function loop() {
      frame();
      window.requestAnimationFrame(loop);
    })();
  }
})();
