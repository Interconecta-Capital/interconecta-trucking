
import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EnhancedLoginForm } from '@/components/auth/EnhancedLoginForm';
import { EnhancedRegisterForm } from '@/components/auth/EnhancedRegisterForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useSimpleAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('[Auth] User is authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interconecta-primary"></div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
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

      {/* Formulario principal */}
      <div className="min-h-screen flex items-center justify-center">
        {isLogin ? <EnhancedLoginForm /> : <EnhancedRegisterForm />}
      </div>
      
      {/* Botón para cambiar entre login y registro */}
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
  );
}
