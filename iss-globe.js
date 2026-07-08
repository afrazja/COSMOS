/* ============================================================
   Tonight's Sky — ISS tracker globe (Three.js)
   The Earth from earth.js, plus a pulsing red beacon at the live
   ISS position (fed by 'iss-update' events from sky.js). The globe
   eases around so the station stays facing the viewer; drag to
   look elsewhere and it resumes tracking a few seconds later.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('iss-globe');
if (container) init(container);

function init(container) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    document.getElementById('iss').style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.2, 3.05);

  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-4, 1.5, 2.5);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x445588, 0.6));

  const loader = new THREE.TextureLoader();
  const mapDay = loader.load('assets/3d/earth_atmos.jpg');
  mapDay.colorSpace = THREE.SRGBColorSpace;

  /* the pivot carries earth + beacon so tracking rotation is one value */
  const pivot = new THREE.Group();
  scene.add(pivot);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
      map: mapDay,
      normalMap: loader.load('assets/3d/earth_normal.jpg'),
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: loader.load('assets/3d/earth_specular.jpg'),
      specular: new THREE.Color(0x333344),
      shininess: 14
    })
  );
  pivot.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.012, 64, 64),
    new THREE.MeshLambertMaterial({
      map: loader.load('assets/3d/earth_clouds.png'),
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    })
  );
  pivot.add(clouds);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.16, 64, 64),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float rim = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.35, 0.62, 1.0, 1.0) * rim;
        }
      `
    })
  );
  scene.add(atmosphere);

  /* ---------- ISS beacon: dot + pulsing halo ring ---------- */
  const beacon = new THREE.Group();
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff4d4d })
  );
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.05, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff4d4d, side: THREE.DoubleSide,
      transparent: true, opacity: 0.8, depthWrite: false
    })
  );
  beacon.add(dot);
  beacon.add(halo);
  beacon.visible = false;
  pivot.add(beacon);

  const ISS_ALT = 1.07; // ~420 km, exaggerated slightly for visibility
  let targetRotY = null;

  document.addEventListener('iss-update', (e) => {
    const { lat, lon } = e.detail;
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    const x = -ISS_ALT * Math.sin(phi) * Math.cos(theta);
    const z = ISS_ALT * Math.sin(phi) * Math.sin(theta);
    const y = ISS_ALT * Math.cos(phi);
    beacon.position.set(x, y, z);
    beacon.lookAt(0, 0, 0); // halo ring lies flat against the surface
    beacon.visible = true;
    targetRotY = Math.atan2(-x, z); // pivot angle that faces the beacon to camera
  });

  /* ---------- controls: drag to explore, tracking resumes after ---------- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.55;

  let userHolding = false;
  let resumeTimer;
  controls.addEventListener('start', () => {
    userHolding = true;
    clearTimeout(resumeTimer);
  });
  controls.addEventListener('end', () => {
    resumeTimer = setTimeout(() => { userHolding = false; }, 4000);
  });

  function resize() {
    const size = Math.min(container.clientWidth, 620);
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(container);

  let visible = false;
  new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin: '120px' }
  ).observe(container);

  let t = 0;
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    t += 0.016;

    // ease the pivot so the beacon faces the camera (unless the user is looking around)
    if (targetRotY !== null && !userHolding && !reduceMotion) {
      let diff = targetRotY - pivot.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest path
      pivot.rotation.y += diff * 0.03;
    }

    // beacon pulse
    if (beacon.visible) {
      const s = 1 + Math.sin(t * 4) * 0.35;
      halo.scale.set(s, s, s);
      halo.material.opacity = 0.55 + Math.sin(t * 4) * 0.3;
    }

    if (!reduceMotion) clouds.rotation.y += 0.00025;
    controls.update();
    renderer.render(scene, camera);
  });
}
