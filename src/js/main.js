/* ============================================================
   LPR LANDING PAGE SYSTEM - CORE CONTROLLER & GSAP ANIMATIONS
   ============================================================ */

(function () {
  'use strict';

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // ── 1. Weight-Weighted Smooth Scroll Integration ──
  const lenis = new Lenis({
    duration: 1.8, // Slightly heavier, slower scroll for cinematic feeling
    easing: (t) => 1 - Math.pow(1 - t, 5), // Quintic-out curve for premium damping
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.8,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth hash anchor links scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        lenis.scrollTo(target, { offset: -20 });
        
        const navLinks = document.getElementById('nav-links');
        const navToggle = document.getElementById('nav-toggle');
        if (navLinks && navLinks.classList.contains('nav__links--open')) {
          navLinks.classList.remove('nav__links--open');
          navToggle.classList.remove('nav__toggle--active');
        }
      }
    });
  });

  // ── 2. Automatic Split-Text Cinematic Word Reveals ──
  const prepareSplitText = () => {
    const targets = document.querySelectorAll('.s-opening__headline, .scene-title, .s-finale__headline');
    targets.forEach(heading => {
      // Avoid splitting again if already processed
      if (heading.querySelectorAll('.word-reveal-wrap').length > 0) return;

      const words = heading.innerHTML.trim().split(/\s+/);
      const wrapped = words.map(word => {
        // Preserve inner formatting tags like <br> or em elements
        if (word.toLowerCase().includes('<br') || word.toLowerCase().includes('<em>') || word.toLowerCase().includes('</em>')) {
          return word;
        }
        
        // Wrap word in double hidden layers
        return `<span class="word-reveal-wrap"><span class="word-reveal-inner">${word}</span></span>`;
      }).join(' ');

      heading.innerHTML = wrapped;
    });
  };

  prepareSplitText();

  // ── 3. Navigation Drawer & Progress Trackers ──
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

  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    });
  }

  // ── 4. Cinematic Entrance Animations (GSAP) ──
  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.6 } });
  
  // Set initial hidden states
  gsap.set('.word-reveal-inner', { translateY: '105%' });
  gsap.set('.s-opening__sub', { opacity: 0, y: 25 });
  gsap.set('.s-opening__cta .btn', { opacity: 0, y: 20 });
  gsap.set('.ui-panel', { opacity: 0, scale: 0.85 });
  gsap.set('.lpr-brand-block', { opacity: 0, scale: 0.95 });

  // Play Entrance Sequence
  heroTl.to('.lpr-brand-block', { opacity: 1, scale: 1, duration: 1.2 })
        .to('.s-opening__headline .word-reveal-inner', { translateY: '0%', stagger: 0.045 }, '-=0.8')
        .to('.s-opening__sub', { opacity: 1, y: 0 }, '-=1.0')
        .to('.s-opening__cta .btn', { opacity: 1, y: 0, stagger: 0.15 }, '-=1.1')
        .to('.ui-panel', { opacity: 1, scale: 1, stagger: 0.18 }, '-=1.2');

  // ── 5. Scroll-Triggered Scene Pipelines ──

  // Scene 2: Problem Mockup Parallax & Text Reveals
  gsap.from('.s-problem__mockup', {
    scrollTrigger: {
      trigger: '.s-problem',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.2
    },
    y: 90,
    opacity: 0,
    ease: 'power2.out'
  });

  const sceneTitles = document.querySelectorAll('.s-problem .scene-title, .s-pipeline .scene-title, .s-process .scene-title, .s-packages .scene-title, .s-faq .scene-title');
  sceneTitles.forEach(title => {
    gsap.to(title.querySelectorAll('.word-reveal-inner'), {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      translateY: '0%',
      stagger: 0.04,
      duration: 1.2,
      ease: 'power3.out'
    });
  });

  // Scene 3: Pinned Scroll Comparison Steps
  const transformWrap = document.getElementById('transform-wrap');
  if (transformWrap) {
    const stepsCount = 4;
    const scrollHeight = window.innerHeight * 3.5;
    
    document.querySelector('.s-transform').style.height = `${scrollHeight + window.innerHeight}px`;

    ScrollTrigger.create({
      trigger: '.s-transform',
      start: 'top top',
      end: () => `+=${scrollHeight}`,
      pin: transformWrap,
      scrub: 0.6,
      onUpdate: (self) => {
        const rawStep = self.progress * (stepsCount - 1);
        const activeStepIndex = Math.min(Math.floor(rawStep), stepsCount - 1);
        
        document.querySelectorAll('.t-copy').forEach((copy, idx) => {
          if (idx === activeStepIndex) {
            copy.classList.add('is-active');
          } else {
            copy.classList.remove('is-active');
          }
        });

        document.querySelectorAll('.t-layer').forEach((layer, idx) => {
          if (idx === activeStepIndex) {
            layer.classList.add('is-active');
          } else {
            layer.classList.remove('is-active');
          }
        });

        document.querySelectorAll('.t-progress__dot').forEach((dot, idx) => {
          if (idx <= activeStepIndex) {
            dot.classList.add('t-progress__dot--active');
          } else {
            dot.classList.remove('t-progress__dot--active');
          }
        });

        const fillBar = document.getElementById('t-progress-fill');
        if (fillBar) {
          fillBar.style.height = `${(activeStepIndex / (stepsCount - 1)) * 100}%`;
        }
      }
    });
  }

  // Scene 4: Horizontal Scroll Film card Reel
  const reelTrack = document.getElementById('reel-track');
  const reelPin = document.getElementById('reel-pin');
  if (reelTrack && reelPin) {
    const computeReelWidth = () => {
      const cardWidths = Array.from(reelTrack.children).reduce((acc, card) => acc + card.offsetWidth + 32, 0);
      return cardWidths - reelTrack.offsetWidth + 120;
    };

    gsap.to(reelTrack, {
      scrollTrigger: {
        trigger: '.s-reel',
        start: 'top top',
        end: () => `+=${computeReelWidth()}`,
        pin: true,
        scrub: 0.6,
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

  // Scene 5: Click-to-Lead timeline pipeline
  const pipelineWrap = document.getElementById('pipeline-wrap');
  if (pipelineWrap) {
    const nodes = document.querySelectorAll('.p-node');
    const alertCard = document.getElementById('pl-alert');
    const savedCard = document.getElementById('pl-saved');

    gsap.timeline({
      scrollTrigger: {
        trigger: '.s-pipeline',
        start: 'top 55%',
        end: 'bottom 45%',
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          const fill = document.getElementById('pipeline-fill');
          if (fill) fill.style.width = `${progress * 100}%`;

          nodes.forEach((node, idx) => {
            const nodePct = idx / (nodes.length - 1);
            if (progress >= nodePct) {
              node.classList.add('p-node--active');
            } else {
              node.classList.remove('p-node--active');
            }
          });

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

  // Scene 6: Vertical launch chronological process
  const processTimeline = document.getElementById('process-timeline');
  if (processTimeline) {
    const processItems = document.querySelectorAll('.pt-item');
    gsap.timeline({
      scrollTrigger: {
        trigger: '.s-process',
        start: 'top 50%',
        end: 'bottom 50%',
        scrub: 0.6,
        onUpdate: (self) => {
          const fill = document.getElementById('process-spine');
          if (fill) fill.style.height = `${self.progress * 100}%`;

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

  // Scene 10: Finale text reveal scroll trigger
  gsap.to('.s-finale__headline .word-reveal-inner', {
    scrollTrigger: {
      trigger: '.s-finale',
      start: 'top 65%',
      toggleActions: 'play none none reverse'
    },
    translateY: '0%',
    stagger: 0.045,
    duration: 1.4,
    ease: 'power3.out'
  });

  // ── 6. Form Submission portal ──
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
        lenis.scrollTo('#request', { offset: -40 });
        return;
      }

      submitBtn.disabled = true;
      submitText.innerHTML = `<span class="form-spinner"></span>Initiating Launch Request...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitText.textContent = 'Initiate Page Build';
        
        successAlert.style.display = 'block';
        form.reset();
        
        createExplosionEffect(submitBtn);
        lenis.scrollTo('#request', { offset: -40 });
      }, 1500);
    });

    form.querySelectorAll('input, select, textarea').forEach(elem => {
      elem.addEventListener('input', () => elem.classList.remove('req-input--error'));
      elem.addEventListener('change', () => elem.classList.remove('req-input--error'));
    });
  }

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
        p.vy += 0.05;
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
