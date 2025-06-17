
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const FeaturesSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const features = [
    {
      icon: "🤖",
      title: "IA 100% mexicana",
      description: "Primera inteligencia artificial entrenada exclusivamente en regulaciones SAT mexicanas. Entiende tu negocio y automatiza sin errores.",
      badge: "SAT Compliant"
    },
    {
      icon: "⚡",
      title: "Automatización total",
      description: "Desde la generación hasta el timbrado automático. Tu única responsabilidad es confirmar. Todo lo demás es instantáneo y perfecto.",
      badge: "3.2 min promedio"
    },
    {
      icon: "📱",
      title: "Diseño humano",
      description: "Interfaz pensada para transportistas reales. Funciona en carretera, sincroniza automáticamente y respeta tu forma de trabajar.",
      badge: "Mobile-first"
    }
  ];

  return (
    <section id="características" className="py-32 bg-pure-white">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-20 max-w-3xl mx-auto ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="inline-flex items-center gap-2 bg-gray-10 border border-gray-20 px-4 py-2 rounded-full text-xs font-bold text-gray-70 uppercase tracking-wide mb-8">
            <span>🧠</span>
            <span>Inteligencia artificial</span>
          </div>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            Pensado para transportistas.<br />
            Potenciado por IA mexicana.
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            No es solo software. Es tu compañero inteligente que entiende el transporte mexicano 
            y automatiza todo lo que necesitas para cumplir perfectamente con el SAT.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card-premium p-8 text-center relative overflow-hidden ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              
              {/* Top Border Animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-interconecta to-blue-hover transform scale-x-0 origin-left transition-transform duration-700 ease-expo group-hover:scale-x-100"></div>
              
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-light rounded-16 flex items-center justify-center mx-auto mb-6 text-4xl transition-all duration-300 group-hover:bg-blue-interconecta group-hover:scale-110">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-subtitle font-medium text-pure-black mb-4 group-hover:text-blue-interconecta transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-60 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              {/* Badge */}
              <span className="inline-block bg-blue-light text-blue-hover px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide">
                {feature.badge}
              </span>
              
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;
