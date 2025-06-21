
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
    }> = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(245, 245, 247, 0.5)';

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="relative text-center py-24 md:py-40 overflow-hidden bg-black text-white">
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-7xl font-bold apple-gradient-text leading-tight tracking-tighter">
          El Centro de Comando para tu Logística.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Planifica tus viajes sin esfuerzo. Nosotros generamos la Carta Porte perfecta, siempre.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/auth">
            <Button className="btn-primary px-6 py-3 rounded-full font-semibold">
              Programar mi Primer Viaje
            </Button>
          </Link>
          <Button variant="ghost" className="btn-secondary px-6 py-3 rounded-full font-semibold">
            Ver Demo →
          </Button>
        </div>
        <div className="mt-20 scroll-animation">
          <div className="mx-auto rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 max-w-4xl">
            <div className="bg-gray-700 h-64 rounded-lg flex items-center justify-center text-gray-400">
              Mockup del ViajeWizard UI
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
