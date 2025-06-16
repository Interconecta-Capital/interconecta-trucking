
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const CTASection = () => {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-pure-black text-white text-center">
      <div className="max-w-4xl mx-auto">
        <h3 className={`text-display text-white mb-6 ${revealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          ¿Listo para revolucionar tu negocio con IA?
        </h3>
        <p className={`text-body-xl text-gray-40 mb-10 leading-relaxed ${revealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`} style={{ animationDelay: '0.2s' }}>
          Únete a cientos de transportistas que ya usan inteligencia artificial para automatizar sus procesos
        </p>
        <div className={`flex flex-col sm:flex-row gap-4 justify-center ${revealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`} style={{ animationDelay: '0.4s' }}>
          <Link to="/auth/trial">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-10 px-12 py-4 text-xl font-sora font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl interactive"
            >
              <Calendar className="mr-2 h-6 w-6" />
              Solicitar Demo
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-60 text-white hover:bg-white/10 hover:border-white px-12 py-4 text-xl font-sora font-medium rounded-xl transition-all duration-300 interactive"
            >
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
