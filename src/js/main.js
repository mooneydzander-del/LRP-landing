/* ============================================================
   LPR LANDING PAGE — core controller
   Plain native scrolling; no scroll-jacking or motion effects.
   ============================================================ */

(function () {
  'use strict';

  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  function closeMobileNav() {
    if (navLinks && navLinks.classList.contains('nav__links--open')) {
      navLinks.classList.remove('nav__links--open');
      navToggle.classList.remove('nav__toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // ── 1. Mobile navigation drawer ──
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('nav__links--open');
      navToggle.classList.toggle('nav__toggle--active', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ── 2. In-page links: native scrolling (CSS scroll-padding clears the nav) ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', closeMobileNav);
  });

  // ── 3. Request form ──
  const form = document.getElementById('contact-form');
  const errorAlert = document.getElementById('contact-error');
  const successAlert = document.getElementById('contact-success');
  const submitBtn = document.getElementById('contact-submit');
  const submitText = document.getElementById('contact-submit-text');

  function scrollToForm() {
    document.getElementById('request').scrollIntoView({ block: 'start' });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';

      const fields = ['offer', 'full_name', 'business_name', 'email', 'offer_detail', 'goal', 'ad_platform'];
      const data = {};
      let hasError = false;

      fields.forEach((field) => {
        const input = form.elements[field];
        if (!input || !input.value.trim()) {
          hasError = true;
          if (input) input.classList.add('req-input--error');
        } else {
          input.classList.remove('req-input--error');
          data[field] = input.value.trim();
        }
      });

      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        form.elements['email'].classList.add('req-input--error');
        errorAlert.textContent = 'Please enter a valid business email address.';
        errorAlert.style.display = 'block';
        return;
      }

      if (hasError) {
        errorAlert.textContent = 'Please fill out all required fields marked in red.';
        errorAlert.style.display = 'block';
        scrollToForm();
        return;
      }

      submitBtn.disabled = true;
      submitText.innerHTML = '<span class="form-spinner"></span>Sending your request...';

      // TODO: Replace this timeout with a real API call.
      // Example: POST to an n8n webhook, Google Apps Script, or serverless function.
      // fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      console.log('[LPR] Form submission data (dev mode — wire up backend to go live):', data);

      setTimeout(() => {
        submitBtn.disabled = false;
        submitText.textContent = 'Initiate Page Build';
        successAlert.style.display = 'block';
        form.reset();
        scrollToForm();
      }, 1500);
    });

    form.querySelectorAll('input, select, textarea').forEach((elem) => {
      elem.addEventListener('input', () => elem.classList.remove('req-input--error'));
      elem.addEventListener('change', () => elem.classList.remove('req-input--error'));
    });
  }
})();
