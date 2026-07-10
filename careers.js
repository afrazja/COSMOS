/* ============================================================
   Your Place in Space — career cards + mission-role quiz
   All facts are real; heroes are real people.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- the ten careers ---------- */
  const CAREERS = [
    {
      key: 'rocket', photo: 'assets/careers/rocket.webp', photoCap: 'A real flight engine on the move at NASA’s test stand.', icon: '🚀', title: 'Aerospace / Propulsion Engineer',
      tag: 'The rocket builder — makes the machines that leave Earth',
      wow: 'Modern boosters fly to space, come back, and are caught in mid-air by giant metal arms — engineers designed every millimeter of that.',
      subjects: ['Math', 'Physics', 'Tech / shop class'],
      start: ['Build and fly a model rocket', 'Play Kerbal Space Program', 'Take apart something broken to see how it works'],
      hero: 'Tom Mueller — a logger’s son from a tiny town who taught himself engines and became SpaceX’s first rocket engineer.',
      path: 'Aerospace or mechanical engineering degree'
    },
    {
      key: 'robot', photo: 'assets/careers/robot.webp', photoCap: 'Perseverance in the clean room, being readied for Mars.', icon: '🤖', title: 'Robotics Engineer',
      tag: 'Builds rovers that explore where humans can’t yet',
      wow: 'The people who drive the Mars rovers send the commands at night, then sleep — the rover does its day’s work 250 million km away, alone.',
      subjects: ['Math', 'Physics', 'Computer science'],
      start: ['Join a robotics club (FIRST / LEGO League)', 'Get an Arduino starter kit', 'Build anything that moves by itself'],
      hero: 'Vandi Verma — grew up in India, now drives the Perseverance rover on Mars from her desk in California.',
      path: 'Robotics, mechatronics or electrical engineering'
    },
    {
      key: 'control', photo: 'assets/careers/control.webp', photoCap: 'Mission Control, Houston, during Apollo. Average age: about 28.', icon: '🎧', title: 'Flight Controller',
      tag: 'The calm voice in Mission Control',
      wow: 'The average age in Mission Control when Apollo 11 landed on the Moon was about 28 — most of them had been students six years earlier.',
      subjects: ['Physics', 'Math', 'Any subject that teaches calm under pressure'],
      start: ['Learn chess or strategy games', 'Try a flight simulator', 'Practice checklists — pilots and controllers live by them'],
      hero: 'Gene Kranz — the flight director who brought Apollo 13 home. "Failure is not an option."',
      path: 'Engineering or physics degree, then agency operations training'
    },
    {
      key: 'astro', photo: 'assets/careers/astro.webp', photoCap: 'A Webb operator on the day the telescope’s mirror unfolded.', icon: '🌌', title: 'Astrophysicist',
      tag: 'Figures out how the universe works',
      wow: 'The first photo of a black hole needed a telescope the size of Earth — so scientists linked eight telescopes on four continents into one.',
      subjects: ['Math (all of it)', 'Physics', 'Computer science'],
      start: ['Learn the constellations by name', 'Do math puzzles for fun', 'Watch the Moon through any telescope or binoculars'],
      hero: 'Katie Bouman — helped invent the algorithm that turned that data into the black hole picture, at age 29.',
      path: 'Physics degree, then a PhD in astrophysics'
    },
    {
      key: 'planet', photo: 'assets/careers/planet.webp', photoCap: 'Real Moon dust in NASA’s Lunar Receiving Laboratory.', icon: '🪐', title: 'Planetary Scientist',
      tag: 'Studies other worlds like a detective',
      wow: 'We have better maps of Mars than of Earth’s own ocean floor — made by scientists who have never left this planet.',
      subjects: ['Science', 'Geography', 'Chemistry'],
      start: ['Collect and identify rocks', 'Watch a meteor shower (they’re free)', 'Visit a natural history museum'],
      hero: 'Carolyn Porco — led the camera team at Saturn and chose where Cassini pointed its eyes for 13 years.',
      path: 'Geology, chemistry or physics, then planetary science'
    },
    {
      key: 'code', photo: 'assets/careers/code.webp', photoCap: 'Katherine Johnson — the mathematician who calculated Apollo’s path.', icon: '💻', title: 'Flight Software Engineer',
      tag: 'Writes the code that flies',
      wow: 'The code that landed Apollo on the Moon, printed out, stood taller than the woman who led its creation — and it never once crashed.',
      subjects: ['Computer science', 'Math', 'Logic puzzles'],
      start: ['Make a game in Scratch', 'Learn Python (it’s free)', 'Automate something boring in your life'],
      hero: 'Margaret Hamilton — led the Apollo flight software team and invented the term "software engineering."',
      path: 'Computer science or software engineering degree'
    },
    {
      key: 'doctor', photo: 'assets/careers/doctor.webp', photoCap: 'A NASA doctor examines a Gemini astronaut, 1965.', icon: '🩺', title: 'Flight Surgeon',
      tag: 'Keeps astronauts alive and healthy',
      wow: 'Astronauts grow up to 5 cm taller in space as their spines stretch — and it’s a doctor’s job to know what that does to a body over a year.',
      subjects: ['Biology', 'Chemistry', 'Physical education'],
      start: ['Take a first-aid course', 'Learn how your own body works', 'Ask a doctor what their strangest day was'],
      hero: 'Serena Auñón-Chancellor — flight surgeon who became an astronaut and treated patients in orbit.',
      path: 'Medical degree, then aerospace medicine'
    },
    {
      key: 'suit', photo: 'assets/careers/suit.webp', photoCap: 'John Glenn being suited up, 1962 — read the name tag.', icon: '🧑‍🚀', title: 'Spacesuit Systems Engineer',
      tag: 'The suit designer — one-person spaceships you can wear',
      wow: 'A spacesuit has 16 layers and its own life support — the Apollo suits were sewn by hand, by seamstresses, to a tolerance of 0.4 millimeters.',
      subjects: ['Art & design', 'Physics', 'Textiles / making things'],
      start: ['Sketch inventions in a notebook', 'Learn to sew or 3D-print', 'Redesign an everyday object to work in zero gravity'],
      hero: 'The ILC Dover seamstresses — turned bra-factory skills into the suits that walked on the Moon.',
      path: 'Industrial design, materials or mechanical engineering'
    },
    {
      key: 'bio', photo: 'assets/careers/bio.webp', photoCap: 'Standing on Europa’s ice, Jupiter rising (artist’s illustration).', icon: '🧬', title: 'Astrobiologist',
      tag: 'Hunts for life beyond Earth',
      wow: 'Tiny animals called tardigrades have survived the open vacuum of space — which means life is tougher than we ever guessed.',
      subjects: ['Biology', 'Chemistry', 'Earth science'],
      start: ['Look at pond water under a microscope', 'Keep a lab notebook of what you find', 'Read about extremophiles — life in impossible places'],
      hero: 'Chris McKay — searches Earth’s harshest deserts to learn how life might hide on Mars.',
      path: 'Biology or chemistry degree, then astrobiology research'
    },
    {
      key: 'story', photo: 'assets/gallery/pillars-webb.webp', photoCap: 'Raw telescope data, turned into wonder — by an imaging artist.', icon: '🎨', title: 'Science Communicator',
      tag: 'The mission storyteller — turns data into wonder',
      wow: 'The Webb telescope’s famous pictures aren’t taken in color — imaging artists translate invisible infrared into the images that make the world gasp.',
      subjects: ['Art', 'Writing', 'Media & languages'],
      start: ['Explain something amazing to a friend in one minute', 'Make a video or drawing about your favorite planet', 'Start a science corner in the school paper'],
      hero: 'Joe DePasquale — the astro-artist who turns Webb’s raw data into the photographs in our Gallery.',
      path: 'Design, journalism or science communication — NASA has hired artists since 1962'
    }
  ];

  /* ---------- quiz ---------- */
  const QUESTIONS = [
    {
      q: 'It’s Saturday afternoon. You’d rather…',
      opts: [
        ['Build something with my hands', ['rocket', 'suit']],
        ['Beat a level everyone says is impossible', ['code', 'control']],
        ['Lie on the grass and wonder what’s up there', ['astro', 'planet']],
        ['Look after someone (or something) small', ['doctor', 'bio']],
        ['Make something cool and show everyone', ['story', 'robot']]
      ]
    },
    {
      q: 'Your favorite class is…',
      opts: [
        ['Math — patterns just make sense', ['astro', 'code']],
        ['Science experiments, especially messy ones', ['planet', 'bio']],
        ['Art and design', ['suit', 'story']],
        ['Biology and how bodies work', ['doctor', 'bio']],
        ['Tech class — I like tools and machines', ['rocket', 'robot']]
      ]
    },
    {
      q: 'In a group project, you’re the one who…',
      opts: [
        ['Stays calm when everything breaks', ['control', 'doctor']],
        ['Actually builds the thing', ['rocket', 'robot']],
        ['Keeps asking "but WHY does it work?"', ['astro', 'planet']],
        ['Makes the presentation amazing', ['story', 'suit']],
        ['Plans every step before starting', ['code', 'control']]
      ]
    },
    {
      q: 'Pick a superpower:',
      opts: [
        ['X-ray vision — see inside any machine', ['robot', 'rocket']],
        ['See invisible light from across the universe', ['astro', 'story']],
        ['Talk to any living creature', ['bio', 'doctor']],
        ['Never, ever panic', ['control', 'doctor']],
        ['Instantly speak every computer’s language', ['code', 'robot']]
      ]
    },
    {
      q: 'Which mission would you join?',
      opts: [
        ['First human crew to Mars', ['doctor', 'suit']],
        ['Building the first Moon base', ['rocket', 'robot']],
        ['Hunting for life in Europa’s hidden ocean', ['bio', 'planet']],
        ['Photographing the edge of the universe', ['astro', 'story']],
        ['Writing the code that lands the ship', ['code', 'control']]
      ]
    }
  ];

  /* ---------- render career cards ---------- */
  const grid = document.getElementById('career-grid');
  if (grid) {
    const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

    for (const c of CAREERS) {
      // no 'reveal' class: these are created after the scroll-reveal
      // observer has already run, so they'd stay invisible forever
      const el = document.createElement('article');
      el.className = 'career-card';
      el.id = 'career-' + c.key;
      el.innerHTML =
        '<button type="button" class="career-head" aria-expanded="' + String(!isMobile()) + '">' +
        '<span class="career-icon">' + c.icon + '</span>' +
        '<span class="career-headtext"><span class="career-title">' + c.title + '</span>' +
        '<span class="career-tag">' + c.tag + '</span></span>' +
        '<span class="career-chevron" aria-hidden="true">▾</span>' +
        '</button>' +
        '<div class="career-body">' +
        (c.photo ? '<figure class="career-photo"><img src="' + c.photo + '" alt="" loading="lazy" /><figcaption>' + c.photoCap + '</figcaption></figure>' : '') +
        '<p class="career-wow">' + c.wow + '</p>' +
        '<div class="career-block"><h4>School subjects that matter</h4><ul>' +
        c.subjects.map((s) => '<li>' + s + '</li>').join('') + '</ul></div>' +
        '<div class="career-block"><h4>Start this week</h4><ul>' +
        c.start.map((s) => '<li>' + s + '</li>').join('') + '</ul></div>' +
        '<p class="career-hero"><strong>Look up:</strong> ' + c.hero + '</p>' +
        '<p class="career-path">' + c.path + '</p>' +
        '</div>';
      grid.appendChild(el);

      // on phones the cards are tap-to-open accordions
      el.querySelector('.career-head').addEventListener('click', () => {
        if (!isMobile()) return;
        const open = el.classList.toggle('open');
        el.querySelector('.career-head').setAttribute('aria-expanded', String(open));
      });
    }
  }

  /* ---------- quiz engine ---------- */
  const card = document.getElementById('quiz-card');
  if (!card) return;

  // two neighbours shown alongside each quiz result
  const RELATED = {
    rocket: ['robot', 'control'], robot: ['rocket', 'code'], control: ['code', 'doctor'],
    astro: ['planet', 'code'], planet: ['astro', 'bio'], code: ['robot', 'control'],
    doctor: ['bio', 'suit'], suit: ['rocket', 'doctor'], bio: ['planet', 'doctor'],
    story: ['astro', 'planet']
  };

  let step = 0;
  let history = []; // chosen option index per answered question (for Back)
  const scores = {};

  function resetGrid() {
    document.querySelectorAll('.career-card').forEach((el) => {
      el.classList.remove('match', 'career-hidden');
    });
    const btn = document.getElementById('show-all-careers');
    if (btn) btn.remove();
  }

  function startQuiz() {
    step = 0;
    history = [];
    for (const c of CAREERS) scores[c.key] = 0;
    resetGrid();
    renderQuestion();
  }

  function renderQuestion() {
    const q = QUESTIONS[step];
    card.innerHTML =
      '<div class="quiz-progress">' +
      (step > 0 ? '<button class="quiz-back" id="quiz-back" aria-label="Back to previous question">← Back</button>' : '') +
      QUESTIONS.map((_, i) =>
        '<span class="quiz-dot' + (i < step ? ' done' : i === step ? ' now' : '') + '"></span>'
      ).join('') +
      '<span class="quiz-count">' + (step + 1) + ' / ' + QUESTIONS.length + '</span></div>' +
      '<h3 class="quiz-q">' + q.q + '</h3>' +
      '<div class="quiz-opts">' +
      q.opts.map((o, i) => '<button class="quiz-opt" data-i="' + i + '">' + o[0] + '</button>').join('') +
      '</div>';

    card.querySelectorAll('.quiz-opt').forEach((btn) =>
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.i, 10);
        history.push(i);
        for (const key of q.opts[i][1]) scores[key] += 1;
        step += 1;
        if (step < QUESTIONS.length) renderQuestion();
        else renderResult();
      })
    );

    const back = document.getElementById('quiz-back');
    if (back) back.addEventListener('click', () => {
      step -= 1;
      const undone = history.pop();
      for (const key of QUESTIONS[step].opts[undone][1]) scores[key] -= 1;
      renderQuestion();
    });
  }

  function renderResult() {
    let best = CAREERS[0];
    for (const c of CAREERS) if (scores[c.key] > scores[best.key]) best = c;

    card.innerHTML =
      '<div class="quiz-result">' +
      '<span class="quiz-result-icon">' + best.icon + '</span>' +
      '<p class="eyebrow">Mission assignment confirmed</p>' +
      '<h3>You’d make a great<br /><em>' + best.title + '</em></h3>' +
      '<p class="quiz-result-tag">' + best.tag + '</p>' +
      '<div class="quiz-result-actions">' +
      '<a class="btn btn-primary" href="#career-' + best.key + '">See your career card ↓</a>' +
      '<button class="btn btn-ghost" id="quiz-retake">Try again</button>' +
      '</div></div>';

    // the result shapes the page: your match + two related roles up front,
    // everything else behind "Explore every career"
    const keep = [best.key].concat(RELATED[best.key] || []);
    let hiddenCount = 0;
    document.querySelectorAll('.career-card').forEach((el) => {
      const key = el.id.replace('career-', '');
      const hide = !keep.includes(key);
      el.classList.toggle('career-hidden', hide);
      if (hide) hiddenCount += 1;
    });
    const target = document.getElementById('career-' + best.key);
    if (target) {
      target.classList.add('match', 'open'); // open = expanded on mobile too
      const head = target.querySelector('.career-head');
      if (head) head.setAttribute('aria-expanded', 'true');
      if (grid) grid.prepend(target); // your match leads the grid
    }
    if (grid && hiddenCount && !document.getElementById('show-all-careers')) {
      const show = document.createElement('button');
      show.id = 'show-all-careers';
      show.className = 'btn btn-ghost show-all-careers';
      show.textContent = 'Explore every career (+' + hiddenCount + ' more)';
      show.addEventListener('click', () => {
        document.querySelectorAll('.career-card.career-hidden')
          .forEach((el) => el.classList.remove('career-hidden'));
        show.remove();
      });
      grid.after(show);
    }
    document.getElementById('quiz-retake').addEventListener('click', startQuiz);
  }

  startQuiz();
})();
