
import React from 'react';

const PremiumFooter = () => {
  return (
    <footer className="bg-gray-05 py-space-12 px-space-6 border-t border-gray-20">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-gray-60 mb-space-6">
          © 2025 Interconecta Capital. Automatización con propósito humano.
        </p>
        
        <div className="flex justify-center gap-space-8 flex-wrap">
          <a href="#privacidad" className="text-gray-70 text-body font-medium hover:text-pure-black transition-colors duration-200">
            Privacidad
          </a>
          <a href="#términos" className="text-gray-70 text-body font-medium hover:text-pure-black transition-colors duration-200">
            Términos
          </a>
          <a href="#soporte" className="text-gray-70 text-body font-medium hover:text-pure-black transition-colors duration-200">
            Soporte
          </a>
          <a href="#contacto" className="text-gray-70 text-body font-medium hover:text-pure-black transition-colors duration-200">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
