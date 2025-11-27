import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 mt-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo y descripción */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Interconecta</h3>
            <p className="text-sm text-gray-400">
              Plataforma de gestión de Cartas Porte y autotransporte con cumplimiento SAT.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Aviso de Privacidad
              </Link>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <a 
                href="mailto:hola@interconecta.capital" 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                hola@interconecta.capital
              </a>
              <a 
                href="tel:+525651622408" 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +52 56 5162 2408
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ciudad de México, México
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-sm text-gray-400 text-center">
          <p>&copy; 2025 Interconecta. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
