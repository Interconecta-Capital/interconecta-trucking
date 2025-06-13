
import { useState } from 'react';
import { EnhancedLoginForm } from '@/components/auth/EnhancedLoginForm';
import { EnhancedRegisterForm } from '@/components/auth/EnhancedRegisterForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedAuthGuard } from '@/components/auth/EnhancedAuthGuard';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <EnhancedAuthGuard requireAuth={false}>
      <div className="relative">
        {/* Botón de regresar */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        {isLogin ? <EnhancedLoginForm /> : <EnhancedRegisterForm />}
        
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="bg-white/90 backdrop-blur-sm border-2 border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white font-inter font-medium transition-all duration-200 shadow-lg"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </Button>
        </div>
      </div>
    </EnhancedAuthGuard>
  );
}
