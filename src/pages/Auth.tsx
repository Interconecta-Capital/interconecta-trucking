
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  if (isLogin) {
    return (
      <div>
        <LoginForm />
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
      <RegisterForm />
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
