const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
