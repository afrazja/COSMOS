/* ============================================================
   Your Place in Space — career cards + mission-role quiz
   All facts are real; heroes are real people.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- the ten careers ---------- */
  const CAREERS = [
    {
      key: 'rocket', icon: '🚀', title: 'Rocket Engineer',
      tag: 'Builds the machines that leave Earth',
      wow: 'Modern boosters fly to space, come back, and are caught in mid-air by giant metal arms — engineers designed every millimeter of that.',
      subjects: ['Math', 'Physics', 'Tech / shop class'],
      start: ['Build and fly a model rocket', 'Play Kerbal Space Program', 'Take apart something broken to see how it works'],
      hero: 'Tom Mueller — a logger’s son from a tiny town who taught himself engines and became SpaceX’s first rocket engineer.',
      path: 'Aerospace or mechanical engineering degree'
    },
    {
      key: 'robot', icon: '🤖', title: 'Robotics Engineer',
      tag: 'Builds rovers that explore where humans can’t yet',
      wow: 'The people who drive the Mars rovers send the commands at night, then sleep — the rover does its day’s work 250 million km away, alone.',
      subjects: ['Math', 'Physics', 'Computer science'],
      start: ['Join a robotics club (FIRST / LEGO League)', 'Get an Arduino starter kit', 'Build anything that moves by itself'],
      hero: 'Vandi Verma — grew up in India, now drives the Perseverance rover on Mars from her desk in California.',
      path: 'Robotics, mechatronics or electrical engineering'
    },
    {
      key: 'control', icon: '🎧', title: 'Flight Controller',
      tag: 'The calm voice in Mission Control',
      wow: 'The average age in Mission Control when Apollo 11 landed on the Moon was about 28 — most of them had been students six years earlier.',
      subjects: ['Physics', 'Math', 'Any subject that teaches calm under pressure'],
      start: ['Learn chess or strategy games', 'Try a flight simulator', 'Practice checklists — pilots and controllers live by them'],
      hero: 'Gene Kranz — the flight director who brought Apollo 13 home. "Failure is not an option."',
      path: 'Engineering or physics degree, then agency operations training'
    },
    {
      key: 'astro', icon: '🌌', title: 'Astrophysicist',
      tag: 'Figures out how the universe works',
      wow: 'The first photo of a black hole needed a telescope the size of Earth — so scientists linked eight telescopes on four continents into one.',
      subjects: ['Math (all of it)', 'Physics', 'Computer science'],
      start: ['Learn the constellations by name', 'Do math puzzles for fun', 'Watch the Moon through any telescope or binoculars'],
      hero: 'Katie Bouman — helped invent the algorithm that turned that data into the black hole picture, at age 29.',
      path: 'Physics degree, then a PhD in astrophysics'
    },
    {
      key: 'planet', icon: '🪐', title: 'Planetary Scientist',
      tag: 'Studies other worlds like a detective',
      wow: 'We have better maps of Mars than of Earth’s own ocean floor — made by scientists who have never left this planet.',
      subjects: ['Science', 'Geography', 'Chemistry'],
      start: ['Collect and identify rocks', 'Watch a meteor shower (they’re free)', 'Visit a natural history museum'],
      hero: 'Carolyn Porco — led the camera team at Saturn and chose where Cassini pointed its eyes for 13 years.',
      path: 'Geology, chemistry or physics, then planetary science'
    },
    {
      key: 'code', icon: '💻', title: 'Space Software Engineer',
      tag: 'Writes the code that flies',
      wow: 'The code that landed Apollo on the Moon, printed out, stood taller than the woman who led its creation — and it never once crashed.',
      subjects: ['Computer science', 'Math', 'Logic puzzles'],
      start: ['Make a game in Scratch', 'Learn Python (it’s free)', 'Automate something boring in your life'],
      hero: 'Margaret Hamilton — led the Apollo flight software team and invented the term "software engineering."',
      path: 'Computer science or software engineering degree'
    },
    {
      key: 'doctor', icon: '🩺', title: 'Flight Surgeon',
      tag: 'Keeps astronauts alive and healthy',
      wow: 'Astronauts grow up to 5 cm taller in space as their spines stretch — and it’s a doctor’s job to know what that does to a body over a year.',
      subjects: ['Biology', 'Chemistry', 'Physical education'],
      start: ['Take a first-aid course', 'Learn how your own body works', 'Ask a doctor what their strangest day was'],
      hero: 'Serena Auñón-Chancellor — flight surgeon who became an astronaut and treated patients in orbit.',
      path: 'Medical degree, then aerospace medicine'
    },
    {
      key: 'suit', icon: '🧑‍🚀', title: 'Spacesuit Designer',
      tag: 'Designs one-person spaceships you can wear',
      wow: 'A spacesuit has 16 layers and its own life support — the Apollo suits were sewn by hand, by seamstresses, to a tolerance of 0.4 millimeters.',
      subjects: ['Art & design', 'Physics', 'Textiles / making things'],
      start: ['Sketch inventions in a notebook', 'Learn to sew or 3D-print', 'Redesign an everyday object to work in zero gravity'],
      hero: 'The ILC Dover seamstresses — turned bra-factory skills into the suits that walked on the Moon.',
      path: 'Industrial design, materials or mechanical engineering'
    },
    {
      key: 'bio', icon: '🧬', title: 'Astrobiologist',
      tag: 'Hunts for life beyond Earth',
      wow: 'Tiny animals called tardigrades have survived the open vacuum of space — which means life is tougher than we ever guessed.',
      subjects: ['Biology', 'Chemistry', 'Earth science'],
      start: ['Look at pond water under a microscope', 'Keep a lab notebook of what you find', 'Read about extremophiles — life in impossible places'],
      hero: 'Chris McKay — searches Earth’s harshest deserts to learn how life might hide on Mars.',
      path: 'Biology or chemistry degree, then astrobiology research'
    },
    {
      key: 'story', icon: '🎨', title: 'Mission Storyteller',
      tag: 'Turns data into wonder',
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
    for (const c of CAREERS) {
      // no 'reveal' class: these are created after the scroll-reveal
      // observer has already run, so they'd stay invisible forever
      const el = document.createElement('article');
      el.className = 'career-card';
      el.id = 'career-' + c.key;
      el.innerHTML =
        '<div class="career-head"><span class="career-icon">' + c.icon + '</span>' +
        '<div><h3>' + c.title + '</h3><p class="career-tag">' + c.tag + '</p></div></div>' +
        '<p class="career-wow">' + c.wow + '</p>' +
        '<div class="career-block"><h4>School subjects that matter</h4><ul>' +
        c.subjects.map((s) => '<li>' + s + '</li>').join('') + '</ul></div>' +
        '<div class="career-block"><h4>Start this week</h4><ul>' +
        c.start.map((s) => '<li>' + s + '</li>').join('') + '</ul></div>' +
        '<p class="career-hero"><strong>Look up:</strong> ' + c.hero + '</p>' +
        '<p class="career-path">' + c.path + '</p>';
      grid.appendChild(el);
    }
  }

  /* ---------- quiz engine ---------- */
  const card = document.getElementById('quiz-card');
  if (!card) return;

  let step = 0;
  const scores = {};

  function startQuiz() {
    step = 0;
    for (const c of CAREERS) scores[c.key] = 0;
    document.querySelectorAll('.career-card.match').forEach((el) => el.classList.remove('match'));
    renderQuestion();
  }

  function renderQuestion() {
    const q = QUESTIONS[step];
    card.innerHTML =
      '<div class="quiz-progress">' +
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
        for (const key of q.opts[parseInt(btn.dataset.i, 10)][1]) scores[key] += 1;
        step += 1;
        if (step < QUESTIONS.length) renderQuestion();
        else renderResult();
      })
    );
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

    const target = document.getElementById('career-' + best.key);
    if (target) target.classList.add('match');
    document.getElementById('quiz-retake').addEventListener('click', startQuiz);
  }

  startQuiz();
})();
