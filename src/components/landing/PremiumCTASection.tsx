
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PremiumCTASection = () => {
  return (
    <section id="demo" className="py-space-32 px-space-6 bg-pure-black text-pure-white text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-display text-pure-white mb-space-6">
          Listo para nunca más<br />
          preocuparte por el SAT?
        </h2>
        
        <p className="text-body-xl text-gray-40 mb-space-10">
          Únete a más de 2,500 transportistas que ya automatizaron completamente sus cartas porte. 
          Prueba gratis durante 30 días.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-space-4 justify-center items-center">
          <Link to="/auth/trial">
            <button className="btn-white interactive">
              <span>Comenzar ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to="/auth/trial">
            <button className="btn-outline-white interactive">
              <span>Agendar demo personal</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTASection;
