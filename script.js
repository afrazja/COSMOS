/* ============================================================
   COSMOS — interactions
   1. Twinkling starfield + occasional shooting stars (canvas)
   2. Scroll-reveal via IntersectionObserver
   3. Animated stat counters
   4. Nav background on scroll + hero parallax
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.body.classList.add('no-pin'); // plain stacked planets, no pinning

  /* ---------- 1. Starfield ---------- */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shooting = [];
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const count = Math.floor((w * h) / 5200); // density scales with viewport
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.15 + 0.25,
      base: Math.random() * 0.55 + 0.25,        // base alpha
      amp: Math.random() * 0.45,                 // twinkle amplitude
      speed: Math.random() * 1.6 + 0.4,          // twinkle speed
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.12 ? 265 : (Math.random() < 0.5 ? 190 : 0) // few violet/teal, rest white
    }));
  }

  function spawnShootingStar() {
    if (document.hidden || reduceMotion) return;
    const fromLeft = Math.random() < 0.5;
    shooting.push({
      x: fromLeft ? Math.random() * w * 0.3 : w * (0.6 + Math.random() * 0.4),
      y: Math.random() * h * 0.35,
      vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 5),
      vy: 3.5 + Math.random() * 2.5,
      life: 1
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      const a = reduceMotion
        ? s.base
        : s.base + Math.sin(t * 0.001 * s.speed + s.phase) * s.amp;
      if (a <= 0.02) continue;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.hue === 0
        ? `rgba(238, 240, 255, ${a})`
        : `hsla(${s.hue}, 80%, 78%, ${a})`;
      ctx.fill();
    }

    for (let i = shooting.length - 1; i >= 0; i--) {
      const m = shooting[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.016;
      if (m.life <= 0 || m.x < -80 || m.x > w + 80 || m.y > h + 80) {
        shooting.splice(i, 1);
        continue;
      }
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
      grad.addColorStop(0, `rgba(238, 240, 255, ${0.9 * m.life})`);
      grad.addColorStop(1, 'rgba(238, 240, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
  if (!reduceMotion) setInterval(spawnShootingStar, 4200);

  /* ---------- 2. Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- 3. Stat counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animateCount(e.target);
          statIo.unobserve(e.target);
        }
      }
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll('.stat-num').forEach((el) => {
    if (reduceMotion) {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    } else {
      statIo.observe(el);
    }
  });

  /* ---------- 4. Nav, scroll progress + hero parallax ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const heroBg = document.querySelector('.hero-bg');
  const heroContent = document.querySelector('.hero-content');
  let ticking = false;
  let mouseX = 0, mouseY = 0; // normalized -1..1, eased toward target
  let targetX = 0, targetY = 0;

  let lastY = window.scrollY;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      warpBoost = Math.min(0.035, warpBoost + Math.abs(y - lastY) * 0.00012);
      lastY = y;
      nav.classList.toggle('scrolled', y > 24);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

      if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
        heroBg.style.translate = `${mouseX * -18}px ${y * 0.28 + mouseY * -12}px`;
      }

      updatePlanets();
      updateLanding();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile hamburger menu */
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.querySelectorAll('.nav-links a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
    // tapping the dark scrim (the nav's own backdrop) closes the menu
    nav.addEventListener('click', (e) => {
      if (e.target === nav && nav.classList.contains('menu-open')) {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* mouse-depth parallax in the hero (fine pointers only) */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion && heroBg) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    (function easeParallax() {
      mouseX += (targetX - mouseX) * 0.045;
      mouseY += (targetY - mouseY) * 0.045;
      if (window.scrollY < window.innerHeight * 1.2) {
        heroBg.style.translate =
          `${mouseX * -18}px ${window.scrollY * 0.28 + mouseY * -12}px`;
        if (heroContent) {
          heroContent.style.translate = `${mouseX * 10}px ${mouseY * 7}px`;
        }
      }
      requestAnimationFrame(easeParallax);
    })();
  }

  /* ---------- 5. 3D tilt on nebula cards ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.nebula-card').forEach((card) => {
      const glare = document.createElement('div');
      glare.className = 'glare';
      glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => {
        if (!card.classList.contains('in')) return; // wait for reveal to finish
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0..1
        const py = (e.clientY - r.top) / r.height;   // 0..1
        const rx = (0.5 - py) * 9;  // deg
        const ry = (px - 0.5) * 11; // deg
        card.classList.add('tilting');
        card.style.transform =
          `perspective(950px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
        glare.style.setProperty('--gx', `${px * 100}%`);
        glare.style.setProperty('--gy', `${py * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }

  /* ---------- 6. Warp-speed starfield in the hero ---------- */
  let warpBoost = 0;
  const warp = document.getElementById('warp');

  if (warp && !reduceMotion) {
    const wctx = warp.getContext('2d');
    const hero = document.querySelector('.hero');
    let ww, wh, wcx, wcy;
    let heroVisible = true;

    const WARP_COUNT = 240;
    let warpStars = [];

    function warpSpawn(farEdge) {
      return {
        x: Math.random() * 2 - 1,          // -1..1, projected outward from center
        y: Math.random() * 2 - 1,
        z: farEdge ? 1 : Math.random() * 0.9 + 0.1
      };
    }

    function warpResize() {
      const dpr2 = Math.min(window.devicePixelRatio || 1, 2);
      ww = hero.clientWidth;
      wh = hero.clientHeight;
      wcx = ww / 2;
      wcy = wh * 0.42; // converge on the same point the nebula does
      warp.width = ww * dpr2;
      warp.height = wh * dpr2;
      warp.style.width = ww + 'px';
      warp.style.height = wh + 'px';
      wctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
    }

    warpStars = Array.from({ length: WARP_COUNT }, () => warpSpawn(false));
    warpResize();
    window.addEventListener('resize', warpResize);

    new IntersectionObserver(
      (entries) => { heroVisible = entries[0].isIntersecting; },
      { rootMargin: '60px' }
    ).observe(hero);

    (function warpFrame() {
      requestAnimationFrame(warpFrame);
      if (!heroVisible || document.hidden) return;

      warpBoost *= 0.94; // scroll bursts decay back to cruise speed
      const speed = 0.0028 + warpBoost;

      wctx.clearRect(0, 0, ww, wh);
      wctx.globalCompositeOperation = 'lighter';
      wctx.lineCap = 'round';

      for (const s of warpStars) {
        const zPrev = s.z;
        s.z -= speed;
        if (s.z <= 0.05) { Object.assign(s, warpSpawn(true)); continue; }

        const x0 = wcx + (s.x / zPrev) * wcx;
        const y0 = wcy + (s.y / zPrev) * wcy;
        const x1 = wcx + (s.x / s.z) * wcx;
        const y1 = wcy + (s.y / s.z) * wcy;

        if (x1 < -40 || x1 > ww + 40 || y1 < -40 || y1 > wh + 40) {
          Object.assign(s, warpSpawn(true));
          continue;
        }

        const depth = 1 - s.z;
        wctx.strokeStyle = `rgba(190, 222, 255, ${0.12 + depth * 0.55})`;
        wctx.lineWidth = 0.4 + depth * 1.9;
        wctx.beginPath();
        wctx.moveTo(x0, y0);
        wctx.lineTo(x1, y1);
        wctx.stroke();
      }
    })();
  }

  /* ---------- 7. Pinned planet journey (scroll-driven) ---------- */
  const pin = document.querySelector('.planets-pin');
  const slides = pin ? Array.from(pin.querySelectorAll('.planet-slide')) : [];
  const dots = pin ? Array.from(pin.querySelectorAll('.planet-dots button')) : [];
  const stageHint = pin ? pin.querySelector('.stage-hint') : null;

  const easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const easeIn = (k) => k * k * k;
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

  function updatePlanets() {
    if (!pin || reduceMotion || !slides.length) return;

    const vh = window.innerHeight;
    const total = pin.offsetHeight - vh;
    const P = clamp01(-pin.getBoundingClientRect().top / total);
    const n = slides.length;

    const active = Math.min(Math.floor(P * n), n - 1);
    dots.forEach((d, i) => d.classList.toggle('on', i === active));
    if (stageHint) stageHint.style.opacity = P < 0.04 ? 1 : 0;

    const W = window.innerWidth;
    const IN = 0.2;   // first 20% of a planet's segment: fly in
    const OUT = 0.8;  // last 20%: fly out

    slides.forEach((slide, i) => {
      const t = clamp01(P * n - i);
      const isLast = i === n - 1;
      let x, alpha, scale;

      if (t === 0 || (t === 1 && !isLast)) {
        alpha = 0; x = 0; scale = 1;
      } else if (t < IN) {
        const k = easeOut(t / IN);
        x = (1 - k) * 0.75 * W;                 // from far right
        alpha = clamp01(t / IN * 1.4);
        scale = 0.72 + 0.28 * k;
      } else if (t < OUT || isLast) {
        const k = (Math.min(t, OUT) - IN) / (OUT - IN);
        x = -0.02 * W * k;                      // slow drift while holding
        alpha = 1;
        scale = 1;
      } else {
        const k = easeIn((t - OUT) / (1 - OUT));
        x = -0.02 * W - k * 0.95 * W;           // exit stage left
        alpha = 1 - k;
        scale = 1 - 0.16 * k;
      }

      slide.classList.toggle('live', alpha > 0.01);
      slide.style.opacity = alpha;

      const vis = slide.querySelector('.planet-visual');
      const info = slide.querySelector('.planet-info');
      vis.style.translate = `${x}px 0px`;
      vis.style.scale = String(scale);

      // info text trails slightly behind the planet
      let ia, iy;
      if (t < IN) {
        ia = clamp01((t - IN * 0.35) / (IN * 0.65));
        iy = (1 - easeOut(ia)) * 34;
      } else if (t < OUT || isLast) {
        ia = 1; iy = 0;
      } else {
        const k = (t - OUT) / (1 - OUT);
        ia = 1 - k;
        iy = -k * 26;
      }
      info.style.opacity = ia;
      info.style.translate = `0px ${iy}px`;
    });
  }

  // dots jump to the middle of each planet's segment
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const total = pin.offsetHeight - window.innerHeight;
      const y = pin.offsetTop + ((i + 0.45) / slides.length) * total;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('resize', updatePlanets);
  updatePlanets();

  /* ---------- 8. Spaceship landing sequence (scroll-driven) ---------- */
  const lpin = document.querySelector('.landing-pin');
  const lander = document.getElementById('lander');
  const flame = document.getElementById('flame');
  const dustL = document.getElementById('dust-l');
  const dustR = document.getElementById('dust-r');
  const hudAlt = document.getElementById('hud-alt');
  const hudVel = document.getElementById('hud-vel');
  const hudStatus = document.getElementById('hud-status');
  const landedMsg = document.getElementById('landed-msg');

  // scroll-scrubbed landing footage; falls back to the composited scene
  const lvid = document.getElementById('landing-video');
  const VIDEO_TOUCH_T = 1.5; // seconds into the footage when the feet touch
  let videoMode = false;

  function enableVideoMode() {
    if (videoMode || reduceMotion) return;
    videoMode = true;
    lpin.firstElementChild.classList.add('video-mode');
    updateLanding();
  }
  if (lvid && !reduceMotion) {
    if (lvid.readyState >= 2) enableVideoMode();
    else lvid.addEventListener('loadeddata', enableVideoMode);
    lvid.addEventListener('error', () => { videoMode = false; });

    // the video ships with preload="metadata"; pull the full file only
    // once the landing section is approaching the viewport
    const warm = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        warm.disconnect();
        lvid.preload = 'auto';
        lvid.load();
      }
    }, { rootMargin: '1500px' });
    warm.observe(lpin);
  }

  function updateLanding() {
    if (!lpin || !lander || reduceMotion) return;

    const stage = lpin.firstElementChild;
    const vh = window.innerHeight;
    const rect = lpin.getBoundingClientRect();
    if (rect.bottom < -60 || rect.top > vh + 60) return; // far off-screen

    const total = lpin.offsetHeight - vh;
    const P = clamp01(-rect.top / total);

    // scroll fraction at which the feet touch down; the rest holds/settles
    // (landing 2 touches down early and has a long, beautiful dust settle,
    //  so the settle phase gets a bigger share of the scroll)
    const TOUCH = videoMode ? 0.6 : 0.92;
    const q = clamp01(P / TOUCH);
    const e = 1 - Math.pow(1 - q, 2.2); // decelerating descent

    if (videoMode) {
      // map scroll to footage time: descent until TOUCH, then dust settling
      const dur = lvid.duration || 5.88;
      const touchT = Math.min(VIDEO_TOUCH_T, dur);
      const t = P <= TOUCH
        ? q * touchT
        : touchT + ((P - TOUCH) / (1 - TOUCH)) * (dur - 0.08 - touchT);
      if (Math.abs(t - lvid.currentTime) > 0.02) lvid.currentTime = t;
    }

    const burning = P < TOUCH;

    if (!videoMode) {
      const sH = stage.clientHeight;
      const rH = lander.offsetHeight;
      const feetFrac = 0.985;                 // foot pads sit at the cutout's bottom edge
      const startY = -1.15 * rH;              // parked above the viewport
      const endY = sH * 0.83 - rH * feetFrac; // feet on the photo's mid-plain (17vh up)
      const y = startY + (endY - startY) * e;

      // lateral sway that settles as the ship gets low
      const sway = Math.sin(q * Math.PI * 5) * 26 * (1 - e);
      const rot = Math.sin(q * Math.PI * 5) * 2.5 * (1 - e);
      lander.style.transform =
        `translate(calc(-50% + ${sway.toFixed(1)}px), ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;

      // engine burns until the moment of contact
      const thrust = 0.65 + 0.75 * e;
      flame.style.opacity = burning ? '1' : '0';
      flame.style.transform = `scaleY(${burning ? thrust.toFixed(2) : 0.2})`;

      // contact shadow deepens as the ship closes in
      const shadow = document.getElementById('ship-shadow');
      shadow.style.opacity = (Math.pow(e, 3) * 0.6).toFixed(2);
      shadow.style.scale = (0.45 + 0.55 * e).toFixed(2);

      // dust kicks up during the final meters and lingers after landing
      const d = clamp01((q - 0.87) / 0.14);
      const spread = (d * 80).toFixed(0);
      dustL.style.opacity = dustR.style.opacity = (d * 0.95).toFixed(2);
      dustL.style.scale = dustR.style.scale = (0.35 + d * 1.15).toFixed(2);
      dustL.style.translate = `calc(-100% - ${spread}px) 0px`;
      dustR.style.translate = `calc(100% + ${spread}px) 0px`;
    }

    // brief camera shake right at the moment of contact
    if (P > TOUCH - 0.005 && P < TOUCH + 0.045) {
      const amp = 5 * (1 - (P - TOUCH + 0.005) / 0.05);
      stage.style.translate = `0 ${(Math.sin(P * 260) * amp).toFixed(1)}px`;
    } else {
      stage.style.translate = '0 0';
    }

    // HUD telemetry
    const alt = Math.max(0, Math.round(2400 * (1 - e)));
    const vel = burning ? Math.round(2 + 44 * (1 - e)) : 0;
    hudAlt.textContent = alt;
    hudVel.textContent = vel === 0 ? '0' : `−${vel}`;

    let status, ok = false;
    if (P < TOUCH * 0.55) status = '— DESCENT PHASE —';
    else if (P < TOUCH * 0.85) status = '— FINAL APPROACH —';
    else if (P < TOUCH) status = '— RETRO BURN —';
    else { status = 'TOUCHDOWN CONFIRMED ✓'; ok = true; }
    hudStatus.textContent = status;
    hudStatus.classList.toggle('ok', ok);

    // closing line fades in once the dust starts settling
    const msgStart = Math.min(TOUCH + 0.13, 0.93);
    const m = clamp01((P - msgStart) / 0.05);
    landedMsg.style.opacity = m.toFixed(2);
    landedMsg.style.translate = `-50% ${((1 - m) * 24).toFixed(0)}px`;
  }

  window.addEventListener('resize', updateLanding);
  updateLanding();
})();
