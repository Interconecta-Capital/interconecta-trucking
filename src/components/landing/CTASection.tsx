
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const CTASection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-32 bg-pure-black text-pure-white">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div ref={ref} className={`space-y-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          
          <div className="stagger-item">
            <h3 className="text-responsive-display font-bold mb-6">
              ¿Listo para revolucionar tu negocio con IA?
            </h3>
          </div>
          
          <div className="stagger-item">
            <p className="text-responsive-subtitle text-gray-40 max-w-2xl mx-auto">
              Únete a cientos de transportistas que ya usan inteligencia artificial para automatizar sus procesos
            </p>
          </div>
          
          <div className="stagger-item">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Link to="/auth/trial">
                <Button size="lg" className="btn-premium bg-pure-white text-pure-black hover:bg-gray-05 px-12 py-4 text-lg font-semibold">
                  <Calendar className="mr-2 h-6 w-6" />
                  Solicitar Demo
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg" variant="outline" className="btn-premium border-2 border-pure-white text-pure-white hover:bg-pure-white hover:text-pure-black px-12 py-4 text-lg font-medium">
                  Ver Demo
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default CTASection;
