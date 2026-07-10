/* ============================================================
   Tonight's Sky — ISS tracker globe
   The shared Earth from three-common.js, plus a pulsing red
   beacon at the live ISS position (fed by 'iss-update' events
   from sky.js). The globe eases around so the station stays
   facing the viewer; drag to look elsewhere and tracking
   resumes a few seconds later.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeRenderer, gateVisibility, installSquareResize, buildEarth, addSunlight } from './three-common.js';

const container = document.getElementById('iss-globe');
if (container) init(container);

function init(container) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = makeRenderer(container);
  } catch (e) {
    document.getElementById('iss').style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.2, 3.05);

  addSunlight(scene, 2.1);

  /* the pivot carries earth + beacon so tracking rotation is one value */
  const pivot = new THREE.Group();
  scene.add(pivot);
  const { clouds } = buildEarth(pivot, { radius: 1, cloudOpacity: 0.45 });

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

  installSquareResize(container, renderer, camera, 620);
  const isVisible = gateVisibility(container);

  let t = 0;
  renderer.setAnimationLoop(() => {
    if (!isVisible()) return;
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
