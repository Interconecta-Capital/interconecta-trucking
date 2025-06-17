
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileSpreadsheet, Zap, FileText, Bot, Users, BarChart3, Shield, Sparkles } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const FeaturesSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const features = [
    {
      icon: Brain,
      title: "Asistente IA Avanzado",
      description: "Inteligencia artificial que genera descripciones automáticamente y valida mercancías según catálogos SAT"
    },
    {
      icon: FileSpreadsheet,
      title: "Importación Masiva",
      description: "Importa mercancías desde Excel, PDF o XML con OCR y procesamiento automático de documentos"
    },
    {
      icon: Zap,
      title: "Automatización Total",
      description: "Automatiza timbrado, generación de XML y validaciones con inteligencia artificial integrada"
    },
    {
      icon: FileText,
      title: "Cartas Porte Inteligentes",
      description: "Genera cartas porte con sugerencias de IA y cumplimiento automático de regulaciones mexicanas"
    },
    {
      icon: Bot,
      title: "Procesamiento Documental",
      description: "Extrae datos automáticamente de facturas, remisiones y documentos con tecnología OCR avanzada"
    },
    {
      icon: Users,
      title: "Multi-Tenant Avanzado",
      description: "Cada empresa tiene su entorno aislado con datos completamente separados y configuraciones personalizadas"
    },
    {
      icon: BarChart3,
      title: "Analytics Inteligentes",
      description: "Dashboards con IA que analizan patrones y generan insights automáticos para tu negocio"
    },
    {
      icon: Shield,
      title: "Seguridad Enterprise",
      description: "Cifrado avanzado, backups automáticos y cumplimiento total con normativas de privacidad mexicanas"
    },
    {
      icon: Sparkles,
      title: "Plantillas Inteligentes",
      description: "Plantillas que se adaptan automáticamente y aprenden de tus patrones para acelerar la creación"
    }
  ];

  return (
    <section id="características" className="py-32 bg-gray-05">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div ref={ref} className={`text-center mb-20 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="stagger-item">
            <div className="inline-flex items-center bg-blue-interconecta/10 border border-blue-interconecta/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-blue-interconecta uppercase tracking-wide">
                Características Premium
              </span>
            </div>
          </div>
          
          <div className="stagger-item">
            <h3 className="text-responsive-display font-bold text-gray-90 mb-6">
              Todo lo que necesitas para optimizar tu transporte
            </h3>
          </div>
          
          <div className="stagger-item">
            <p className="text-responsive-subtitle text-gray-70 max-w-3xl mx-auto">
              Tecnología avanzada con IA para revolucionar tu empresa de transporte
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`stagger-item card-premium h-96 p-10 group ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              
              {/* Icon */}
              <div className="mb-8">
                <div className="w-12 h-12 gradient-premium rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-pure-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-gray-90 group-hover:text-blue-interconecta transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Bottom Link */}
              <div className="mt-auto pt-6">
                <span className="text-blue-interconecta font-medium link-premium cursor-pointer">
                  Saber más →
                </span>
              </div>
              
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;
