
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Bot, Upload, Zap, FileText, Building, Users, TrendingUp, Shield, Sparkles } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const FeaturesSection = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });

  const mainFeatures = [
    {
      icon: Bot,
      title: "Asistente IA Avanzado",
      description: "Inteligencia artificial que genera descripciones automáticamente y valida mercancías según catálogos SAT",
      highlighted: false
    },
    {
      icon: Upload,
      title: "Importación Masiva",
      description: "Importa mercancías desde Excel, PDF o XML con OCR y procesamiento automático de documentos",
      highlighted: true
    },
    {
      icon: Zap,
      title: "Automatización Total",
      description: "Automatiza timbrado, generación de XML y validaciones con inteligencia artificial integrada",
      highlighted: false
    },
    {
      icon: FileText,
      title: "Cartas Porte Inteligentes",
      description: "Genera cartas porte con sugerencias de IA y cumplimiento automático de regulaciones mexicanas",
      highlighted: false
    },
    {
      icon: Building,
      title: "Procesamiento Documental",
      description: "Extrae datos automáticamente de facturas, remisiones y documentos con tecnología OCR avanzada",
      highlighted: false
    },
    {
      icon: Users,
      title: "Multi-Tenant Avanzado",
      description: "Cada empresa tiene su entorno aislado con datos completamente separados y configuraciones personalizadas",
      highlighted: false
    },
    {
      icon: TrendingUp,
      title: "Analytics Inteligentes",
      description: "Dashboards con IA que analizan patrones y generan insights automáticos para tu negocio",
      highlighted: false
    },
    {
      icon: Shield,
      title: "Seguridad Enterprise",
      description: "Cifrado avanzado, backups automáticos y cumplimiento total con normativas de privacidad mexicanas",
      highlighted: false
    },
    {
      icon: Sparkles,
      title: "Plantillas Inteligentes",
      description: "Plantillas que se adaptan automáticamente y aprenden de tus patrones para acelerar la creación",
      highlighted: false
    }
  ];

  return (
    <section id="características" className="py-32 bg-pure-white">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-20 max-w-3xl mx-auto ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            Características Principales
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Tecnología avanzada con IA para revolucionar tu empresa de transporte
          </p>
        </div>

        {/* Mac-style Window with Carousel */}
        <div className={`relative card-premium p-6 shadow-xl overflow-hidden max-w-6xl mx-auto ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          
          {/* Mac Window Header */}
          <div className="flex items-center gap-2 pb-4 border-b border-gray-20 mb-8">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-auto text-sm font-semibold text-gray-70">Características — Interconecta Trucking</div>
          </div>

          {/* Carousel */}
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {mainFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className={`card-premium p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full ${
                      feature.highlighted ? 'border-2 border-blue-interconecta' : ''
                    }`}>
                      
                      {/* Icon */}
                      <div className="w-16 h-16 bg-blue-light rounded-16 flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:bg-blue-interconecta hover:scale-110 group">
                        <IconComponent className="h-8 w-8 text-blue-interconecta group-hover:text-pure-white transition-colors duration-300" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-lg font-semibold text-pure-black mb-4 hover:text-blue-interconecta transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-60 leading-relaxed text-sm">
                        {feature.description}
                      </p>
                      
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;
