
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense } from "react";

// Lazy load del componente de animación pesada
const HeroAnimation = lazy(() => import("./HeroAnimation"));

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Función para redimensionar el canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
    }> = [];
    
    // Ajustar número de partículas según el tamaño de pantalla (reducido para mejor rendimiento)
    const getParticleCount = () => {
      if (window.innerWidth < 768) return 20;
      if (window.innerWidth < 1024) return 40;
      return 60;
    };

    const initParticles = () => {
      particles = [];
      const particleCount = getParticleCount();
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          vx: Math.random() * 0.5 - 0.25,
          vy: Math.random() * 0.5 - 0.25
        });
      }
    };

    initParticles();

    const animate = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

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

      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Solo iniciar animación si es visible
    if (isVisible) {
      animate();
    }

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    // Page Visibility API para pausar cuando no es visible
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, isPaused]);

  // IntersectionObserver para iniciar animación solo cuando sea visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const canvas = canvasRef.current;
    if (canvas) {
      observer.observe(canvas);
    }

    return () => {
      if (canvas) {
        observer.unobserve(canvas);
      }
    };
  }, []);

  return (
    <header className="relative text-center py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 overflow-hidden bg-black text-white min-h-screen flex items-center">
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Título principal responsivo */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold apple-gradient-text leading-tight tracking-tighter px-2">
            El Centro de Comando para tu Logística.
          </h1>
          
          {/* Subtítulo responsivo */}
          <p className="mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4 leading-relaxed">
            Planifica tus viajes sin esfuerzo. Nosotros generamos la Carta Porte perfecta, siempre.
          </p>
          
          {/* Botones responsivos */}
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button className="btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold w-full sm:w-auto text-sm sm:text-base">
                Programar mi Primer Viaje
              </Button>
            </Link>
            <Button variant="ghost" className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold w-full sm:w-auto text-sm sm:text-base">
              Ver Demo →
            </Button>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
          <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto aspect-video rounded-xl bg-black/20 animate-pulse" />
          }>
            <HeroAnimation />
          </Suspense>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
