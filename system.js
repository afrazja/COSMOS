/* ============================================================
   The System — animated orrery
   Top-down solar system on canvas. Orbital periods follow true
   Kepler ratios (T ∝ a^1.5 of the displayed radii); sizes and
   distances are stylized so everything stays visible.
   Click a body for its dossier; the slider bends time.
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('orrery');
  const panel = document.getElementById('body-panel');
  if (!canvas || !panel) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data (facts real; orbit/size in display units) ---------- */
  const SUN = {
    key: 'sun', name: 'The Sun', type: 'G-type Star',
    color: '#ffd166',
    desc: 'Our star holds 99.86% of the solar system’s mass and turns 600 million tons of hydrogen into helium every second. Its light takes 8 minutes 20 seconds to reach you.',
    facts: [['1.39M km', 'diameter'], ['5,500 °C', 'surface'], ['4.6B yrs', 'age'], ['8m 20s', 'light to Earth']],
    orb: ['#fff3c4', '#ffb347']
  };

  const BODIES = [
    { key: 'mercury', name: 'Mercury', type: '01 · Terrestrial', orbit: 58, size: 4, color: '#9c9494',
      desc: 'The scorched sprinter: a cratered world that races around the Sun in 88 days while its surface swings through a 600-degree temperature range.',
      facts: [['4,879 km', 'diameter'], ['88 days', 'year'], ['59 days', 'one rotation'], ['0', 'moons']],
      orb: ['#c9c2bd', '#6e6660'] },
    { key: 'venus', name: 'Venus', type: '02 · Terrestrial', orbit: 82, size: 6.5, color: '#e6c98f',
      desc: 'A runaway greenhouse under permanent clouds of sulfuric acid — hot enough to melt lead. Its day is longer than its year, and it spins backwards.',
      facts: [['12,104 km', 'diameter'], ['225 days', 'year'], ['464 °C', 'surface'], ['243 days', 'one rotation']],
      orb: ['#f4dfae', '#b98d4f'] },
    { key: 'earth', name: 'Earth', type: '03 · Terrestrial', orbit: 108, size: 7, color: '#4f8fd3',
      desc: 'The only place in the universe confirmed to host life — and the only planet not named after a god. Every human who has ever lived, lived here.',
      facts: [['12,742 km', 'diameter'], ['365.25 days', 'year'], ['1', 'moon'], ['29.8 km/s', 'orbital speed']],
      orb: ['#7db8f0', '#1d4e97'] },
    { key: 'mars', name: 'Mars', type: '04 · Terrestrial', orbit: 136, size: 5.5, color: '#d1603d',
      desc: 'The next world humans will walk on — home to the solar system’s tallest volcano and a canyon as long as a continent.',
      facts: [['6,779 km', 'diameter'], ['687 days', 'year'], ['2', 'moons'], ['−63 °C', 'average']],
      img: 'assets/mars.webp' },
    { key: 'jupiter', name: 'Jupiter', type: '05 · Gas Giant', orbit: 196, size: 16, color: '#c9a074',
      desc: 'The king of planets — heavier than all the others combined, guarding the inner system by flinging comets away with its gravity.',
      facts: [['139,820 km', 'diameter'], ['11.9 yrs', 'year'], ['95', 'moons'], ['9.9 hrs', 'one rotation']],
      img: 'assets/jupiter.webp' },
    { key: 'saturn', name: 'Saturn', type: '06 · Gas Giant', orbit: 248, size: 13, ring: true, color: '#d9c9a3',
      desc: 'The jewel of the system: rings 282,000 km wide and in places only ten meters thick, orbited by moons with underground oceans.',
      facts: [['116,460 km', 'diameter'], ['29.4 yrs', 'year'], ['146', 'moons'], ['0.69 g/cm³', 'floats in water']],
      img: 'assets/saturn.webp' },
    { key: 'uranus', name: 'Uranus', type: '07 · Ice Giant', orbit: 296, size: 10, color: '#9fd8dc',
      desc: 'The sideways planet — knocked over long ago, it rolls around the Sun on its side, each pole getting 42 years of daylight then 42 of night.',
      facts: [['50,724 km', 'diameter'], ['84 yrs', 'year'], ['28', 'moons'], ['98°', 'axial tilt']],
      orb: ['#c8ecef', '#4f9aa3'] },
    { key: 'neptune', name: 'Neptune', type: '08 · Ice Giant', orbit: 340, size: 9.5, color: '#4169d8',
      desc: 'Found with mathematics before any telescope saw it. The windiest place known — supersonic storms circle a world that takes 165 years to orbit once.',
      facts: [['49,244 km', 'diameter'], ['165 yrs', 'year'], ['2,100 km/h', 'winds'], ['16', 'moons']],
      img: 'assets/neptune.webp' }
  ];

  const EARTH_ORBIT = 108;
  const EARTH_PERIOD_S = 36;        // seconds per Earth year at 1× speed
  const DAYS_PER_SEC_1X = 365.25 / EARTH_PERIOD_S; // ≈10

  // deterministic starting angles, spread pleasantly
  BODIES.forEach((b, i) => { b.angle = (i * 2.399963) % (Math.PI * 2); });

  // asteroid belt between Mars and Jupiter
  const BELT = Array.from({ length: 240 }, (_, i) => ({
    r: 158 + ((i * 7919) % 100) / 100 * 26,
    a: ((i * 104729) % 628) / 100,
    s: 0.35 + ((i * 31) % 10) / 14
  }));
  let beltSpin = 0;

  /* ---------- sizing ---------- */
  let W, H, S, cx, cy;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = Math.min(W, Math.round(window.innerHeight * 0.72));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    S = (Math.min(W, H) / 2 - 14) / 356;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  /* ---------- state ---------- */
  let speed = reduceMotion ? 0 : 1;
  let hovered = null;
  let selected = SUN;
  const positions = new Map(); // key -> {x, y, r}

  const slider = document.getElementById('orrery-speed');
  const rate = document.getElementById('orrery-rate');
  slider.value = String(speed);
  function updateRate() {
    if (speed === 0) { rate.textContent = 'paused'; return; }
    const d = DAYS_PER_SEC_1X * speed;
    rate.textContent = d >= 365
      ? '1 s ≈ ' + (d / 365.25).toFixed(1) + ' years'
      : '1 s ≈ ' + Math.round(d) + ' days';
  }
  slider.addEventListener('input', () => { speed = parseFloat(slider.value); updateRate(); });
  updateRate();

  /* ---------- drawing ---------- */
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);

    // orbits
    for (const b of BODIES) {
      const active = b === hovered || b === selected;
      ctx.beginPath();
      ctx.arc(cx, cy, b.orbit * S, 0, Math.PI * 2);
      ctx.strokeStyle = active ? 'rgba(94, 234, 212, 0.5)' : 'rgba(167, 139, 250, 0.16)';
      ctx.lineWidth = active ? 1.4 : 1;
      ctx.stroke();
    }

    // asteroid belt
    beltSpin += dt * 0.008 * speed;
    ctx.fillStyle = 'rgba(200, 195, 220, 0.35)';
    for (const p of BELT) {
      const x = cx + Math.cos(p.a + beltSpin) * p.r * S;
      const y = cy + Math.sin(p.a + beltSpin) * p.r * S;
      ctx.fillRect(x, y, p.s, p.s);
    }

    // sun
    const sunR = 20 * S + 6;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 3);
    g.addColorStop(0, 'rgba(255, 236, 170, 0.95)');
    g.addColorStop(0.25, 'rgba(255, 190, 90, 0.55)');
    g.addColorStop(1, 'rgba(255, 160, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fill();
    positions.set('sun', { x: cx, y: cy, r: sunR + 4 });

    // planets
    for (const b of BODIES) {
      const period = EARTH_PERIOD_S * Math.pow(b.orbit / EARTH_ORBIT, 1.5);
      b.angle += dt * speed * (Math.PI * 2) / period;

      const x = cx + Math.cos(b.angle) * b.orbit * S;
      const y = cy + Math.sin(b.angle) * b.orbit * S;
      const r = Math.max(b.size * S, 2.5);
      positions.set(b.key, { x, y, r: r + 6 });

      // soft glow
      const pg = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
      pg.addColorStop(0, b.color + 'aa');
      pg.addColorStop(1, b.color + '00');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // body with a day/night shade facing the sun
      const bg = ctx.createRadialGradient(
        x - Math.cos(b.angle) * r * 0.5, y - Math.sin(b.angle) * r * 0.5, r * 0.2,
        x, y, r
      );
      bg.addColorStop(0, lighten(b.color));
      bg.addColorStop(1, b.color);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      if (b.ring) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.4);
        ctx.strokeStyle = 'rgba(217, 201, 163, 0.75)';
        ctx.lineWidth = Math.max(1.4, r * 0.16);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.85, r * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // selection / hover ring + label
      if (b === selected || b === hovered) {
        ctx.strokeStyle = b === selected ? 'rgba(94, 234, 212, 0.9)' : 'rgba(238, 240, 255, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(238, 240, 255, 0.9)';
        ctx.font = '11px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, x, y - r - 10);
      }
    }
  }

  function lighten(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16) + 70);
    const g2 = Math.min(255, ((n >> 8) & 255) + 70);
    const b = Math.min(255, (n & 255) + 70);
    return 'rgb(' + r + ',' + g2 + ',' + b + ')';
  }

  /* ---------- interaction ---------- */
  function bodyAt(px, py) {
    for (const b of BODIES) {
      const p = positions.get(b.key);
      if (p && Math.hypot(px - p.x, py - p.y) <= p.r) return b;
    }
    const s = positions.get('sun');
    if (s && Math.hypot(px - s.x, py - s.y) <= s.r) return SUN;
    return null;
  }

  function pointerPos(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  canvas.addEventListener('mousemove', (e) => {
    const [px, py] = pointerPos(e);
    hovered = bodyAt(px, py);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  });
  canvas.addEventListener('mouseleave', () => { hovered = null; });
  canvas.addEventListener('click', (e) => {
    const [px, py] = pointerPos(e);
    const hit = bodyAt(px, py);
    if (hit) { selected = hit; renderPanel(hit); }
  });

  /* ---------- dossier panel ---------- */
  function renderPanel(b) {
    const media = b.img
      ? '<img class="panel-img" src="' + b.img + '" alt="' + b.name + '" />'
      : '<div class="panel-orb" style="--o1:' + (b.orb ? b.orb[0] : b.color) +
        ';--o2:' + (b.orb ? b.orb[1] : b.color) + '"></div>';

    panel.innerHTML =
      '<div class="panel-media">' + media + '</div>' +
      '<p class="planet-index">' + b.type + '</p>' +
      '<h3>' + b.name + '</h3>' +
      '<p class="panel-desc">' + b.desc + '</p>' +
      '<ul class="facts panel-facts">' +
      b.facts.map((f) => '<li><strong>' + f[0] + '</strong><span>' + f[1] + '</span></li>').join('') +
      '</ul>';
  }
  renderPanel(SUN);

  /* ---------- loop, paused off-screen ---------- */
  let visible = true;
  new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin: '80px' }
  ).observe(canvas);

  let last = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    draw(dt);
  })(last);
})();
