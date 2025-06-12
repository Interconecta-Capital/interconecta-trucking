
const Footer = () => {
  return (
    <footer className="bg-interconecta-text-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="h-8 w-8 rounded-lg"
              />
              <h5 className="text-xl font-bold font-sora">Interconecta Trucking</h5>
            </div>
            <p className="font-inter text-interconecta-primary-light">
              La plataforma líder con IA en gestión de transporte en México.
            </p>
          </div>
          <div>
            <h6 className="font-semibold font-sora mb-4">Producto</h6>
            <ul className="space-y-2 font-inter text-interconecta-primary-light">
              <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold font-sora mb-4">Soporte</h6>
            <ul className="space-y-2 font-inter text-interconecta-primary-light">
              <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold font-sora mb-4">Empresa</h6>
            <ul className="space-y-2 font-inter text-interconecta-primary-light">
              <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-interconecta-accent mt-8 pt-8 text-center font-inter text-interconecta-primary-light">
          <p>&copy; 2024 Interconecta Trucking. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
