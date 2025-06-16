
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const PremiumHeader = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  
  const showHeader = location.pathname === '/' || location.pathname.startsWith('/auth');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 100);
      
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    if (showHeader) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, showHeader]);
  
  if (!showHeader) {
    return null;
  }

  return (
    <nav 
      className={`nav ${isScrolled ? 'scrolled' : ''}`}
      style={{ 
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.33, 1, 0.68, 1)'
      }}
    >
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">I</div>
          <span>Interconecta Trucking</span>
        </Link>
        
        <ul className="nav-menu hidden md:flex">
          <li>
            <a href="#características" className="nav-link">
              Características
            </a>
          </li>
          <li>
            <a href="#precios" className="nav-link">
              Precios
            </a>
          </li>
        </ul>
        
        <div className="flex items-center space-x-3">
          <Link to="/auth/login">
            <Button variant="outline" className="border-blue-interconecta text-blue-interconecta hover:bg-blue-light font-medium">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/auth/trial">
            <a href="#demo" className="nav-cta interactive">
              Prueba Gratis
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PremiumHeader;
