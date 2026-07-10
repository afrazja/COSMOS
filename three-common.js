/* ============================================================
   three-common.js — shared Three.js helpers
   Used by earth.js (home globe) and iss-globe.js (sky tracker);
   system3d.js keeps its own scene but shares the same patterns.
   ============================================================ */

import * as THREE from 'three';

/* renderer with the site's standard settings, mounted in a container */
export function makeRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  return renderer;
}

/* pause rendering while off-screen; returns () => visible */
export function gateVisibility(el, rootMargin = '120px') {
  let visible = false;
  new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { rootMargin }
  ).observe(el);
  return () => visible;
}

/* square canvas that tracks its container's width, capped */
export function installSquareResize(container, renderer, camera, max = 640) {
  function resize() {
    const size = Math.min(container.clientWidth, max);
    if (!size) return;
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(container);
}

/* the textured Earth used on two pages: surface + clouds + fresnel glow */
export function buildEarth(parent, { radius = 1, cloudOpacity = 0.5 } = {}) {
  const loader = new THREE.TextureLoader();
  const mapDay = loader.load('assets/3d/earth_atmos.jpg');
  mapDay.colorSpace = THREE.SRGBColorSpace;

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshPhongMaterial({
      map: mapDay,
      normalMap: loader.load('assets/3d/earth_normal.jpg'),
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: loader.load('assets/3d/earth_specular.jpg'),
      specular: new THREE.Color(0x333344),
      shininess: 14
    })
  );
  parent.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.012, 64, 64),
    new THREE.MeshLambertMaterial({
      map: loader.load('assets/3d/earth_clouds.png'),
      transparent: true,
      opacity: cloudOpacity,
      depthWrite: false
    })
  );
  parent.add(clouds);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.16, 64, 64),
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
  parent.add(atmosphere);

  return { earth, clouds, atmosphere };
}

/* the standard two-light rig: warm sun + cool ambient fill */
export function addSunlight(scene, intensity = 2.2) {
  const sun = new THREE.DirectionalLight(0xffffff, intensity);
  sun.position.set(-4, 1.5, 2.5);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x445588, 0.55));
}
