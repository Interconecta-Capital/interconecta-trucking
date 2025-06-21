
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="text-center py-20 md:py-32 bg-black text-white">
      <div className="max-w-3xl mx-auto scroll-animation px-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
          Listo para nunca más preocuparte por la gestión de viajes y cartas porte?
        </h2>
        <p className="mt-6 text-lg text-gray-400">
          Deja de preocuparte por el papeleo fiscal y enfócate en lo que realmente importa: mover tu negocio hacia adelante.
        </p>
        <div className="mt-10">
          <Link to="/auth">
            <Button className="btn-primary font-bold py-4 px-10 rounded-full text-lg">
              Empieza a planificar tus viajes hoy
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
