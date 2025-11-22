import { FacturasTab } from '@/components/documentos-fiscales/FacturasTab';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FacturasPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus facturas electrónicas
          </p>
        </div>
      </div>

      <FacturasTab />
    </div>
  );
}
