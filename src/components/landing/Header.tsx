
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Mostrar en todas las páginas que no sean protegidas
  const showHeader = location.pathname === '/' || location.pathname.startsWith('/auth');
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!showHeader) {
    return null;
  }

  return (
    <header className={`nav-premium ${scrolled ? 'scrolled' : ''} will-change gpu-accelerated`}>
      <div className="container mx-auto px-6 py-0 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-3 no-underline">
          <div className="w-8 h-8 bg-interconecta-primary rounded-lg flex items-center justify-center">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-5 w-5 rounded"
            />
          </div>
          <h1 className="text-xl font-bold font-sora text-interconecta-text-primary">
            Interconecta Trucking
          </h1>
        </Link>

        <nav className="hidden md:flex space-x-8">
          <a 
            href="#features" 
            className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-8px] after:left-0 after:bg-interconecta-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Características
          </a>
          <a 
            href="#benefits" 
            className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-8px] after:left-0 after:bg-interconecta-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Beneficios
          </a>
          <a 
            href="#pricing" 
            className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-8px] after:left-0 after:bg-interconecta-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Precios
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link to="/auth/login">
            <Button 
              variant="outline" 
              className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light font-sora font-medium transition-all duration-300"
            >
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/auth/trial">
            <Button className="btn-premium-primary interactive">
              Prueba Gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
