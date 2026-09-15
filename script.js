// -------------------------------------------------------------
// CONFIG
// -------------------------------------------------------------
// Paste your Formspree form ID here (https://formspree.io → New form → the
// part after /f/). While it is empty the form falls back to a mailto: link.
const FORMSPREE_ID = '';
const CONTACT_EMAIL = 'atanubiswas7450@gmail.com';

const FRAME_COUNT = 50;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// -------------------------------------------------------------
// CANVAS SCROLL-SCRUBBED IMAGE SEQUENCE
// -------------------------------------------------------------
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const images = [];
let lastRenderedIndex = -1;

let currentProgress = 0;
let targetProgress = 0;
const ease = 0.075;

function getFrameUrl(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `assets/frames/ezgif-frame-${paddedIndex}.jpg`;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  if (lastRenderedIndex !== -1) {
    renderFrame(lastRenderedIndex, true);
  }
}

function drawImageCover(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
  const drawWidth = imgWidth * ratio;
  const drawHeight = imgHeight * ratio;
  const shiftX = (canvasWidth - drawWidth) / 2;
  const shiftY = (canvasHeight - drawHeight) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight, shiftX, shiftY, drawWidth, drawHeight);
}

function renderFrame(index, force = false) {
  if (index === lastRenderedIndex && !force) return;

  const img = images[index - 1];
  if (img && img.complete && img.naturalWidth > 0) {
    drawImageCover(img);
    lastRenderedIndex = index;
    return;
  }

  // Frame not ready yet: draw the nearest loaded neighbour instead
  for (let offset = 1; offset < FRAME_COUNT; offset++) {
    const prev = images[index - 1 - offset];
    const next = images[index - 1 + offset];
    if (prev && prev.complete && prev.naturalWidth > 0) { drawImageCover(prev); break; }
    if (next && next.complete && next.naturalWidth > 0) { drawImageCover(next); break; }
  }
}

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  targetProgress = maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll));
  progressBar.style.setProperty('--progress', targetProgress.toFixed(4));
}

function preloadImages() {
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    img.onload = () => {
      if (i === 1 && lastRenderedIndex === -1) renderFrame(1);
    };
    images.push(img);
  }
}

function tick() {
  const diff = targetProgress - currentProgress;
  if (Math.abs(diff) > 0.00005) {
    currentProgress += diff * ease;
  } else {
    currentProgress = targetProgress;
  }

  const frameIndex = Math.min(
    FRAME_COUNT,
    Math.max(1, Math.round(1 + currentProgress * (FRAME_COUNT - 1)))
  );

  renderFrame(frameIndex);
  requestAnimationFrame(tick);
}

// -------------------------------------------------------------
// SCROLL IN / OUT REVEAL (IntersectionObserver)
// Three states: hidden-below → visible → hidden-above, in both directions.
// -------------------------------------------------------------
function setRevealState(el, state) {
  if (el.classList.contains(state)) return;
  el.classList.remove('is-visible', 'is-hidden-below', 'is-hidden-above');
  el.classList.add(state);
}

function initRevealObserver() {
  const elements = document.querySelectorAll('.scroll-in-out, .scroll-in-out-trigger');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => setRevealState(el, 'is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        setRevealState(el, 'is-visible');
      } else if (entry.boundingClientRect.top < 0) {
        setRevealState(el, 'is-hidden-above');
      } else {
        setRevealState(el, 'is-hidden-below');
      }
    });
  }, { rootMargin: '-12% 0px -12% 0px', threshold: 0 });

  elements.forEach((el) => observer.observe(el));
}

// -------------------------------------------------------------
// KINETIC TYPOGRAPHY
// -------------------------------------------------------------
function initKineticTitles() {
  const titles = document.querySelectorAll('.kinetic-title');
  titles.forEach((title) => {
    if (title.getAttribute('data-kinetic-init')) return;
    title.setAttribute('data-kinetic-init', 'true');

    const childNodes = Array.from(title.childNodes);
    title.innerHTML = '';
    let globalCharIndex = 0;

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);

        words.forEach((token) => {
          if (/^\s+$/.test(token)) {
            title.appendChild(document.createTextNode(token));
          } else if (token.length > 0) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'k-word';

            for (const char of token) {
              const charSpan = document.createElement('span');
              charSpan.className = 'k-char';
              charSpan.textContent = char;
              charSpan.style.setProperty('--char-index', globalCharIndex);
              wordSpan.appendChild(charSpan);
              globalCharIndex++;
            }
            title.appendChild(wordSpan);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const charSpan = document.createElement('span');
        charSpan.className = 'k-char ' + node.className;
        charSpan.textContent = node.textContent;
        charSpan.style.setProperty('--char-index', globalCharIndex);
        title.appendChild(charSpan);
        globalCharIndex++;
      }
    });

    title.style.setProperty('--total-chars', globalCharIndex);
  });
}

function initKineticGroups() {
  const groups = document.querySelectorAll('.kinetic-group');
  groups.forEach((group) => {
    const lines = Array.from(group.querySelectorAll('.kinetic-line')).filter((line) => {
      let parent = line.parentElement;
      while (parent && parent !== group) {
        if (parent.classList.contains('kinetic-group')) return false;
        parent = parent.parentElement;
      }
      return true;
    });

    lines.forEach((line, idx) => {
      line.style.setProperty('--line-index', idx);
      line.style.setProperty('--total-lines', lines.length);
    });
  });
}

// -------------------------------------------------------------
// NAVBAR, DOT NAV, BACK TO TOP
// -------------------------------------------------------------
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const dotNav = document.querySelector('.dot-nav');
const backToTop = document.querySelector('.back-to-top');
const progressBar = document.querySelector('.scroll-progress-bar');
const HERO_LEAVE_THRESHOLD = 80;

function handleChromeVisibility() {
  const y = window.scrollY || document.documentElement.scrollTop;
  const pastHero = y > HERO_LEAVE_THRESHOLD;

  navbar.classList.toggle('navbar-hidden', !pastHero);
  if (!pastHero) closeMobileNav();
  dotNav.classList.toggle('is-shown', pastHero);
  backToTop.classList.toggle('is-shown', y > window.innerHeight);
}

function closeMobileNav() {
  navbar.classList.remove('nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
}

function initMobileNav() {
  navToggle.addEventListener('click', () => {
    const open = navbar.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.querySelectorAll('.drawer-link').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });
}

function initSectionSpy() {
  const sections = document.querySelectorAll('section[id]');
  const dotLinks = document.querySelectorAll('.dot-link');
  const navLinks = document.querySelectorAll('.nav-link');

  const setActive = (id) => {
    dotLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === id));
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  };

  if (!('IntersectionObserver' in window)) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach((s) => spy.observe(s));
}

function initBackToTop() {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// -------------------------------------------------------------
// HERO: ROLE ROTATOR, CREDENTIALS FILTER, MAGNETIC BUTTONS
// -------------------------------------------------------------
function initRoleRotator() {
  const chips = document.querySelectorAll('.role-badge-row .role-chip');
  if (!chips.length) return;
  let activeIndex = 0;

  setInterval(() => {
    chips.forEach((c) => c.classList.remove('active'));
    activeIndex = (activeIndex + 1) % chips.length;
    chips[activeIndex].classList.add('active');
  }, 2500);
}

function initCredentialsFilter() {
  const tabs = document.querySelectorAll('.cred-tab-btn');
  const items = document.querySelectorAll('.cred-item-card');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      items.forEach((item) => {
        const show = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('is-filtered-out', !show);
      });
    });
  });
}

function initMagnetic() {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.magnetic').forEach((el) => {
    const strength = 0.28;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.setProperty('--mx', `${(x * strength).toFixed(1)}px`);
      el.style.setProperty('--my', `${(y * strength).toFixed(1)}px`);
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

// -------------------------------------------------------------
// STATS COUNT-UP
// -------------------------------------------------------------
function initCountUp() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const run = (el) => {
    const target = Number(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        run(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((c) => io.observe(c));
}

// -------------------------------------------------------------
// TIMELINE FILL
// -------------------------------------------------------------
const timeline = document.querySelector('.timeline');

function updateTimelineFill() {
  if (!timeline) return;
  const rect = timeline.getBoundingClientRect();
  const focal = window.innerHeight * 0.6;
  const progress = (focal - rect.top) / rect.height;
  timeline.style.setProperty('--timeline-progress', Math.min(1, Math.max(0, progress)).toFixed(3));
}

// -------------------------------------------------------------
// PROJECTS: FILTER + TILT
// -------------------------------------------------------------
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  const empty = document.querySelector('.projects-empty');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let shown = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-filtered-out', !show);
        if (show) shown++;
      });
      empty.hidden = shown > 0;
    });
  });
}

function initTilt() {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.tilt').forEach((card) => {
    const max = 6;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
}

// -------------------------------------------------------------
// CONTACT FORM (Formspree with mailto fallback)
// -------------------------------------------------------------
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');
  const submitBtn = form.querySelector('.btn-submit');
  const label = submitBtn.querySelector('.btn-label');
  const fields = ['name', 'email', 'subject', 'message'].map((id) => form.querySelector(`#${id}`));

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.classList.remove('is-success', 'is-error');
    if (kind) status.classList.add(kind);
  };

  const validate = () => {
    let ok = true;
    fields.forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== '';
      f.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    return ok;
  };

  fields.forEach((f) => f.addEventListener('input', () => f.classList.remove('is-invalid')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) {
      setStatus('Fill in every field, and check the email address.', 'is-error');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // No Formspree ID configured: hand off to the visitor's mail client.
    if (!FORMSPREE_ID) {
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      setStatus('Opening your mail app…', 'is-success');
      return;
    }

    submitBtn.classList.add('is-sending');
    label.textContent = 'Sending…';
    setStatus('');

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        form.reset();
        label.textContent = 'Sent';
        setStatus("Sent. I'll reply to your email within a day or two.", 'is-success');
        setTimeout(() => { label.textContent = 'Send message'; }, 4000);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      label.textContent = 'Send message';
      setStatus(`Couldn't send. Email me directly at ${CONTACT_EMAIL}.`, 'is-error');
    } finally {
      submitBtn.classList.remove('is-sending');
    }
  });
}

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
window.addEventListener('scroll', () => {
  updateScrollProgress();
  handleChromeVisibility();
  updateTimelineFill();
}, { passive: true });

window.addEventListener('resize', () => {
  resizeCanvas();
  updateTimelineFill();
});

resizeCanvas();
preloadImages();
initKineticTitles();
initKineticGroups();
initRevealObserver();
initSectionSpy();
initMobileNav();
initBackToTop();
initRoleRotator();
initCredentialsFilter();
initMagnetic();
initCountUp();
initProjectFilter();
initTilt();
initContactForm();
updateScrollProgress();
currentProgress = targetProgress;
handleChromeVisibility();
updateTimelineFill();
requestAnimationFrame(tick);
