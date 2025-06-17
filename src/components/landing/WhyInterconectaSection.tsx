
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Crown } from "lucide-react";
import TruckAnimation from "./TruckAnimation";

const WhyInterconectaSection = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });

  const marketStats = [
    { number: "100%", label: "Automatización IA" },
    { number: "0", label: "Competidores directos" },
    { number: "5 años", label: "Experiencia SAT" },
    { number: "24/7", label: "Soporte especializado" }
  ];

  return (
    <section className="py-32 bg-gray-05">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-20 max-w-3xl mx-auto ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="inline-flex items-center gap-2 bg-blue-light border border-blue-interconecta/20 px-4 py-2 rounded-full text-xs font-bold text-blue-interconecta uppercase tracking-wide mb-8">
            <Crown className="h-4 w-4" />
            <span>Fortalezas Únicas</span>
          </div>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            ¿Por qué Interconecta Trucking?
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Somos la única plataforma con IA especializada en el mercado mexicano de transporte
          </p>
        </div>

        {/* Truck Animation */}
        <div className={`mb-20 ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <TruckAnimation />
        </div>

        {/* Market Leadership Stats */}
        <div className={`card-premium p-10 bg-blue-interconecta text-center ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <h3 className="text-subtitle font-bold text-pure-white mb-8">
            Líderes Indiscutibles en el Mercado
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {marketStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-[32px] font-extrabold text-pure-white mb-2 text-mono">
                  {stat.number}
                </div>
                <div className="text-caption text-blue-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default WhyInterconectaSection;
