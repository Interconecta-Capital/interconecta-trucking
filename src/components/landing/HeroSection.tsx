
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
          <span>Primera Plataforma IA Especializada en Transporte Mexicano</span>
        </div>
        
        <h2 className={`text-hero mb-6 leading-tight ${revealed ? 'slide-up-animation slide-up-delay-1' : ''}`}>
          La Plataforma Completa para
          <br />
          <span className="gradient-text">Transportistas Mexicanos</span>
        </h2>
        
        <p className={`text-body-xl text-interconecta-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed ${revealed ? 'slide-up-animation slide-up-delay-2' : ''}`}>
          Gestiona cartas porte con inteligencia artificial, importa datos masivamente y automatiza procesos. 
          Cumple con todas las regulaciones SAT de manera fácil y eficiente.
        </p>
        
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 ${revealed ? 'slide-up-animation slide-up-delay-3' : ''}`}>
          <Link to="/auth/trial">
            <Button size="lg" className="btn-premium-primary interactive">
              <Calendar className="mr-2 h-5 w-5" />
              Prueba 14 días gratis
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" className="btn-premium-secondary interactive">
              Iniciar sesión
              <LogIn className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Stats Mejorados con diseño premium */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center ${revealed ? 'slide-up-animation slide-up-delay-3' : ''}`}>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-sora text-interconecta-primary text-mono">$2.5M</div>
            <div className="text-sm font-inter text-interconecta-text-secondary mt-1">En multas evitadas</div>
          </div>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-sora text-interconecta-primary text-mono">500+</div>
            <div className="text-sm font-inter text-interconecta-text-secondary mt-1">Cartas porte diarias</div>
          </div>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-sora text-interconecta-primary text-mono">99.9%</div>
            <div className="text-sm font-inter text-interconecta-text-secondary mt-1">Precisión IA</div>
          </div>
          <div className="premium-card p-6">
            <div className="text-3xl font-bold font-sora text-interconecta-primary text-mono">15 min</div>
            <div className="text-sm font-inter text-interconecta-text-secondary mt-1">vs 2 horas manual</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
