
import React, { useState } from "react";
import { PricingCard } from "./PricingCard";
import { AddOnsSection } from "./AddOnsSection";
import { ContactSalesModal } from "./ContactSalesModal";

const PricingSection = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const plans = [
    {
      name: "Plan Esencial SAT",
      originalPrice: "$299 USD/mes",
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
      originalPrice: "$599 USD/mes",
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
      originalPrice: "$999 USD/mes",
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
      buttonLink: "#",
      onContactSales: () => setShowContactModal(true)
    }
  ];

  return (
    <section id="pricing" className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-4">
          Planes que Protegen tu Negocio
        </h3>
        <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
          Elige el plan perfecto para tu empresa y comienza a ahorrar desde el primer día
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {plans.map((plan, index) => (
          <PricingCard key={index} plan={plan} />
        ))}
      </div>

      <AddOnsSection />
      
      <ContactSalesModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </section>
  );
};

export default PricingSection;
