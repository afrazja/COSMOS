/* ============================================================
   Home page — interactive 3D Earth
   Drag to rotate (auto-rotates when idle); lazy-initializes as
   the section approaches; pauses rendering while off-screen.
   Shared scene pieces live in three-common.js.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeRenderer, gateVisibility, installSquareResize, buildEarth, addSunlight } from './three-common.js';

const container = document.getElementById('globe');
if (container) {
  // don't spend bandwidth/GPU until the section is approaching
  const startWhenNear = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      startWhenNear.disconnect();
      init(container);
    }
  }, { rootMargin: '600px' });
  startWhenNear.observe(container);
}

function init(container) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = makeRenderer(container);
  } catch (e) {
    // No WebGL — hide the whole section rather than show an empty box
    document.getElementById('earth').style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.25, 3.1);

  addSunlight(scene);
  const { clouds } = buildEarth(scene, { radius: 1, cloudOpacity: 0.5 });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.55;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.6;

  // pause auto-rotation while the user is dragging, resume shortly after
  let resumeTimer;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    clearTimeout(resumeTimer);
  });
  controls.addEventListener('end', () => {
    if (reduceMotion) return;
    resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 2500);
  });

  installSquareResize(container, renderer, camera, 640);
  const isVisible = gateVisibility(container);

  renderer.setAnimationLoop(() => {
    if (!isVisible()) return;
    if (!reduceMotion) clouds.rotation.y += 0.00035; // clouds drift over the surface
    controls.update();
    renderer.render(scene, camera);
  });
}
