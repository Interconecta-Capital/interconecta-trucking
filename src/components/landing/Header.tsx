
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useScrollPosition } from "@/hooks/useScrollPosition";

const Header = () => {
  const location = useLocation();
  const scrollY = useScrollPosition();
  
  // Mostrar en todas las páginas que no sean protegidas
  const showHeader = location.pathname === '/' || location.pathname.startsWith('/auth');
  
  if (!showHeader) {
    return null;
  }

  const isScrolled = scrollY > 20;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-premium ${
      isScrolled 
        ? 'py-3 backdrop-blur-premium bg-pure-white/80 border-b border-gray-20 shadow-sm' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-8 w-8 rounded-lg"
            />
            <h1 className="text-lg font-bold text-gray-90">
              Interconecta Trucking
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#características" className="text-gray-70 hover:text-blue-interconecta transition-colors link-premium font-medium">
              Características
            </a>
            <a href="#beneficios" className="text-gray-70 hover:text-blue-interconecta transition-colors link-premium font-medium">
              Beneficios
            </a>
            <a href="#precios" className="text-gray-70 hover:text-blue-interconecta transition-colors link-premium font-medium">
              Precios
            </a>
            <a href="#contacto" className="text-gray-70 hover:text-blue-interconecta transition-colors link-premium font-medium">
              Contacto
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Link to="/auth/login">
              <Button variant="outline" className="btn-premium border-blue-interconecta text-blue-interconecta hover:bg-blue-interconecta hover:text-pure-white font-medium">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth/trial">
              <Button className="btn-premium gradient-premium text-pure-white font-medium shadow-premium">
                Empezar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
