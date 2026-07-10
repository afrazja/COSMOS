/* ============================================================
   The System — full 3D solar system (Three.js)
   Drag to orbit, scroll to zoom, click a planet (or its chip)
   to fly to it; the camera then tracks the planet as it moves
   so you can circle it from any angle. Textures are generated
   procedurally on canvas — Earth uses its real NASA maps.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('orrery3d');
const panel = document.getElementById('body-panel');
if (container && panel) init();

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    container.innerHTML = '<p class="loading-pulse">3D is not supported in this browser.</p>';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  /* ---------- data (facts real; distances/sizes stylized) ---------- */
  const SUN = {
    key: 'sun', name: 'The Sun', type: 'G-type Star', r: 2.3,
    desc: 'Our star holds 99.86% of the solar system’s mass and turns 600 million tons of hydrogen into helium every second. Its light takes 8 minutes 20 seconds to reach you.',
    facts: [['1.39M km', 'diameter'], ['5,500 °C', 'surface'], ['4.6B yrs', 'age'], ['8m 20s', 'light to Earth']]
  };

  const BODIES = [
    { key: 'mercury', name: 'Mercury', type: '01 · Terrestrial', orbit: 5.8, r: 0.30, spin: 0.02,
      tex: { base: '#9c9494', speckle: true },
      desc: 'The scorched sprinter: a cratered world that races around the Sun in 88 days while its surface swings through a 600-degree temperature range.',
      facts: [['4,879 km', 'diameter'], ['88 days', 'year'], ['59 days', 'one rotation'], ['0', 'moons']] },
    { key: 'venus', name: 'Venus', type: '02 · Terrestrial', orbit: 8.2, r: 0.46, spin: -0.008,
      tex: { bands: ['#efd9a8', '#dcc088', '#e9cf9a', '#d4b87e'] },
      desc: 'A runaway greenhouse under permanent clouds of sulfuric acid — hot enough to melt lead. Its day is longer than its year, and it spins backwards.',
      facts: [['12,104 km', 'diameter'], ['225 days', 'year'], ['464 °C', 'surface'], ['243 days', 'one rotation']] },
    { key: 'earth', name: 'Earth', type: '03 · Terrestrial', orbit: 10.8, r: 0.48, spin: 0.05, earth: true, moon: true,
      desc: 'The only place in the universe confirmed to host life — and the only planet not named after a god. Every human who has ever lived, lived here.',
      facts: [['12,742 km', 'diameter'], ['365.25 days', 'year'], ['1', 'moon'], ['29.8 km/s', 'orbital speed']] },
    { key: 'mars', name: 'Mars', type: '04 · Terrestrial', orbit: 13.6, r: 0.40, spin: 0.05,
      tex: { base: '#c1552f', speckle: true },
      desc: 'The next world humans will walk on — home to the solar system’s tallest volcano and a canyon as long as a continent.',
      facts: [['6,779 km', 'diameter'], ['687 days', 'year'], ['2', 'moons'], ['−63 °C', 'average']] },
    { key: 'jupiter', name: 'Jupiter', type: '05 · Gas Giant', orbit: 19.6, r: 1.15, spin: 0.09,
      tex: { bands: ['#d8b894', '#b98a5e', '#e8d0ac', '#a9764c', '#d3ab80', '#c19367', '#e2c49c'] },
      desc: 'The king of planets — heavier than all the others combined, guarding the inner system by flinging comets away with its gravity.',
      facts: [['139,820 km', 'diameter'], ['11.9 yrs', 'year'], ['95', 'moons'], ['9.9 hrs', 'one rotation']] },
    { key: 'saturn', name: 'Saturn', type: '06 · Gas Giant', orbit: 24.8, r: 1.0, spin: 0.085, ring: true,
      tex: { bands: ['#e6d6b2', '#d4bd8e', '#eee0c2', '#c9b183', '#e0cda6'] },
      desc: 'The jewel of the system: rings 282,000 km wide and in places only ten meters thick, orbited by moons with underground oceans.',
      facts: [['116,460 km', 'diameter'], ['29.4 yrs', 'year'], ['146', 'moons'], ['0.69 g/cm³', 'floats in water']] },
    { key: 'uranus', name: 'Uranus', type: '07 · Ice Giant', orbit: 29.6, r: 0.74, spin: 0.06,
      tex: { bands: ['#a5dde1', '#93cfd5', '#b4e6e9', '#9cd6da'] },
      desc: 'The sideways planet — knocked over long ago, it rolls around the Sun on its side, each pole getting 42 years of daylight then 42 of night.',
      facts: [['50,724 km', 'diameter'], ['84 yrs', 'year'], ['28', 'moons'], ['98°', 'axial tilt']] },
    { key: 'neptune', name: 'Neptune', type: '08 · Ice Giant', orbit: 34.0, r: 0.72, spin: 0.065,
      tex: { bands: ['#4169d8', '#3557b8', '#5a7ee0', '#3d63cc'] },
      desc: 'Found with mathematics before any telescope saw it. The windiest place known — supersonic storms circle a world that takes 165 years to orbit once.',
      facts: [['49,244 km', 'diameter'], ['165 yrs', 'year'], ['2,100 km/h', 'winds'], ['16', 'moons']] }
  ];
  BODIES.forEach((b, i) => { b.angle = (i * 2.399963) % (Math.PI * 2); });

  /* ---------- deep-dive content per body ---------- */
  const DEEP = {
    sun: {
      weird: [
        'About 1.3 million Earths would fit inside it — and it is 99.86% of everything in the solar system.',
        'Light born in its core spends up to 100,000 years fighting its way out — then just 8 minutes reaching you.',
        'It gets about 1% brighter every 100 million years. Very slowly, the Sun is turning up the heat.'
      ],
      missions: [
        'Parker Solar Probe (2018–) — flew through the Sun’s outer atmosphere, the fastest human-made object ever.',
        'SOHO (1995–) — has watched the Sun for 30 years and accidentally discovered 5,000+ comets.',
        'SDO (2010–) — photographs the whole Sun every 0.75 seconds.'
      ],
      who: ['Heliophysicists and astrophysicists study our star', 'astro']
    },
    mercury: {
      weird: [
        'A single solar day on Mercury (sunrise to sunrise) lasts 176 Earth days — two of its whole years.',
        'Despite roasting by day, there is water ice in its permanently shadowed polar craters.',
        'The whole planet is shrinking as its huge iron core cools — its crust has wrinkled like a drying apple.'
      ],
      missions: [
        'Mariner 10 (1974) — first flybys, mapped less than half the surface.',
        'MESSENGER (2011–2015) — first to orbit; found the polar ice.',
        'BepiColombo (arriving 2026) — Europe and Japan’s joint mission, en route now.'
      ],
      who: ['Planetary scientists decode worlds like this', 'planet']
    },
    venus: {
      weird: [
        'Its day is longer than its year — and it spins backwards, so the Sun rises in the west.',
        'On the highest mountains it "snows" metal — minerals that vaporize in the hot lowlands and frost out up high.',
        'Surface pressure equals being 900 meters underwater on Earth; the first landers were crushed in about an hour.'
      ],
      missions: [
        'Venera program (1961–1984) — Soviet landers sent the only photos ever taken from the surface.',
        'Magellan (1990–1994) — radar-mapped 98% of the planet through the clouds.',
        'DAVINCI & EnVision (2030s) — NASA and ESA are going back to ask if Venus was once habitable.'
      ],
      who: ['Planetary scientists and atmosphere experts study Venus', 'planet']
    },
    earth: {
      weird: [
        'Earth is not a sphere — spin flattens it, so you are ~21 km farther from the center at the equator.',
        'The days are getting longer: the Moon’s pull slows our spin by about 2 milliseconds per century.',
        'Earth’s outermost atmosphere (the geocorona) extends beyond the Moon — Apollo crews technically never left it.'
      ],
      missions: [
        'Thousands of satellites watch Earth right now — weather, climate, crops, oceans.',
        'Landsat (1972–) — the longest continuous record of our changing surface.',
        'The ISS (2000–) — a laboratory that circles Earth 16 times a day.'
      ],
      who: ['Earth scientists use space to understand home', 'planet']
    },
    mars: {
      weird: [
        'Olympus Mons is so wide that standing on its slope, you couldn’t tell it’s a mountain — it curves past the horizon.',
        'Sunsets on Mars are blue — fine dust scatters the light exactly opposite to Earth’s sky.',
        'Mars once had rivers, lakes and maybe a northern ocean. The riverbeds are still there, dry for 3 billion years.'
      ],
      missions: [
        'Viking 1 & 2 (1976) — first successful landings, first search for life.',
        'Curiosity (2012–) & Perseverance (2021–) — nuclear-powered rovers still exploring today.',
        'Ingenuity (2021–2024) — the first aircraft on another world; planned for 5 flights, flew 72.'
      ],
      who: ['Astrobiologists lead the hunt for past Martian life', 'bio']
    },
    jupiter: {
      weird: [
        'The Great Red Spot has been shrinking for a century — a storm older than any nation watching it.',
        'Deep inside, hydrogen is squeezed into a metal that flows — the engine of a magnetic field 20,000× Earth’s.',
        'Its moon Europa likely hides more liquid water than all of Earth’s oceans combined.'
      ],
      missions: [
        'Galileo (1995–2003) — first orbiter; dropped a probe into the clouds.',
        'Juno (2016–) — orbiting now, photographing storms the size of continents.',
        'Europa Clipper & JUICE (arriving ~2030) — going to the ocean moons, hunting habitability.'
      ],
      who: ['Planetary scientists study giants and their ocean moons', 'planet']
    },
    saturn: {
      weird: [
        'A permanent hexagonal storm sits on its north pole — six-sided, larger than Earth, and nobody fully knows why.',
        'The rings may be temporary: "ring rain" is slowly pulling them into the planet.',
        'Its moon Titan has rain, rivers and seas — of liquid methane at −179 °C.'
      ],
      missions: [
        'Cassini–Huygens (2004–2017) — 13 years in orbit; Huygens landed on Titan, the farthest landing ever.',
        'The Grand Finale (2017) — Cassini dove between planet and rings 22 times, then burned up on purpose.',
        'Dragonfly (2030s) — a nuclear drone that will fly across Titan’s dunes.'
      ],
      who: ['Planetary scientists — Cassini’s imaging team was led by one', 'planet']
    },
    uranus: {
      weird: [
        'It rolls around the Sun on its side — each pole gets 42 years of daylight, then 42 years of night.',
        'Deep inside, pressure may squeeze carbon into diamond rain.',
        'Its clouds contain hydrogen sulfide — the rotten-egg gas. Uranus, scientifically, stinks.'
      ],
      missions: [
        'Voyager 2 (1986) — humanity’s only visit: a single 5½-hour flyby.',
        'A flagship Uranus orbiter is the top-priority planetary mission recommended for the 2030s.',
        'Whoever flies it is in school right now.'
      ],
      who: ['Ice-giant specialists — the least-explored frontier', 'astro']
    },
    neptune: {
      weird: [
        'It radiates 2.6× more heat than it receives from the Sun — an internal furnace no one has fully explained.',
        'Its big moon Triton orbits backwards — a captured world that will one day be torn into a giant ring.',
        'Since its discovery in 1846, Neptune has completed just one full orbit (in 2011).'
      ],
      missions: [
        'Voyager 2 (1989) — the only visit; discovered the Great Dark Spot and Triton’s nitrogen geysers.',
        'Every picture of Neptune in your textbooks comes from that single flyby — or from telescopes.',
        'No mission is currently scheduled. The next one might be yours.'
      ],
      who: ['Planetary scientists — Neptune was found by a mathematician', 'planet']
    }
  };

  const EARTH_ORBIT = 10.8;
  const EARTH_PERIOD_S = 36;
  const DAYS_PER_SEC_1X = 365.25 / EARTH_PERIOD_S;

  /* ---------- scene ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 800);
  camera.position.set(0, 17, 40);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 3;
  controls.maxDistance = 120;

  scene.add(new THREE.AmbientLight(0x8890c0, 0.35));
  const sunLight = new THREE.PointLight(0xfff2d0, 1400, 0, 2);
  scene.add(sunLight);

  /* ---------- procedural textures ---------- */
  function canvasTex(draw, w = 512, h = 256) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ---------- texture loading (AI-generated maps) ---------- */
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function tex(url) {
    const t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }

  /* ---------- background: Milky Way skybox ---------- */
  const sky = tex('assets/3d/skybox.webp');
  sky.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = sky;


  /* ---------- sun ---------- */
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SUN.r, 48, 48),
    new THREE.MeshBasicMaterial({ map: tex('assets/3d/tex-sun.webp') })
  );
  scene.add(sunMesh);

  const glowTex = canvasTex((ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255, 235, 180, 1)');
    g.addColorStop(0.25, 'rgba(255, 190, 90, 0.55)');
    g.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, 256, 256);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  glow.scale.set(14, 14, 1);
  scene.add(glow);

  /* ---------- orbits + planets ---------- */
  const clickable = [sunMesh];
  sunMesh.userData.body = SUN;

  for (const b of BODIES) {
    // orbit line
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * b.orbit, 0, Math.sin(a) * b.orbit));
    }
    b.orbitLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.22 })
    );
    scene.add(b.orbitLine);

    // planet
    let mat;
    if (b.earth) {
      mat = new THREE.MeshPhongMaterial({
        map: loader.load('assets/3d/earth_atmos.jpg'),
        normalMap: loader.load('assets/3d/earth_normal.jpg'),
        normalScale: new THREE.Vector2(0.8, 0.8),
        specularMap: loader.load('assets/3d/earth_specular.jpg'),
        specular: new THREE.Color(0x333344),
        shininess: 12
      });
      mat.map.colorSpace = THREE.SRGBColorSpace;
    } else {
      mat = new THREE.MeshPhongMaterial({
        map: tex('assets/3d/tex-' + b.key + '.webp'),
        shininess: 6
      });
    }
    b.mesh = new THREE.Mesh(new THREE.SphereGeometry(b.r, 48, 48), mat);
    b.mesh.userData.body = b;
    b.group = new THREE.Group();
    b.group.add(b.mesh);
    scene.add(b.group);
    clickable.push(b.mesh);
    b.prevPos = new THREE.Vector3();

    if (b.key === 'uranus') b.mesh.rotation.z = Math.PI / 2 * 0.98; // the sideways planet

    if (b.ring) {
      const ringTex = tex('assets/3d/tex-rings.webp');
      const ringGeo = new THREE.RingGeometry(b.r * 1.25, b.r * 2.3, 96);
      // remap UVs so the texture runs radially
      const p = ringGeo.attributes.position;
      const uv = ringGeo.attributes.uv;
      const inner = b.r * 1.25, outer = b.r * 2.3;
      for (let i = 0; i < p.count; i++) {
        const d = Math.hypot(p.getX(i), p.getY(i));
        uv.setXY(i, (d - inner) / (outer - inner), 0.5);
      }
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        map: ringTex, side: THREE.DoubleSide, transparent: true, depthWrite: false
      }));
      ring.rotation.x = Math.PI / 2;
      b.group.add(ring);
      b.group.rotation.z = 0.28; // a pleasing tilt
    }

    if (b.moon) {
      b.moonPivot = new THREE.Group();
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 24, 24),
        new THREE.MeshPhongMaterial({ map: tex('assets/3d/tex-moon.webp'), shininess: 4 })
      );
      moon.position.set(1.05, 0, 0);
      b.moonPivot.add(moon);
      b.group.add(b.moonPivot);
    }
  }

  /* ---------- sizing: the container fills the viewport ---------- */
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(container);

  /* ---------- time control ---------- */
  let speed = reduceMotion ? 0 : 1;
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

  /* ---------- dossier panel + travel chips ---------- */
  function renderPanel(b) {
    const deep = DEEP[b.key];
    const tabs = deep
      ? '<div class="panel-tabs" role="tablist" aria-label="Dossier sections">' +
        '<button class="ptab on" role="tab" aria-selected="true" data-t="over">Overview</button>' +
        '<button class="ptab" role="tab" aria-selected="false" data-t="weird">Strange but true</button>' +
        '<button class="ptab" role="tab" aria-selected="false" data-t="miss">Missions</button>' +
        '</div>'
      : '';

    panel.innerHTML =
      '<p class="planet-index">' + b.type + '</p>' +
      '<h3>' + b.name + '</h3>' +
      tabs +
      '<div id="panel-tabbody"></div>' +
      (deep ? '<a class="panel-who" href="/careers#career-' + deep.who[1] + '">' + deep.who[0] + ' →</a>' : '');

    const body = panel.querySelector('#panel-tabbody');

    function showTab(t) {
      if (t === 'weird' && deep) {
        body.innerHTML = '<ul class="panel-list">' +
          deep.weird.map((s) => '<li>' + s + '</li>').join('') + '</ul>';
      } else if (t === 'miss' && deep) {
        body.innerHTML = '<ul class="panel-list">' +
          deep.missions.map((s) => '<li>' + s + '</li>').join('') + '</ul>';
      } else {
        body.innerHTML = '<p class="panel-desc">' + b.desc + '</p>' +
          '<ul class="facts panel-facts">' +
          b.facts.map((f) => '<li><strong>' + f[0] + '</strong><span>' + f[1] + '</span></li>').join('') +
          '</ul>';
      }
      panel.querySelectorAll('.ptab').forEach((el) => {
        const on = el.dataset.t === t;
        el.classList.toggle('on', on);
        el.setAttribute('aria-selected', String(on));
      });
    }

    panel.querySelectorAll('.ptab').forEach((el) =>
      el.addEventListener('click', () => showTab(el.dataset.t))
    );
    showTab('over');
  }

  const chipsWrap = document.getElementById('planet-chips');
  const chips = [];
  function addChip(label, body) {
    const c = document.createElement('button');
    c.className = 'chip';
    c.textContent = label;
    c.addEventListener('click', () => setFocus(body));
    chipsWrap.appendChild(c);
    chips.push({ el: c, body });
  }
  addChip('⤢ Overview', null);
  addChip('Sun', SUN);
  BODIES.forEach((b) => addChip(b.name, b));

  function markChips() {
    chips.forEach((c) => c.el.classList.toggle('on', c.body === focus || (c.body === null && focus === null)));
  }

  /* ---------- focus / fly-to system ---------- */
  let focus = null;      // null = overview, SUN, or a planet
  let flying = false;

  function bodyPos(b) {
    return b === SUN ? new THREE.Vector3(0, 0, 0) : b.group.position.clone();
  }

  function setFocus(b) {
    focus = b;
    flying = true;
    controls.minDistance = b && b !== SUN ? b.r * 2.2 : (b === SUN ? SUN.r * 2.4 : 3);
    BODIES.forEach((o) => o.orbitLine.material.opacity = (o === b) ? 0.6 : 0.22);
    BODIES.forEach((o) => o.orbitLine.material.color.set(o === b ? 0x5eead4 : 0xa78bfa));
    renderPanel(b || SUN);
    markChips();
    if (panelWrap) panelWrap.classList.remove('collapsed'); // show the dossier for the chosen body
  }

  /* ---------- app-mode UI: dossier toggle, info popover, fading hint ---------- */
  const panelWrap = document.getElementById('app-panel');
  const panelToggle = document.getElementById('panel-toggle');
  if (panelWrap && panelToggle) {
    if (window.innerWidth < 720) panelWrap.classList.add('collapsed'); // phones start tidy
    panelToggle.addEventListener('click', () => {
      const collapsed = panelWrap.classList.toggle('collapsed');
      panelToggle.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  const infoBtn = document.getElementById('app-info-btn');
  const infoBox = document.getElementById('app-info');
  if (infoBtn && infoBox) {
    infoBtn.addEventListener('click', () => {
      infoBox.hidden = !infoBox.hidden;
      infoBtn.setAttribute('aria-expanded', String(!infoBox.hidden));
    });
  }

  const hint = document.getElementById('app-hint');
  if (hint) {
    setTimeout(() => hint.classList.add('gone'), 8000);
    renderer.domElement.addEventListener('pointerdown', () => hint.classList.add('gone'), { once: true });
  }

  renderPanel(SUN);
  markChips();

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tip = document.createElement('div');
  tip.className = 'orbit-tip';
  container.appendChild(tip);

  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(clickable, false);
    return hits.length ? hits[0].object.userData.body : null;
  }

  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
    downAt = null;
    if (moved > 6) return; // it was a drag, not a click
    const hit = pick(e);
    if (hit) setFocus(hit);
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    const hit = pick(e);
    renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
    if (hit) {
      const r = container.getBoundingClientRect();
      tip.textContent = hit.name;
      tip.style.left = (e.clientX - r.left + 14) + 'px';
      tip.style.top = (e.clientY - r.top - 8) + 'px';
      tip.style.opacity = '1';
    } else {
      tip.style.opacity = '0';
    }
  });
  renderer.domElement.addEventListener('pointerleave', () => { tip.style.opacity = '0'; });

  /* ---------- render loop ---------- */
  let visible = true;
  new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin: '100px' }
  ).observe(container);

  const ORIGIN = new THREE.Vector3(0, 0, 0);
  let last = performance.now();

  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;

    // orbital motion
    for (const b of BODIES) {
      b.prevPos.copy(b.group.position);
      const period = EARTH_PERIOD_S * Math.pow(b.orbit / EARTH_ORBIT, 1.5);
      b.angle += dt * speed * (Math.PI * 2) / period;
      b.group.position.set(Math.cos(b.angle) * b.orbit, 0, Math.sin(b.angle) * b.orbit);
      b.mesh.rotation.y += b.spin * dt * (speed === 0 ? 1 : speed); // keep a gentle spin even paused
      if (b.moonPivot) b.moonPivot.rotation.y += dt * speed * 2.2;
    }

    // camera focus behaviour
    if (focus) {
      const p = bodyPos(focus);
      if (flying) {
        const dist = (focus === SUN ? SUN.r : focus.r) * 5.5 + 0.8;
        const dir = camera.position.clone().sub(p);
        if (dir.lengthSq() < 0.001) dir.set(0, 1, 1);
        dir.normalize();
        const desired = p.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * 0.3, 0));
        const k = reduceMotion ? 1 : 1 - Math.pow(0.004, dt);
        camera.position.lerp(desired, k);
        controls.target.lerp(p, k);
        if (camera.position.distanceTo(desired) < dist * 0.06 || reduceMotion) flying = false;
      } else if (focus !== SUN) {
        // ride along with the moving planet, keeping the user's viewing angle
        const delta = focus.group.position.clone().sub(focus.prevPos);
        camera.position.add(delta);
        controls.target.copy(focus.group.position);
      } else {
        controls.target.copy(ORIGIN);
      }
    } else if (flying) {
      const k = reduceMotion ? 1 : 1 - Math.pow(0.01, dt);
      controls.target.lerp(ORIGIN, k);
      if (controls.target.length() < 0.05 || reduceMotion) flying = false;
    }

    controls.update();
    renderer.render(scene, camera);
  });
}
