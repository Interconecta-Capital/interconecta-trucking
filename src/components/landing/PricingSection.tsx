import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star, Ticket } from "lucide-react";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  // Precios base actualizados (mensuales) - Modelo Híbrido
  const basePrices = {
    gratuito: 0,
    operador: 249,
    flota: 599,
  };

  const plans = [
    {
      name: "Plan Gratuito",
      monthlyPrice: basePrices.gratuito,
      annualPrice: basePrices.gratuito,
      description: "Para probar la plataforma",
      features: [
        "5 timbres gratis al mes",
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
      features: [
        "Timbres: Se compran por separado",
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
      features: [
        "Timbres: Se compran por separado",
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
            Paga solo por el software. Los timbres se compran por separado según tu uso.
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
                    {plan.isFree && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Incluye 5 timbres de cortesía mensuales
                      </p>
                    )}
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

        {/* Sección de Paquetes de Créditos */}
        <div className="text-center space-y-6 mt-16 scroll-animation">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Ticket className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">¿Cómo funcionan los Timbres?</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los timbres (créditos) se compran por separado del plan de software. Esto te da mayor control y flexibilidad.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Paquete Básico</h4>
              <p className="text-2xl font-bold text-primary">$50</p>
              <p className="text-sm text-muted-foreground">50 timbres</p>
              <p className="text-xs text-muted-foreground mt-1">$1.00/timbre</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Paquete Profesional</h4>
              <p className="text-2xl font-bold text-primary">$135</p>
              <p className="text-sm text-muted-foreground">150 timbres</p>
              <p className="text-xs text-green-400 mt-1">$0.90/timbre • Ahorra 10%</p>
            </div>
            <div className="bg-card border border-primary rounded-lg p-4 border-2">
              <h4 className="font-semibold mb-2">Paquete Flota</h4>
              <p className="text-2xl font-bold text-primary">$425</p>
              <p className="text-sm text-muted-foreground">500 timbres</p>
              <p className="text-xs text-green-400 mt-1">$0.85/timbre • Ahorra 15%</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Paquete Corporativo</h4>
              <p className="text-2xl font-bold text-primary">$750</p>
              <p className="text-sm text-muted-foreground">1000 timbres</p>
              <p className="text-xs text-green-400 mt-1">$0.75/timbre • Ahorra 25%</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            ✨ Los créditos nunca expiran • Paga solo por lo que uses • Sin compromisos
          </p>
        </div>

        <div className="text-center space-y-4 mt-12 scroll-animation">
          <h3 className="text-2xl font-bold">¿Necesitas más información?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todos nuestros planes incluyen:
          </p>
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
