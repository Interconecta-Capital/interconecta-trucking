
const Footer = () => {
  return (
    <footer className="border-t border-gray-800 mt-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-gray-400 text-center">
        <p>&copy; 2025 Interconecta. Todos los derechos reservados.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="hover:text-white transition-colors">
            Términos y Condiciones
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Aviso de Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
