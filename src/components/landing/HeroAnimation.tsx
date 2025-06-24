import { useEffect, useRef } from "react";

const COLORS = {
  BACKGROUND: "#0D0D0D",
  PRIMARY_BLUE: "#4A69FF",
  LIGHT_BLUE: "#A8B8FF",
  DARK_BLUE: "#2D3B8E",
  TEXT_LIGHT: "#EAEAEA",
  TEXT_DARK: "#333333",
  GREEN_CHECK: "#34D399",
  NODE_PULSE: "rgba(74, 105, 255, 0.3)",
  WHEEL_DARK: "#222",
  WHEEL_LIGHT: "#555"
};

interface AnimationState {
  phase: "COMPLEXITY" | "SOLUTION" | "ACTION" | "CYCLE";
  startTime: number;
  progress: number;
  loopDuration: number;
}

class Particle {
  x = 0;
  y = 0;
  radius = 1;
  vx = 0;
  vy = 0;
  alpha = 0;
  constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D) {
    this.reset();
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.radius = Math.random() * 1.5 + 0.5;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.alpha = 0;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > this.canvas.width || this.y < 0 || this.y > this.canvas.height) {
      this.reset();
    }
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(168, 184, 255, ${this.alpha})`;
    this.ctx.fill();
  }
}

const HeroAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const animationState: AnimationState = {
      phase: "COMPLEXITY",
      startTime: 0,
      progress: 0,
      loopDuration: 10000
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    const createParticles = (count: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas, ctx));
      }
    };

    function drawTruck(x: number, y: number, size: number, wheelRotation: number) {
      ctx.save();
      ctx.translate(x, y);

      const trailerHeight = size * 1.2;
      const trailerWidth = size * 2.5;
      const trailerX = -size * 0.7;
      const cornerRadius = size * 0.1;

      ctx.fillStyle = COLORS.TEXT_LIGHT;
      ctx.beginPath();
      ctx.roundRect(trailerX - trailerWidth, -trailerHeight, trailerWidth, trailerHeight, cornerRadius);
      ctx.fill();
      ctx.fillStyle = COLORS.DARK_BLUE;
      ctx.fillRect(trailerX - trailerWidth, -cornerRadius, trailerWidth, cornerRadius * 1.5);

      ctx.fillStyle = COLORS.PRIMARY_BLUE;
      ctx.strokeStyle = COLORS.LIGHT_BLUE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 0.5, -size * 1.1);
      ctx.lineTo(size * 0.4, -size * 1.1);
      ctx.lineTo(size * 0.6, -size * 0.5);
      ctx.lineTo(size * 0.3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 0.6, 0);
      ctx.lineTo(-size * 0.7, -size * 0.4);
      ctx.lineTo(-size * 0.5, -size * 0.6);
      ctx.lineTo(-size * 0.25, -size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(13, 13, 13, 0.5)";
      ctx.beginPath();
      ctx.moveTo(size * 0.3, -size * 1);
      ctx.lineTo(-size * 0.4, -size * 1);
      ctx.lineTo(-size * 0.5, -size * 0.65);
      ctx.lineTo(size * 0.4, -size * 0.65);
      ctx.closePath();
      ctx.fill();

      const drawWheel = (wx: number, wy: number, rotation: number) => {
        const wheelRadius = size * 0.2;
        ctx.save();
        ctx.translate(wx, wy);
        ctx.fillStyle = COLORS.WHEEL_DARK;
        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.WHEEL_LIGHT;
        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(rotation);
        ctx.strokeStyle = COLORS.WHEEL_DARK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -wheelRadius * 0.4);
        ctx.lineTo(0, wheelRadius * 0.4);
        ctx.stroke();
        ctx.restore();
      };

      drawWheel(0, 0, wheelRotation);
      drawWheel(size * 0.7, 0, wheelRotation);
      drawWheel(trailerX - size * 0.4, 0, wheelRotation);
      drawWheel(trailerX - size * 0.8, 0, wheelRotation);
      drawWheel(trailerX - trailerWidth + size * 0.8, 0, wheelRotation);
      drawWheel(trailerX - trailerWidth + size * 0.4, 0, wheelRotation);

      ctx.restore();
    }

    function drawDocument(x: number, y: number, size: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size * 1.2);
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y + size * (0.2 * i + 0.1));
        ctx.lineTo(x + size * 0.8, y + size * (0.2 * i + 0.1));
        ctx.stroke();
      }
    }

    function drawCheckmark(
      x: number,
      y: number,
      size: number,
      color: string,
      progress: number
    ) {
      if (progress <= 0) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const p1 = { x: x, y: y + size * 0.5 };
      const p2 = { x: x + size * 0.5, y: y + size };
      const p3 = { x: x + size * 1.5, y: y };

      const len1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const len2 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const totalLength = len1 + len2;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);

      ctx.setLineDash([totalLength]);
      ctx.lineDashOffset = totalLength * (1 - progress);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function runComplexityPhase(progress: number) {
      const fadeInProgress = easeInOutCubic(Math.min(1, progress / 0.5));
      const fadeOutProgress = easeInOutCubic(Math.max(0, (progress - 0.8) / 0.2));
      particles.forEach((p) => {
        p.alpha = fadeInProgress * (1 - fadeOutProgress);
        p.update();
        p.draw();
      });
    }

    function drawDashboard(cx: number, cy: number, progress: number) {
      const width = 300 * progress;
      const height = 150 * progress;
      const x = cx - width / 2;
      const y = cy - height / 2;

      ctx.fillStyle = `rgba(26, 26, 26, ${progress})`;
      ctx.strokeStyle = `rgba(74, 105, 255, ${progress})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 10);
      ctx.fill();
      ctx.stroke();

      if (progress > 0.8) {
        const alpha = (progress - 0.8) / 0.2;
        ctx.fillStyle = `rgba(234, 234, 234, ${alpha})`;
        ctx.font = `bold ${14 * progress}px Inter`;

        const labels = ["Viajes", "Cartas Porte", "Vehículos", "Conductores"];
        const values = [137, 892, 42, 58];
        const itemWidth = width / 4;
        for (let i = 0; i < 4; i++) {
          const countUpValue = Math.floor(values[i] * progress);
          ctx.textAlign = "center";
          ctx.fillText(countUpValue.toString(), x + itemWidth * (i + 0.5), y + height * 0.4);

          ctx.fillStyle = `rgba(160, 160, 160, ${alpha})`;
          ctx.font = `${10 * progress}px Inter`;
          ctx.fillText(labels[i], x + itemWidth * (i + 0.5), y + height * 0.7);
          ctx.fillStyle = `rgba(234, 234, 234, ${alpha})`;
        }
      }
    }

    function runSolutionPhase(progress: number) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const pulseProgress = easeInOutCubic(Math.min(1, progress / 0.4));
      const maxPulseRadius = canvas.width * 0.6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxPulseRadius * pulseProgress, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 105, 255, ${0.3 * (1 - pulseProgress)})`;
      ctx.fill();

      const absorbProgress = easeInOutCubic(Math.max(0, (progress - 0.1) / 0.5));
      particles.forEach((p) => {
        p.vx += (centerX - p.x) * 0.001 * absorbProgress;
        p.vy += (centerY - p.y) * 0.001 * absorbProgress;
        p.update();
        p.alpha = 1 - absorbProgress;
        p.draw();
      });

      const dashProgress = easeInOutCubic(Math.max(0, (progress - 0.4) / 0.6));
      if (dashProgress > 0) {
        drawDashboard(centerX, centerY, dashProgress);
      }
    }

    function runActionPhase(progress: number) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      drawDashboard(centerX, centerY, 1);

      const routeProgress = easeInOutCubic(Math.min(1, progress / 0.3));
      const startX = canvas.width * 0.1;
      const endX = canvas.width * 0.9;
      const routeY = canvas.height * 0.5;

      ctx.beginPath();
      ctx.moveTo(startX, routeY);
      ctx.lineTo(startX + (endX - startX) * routeProgress, routeY);
      ctx.strokeStyle = COLORS.PRIMARY_BLUE;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      const iconProgress = easeInOutCubic(Math.max(0, (progress - 0.2) / 0.4));
      if (iconProgress > 0) {
        const docX = startX + (endX - startX) * 0.2;
        const pinX = startX + (endX - startX) * 0.4;

        ctx.globalAlpha = iconProgress;
        drawDocument(docX, routeY - 45, 20, COLORS.LIGHT_BLUE);

        const checkProgress = easeInOutCubic(Math.max(0, (progress - 0.4) / 0.3));
        drawCheckmark(docX + 2, routeY - 35, 8, COLORS.GREEN_CHECK, checkProgress);

        ctx.beginPath();
        ctx.arc(pinX, routeY - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.LIGHT_BLUE;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const truckMoveProgress = easeInOutCubic(Math.max(0, (progress - 0.3) / 0.7));
      const truckStartX = startX - 150;
      const truckEndX = endX + 150;
      const truckX = truckStartX + (truckEndX - truckStartX) * truckMoveProgress;
      const bobbing = Math.sin(performance.now() / 150) * 1.5;
      const wheelRotation = performance.now() / 80;
      if (truckMoveProgress > 0) {
        drawTruck(truckX, routeY + bobbing, 22, wheelRotation);
      }
    }

    function runCyclePhase(progress: number) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fadeOutProgress = easeInOutCubic(progress);

      drawDashboard(centerX, centerY, 1 - fadeOutProgress);

      if (fadeOutProgress > 0.5) {
        const pulseProgress = (fadeOutProgress - 0.5) / 0.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50 * pulseProgress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 105, 255, ${0.3 * (1 - pulseProgress)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 * (1 - pulseProgress), 0, Math.PI * 2);
        ctx.fillStyle = COLORS.PRIMARY_BLUE;
        ctx.fill();
      }
    }

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsedTime = timestamp - animationState.startTime;
      const loopProgress = (elapsedTime % animationState.loopDuration) / animationState.loopDuration;

      if (loopProgress < 0.2) {
        animationState.phase = "COMPLEXITY";
        animationState.progress = loopProgress / 0.2;
      } else if (loopProgress < 0.4) {
        animationState.phase = "SOLUTION";
        animationState.progress = (loopProgress - 0.2) / 0.2;
      } else if (loopProgress < 0.85) {
        animationState.phase = "ACTION";
        animationState.progress = (loopProgress - 0.4) / 0.45;
      } else {
        animationState.phase = "CYCLE";
        animationState.progress = (loopProgress - 0.85) / 0.15;
        if (animationState.progress > 0.95 && particles.length === 0) {
          createParticles(80);
        }
      }

      switch (animationState.phase) {
        case "COMPLEXITY":
          runComplexityPhase(animationState.progress);
          break;
        case "SOLUTION":
          runSolutionPhase(animationState.progress);
          break;
        case "ACTION":
          runActionPhase(animationState.progress);
          break;
        case "CYCLE":
          runCyclePhase(animationState.progress);
          break;
      }

      requestAnimationFrame(animate);
    };

    const setup = () => {
      resize();
      createParticles(80);
      animationState.startTime = performance.now();
      requestAnimationFrame(animate);
    };

    setup();

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <canvas ref={canvasRef} className="w-full h-auto aspect-video rounded-xl shadow-2xl" />
    </div>
  );
};

export default HeroAnimation;
