import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star, Ticket } from "lucide-react";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const basePrices = {
    gratuito: 0,
    operador: 349,
    flota: 799,
    business: 1499,
  };

  const plans = [
    {
      name: "Plan Gratuito",
      monthlyPrice: basePrices.gratuito,
      annualPrice: basePrices.gratuito,
      description: "Para probar la plataforma",
      timbres: 5,
      features: [
        "5 timbres mensuales renovables",
        "Los timbres se renuevan cada mes",
        "1 usuario",
        "2 vehículos",
        "Gestión básica de catálogos",
        "Timbrado manual (sin IA)",
        "Sin Dashboard de Rentabilidad"
      ],
      popular: false,
      isFree: true
    },
    {
      name: "Plan Operador",
      monthlyPrice: basePrices.operador,
      annualPrice: basePrices.operador * 12 * 0.8,
      description: "Acceso al Software completo",
      timbres: 50,
      features: [
        "50 timbres mensuales renovables",
        "Los timbres se renuevan cada mes",
        "IA Anti-Errores (Claves SAT)",
        "Dashboard Básico",
        "3 Usuarios",
        "10 Vehículos y Conductores",
        "Gestión avanzada de viajes",
        "Timbrado digital CFDI 4.0",
        "Cumplimiento Carta Porte 3.1",
        "Soporte por email"
      ],
      popular: false
    },
    {
      name: "Plan Flota",
      monthlyPrice: basePrices.flota,
      annualPrice: basePrices.flota * 12 * 0.8,
      description: "Inteligencia de Negocios",
      timbres: 200,
      features: [
        "200 timbres mensuales renovables",
        "Los timbres se renuevan cada mes",
        "Todo lo del Plan Operador",
        "Dashboard de Rentabilidad",
        "Análisis de costos por ruta",
        "Conexión GPS/API",
        "Usuarios Ilimitados",
        "Vehículos y Conductores Ilimitados",
        "Generación de reportes avanzados",
        "Soporte prioritario"
      ],
      popular: true
    },
    {
      name: "Plan Business",
      monthlyPrice: basePrices.business,
      annualPrice: basePrices.business * 12 * 0.8,
      description: "Para grandes operaciones",
      timbres: 500,
      features: [
        "500 timbres mensuales renovables",
        "Los timbres se renuevan cada mes",
        "Todo lo del Plan Flota",
        "Soporte prioritario 24/7",
        "Gerente de cuenta dedicado",
        "Integraciones personalizadas",
        "Reportes personalizados",
        "Capacitación especializada",
        "SLA garantizado"
      ],
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
            Timbres renovables incluidos cada mes. Sin cargos adicionales sorpresa.
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

        <div className="grid lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto scroll-animation">
          {plans.map((plan) => (
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
                
                {plan.monthlyPrice !== null ? (
                  <>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      ${isAnnual 
                        ? Math.round(plan.annualPrice! / 12) 
                        : plan.monthlyPrice}
                      <span className="text-lg font-normal text-muted-foreground"> MXN/mes</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-primary">
                      <Ticket className="w-4 h-4" />
                      <p className="text-sm font-medium">
                        {plan.timbres} timbres/mes renovables
                      </p>
                    </div>
                    {isAnnual && !plan.isFree && (
                      <p className="text-sm text-green-400 mt-2">
                        Ahorra ${Math.round((plan.monthlyPrice * 12) - plan.annualPrice!)} MXN al año
                      </p>
                    )}
                  </>
                ) : null}
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
                    plan.popular 
                      ? 'btn-primary hover:scale-105' 
                      : 'btn-secondary hover:bg-white hover:text-black'
                  }`}
                >
                  {plan.isFree ? 'Empezar Gratis' : 'Prueba 14 días gratis'}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4 mt-16 scroll-animation">
          <h3 className="text-2xl font-bold">Todos los planes incluyen:</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>✓ 14 días de prueba gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>✓ Sin compromiso de permanencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>✓ Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>✓ Soporte incluido</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>✓ Actualizaciones automáticas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
