
import { useState } from 'react';
import { EnhancedLoginForm } from '@/components/auth/EnhancedLoginForm';
import { EnhancedRegisterForm } from '@/components/auth/EnhancedRegisterForm';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  if (isLogin) {
    return (
      <div className="relative">
        <EnhancedLoginForm />
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            variant="outline"
            onClick={() => setIsLogin(false)}
            className="bg-white/90 backdrop-blur-sm border-2 border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white font-inter font-medium transition-all duration-200 shadow-lg"
          >
            ¿No tienes cuenta? Regístrate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <EnhancedRegisterForm />
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <Button
          variant="outline"
          onClick={() => setIsLogin(true)}
          className="bg-white/90 backdrop-blur-sm border-2 border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white font-inter font-medium transition-all duration-200 shadow-lg"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </div>
    </div>
  );
}
