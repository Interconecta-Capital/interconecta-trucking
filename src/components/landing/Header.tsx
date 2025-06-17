
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
    <header className="bg-white/90 backdrop-blur-md border-b border-interconecta-border-subtle sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
            alt="Interconecta Trucking Logo"
            className="h-8 w-8 rounded-lg"
          />
          <h1 className="text-lg font-bold font-sora text-interconecta-primary">
            Interconecta Trucking
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter">
            Características
          </a>
          <a href="#benefits" className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter">
            Beneficios
          </a>
          <a href="#pricing" className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter">
            Precios
          </a>
        </nav>
        <div className="flex items-center space-x-3">
          <Link to="/auth/login">
            <Button variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light font-sora font-medium">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/auth/trial">
            <Button className="bg-interconecta-primary hover:bg-interconecta-accent text-white font-sora font-medium">
              Prueba Gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
