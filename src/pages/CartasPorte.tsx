import { useState } from 'react';
import { Plus, FileText, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { CartasPorteTableAdvanced } from '@/components/cartas-porte/CartasPorteTableAdvanced';
import { CartasPorteFilters } from '@/components/cartas-porte/CartasPorteFilters';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { XMLCartaPorteGenerator } from '@/services/xml/xmlGenerator';
import { CartaPortePDFAdvanced } from '@/services/pdfGenerator/CartaPortePDFAdvanced';
import { CartaPortePDFService } from '@/services/CartaPortePDFService';
import { useToast } from '@/hooks/use-toast';
import { CartaPorteData } from '@/types/cartaPorte';

export default function CartasPorte() {
  const navigate = useNavigate();
  const { cartasPorte, loading, actualizarCartaPorte, eliminarCartaPorte } = useCartasPorte();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pdfLinks, setPdfLinks] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleNewCartaPorte = () => {
    navigate('/cartas-porte/nueva');
  };

  const handleEdit = (id: string) => {
    navigate(`/cartas-porte/${id}/editar`);
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarCartaPorte(id);
      toast({
        title: "Carta porte eliminada",
        description: "La carta porte se ha eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la carta porte.",
        variant: "destructive"
      });
    }
  };

  const handleRegenerateXML = async (id: string) => {
    try {
      const carta = cartasPorte.find(c => c.id === id);
      if (!carta || !carta.datos_formulario) {
        throw new Error('No se encontraron datos para generar XML');
      }

      // Safely convert datos_formulario to CartaPorteData with proper type assertion
      let cartaPorteData: CartaPorteData;
      
      if (typeof carta.datos_formulario === 'string') {
        cartaPorteData = JSON.parse(carta.datos_formulario);
      } else if (typeof carta.datos_formulario === 'object' && carta.datos_formulario !== null) {
        cartaPorteData = {
          version: '3.1',
          ...(carta.datos_formulario as any)
        } as CartaPorteData;
      } else {
        throw new Error('Formato de datos inválido');
      }

      const result = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (result.success && result.xml) {
        await actualizarCartaPorte({
          id,
          data: {
            xml_generado: result.xml,
            status: 'completa',
            updated_at: new Date().toISOString()
          }
        });
        
        toast({
          title: "XML regenerado",
          description: "El XML se ha generado y guardado correctamente.",
        });
      } else {
        throw new Error(result.errors?.join(', ') || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error regenerando XML:', error);
      toast({
        title: "Error regenerando XML",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async (id: string) => {
    try {
      const carta = cartasPorte.find(c => c.id === id);
      if (!carta || !carta.datos_formulario) {
        throw new Error('No se encontraron datos para generar PDF');
      }

      if (carta.status?.toLowerCase() === 'timbrada') {
        const result = await CartaPortePDFService.generate(id);
        if (result.success && result.pdfUrl) {
          setPdfLinks(prev => ({ ...prev, [id]: result.pdfUrl! }));
          toast({
            title: 'PDF generado',
            description: 'Haz clic en el enlace para descargar el PDF.',
          });
          return;
        }
      }

      // Fallback to local generator with proper type assertion
      let cartaPorteData: CartaPorteData;
      if (typeof carta.datos_formulario === 'string') {
        cartaPorteData = JSON.parse(carta.datos_formulario);
      } else {
        cartaPorteData = {
          version: '3.1',
          ...(carta.datos_formulario as any)
        } as CartaPorteData;
      }

      const result = await CartaPortePDFAdvanced.generarPDF(cartaPorteData);

      if (result.success && result.pdfBlob) {
        CartaPortePDFAdvanced.descargarPDF(result.pdfBlob, `carta-porte-${carta.folio || id}.pdf`);
        toast({
          title: 'PDF generado',
          description: 'El PDF se ha generado y descargado correctamente.',
        });
      } else {
        throw new Error(result.error || 'Error desconocido generando PDF');
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error generando PDF',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  const filteredCartas = cartasPorte.filter(carta =>
    carta.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.rfc_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.rfc_receptor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedContent requiredFeature="cartas_porte">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Cartas de Porte</h1>
          </div>
          <ProtectedActions
            action="create"
            resource="cartas_porte"
            onAction={handleNewCartaPorte}
            buttonText="Nueva Carta Porte"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="cartas_porte" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por folio, RFC emisor o receptor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros adicionales */}
        {showFilters && (
          <CartasPorteFilters />
        )}

        {/* Tabla Avanzada */}
        <CartasPorteTableAdvanced
          cartasPorte={filteredCartas}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegenerateXML={handleRegenerateXML}
          onGeneratePDF={handleGeneratePDF}
          pdfLinks={pdfLinks}
        />
      </div>
    </ProtectedContent>
  );
}
