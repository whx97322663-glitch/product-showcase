/* ============================================================
   AERIN · 驭风 X1 — interactions
   preloader · cursor · glow · reveal · sticky story ·
   stat counter · macro zoom · flow field · header
   ============================================================ */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- preloader ---------- */
  const preloader = $("#preloader");
  const preBar = $("#pre-bar");
  document.body.classList.add("loading");

  function finishPreloader() {
    preloader.classList.add("done");
    document.body.classList.remove("loading");
    setTimeout(() => preloader.remove(), 1200);
  }
  if (reduced) {
    finishPreloader();
  } else {
    // fake-but-eased progress synced to hero image load
    let p = 0;
    const img = $(".hero-art img");
    const step = () => {
      p = Math.min(100, p + 4 + Math.random() * 9);
      preBar.style.width = p + "%";
      if (p < 100) requestAnimationFrame(step);
      else {
        // make sure the hero image is in before we lift the curtain
        const go = () => setTimeout(finishPreloader, 300);
        img.complete ? go() : img.addEventListener("load", go, { once: true });
        img.addEventListener("error", go, { once: true });
      }
    };
    requestAnimationFrame(step);
  }

  /* ---------- header shrink ---------- */
  const header = $("#site-header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- smooth anchors with header offset ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    history.pushState(null, "", id);
  }));

  /* ---------- scroll reveal (.reveal, .line-mask, .manifesto-line, spec li) ---------- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .line-mask, .manifesto-line, .spec-list li").forEach(el =>
    reduced ? el.classList.add("in") : revealIO.observe(el));

  /* ---------- custom cursor (dot + lerped ring) ---------- */
  if (!reduced && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const dot = $("#cursor"), ring = $("#cursor-ring");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("mousemove", e => {
      x = e.clientX; y = e.clientY;
      dot.style.opacity = ring.style.opacity = 1;
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    }, { passive: true });
    document.addEventListener("mouseleave", () => { dot.style.opacity = ring.style.opacity = 0; });
    (function tick() {
      rx += (x - rx) * .18; ry += (y - ry) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    })();
    $$("a, button, .spec-list li, .behind-item, .video-media").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("has-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("has-hover"));
    });
  } else {
    $("#cursor")?.remove(); $("#cursor-ring")?.remove();
  }

  /* ---------- mouse glow (rAF lerp) ---------- */
  const glow = $("#glow");
  if (!reduced && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    glow.classList.add("on");
    let gx = innerWidth / 2, gy = innerHeight / 3, rx = gx, ry = gy;
    addEventListener("mousemove", e => { gx = e.clientX; gy = e.clientY; }, { passive: true });
    (function tick() {
      rx += (gx - rx) * .07; ry += (gy - ry) * .07;
      glow.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(tick);
    })();
  } else { glow.remove(); }

  /* ---------- sticky story: frame progress + stat counter ---------- */
  const story = $(".story");
  const frame = $("#story-frame");
  const numEl = $("#story-num");
  const chapters = $$(".story-chapter");

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }

  function storyTick() {
    if (!story) return;
    const r = story.getBoundingClientRect();
    const total = r.height - innerHeight;
    const prog = total > 0 ? clamp01(-r.top / total) : 0;
    if (frame) {
      const t = prog * 2;                       // 0 → 2
      const scale = 1 + Math.sin(prog * Math.PI) * 0.06;
      const dx = (prog - 0.5) * 40;
      frame.style.transform = `scale(${scale}) translateX(${dx}px)`;
    }
    // index number = current chapter
    const idx = Math.min(2, Math.floor(prog * 3));
    if (numEl && numEl.textContent !== String(idx + 1).padStart(2, "0")) {
      numEl.textContent = String(idx + 1).padStart(2, "0");
    }
  }

  /* stat counter (fire once when a .chapter-stats enters view) */
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      counterIO.unobserve(en.target);
      $$(".stat-num", en.target).forEach(dt => {
        const target = parseInt(dt.dataset.count, 10);
        if (Number.isNaN(target)) return;
        if (reduced) { dt.textContent = target.toLocaleString("en-US"); return; }
        const dur = 1200, t0 = performance.now();
        (function anim(now) {
          const k = clamp01((now - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          dt.textContent = Math.round(target * eased).toLocaleString("en-US");
          if (k < 1) requestAnimationFrame(anim);
        })(t0);
      });
    });
  }, { threshold: 0.5 });
  $$(".chapter-stats").forEach(g => counterIO.observe(g));

  /* ---------- macro zoom: scroll-driven crop ---------- */
  const macro = $(".macro");
  const zoom = $("#macro-zoom");
  function macroTick() {
    if (!macro || !zoom || reduced) return;
    const r = macro.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = total > 0 ? clamp01(-r.top / total) : 0;
    // 3 keyframe crops: full → grille → ring
    const scale = 1 + p * 0.9;
    const ox = 50 + Math.sin(p * Math.PI) * 12;
    const oy = 46 + Math.cos(p * Math.PI) * 8;
    zoom.style.transform = `scale(${scale}) translate(${(ox - 50) * -1.2}%, ${(oy - 50) * -1.2}%)`;
    zoom.style.transformOrigin = "center";
  }

  /* ---------- unified rAF loop for scroll-driven work ---------- */
  let ticking = false;
  function onScrollFrame() {
    storyTick();
    macroTick();
    flowField.scrollNudge();
    ticking = false;
  }
  function requestScrollFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }
  addEventListener("scroll", requestScrollFrame, { passive: true });
  addEventListener("resize", requestScrollFrame, { passive: true });
  if (reduced) { storyTick(); macroTick(); }

  /* ---------- flow field (canvas particles, mouse-disturbed) ---------- */
  const flowField = (function makeFlow() {
    const canvas = $("#flow-canvas");
    const ctx = canvas.getContext("2d");
    let W, H, dpr, particles = [], running = false, raf = null;
    let mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };
    const N = () => Math.min(160, Math.floor(W * H / 14000));

    function resize() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }
    function initParticles() {
      particles = Array.from({ length: N() }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        life: Math.random() * 120
      }));
    }
    function angleAt(x, y) {
      // layered sine flow → organic swirls
      return (Math.sin(x * 0.0028) + Math.cos(y * 0.0032) + Math.sin((x + y) * 0.0014)) * 1.1;
    }
    function step() {
      // fade-out trail: translucent dark paint instead of a hard clear
      ctx.fillStyle = "rgba(10,10,15,0.16)";
      ctx.fillRect(0, 0, W, H);

      // mouse influence
      const mActive = mouse.x >= 0 && mouse.x < W && mouse.y >= 0 && mouse.y < H;
      if (mActive && mouse.x !== mouse.px) {
        // gentle vortex around cursor
        for (const pt of particles) {
          const dx = pt.x - mouse.x, dy = pt.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const f = (1 - Math.sqrt(d2) / 140) * 1.6;
            pt.x += -dy * f * 0.14;
            pt.y += dx * f * 0.14;
          }
        }
      }
      mouse.px = mouse.x; mouse.py = mouse.y;

      for (const pt of particles) {
        const a = angleAt(pt.x, pt.y);
        const sp = 1.4;
        const nx = pt.x + Math.cos(a) * sp;
        const ny = pt.y + Math.sin(a) * sp;
        // trail segment
        ctx.strokeStyle = "rgba(217,160,102,0.34)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        pt.x = nx; pt.y = ny;
        if (--pt.life <= 0 || pt.x < -10 || pt.x > W + 10 || pt.y < -10 || pt.y > H + 10) {
          pt.x = Math.random() * W; pt.y = Math.random() * H; pt.life = 90 + Math.random() * 120;
        }
      }
      raf = requestAnimationFrame(step);
    }
    function start() {
      if (running || reduced) return;
      running = true; resize(); step();
    }
    function stop() {
      running = false; cancelAnimationFrame(raf);
    }
    if (canvas) {
      canvas.addEventListener("mousemove", e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      }, { passive: true });
      canvas.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; mouse.px = -9999; });
      addEventListener("resize", () => { if (running) resize(); }, { passive: true });
      new IntersectionObserver(en => {
        en.forEach(i => i.isIntersecting ? start() : stop());
      }, { threshold: 0.25 }).observe(canvas);
    }
    return { scrollNudge(){} };
  })();

  /* ---------- pause off-screen videos + hide play badge ---------- */
  $$(".video-media video").forEach(v => {
    v.addEventListener("play", () => v.closest(".video-media")?.classList.add("playing"));
    v.addEventListener("pause", () => v.closest(".video-media")?.classList.remove("playing"));
    new IntersectionObserver(en => {
      en.forEach(i => {
        if (!i.isIntersecting && !v.paused) v.pause();
      });
    }, { threshold: 0.4 }).observe(v);
  });

  // initial frame
  requestScrollFrame();
})();
