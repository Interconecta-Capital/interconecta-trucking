
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
    <header className="relative text-center py-16 md:py-32 lg:py-40 overflow-hidden bg-black text-white">
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold apple-gradient-text leading-tight tracking-tighter">
            El Centro de Comando para tu Logística.
          </h1>
          <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Planifica tus viajes sin esfuerzo. Nosotros generamos la Carta Porte perfecta, siempre.
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/auth">
              <Button className="btn-primary px-6 py-3 rounded-full font-semibold w-full sm:w-auto">
                Programar mi Primer Viaje
              </Button>
            </Link>
            <Button variant="ghost" className="btn-secondary px-6 py-3 rounded-full font-semibold w-full sm:w-auto">
              Ver Demo →
            </Button>
          </div>
        </div>

        {/* Dashboard Mockup - MacBook Style */}
        <div className="mt-12 md:mt-20 scroll-animation">
          <div className="mx-auto max-w-6xl">
            {/* MacBook Frame */}
            <div className="relative bg-gray-800 rounded-t-3xl p-2 shadow-2xl">
              {/* MacBook Top Bar */}
              <div className="bg-gray-900 rounded-t-2xl px-4 py-2 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300 inline-block">
                    https://app.interconecta.mx/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-b-2xl p-4 md:p-6 min-h-[300px] md:min-h-[400px]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-600">Bienvenido a Interconecta</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">ViajeWizard</div>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">Activo</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
                    <div className="text-xs md:text-sm text-gray-600">Viajes Hoy</div>
                    <div className="text-lg md:text-2xl font-bold text-blue-600">12</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
                    <div className="text-xs md:text-sm text-gray-600">Cartas Porte</div>
                    <div className="text-lg md:text-2xl font-bold text-green-600">8</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
                    <div className="text-xs md:text-sm text-gray-600">Vehículos</div>
                    <div className="text-lg md:text-2xl font-bold text-purple-600">24</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
                    <div className="text-xs md:text-sm text-gray-600">Conductores</div>
                    <div className="text-lg md:text-2xl font-bold text-orange-600">18</div>
                  </div>
                </div>

                {/* ViajeWizard Preview */}
                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">ViajeWizard</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Nuevo</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1">
                      <div className="text-xs md:text-sm text-gray-600 mb-1">Próximo viaje programado</div>
                      <div className="text-sm md:text-base font-medium">CDMX → Guadalajara</div>
                      <div className="text-xs text-gray-500">Salida: Mañana 08:00</div>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors w-full sm:w-auto">
                      Gestionar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MacBook Base */}
            <div className="bg-gray-700 h-4 rounded-b-3xl mx-auto w-3/4 shadow-lg"></div>
            <div className="bg-gray-800 h-2 rounded-b-2xl mx-auto w-1/2"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
