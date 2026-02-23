/* =====================================================
   5HKT — MAIN JS v2
   Intro sequence + Snap scroll navigation
   ===================================================== */

// ── INTRO SEQUENCE ─────────────────────────────────────

const introEl    = document.getElementById('intro');
const introName  = document.getElementById('intro-name');
const introGlitch = document.getElementById('intro-glitch');
const progressBar = document.getElementById('intro-progress');
const skipBtn    = document.getElementById('intro-skip');
const siteEl     = document.getElementById('site');

// Sequence definition
const STEPS = [
  { text: '3HKT', hold: 900  },
  { text: '4HKT', hold: 900  },
  { text: '5HKT', hold: 1400 },
];

let introComplete = false;

function setProgress(pct) {
  progressBar.style.width = pct + '%';
}

function glitchTransition() {
  return new Promise(resolve => {
    introGlitch.textContent = introName.textContent;
    introGlitch.classList.add('glitching');
    setTimeout(() => {
      introGlitch.classList.remove('glitching');
      resolve();
    }, 420);
  });
}

function morphName(newText) {
  return new Promise(resolve => {
    introName.classList.remove('morphing');
    void introName.offsetWidth; // reflow
    introName.textContent = newText;
    introGlitch.textContent = newText;
    introName.classList.add('morphing');
    setTimeout(resolve, 320);
  });
}

async function runIntro() {
  await delay(300); // initial pause

  const totalTime = STEPS.reduce((s, x) => s + x.hold, 0) + 300;
  let elapsed = 0;

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];

    if (i > 0) {
      await glitchTransition();
      await morphName(step.text);
    }

    // Final step gets accent color
    if (i === STEPS.length - 1) {
      introName.classList.add('final');
      introGlitch.classList.add('final');
    }

    await delay(step.hold);
    elapsed += step.hold;
    setProgress((elapsed / totalTime) * 100);
  }

  setProgress(100);
  await delay(200);
  endIntro();
}

function endIntro() {
  if (introComplete) return;
  introComplete = true;

  introEl.classList.add('exit');
  siteEl.classList.remove('site--hidden');
  siteEl.classList.add('site--visible');
  document.body.classList.remove('no-scroll');

  setTimeout(() => {
    introEl.style.display = 'none';
    // Trigger hero reveal
    document.getElementById('sec-0').classList.add('in-view');
    updateSectionUI(0);
  }, 900);
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

skipBtn.addEventListener('click', endIntro);
runIntro();


// ── SNAP SCROLL NAVIGATION ──────────────────────────────

const snapContainer = document.getElementById('snap-container');
const sections = Array.from(document.querySelectorAll('.snap-section'));
const sideDots  = Array.from(document.querySelectorAll('.side-dot'));
const navLinks  = Array.from(document.querySelectorAll('.nav__link'));
const sectionIndexEl = document.getElementById('section-index');

const TOTAL = sections.length;
let currentSection = 0;
let isScrolling = false;
const SCROLL_COOLDOWN = 900; // ms between section changes

function goToSection(idx, smooth = true) {
  if (idx < 0 || idx >= TOTAL) return;
  if (idx === currentSection && !smooth) return;

  currentSection = idx;
  sections[idx].scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  updateSectionUI(idx);
}

function updateSectionUI(idx) {
  // Side dots
  sideDots.forEach((d, i) => d.classList.toggle('active', i === idx));

  // Nav links
  navLinks.forEach((l, i) => l.classList.toggle('active', i === idx));

  // Section index label
  sectionIndexEl.textContent =
    String(idx + 1).padStart(2, '0') + ' / ' + String(TOTAL).padStart(2, '0');

  // Reveal current section content
  sections.forEach((s, i) => s.classList.toggle('in-view', i === idx));
}

// Listen to scroll on the snap container (fires during/after snap)
snapContainer.addEventListener('scroll', () => {
  const scrollTop = snapContainer.scrollTop;
  const sectionH  = snapContainer.clientHeight;
  const nearest   = Math.round(scrollTop / sectionH);

  if (nearest !== currentSection) {
    currentSection = nearest;
    updateSectionUI(nearest);
  }
}, { passive: true });

// Mouse wheel — one step at a time
snapContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (isScrolling) return;

  const dir = e.deltaY > 0 ? 1 : -1;
  const next = currentSection + dir;
  if (next < 0 || next >= TOTAL) return;

  isScrolling = true;
  goToSection(next);
  setTimeout(() => { isScrolling = false; }, SCROLL_COOLDOWN);
}, { passive: false });

// Touch support
let touchStartY = 0;
snapContainer.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

snapContainer.addEventListener('touchend', e => {
  if (isScrolling) return;
  const diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) < 40) return; // ignore tiny swipes

  const dir = diff > 0 ? 1 : -1;
  const next = currentSection + dir;
  if (next < 0 || next >= TOTAL) return;

  isScrolling = true;
  goToSection(next);
  setTimeout(() => { isScrolling = false; }, SCROLL_COOLDOWN);
}, { passive: true });

// Keyboard arrow keys
window.addEventListener('keydown', e => {
  if (!introComplete) return;
  if (isScrolling) return;
  let dir = 0;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') dir = 1;
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   dir = -1;
  if (!dir) return;

  e.preventDefault();
  const next = currentSection + dir;
  if (next < 0 || next >= TOTAL) return;

  isScrolling = true;
  goToSection(next);
  setTimeout(() => { isScrolling = false; }, SCROLL_COOLDOWN);
});


// ── NAV / DOT CLICK ────────────────────────────────────

sideDots.forEach(dot => {
  dot.addEventListener('click', () => {
    if (!introComplete) return;
    goToSection(parseInt(dot.dataset.section));
  });
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (!introComplete) return;
    goToSection(parseInt(link.dataset.section));
  });
});

document.querySelector('.nav__logo').addEventListener('click', () => {
  if (!introComplete) return;
  goToSection(0);
});

// ── HAMBURGER / MOBILE OVERLAY ──────────────────────────

const hamburger = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileClose = document.getElementById('mobile-close');

hamburger.addEventListener('click', () => {
  mobileOverlay.classList.toggle('open');
  hamburger.classList.toggle('open');
});

mobileClose.addEventListener('click', () => {
  mobileOverlay.classList.remove('open');
  hamburger.classList.remove('open');
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    goToSection(parseInt(link.dataset.section));
    mobileOverlay.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ── CONTACT FORM URL ────────────────────────────────────
// Replace '#' with your Google Forms URL:
// document.getElementById('contact-btn').href = 'https://forms.google.com/...';
