
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const HeroSection = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center premium-grid pt-32 pb-24 px-6">
      
      {/* Main Content */}
      <div className="container mx-auto max-w-4xl relative z-10">
        <div ref={ref} className={`space-y-8 ${isRevealed ? '' : ''}`}>
          
          {/* Hero Badge */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-blue-light border border-blue-interconecta/20 px-4 py-2 rounded-full text-[13px] font-semibold text-blue-interconecta animate-float">
              <span>Primera Plataforma IA Especializada en Transporte Mexicano</span>
            </div>
          </div>
          
          {/* Hero Title */}
          <div className="animate-slide-up-delay-1">
            <h1 className="text-hero font-bold leading-hero tracking-hero mb-6">
              La Plataforma Completa para<br />
              <span className="font-normal gradient-text-blue">Transportistas Mexicanos</span>
            </h1>
          </div>
          
          {/* Hero Subtitle */}
          <div className="animate-slide-up-delay-2">
            <p className="text-body-xl text-gray-60 leading-relaxed max-w-3xl mx-auto">
              Gestiona cartas porte con inteligencia artificial, importa datos masivamente y 
              automatiza procesos. Cumple con todas las regulaciones SAT de manera fácil y 
              eficiente.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="animate-slide-up-delay-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth/trial">
                <Button className="btn-premium bg-blue-interconecta hover:bg-blue-hover text-pure-white px-8 py-4 text-base font-semibold rounded-12 interactive">
                  <span>Prueba 14 días gratis</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" className="btn-premium border border-gray-30 text-gray-70 hover:border-blue-interconecta hover:text-blue-interconecta hover:bg-blue-light px-8 py-4 text-base font-semibold rounded-12 interactive">
                  <Play className="mr-2 h-5 w-5" />
                  <span>Iniciar sesión</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="animate-slide-up-delay-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
              <div className="text-center">
                <div className="text-title font-bold text-blue-interconecta text-mono">$2.5M</div>
                <div className="text-caption text-gray-60">En multas evitadas</div>
              </div>
              <div className="text-center">
                <div className="text-title font-bold text-blue-interconecta text-mono">500+</div>
                <div className="text-caption text-gray-60">Cartas porte diarias</div>
              </div>
              <div className="text-center">
                <div className="text-title font-bold text-blue-interconecta text-mono">99.9%</div>
                <div className="text-caption text-gray-60">Precisión IA</div>
              </div>
              <div className="text-center">
                <div className="text-title font-bold text-blue-interconecta text-mono">15 min</div>
                <div className="text-caption text-gray-60">vs 2 horas manual</div>
              </div>
            </div>
          </div>
          
          {/* Device Mockup */}
          <div className="animate-slide-up-delay-4">
            <div className="max-w-3xl mx-auto mt-16">
              <div className="relative card-premium p-6 shadow-xl overflow-hidden">
                
                {/* Floating Notifications */}
                <div className="absolute top-5 right-[-20px] bg-pure-white border border-gray-20 rounded-12 px-3 py-2 text-[13px] font-medium text-gray-70 shadow-lg animate-float-notification z-10">
                  ✅ Carta porte CP-2847 timbrada
                </div>
                <div className="absolute bottom-8 left-[-30px] bg-pure-white border border-gray-20 rounded-12 px-3 py-2 text-[13px] font-medium text-gray-70 shadow-lg animate-float-notification z-10" style={{ animationDelay: '-4s' }}>
                  🚛 TRK-005 en ruta a Guadalajara
                </div>
                <div className="absolute top-1/2 right-[-40px] bg-pure-white border border-gray-20 rounded-12 px-3 py-2 text-[13px] font-medium text-gray-70 shadow-lg animate-float-notification z-10" style={{ animationDelay: '-6s' }}>
                  💡 IA sugiere ruta optimizada
                </div>
                
                {/* Device Header */}
                <div className="flex items-center gap-2 pb-4 border-b border-gray-20 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-auto text-sm font-semibold text-gray-70">Interconecta — Dashboard</div>
                </div>
                
                {/* Dashboard Preview */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="card-premium p-5 text-left transition-all duration-300 hover:bg-pure-white hover:shadow-md hover:-translate-y-1">
                    <div className="text-caption text-gray-60 mb-2">Viajes activos</div>
                    <div className="text-[32px] font-bold text-pure-black mb-1 text-mono">12</div>
                    <div className="text-[13px] font-semibold text-blue-interconecta">+3 esta semana</div>
                  </div>
                  
                  <div className="card-premium p-5 text-left transition-all duration-300 hover:bg-pure-white hover:shadow-md hover:-translate-y-1">
                    <div className="text-caption text-gray-60 mb-2">Ingresos mes</div>
                    <div className="text-[32px] font-bold text-pure-black mb-1 text-mono">$287K</div>
                    <div className="text-[13px] font-semibold text-blue-interconecta">+18% vs anterior</div>
                  </div>
                  
                  <div className="card-premium p-5 text-left transition-all duration-300 hover:bg-pure-white hover:shadow-md hover:-translate-y-1">
                    <div className="text-caption text-gray-60 mb-2">Tiempo promedio</div>
                    <div className="text-[32px] font-bold text-pure-black mb-1 text-mono">3.2<span className="text-lg text-gray-60">min</span></div>
                    <div className="text-[13px] font-semibold text-blue-interconecta">Automatización IA</div>
                  </div>
                  
                  <div className="card-premium p-5 text-left transition-all duration-300 hover:bg-pure-white hover:shadow-md hover:-translate-y-1">
                    <div className="text-caption text-gray-60 mb-2">Errores SAT</div>
                    <div className="text-[32px] font-bold text-pure-black mb-1 text-mono">0</div>
                    <div className="text-[13px] font-semibold text-blue-interconecta">Perfección total</div>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="bg-blue-light border border-blue-interconecta/20 rounded-8 px-4 py-3 text-center text-sm font-semibold text-blue-interconecta">
                  ✨ Todas las cartas porte generadas automáticamente
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
