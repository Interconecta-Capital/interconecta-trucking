
import { useState, useEffect } from 'react';
import { categorizeError, formatErrorForUser, getErrorIcon } from '@/utils/timbrado/errorCategorization';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAmbienteTimbrado } from '@/hooks/useAmbienteTimbrado';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  MapPin, 
  Edit, 
  Settings, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Calendar,
  User,
  Package,
  Route,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  Navigation,
  DollarSign,
  Zap,
  Download,
  Receipt
} from 'lucide-react';
import { useViajesEstados, Viaje } from '@/hooks/useViajesEstados';
import { useQueryClient } from '@tanstack/react-query';
import { EstadosViajeManager } from '@/components/viajes/estados/EstadosViajeManager';
import { TrackingViajeRealTime } from '@/components/viajes/tracking/TrackingViajeRealTime';
import { ViajeEditor } from '@/components/viajes/editor/ViajeEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeMercanciasManager } from '@/components/viajes/mercancias/ViajeMercanciasManager';
import { FacturaPreviewModal } from '@/components/viajes/documentos/FacturaPreviewModal';
import { ViajeDocumentosGenerator } from '@/services/pdf/ViajeDocumentosGenerator';
import { DocumentosOperativosService } from '@/services/documentos/DocumentosOperativosServiceMejorado';

interface ViajeTrackingModalProps {
  viaje: Viaje | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViajeTrackingModal = ({ viaje, open, onOpenChange }: ViajeTrackingModalProps) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const queryClient = useQueryClient();
  const { ambiente } = useAmbienteTimbrado();
  const [viajeCompleto, setViajeCompleto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showFacturaPreview, setShowFacturaPreview] = useState(false);
  const [isTimbrando, setIsTimbrando] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCartaPortePreview, setShowCartaPortePreview] = useState(false);
  const [isTimbrandoCartaPorte, setIsTimbrandoCartaPorte] = useState(false);
  const [isGenerandoBorrador, setIsGenerandoBorrador] = useState(false);
  
  // ✅ NUEVO: Cargar viaje completo con todas sus relaciones usando RPC
  useEffect(() => {
    const cargarViajeCompleto = async () => {
      if (!viaje?.id || !open) {
        setViajeCompleto(null);
        return;
      }
      
      setLoading(true);
      try {
        console.log('🔍 Cargando viaje con ID:', viaje.id);
        
        const { data, error } = await supabase.rpc('get_viaje_con_relaciones', {
          p_viaje_id: viaje.id
        });
        
        if (error) {
          console.error('❌ Error en RPC get_viaje_con_relaciones:', error);
          throw error;
        }
        
        console.log('✅ Viaje completo cargado:', data);
        setViajeCompleto(data);
        setActiveTab('resumen');
      } catch (error: any) {
        console.error('❌ Error cargando viaje completo:', error);
        toast.error(`Error al cargar los datos del viaje: ${error.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    
    cargarViajeCompleto();
  }, [viaje?.id, open]);

  // Funciones para documentos operativos - ISO 27001 A.12.3.1
  const handleVerHojaRuta = async () => {
    try {
      const blob = await DocumentosOperativosService.generarHojaDeRuta(viajeCompleto);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generando hoja de ruta:', error);
      toast.error('Error al generar la hoja de ruta');
    }
  };

  const handleImprimirHojaRuta = async () => {
    try {
      const blob = await DocumentosOperativosService.generarHojaDeRuta(viajeCompleto);
      DocumentosOperativosService.imprimirDocumento(blob);
    } catch (error) {
      console.error('Error imprimiendo hoja de ruta:', error);
      toast.error('Error al imprimir la hoja de ruta');
    }
  };

  const handleVerChecklist = async () => {
    try {
      const blob = await DocumentosOperativosService.generarChecklistPreViaje(viajeCompleto);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generando checklist:', error);
      toast.error('Error al generar el checklist');
    }
  };

  const handleGenerarChecklistPDF = async () => {
    try {
      const blob = await DocumentosOperativosService.generarChecklistPreViaje(viajeCompleto);
      const fecha = new Date().toISOString().split('T')[0];
      DocumentosOperativosService.descargarDocumento(
        blob,
        `checklist-pre-viaje-${viaje?.id?.substring(0, 8)}-${fecha}.pdf`
      );
      toast.success('Checklist generado exitosamente');
    } catch (error) {
      console.error('Error generando checklist PDF:', error);
      toast.error('Error al generar el checklist PDF');
    }
  };

  // Función para generar borrador de carta porte - ISO 27001 A.12.1.2
  const handleGenerarBorradorCartaPorte = async () => {
    setIsGenerandoBorrador(true);
    try {
      const viajeData = viajeCompleto.viaje;
      const trackingData = viajeData.tracking_data || {};

      const borradorData = {
        user_id: viajeData.user_id,
        nombre_borrador: `CP - ${viajeData.origen} a ${viajeData.destino}`,
        datos_formulario: {
          ubicaciones: trackingData.ubicaciones || {},
          mercancias: trackingData.mercancias || [],
          conductor: trackingData.conductor || null,
          vehiculo: trackingData.vehiculo || null,
          cliente: trackingData.cliente || null,
        },
        version_formulario: '3.1',
        auto_saved: false,
      };

      const { data, error } = await supabase
        .from('borradores_carta_porte')
        .insert(borradorData)
        .select()
        .single();

      if (error) throw error;

      // Vincular borrador con el viaje
      await supabase
        .from('viajes')
        .update({
          tracking_data: {
            ...trackingData,
            borrador_carta_porte_id: data.id,
          },
        })
        .eq('id', viajeData.id);

      toast.success('Borrador de Carta Porte generado exitosamente');
      
      // Recargar datos
      const { data: viajeActualizado } = await supabase.rpc('get_viaje_con_relaciones', {
        p_viaje_id: viajeData.id,
      });
      if (viajeActualizado) setViajeCompleto(viajeActualizado);
    } catch (error: any) {
      console.error('Error generando borrador:', error);
      toast.error('Error al generar borrador de Carta Porte');
    } finally {
      setIsGenerandoBorrador(false);
    }
  };

  const handleTimbrarFactura = async (updatedData: { moneda: string; forma_pago: string; metodo_pago: string }) => {
    const facturaData = viajeCompleto?.factura;
    if (!facturaData?.id) {
      toast.error('No se encontró la factura para timbrar');
      return;
    }

    try {
      setIsTimbrando(true);
      toast.loading('Timbrando factura...', { id: 'timbrado' });

      // Construir conceptos desde mercancías del viaje o concepto genérico
      const mercancias = viajeCompleto?.mercancias || [];
      const conceptos = mercancias.length > 0 
        ? mercancias.map((m: any) => ({
            clave_prod_serv: m.bienes_transp || '78101800',
            cantidad: m.cantidad || 1,
            clave_unidad: m.clave_unidad || 'E48',
            descripcion: m.descripcion || 'Servicio de transporte de carga',
            valor_unitario: facturaData.tipo_comprobante === 'I' ? (m.valor_mercancia || 0) : 0,
            importe: facturaData.tipo_comprobante === 'I' ? (m.valor_mercancia || 0) : 0
          }))
        : [{
            clave_prod_serv: '78101800',
            cantidad: 1,
            clave_unidad: 'E48',
            descripcion: 'Servicio de transporte de carga',
            valor_unitario: facturaData.subtotal || 0,
            importe: facturaData.subtotal || 0
          }];

      // 📍 EXTRAER UBICACIONES - ISO 27001 A.12.1 Validación de datos
      console.log('🔍 [TIMBRADO] Estructura viajeCompleto:', {
        hasViaje: !!viajeCompleto?.viaje,
        hasTrackingData: !!viajeCompleto?.viaje?.tracking_data,
        hasUbicaciones: !!viajeCompleto?.viaje?.tracking_data?.ubicaciones,
        trackingDataKeys: viajeCompleto?.viaje?.tracking_data ? Object.keys(viajeCompleto.viaje.tracking_data) : null,
        ubicacionesStructure: viajeCompleto?.viaje?.tracking_data?.ubicaciones
      });

      const trackingData = viajeCompleto?.viaje?.tracking_data;
      const ubicaciones = trackingData?.ubicaciones;

      console.log('📍 Ubicaciones extraídas:', ubicaciones);

      // Construir payload para timbrado
      const timbradoPayload = {
        facturaId: facturaData.id,
        facturaData: {
          rfcEmisor: facturaData.rfc_emisor,
          nombreEmisor: facturaData.nombre_emisor,
          regimenFiscalEmisor: facturaData.regimen_fiscal_emisor,
          rfcReceptor: facturaData.rfc_receptor,
          nombreReceptor: facturaData.nombre_receptor,
          regimenFiscalReceptor: facturaData.regimen_fiscal_receptor,
          // ✅ CORREGIDO: Validar uso_cfdi contra catálogo SAT antes de enviar
          usoCfdi: ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01', 'CN01'].includes(facturaData.uso_cfdi || '')
            ? facturaData.uso_cfdi
            : 'G03', // Valor por defecto seguro
          // ✅ NUEVO: Agregar domicilio fiscal del receptor (CRÍTICO para SAT)
          domicilioFiscalReceptor: facturaData.domicilio_fiscal_receptor || viajeCompleto?.cliente?.domicilio_fiscal?.codigo_postal || null,
          tipoCfdi: facturaData.tipo_comprobante,
          serie: facturaData.serie,
          folio: facturaData.folio,
          subtotal: facturaData.subtotal || 0,
          total: facturaData.total || 0,
          moneda: updatedData.moneda,
          formaPago: updatedData.forma_pago,
          metodoPago: updatedData.metodo_pago,
          conceptos: conceptos,
          ubicaciones: ubicaciones, // ✅ Ubicaciones del viaje
          tracking_data: {
            ...trackingData,
            conductor: viajeCompleto?.conductor, // ✅ Agregar conductor
            vehiculo: viajeCompleto?.vehiculo,   // ✅ Agregar vehículo
            remolque: viajeCompleto?.remolque    // ✅ Agregar remolque
          },
          mercancias: mercancias, // ✅ Mercancías del viaje
          // Autotransporte para CartaPorte
          autotransporte: viajeCompleto?.vehiculo ? {
            placa_vm: viajeCompleto.vehiculo.placa,
            config_vehicular: viajeCompleto.vehiculo.config_vehicular,
            peso_bruto_vehicular: viajeCompleto.vehiculo.peso_bruto_vehicular || viajeCompleto.vehiculo.capacidad_carga,
            anio_modelo: viajeCompleto.vehiculo.anio,
            aseguradora_resp_civil: viajeCompleto.vehiculo.aseguradora || "Sin aseguradora",
            poliza_resp_civil: viajeCompleto.vehiculo.numero_poliza || "0000000"
          } : undefined
        },
        ambiente
      };

      console.log('📦 [TIMBRADO] Payload completo:', JSON.stringify(timbradoPayload).substring(0, 1000));

      const { data, error } = await supabase.functions.invoke('timbrar-con-sw', {
        body: timbradoPayload
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('✅ Factura timbrada correctamente', { id: 'timbrado' });
        setShowFacturaPreview(false);
        handleViajeUpdate();
      } else {
        // Lanzar error con toda la información del SAT
        const satError: any = new Error(data?.error || 'Error al timbrar factura');
        satError.codigo = data?.codigo;
        satError.details = data?.details;
        throw satError;
      }
    } catch (error: any) {
      console.error('Error timbrando factura:', error);
      
      // Extraer error detallado del SAT si existe
      let satErrorDetails = null;
      if (error?.codigo || error?.details) {
        satErrorDetails = {
          codigo: error.codigo,
          message: error.message,
          messageDetail: error.details?.messageDetail || error.details?.message
        };
      }
      
      // 🔐 Categorizar error para feedback útil al usuario
      const categorizedError = categorizeError(error);
      const errorIcon = getErrorIcon(categorizedError.type);
      
      // Mostrar mensaje con detalles del SAT si existen
      let errorMessage = `${errorIcon} ${categorizedError.title}\n\n`;
      
      if (satErrorDetails) {
        errorMessage += `Código SAT: ${satErrorDetails.codigo}\n\n`;
        errorMessage += `${satErrorDetails.message}\n\n`;
        if (satErrorDetails.messageDetail) {
          errorMessage += `Detalle: ${satErrorDetails.messageDetail}\n\n`;
        }
      } else {
        errorMessage += `${categorizedError.message}\n\n`;
      }

      if (categorizedError.userActionable && categorizedError.suggestedActions.length > 0) {
        errorMessage += `Acciones sugeridas:\n${categorizedError.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
        toast.error(errorMessage, { 
          id: 'timbrado',
          duration: 12000 // Más tiempo para leer todo el detalle
        });
      } else {
        toast.error(errorMessage, { id: 'timbrado', duration: 8000 });
      }
      
      // Log técnico para debugging
      console.error('[TIMBRADO] Detalles técnicos:', categorizedError.technicalDetails);
      if (satErrorDetails) {
        console.error('[TIMBRADO] Error del SAT:', satErrorDetails);
      }
    } finally {
      setIsTimbrando(false);
    }
  };

  const handleCancelarFactura = async () => {
    if (!viajeCompleto?.factura?.uuid_fiscal) {
      toast.error('No hay UUID para cancelar');
      return;
    }

    try {
      setIsCancelling(true);
      toast.loading('Cancelando factura...', { id: 'cancelacion' });

      const { data, error } = await supabase.functions.invoke('cancelar-cfdi-sw', {
        body: {
          uuid: viajeCompleto.factura.uuid_fiscal,
          rfc: viajeCompleto.factura.rfc_emisor,
          motivo: '02',
          facturaId: viajeCompleto.factura.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('✅ Factura cancelada exitosamente', { id: 'cancelacion' });
        setShowFacturaPreview(false);
        handleViajeUpdate();
      } else {
        throw new Error(data?.error || 'Error al cancelar');
      }
    } catch (error: any) {
      console.error('Error al cancelar factura:', error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`, { id: 'cancelacion' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleTimbrarCartaPorte = async () => {
    if (!viajeCompleto?.carta_porte && !borradorCartaPorteData) {
      toast.error('No hay Carta Porte para timbrar');
      return;
    }

    // Validar que para flete pagado, la factura esté timbrada
    if (viajeDataSafe.tipo_servicio === 'flete_pagado' && facturaData?.status !== 'timbrado') {
      toast.error('Para fletes pagados, la factura debe estar timbrada primero');
      return;
    }

    try {
      setIsTimbrandoCartaPorte(true);
      toast.loading('Timbrando Carta Porte...', { id: 'timbrado-cp' });

      const cartaPorteId = cartaPorteData?.id || borradorCartaPorteData?.id;
      
      console.log('📄 Invocando edge function timbrar-carta-porte con:', {
        cartaPorteId: cartaPorteId?.slice(0, 8),
        viajeId: viajeData.id?.slice(0, 8),
        ambiente: 'sandbox'
      });

      const { data, error } = await supabase.functions.invoke('timbrar-carta-porte', {
        body: {
          cartaPorteId: cartaPorteId,
          viajeId: viajeData.id,
          ambiente
        }
      });

      if (error) {
        console.error('❌ Error de edge function:', error);
        throw error;
      }

      console.log('✅ Respuesta de edge function:', data);

      if (data?.success) {
        toast.success(`✅ Carta Porte timbrada: ${data.data.uuid?.slice(0, 20)}...`, { id: 'timbrado-cp' });
        setShowCartaPortePreview(false);
        handleViajeUpdate();
      } else {
        throw new Error(data?.error || 'Error al timbrar Carta Porte');
      }
    } catch (error: any) {
      console.error('💥 Error timbrando Carta Porte:', error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`, { id: 'timbrado-cp' });
    } finally {
      setIsTimbrandoCartaPorte(false);
    }
  };

  const handleViajeUpdate = () => {
    // Invalidar queries para obtener datos actualizados
    queryClient.invalidateQueries({ queryKey: ['viajes'] });
    queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });
    queryClient.invalidateQueries({ queryKey: ['eventos-viaje'] });
    
    // Recargar el viaje completo
    if (viaje?.id && open) {
      supabase.rpc('get_viaje_con_relaciones', { p_viaje_id: viaje.id })
        .then(({ data }) => data && setViajeCompleto(data));
    }
  };

  if (!viaje) return null;
  
  if (loading || !viajeCompleto) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando información del viaje...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Extraer datos del viaje completo
  const viajeData = viajeCompleto.viaje;
  
  // ✅ Validación de datos seguros con fallback a tracking_data
  const viajeDataSafe = {
    ...viajeData,
    tipo_servicio: viajeData?.tipo_servicio || 
                   viajeData?.tracking_data?.tipo_servicio ||
                   'flete_pagado'  // Default seguro
  };
  
  const conductorData = viajeCompleto.conductor;
  const vehiculoData = viajeCompleto.vehiculo;
  const remolqueData = viajeCompleto.remolque;
  const facturaData = viajeCompleto.factura;
  const cartaPorteData = viajeCompleto.carta_porte;
  const borradorCartaPorteData = viajeCompleto.borrador_carta_porte;

  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { 
        label: 'Programado', 
        className: 'bg-blue-100 text-blue-800',
        icon: Calendar
      },
      en_transito: { 
        label: 'En Tránsito', 
        className: 'bg-green-100 text-green-800',
        icon: Navigation
      },
      completado: { 
        label: 'Completado', 
        className: 'bg-gray-100 text-gray-800',
        icon: CheckCircle2
      },
      retrasado: { 
        label: 'Retrasado', 
        className: 'bg-orange-100 text-orange-800',
        icon: AlertCircle
      },
      cancelado: { 
        label: 'Cancelado', 
        className: 'bg-red-100 text-red-800',
        icon: AlertCircle
      }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-100 text-gray-800', icon: Clock };
    
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!viajeData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">
                  {viajeData.carta_porte_id}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getEstadoBadge(viajeData.estado)}
                  <span className="text-sm text-gray-500">
                    Creado: {formatDateTime(viajeData.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="mercancias" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Mercancías
              <Badge variant="secondary" className="ml-1">
                {viajeCompleto?.mercancias?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="estados" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Estados
            </TabsTrigger>
            <TabsTrigger value="editar" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[70vh] overflow-y-auto">
            
            {/* Tab Resumen - Nueva vista principal */}
            <TabsContent value="resumen" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Información del Viaje */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Información del Viaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <div>
                          <span className="font-medium">Origen:</span>
                          <p className="text-sm text-gray-600">{viajeData.origen}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <div>
                          <span className="font-medium">Destino:</span>
                          <p className="text-sm text-gray-600">{viajeData.destino}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cronología */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Cronología
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Inicio programado:</span>
                        <p>{formatDateTime(viajeData.fecha_inicio_programada)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fin programado:</span>
                        <p>{formatDateTime(viajeData.fecha_fin_programada)}</p>
                      </div>
                      {viajeData.fecha_inicio_real && (
                        <div>
                          <span className="font-medium text-gray-600">Inicio real:</span>
                          <p>{formatDateTime(viajeData.fecha_inicio_real)}</p>
                        </div>
                      )}
                      {viajeData.fecha_fin_real && (
                        <div>
                          <span className="font-medium text-gray-600">Fin real:</span>
                          <p>{formatDateTime(viajeData.fecha_fin_real)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recursos Asignados - CON INFORMACIÓN COMPLETA */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Recursos Asignados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Conductor */}
                      {conductorData ? (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-lg">Conductor</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Nombre:</span> {conductorData.nombre}</p>
                            {conductorData.telefono && (
                              <p><span className="font-medium">Teléfono:</span> {conductorData.telefono}</p>
                            )}
                            {conductorData.email && (
                              <p><span className="font-medium">Email:</span> {conductorData.email}</p>
                            )}
                            {conductorData.num_licencia && (
                              <p><span className="font-medium">Licencia:</span> {conductorData.num_licencia} 
                                {conductorData.tipo_licencia && ` (Tipo ${conductorData.tipo_licencia})`}
                              </p>
                            )}
                            {conductorData.vigencia_licencia && (
                              <p><span className="font-medium">Vigencia:</span> {new Date(conductorData.vigencia_licencia).toLocaleDateString('es-MX')}</p>
                            )}
                            <Badge className={conductorData.estado === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {conductorData.estado}
                            </Badge>
                          </div>
                        </div>
                      ) : viajeData.conductor_id && (
                        <div className="p-4 border border-dashed rounded-lg text-center">
                          <p className="text-sm text-gray-500">Conductor ID: {viajeData.conductor_id.slice(-8)}</p>
                          <p className="text-xs text-gray-400">Información completa no disponible</p>
                        </div>
                      )}
                      
                      {/* Vehículo */}
                      {vehiculoData ? (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-lg">Vehículo</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Placas:</span> {vehiculoData.placa}</p>
                            {vehiculoData.marca && vehiculoData.modelo && (
                              <p><span className="font-medium">Modelo:</span> {vehiculoData.marca} {vehiculoData.modelo} {vehiculoData.anio && `(${vehiculoData.anio})`}</p>
                            )}
                            {vehiculoData.tipo_carroceria && (
                              <p><span className="font-medium">Tipo:</span> {vehiculoData.tipo_carroceria}</p>
                            )}
                            {vehiculoData.config_vehicular && (
                              <p><span className="font-medium">Config:</span> {vehiculoData.config_vehicular}</p>
                            )}
                            {vehiculoData.capacidad_carga && (
                              <p><span className="font-medium">Capacidad:</span> {vehiculoData.capacidad_carga} kg</p>
                            )}
                            {(vehiculoData.numero_serie_vin || vehiculoData.num_serie) && (
                              <p><span className="font-medium">Serie:</span> {vehiculoData.numero_serie_vin || vehiculoData.num_serie}</p>
                            )}
                            <Badge className={vehiculoData.estado === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {vehiculoData.estado}
                            </Badge>
                          </div>
                        </div>
                      ) : viajeData.vehiculo_id && (
                        <div className="p-4 border border-dashed rounded-lg text-center">
                          <p className="text-sm text-gray-500">Vehículo ID: {viajeData.vehiculo_id.slice(-8)}</p>
                          <p className="text-xs text-gray-400">Información completa no disponible</p>
                        </div>
                      )}
                      
                      {/* Remolque */}
                      {remolqueData && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-lg">Remolque</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Placas:</span> {remolqueData.placa}</p>
                            {remolqueData.tipo_remolque && (
                              <p><span className="font-medium">Tipo:</span> {remolqueData.tipo_remolque}</p>
                            )}
                            {remolqueData.subtipo_rem && (
                              <p><span className="font-medium">Subtipo:</span> {remolqueData.subtipo_rem}</p>
                            )}
                            {remolqueData.capacidad_carga && (
                              <p><span className="font-medium">Capacidad:</span> {remolqueData.capacidad_carga} kg</p>
                            )}
                            {remolqueData.estado && (
                              <Badge className={remolqueData.estado === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {remolqueData.estado}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!conductorData && !vehiculoData && !remolqueData && (
                      <div className="text-center text-gray-500 py-4">
                        No hay recursos asignados a este viaje
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documentos Fiscales - CON ESTADO REAL */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documentos Fiscales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Documentos Fiscales */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Documentos Fiscales</h4>
                        
                        {/* Factura */}
                        {facturaData && (facturaData.status === 'draft' || facturaData.status === 'BORRADOR') && (
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-orange-600" />
                                <span className="font-semibold text-lg">Factura</span>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                📝 Borrador
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Serie-Folio:</span> {facturaData.serie}-{facturaData.folio}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Total:</span> ${facturaData.total?.toLocaleString('es-MX')} MXN
                            </p>
                            
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowFacturaPreview(true)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Pre-visualizar
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => setShowFacturaPreview(true)}
                                disabled={isTimbrando}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                {isTimbrando ? 'Timbrando...' : 'Timbrar'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {facturaData && (facturaData.status === 'timbrada' || facturaData.status === 'timbrado') && (
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-lg">Factura</span>
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                ✅ Timbrada
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Tipo:</span> CFDI 4.0 - {facturaData.tipo_comprobante}
                            </p>
                            <p className="text-xs text-gray-600 font-mono mb-3 truncate bg-white p-2 rounded border">
                              <span className="font-medium">UUID:</span> {facturaData.uuid_fiscal}
                            </p>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <FileText className="h-4 w-4 mr-1" />
                                Ver XML
                              </Button>
                              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4 mr-1" />
                                Descargar PDF
                              </Button>
                            </div>
                          </div>
                        )}

                        {!facturaData && (
                          <div className="p-3 border border-dashed rounded-lg text-center">
                            <p className="text-sm text-gray-500">No se generó factura</p>
                            <p className="text-xs text-gray-400 mt-1">(Traslado Propio)</p>
                          </div>
                        )}
                        
                        {/* Carta Porte */}
                        {cartaPorteData ? (
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-lg">Carta Porte</span>
                              </div>
                              <Badge className={
                                cartaPorteData.status === 'timbrada' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {cartaPorteData.status === 'timbrada' ? '✅ Timbrada' : '📝 Borrador'}
                              </Badge>
                            </div>
                            
                            {cartaPorteData.uuid_fiscal ? (
                              <>
                                <p className="text-sm text-gray-700 mb-1">
                                  <span className="font-medium">Tipo:</span> CFDI 4.0 - Carta Porte 3.1
                                </p>
                                <p className="text-xs text-gray-600 font-mono mb-3 truncate bg-white p-2 rounded border">
                                  <span className="font-medium">UUID:</span> {cartaPorteData.uuid_fiscal}
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Ver XML
                                  </Button>
                                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    <Download className="h-4 w-4 mr-1" />
                                    Descargar PDF
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-gray-600 mb-3">Borrador listo para timbrar</p>
                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Timbrar Carta Porte
                                </Button>
                              </>
                            )}
                          </div>
                        ) : borradorCartaPorteData ? (
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-yellow-600" />
                                <span className="font-semibold text-lg">Carta Porte</span>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                📝 Borrador
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{borradorCartaPorteData.nombre_borrador}</p>
                            <p className="text-xs text-gray-500 mb-3">
                              Última edición: {new Date(borradorCartaPorteData.ultima_edicion).toLocaleString('es-MX')}
                            </p>
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Timbrar Carta Porte
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 border border-dashed rounded-lg bg-muted/30">
                            <div className="text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-3">
                                No hay Carta Porte generada
                              </p>
                              <Button 
                                size="sm" 
                                onClick={handleGenerarBorradorCartaPorte}
                                disabled={isGenerandoBorrador}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {isGenerandoBorrador ? 'Generando...' : 'Generar Borrador'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Documentos Operativos */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Documentos Operativos</h4>
                        
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Route className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold">Hoja de Ruta</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              ✓ Disponible
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Instrucciones detalladas del viaje</p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleVerHojaRuta}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={async () => {
                                try {
                                  const blob = await DocumentosOperativosService.generarHojaDeRuta(viajeCompleto);
                                  const fecha = new Date().toISOString().split('T')[0];
                                  DocumentosOperativosService.descargarDocumento(
                                    blob,
                                    `hoja-ruta-${viaje.id?.substring(0, 8)}-${fecha}.pdf`
                                  );
                                  toast.success('Hoja de ruta descargada');
                                } catch (error) {
                                  console.error('Error descargando hoja de ruta:', error);
                                  toast.error('Error al descargar la hoja de ruta');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-teal-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="font-semibold">Checklist Pre-Viaje</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Disponible
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Lista de verificación de seguridad</p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleVerChecklist}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={handleGenerarChecklistPDF}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => setActiveTab('tracking')}
                      className="flex-1 min-w-[200px]"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Ver Tracking en Tiempo Real
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('documentos')}
                      className="flex-1 min-w-[200px]"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Gestionar Documentos
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('estados')}
                      className="flex-1 min-w-[200px]"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cambiar Estado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="mt-0">
              {viajeData.tracking_data?.ubicaciones ? (
                <TrackingViajeRealTime viaje={viajeCompleto} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No hay datos de tracking disponibles</p>
                    <p className="text-sm text-gray-500">
                      Este viaje no tiene coordenadas GPS para mostrar el tracking
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Pestaña de Mercancías */}
            <TabsContent value="mercancias" className="mt-0">
              <ViajeMercanciasManager
                viajeId={viajeCompleto.viaje.id}
                onMercanciasUpdate={handleViajeUpdate}
              />
            </TabsContent>

            <TabsContent value="documentos" className="mt-0">
              <div className="space-y-6">
                {/* Factura - Sección Existente Mejorada */}
                {facturaData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Factura
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg">
                              {facturaData.serie || 'N/A'}-{facturaData.folio || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {facturaData.tipo_comprobante === 'I' ? 'Ingreso' : 'Traslado'}
                            </p>
                          </div>
                          <Badge className={
                            facturaData.status === 'timbrado' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {facturaData.status === 'timbrado' ? '✅ Timbrada' : '📝 Borrador'}
                          </Badge>
                        </div>

                        {facturaData.uuid_fiscal && (
                          <p className="text-xs text-gray-600 font-mono mb-3 truncate bg-white p-2 rounded border">
                            <span className="font-medium">UUID:</span> {facturaData.uuid_fiscal}
                          </p>
                        )}

                        <div className="flex gap-2">
                          {facturaData.status === 'timbrado' ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowFacturaPreview(true)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Detalle
                              </Button>
                              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4 mr-1" />
                                Descargar PDF
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowFacturaPreview(true)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Pre-visualizar
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => setShowFacturaPreview(true)}
                                disabled={isTimbrando}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                {isTimbrando ? 'Timbrando...' : 'Timbrar'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Carta Porte - NUEVA SECCIÓN MEJORADA (FASE 5) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-purple-600" />
                      Carta Porte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-lg">Carta Porte CFDI 4.0</span>
                        </div>
                        <Badge className={
                          cartaPorteData?.status === 'timbrada' ? 'bg-green-100 text-green-800' :
                          cartaPorteData?.status === 'draft' || borradorCartaPorteData ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {cartaPorteData?.status === 'timbrada' ? '✅ Timbrada' :
                           cartaPorteData?.status === 'draft' || borradorCartaPorteData ? '📝 Borrador' :
                           '⏳ Pendiente'}
                        </Badge>
                      </div>
                      
                      {cartaPorteData?.uuid_fiscal ? (
                        <>
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Versión:</span> CFDI 4.0 - Carta Porte 3.1
                          </p>
                          <p className="text-xs text-gray-600 font-mono mb-3 truncate bg-white p-2 rounded border">
                            <span className="font-medium">UUID:</span> {cartaPorteData.uuid_fiscal}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <FileText className="h-4 w-4 mr-1" />
                              Ver XML
                            </Button>
                            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar PDF
                            </Button>
                          </div>
                        </>
                      ) : (cartaPorteData?.status === 'draft' || borradorCartaPorteData) ? (
                        <>
                          <p className="text-sm text-gray-700 mb-3">
                            Borrador listo para timbrar
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setShowCartaPortePreview(true)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Pre-visualizar
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={handleTimbrarCartaPorte}
                              disabled={
                                isTimbrandoCartaPorte || 
                                (viajeDataSafe.tipo_servicio === 'flete_pagado' && facturaData?.status !== 'timbrado')
                              }
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              {isTimbrandoCartaPorte ? 'Timbrando...' : 'Timbrar CCP'}
                            </Button>
                          </div>
                          
                          {/* Advertencia si es flete pagado y factura no está timbrada */}
                          {viajeDataSafe.tipo_servicio === 'flete_pagado' && facturaData?.status !== 'timbrado' && (
                            <Alert className="mt-3 bg-orange-50 border-orange-200">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-xs text-orange-800">
                                Para fletes pagados, la factura debe estar timbrada antes de timbrar la Carta Porte
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-3">
                            No hay Carta Porte generada
                          </p>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <FileText className="h-4 w-4 mr-2" />
                            Generar Carta Porte
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Documentos Operativos - FASE 6: Integración de PDFs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos Operativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hoja de Ruta */}
                      <div className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Route className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Hoja de Ruta</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Información completa del viaje con recursos asignados
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              try {
                                ViajeDocumentosGenerator.generarHojaDeRuta(viajeCompleto);
                                toast.success('Hoja de Ruta generada correctamente');
                              } catch (error) {
                                toast.error('Error generando Hoja de Ruta');
                              }
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              try {
                                ViajeDocumentosGenerator.generarHojaDeRuta(viajeCompleto);
                                toast.success('Descargando Hoja de Ruta...');
                              } catch (error) {
                                toast.error('Error generando PDF');
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Imprimir
                          </Button>
                        </div>
                      </div>
                      
                      {/* Checklist Pre-Viaje */}
                      <div className="p-4 border rounded-lg hover:border-green-300 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Lista de Verificación</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Checklist de seguridad y revisión pre-viaje
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              try {
                                ViajeDocumentosGenerator.generarChecklistPreViaje(viajeCompleto);
                                toast.success('Checklist generado correctamente');
                              } catch (error) {
                                toast.error('Error generando Checklist');
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              try {
                                ViajeDocumentosGenerator.generarChecklistPreViaje(viajeCompleto);
                                toast.success('Descargando Checklist...');
                              } catch (error) {
                                toast.error('Error generando PDF');
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Generar PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="estados" className="mt-0">
              <EstadosViajeManager 
                viaje={viajeData}
                onViajeUpdate={handleViajeUpdate}
              />
            </TabsContent>

            <TabsContent value="editar" className="mt-0">
              <ViajeEditor 
                viaje={viaje}
                onViajeUpdate={handleViajeUpdate}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      {/* Modal de Pre-visualización de Factura */}
      {facturaData && (
        <FacturaPreviewModal
          open={showFacturaPreview}
          onOpenChange={setShowFacturaPreview}
          facturaData={facturaData}
          viajeData={viajeDataSafe}
          onTimbrar={handleTimbrarFactura}
          onCancelar={handleCancelarFactura}
          isTimbrando={isTimbrando}
          isCancelling={isCancelling}
        />
      )}
    </Dialog>
  );
};
