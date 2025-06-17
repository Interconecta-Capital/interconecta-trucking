
import { Button } from "@/components/ui/button";
import { Calendar, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(true);
  }, []);

  return (
    <section className="hero-premium">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`hero-badge-premium ${revealed ? 'slide-up-animation' : ''}`}>
          <span>⚡</span>
          <span>Primera IA mexicana para transportistas</span>
        </div>
        
        <h1 className={`text-hero mb-6 leading-tight ${revealed ? 'slide-up-animation slide-up-delay-1' : ''}`}>
          Carta Porte.<br />
          Completamente<br />
          <span className="hero-title-accent">automática</span>.
        </h1>
        
        <p className={`text-body-xl text-gray-60 mb-8 max-w-3xl mx-auto leading-relaxed ${revealed ? 'slide-up-animation slide-up-delay-2' : ''}`}>
          La única plataforma que genera, valida y timbra tus cartas porte SAT en menos de 4 minutos. 
          Sin errores. Sin multas. Sin complicaciones.
        </p>
        
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 ${revealed ? 'slide-up-animation slide-up-delay-3' : ''}`}>
          <Link to="/auth/trial">
            <Button size="lg" className="btn-premium-primary interactive">
              <Calendar className="mr-2 h-5 w-5" />
              Ver demo en vivo
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" className="btn-premium-secondary interactive">
              Cómo funciona
              <LogIn className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Stats con diseño premium */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center ${revealed ? 'slide-up-animation slide-up-delay-3' : ''}`}>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-mono text-pure-black">98%</div>
            <div className="text-sm font-inter text-gray-60 mt-1">Reducción de errores</div>
          </div>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-mono text-pure-black">3.2<span className="text-lg text-gray-60">mín</span></div>
            <div className="text-sm font-inter text-gray-60 mt-1">Tiempo promedio</div>
          </div>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-mono text-pure-black">0</div>
            <div className="text-sm font-inter text-gray-60 mt-1">Multas SAT</div>
          </div>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-mono text-pure-black">24/7</div>
            <div className="text-sm font-inter text-gray-60 mt-1">Automatización</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
