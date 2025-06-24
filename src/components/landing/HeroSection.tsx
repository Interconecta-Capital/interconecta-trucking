
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
    
    // Ajustar número de partículas según el tamaño de pantalla
    const getParticleCount = () => {
      if (window.innerWidth < 768) return 30;
      if (window.innerWidth < 1024) return 60;
      return 100;
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
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

        {/* Dashboard Mockup - Completamente responsivo */}
        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 scroll-animation">
          <div className="mx-auto max-w-6xl px-2 sm:px-4">
            {/* MacBook Frame - Adaptado para móviles */}
            <div className="relative bg-gray-800 rounded-t-lg sm:rounded-t-2xl lg:rounded-t-3xl p-1 sm:p-2 shadow-2xl">
              {/* MacBook Top Bar */}
              <div className="bg-gray-900 rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl px-2 sm:px-4 py-1 sm:py-2 flex items-center space-x-1 sm:space-x-2">
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-gray-700 rounded px-2 sm:px-3 py-0.5 sm:py-1 text-xs text-gray-300 inline-block max-w-[200px] sm:max-w-none truncate">
                    <span className="hidden sm:inline">https://app.interconecta.mx/dashboard</span>
                    <span className="sm:hidden">interconecta.mx</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-b-lg sm:rounded-b-xl lg:rounded-b-2xl p-2 sm:p-4 md:p-6 min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6 space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Bienvenido a Interconecta</p>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <div className="bg-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">ViajeWizard</div>
                    <div className="bg-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">Activo</div>
                  </div>
                </div>

                {/* Stats Grid - Responsivo */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-6">
                  <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                    <div className="text-xs text-gray-600">Viajes Hoy</div>
                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">12</div>
                  </div>
                  <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                    <div className="text-xs text-gray-600">Cartas Porte</div>
                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-green-600">8</div>
                  </div>
                  <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                    <div className="text-xs text-gray-600">Vehículos</div>
                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-purple-600">24</div>
                  </div>
                  <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                    <div className="text-xs text-gray-600">Conductores</div>
                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-orange-600">18</div>
                  </div>
                </div>

                {/* ViajeWizard Preview */}
                <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 shadow-sm border">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">ViajeWizard</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded">Nuevo</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-1">Próximo viaje programado</div>
                      <div className="text-xs sm:text-sm md:text-base font-medium truncate">CDMX → Guadalajara</div>
                      <div className="text-xs text-gray-500">Salida: Mañana 08:00</div>
                    </div>
                    <button className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors w-full sm:w-auto">
                      Gestionar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MacBook Base - Adaptado para móviles */}
            <div className="bg-gray-700 h-2 sm:h-3 lg:h-4 rounded-b-lg sm:rounded-b-2xl lg:rounded-b-3xl mx-auto w-3/4 shadow-lg"></div>
            <div className="bg-gray-800 h-1 sm:h-1.5 lg:h-2 rounded-b-md sm:rounded-b-xl lg:rounded-b-2xl mx-auto w-1/2"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
