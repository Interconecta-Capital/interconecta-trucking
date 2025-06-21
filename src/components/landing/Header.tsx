
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Mostrar en todas las páginas que no sean protegidas
  const showHeader = location.pathname === '/' || location.pathname.startsWith('/auth');
  
  if (!showHeader) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="text-lg sm:text-xl font-bold text-white">
            Interconecta
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm">
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
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-300 hover:text-white text-sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-primary px-3 lg:px-4 py-1.5 rounded-full text-sm font-semibold">
                Comenzar Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="sm:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <a 
                  href="#vision" 
                  onClick={toggleMenu}
                  className="block text-gray-300 hover:text-white transition-colors py-2"
                >
                  Visión
                </a>
                <a 
                  href="#features" 
                  onClick={toggleMenu}
                  className="block text-gray-300 hover:text-white transition-colors py-2"
                >
                  Características
                </a>
                <a 
                  href="#pricing" 
                  onClick={toggleMenu}
                  className="block text-gray-300 hover:text-white transition-colors py-2"
                >
                  Planes
                </a>
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Link to="/auth" onClick={toggleMenu} className="block">
                  <Button variant="ghost" className="w-full text-gray-300 hover:text-white justify-start">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth" onClick={toggleMenu} className="block">
                  <Button className="w-full btn-primary rounded-full font-semibold">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
