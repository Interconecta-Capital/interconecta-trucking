
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-6">
          ¿Listo para revolucionar tu negocio con IA?
        </h3>
        <p className="text-xl font-inter text-interconecta-text-secondary mb-8">
          Únete a cientos de transportistas que ya usan inteligencia artificial para automatizar sus procesos
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth/trial">
            <Button size="lg" className="bg-interconecta-primary hover:bg-interconecta-accent text-white px-12 py-4 text-xl font-sora font-semibold">
              <Calendar className="mr-2 h-6 w-6" />
              Solicitar Demo
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="lg" variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light px-12 py-4 text-xl font-sora font-medium">
              Ver Demo
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
