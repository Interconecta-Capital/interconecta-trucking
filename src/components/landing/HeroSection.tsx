
import { Button } from "@/components/ui/button";
import { Calendar, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full px-4 py-2 mb-6">
          <Star className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-inter font-medium text-green-700">
            🏆 Primera Plataforma IA Especializada en Transporte Mexicano
          </span>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold font-sora text-interconecta-text-primary mb-6 leading-tight">
          Automatiza tu Transporte con
          <br />
          <span className="gradient-text">Inteligencia Artificial</span>
        </h2>
        
        <p className="text-xl font-inter text-interconecta-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
          La única plataforma que combina IA avanzada con conocimiento especializado en regulaciones SAT. 
          Evita multas, automatiza procesos y escala sin límites.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/auth/trial">
            <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 text-lg font-sora font-semibold shadow-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Demo Personalizada Gratis
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light px-8 py-4 text-lg font-sora font-medium">
              Calcular mi ROI
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Stats Mejorados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-interconecta-border-subtle">
            <div className="text-2xl font-bold font-sora text-green-600">$2.5M</div>
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
            <div className="text-2xl font-bold font-sora text-green-600">15 min</div>
            <div className="text-sm font-inter text-interconecta-text-secondary">vs 2 horas manual</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
