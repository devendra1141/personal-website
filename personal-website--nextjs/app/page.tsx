'use client';

import { useEffect, useRef } from 'react';
import './mode-selector.css';

class Particle {
  x: number; y: number; size: number; speedX: number; speedY: number;
  opacity: number; hue: number; canvasW: number; canvasH: number;

  constructor(w: number, h: number) {
    this.canvasW = w; this.canvasH = h;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.hue = Math.random() > 0.5 ? 25 : 340;
  }

  update(mouseX: number, mouseY: number) {
    this.x += this.speedX;
    this.y += this.speedY;
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 2;
      this.y += (dy / dist) * force * 2;
    }
    if (this.x < 0 || this.x > this.canvasW) this.speedX *= -1;
    if (this.y < 0 || this.y > this.canvasH) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 60%, 65%, ${this.opacity})`;
    ctx.fill();
  }
}

export default function ModeSelector() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const count = Math.min(Math.floor((canvas!.width * canvas!.height) / 8000), 150);
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(canvas!.width, canvas!.height));
      }
    }

    function connectParticles() {
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.strokeStyle = `hsla(30, 40%, 50%, ${0.08 * (1 - dist / 100)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particlesRef.current.forEach(p => {
        p.update(mouseRef.current.x, mouseRef.current.y);
        p.draw(ctx!);
      });
      connectParticles();
      animId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', handleMouse);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // Card tilt handler
  function handleCardMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

    const glow = card.querySelector('.ms-card-glow') as HTMLElement;
    if (glow) glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 40%)`;
    const border = card.querySelector('.ms-card-border') as HTMLElement;
    if (border) border.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 40%)`;
  }

  function handleCardLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    const glow = card.querySelector('.ms-card-glow') as HTMLElement;
    if (glow) glow.style.background = 'transparent';
    const border = card.querySelector('.ms-card-border') as HTMLElement;
    if (border) border.style.background = 'transparent';
  }

  return (
    <>
      <canvas ref={canvasRef} className="ms-bg-canvas" aria-hidden="true" />
      <div className="ms-orb ms-orb-1" aria-hidden="true" />
      <div className="ms-orb ms-orb-2" aria-hidden="true" />
      <div className="ms-orb ms-orb-3" aria-hidden="true" />

      <div className="ms-shell">
        <header className="ms-header">
          <span className="ms-wordmark">DP<span className="ms-dot">.</span></span>
          <span className="ms-header-tag">choose your experience</span>
        </header>

        <section className="ms-hero">
          <p className="ms-eyebrow">Welcome</p>
          <h1 className="ms-title">Pick your<br /><em>vibe.</em></h1>
          <p className="ms-subtitle">Two handcrafted versions of the same portfolio — same soul, different energy. Which one speaks to you?</p>
        </section>

        <section className="ms-cards" aria-label="Mode selection">
          <a
            href="/classic/index.html"
            className="ms-card ms-card-html"
            id="card-html"
            aria-label="Enter Classic HTML experience"
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}
          >
            <div className="ms-card-glow" aria-hidden="true" />
            <div className="ms-card-content">
              <div className="ms-card-icon ms-icon-html">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                  <line x1="14" y1="4" x2="10" y2="20" opacity="0.5" />
                </svg>
              </div>
              <div className="ms-card-badge">HTML + CSS</div>
              <h2 className="ms-card-title">Classic</h2>
              <p className="ms-card-desc">Clean typography, game-themed palettes, and handwritten charm. A love letter to the fundamentals.</p>
              <div className="ms-card-features">
                <span className="ms-feature">9 Theme Palettes</span>
                <span className="ms-feature">Lightweight</span>
                <span className="ms-feature">Zero Dependencies</span>
              </div>
              <div className="ms-card-cta">
                <span>Enter</span>
                <span className="ms-arrow">→</span>
              </div>
            </div>
            <div className="ms-card-border" aria-hidden="true" />
          </a>

          <div className="ms-divider" aria-hidden="true">
            <div className="ms-divider-line" />
            <span className="ms-divider-text">or</span>
            <div className="ms-divider-line" />
          </div>

          <a
            href="/immersive"
            className="ms-card ms-card-nextjs"
            id="card-nextjs"
            aria-label="Enter Immersive Next.js experience"
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}
          >
            <div className="ms-card-glow" aria-hidden="true" />
            <div className="ms-card-content">
              <div className="ms-card-icon ms-icon-nextjs">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="ms-card-badge">Next.js + React</div>
              <h2 className="ms-card-title">Immersive</h2>
              <p className="ms-card-desc">3D canvas, GSAP animations, smooth scroll, and a custom cursor. A cinematic deep dive.</p>
              <div className="ms-card-features">
                <span className="ms-feature">3D Canvas</span>
                <span className="ms-feature">GSAP Animations</span>
                <span className="ms-feature">Black Hole Intro</span>
              </div>
              <div className="ms-card-cta">
                <span>Enter</span>
                <span className="ms-arrow">→</span>
              </div>
            </div>
            <div className="ms-card-border" aria-hidden="true" />
          </a>
        </section>

        <footer className="ms-footer">
          <span>© {new Date().getFullYear()} Devendra Pandey</span>
          <span>Made somewhere between class and a deadline.</span>
        </footer>
      </div>
    </>
  );
}
