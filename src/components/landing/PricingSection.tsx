
import React, { useState, useEffect, useRef } from "react";
import { PricingCard } from "./PricingCard";
import { AddOnsSection } from "./AddOnsSection";

const PricingSection = () => {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      buttonLink: "#"
    }
  ];

  return (
    <section id="pricing" ref={sectionRef} className="py-32 px-6 bg-gray-05">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-20 max-w-3xl mx-auto ${revealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="hero-badge-premium mb-8">
            <span>💰</span>
            <span>Precios transparentes</span>
          </div>
          <h3 className="text-display text-interconecta-text-primary mb-6">
            Planes que Protegen tu Negocio
          </h3>
          <p className="text-body-lg text-interconecta-text-secondary leading-relaxed">
            Elige el plan perfecto para tu empresa y comienza a ahorrar desde el primer día. 
            Sin sorpresas, sin costos ocultos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${revealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>

        <div className={`${revealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`} style={{ animationDelay: '0.4s' }}>
          <AddOnsSection />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
