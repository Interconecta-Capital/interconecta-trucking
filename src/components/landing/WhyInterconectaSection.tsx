
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const WhyInterconectaSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const whyFeatures = [
    {
      icon: "👑",
      title: "Producto Único en México",
      features: [
        "Primera y única plataforma IA especializada en transporte",
        "Desarrollada específicamente para regulaciones mexicanas SAT",
        "Sin competencia directa en automatización total"
      ]
    },
    {
      icon: "🤖",
      title: "Inteligencia Artificial Avanzada",
      features: [
        "OCR que lee cualquier documento en segundos",
        "IA que genera descripciones SAT automáticamente",
        "Validación en tiempo real con catálogos oficiales"
      ]
    },
    {
      icon: "🛡️",
      title: "Cumplimiento Garantizado",
      features: [
        "100% compatible con regulaciones SAT actuales",
        "Actualizaciones automáticas de normativas",
        "SLA 99.9% de disponibilidad"
      ]
    },
    {
      icon: "📈",
      title: "Escalabilidad Sin Límites",
      features: [
        "Desde 1 hasta 1,000+ vehículos",
        "Multi-tenant para empresas grandes",
        "API completa para integraciones"
      ]
    }
  ];

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
        <div ref={ref} className={`text-center mb-20 max-w-3xl mx-auto ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="inline-flex items-center gap-2 bg-blue-light border border-blue-interconecta/20 px-4 py-2 rounded-full text-xs font-bold text-blue-interconecta uppercase tracking-wide mb-8">
            <span>👑</span>
            <span>Fortalezas Únicas</span>
          </div>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            ¿Por qué Interconecta Trucking?
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Somos la única plataforma con IA especializada en el mercado mexicano de transporte
          </p>
        </div>

        {/* Why Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {whyFeatures.map((feature, index) => (
            <div
              key={index}
              className={`card-premium p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-light rounded-16 flex items-center justify-center mb-6 text-3xl">
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-subtitle font-medium text-pure-black mb-6">
                {feature.title}
              </h3>
              
              {/* Features List */}
              <ul className="space-y-3">
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-gray-70">
                    <span className="text-blue-interconecta font-bold text-base mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
            </div>
          ))}
        </div>

        {/* Market Leadership Stats */}
        <div className={`card-premium p-10 bg-blue-interconecta text-center ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <h3 className="text-subtitle font-bold text-pure-white mb-8">
            Líderes Indiscutibles en el Mercado
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {marketStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-[48px] font-extrabold text-pure-white mb-2 text-mono">
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
