const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Boot intro (Grid terminal) =====
// Plays once per session; the <head> script already gated reduced-motion / seen visitors.
(function bootIntro() {
  if (!document.documentElement.classList.contains('booting')) return;
  const boot = document.querySelector('.boot-overlay');
  if (!boot) {
    document.documentElement.classList.remove('booting');
    return;
  }
  try { sessionStorage.setItem('grid-booted', '1'); } catch (e) {}

  const screen = boot.querySelector('.boot-screen');
  screen.innerHTML = '';
  let aborted = false, closed = false;
  const timers = [];

  const sleep = (ms) => new Promise((res) => {
    if (aborted) return res();
    timers.push(setTimeout(res, ms));
  });

  const line = (cls) => {
    const d = document.createElement('div');
    d.className = 'boot-line' + (cls ? ' ' + cls : '');
    screen.appendChild(d);
    return d;
  };

  const addCaret = (el) => {
    const c = document.createElement('span');
    c.className = 'boot-caret';
    c.textContent = '_';
    el.appendChild(c);
    return c;
  };

  // Types a full line char-by-char with a trailing caret, like a live terminal.
  const typeLine = async (text, cls, charDelay, pause, keepCaret) => {
    const el = line(cls);
    const caret = addCaret(el);
    for (const ch of text) {
      if (aborted) { caret.remove(); return el; }
      caret.insertAdjacentText('beforebegin', ch);
      await sleep(charDelay);
    }
    if (!keepCaret) caret.remove();
    if (pause) await sleep(pause);
    return el;
  };

  function endBoot() {
    if (closed) return;
    closed = true;
    boot.classList.add('done');
    const cleanup = () => {
      document.documentElement.classList.remove('booting');
      if (boot.parentNode) boot.remove();
    };
    boot.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 700);
  }

  function skip() {
    if (closed) return;
    aborted = true;
    timers.forEach(clearTimeout);
    endBoot();
  }
  window.addEventListener('keydown', skip, { once: true });
  boot.addEventListener('click', skip, { once: true });

  (async function run() {
    // screen powers on: a lone underscore, then the header reveals
    const head = line();
    const caret0 = addCaret(head);
    await sleep(550);
    if (aborted) return;
    caret0.remove();
    head.textContent = 'DANCOM SYSTEMS // GRID TERMINAL';
    head.classList.add('boot-head');
    await sleep(300);

    const C = 26;   // per-character typing delay
    const P = 170;  // pause between lines

    await typeLine('booting kernel ............ OK', null, C, P);
    line(); // spacer
    await sleep(90);
    await typeLine('login: dnassar', null, C, P);
    await typeLine('password: ••••••••••••', null, C, P);
    await typeLine('authenticating identity disc ... OK', null, C, P);
    line(); // spacer
    await sleep(90);
    await typeLine('> ACCESS GRANTED', 'boot-ok', C, P);
    await typeLine('> GREETINGS, PROGRAM.', 'boot-grid', C, 260);
    await typeLine('> establishing uplink to the grid', 'boot-grid', C, 0, true);
    await sleep(550);

    if (!aborted) endBoot();
  })();
})();

// ===== Typing effect in hero =====
const roles = [
  'Head of Development',
  'Cybersecurity Specialist',
  'AI & Automation Engineer',
  'IT Infrastructure Specialist'
];

const typedEl = document.getElementById('typed');
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (!deleting) {
    charIndex++;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 2200);
      return;
    }
    setTimeout(typeLoop, 70);
  } else {
    charIndex--;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeLoop, 400);
      return;
    }
    setTimeout(typeLoop, 35);
  }
}

if (reducedMotion) {
  typedEl.textContent = roles[0];
} else {
  typeLoop();
}

// ===== Scroll reveal =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ===== Animated counters =====
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);

      if (reducedMotion) {
        el.textContent = target;
        counterObserver.unobserve(el);
        return;
      }

      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(progress * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-num').forEach((el) => counterObserver.observe(el));

// ===== Mobile nav toggle =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// ===== Smooth TRON cursor =====
const cursorFx = document.querySelector('.cursor-fx');
// live MediaQueryList — checked per-event, not once at load, so a late-reported
// or hot-plugged mouse still activates the cursor
const finePointer = window.matchMedia('(pointer: fine)');

if (cursorFx && !reducedMotion) {
  let targetX = 0, targetY = 0;
  let x = 0, y = 0;
  let started = false;

  function follow() {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    cursorFx.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    requestAnimationFrame(follow);
  }

  document.addEventListener('mousemove', (e) => {
    if (!finePointer.matches) return;
    targetX = e.clientX;
    targetY = e.clientY;
    cursorFx.classList.toggle('is-link', !!e.target.closest('a, button'));
    if (!started) {
      started = true;
      x = targetX;
      y = targetY;
      document.body.classList.add('has-cursor-fx');
      requestAnimationFrame(follow);
    }
  });
}

// ===== Contact form (FormSubmit AJAX) =====
const contactForm = document.getElementById('contact-form');
const formStatus = contactForm.querySelector('.form-status');
const submitBtn = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  formStatus.className = 'form-status';
  formStatus.textContent = '// TRANSMITTING...';

  try {
    const res = await fetch('https://formsubmit.co/ajax/danny.joe.nsr@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    await res.json();
    contactForm.reset();
    formStatus.className = 'form-status ok';
    formStatus.textContent = '// MESSAGE SENT — I\'LL GET BACK TO YOU SOON';
  } catch (err) {
    formStatus.className = 'form-status err';
    formStatus.textContent = '// TRANSMISSION FAILED — EMAIL ME DIRECTLY AT DANNY.JOE.NSR@GMAIL.COM';
  } finally {
    submitBtn.disabled = false;
  }
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id], header[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navAnchors.forEach((a) =>
        a.classList.toggle('active', a.getAttribute('href') === '#' + id)
      );
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((s) => sectionObserver.observe(s));
