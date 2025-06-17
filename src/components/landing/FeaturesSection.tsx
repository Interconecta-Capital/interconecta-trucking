
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const FeaturesSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const mainFeatures = [
    {
      icon: "🤖",
      title: "Asistente IA Avanzado",
      description: "Inteligencia artificial que genera descripciones automáticamente y valida mercancías según catálogos SAT",
      highlighted: false
    },
    {
      icon: "📊",
      title: "Importación Masiva",
      description: "Importa mercancías desde Excel, PDF o XML con OCR y procesamiento automático de documentos",
      highlighted: true
    },
    {
      icon: "⚡",
      title: "Automatización Total",
      description: "Automatiza timbrado, generación de XML y validaciones con inteligencia artificial integrada",
      highlighted: false
    },
    {
      icon: "📋",
      title: "Cartas Porte Inteligentes",
      description: "Genera cartas porte con sugerencias de IA y cumplimiento automático de regulaciones mexicanas",
      highlighted: false
    },
    {
      icon: "🏢",
      title: "Procesamiento Documental",
      description: "Extrae datos automáticamente de facturas, remisiones y documentos con tecnología OCR avanzada",
      highlighted: false
    },
    {
      icon: "👥",
      title: "Multi-Tenant Avanzado",
      description: "Cada empresa tiene su entorno aislado con datos completamente separados y configuraciones personalizadas",
      highlighted: false
    },
    {
      icon: "📈",
      title: "Analytics Inteligentes",
      description: "Dashboards con IA que analizan patrones y generan insights automáticos para tu negocio",
      highlighted: false
    },
    {
      icon: "🔒",
      title: "Seguridad Enterprise",
      description: "Cifrado avanzado, backups automáticos y cumplimiento total con normativas de privacidad mexicanas",
      highlighted: false
    },
    {
      icon: "✨",
      title: "Plantillas Inteligentes",
      description: "Plantillas que se adaptan automáticamente y aprenden de tus patrones para acelerar la creación",
      highlighted: false
    }
  ];

  return (
    <section id="características" className="py-32 bg-pure-white">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-20 max-w-3xl mx-auto ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            Características Principales
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Tecnología avanzada con IA para revolucionar tu empresa de transporte
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`card-premium p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                feature.highlighted ? 'border-2 border-blue-interconecta' : ''
              } ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-light rounded-16 flex items-center justify-center mx-auto mb-6 text-4xl transition-all duration-300 hover:bg-blue-interconecta hover:scale-110">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-subtitle font-medium text-pure-black mb-4 hover:text-blue-interconecta transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-60 leading-relaxed">
                {feature.description}
              </p>
              
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;
