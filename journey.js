/* ============================================================
   The Journey — timeline line that draws itself as you scroll,
   lighting each milestone dot as the line reaches it.
   ============================================================ */

(function () {
  'use strict';

  const tl = document.getElementById('timeline');
  const fill = document.getElementById('timeline-fill');
  if (!tl || !fill) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const milestones = Array.from(tl.querySelectorAll('.milestone'));
  const eras = Array.from(tl.querySelectorAll('.era'));

  if (reduceMotion) {
    fill.style.transform = 'scaleY(1)';
    milestones.forEach((m) => m.classList.add('lit'));
    eras.forEach((e) => e.classList.add('lit'));
    return;
  }

  let ticking = false;

  function update() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = tl.getBoundingClientRect();
      // the line's "pen" sits at 62% of the viewport height
      const pen = window.innerHeight * 0.62;
      const p = Math.min(Math.max((pen - r.top) / r.height, 0), 1);
      fill.style.transform = `scaleY(${p.toFixed(4)})`;

      const penY = r.top + p * r.height;
      for (const m of milestones) {
        m.classList.toggle('lit', m.getBoundingClientRect().top + 44 <= penY);
      }
      for (const e of eras) {
        e.classList.toggle('lit', e.getBoundingClientRect().top + 20 <= penY);
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
