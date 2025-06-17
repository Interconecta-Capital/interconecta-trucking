
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const CTASection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="demo" className="py-32 bg-pure-black text-pure-white">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        
        <div ref={ref} className={`${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-white mb-6">
            Listo para nunca más<br />
            preocuparte por el SAT?
          </h2>
          
          <p className="text-body-xl text-gray-40 leading-relaxed mb-10">
            Únete a más de 2,500 transportistas que ya automatizaron completamente sus cartas porte. 
            Prueba gratis durante 30 días.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth/trial">
              <Button className="btn-premium bg-pure-white hover:bg-gray-10 text-pure-black px-8 py-4 text-base font-semibold rounded-12 interactive">
                <span>Comenzar ahora</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#contacto">
              <Button variant="outline" className="btn-premium border border-gray-60 hover:border-pure-white text-pure-white hover:bg-white/10 px-8 py-4 text-base font-semibold rounded-12 interactive">
                <span>Agendar demo personal</span>
              </Button>
            </a>
          </div>
          
        </div>
        
      </div>
    </section>
  );
};

export default CTASection;
