
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const HeroSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden gradient-subtle">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 premium-grid opacity-30"></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div ref={ref} className="grid lg:grid-cols-[60%_40%] gap-16 items-center min-h-[80vh]">
          
          {/* Left Column - Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            
            {/* Overline */}
            <div className="stagger-item">
              <div className="inline-flex items-center bg-blue-interconecta/10 border border-blue-interconecta/20 rounded-full px-4 py-2">
                <span className="text-sm font-medium text-blue-interconecta uppercase tracking-wide">
                  Carta Porte Inteligente
                </span>
              </div>
            </div>
            
            {/* Hero Headline */}
            <div className="stagger-item">
              <h1 className="text-responsive-hero font-bold text-gray-90 leading-hero tracking-hero">
                Carta Porte.
                <br />
                <span className="text-blue-interconecta">Completamente</span>
                <br />
                <span className="text-blue-interconecta">automática.</span>
              </h1>
            </div>
            
            {/* Subheadline */}
            <div className="stagger-item">
              <p className="text-responsive-subtitle text-gray-70 leading-relaxed max-w-2xl">
                Soluciones de transporte potenciadas por IA para empresas que buscan automatización completa y cumplimiento garantizado con el SAT
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="stagger-item">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/trial">
                  <Button size="lg" className="btn-premium gradient-premium text-pure-white px-12 py-4 text-lg font-semibold shadow-premium">
                    <Calendar className="mr-2 h-6 w-6" />
                    Solicitar Demo
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="lg" variant="outline" className="btn-premium border-2 border-blue-interconecta text-blue-interconecta hover:bg-blue-interconecta hover:text-pure-white px-12 py-4 text-lg font-medium">
                    Ver Casos de Éxito
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>
            
          </div>

          {/* Right Column - Visual */}
          <div className={`relative ${isVisible ? 'animate-scale-in' : 'opacity-0'} stagger-item`} style={{ animationDelay: '0.4s' }}>
            
            {/* Floating Dashboard Mockup */}
            <div className="relative">
              
              {/* Main Card */}
              <div className="card-premium p-8 shadow-2xl animate-float">
                <div className="space-y-6">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-70">Carta Porte Activa</span>
                    </div>
                    <div className="text-xs text-gray-50 bg-gray-05 px-2 py-1 rounded-full">
                      En tiempo real
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-05 rounded-xl">
                      <div className="text-2xl font-bold text-blue-interconecta font-mono">2.5M</div>
                      <div className="text-xs text-gray-60">Multas evitadas</div>
                    </div>
                    <div className="text-center p-4 bg-gray-05 rounded-xl">
                      <div className="text-2xl font-bold text-blue-interconecta font-mono">99.9%</div>
                      <div className="text-xs text-gray-60">Precisión IA</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-70">Procesamiento automático</span>
                      <span className="text-green-600 font-medium">Completado</span>
                    </div>
                    <div className="w-full bg-gray-10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-interconecta to-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                </div>
              </div>
              
              {/* Floating Notification */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-pure-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                <div className="text-xs font-medium">✓ Timbrado exitoso</div>
              </div>
              
              {/* Floating Metrics */}
              <div className="absolute -bottom-4 -left-4 bg-pure-white border border-gray-20 px-4 py-2 rounded-lg shadow-lg">
                <div className="text-xs text-gray-60">Tiempo de procesamiento</div>
                <div className="text-lg font-bold text-blue-interconecta font-mono">15 min</div>
              </div>
              
            </div>
            
          </div>
          
        </div>

        {/* Stats Section */}
        <div className={`mt-24 ${isVisible ? 'animate-fade-in' : 'opacity-0'} stagger-item`} style={{ animationDelay: '0.6s' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-interconecta font-mono">$2.5M</div>
              <div className="text-sm text-gray-60 mt-2">En multas evitadas</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-interconecta font-mono">500+</div>
              <div className="text-sm text-gray-60 mt-2">Cartas porte diarias</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-interconecta font-mono">99.9%</div>
              <div className="text-sm text-gray-60 mt-2">Precisión IA</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-interconecta font-mono">15 min</div>
              <div className="text-sm text-gray-60 mt-2">vs 2 horas manual</div>
            </div>
            
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default HeroSection;
