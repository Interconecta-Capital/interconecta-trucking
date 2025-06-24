import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

const HeroSection = () => {
  const starRef = useRef<HTMLCanvasElement>(null);
  const truckRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const starCanvas = starRef.current;
    const truckCanvas = truckRef.current;
    if (!starCanvas || !truckCanvas) return;
    const starCtx = starCanvas.getContext("2d");
    const truckCtx = truckCanvas.getContext("2d");
    if (!starCtx || !truckCtx) return;

    const resize = () => {
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      truckCanvas.width = window.innerWidth;
      truckCanvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const createStars = (count: number): Star[] => {
      const arr: Star[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * starCanvas.width,
          y: Math.random() * starCanvas.height,
          radius: Math.random() * 0.8 + 0.2,
          alpha: Math.random(),
          twinkleSpeed: Math.random() * 0.05 + 0.01,
          phase: Math.random() * Math.PI * 2,
        });
      }
      return arr;
    };

    let stars = createStars(120);
    let animationId: number;
    const start = performance.now();

    const drawTruck = (bob: number) => {
      const totalWidth = 160;
      const cabWidth = 60;
      const trailerWidth = 100;
      const cabHeight = 40;
      const trailerHeight = 30;
      const x = truckCanvas.width / 2 - totalWidth / 2;
      const y = truckCanvas.height / 2 + bob;

      truckCtx.fillStyle = "#3A50D0";
      truckCtx.fillRect(
        x,
        y - trailerHeight / 2,
        trailerWidth,
        trailerHeight
      );
      truckCtx.fillStyle = "#4A69FF";
      truckCtx.fillRect(
        x + trailerWidth,
        y - cabHeight / 2 - 5,
        cabWidth,
        cabHeight
      );
    };

    const render = (time: number) => {
      starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      stars.forEach((s) => {
        s.phase += s.twinkleSpeed;
        const alpha = ((Math.sin(s.phase) + 1) / 2) * s.alpha;
        starCtx.fillStyle = `rgba(255,255,255,${alpha})`;
        starCtx.beginPath();
        starCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        starCtx.fill();
      });

      truckCtx.clearRect(0, 0, truckCanvas.width, truckCanvas.height);
      const bob = Math.sin((time - start) * 0.002) * 4;
      drawTruck(bob);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <header className="relative w-screen h-screen bg-[#0D0D0D] overflow-hidden flex items-center justify-center text-white">
      <canvas ref={starRef} className="absolute inset-0 w-full h-full" />
      <canvas ref={truckRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center space-y-6 px-4 font-sans">
        <h1 className="text-5xl sm:text-6xl font-bold">Logística.</h1>
        <p className="max-w-xl mx-auto text-gray-300">
          Planifica tus viajes sin esfuerzo. Nosotros generamos la Carta Porte perfecta, siempre.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/auth">
            <Button className="rounded-full px-6 py-3">Programar mi Primer Viaje</Button>
          </Link>
          <Button variant="ghost" className="rounded-full px-6 py-3 text-white hover:bg-white/10">
            Ver Demo →
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
