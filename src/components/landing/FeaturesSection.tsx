
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileSpreadsheet, Zap, FileText, Bot, Users, BarChart3, Shield, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FeaturesSection = () => {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-index');
            if (index) {
              setVisibleCards(prev => new Set([...prev, parseInt(index)]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card-observe');
    cards.forEach(card => {
      if (observerRef.current) {
        observerRef.current.observe(card);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
    <section id="features" className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-3xl mx-auto scroll-reveal">
          <div className="hero-badge-premium mb-8">
            <span>🧠</span>
            <span>Inteligencia artificial</span>
          </div>
          <h3 className="text-display text-interconecta-text-primary mb-6">
            Tecnología avanzada con IA para revolucionar tu empresa de transporte
          </h3>
          <p className="text-body-lg text-interconecta-text-secondary leading-relaxed">
            No es solo software. Es tu compañero inteligente que entiende el transporte mexicano 
            y automatiza todo lo que necesitas para cumplir perfectamente con el SAT.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`feature-card-observe premium-card text-center interactive transition-all duration-500 ${
                visibleCards.has(index) ? 'scroll-reveal revealed' : 'scroll-reveal'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <feature.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-subtitle text-interconecta-text-primary mb-4 font-sora">
                {feature.title}
              </h3>
              <p className="text-interconecta-text-secondary font-inter leading-relaxed">
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
