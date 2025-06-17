
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

  const isScrolled = scrollY > 100;

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
            <div className="w-8 h-8 bg-blue-interconecta rounded-8 flex items-center justify-center text-pure-white font-bold text-base">
              I
            </div>
            <span>Interconecta</span>
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
