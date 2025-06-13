
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const EnhancedHeader = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Solo mostrar en la página de inicio y auth
  if (location.pathname !== '/' && !location.pathname.startsWith('/auth')) {
    return null;
  }

  const navItems = [
    { name: "Características", href: "#features" },
    { name: "Beneficios", href: "#benefits" },
    { name: "Precios", href: "#pricing" }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-interconecta-border-subtle sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="h-10 w-10 rounded-lg transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-interconecta-primary/20 to-interconecta-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-sora text-interconecta-primary group-hover:text-interconecta-accent transition-colors">
                Interconecta Trucking
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <a 
                key={item.name}
                href={item.href} 
                className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter font-medium relative group"
              >
                {item.name}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-interconecta-primary transition-all duration-300 group-hover:w-full"></div>
              </a>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/auth">
              <Button 
                variant="ghost" 
                className="text-interconecta-primary hover:bg-interconecta-primary-light font-sora font-medium transition-all duration-200 hover:scale-105"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth/trial">
              <Button className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white font-sora font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Prueba Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-interconecta-primary hover:bg-interconecta-primary-light rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light font-sora font-medium">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth/trial" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-interconecta-primary to-interconecta-accent text-white font-sora font-medium">
                    Prueba Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EnhancedHeader;
