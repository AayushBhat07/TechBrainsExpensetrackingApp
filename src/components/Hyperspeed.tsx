import { useEffect, useRef } from "react";

type HyperspeedProps = {
  className?: string;
  speed?: number; // base speed factor
  density?: number; // number of streaks
  color?: string; // streak color
  glow?: string; // outer glow color
};

/**
 * Lightweight canvas-based "hyperspeed tunnel" background.
 * No external deps. Renders radial light streaks moving toward the viewer.
 */
export default function Hyperspeed({
  className = "",
  speed = 0.035,
  density = 160,
  color = "rgba(44,62,80,0.75)", // deep slate to match theme
  glow = "rgba(244,208,63,0.25)", // warm accent
}: HyperspeedProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<
    Array<{ angle: number; radius: number; vel: number; width: number }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let cx = w / 2;
    let cy = h / 2;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
    };
    window.addEventListener("resize", onResize);

    // init particles (radial streaks)
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.max(w, h) * 0.6 + 40;
        const vel = Math.random() * 1 + 0.5;
        const width = Math.random() * 1.2 + 0.2;
        particlesRef.current.push({ angle, radius, vel, width });
      }
    };
    initParticles();

    // draw loop
    const draw = () => {
      // subtle background with vignette
      ctx.clearRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.1, cx, cy, Math.max(w, h) * 0.8);
      grd.addColorStop(0, "rgba(255, 247, 224, 0.10)");
      grd.addColorStop(1, "rgba(245, 243, 240, 0.05)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // subtle glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(w, h) * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // streaks
      ctx.strokeStyle = color;
      ctx.lineCap = "round";

      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;

        // draw a line toward center to simulate motion streak
        const tx = cx + Math.cos(p.angle) * (p.radius * 0.25);
        const ty = cy + Math.sin(p.angle) * (p.radius * 0.25);

        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // update radius (move toward center and recycle)
        p.radius -= (p.vel + p.width) * (1 + speed * 8);
        if (p.radius < 20) {
          // reset to far edge
          p.angle = Math.random() * Math.PI * 2;
          p.radius = Math.random() * Math.max(w, h) * 0.6 + Math.max(w, h) * 0.2;
          p.vel = Math.random() * 1 + 0.5;
          p.width = Math.random() * 1.2 + 0.2;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density, speed, color, glow]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
