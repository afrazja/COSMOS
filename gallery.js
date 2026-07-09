/* ============================================================
   The Gallery — masonry grid + fullscreen lightbox
   Images and captions come from assets/gallery/manifest.json.
   ============================================================ */

(function () {
  'use strict';

  const grid = document.getElementById('masonry');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbDesc = document.getElementById('lb-desc');
  const lbCredit = document.getElementById('lb-credit');

  let items = [];      // full manifest
  let visible = [];    // currently filtered list
  let current = -1;    // index into `visible`

  fetch('assets/gallery/manifest.json')
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      items = data;
      render('all');
    })
    .catch(() => {
      grid.innerHTML = '<p class="loading-pulse">The gallery could not be loaded — try refreshing.</p>';
    });

  /* ---------- grid ---------- */
  function render(filter) {
    visible = filter === 'all' ? items.slice() : items.filter((i) => i.tag === filter);
    grid.innerHTML = '';
    visible.forEach((item, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'shot';
      fig.innerHTML =
        '<img src="' + item.file + '" alt="' + esc(item.title) + '" loading="lazy" ' +
        'width="' + item.w + '" height="' + item.h + '" />' +
        '<figcaption><span class="shot-title">' + esc(item.title) + '</span>' +
        '<span class="shot-credit">' + esc(item.credit) + '</span></figcaption>';
      fig.addEventListener('click', () => open(idx));
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'View ' + item.title + ' fullscreen');
      fig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(idx); }
      });
      grid.appendChild(fig);
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ---------- filters ---------- */
  document.querySelectorAll('.gallery-filters .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filters .chip').forEach((c) => {
        c.classList.remove('on');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('on');
      chip.setAttribute('aria-pressed', 'true');
      render(chip.dataset.filter);
    });
  });

  /* ---------- lightbox ---------- */
  function open(idx) {
    current = idx;
    show();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lightbox.classList.add('open'));
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 250);
  }

  function show() {
    const item = visible[current];
    lbImg.src = item.file;
    lbImg.alt = item.title;
    lbTitle.textContent = item.title;
    lbDesc.textContent = item.desc;
    lbCredit.textContent = item.credit;
    // warm the neighbours' cache for instant paging
    [current + 1, current - 1].forEach((i) => {
      const n = visible[(i + visible.length) % visible.length];
      if (n) { const im = new Image(); im.src = n.file; }
    });
  }

  function step(dir) {
    current = (current + dir + visible.length) % visible.length;
    show();
  }

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => step(-1));
  document.getElementById('lb-next').addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();
