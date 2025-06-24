import { useEffect, useRef } from "react";

const COLORS = {
  BACKGROUND: "#0D0D0D",
  PRIMARY_BLUE: "#4A69FF",
  LIGHT_BLUE: "#A8B8FF",
  DARK_BLUE: "#2D3B8E",
  TEXT_LIGHT: "#EAEAEA",
  GREEN_CHECK: "#34D399",
  NODE_PULSE: "rgba(74,105,255,0.3)",
  WHEEL_DARK: "#222",
  WHEEL_LIGHT: "#555"
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface AnimationState {
  phase: "COMPLEXITY" | "SOLUTION" | "ACTION" | "CYCLE";
  startTime: number;
  progress: number;
  loopDuration: number;
}

const HeroAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state: AnimationState = {
      phase: "COMPLEXITY",
      startTime: 0,
      progress: 0,
      loopDuration: 10000
    };

    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const createParticles = (count: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1
        });
      }
    };

    const drawParticles = () => {
      ctx.fillStyle = COLORS.LIGHT_BLUE;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawTruck = (x: number, y: number, size: number) => {
      ctx.fillStyle = COLORS.PRIMARY_BLUE;
      ctx.fillRect(x, y - size / 2, size * 1.5, size);
      ctx.fillStyle = COLORS.DARK_BLUE;
      ctx.fillRect(x + size * 1.5, y - size / 2, size, size);
      ctx.fillStyle = COLORS.WHEEL_DARK;
      ctx.beginPath();
      ctx.arc(x + size * 0.6, y + size / 2, size / 4, 0, Math.PI * 2);
      ctx.arc(x + size * 1.8, y + size / 2, size / 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawDocument = (x: number, y: number, size: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size * 0.8, size);
      ctx.fillStyle = COLORS.TEXT_LIGHT;
      ctx.fillRect(x + size * 0.1, y + size * 0.2, size * 0.6, size * 0.1);
      ctx.fillRect(x + size * 0.1, y + size * 0.4, size * 0.6, size * 0.1);
    };

    const drawCheckmark = (
      x: number,
      y: number,
      size: number,
      color: string,
      progress: number
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (size / 2) * progress, y + size * 0.5 * progress);
      ctx.lineTo(x + size * progress, y - size * 0.2 * progress);
      ctx.stroke();
    };

    const easeInOutCubic = (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const runComplexityPhase = (progress: number) => {
      drawParticles();
      ctx.globalAlpha = easeInOutCubic(progress);
      drawDocument(canvas.width / 2 - 40, canvas.height / 2 - 50, 80, COLORS.DARK_BLUE);
      ctx.globalAlpha = 1;
    };

    const runSolutionPhase = (progress: number) => {
      const p = easeInOutCubic(progress);
      const x = canvas.width / 2 - 60 + p * 40;
      drawTruck(x, canvas.height / 2, 40);
    };

    const drawDashboard = (cx: number, cy: number, progress: number) => {
      ctx.fillStyle = COLORS.PRIMARY_BLUE;
      ctx.fillRect(cx - 60, cy - 40, 120, 80);
      ctx.fillStyle = COLORS.TEXT_LIGHT;
      ctx.fillRect(cx - 50, cy - 30, 100, 10);
      ctx.fillRect(cx - 50, cy - 10, 100, 10);
    };

    const runActionPhase = (progress: number) => {
      const p = easeInOutCubic(progress);
      drawDashboard(canvas.width / 2, canvas.height / 2, p);
      drawCheckmark(canvas.width / 2 + 65, canvas.height / 2 + 20, 20, COLORS.GREEN_CHECK, p);
    };

    const runCyclePhase = (progress: number) => {
      const p = 1 - progress;
      ctx.globalAlpha = p;
      drawDashboard(canvas.width / 2, canvas.height / 2, p);
      ctx.globalAlpha = 1;
    };

    const setupAll = () => {
      resize();
      createParticles(40);
      if (!state.startTime) {
        state.startTime = performance.now();
      }
    };

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = timestamp - state.startTime;
      const loop = (elapsed % state.loopDuration) / state.loopDuration;

      if (loop < 0.2) {
        state.phase = "COMPLEXITY";
        state.progress = loop / 0.2;
      } else if (loop < 0.4) {
        state.phase = "SOLUTION";
        state.progress = (loop - 0.2) / 0.2;
      } else if (loop < 0.85) {
        state.phase = "ACTION";
        state.progress = (loop - 0.4) / 0.45;
      } else {
        state.phase = "CYCLE";
        state.progress = (loop - 0.85) / 0.15;
      }

      switch (state.phase) {
        case "COMPLEXITY":
          runComplexityPhase(state.progress);
          break;
        case "SOLUTION":
          runSolutionPhase(state.progress);
          break;
        case "ACTION":
          runActionPhase(state.progress);
          break;
        case "CYCLE":
          runCyclePhase(state.progress);
          break;
      }

      requestAnimationFrame(animate);
    };

    setupAll();
    const id = requestAnimationFrame(animate);
    window.addEventListener("resize", setupAll);

    return () => {
      window.removeEventListener("resize", setupAll);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-auto aspect-video rounded-xl shadow-2xl"
      />
    </div>
  );
};

export default HeroAnimation;

