
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap, Building, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const plans = [
    {
      name: "Plan Esencial SAT",
      icon: Rocket,
      originalPrice: 149,
      price: 30,
      description: "Perfecto para: Transportistas 1-5 unidades",
      popular: false,
      features: [
        "100 cartas porte/mes",
        "3 usuarios incluidos",
        "Validación SAT automática",
        "Dashboard operativo",
        "Soporte profesional",
        "5 GB almacenamiento"
      ]
    },
    {
      name: "Plan Gestión IA",
      icon: Star,
      originalPrice: 299,
      price: 65,
      description: "Perfecto para: Flotas medianas 6-15 unidades",
      popular: true,
      features: [
        "300 cartas porte/mes",
        "8 usuarios incluidos",
        "IA completa con OCR",
        "Importación masiva Excel (300/mes)",
        "Analytics avanzados",
        "Soporte telefónico prioritario",
        "15 GB almacenamiento"
      ]
    },
    {
      name: "Plan Automatización Total",
      icon: Zap,
      originalPrice: 499,
      price: 125,
      description: "Perfecto para: Empresas grandes 16-30 unidades",
      popular: false,
      features: [
        "600 cartas porte/mes",
        "15 usuarios incluidos",
        "OCR ilimitado + IA avanzada",
        "Automatización completa",
        "Plantillas inteligentes",
        "API básica incluida",
        "Soporte 24/7",
        "50 GB almacenamiento"
      ]
    },
    {
      name: "Plan Enterprise Sin Límites",
      icon: Building,
      originalPrice: 999,
      price: 250,
      description: "Perfecto para: Corporativos 30+ unidades",
      popular: false,
      features: [
        "Cartas porte ILIMITADAS",
        "Usuarios ILIMITADOS",
        "IA sin restricciones",
        "Multi-tenant avanzado",
        "Integraciones personalizadas",
        "Manager dedicado",
        "SLA 99.9% garantizado",
        "Almacenamiento ilimitado"
      ]
    }
  ];

  const addOns = [
    { name: "IA Extra", description: "+200 consultas adicionales", price: 25 },
    { name: "OCR Extra", description: "+400 documentos adicionales", price: 35 },
    { name: "Almacenamiento", description: "+25 GB adicionales", price: 10 },
    { name: "Usuario Extra", description: "Por usuario adicional", price: 15 },
    { name: "Soporte VIP", description: "Soporte dedicado 24/7", price: 50 }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-interconecta-bg-alternate to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-4">
            Planes que Protegen tu Negocio
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
            Invierte en protección, no en multas. Planes diseñados para cada tamaño de empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular 
                ? 'border-interconecta-primary shadow-lg scale-105' 
                : 'border-interconecta-border-subtle hover:border-interconecta-primary'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold font-sora whitespace-nowrap">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-6">
                <div className={`p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                  plan.popular ? 'bg-gradient-to-r from-interconecta-primary to-interconecta-accent' : 'bg-interconecta-primary-light'
                }`}>
                  <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-interconecta-primary'}`} />
                </div>
                <CardTitle className="text-xl font-sora text-interconecta-text-primary">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg text-interconecta-text-secondary line-through">
                      ${plan.originalPrice} USD/mes
                    </span>
                  </div>
                  <div className="text-3xl font-bold font-sora text-interconecta-primary">
                    ${plan.price} USD/mes
                  </div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">
                    <small>+ IVA</small>
                  </div>
                  <div className="text-sm font-medium font-inter text-green-600">
                    Ahorro: ${(plan.originalPrice - plan.price)} USD/mes
                  </div>
                </div>
                <p className="text-sm font-inter text-interconecta-text-secondary mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-inter text-interconecta-text-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth/trial" className="block">
                  <Button 
                    className={`w-full font-sora font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white' 
                        : 'bg-interconecta-primary hover:bg-interconecta-accent text-white'
                    }`}
                  >
                    Empezar Prueba Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="bg-white rounded-lg border border-interconecta-border-subtle p-8">
          <h4 className="text-2xl font-bold font-sora text-interconecta-text-primary mb-6 text-center">
            ADD-ONS PREMIUM
          </h4>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {addOns.map((addon, index) => (
              <div key={index} className="text-center p-4 border border-interconecta-border-subtle rounded-lg hover:border-interconecta-primary transition-colors">
                <div className="text-lg font-bold font-sora text-interconecta-primary">
                  ${addon.price} USD/mes
                </div>
                <div className="text-xs font-inter text-interconecta-text-secondary mb-1">
                  <small>+ IVA</small>
                </div>
                <div className="text-sm font-semibold font-inter text-interconecta-text-primary">
                  {addon.name}
                </div>
                <div className="text-xs font-inter text-interconecta-text-secondary">
                  {addon.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
