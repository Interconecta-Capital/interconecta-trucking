
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  // Precios base (mensuales)
  const basePrices = {
    operador: 149,
    flota: 299,
    enterprise: null // Personalizado
  };

  // Calcular precios según el toggle
  const getPrice = (basePrice: number | null) => {
    if (basePrice === null) return "Personalizado";
    if (isAnnual) {
      const annualPrice = Math.round(basePrice * 0.8); // 20% descuento
      return annualPrice;
    }
    return basePrice;
  };

  const plans = [
    {
      name: "Operador",
      price: getPrice(basePrices.operador),
      originalPrice: isAnnual ? basePrices.operador : null,
      description: "Para transportistas independientes",
      features: [
        "Hasta 50 viajes al mes",
        "Validaciones SAT automáticas",
        "Generación de Carta Porte 3.1",
        "Soporte por correo electrónico",
        "Dashboard básico",
        "Almacenamiento de 1GB"
      ],
      buttonText: "Empezar",
      buttonVariant: "secondary" as const,
      popular: false
    },
    {
      name: "Flota",
      price: getPrice(basePrices.flota),
      originalPrice: isAnnual ? basePrices.flota : null,
      description: "Para empresas medianas",
      features: [
        "Hasta 200 viajes al mes",
        "Todas las funciones de IA",
        "ViajeWizard completo",
        "Alertas y validaciones avanzadas",
        "Soporte prioritario",
        "Reportes y analítica",
        "Integración básica API",
        "Almacenamiento de 10GB"
      ],
      buttonText: "Prueba Gratis 14 días",
      buttonVariant: "primary" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      originalPrice: null,
      description: "Para flotas grandes",
      features: [
        "Viajes ilimitados",
        "Integración completa ERP/WMS",
        "Manager de cuenta dedicado",
        "Analítica avanzada e informes",
        "SLA garantizado 99.9%",
        "Soporte 24/7",
        "Entrenamientos personalizados",
        "Almacenamiento ilimitado"
      ],
      buttonText: "Contactar Ventas",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-20 lg:py-32 text-center bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-12 md:mb-16 scroll-animation">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
            Planes para cada flota.
          </h2>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-400">
            Empieza con lo que necesitas y escala a medida que tu operación crece. Simple y transparente.
          </p>
        </div>
        
        {/* Pricing Toggle */}
        <div className="flex justify-center items-center space-x-4 mb-8 md:mb-10 scroll-animation">
          <span className={`font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
            Mensual
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isAnnual}
              onChange={(e) => setIsAnnual(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className={`font-medium transition-colors ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
            Anual
            {isAnnual && (
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                Ahorra 20%
              </span>
            )}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto scroll-animation">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`feature-card p-6 md:p-8 flex flex-col relative transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-2 border-blue-500 lg:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Más Popular
                </span>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  {plan.price === "Personalizado" ? (
                    <p className="text-3xl md:text-4xl font-bold">Personalizado</p>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold">
                        ${plan.price}
                      </span>
                      <span className="text-base md:text-lg font-normal text-gray-400 ml-1">
                        /{isAnnual ? 'año' : 'mes'}
                      </span>
                    </div>
                  )}
                  
                  {plan.originalPrice && isAnnual && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 line-through">
                        ${plan.originalPrice}/{isAnnual ? 'año' : 'mes'}
                      </span>
                      <span className="ml-2 text-sm text-green-400 font-semibold">
                        Ahorrás ${plan.originalPrice - (plan.price as number)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ul className="text-left space-y-3 mb-8 text-gray-300 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth" className="block">
                <Button 
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.buttonVariant === 'primary' 
                      ? 'btn-primary hover:scale-105' 
                      : 'btn-secondary hover:bg-white hover:text-black'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center scroll-animation">
          <p className="text-sm text-gray-400 mb-4">
            Todos los planes incluyen acceso completo durante el período de prueba
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-6 text-xs text-gray-500">
            <span>✓ Sin compromisos</span>
            <span>✓ Cancela cuando quieras</span>
            <span>✓ Soporte incluido</span>
            <span>✓ Actualizaciones automáticas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
