/* ============================================================
   LPR LANDING PAGE SYSTEM - HTML5 CANVAS STELLAR PARTICLE ENGINE
   ============================================================ */

(function () {
  'use strict';

  class StellarParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.shootingStars = [];
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.scrollOffset = 0;
      
      // Particle density configuration
      this.maxParticles = 80;
      this.starColors = ['#ffffff', '#e6c875', '#a5f3fc', '#c084fc'];

      this.init();
    }

    init() {
      this.resize();
      this.createParticles();
      this.bindEvents();
      this.loop();
    }

    resize() {
      this.width = this.canvas.parentElement.clientWidth;
      this.height = this.canvas.parentElement.clientHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.5 + 0.3,
          color: this.starColors[Math.floor(Math.random() * this.starColors.length)],
          opacity: Math.random() * 0.7 + 0.15,
          speedX: (Math.random() - 0.5) * 0.05,
          speedY: (Math.random() - 0.5) * 0.05,
          driftFactor: Math.random() * 0.015 + 0.005,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulsePhase: Math.random() * Math.PI
        });
      }
    }

    createShootingStar() {
      if (Math.random() > 0.0015) return; // Rare occurrence

      const startX = Math.random() * this.width;
      const startY = Math.random() * (this.height * 0.4);
      const angle = Math.PI / 6 + Math.random() * (Math.PI / 12); // Diagonal sweep
      const length = Math.random() * 80 + 40;
      const speed = Math.random() * 8 + 4;

      this.shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: length,
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.createParticles();
      });

      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX;
        this.mouse.targetY = e.clientY;
      });

      window.addEventListener('scroll', () => {
        this.scrollOffset = window.scrollY;
      });
    }

    update() {
      // Easing mouse coordinates for smooth lag effect
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

      // Update basic particles
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Apply mouse inertia (parallax drift)
        const mouseDriftX = (this.mouse.x - this.width / 2) * p.driftFactor;
        const mouseDriftY = (this.mouse.y - this.height / 2) * p.driftFactor;
        
        let displayX = p.x - mouseDriftX;
        let displayY = p.y - mouseDriftY - (this.scrollOffset * p.driftFactor * 0.5);

        // Screen boundary loops
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        // Twinkle animation
        p.pulsePhase += p.pulseSpeed;
        p.currentOpacity = p.opacity + Math.sin(p.pulsePhase) * 0.12;
        p.currentOpacity = Math.max(0.05, Math.min(1, p.currentOpacity));

        p.displayX = displayX;
        p.displayY = displayY;
      });

      // Update shooting stars
      this.createShootingStar();
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const s = this.shootingStars[i];
        s.x += s.dx;
        s.y += s.dy;
        s.life -= s.decay;

        if (s.life <= 0 || s.x < 0 || s.x > this.width || s.y > this.height) {
          this.shootingStars.splice(i, 1);
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw basic stars
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.displayX, p.displayY, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.currentOpacity;
        this.ctx.fill();
      });

      // Draw shooting stars with trailing gradient
      this.shootingStars.forEach(s => {
        const trailX = s.x - s.dx * (s.length / 10);
        const trailY = s.y - s.dy * (s.length / 10);

        const grad = this.ctx.createLinearGradient(s.x, s.y, trailX, trailY);
        grad.addColorStop(0, `rgba(230, 200, 117, ${s.life})`);
        grad.addColorStop(0.3, `rgba(0, 240, 255, ${s.life * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(s.x, s.y);
        this.ctx.lineTo(trailX, trailY);
        this.ctx.lineWidth = 1.8;
        this.ctx.strokeStyle = grad;
        this.ctx.globalAlpha = 1;
        this.ctx.stroke();
      });
    }

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }
  }

  // Initialize once DOM is complete
  window.addEventListener('DOMContentLoaded', () => {
    window.stellarBackground = new StellarParticleEngine('stellar-canvas');
  });
})();
