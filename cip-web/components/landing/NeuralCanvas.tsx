'use client';
import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store';

// Dark Theme Colors (Original - keeping as is)
const DARK_COLORS = [
  { r: 56, g: 189, b: 248 }, // Sky Blue
  { r: 74, g: 222, b: 128 }, // Mint Green
];

// Light Theme Colors (Darker, more saturated for visibility on light background)
const LIGHT_COLORS = [
  { r: 14, g: 165, b: 233 }, // Deeper Sky Blue
  { r: 34, g: 197, b: 94 }, // Deeper Green
];

class Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  pulse: number;
  color: { r: number, g: number, b: number };

  constructor(canvasWidth: number, canvasHeight: number, isDark: boolean) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 4 + 1; // Larger nodes
    this.vx = (Math.random() - 0.5) * 0.4; // Controlled drift
    this.vy = (Math.random() - 0.5) * 0.4;
    this.pulse = Math.random() * Math.PI * 2;
    const colorSet = isDark ? DARK_COLORS : LIGHT_COLORS;
    this.color = colorSet[Math.floor(Math.random() * colorSet.length)];
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Seamless loop
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, shadowBlurBase: number, isDark: boolean) {
    this.pulse += 0.03;
    const blur = shadowBlurBase + Math.sin(this.pulse) * 12;

    const rgb = `${this.color.r}, ${this.color.g}, ${this.color.b}`;

    // Adjust opacity based on theme
    const particleOpacity = isDark ? 0.25 : 0.35;
    const shadowOpacity = isDark ? 0.4 : 0.5;
    const coreOpacity = isDark ? 0.3 : 0.4;

    // Deep Saturated Crystal Color
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb}, ${particleOpacity})`;
    ctx.shadowBlur = blur / 1.5;
    ctx.shadowColor = `rgba(${rgb}, ${shadowOpacity})`;
    ctx.fill();

    // White Brilliant Core
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${coreOpacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animId: number;
    let W = 0, H = 0;

    // Final Optimized Configuration for Visibility
    const particleCount = 85;
    const connectionDistance = 190;
    const lineWidth = 1.0;
    const shadowBlurBase = 25;

    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(W, H, isDark));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(W, H);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);

            // Adjust line opacity based on theme
            const baseAlpha = isDark ? 0.15 : 0.2;
            ctx.lineWidth = lineWidth * 0.6;
            const alpha = baseAlpha * (1 - dist / connectionDistance);
            
            // Mix colors or just use the first particle's color for the line
            const p = particles[i];
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.stroke();
          }
        }
        
        particles[i].draw(ctx, shadowBlurBase, isDark);
      }
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animId);
    };
  }, [isDark]); // Re-initialize when theme changes

  // Dynamic background based on theme
  const backgroundStyle = isDark
    ? 'radial-gradient(circle at center, #0A0F1E 0%, #000000 100%)' // Original dark gradient
    : 'radial-gradient(circle at center, #F1F5F9 0%, #E2E8F0 100%)'; // Light gradient

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none transition-colors duration-500"
      style={{
        background: backgroundStyle,
      }}
    />
  );
}
