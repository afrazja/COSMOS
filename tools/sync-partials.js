/* ============================================================
   sync-partials.js — single source of truth for nav + footer.

   The site is static (no build step), so shared chrome lives here
   and gets stamped into every page at AUTHOR time:

       node tools/sync-partials.js

   Edit the NAV/FOOTER templates or PAGES config below, run the
   command, commit. Never edit a <nav id="nav"> or <footer> block
   in a page by hand — it will be overwritten by the next sync.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const NAV = (cfg) => `<nav id="nav">
    <a class="logo" href="/">
      <span class="logo-orb" aria-hidden="true"></span>
      COSMOS
    </a>
    <ul class="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/system">The System</a></li>
      <li><a href="/journey">The Journey</a></li>
      <li><a href="/gallery">Gallery</a></li>
      <li><a href="/sky" class="nav-live">Tonight's Sky<span class="live-dot" aria-hidden="true"></span></a></li>
    </ul>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <a href="${cfg.cta[0]}" class="nav-cta">${cfg.cta[1]}</a>
  </nav>`;

const FOOTER = (cfg) => `<footer>
    <div class="footer-inner">
      <a class="logo" href="/">
        <span class="logo-orb" aria-hidden="true"></span>
        COSMOS
      </a>
      <p class="footer-quote">${cfg.quote}</p>
      <a class="footer-about" href="/about">About this site &amp; the human behind it</a>
      <a class="footer-contact" href="mailto:afz.javan@gmail.com">✉&nbsp;afz.javan@gmail.com</a>
      <p class="footer-fine">${cfg.fine}</p>
    </div>
  </footer>`;

const IMAGERY = 'Imagery: NASA / ESA archives, plus AI-generated concept art where labeled';

const PAGES = [
  { file: 'index.html', cta: ['/careers', 'Find Your Place'],
    quote: '"The cosmos is within us. We are made of star-stuff." — Carl Sagan',
    fine: IMAGERY + ' · Built for the endlessly curious' },
  { file: 'sky.html', cta: ['/careers', 'Find Your Place'],
    quote: '"The cosmos is within us. We are made of star-stuff." — Carl Sagan',
    fine: 'Live data: NASA APOD · wheretheiss.at · The Space Devs · ' + IMAGERY },
  { file: 'journey.html', cta: ['/careers', 'Find Your Place'],
    quote: '"The Earth is the cradle of humanity, but mankind cannot stay in the cradle forever." — Konstantin Tsiolkovsky',
    fine: IMAGERY },
  { file: 'gallery.html', cta: ['/careers', 'Find Your Place'],
    quote: '"Somewhere, something incredible is waiting to be known." — Carl Sagan',
    fine: 'Photography: NASA · ESA · CSA · STScI — Hubble &amp; James Webb space telescopes' },
  { file: 'careers.html', cta: ['#quiz', 'Take the Quiz'],
    quote: '"Nothing is impossible for the person who doesn\'t have to do it themselves — so learn to do it yourself." — Mission Control proverb',
    fine: 'Career facts checked against NASA, ESA and agency sources · ' + IMAGERY },
  { file: 'about.html', cta: ['/careers', 'Find Your Place'],
    quote: '"The map is mostly blank. That\'s the good news." — Afraz',
    fine: IMAGERY },
  { file: 'system.html', cta: ['/careers', 'Find Your Place'], footer: false },
  { file: '404.html', cta: ['/careers', 'Find Your Place'], footer: false },
];

for (const cfg of PAGES) {
  const p = path.join(ROOT, cfg.file);
  let t = fs.readFileSync(p, 'utf8');

  const navRe = /<nav id="nav">[\s\S]*?<\/nav>/;
  if (!navRe.test(t)) { console.error(cfg.file + ': NO NAV FOUND'); continue; }
  t = t.replace(navRe, NAV(cfg));

  if (cfg.footer !== false) {
    const footRe = /<footer>[\s\S]*?<\/footer>/;
    if (!footRe.test(t)) { console.error(cfg.file + ': NO FOOTER FOUND'); continue; }
    t = t.replace(footRe, FOOTER(cfg));
  }

  fs.writeFileSync(p, t);
  console.log(cfg.file, 'synced');
}
console.log('done — remember to commit the regenerated pages');
