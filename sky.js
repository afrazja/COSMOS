/* ============================================================
   Tonight's Sky — live data
   1. NASA Astronomy Picture of the Day
   2. ISS position (feeds the 3D globe via a custom event)
   3. Upcoming launches with live countdowns
   ============================================================ */

(function () {
  'use strict';

  /* ---------- page date ---------- */
  const dateEl = document.getElementById('sky-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ---------- 1. APOD ---------- */
  const apodMedia = document.getElementById('apod-media');

  // cached server proxy first (no rate-limit exposure); direct NASA as fallback
  fetch('/api/apod')
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() =>
      fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true')
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    )
    .then((d) => {
      document.getElementById('apod-title').textContent = d.title || 'Untitled';
      document.getElementById('apod-meta').textContent =
        [d.date, d.copyright ? '© ' + d.copyright.trim() : 'Public domain (NASA)'].join(' · ');
      document.getElementById('apod-text').textContent = d.explanation || '';

      const link = document.getElementById('apod-link');

      if (d.media_type === 'image') {
        apodMedia.innerHTML = '';
        const img = document.createElement('img');
        img.src = d.url;
        img.alt = d.title || 'NASA Astronomy Picture of the Day';
        apodMedia.appendChild(img);
        link.href = d.hdurl || d.url;
        link.hidden = false;
      } else if (d.media_type === 'video') {
        apodMedia.innerHTML = '';
        if (/\.(mp4|webm|mov)(\?|$)/i.test(d.url || '')) {
          // direct video file — play it right in the panel
          const v = document.createElement('video');
          v.src = d.url;
          v.controls = true;
          v.muted = true;
          v.loop = true;
          v.autoplay = true;
          v.playsInline = true;
          apodMedia.appendChild(v);
        } else if (d.thumbnail_url) {
          // hosted video (YouTube etc.) with a thumbnail available
          const img = document.createElement('img');
          img.src = d.thumbnail_url;
          img.alt = d.title || 'Video thumbnail';
          apodMedia.appendChild(img);
        } else {
          // hosted video, no thumbnail — embed the player
          const f = document.createElement('iframe');
          f.src = d.url;
          f.title = d.title || 'NASA Astronomy Picture of the Day video';
          f.allowFullscreen = true;
          f.loading = 'lazy';
          apodMedia.appendChild(f);
        }
        link.textContent = 'Watch the video ↗';
        link.href = d.url;
        link.hidden = false;
      } else {
        apodMedia.innerHTML = '<p class="loading-pulse">Today’s APOD is not an image.</p>';
        link.href = 'https://apod.nasa.gov/';
        link.textContent = 'Open APOD ↗';
        link.hidden = false;
      }
    })
    .catch(() => {
      apodMedia.innerHTML =
        '<p class="loading-pulse">Couldn’t reach NASA right now (their free key allows a few requests per hour). ' +
        'Refresh in a minute, or visit apod.nasa.gov directly.</p>';
    });

  /* ---------- 2. ISS position ---------- */
  const fmt = (n, digits) => Number(n).toFixed(digits);
  const issNote = document.getElementById('iss-note');
  let issFails = 0;

  function fetchISS() {
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => {
        issFails = 0;
        document.getElementById('iss-lat').textContent = fmt(d.latitude, 2) + '°';
        document.getElementById('iss-lon').textContent = fmt(d.longitude, 2) + '°';
        document.getElementById('iss-alt').textContent = Math.round(d.altitude) + ' km';
        document.getElementById('iss-vel').textContent =
          Math.round(d.velocity).toLocaleString('en-US') + ' km/h';
        issNote.textContent =
          d.visibility === 'daylight'
            ? 'The station is currently in daylight.'
            : 'The station is currently crossing Earth’s night side.';
        document.dispatchEvent(new CustomEvent('iss-update', {
          detail: { lat: d.latitude, lon: d.longitude }
        }));
      })
      .catch(() => {
        if (++issFails > 2) issNote.textContent = 'Signal lost — retrying…';
      });
  }
  fetchISS();
  setInterval(fetchISS, 5000);

  /* ---------- 3. Upcoming launches ---------- */
  const list = document.getElementById('launch-list');

  // cached server proxy first; direct API as local-dev fallback
  fetch('/api/launches')
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() =>
      fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=6')
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    )
    .then((d) => {
      const launches = (d.results || []).filter((l) => l.net);
      if (!launches.length) throw new Error('empty');

      list.innerHTML = '';
      for (const l of launches) {
        const when = new Date(l.net);
        const row = document.createElement('article');
        row.className = 'launch-row';
        row.innerHTML =
          '<div class="launch-count" data-net="' + when.getTime() + '">—</div>' +
          '<div class="launch-info">' +
            '<h3>' + esc(l.name || 'Unknown mission') + '</h3>' +
            '<p>' +
              esc(l.launch_service_provider ? l.launch_service_provider.name : 'Unknown provider') +
              ' · ' +
              esc(l.pad && l.pad.location ? l.pad.location.name : 'Unknown site') +
            '</p>' +
            '<p class="launch-when">' +
              when.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) +
              ' (your time)' +
            '</p>' +
          '</div>' +
          '<span class="launch-status ' + statusClass(l.status) + '">' +
            esc(l.status ? l.status.abbrev : '?') +
          '</span>';
        list.appendChild(row);
      }
      tickCountdowns();
      setInterval(tickCountdowns, 1000);
    })
    .catch(() => {
      list.innerHTML =
        '<p class="loading-pulse">The launch board is unreachable right now (the free API allows ' +
        '15 requests per hour). Check back shortly.</p>';
    });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function statusClass(status) {
    const a = status && status.abbrev ? status.abbrev.toLowerCase() : '';
    if (a === 'go') return 'go';
    if (a === 'tbc') return 'tbc';
    return 'tbd';
  }

  function tickCountdowns() {
    const now = Date.now();
    document.querySelectorAll('.launch-count').forEach((el) => {
      let ms = parseInt(el.dataset.net, 10) - now;
      if (ms <= 0) { el.textContent = 'LIFTOFF'; el.classList.add('lift'); return; }
      const d = Math.floor(ms / 86400000); ms %= 86400000;
      const h = Math.floor(ms / 3600000); ms %= 3600000;
      const m = Math.floor(ms / 60000); ms %= 60000;
      const s = Math.floor(ms / 1000);
      const pad = (n) => String(n).padStart(2, '0');
      el.textContent = 'T− ' + (d > 0 ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
    });
  }
})();
