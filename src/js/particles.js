/* ============================================================
   LPR LANDING PAGE SYSTEM - HTML5 CANVAS NEBULA & 3D STARFIELD ENGINE
   ============================================================ */

(function () {
  'use strict';

  class StellarParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.stars3D = [];
      this.twinkleStars = [];
      this.nebulas = [];
      this.shootingStars = [];
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.scrollOffset = 0;

      // Configuration
      this.max3DStars = 110;
      this.maxTwinkleStars = 60;
      this.starColors = ['#ffffff', '#ffebad', '#b5f5ff', '#d8b4fe'];

      this.init();
    }

    init() {
      this.resize();
      this.createAtmosphere();
      this.bindEvents();
      this.loop();
    }

    resize() {
      this.width = this.canvas.parentElement.clientWidth;
      this.height = this.canvas.parentElement.clientHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
    }

    createAtmosphere() {
      // 1. 3D Space Warp Stars (Moving towards/away from camera)
      this.stars3D = [];
      for (let i = 0; i < this.max3DStars; i++) {
        this.stars3D.push({
          x: (Math.random() - 0.5) * this.width * 1.5,
          y: (Math.random() - 0.5) * this.height * 1.5,
          z: Math.random() * 1000 + 10,
          radius: Math.random() * 1.2 + 0.3,
          color: this.starColors[Math.floor(Math.random() * this.starColors.length)],
          speedZ: Math.random() * 0.45 + 0.15
        });
      }

      // 2. Slow Twinkling Background Stars
      this.twinkleStars = [];
      for (let i = 0; i < this.maxTwinkleStars; i++) {
        this.twinkleStars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.0 + 0.3,
          opacity: Math.random() * 0.6 + 0.1,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          driftX: (Math.random() - 0.5) * 0.03,
          driftY: (Math.random() - 0.5) * 0.03
        });
      }

      // 3. Volumetric Rotating Nebulas
      this.nebulas = [
        {
          x: this.width * 0.25,
          y: this.height * 0.3,
          radius: Math.min(this.width, this.height) * 0.4,
          colorInner: 'rgba(0, 240, 255, 0.045)', // Volumetric Cyan
          colorOuter: 'rgba(0, 0, 0, 0)',
          angle: 0,
          speed: 0.0003,
          driftLimit: 120
        },
        {
          x: this.width * 0.75,
          y: this.height * 0.6,
          radius: Math.min(this.width, this.height) * 0.55,
          colorInner: 'rgba(138, 43, 226, 0.04)', // Volumetric Violet
          colorOuter: 'rgba(0, 0, 0, 0)',
          angle: Math.PI / 4,
          speed: -0.0002,
          driftLimit: 160
        },
        {
          x: this.width * 0.5,
          y: this.height * 0.1,
          radius: Math.min(this.width, this.height) * 0.35,
          colorInner: 'rgba(230, 200, 117, 0.025)', // Deep Amber gold
          colorOuter: 'rgba(0, 0, 0, 0)',
          angle: Math.PI,
          speed: 0.0004,
          driftLimit: 80
        }
      ];
    }

    createShootingStar() {
      if (Math.random() > 0.0025) return; // Smooth occasional sweep

      const startX = Math.random() * this.width;
      const startY = Math.random() * (this.height * 0.3);
      const angle = Math.PI / 8 + Math.random() * (Math.PI / 16);
      const length = Math.random() * 120 + 60;
      const speed = Math.random() * 9 + 5;

      this.shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: length,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.008
      });
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.createAtmosphere();
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
      // Easing coordinates for inertial camera drift
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

      const mouseOffsetPercentX = (this.mouse.x - this.centerX) / this.centerX;
      const mouseOffsetPercentY = (this.mouse.y - this.centerY) / this.centerY;

      // 1. Update 3D warp space stars
      this.stars3D.forEach(star => {
        star.z -= star.speedZ;

        // Reset star if it reaches the camera
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * this.width * 1.5;
          star.y = (Math.random() - 0.5) * this.height * 1.5;
          star.z = 1000;
        }

        // Project 3D coordinate to 2D view screen
        const scale = 300 / star.z;
        star.px = (star.x - (mouseOffsetPercentX * 50)) * scale + this.centerX;
        star.py = (star.y - (mouseOffsetPercentY * 50) - (this.scrollOffset * 0.1)) * scale + this.centerY;
        star.pRadius = star.radius * scale * 1.5;
        star.opacity = Math.max(0, Math.min(0.9, (1000 - star.z) / 400));
      });

      // 2. Update Twinkle background layers
      this.twinkleStars.forEach(star => {
        star.x += star.driftX;
        star.y += star.driftY;

        if (star.x < 0) star.x = this.width;
        if (star.x > this.width) star.x = 0;
        if (star.y < 0) star.y = this.height;
        if (star.y > this.height) star.y = 0;

        star.pulsePhase += star.pulseSpeed;
        star.currentOpacity = star.opacity + Math.sin(star.pulsePhase) * 0.15;
        star.currentOpacity = Math.max(0.02, Math.min(0.8, star.currentOpacity));

        // Add mouse scroll parallax
        star.px = star.x - (mouseOffsetPercentX * 12);
        star.py = star.y - (mouseOffsetPercentY * 12) - (this.scrollOffset * 0.05);
      });

      // 3. Update Volumetric Nebulas
      this.nebulas.forEach(n => {
        n.angle += n.speed;
        
        // Circular hover drift
        n.currentX = n.x + Math.cos(n.angle) * 15 - (mouseOffsetPercentX * n.driftLimit * 0.15);
        n.currentY = n.y + Math.sin(n.angle) * 15 - (mouseOffsetPercentY * n.driftLimit * 0.15) - (this.scrollOffset * 0.12);
      });

      // 4. Update Shooting Stars
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
      // Clear with obsidian transparency
      this.ctx.fillStyle = '#060608';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw 1: Volumetric Nebulas (drawn behind stars)
      this.nebulas.forEach(n => {
        const grad = this.ctx.createRadialGradient(
          n.currentX, n.currentY, 0,
          n.currentX, n.currentY, n.radius
        );
        grad.addColorStop(0, n.colorInner);
        grad.addColorStop(0.5, n.colorInner.replace('0.04', '0.01'));
        grad.addColorStop(1, n.colorOuter);

        this.ctx.beginPath();
        this.ctx.arc(n.currentX, n.currentY, n.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.globalAlpha = 1.0;
        this.ctx.fill();
      });

      // Draw 2: Twinkling background stars
      this.twinkleStars.forEach(s => {
        this.ctx.beginPath();
        this.ctx.arc(s.px, s.py, s.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = s.currentOpacity;
        this.ctx.fill();
      });

      // Draw 3: 3D coordinates projected stars
      this.stars3D.forEach(s => {
        if (s.px >= 0 && s.px <= this.width && s.py >= 0 && s.py <= this.height) {
          this.ctx.beginPath();
          this.ctx.arc(s.px, s.py, s.pRadius, 0, Math.PI * 2);
          this.ctx.fillStyle = s.color;
          this.ctx.globalAlpha = s.opacity;
          this.ctx.fill();
        }
      });

      // Draw 4: Shooting stars with trailing gradient
      this.shootingStars.forEach(s => {
        const trailX = s.x - s.dx * (s.length / 10);
        const trailY = s.y - s.dy * (s.length / 10);

        const grad = this.ctx.createLinearGradient(s.x, s.y, trailX, trailY);
        grad.addColorStop(0, `rgba(230, 200, 117, ${s.life})`);
        grad.addColorStop(0.3, `rgba(0, 240, 255, ${s.life * 0.7})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(s.x, s.y);
        this.ctx.lineTo(trailX, trailY);
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = grad;
        this.ctx.globalAlpha = 1.0;
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
