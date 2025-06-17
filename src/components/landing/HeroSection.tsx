
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const HeroSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center premium-grid pt-32 pb-24 px-6">
      
      {/* Main Content */}
      <div className="container mx-auto max-w-4xl relative z-10">
        <div ref={ref} className={`space-y-8 ${isVisible ? '' : ''}`}>
          
          {/* Hero Badge */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-gray-10 border border-gray-20 px-4 py-2 rounded-full text-[13px] font-semibold text-gray-70 animate-float">
              <span>⚡</span>
              <span>Primera IA mexicana para transportistas</span>
            </div>
          </div>
          
          {/* Hero Title */}
          <div className="animate-slide-up-delay-1">
            <h1 className="text-hero font-bold leading-hero tracking-hero mb-6">
              Carta Porte.<br />
              Completamente<br />
              <span className="font-normal gradient-text-blue">automática</span>.
            </h1>
          </div>
          
          {/* Hero Subtitle */}
          <div className="animate-slide-up-delay-2">
            <p className="text-body-xl text-gray-60 leading-relaxed max-w-2xl mx-auto">
              La única plataforma que genera, valida y timbra tus cartas porte SAT 
              en menos de 4 minutos. Sin errores. Sin multas. Sin complicaciones.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="animate-slide-up-delay-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth/trial">
                <Button className="btn-premium bg-blue-interconecta hover:bg-blue-hover text-pure-white px-8 py-4 text-base font-semibold rounded-12 interactive">
                  <span>Ver demo en vivo</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#características">
                <Button variant="outline" className="btn-premium border border-gray-30 text-gray-70 hover:border-blue-interconecta hover:text-blue-interconecta hover:bg-blue-light px-8 py-4 text-base font-semibold rounded-12 interactive">
                  <span>Cómo funciona</span>
                </Button>
              </a>
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
