import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Receipt, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DocumentosFiscales() {
  const navigate = useNavigate();

  // Obtener estadísticas rápidas optimizadas (solo conteos)
  const { data: stats } = useQuery({
    queryKey: ['documentos-fiscales-stats'],
    queryFn: async () => {
      const [
        facturasResult,
        cartasPorteResult,
        borradoresCartasResult
      ] = await Promise.all([
        supabase.from('facturas').select('id', { count: 'exact', head: true }),
        supabase.from('cartas_porte').select('id', { count: 'exact', head: true }),
        supabase.from('borradores_carta_porte').select('id', { count: 'exact', head: true }),
      ]);
      
      return {
        facturas: facturasResult.count || 0,
        cartasPorte: (cartasPorteResult.count || 0) + (borradoresCartasResult.count || 0),
      };
    },
    staleTime: 60000,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos Fiscales</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus documentos fiscales electrónicos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Facturas */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => navigate('/documentos-fiscales/facturas')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Facturas</CardTitle>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.facturas || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Facturas registradas en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Cartas Porte */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => navigate('/documentos-fiscales/carta-porte')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Cartas Porte</CardTitle>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.cartasPorte || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cartas porte CFDI 4.0 - CP 3.1
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
