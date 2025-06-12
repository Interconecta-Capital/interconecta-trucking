
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Brain, Shield, TrendingUp } from "lucide-react";

const USPSection = () => {
  const strengths = [
    {
      icon: Crown,
      title: "💎 Producto Único en México",
      features: [
        "Primera y única plataforma IA especializada en transporte",
        "Desarrollada específicamente para regulaciones mexicanas SAT",
        "Sin competencia directa en automatización total"
      ],
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Brain,
      title: "🧠 Inteligencia Artificial Avanzada",
      features: [
        "OCR que lee cualquier documento en segundos",
        "IA que genera descripciones SAT automáticamente",
        "Validación en tiempo real con catálogos oficiales"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "🔒 Cumplimiento Garantizado",
      features: [
        "100% compatible con regulaciones SAT actuales",
        "Actualizaciones automáticas de normativas",
        "SLA 99.9% de disponibilidad"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "📈 Escalabilidad Sin Límites",
      features: [
        "Desde 1 hasta 1,000+ vehículos",
        "Multi-tenant para empresas grandes",
        "API completa para integraciones"
      ],
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-interconecta-primary-light border border-interconecta-border-subtle rounded-full px-4 py-2 mb-6">
            <Crown className="h-4 w-4 text-interconecta-primary mr-2" />
            <span className="text-sm font-inter font-medium text-interconecta-text-body">
              Fortalezas Únicas
            </span>
          </div>
          <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-4">
            ¿Por qué Interconecta Trucking?
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
            Somos la única plataforma con IA especializada en el mercado mexicano de transporte
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {strengths.map((strength, index) => (
            <Card key={index} className="border-interconecta-border-subtle hover:shadow-xl transition-all duration-300 hover:border-interconecta-primary group">
              <CardHeader className="text-center pb-4">
                <div className={`p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-r ${strength.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <strength.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl font-sora text-interconecta-text-primary">
                  {strength.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {strength.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 bg-gradient-to-r ${strength.gradient}`}></div>
                      <span className="font-inter text-interconecta-text-body">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats de Diferenciación */}
        <div className="mt-16 bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-lg p-8 text-white text-center">
          <h4 className="text-2xl font-bold font-sora mb-6">
            Líderes Indiscutibles en el Mercado
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold font-sora">100%</div>
              <div className="text-sm font-inter opacity-90">Automatización IA</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-sora">0</div>
              <div className="text-sm font-inter opacity-90">Competidores directos</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-sora">5 años</div>
              <div className="text-sm font-inter opacity-90">Experiencia SAT</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-sora">24/7</div>
              <div className="text-sm font-inter opacity-90">Soporte especializado</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default USPSection;
