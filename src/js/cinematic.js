/* ============================================================
   LPR LANDING PAGE SYSTEM - CINEMATIC INTERACTIONS & CURSOR
   ============================================================ */

(function () {
  'use strict';

  // ── 1. Magnetic Custom Cursor & Flashlight Beam ──
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  // Dynamically create the volumetric flashlight overlay if not already in DOM
  let flashlight = document.getElementById('volumetric-flashlight');
  if (!flashlight) {
    flashlight = document.createElement('div');
    flashlight.id = 'volumetric-flashlight';
    flashlight.className = 'volumetric-flashlight';
    document.body.appendChild(flashlight);
  }

  let mouse = { x: -200, y: -200 };
  let dotPos = { x: -200, y: -200 };
  let ringPos = { x: -200, y: -200 };
  let flashPos = { x: -200, y: -200 };

  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    document.body.classList.add('mouse-active');
  });

  // Track hover triggers for interactive elements
  const bindInteractiveHovers = () => {
    const targets = document.querySelectorAll('a, button, select, input, textarea, .faq-question, .pkg, .p-node__orb');
    targets.forEach((elem) => {
      elem.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering-interactive');
      });
      elem.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering-interactive');
      });
    });
  };

  // ── 2. Magnetic Attraction Physics on Buttons ──
  let magneticElements = [];

  const initMagneticElements = () => {
    // Select all buttons, custom links, or elements with data-magnetic attribute
    const elements = document.querySelectorAll('.btn, .nav__logo, [data-magnetic]');
    magneticElements = Array.from(elements).map(elem => {
      // Set relative position and smooth transitions
      elem.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
      return {
        el: elem,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
      };
    });
  };

  const updateMagneticFeedback = () => {
    magneticElements.forEach(item => {
      const rect = item.el.getBoundingClientRect();
      const elemCenterX = rect.left + rect.width / 2;
      const elemCenterY = rect.top + rect.height / 2;

      // Distance from cursor to button center
      const distX = mouse.x - elemCenterX;
      const distY = mouse.y - elemCenterY;
      const distance = Math.hypot(distX, distY);

      // Trigger radius: 75px
      const triggerRadius = 75;

      if (distance < triggerRadius) {
        // Magnetic pull factor (stronger as you get closer)
        const pull = (triggerRadius - distance) / triggerRadius;
        item.targetX = distX * pull * 0.38; // translate up to 38% of cursor offset
        item.targetY = distY * pull * 0.38;
        
        // Increase custom cursor attraction
        document.body.classList.add('hovering-interactive');
      } else {
        item.targetX = 0;
        item.targetY = 0;
      }

      // Smooth interpolation for the coordinates
      item.x = lerp(item.x, item.targetX, 0.15);
      item.y = lerp(item.y, item.targetY, 0.15);

      item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    });
  };

  // Main animation frame loop
  function updateCursor() {
    // Easing equations
    dotPos.x = lerp(dotPos.x, mouse.x, 0.35);
    dotPos.y = lerp(dotPos.y, mouse.y, 0.35);

    ringPos.x = lerp(ringPos.x, mouse.x, 0.1);
    ringPos.y = lerp(ringPos.y, mouse.y, 0.1);

    flashPos.x = lerp(flashPos.x, mouse.x, 0.08);
    flashPos.y = lerp(flashPos.y, mouse.y, 0.08);

    if (dot) {
      dot.style.left = `${dotPos.x}px`;
      dot.style.top = `${dotPos.y}px`;
    }

    if (ring) {
      ring.style.left = `${ringPos.x}px`;
      ring.style.top = `${ringPos.y}px`;
    }

    if (flashlight) {
      flashlight.style.left = `${flashPos.x}px`;
      flashlight.style.top = `${flashPos.y}px`;
    }

    // Process magnetic transformations
    updateMagneticFeedback();

    requestAnimationFrame(updateCursor);
  }

  updateCursor();

  // ── 3. 3D Tilt Parallax Elements ──
  const handleTilt = (e, elem) => {
    const rect = elem.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    elem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    const glow = elem.querySelector('.card-glow');
    if (glow) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      glow.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(230, 200, 117, 0.15) 0%, transparent 60%)`;
    }
  };

  const resetTilt = (elem) => {
    elem.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const glow = elem.querySelector('.card-glow');
    if (glow) {
      glow.style.background = 'radial-gradient(circle at 50% 50%, rgba(230, 200, 117, 0.05) 0%, transparent 50%)';
    }
  };

  const initTiltElements = () => {
    const tilts = document.querySelectorAll('[data-tilt]');
    tilts.forEach((elem) => {
      if (elem.classList.contains('glass-panel') && !elem.querySelector('.card-glow')) {
        const glow = document.createElement('div');
        glow.className = 'card-glow';
        glow.style.position = 'absolute';
        glow.style.inset = '0';
        glow.style.borderRadius = 'inherit';
        glow.style.pointerEvents = 'none';
        glow.style.zIndex = '0';
        glow.style.background = 'radial-gradient(circle at 50% 50%, rgba(230, 200, 117, 0.05) 0%, transparent 50%)';
        glow.style.transition = 'background 0.1s ease-out';
        elem.appendChild(glow);
      }

      elem.addEventListener('mousemove', (e) => handleTilt(e, elem));
      elem.addEventListener('mouseleave', () => resetTilt(elem));
    });
  };

  // ── 4. Initialize Interactive Components ──
  window.addEventListener('DOMContentLoaded', () => {
    bindInteractiveHovers();
    initMagneticElements();
    initTiltElements();

    // Trigger cinematic widescreen frame entry
    setTimeout(() => {
      document.body.classList.add('cinema-frame-active');
    }, 500);
  });

  window.rebindCinematicListeners = () => {
    bindInteractiveHovers();
    initMagneticElements();
    initTiltElements();
  };
})();
