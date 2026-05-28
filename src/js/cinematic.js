/* ============================================================
   LPR LANDING PAGE SYSTEM - CINEMATIC INTERACTIONS & CURSOR
   ============================================================ */

(function () {
  'use strict';

  // ── 1. Magnetic Custom Cursor ──
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  let mouse = { x: -100, y: -100 };
  let dotPos = { x: -100, y: -100 };
  let ringPos = { x: -100, y: -100 };

  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function updateCursor() {
    // Easing equations
    dotPos.x = lerp(dotPos.x, mouse.x, 0.35);
    dotPos.y = lerp(dotPos.y, mouse.y, 0.35);

    ringPos.x = lerp(ringPos.x, mouse.x, 0.12);
    ringPos.y = lerp(ringPos.y, mouse.y, 0.12);

    if (dot) {
      dot.style.left = `${dotPos.x}px`;
      dot.style.top = `${dotPos.y}px`;
    }

    if (ring) {
      ring.style.left = `${ringPos.x}px`;
      ring.style.top = `${ringPos.y}px`;
    }

    requestAnimationFrame(updateCursor);
  }

  updateCursor();

  // Hover triggers for interactive nodes
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

  // ── 2. 3D Tilt Parallax Elements ──
  const handleTilt = (e, elem) => {
    const rect = elem.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position inside element
    const y = e.clientY - rect.top;  // y position inside element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Angle of rotation (-15 to 15 degrees max)
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    elem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Smooth glow displacement
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
      // Add a glow overlay dynamically if requested
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

  // ── 3. Initialize Interactive Components ──
  window.addEventListener('DOMContentLoaded', () => {
    bindInteractiveHovers();
    initTiltElements();
  });

  // Export helper in case dynamic elements are added
  window.rebindCinematicListeners = () => {
    bindInteractiveHovers();
    initTiltElements();
  };
})();
