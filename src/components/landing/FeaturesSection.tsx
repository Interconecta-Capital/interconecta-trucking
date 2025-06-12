
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileSpreadsheet, Zap, FileText, Bot, Users, BarChart3, Shield, Sparkles } from "lucide-react";

const FeaturesSection = () => {
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
    <section id="features" className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-4">
          Características Principales
        </h3>
        <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
          Tecnología avanzada con IA para revolucionar tu empresa de transporte
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
