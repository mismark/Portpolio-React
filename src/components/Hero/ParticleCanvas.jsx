import { useEffect, useRef } from "react";

/**
 * Lightweight canvas particle field — no external libraries.
 * Dots float and connect with lines when close enough.
 * Respects prefers-reduced-motion.
 */
export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let raf;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Particles ────────────────────────────────────────────────────────────
    const COUNT   = 55;
    const CONNECT = 130; // max distance to draw a line

    const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  Math.random() * 2 + 1.2,
    }));

    // ── Draw loop ────────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dark    = isDark();
      const dotClr  = dark ? "rgba(129,140,248," : "rgba(99,102,241,";
      const lineClr = dark ? "rgba(129,140,248," : "rgba(99,102,241,";

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${dotClr}0.55)`;
        ctx.fill();

        // Draw connecting lines to nearby particles
        for (let j = i + 1; j < COUNT; j++) {
          const q  = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `${lineClr}${(1 - d / CONNECT) * 0.18})`;
            ctx.lineWidth   = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
