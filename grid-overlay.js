// Grid View Scale & Scroll Position Inspector
(function () {
  let isVisible = false;
  let lastPinnedData = null;

  // Create Overlay Elements
  const overlay = document.createElement('div');
  overlay.id = 'grid-scale-overlay';
  overlay.className = 'hidden';
  overlay.innerHTML = `
    <!-- SVG Grid Lines -->
    <svg class="grid-svg-layer" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-pattern-sub" width="5%" height="5%" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 240, 255, 0.08)" stroke-width="0.5" />
        </pattern>
      </defs>
      <!-- 10% grid lines -->
      ${Array.from({ length: 9 }, (_, i) => {
        const pct = (i + 1) * 10;
        const isCenter = pct === 50;
        const color = isCenter ? 'rgba(255, 0, 119, 0.75)' : 'rgba(0, 240, 255, 0.22)';
        const dash = isCenter ? '6 4' : '3 3';
        const strokeWidth = isCenter ? '1.5' : '0.8';
        return `
          <line x1="${pct}%" y1="0" x2="${pct}%" y2="100%" stroke="${color}" stroke-dasharray="${dash}" stroke-width="${strokeWidth}" />
          <line x1="0" y1="${pct}%" x2="100%" y2="${pct}%" stroke="${color}" stroke-dasharray="${dash}" stroke-width="${strokeWidth}" />
        `;
      }).join('')}
    </svg>

    <!-- Rulers -->
    <div class="ruler-top">
      ${Array.from({ length: 11 }, (_, i) => {
        const pct = i * 10;
        const isCenter = pct === 50;
        return `<div class="ruler-mark-x ${isCenter ? 'center-axis' : ''}" style="left: ${pct}%;">${pct}%</div>`;
      }).join('')}
    </div>

    <div class="ruler-left">
      ${Array.from({ length: 11 }, (_, i) => {
        const pct = i * 10;
        const isCenter = pct === 50;
        return `<div class="ruler-mark-y ${isCenter ? 'center-axis' : ''}" style="top: ${pct}%;">${pct}%</div>`;
      }).join('')}
    </div>

    <!-- Mouse Crosshairs -->
    <div class="crosshair-line-x" id="crosshair-x"></div>
    <div class="crosshair-line-y" id="crosshair-y"></div>

    <!-- Click Pin Marker -->
    <div class="grid-pin-marker" id="grid-pin">
      <div class="grid-pin-center"></div>
      <div class="grid-pin-pulse"></div>
      <div class="grid-pin-label" id="grid-pin-label">X: 50% | Y: 50%</div>
    </div>
  `;

  // HUD Box
  const hud = document.createElement('div');
  hud.className = 'grid-hud';
  hud.style.display = 'none';
  hud.innerHTML = `
    <div class="hud-header">
      <div class="hud-title">
        <span class="hud-badge-live"></span>
        INSPECTOR HUD
      </div>
      <span class="hud-shortcut">Press [G] to Toggle</span>
    </div>
    <div class="hud-body">
      <div class="hud-row">
        <span class="hud-label">ANIMATION FRAME:</span>
        <span class="hud-value highlight-lime" id="hud-frame">Frame 1 / 50</span>
      </div>
      <div class="hud-row">
        <span class="hud-label">SCROLL PROGRESS:</span>
        <span class="hud-value highlight-cyan" id="hud-scroll-pct">0.0%</span>
      </div>
      <div class="hud-row">
        <span class="hud-label">SCROLL Y:</span>
        <span class="hud-value" id="hud-scroll-px">0 px</span>
      </div>
      <div class="hud-row">
        <span class="hud-label">SCREEN CURSOR:</span>
        <span class="hud-value" id="hud-cursor">X: --% | Y: --%</span>
      </div>
      <div class="hud-pin-section" id="hud-pin-section" style="display: none;">
        <div class="hud-label" style="margin-bottom: 4px;">LAST PINNED POSITION:</div>
        <div class="hud-pin-desc" id="hud-pin-text"></div>
        <button class="btn-hud-copy" id="btn-copy-pin">📋 Copy Coordinates</button>
      </div>
    </div>
  `;

  // Toggle Button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'grid-toggle-btn';
  toggleBtn.id = 'btn-grid-toggle';
  toggleBtn.innerHTML = `📏 Grid Scale: <strong>OFF</strong>`;

  document.body.appendChild(overlay);
  document.body.appendChild(hud);
  document.body.appendChild(toggleBtn);

  // References
  const crosshairX = document.getElementById('crosshair-x');
  const crosshairY = document.getElementById('crosshair-y');
  const pinMarker = document.getElementById('grid-pin');
  const pinLabel = document.getElementById('grid-pin-label');
  const hudFrame = document.getElementById('hud-frame');
  const hudScrollPct = document.getElementById('hud-scroll-pct');
  const hudScrollPx = document.getElementById('hud-scroll-px');
  const hudCursor = document.getElementById('hud-cursor');
  const hudPinSection = document.getElementById('hud-pin-section');
  const hudPinText = document.getElementById('hud-pin-text');
  const btnCopyPin = document.getElementById('btn-copy-pin');

  // Toggle Function
  function toggleGrid(show) {
    isVisible = typeof show === 'boolean' ? show : !isVisible;
    overlay.classList.toggle('hidden', !isVisible);
    hud.style.display = isVisible ? 'block' : 'none';
    toggleBtn.innerHTML = `📏 Grid Scale: <strong>${isVisible ? 'ON' : 'OFF'}</strong>`;
  }

  toggleBtn.addEventListener('click', () => toggleGrid());

  // Keyboard shortcut: G
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'g' || e.key === 'G') {
      toggleGrid();
    }
  });

  // Track Mouse
  window.addEventListener('mousemove', (e) => {
    if (!isVisible) return;
    const xPct = ((e.clientX / window.innerWidth) * 100).toFixed(1);
    const yPct = ((e.clientY / window.innerHeight) * 100).toFixed(1);

    crosshairX.style.display = 'block';
    crosshairY.style.display = 'block';
    crosshairX.style.left = `${e.clientX}px`;
    crosshairY.style.top = `${e.clientY}px`;

    hudCursor.innerHTML = `<span class="highlight-cyan">X: ${xPct}%</span> | <span class="highlight-cyan">Y: ${yPct}%</span> (${e.clientX}px, ${e.clientY}px)`;
  });

  document.addEventListener('mouseleave', () => {
    crosshairX.style.display = 'none';
    crosshairY.style.display = 'none';
  });

  // Click to Drop Pin
  window.addEventListener('click', (e) => {
    if (!isVisible) return;
    // Don't drop pin if clicking inside HUD or Toggle button
    if (hud.contains(e.target) || toggleBtn.contains(e.target)) return;

    const xPct = ((e.clientX / window.innerWidth) * 100).toFixed(1);
    const yPct = ((e.clientY / window.innerHeight) * 100).toFixed(1);

    const animState = window.getScrollAnimationState ? window.getScrollAnimationState() : { frame: 1, progress: 0 };
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = maxScroll > 0 ? ((window.scrollY / maxScroll) * 100).toFixed(1) : '0.0';

    lastPinnedData = {
      xPct: `${xPct}%`,
      yPct: `${yPct}%`,
      xPx: `${e.clientX}px`,
      yPx: `${e.clientY}px`,
      frame: animState.frame,
      scrollPct: `${scrollPct}%`,
      scrollY: `${Math.round(window.scrollY)}px`
    };

    pinMarker.style.display = 'block';
    pinMarker.style.left = `${e.clientX}px`;
    pinMarker.style.top = `${e.clientY}px`;
    pinLabel.innerHTML = `X: ${xPct}% | Y: ${yPct}%<br><span style="color: #d4ff32;">Frame ${animState.frame} (${scrollPct}%)</span>`;

    hudPinSection.style.display = 'block';
    hudPinText.innerHTML = `<strong>Screen:</strong> X: ${xPct}%, Y: ${yPct}%<br><strong>Scroll:</strong> ${scrollPct}% (Frame ${animState.frame})`;
  });

  // Copy Coordinates to Clipboard
  btnCopyPin.addEventListener('click', () => {
    if (!lastPinnedData) return;
    const copyText = `Scroll Position: ${lastPinnedData.scrollPct} (Scroll Y: ${lastPinnedData.scrollY}, Frame: ${lastPinnedData.frame}) | Screen Position: X: ${lastPinnedData.xPct}, Y: ${lastPinnedData.yPct}`;
    navigator.clipboard.writeText(copyText).then(() => {
      const originalText = btnCopyPin.innerHTML;
      btnCopyPin.innerHTML = '✅ Copied to Clipboard!';
      setTimeout(() => {
        btnCopyPin.innerHTML = originalText;
      }, 1500);
    });
  });

  // Continuous Update Loop for HUD scroll & frame
  function updateHUD() {
    if (isVisible) {
      const animState = window.getScrollAnimationState ? window.getScrollAnimationState() : null;
      const frame = animState ? animState.frame : 1;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

      hudFrame.textContent = `Frame ${frame} / 50`;
      hudScrollPct.textContent = `${scrollProgress.toFixed(1)}%`;
      hudScrollPx.textContent = `${Math.round(window.scrollY)} px / ${Math.round(maxScroll)} px`;
    }
    requestAnimationFrame(updateHUD);
  }

  requestAnimationFrame(updateHUD);
})();
