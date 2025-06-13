
import { Button } from "@/components/ui/button";
import { Calendar, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full px-4 py-2 mb-6">
          <span className="text-sm font-inter font-medium text-blue-700">
            Primera Plataforma IA Especializada en Transporte Mexicano
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sora text-interconecta-text-primary mb-6 leading-tight">
          La Plataforma Completa para
          <br />
          <span className="gradient-text">Transportistas Mexicanos</span>
        </h2>
        
        <p className="text-lg md:text-xl font-inter text-interconecta-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
          Gestiona cartas porte con inteligencia artificial, importa datos masivamente y automatiza procesos. 
          Cumple con todas las regulaciones SAT de manera fácil y eficiente.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/auth/trial">
            <Button size="lg" className="bg-interconecta-primary hover:bg-interconecta-accent text-white px-8 py-4 text-lg font-sora font-semibold shadow-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Prueba 14 días gratis
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light px-8 py-4 text-lg font-sora font-medium">
              <LogIn className="ml-2 h-5 w-5" />
              Iniciar sesión
            </Button>
          </Link>
        </div>

        {/* Stats Mejorados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-interconecta-border-subtle">
            <div className="text-2xl font-bold font-sora text-interconecta-primary">$2.5M</div>
            <div className="text-sm font-inter text-interconecta-text-secondary">En multas evitadas</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-interconecta-border-subtle">
            <div className="text-2xl font-bold font-sora text-interconecta-primary">500+</div>
            <div className="text-sm font-inter text-interconecta-text-secondary">Cartas porte diarias</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-interconecta-border-subtle">
            <div className="text-2xl font-bold font-sora text-interconecta-primary">99.9%</div>
            <div className="text-sm font-inter text-interconecta-text-secondary">Precisión IA</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-interconecta-border-subtle">
            <div className="text-2xl font-bold font-sora text-interconecta-primary">15 min</div>
            <div className="text-sm font-inter text-interconecta-text-secondary">vs 2 horas manual</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
