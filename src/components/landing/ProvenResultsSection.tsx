
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Clock, ShieldCheck, DollarSign, TrendingUp } from "lucide-react";

const ProvenResultsSection = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const results = [
    {
      icon: Clock,
      title: "80% Menos Tiempo",
      description: "De 2 horas a 15 minutos por carta porte con automatización IA"
    },
    {
      icon: ShieldCheck,
      title: "Cero Multas SAT",
      description: "Validación automática y cumplimiento garantizado al 99.9%"
    },
    {
      icon: DollarSign,
      title: "ROI en 30 días",
      description: "Retorno de inversión positivo desde el primer mes de uso"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidad Total",
      description: "Desde 1 hasta 1,000+ vehículos sin cambiar de plataforma"
    }
  ];

  return (
    <section className="py-20 bg-blue-interconecta">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-16 ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <h2 className="text-display font-bold leading-display tracking-display text-pure-white mb-6">
            Resultados Comprobados
          </h2>
          
          <p className="text-body-lg text-blue-light leading-relaxed max-w-2xl mx-auto">
            Empresas que ya usan Interconecta Trucking reportan estos beneficios
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map((result, index) => {
            const IconComponent = result.icon;
            return (
              <div
                key={index}
                className={`text-center text-pure-white ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                
                {/* Icon */}
                <div className="w-16 h-16 bg-pure-white/10 rounded-16 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <IconComponent className="h-8 w-8 text-pure-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-subtitle font-bold text-pure-white mb-4">
                  {result.title}
                </h3>
                
                {/* Description */}
                <p className="text-blue-light leading-relaxed">
                  {result.description}
                </p>
                
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};

export default ProvenResultsSection;
