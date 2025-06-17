
import React from "react";
import { PricingCard } from "./PricingCard";
import { AddOnsSection } from "./AddOnsSection";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const PricingSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const plans = [
    {
      name: "Plan Esencial SAT",
      price: "$149 USD/mes + IVA",
      description: "Ideal para empresas pequeñas que inician con cumplimiento SAT",
      features: [
        "Hasta 50 cartas porte mensuales",
        "Generación automática de XML",
        "Validación SAT en tiempo real",
        "Timbrado automático",
        "Soporte por email"
      ],
      buttonText: "Comenzar Prueba",
      buttonLink: "/auth/trial"
    },
    {
      name: "Plan Gestión IA",
      price: "$299 USD/mes + IVA",
      description: "Para empresas en crecimiento que buscan automatización",
      features: [
        "Hasta 200 cartas porte mensuales",
        "Asistente IA para descripciones",
        "Gestión de ubicaciones inteligente",
        "Plantillas automatizadas",
        "Analytics básicos",
        "Soporte prioritario"
      ],
      isPopular: true,
      buttonText: "Comenzar Prueba",
      buttonLink: "/auth/trial"
    },
    {
      name: "Plan Automatización Total",
      price: "$499 USD/mes + IVA",
      description: "Solución completa para empresas establecidas",
      features: [
        "Cartas porte ilimitadas",
        "IA avanzada para procesamiento",
        "Integración con sistemas ERP",
        "API completa disponible",
        "Analytics avanzados",
        "Soporte telefónico"
      ],
      buttonText: "Comenzar Prueba",
      buttonLink: "/auth/trial"
    },
    {
      name: "Plan Enterprise Sin Límites",
      price: "Contactar con ventas",
      description: "Solución personalizada para grandes empresas",
      features: [
        "Todo incluido de planes anteriores",
        "Implementación personalizada",
        "Desarrollo de funciones específicas",
        "SLA garantizado",
        "Gerente de cuenta dedicado",
        "Capacitación en sitio"
      ],
      isEnterprise: true,
      buttonText: "Contactar Ventas",
      buttonLink: "#contacto"
    }
  ];

  return (
    <section id="precios" className="py-32 gradient-subtle">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div ref={ref} className={`text-center mb-20 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="stagger-item">
            <div className="inline-flex items-center bg-blue-interconecta/10 border border-blue-interconecta/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-blue-interconecta uppercase tracking-wide">
                Planes Premium
              </span>
            </div>
          </div>
          
          <div className="stagger-item">
            <h3 className="text-responsive-display font-bold text-gray-90 mb-6">
              Planes que Protegen tu Negocio
            </h3>
          </div>
          
          <div className="stagger-item">
            <p className="text-responsive-subtitle text-gray-70 max-w-2xl mx-auto">
              Elige el plan perfecto para tu empresa y comienza a ahorrar desde el primer día
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`stagger-item ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className={`${isVisible ? 'animate-fade-in' : 'opacity-0'} stagger-item`} style={{ animationDelay: '0.4s' }}>
          <AddOnsSection />
        </div>
        
      </div>
    </section>
  );
};

export default PricingSection;
