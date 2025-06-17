
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const PricingSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const features = [
    "Cartas porte ilimitadas con IA",
    "Timbrado automático SAT",
    "Dashboard en tiempo real",
    "Aplicación móvil completa",
    "Automatización 24/7",
    "Soporte especializado",
    "Actualizaciones automáticas",
    "Respaldo y seguridad total"
  ];

  return (
    <section id="precios" className="py-32 bg-pure-white">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        
        {/* Section Header */}
        <div ref={ref} className={`mb-20 ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="inline-flex items-center gap-2 bg-gray-10 border border-gray-20 px-4 py-2 rounded-full text-xs font-bold text-gray-70 uppercase tracking-wide mb-8">
            <span>💰</span>
            <span>Precios transparentes</span>
          </div>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            Un precio.<br />
            Todo incluido.
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Sin sorpresas, sin costos ocultos. Automatización completa por menos de lo que cuesta un solo error del SAT.
          </p>
        </div>

        {/* Pricing Card */}
        <div className={`card-premium p-10 relative border-2 border-blue-interconecta shadow-xl ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-interconecta text-pure-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
            Más popular
          </div>
          
          {/* Price */}
          <div className="flex items-baseline justify-center gap-2 my-6">
            <span className="text-2xl font-semibold text-gray-60">$</span>
            <span className="text-[64px] font-extrabold text-pure-black text-mono">4,500</span>
            <span className="text-lg font-medium text-gray-60">/mes</span>
          </div>
          
          <p className="text-gray-60 mb-8">Por empresa, cartas porte ilimitadas</p>
          
          {/* Features List */}
          <ul className="text-left mb-10 space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-[15px] text-gray-70">
                <span className="text-blue-interconecta font-bold text-base">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          
          {/* CTA Button */}
          <Link to="/auth/trial" className="block mb-4">
            <Button className="btn-premium bg-blue-interconecta hover:bg-blue-hover text-pure-white w-full py-4 text-base font-semibold rounded-12 interactive">
              Comenzar prueba gratuita de 30 días
            </Button>
          </Link>
          
          <p className="text-[13px] text-gray-50">
            Sin tarjeta de crédito • Sin compromiso • Cancelación inmediata
          </p>
          
        </div>
        
      </div>
    </section>
  );
};

export default PricingSection;
