
import { CheckCircle } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      title: "80% Menos Tiempo",
      description: "De 2 horas a 15 minutos por carta porte con automatización IA"
    },
    {
      title: "Cero Multas SAT",
      description: "Validación automática y cumplimiento garantizado al 99.9%"
    },
    {
      title: "ROI en 30 días",
      description: "Retorno de inversión positivo desde el primer mes de uso"
    },
    {
      title: "Escalabilidad Total",
      description: "Desde 1 hasta 1,000+ vehículos sin cambiar de plataforma"
    }
  ];

  return (
    <section id="benefits" className="bg-gradient-interconecta py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold font-sora text-white mb-4">
            Resultados Comprobados
          </h3>
          <p className="text-xl font-inter text-interconecta-primary-light max-w-2xl mx-auto">
            Empresas que ya usan Interconecta Trucking reportan estos beneficios
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold font-sora mb-2">{benefit.title}</h4>
                <p className="font-inter text-interconecta-primary-light">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
