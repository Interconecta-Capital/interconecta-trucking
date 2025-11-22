// ============================================
// FASE 4: Modal de Pre-visualización Carta Porte
// ISO 27001 A.10.1.1: Políticas de criptografía
// ============================================

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Truck, MapPin, Package, FileText, Zap, X } from 'lucide-react';

interface CartaPortePreviewModalProps {
  open: boolean;
  onClose: () => void;
  cartaPorteData: any;
  viajeData: any;
  nombreEmpresa?: string;
  onTimbrar: () => Promise<void>;
  isTimbrand: boolean;
}

export function CartaPortePreviewModal({
  open,
  onClose,
  cartaPorteData,
  viajeData,
  nombreEmpresa,
  onTimbrar,
  isTimbrand
}: CartaPortePreviewModalProps) {
  
  const trackingData = viajeData?.tracking_data || {};
  const ubicaciones = trackingData.ubicaciones || {};
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Truck className="h-6 w-6 text-blue-600" />
            Pre-visualización Carta Porte
          </DialogTitle>
        </DialogHeader>

        {/* Banner con nombre de empresa - ISO 27001 A.18.1.4 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">{nombreEmpresa || 'Su Empresa'}</h2>
          <p className="text-blue-100 mt-1">RFC: {cartaPorteData?.rfc_emisor || 'N/A'}</p>
        </div>

        {/* Información del Documento */}
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Serie-Folio</p>
              <p className="text-foreground font-mono">
                {cartaPorteData?.serie || 'N/A'}-{cartaPorteData?.folio || 'N/A'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Versión</p>
              <p className="text-foreground">CFDI 4.0 - Carta Porte 3.1</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Estado</p>
              <p className="text-foreground capitalize">{cartaPorteData?.status || 'Borrador'}</p>
            </div>
          </div>
        </Card>

        {/* Ubicaciones - ISO 27001 A.12.1.1 */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Ubicaciones
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Origen */}
            <Card className="p-4 border-l-4 border-l-green-500">
              <p className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                ORIGEN
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong className="text-foreground">Dirección:</strong> {ubicaciones.origen?.domicilio?.calle || 'N/A'} {ubicaciones.origen?.domicilio?.numExterior || ubicaciones.origen?.domicilio?.num_exterior || ''}</p>
                <p><strong className="text-foreground">Colonia:</strong> {ubicaciones.origen?.domicilio?.colonia || 'N/A'}</p>
                <p><strong className="text-foreground">CP:</strong> {ubicaciones.origen?.domicilio?.codigo_postal || ubicaciones.origen?.domicilio?.codigoPostal || 'N/A'}</p>
                <p><strong className="text-foreground">Municipio:</strong> {ubicaciones.origen?.domicilio?.municipio || 'N/A'}</p>
                <p><strong className="text-foreground">Estado:</strong> {ubicaciones.origen?.domicilio?.estado || 'N/A'}</p>
                {ubicaciones.origen?.fechaHoraSalidaLlegada && (
                  <p className="pt-2 border-t"><strong className="text-foreground">Fecha/Hora:</strong> {new Date(ubicaciones.origen.fechaHoraSalidaLlegada).toLocaleString('es-MX')}</p>
                )}
              </div>
            </Card>

            {/* Destino */}
            <Card className="p-4 border-l-4 border-l-blue-500">
              <p className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                DESTINO
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong className="text-foreground">Dirección:</strong> {ubicaciones.destino?.domicilio?.calle || 'N/A'} {ubicaciones.destino?.domicilio?.numExterior || ubicaciones.destino?.domicilio?.num_exterior || ''}</p>
                <p><strong className="text-foreground">Colonia:</strong> {ubicaciones.destino?.domicilio?.colonia || 'N/A'}</p>
                <p><strong className="text-foreground">CP:</strong> {ubicaciones.destino?.domicilio?.codigo_postal || ubicaciones.destino?.domicilio?.codigoPostal || 'N/A'}</p>
                <p><strong className="text-foreground">Municipio:</strong> {ubicaciones.destino?.domicilio?.municipio || 'N/A'}</p>
                <p><strong className="text-foreground">Estado:</strong> {ubicaciones.destino?.domicilio?.estado || 'N/A'}</p>
                {ubicaciones.destino?.fechaHoraSalidaLlegada && (
                  <p className="pt-2 border-t"><strong className="text-foreground">Fecha/Hora:</strong> {new Date(ubicaciones.destino.fechaHoraSalidaLlegada).toLocaleString('es-MX')}</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Mercancías */}
        {trackingData.mercancias && trackingData.mercancias.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-orange-600" />
              Mercancías ({trackingData.mercancias.length})
            </h3>
            
            {trackingData.mercancias.map((merc: any, idx: number) => (
              <Card key={idx} className="p-4 bg-muted/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-muted-foreground">Descripción</p>
                    <p className="text-foreground">{merc.descripcion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Cantidad</p>
                    <p className="text-foreground">{merc.cantidad || 0} {merc.clave_unidad || 'UN'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Peso</p>
                    <p className="text-foreground">{merc.peso_kg || 0} kg</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Valor</p>
                    <p className="text-foreground">
                      ${merc.valor_mercancia?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'} MXN
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Autotransporte - ISO 27001 A.9.2.1 */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-blue-600" />
            Autotransporte
          </h3>
          
          <Card className="p-4 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground mb-2">Vehículo</p>
                <div className="space-y-1">
                  <p className="text-foreground"><strong>Placas:</strong> {trackingData.vehiculo?.placa || 'N/A'}</p>
                  <p className="text-foreground"><strong>Modelo:</strong> {trackingData.vehiculo?.modelo || 'N/A'}</p>
                  <p className="text-foreground"><strong>Marca:</strong> {trackingData.vehiculo?.marca || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground mb-2">Conductor</p>
                <div className="space-y-1">
                  <p className="text-foreground"><strong>Nombre:</strong> {trackingData.conductor?.nombre || 'N/A'} {trackingData.conductor?.apellido || ''}</p>
                  <p className="text-foreground"><strong>RFC:</strong> {trackingData.conductor?.rfc || 'N/A'}</p>
                  <p className="text-foreground"><strong>Licencia:</strong> {trackingData.conductor?.num_licencia || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isTimbrand}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={onTimbrar}
            disabled={isTimbrand}
          >
            {isTimbrand ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Timbrando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Timbrar Carta Porte
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
