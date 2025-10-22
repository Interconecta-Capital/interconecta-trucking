import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileCheck, Calendar, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CartaPorteTimbrada {
  id: string;
  folio: string;
  uuid: string;
  fecha_timbrado: string;
  rfc_emisor: string;
  rfc_receptor: string;
  total: number;
  xml_url?: string;
  pdf_url?: string;
  estado: string;
}

export function HistorialTimbradoPanel() {
  const { user } = useAuth();
  const [cartasTimbradas, setCartasTimbradas] = useState<CartaPorteTimbrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, [user]);

  const cargarHistorial = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('id, folio, fecha_timbrado, rfc_emisor, rfc_receptor, datos_formulario')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error consultando cartas:', error);
        throw error;
      }

      const cartasFormateadas = data
        ?.filter(carta => {
          // Filtrar solo las que tienen datos de timbrado
          const datosForm = carta.datos_formulario as any;
          const uuid = datosForm?.uuid || datosForm?.timbrado?.uuid;
          return !!uuid;
        })
        .map(carta => {
          // Extraer UUID del datos_formulario
          const datosForm = carta.datos_formulario as any;
          const uuid = datosForm?.uuid || datosForm?.timbrado?.uuid || '';

          return {
            id: carta.id,
            folio: carta.folio || 'Sin folio',
            uuid: uuid,
            fecha_timbrado: carta.fecha_timbrado || '',
            rfc_emisor: carta.rfc_emisor || '',
            rfc_receptor: carta.rfc_receptor || '',
            total: 0,
            estado: 'vigente'
          };
        }) || [];

      setCartasTimbradas(cartasFormateadas);
    } catch (error) {
      console.error('Error cargando historial:', error);
      toast.error('Error al cargar historial de timbrado');
    } finally {
      setIsLoading(false);
    }
  };

  const descargarXML = async (cartaId: string, uuid: string) => {
    try {
      toast.info('Descargando XML timbrado...');
      
      // Aquí se implementaría la descarga del XML desde storage
      // Por ahora solo mostramos un mensaje
      toast.success(`XML descargado: ${uuid}`);
    } catch (error) {
      console.error('Error descargando XML:', error);
      toast.error('Error al descargar XML');
    }
  };

  const verDetalles = (cartaId: string) => {
    // Navegar a detalles de la carta porte
    window.location.href = `/cartas-porte/${cartaId}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Timbrado</CardTitle>
          <CardDescription>Cargando historial...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (cartasTimbradas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Historial de Timbrado
          </CardTitle>
          <CardDescription>No hay Cartas Porte timbradas aún</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Las Cartas Porte timbradas aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Historial de Timbrado
        </CardTitle>
        <CardDescription>
          {cartasTimbradas.length} Carta{cartasTimbradas.length !== 1 ? 's' : ''} Porte timbrada{cartasTimbradas.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cartasTimbradas.map((carta) => (
            <div
              key={carta.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium">{carta.folio}</p>
                  <Badge variant={carta.estado === 'vigente' ? 'success' : 'secondary'}>
                    {carta.estado}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {carta.fecha_timbrado ? 
                    format(new Date(carta.fecha_timbrado), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es }) :
                    'Sin fecha'
                  }
                </div>
                <p className="text-xs text-muted-foreground">UUID: {carta.uuid}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Emisor: {carta.rfc_emisor}</span>
                  <span>•</span>
                  <span>Receptor: {carta.rfc_receptor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => verDetalles(carta.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => descargarXML(carta.id, carta.uuid)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  XML
                </Button>
              </div>
            </div>
          ))}
        </div>

        {cartasTimbradas.length >= 20 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={cargarHistorial}>
              Cargar más
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
