
import React from 'react';

const PremiumTestimonialSection = () => {
  return (
    <section className="py-space-32 px-space-6 bg-gray-05">
      <div className="max-w-4xl mx-auto text-center scroll-reveal">
        <blockquote className="text-subtitle md:text-display font-medium text-pure-black mb-space-8 leading-tight italic relative">
          <div 
            className="absolute -top-5 -left-10 text-gray-20 font-normal not-italic leading-none hidden md:block"
            style={{ fontSize: '120px' }}
          >
            "
          </div>
          Antes nos tomaba 3 horas hacer una carta porte y siempre había errores del SAT. 
          Ahora son 3 minutos y nunca falla. Es como tener un contador experto trabajando 24/7.
        </blockquote>
        
        <div className="flex items-center justify-center gap-space-4">
          <div className="w-15 h-15 bg-blue-interconecta rounded-full flex items-center justify-center text-pure-white font-bold text-xl">
            CM
          </div>
          <div className="text-left">
            <div className="font-bold text-pure-black text-body">Carlos Mendoza</div>
            <div className="text-body-sm text-gray-60">Director de Operaciones, Transportes del Norte</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonialSection;
