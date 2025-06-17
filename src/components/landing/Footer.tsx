
const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-05 py-12 border-t border-gray-20">
      <div className="container mx-auto px-6 max-w-screen-xl text-center">
        
        <p className="text-gray-60 mb-6">
          © 2025 Interconecta Capital. Automatización con propósito humano.
        </p>
        
        <div className="flex gap-8 justify-center flex-wrap">
          <a href="#privacidad" className="text-gray-70 hover:text-pure-black link-premium font-medium">
            Privacidad
          </a>
          <a href="#términos" className="text-gray-70 hover:text-pure-black link-premium font-medium">
            Términos
          </a>
          <a href="#soporte" className="text-gray-70 hover:text-pure-black link-premium font-medium">
            Soporte
          </a>
          <a href="#contacto" className="text-gray-70 hover:text-pure-black link-premium font-medium">
            Contacto
          </a>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
