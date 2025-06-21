
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecureInput } from '@/components/security/SecureInput';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate to-white p-4">
      <Card className="w-full max-w-md border-interconecta-border-subtle">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="interconecta-gradient p-3 rounded-xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-sora text-interconecta-text-primary">
            {emailSent ? 'Revisa tu email' : 'Recuperar contraseña'}
          </CardTitle>
          <CardDescription className="font-inter text-interconecta-text-secondary">
            {emailSent 
              ? 'Te hemos enviado las instrucciones para restablecer tu contraseña'
              : 'Ingresa tu email para recibir instrucciones'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <SecureInput
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  validationType="email"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-interconecta-primary hover:bg-interconecta-accent font-sora font-medium" 
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-interconecta-text-secondary">
                Si no encuentras el email, revisa tu carpeta de spam.
              </p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-interconecta-border-subtle text-center">
            <Link 
              to="/auth"
              className="inline-flex items-center text-sm text-interconecta-primary hover:text-interconecta-accent font-inter"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
