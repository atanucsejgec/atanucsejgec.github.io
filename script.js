const FRAME_COUNT = 50;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const images = [];
let imagesLoadedCount = 0;
let lastRenderedIndex = -1;

let currentProgress = 0;
let targetProgress = 0;
const ease = 0.075; // Buttery smooth interpolation factor

// Generate frame URL from index (1 to 50)
function getFrameUrl(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `ezgif-264d2cc11ade905b-jpg/ezgif-frame-${paddedIndex}.jpg`;
}

// Resize canvas to match display window taking devicePixelRatio into account
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  // Force re-render of current frame
  if (lastRenderedIndex !== -1) {
    renderFrame(lastRenderedIndex, true);
  }
}

// Draw image preserving aspect ratio with cover mode
function drawImageCover(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const hRatio = canvasWidth / imgWidth;
  const vRatio = canvasHeight / imgHeight;
  const ratio = Math.max(hRatio, vRatio);

  const drawWidth = imgWidth * ratio;
  const drawHeight = imgHeight * ratio;
  const shiftX = (canvasWidth - drawWidth) / 2;
  const shiftY = (canvasHeight - drawHeight) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight, shiftX, shiftY, drawWidth, drawHeight);
}

// Render a specific frame index (1 to FRAME_COUNT)
function renderFrame(index, force = false) {
  if (index === lastRenderedIndex && !force) return;

  const img = images[index - 1];
  if (img && img.complete && img.naturalWidth > 0) {
    drawImageCover(img);
    lastRenderedIndex = index;
  } else {
    // If targeted frame isn't loaded yet, find the nearest loaded frame
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = images[index - 1 - offset];
      const next = images[index - 1 + offset];
      if (prev && prev.complete && prev.naturalWidth > 0) {
        drawImageCover(prev);
        break;
      }
      if (next && next.complete && next.naturalWidth > 0) {
        drawImageCover(next);
        break;
      }
    }
  }
}

// Calculate scroll progress (0.0 to 1.0)
function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) {
    targetProgress = 0;
  } else {
    targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  }
}

// Preload all 50 frames
function preloadImages() {
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    img.onload = () => {
      imagesLoadedCount++;
      if (i === 1 && lastRenderedIndex === -1) {
        renderFrame(1);
      }
    };
    images.push(img);
  }
}

// Animation loop using linear interpolation (LERP)
function tick() {
  // Smoothly interpolate currentProgress towards targetProgress
  const diff = targetProgress - currentProgress;
  if (Math.abs(diff) > 0.00005) {
    currentProgress += diff * ease;
  } else {
    currentProgress = targetProgress;
  }

  // Map progress (0 to 1) to frame index (1 to FRAME_COUNT)
  const frameIndex = Math.min(
    FRAME_COUNT,
    Math.max(1, Math.round(1 + currentProgress * (FRAME_COUNT - 1)))
  );

  renderFrame(frameIndex);
  updateScrollInOutAnimations();
  requestAnimationFrame(tick);
}

// Louvre museum style in-and-out scroll reveal animation controller
function updateScrollInOutAnimations() {
  const elements = document.querySelectorAll('.scroll-in-out, .scroll-in-out-trigger');
  if (!elements || elements.length === 0) return;

  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const enterThreshold = windowHeight * 0.88; // Reveal when scrolling down into view
  const exitThreshold = windowHeight * 0.12;  // Lift & blur away when scrolling past the top

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();

    if (rect.top > enterThreshold) {
      // Element is below the viewport focal area
      if (!el.classList.contains('is-hidden-below')) {
        el.classList.add('is-hidden-below');
        el.classList.remove('is-visible', 'is-hidden-above');
      }
    } else if (rect.bottom < exitThreshold) {
      // Element has scrolled above the viewport focal area
      if (!el.classList.contains('is-hidden-above')) {
        el.classList.add('is-hidden-above');
        el.classList.remove('is-visible', 'is-hidden-below');
      }
    } else {
      // Element is in the active reading/focal viewport
      if (!el.classList.contains('is-visible')) {
        el.classList.add('is-visible');
        el.classList.remove('is-hidden-below', 'is-hidden-above');
      }
    }
  });
}

// Kinetic Typography: Split titles into kinetic characters with wave indices
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
        const text = node.textContent;
        const words = text.split(/(\s+)/);

        words.forEach((token) => {
          if (/^\s+$/.test(token)) {
            title.appendChild(document.createTextNode(token));
          } else if (token.length > 0) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'k-word';

            for (let char of token) {
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

// Automatically assign sequential cascade indices to line groups
function initKineticGroups() {
  const groups = document.querySelectorAll('.kinetic-group');
  groups.forEach((group) => {
    const lines = Array.from(group.querySelectorAll('.kinetic-line')).filter(line => {
      let parent = line.parentElement;
      while (parent && parent !== group) {
        if (parent.classList && parent.classList.contains('kinetic-group')) {
          return false;
        }
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

// Header scroll visibility logic (only show when scrolling up, never show in Frame 1)
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
const scrollDeltaThreshold = 8;
const FRAME_ONE_SCROLL_THRESHOLD = 80;

function handleNavbarScroll() {
  const currentScroll = window.scrollY || document.documentElement.scrollTop;

  // Never show header in Frame 1 / near the very top of the page
  if (currentScroll <= FRAME_ONE_SCROLL_THRESHOLD) {
    if (navbar) navbar.classList.add('navbar-hidden');
    lastScrollTop = currentScroll;
    return;
  }

  // Hide on scroll down
  if (currentScroll > lastScrollTop + scrollDeltaThreshold) {
    if (navbar) navbar.classList.add('navbar-hidden');
  } 
  // Only show when actively scrolling up
  else if (currentScroll < lastScrollTop - scrollDeltaThreshold) {
    if (navbar) navbar.classList.remove('navbar-hidden');
  }

  lastScrollTop = currentScroll;
}

// Expose animation state for the Grid Scale Inspector
window.getScrollAnimationState = () => ({
  frame: lastRenderedIndex > 0 ? lastRenderedIndex : Math.min(FRAME_COUNT, Math.max(1, Math.round(1 + currentProgress * (FRAME_COUNT - 1)))),
  progress: currentProgress,
  targetProgress: targetProgress,
  frameCount: FRAME_COUNT
});

// Initialize
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('scroll', updateScrollInOutAnimations, { passive: true });
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
window.addEventListener('resize', () => {
  resizeCanvas();
  updateScrollInOutAnimations();
});

// Cycle through the 6 core engineering domains
function initRoleRotator() {
  const chips = document.querySelectorAll('.role-chip');
  if (!chips || chips.length === 0) return;
  let activeIndex = 0;

  setInterval(() => {
    chips.forEach(c => c.classList.remove('active'));
    activeIndex = (activeIndex + 1) % chips.length;
    chips[activeIndex].classList.add('active');
  }, 2500);
}

// Interactive Credentials Hub Tab Filtering
function initCredentialsFilter() {
  const tabs = document.querySelectorAll('.cred-tab-btn');
  const items = document.querySelectorAll('.cred-item-card');
  if (!tabs || tabs.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      items.forEach((item) => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Initial setup
resizeCanvas();
preloadImages();
initKineticTitles();
initKineticGroups();
initCredentialsFilter();
updateScrollProgress();
currentProgress = targetProgress;
requestAnimationFrame(tick);
// Staggered reveal for initial viewport items
requestAnimationFrame(() => {
  updateScrollInOutAnimations();
});
initRoleRotator();


