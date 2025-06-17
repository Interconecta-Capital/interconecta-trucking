
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const TestimonialSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-32 bg-gray-05">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        
        <div ref={ref} className={`${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          
          {/* Quote */}
          <blockquote className="text-[32px] font-medium text-pure-black mb-8 leading-[1.3] italic relative">
            <span className="absolute -top-5 -left-10 text-[120px] text-gray-20 font-normal leading-none">"</span>
            Antes nos tomaba 3 horas hacer una carta porte y siempre había errores del SAT. 
            Ahora son 3 minutos y nunca falla. Es como tener un contador experto trabajando 24/7.
          </blockquote>
          
          {/* Author */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-15 h-15 bg-blue-interconecta rounded-full flex items-center justify-center text-pure-white font-bold text-2xl">
              CM
            </div>
            <div className="text-left">
              <div className="font-bold text-pure-black">Carlos Mendoza</div>
              <div className="text-sm text-gray-60">Director de Operaciones, Transportes del Norte</div>
            </div>
          </div>
          
        </div>
        
      </div>
    </section>
  );
};

export default TestimonialSection;
