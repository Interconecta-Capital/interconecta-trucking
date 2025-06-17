import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { DollarSign, Check, Mail } from "lucide-react";

const NewPricingSection = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });

  const plans = [
    {
      name: "Plan Esencial SAT",
      price: "$149",
      period: "USD/mes",
      addon: "+ IVA",
      description: "Ideal para empresas pequeñas que inician con cumplimiento SAT",
      features: [
        "Hasta 50 cartas porte mensuales",
        "Generación automática de XML",
        "Validación SAT en tiempo real",
        "Timbrado automático",
        "Soporte por email"
      ],
      buttonText: "Comenzar Prueba",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Plan Gestión IA",
      price: "$299",
      period: "USD/mes",
      addon: "+ IVA",
      description: "Para empresas en crecimiento que buscan automatización",
      features: [
        "Hasta 200 cartas porte mensuales",
        "Asistente IA para descripciones",
        "Gestión de ubicaciones inteligente",
        "Plantillas automatizadas",
        "Analytics básicos",
        "Soporte prioritario"
      ],
      buttonText: "Comenzar Prueba",
      buttonVariant: "primary" as const,
      popular: true
    },
    {
      name: "Plan Automatización Total",
      price: "$499",
      period: "USD/mes",
      addon: "+ IVA",
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
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Plan Enterprise Sin Límites",
      price: "Contactar con",
      period: "ventas",
      addon: "",
      description: "Solución personalizada para grandes empresas",
      features: [
        "Todo incluido de planes anteriores",
        "Implementación personalizada",
        "Desarrollo de funciones específicas",
        "SLA garantizado",
        "Gerente de cuenta dedicado",
        "Capacitación en sitio"
      ],
      buttonText: "Contactar Ventas",
      buttonVariant: "primary" as const,
      popular: false
    }
  ];

  return (
    <section id="precios" className="py-32 bg-pure-white">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-20 max-w-3xl mx-auto ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="inline-flex items-center gap-2 bg-gray-10 border border-gray-20 px-4 py-2 rounded-full text-xs font-bold text-gray-70 uppercase tracking-wide mb-8">
            <DollarSign className="h-4 w-4" />
            <span>Precios transparentes</span>
          </div>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            Planes que Protegen tu Negocio
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Elige el plan perfecto para tu empresa y comienza a ahorrar desde el primer día
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card-premium p-8 text-center relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular ? 'border-2 border-blue-interconecta' : ''
              } ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-interconecta text-pure-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
                  Más popular
                </div>
              )}
              
              {/* Plan Name */}
              <h3 className="text-subtitle font-bold text-pure-black mb-4">
                {plan.name}
              </h3>
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-[32px] font-extrabold text-blue-interconecta text-mono">
                    {plan.price}
                  </span>
                  <span className="text-body text-gray-60">{plan.period}</span>
                </div>
                {plan.addon && (
                  <div className="text-body-sm text-gray-50">{plan.addon}</div>
                )}
              </div>
              
              {/* Description */}
              <p className="text-gray-60 mb-8 text-body-sm leading-relaxed">
                {plan.description}
              </p>
              
              {/* Features List */}
              <ul className="text-left mb-10 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-[14px] text-gray-70">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <Link to="/auth/trial" className="block">
                <Button 
                  className={`w-full py-3 text-base font-semibold rounded-12 interactive ${
                    plan.buttonVariant === 'primary' 
                      ? 'btn-premium bg-blue-interconecta hover:bg-blue-hover text-pure-white' 
                      : 'btn-premium border border-blue-interconecta text-blue-interconecta hover:bg-blue-light hover:text-blue-interconecta'
                  }`}
                >
                  {plan.name === "Plan Enterprise Sin Límites" ? (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {plan.buttonText}
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </Link>
              
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default NewPricingSection;
