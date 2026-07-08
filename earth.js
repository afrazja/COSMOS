/* ============================================================
   COSMOS — interactive 3D Earth (Three.js)
   Textured globe + cloud layer + fresnel atmosphere glow.
   Drag to rotate (OrbitControls), auto-rotates when idle,
   pauses rendering while off-screen to save battery.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('globe');
if (container) init(container);

function init(container) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    // No WebGL — hide the whole section rather than show an empty box
    document.getElementById('earth').style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.25, 3.1);

  /* ---------- lights: a "sun" + faint space ambience ---------- */
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-4, 1.5, 2.5);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x445588, 0.55));

  /* ---------- textures ---------- */
  const loader = new THREE.TextureLoader();
  const mapDay = loader.load('assets/3d/earth_atmos.jpg');
  const mapNormal = loader.load('assets/3d/earth_normal.jpg');
  const mapSpec = loader.load('assets/3d/earth_specular.jpg');
  const mapClouds = loader.load('assets/3d/earth_clouds.png');
  mapDay.colorSpace = THREE.SRGBColorSpace;

  /* ---------- earth ---------- */
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
      map: mapDay,
      normalMap: mapNormal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: mapSpec,
      specular: new THREE.Color(0x333344),
      shininess: 14
    })
  );
  scene.add(earth);

  /* ---------- clouds ---------- */
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.012, 64, 64),
    new THREE.MeshLambertMaterial({
      map: mapClouds,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    })
  );
  scene.add(clouds);

  /* ---------- atmosphere: fresnel rim glow ---------- */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.16, 64, 64),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {},
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

  /* ---------- controls ---------- */
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

  /* ---------- sizing ---------- */
  function resize() {
    const size = Math.min(container.clientWidth, 640);
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(container);

  /* ---------- render loop, gated by visibility ---------- */
  let visible = false;
  new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin: '120px' }
  ).observe(container);

  renderer.setAnimationLoop(() => {
    if (!visible) return;
    if (!reduceMotion) clouds.rotation.y += 0.00035; // clouds drift over the surface
    controls.update();
    renderer.render(scene, camera);
  });
}
