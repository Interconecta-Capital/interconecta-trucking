
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  // Mostrar en todas las páginas que no sean protegidas
  const showHeader = location.pathname === '/' || location.pathname.startsWith('/auth');
  
  if (!showHeader) {
    return null;
  }

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-white">
            Interconecta
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <a href="#vision" className="text-gray-300 hover:text-white transition-colors">
              Visión
            </a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Planes
            </a>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-primary px-4 py-1.5 rounded-full text-sm font-semibold">
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
