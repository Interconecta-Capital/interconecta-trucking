
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { usePremiumNavigation } from "@/hooks/usePremiumNavigation";

const Header = () => {
  const location = useLocation();
  const { isScrolled } = usePremiumNavigation();
  
  // Mostrar en todas las páginas que no sean protegidas
  const showHeader = location.pathname === '/' || location.pathname.startsWith('/auth');
  
  if (!showHeader) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-premium bg-pure-white/95 border-b border-gray-30' 
        : 'backdrop-blur-premium bg-pure-white/80 border-b border-gray-20'
    }`}>
      <div className="container mx-auto px-6 max-w-screen-xl">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-pure-black no-underline font-bold text-xl tracking-title">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span>Interconecta Trucking</span>
          </Link>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex gap-8">
            <a href="#características" className="text-gray-70 hover:text-pure-black link-premium font-medium text-[15px]">
              Características
            </a>
            <a href="#precios" className="text-gray-70 hover:text-pure-black link-premium font-medium text-[15px]">
              Precios
            </a>
            <a href="#contacto" className="text-gray-70 hover:text-pure-black link-premium font-medium text-[15px]">
              Contacto
            </a>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="outline" className="btn-premium border-gray-30 text-gray-70 hover:border-blue-interconecta hover:text-blue-interconecta hover:bg-blue-light font-medium">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth/trial">
              <Button className="btn-premium bg-blue-interconecta hover:bg-blue-hover text-pure-white font-semibold text-sm px-5 py-3 rounded-full interactive">
                Probar gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
