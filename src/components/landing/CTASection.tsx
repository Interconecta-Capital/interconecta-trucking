
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="text-center py-12 sm:py-16 md:py-20 lg:py-32 bg-black text-white">
      <div className="max-w-3xl mx-auto scroll-animation px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight">
          ¿Listo para nunca más preocuparte por la gestión de viajes y cartas porte?
        </h2>
        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed">
          Deja de preocuparte por el papeleo fiscal y enfócate en lo que realmente importa: mover tu negocio hacia adelante.
        </p>
        <div className="mt-6 sm:mt-8 md:mt-10">
          <Link to="/auth">
            <Button className="btn-primary font-bold py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-full text-sm sm:text-base md:text-lg w-full sm:w-auto">
              Empieza a planificar tus viajes hoy
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
