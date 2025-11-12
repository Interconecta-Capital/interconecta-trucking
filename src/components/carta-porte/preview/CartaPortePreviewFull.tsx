import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Building,
  MapPin,
  Package,
  Truck,
  Users,
  FileText
} from 'lucide-react';
import { SeccionPreview } from './SeccionPreview';
import { RutaVisual } from './RutaVisual';

interface CartaPortePreviewFullProps {
  cartaPorteData: any;
  onVolver: () => void;
  onGenerarXML: () => void;
  onEditarSeccion: (seccion: string) => void;
}

export function CartaPortePreviewFull({
  cartaPorteData,
  onVolver,
  onGenerarXML,
  onEditarSeccion
}: CartaPortePreviewFullProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'configuracion',
    'ubicaciones',
    'mercancias'
  ]);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const calcularCompletitud = () => {
    let total = 0;
    let completos = 0;

    // Configuración
    total++;
    if (cartaPorteData.rfcEmisor && cartaPorteData.rfcReceptor) completos++;

    // Ubicaciones
    total++;
    if (cartaPorteData.ubicaciones?.length >= 2) completos++;

    // Mercancías
    total++;
    if (cartaPorteData.mercancias?.length > 0) completos++;

    // Autotransporte
    total++;
    if (cartaPorteData.autotransporte?.placa_vm) completos++;

    // Figuras
    total++;
    if (cartaPorteData.figuras?.length > 0) completos++;

    return Math.round((completos / total) * 100);
  };

  const progreso = calcularCompletitud();
  const todoCompleto = progreso === 100;

  const InfoRow = ({ label, value, tooltip }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header con Progreso */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Vista Previa Completa</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Revisa todos los datos antes de generar el XML
              </p>
            </div>
            {todoCompleto ? (
              <CheckCircle className="h-12 w-12 text-success" />
            ) : (
              <AlertCircle className="h-12 w-12 text-warning" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Completitud del Documento
              </span>
              <span className="text-sm font-bold text-primary">{progreso}%</span>
            </div>
            <Progress value={progreso} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Sección: Configuración General */}
      <SeccionPreview
        titulo="Emisor y Receptor"
        icon={Building}
        estado={cartaPorteData.rfcEmisor && cartaPorteData.rfcReceptor ? 'completo' : 'incompleto'}
        isExpanded={expandedSections.includes('configuracion')}
        onToggle={() => toggleSection('configuracion')}
        onEditar={() => onEditarSeccion('configuracion')}
      >
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              ¿Quién envía?
            </h4>
            <InfoRow label="RFC" value={cartaPorteData.rfcEmisor} />
            <InfoRow label="Nombre" value={cartaPorteData.nombreEmisor} />
            <InfoRow label="Régimen Fiscal" value={cartaPorteData.regimenFiscalEmisor} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              ¿Quién recibe?
            </h4>
            <InfoRow label="RFC" value={cartaPorteData.rfcReceptor} />
            <InfoRow label="Nombre" value={cartaPorteData.nombreReceptor} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Tipo de Documento
            </h4>
            <InfoRow label="Tipo de CFDI" value={cartaPorteData.tipoCfdi} />
            <InfoRow label="Versión Carta Porte" value={cartaPorteData.cartaPorteVersion} />
          </div>
        </div>
      </SeccionPreview>

      {/* Sección: Ruta del Viaje */}
      <SeccionPreview
        titulo="Ruta del Viaje"
        icon={MapPin}
        estado={cartaPorteData.ubicaciones?.length >= 2 ? 'completo' : 'incompleto'}
        isExpanded={expandedSections.includes('ubicaciones')}
        onToggle={() => toggleSection('ubicaciones')}
        onEditar={() => onEditarSeccion('ubicaciones')}
      >
        <RutaVisual ubicaciones={cartaPorteData.ubicaciones || []} />
      </SeccionPreview>

      {/* Sección: Mercancías */}
      <SeccionPreview
        titulo="¿Qué se transporta?"
        icon={Package}
        estado={cartaPorteData.mercancias?.length > 0 ? 'completo' : 'incompleto'}
        isExpanded={expandedSections.includes('mercancias')}
        onToggle={() => toggleSection('mercancias')}
        onEditar={() => onEditarSeccion('mercancias')}
      >
        <div className="space-y-3">
          {cartaPorteData.mercancias?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay mercancías registradas
            </p>
          ) : (
            cartaPorteData.mercancias?.map((mercancia: any, index: number) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground">
                        {mercancia.descripcion}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clave: {mercancia.bienes_transp}
                      </p>
                    </div>
                    <Badge variant="secondary">{mercancia.cantidad} unidades</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <InfoRow label="Peso" value={`${mercancia.peso_kg} kg`} />
                    <InfoRow label="Valor" value={`$${mercancia.valor_mercancia?.toLocaleString() || 0}`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SeccionPreview>

      {/* Sección: Autotransporte */}
      <SeccionPreview
        titulo="Vehículo de Transporte"
        icon={Truck}
        estado={cartaPorteData.autotransporte?.placa_vm ? 'completo' : 'incompleto'}
        isExpanded={expandedSections.includes('autotransporte')}
        onToggle={() => toggleSection('autotransporte')}
        onEditar={() => onEditarSeccion('autotransporte')}
      >
        {cartaPorteData.autotransporte?.placa_vm ? (
          <div className="space-y-3">
            <InfoRow label="Placa" value={cartaPorteData.autotransporte.placa_vm} />
            <InfoRow label="Año" value={cartaPorteData.autotransporte.anio_modelo_vm} />
            <InfoRow label="Configuración" value={cartaPorteData.autotransporte.config_vehicular} />
            <InfoRow label="Permiso SCT" value={cartaPorteData.autotransporte.perm_sct} />
            <InfoRow label="Número Permiso" value={cartaPorteData.autotransporte.num_permiso_sct} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay vehículo configurado
          </p>
        )}
      </SeccionPreview>

      {/* Sección: Figuras del Transporte */}
      <SeccionPreview
        titulo="Operadores y Responsables"
        icon={Users}
        estado={cartaPorteData.figuras?.length > 0 ? 'completo' : 'parcial'}
        isExpanded={expandedSections.includes('figuras')}
        onToggle={() => toggleSection('figuras')}
        onEditar={() => onEditarSeccion('figuras')}
      >
        {cartaPorteData.figuras?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay operadores registrados
          </p>
        ) : (
          <div className="space-y-3">
            {cartaPorteData.figuras?.map((figura: any, index: number) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-foreground">
                      {figura.nombre_figura || figura.nombreFigura}
                    </h4>
                    <Badge>{figura.tipo_figura || figura.tipoFigura}</Badge>
                  </div>
                  <div className="space-y-1">
                    <InfoRow label="RFC" value={figura.rfc_figura || figura.rfcFigura} />
                    {figura.num_licencia && (
                      <InfoRow label="Licencia" value={figura.num_licencia} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SeccionPreview>

      {/* Acciones Finales */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onVolver}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Editar
          </Button>

          <Button
            onClick={onGenerarXML}
            disabled={!todoCompleto}
            size="lg"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {todoCompleto ? 'Generar Carta Porte' : `Completa el ${progreso}% restante`}
          </Button>
        </div>
      </div>
    </div>
  );
}
