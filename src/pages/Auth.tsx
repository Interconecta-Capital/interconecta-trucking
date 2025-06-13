
import { useState } from 'react';
import { SimpleLoginForm } from '@/components/auth/SimpleLoginForm';
import { SimpleRegisterForm } from '@/components/auth/SimpleRegisterForm';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  if (isLogin) {
    return (
      <div>
        <SimpleLoginForm />
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            variant="outline"
            onClick={() => setIsLogin(false)}
            className="text-sm"
          >
            ¿No tienes cuenta? Regístrate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleRegisterForm />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          variant="outline"
          onClick={() => setIsLogin(true)}
          className="text-sm"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </div>
    </div>
  );
}
