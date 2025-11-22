import { CartasPorteTab } from '@/components/documentos-fiscales/CartasPorteTab';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartasPortePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/documentos-fiscales')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartas Porte</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus cartas porte electrónicas CFDI 4.0
          </p>
        </div>
      </div>

      <CartasPorteTab />
    </div>
  );
}
