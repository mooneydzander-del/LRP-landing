/* ============================================================
   LPR LANDING PAGE SYSTEM - CORE CONTROLLER & GSAP ANIMATIONS
   ============================================================ */

(function () {
  'use strict';

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // ── 1. Lenis Smooth Scroll Integration ──
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll to anchor link hashes
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        lenis.scrollTo(target, { offset: -20 });
        
        // If mobile nav overlay is open, close it
        const navLinks = document.getElementById('nav-links');
        const navToggle = document.getElementById('nav-toggle');
        if (navLinks && navLinks.classList.contains('nav__links--open')) {
          navLinks.classList.remove('nav__links--open');
          navToggle.classList.remove('nav__toggle--active');
        }
      }
    });
  });

  // ── 2. Mobile Responsive Nav Burger Toggle ──
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav__links--open');
      navToggle.classList.toggle('nav__toggle--active');
      const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
      navToggle.setAttribute('aria-expanded', !expanded);
    });
  }

  // ── 3. Page Scroll Progress Indicator ──
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    });
  }

  // ── 4. GSAP Scenes & Timelines ──

  // Scene 1: Hero Fade Ins
  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.5 } });
  heroTl.from('.scene-eyebrow', { opacity: 0, y: 30, delay: 0.2 })
        .from('.s-opening__headline', { opacity: 0, y: 40 }, '-=1.2')
        .from('.s-opening__sub', { opacity: 0, y: 25 }, '-=1.1')
        .from('.s-opening__cta .btn', { opacity: 0, y: 20, stagger: 0.15 }, '-=1.0')
        .from('.ui-panel', { opacity: 0, scale: 0.85, stagger: 0.2 }, '-=1.1');

  // Scene 2: Problem - Trigger parallax mockup entry
  gsap.from('.s-problem__mockup', {
    scrollTrigger: {
      trigger: '.s-problem',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1
    },
    y: 100,
    opacity: 0,
    ease: 'power2.out'
  });

  // Scene 3: The Transformation (Pinned Scroll Comparison)
  const transformWrap = document.getElementById('transform-wrap');
  if (transformWrap) {
    const stepsCount = 4;
    const scrollHeight = window.innerHeight * 3; // 4 stages = 3 window scrolls
    
    // Set container heights for pin spacing
    document.querySelector('.s-transform').style.height = `${scrollHeight + window.innerHeight}px`;

    ScrollTrigger.create({
      trigger: '.s-transform',
      start: 'top top',
      end: () => `+=${scrollHeight}`,
      pin: transformWrap,
      scrub: 0.5,
      onUpdate: (self) => {
        // Calculate current step (0 to 3) based on scroll progress
        const rawStep = self.progress * (stepsCount - 1);
        const activeStepIndex = Math.min(Math.floor(rawStep), stepsCount - 1);
        
        // Update Left Side Copy
        document.querySelectorAll('.t-copy').forEach((copy, idx) => {
          if (idx === activeStepIndex) {
            copy.classList.add('is-active');
          } else {
            copy.classList.remove('is-active');
          }
        });

        // Update Right Side Mockups Layer
        document.querySelectorAll('.t-layer').forEach((layer, idx) => {
          if (idx === activeStepIndex) {
            layer.classList.add('is-active');
          } else {
            layer.classList.remove('is-active');
          }
        });

        // Update indicators
        document.querySelectorAll('.t-progress__dot').forEach((dot, idx) => {
          if (idx <= activeStepIndex) {
            dot.classList.add('t-progress__dot--active');
          } else {
            dot.classList.remove('t-progress__dot--active');
          }
        });

        // Update center progress bar track
        const fillBar = document.getElementById('t-progress-fill');
        if (fillBar) {
          fillBar.style.height = `${(activeStepIndex / (stepsCount - 1)) * 100}%`;
        }
      }
    });
  }

  // Scene 4b: Horizontal Film Card Reel
  const reelTrack = document.getElementById('reel-track');
  const reelPin = document.getElementById('reel-pin');
  if (reelTrack && reelPin) {
    const computeReelWidth = () => {
      const cardWidths = Array.from(reelTrack.children).reduce((acc, card) => acc + card.offsetWidth + 32, 0); // 32px gap
      return cardWidths - reelTrack.offsetWidth + 120; // 120px padding margin
    };

    gsap.to(reelTrack, {
      scrollTrigger: {
        trigger: '.s-reel',
        start: 'top top',
        end: () => `+=${computeReelWidth()}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progressFill = document.getElementById('reel-progress');
          if (progressFill) {
            progressFill.style.width = `${self.progress * 100}%`;
          }
        }
      },
      x: () => -computeReelWidth(),
      ease: 'none'
    });
  }

  // Scene 5: Lead Pipeline System Animation
  const pipelineWrap = document.getElementById('pipeline-wrap');
  if (pipelineWrap) {
    const nodes = document.querySelectorAll('.p-node');
    const alertCard = document.getElementById('pl-alert');
    const savedCard = document.getElementById('pl-saved');

    gsap.timeline({
      scrollTrigger: {
        trigger: '.s-pipeline',
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          // Progress bar track fill
          const fill = document.getElementById('pipeline-fill');
          if (fill) fill.style.width = `${progress * 100}%`;

          // Activate nodes sequentially
          nodes.forEach((node, idx) => {
            const nodePct = idx / (nodes.length - 1);
            if (progress >= nodePct) {
              node.classList.add('p-node--active');
            } else {
              node.classList.remove('p-node--active');
            }
          });

          // Toggle pipeline popup alert cards
          if (progress > 0.6) {
            alertCard.classList.add('pl-card--visible');
          } else {
            alertCard.classList.remove('pl-card--visible');
          }

          if (progress > 0.85) {
            savedCard.classList.add('pl-card--visible');
          } else {
            savedCard.classList.remove('pl-card--visible');
          }
        }
      }
    });
  }

  // Scene 6: Vertical timeline track fill
  const processTimeline = document.getElementById('process-timeline');
  if (processTimeline) {
    const processItems = document.querySelectorAll('.pt-item');
    gsap.timeline({
      scrollTrigger: {
        trigger: '.s-process',
        start: 'top 50%',
        end: 'bottom 50%',
        scrub: 0.5,
        onUpdate: (self) => {
          const fill = document.getElementById('process-spine');
          if (fill) fill.style.height = `${self.progress * 100}%`;

          // Light up milestones
          processItems.forEach((item, idx) => {
            const itemPct = idx / (processItems.length - 1);
            if (self.progress >= itemPct - 0.1) {
              item.classList.add('pt-item--active');
            } else {
              item.classList.remove('pt-item--active');
            }
          });
        }
      }
    });
  }

  // ── 5. Lead Form Logic & Validation ──
  const form = document.getElementById('contact-form');
  const errorAlert = document.getElementById('contact-error');
  const successAlert = document.getElementById('contact-success');
  const submitBtn = document.getElementById('contact-submit');
  const submitText = document.getElementById('contact-submit-text');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';

      const fields = ['offer', 'full_name', 'business_name', 'email', 'offer_detail', 'goal', 'ad_platform'];
      const data = {};
      let hasError = false;

      // Basic field checking
      fields.forEach(field => {
        const input = form.elements[field];
        if (!input || !input.value.trim()) {
          hasError = true;
          input.classList.add('req-input--error');
        } else {
          input.classList.remove('req-input--error');
          data[field] = input.value.trim();
        }
      });

      // Quick email regex
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          hasError = true;
          form.elements['email'].classList.add('req-input--error');
          errorAlert.textContent = 'Please enter a valid business email address.';
          errorAlert.style.display = 'block';
          return;
        }
      }

      if (hasError) {
        errorAlert.textContent = 'Please fill out all required fields marked in red.';
        errorAlert.style.display = 'block';
        
        // Scroll to form top smoothly
        lenis.scrollTo('#request', { offset: -40 });
        return;
      }

      // Start submissions state spinner
      submitBtn.disabled = true;
      submitText.innerHTML = `<span class="form-spinner"></span>Initiating Launch Request...`;

      // Simulate network request to mimic real backend
      setTimeout(() => {
        submitBtn.disabled = false;
        submitText.textContent = 'Launch My Landing Page';
        
        // Display beautiful success alert
        successAlert.style.display = 'block';
        form.reset();
        
        // Custom CTA cinematic explosion effect (canvas burst)
        createExplosionEffect(submitBtn);

        // Scroll to success message
        lenis.scrollTo('#request', { offset: -40 });
      }, 1500);
    });

    // Remove red borders immediately as they type
    form.querySelectorAll('input, select, textarea').forEach(elem => {
      elem.addEventListener('input', () => elem.classList.remove('req-input--error'));
      elem.addEventListener('change', () => elem.classList.remove('req-input--error'));
    });
  }

  // ── 6. Form Success Particle Explosion Effect ──
  function createExplosionEffect(anchorElement) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10002';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const rect = anchorElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const particles = [];
    const colors = ['#e6c875', '#ffffff', '#00f0ff', '#ffdf85'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        radius: Math.random() * 4 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }

    function renderExplosion() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity gravity
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
      });

      if (alive) {
        requestAnimationFrame(renderExplosion);
      } else {
        canvas.remove();
      }
    }

    renderExplosion();
  }

})();
