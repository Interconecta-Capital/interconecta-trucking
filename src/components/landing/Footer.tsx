import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 mt-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-gray-400 text-center">
        <p>&copy; 2025 Interconecta. Todos los derechos reservados.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link to="/terms" className="hover:text-white transition-colors">
            Términos y Condiciones
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Aviso de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
