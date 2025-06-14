
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CartaPorteData } from '@/types/cartaPorte';
import { usePaises, useViasEntradaSalida, useConfiguracionesAutotransporte } from '@/hooks/useCatalogosSAT';

interface OpcionesEspecialesCorregidoProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
}

export function OpcionesEspecialesCorregido({ data, onChange }: OpcionesEspecialesCorregidoProps) {
  const { data: paises, isLoading: loadingPaises, error: errorPaises } = usePaises();
  const { data: viasEntradaSalida, isLoading: loadingViasEntradaSalida, error: errorVias } = useViasEntradaSalida();
  const { data: configuracionesAuto, isLoading: loadingConfiguraciones, error: errorConfiguraciones } = useConfiguracionesAutotransporte();

  console.log('OpcionesEspeciales - Estado actual:', {
    entradaSalidaMerc: data.entradaSalidaMerc,
    viaTransporte: data.viaTransporte,
    transporteInternacional: data.transporteInternacional,
    pais_origen_destino: data.pais_origen_destino,
    via_entrada_salida: data.via_entrada_salida
  });

  const handleTransporteInternacionalChange = (checked: boolean) => {
    console.log('Cambiando transporte internacional:', checked);
    const updateData: Partial<CartaPorteData> = { 
      transporteInternacional: checked
    };
    
    if (!checked) {
      updateData.pais_origen_destino = '';
      updateData.via_entrada_salida = '';
    }
    
    console.log('Enviando cambios:', updateData);
    onChange(updateData);
  };

  const handleRegistroIstmoChange = (checked: boolean) => {
    console.log('Cambiando registro istmo:', checked);
    onChange({ registroIstmo: checked });
  };

  const handleEntradaSalidaChange = (value: string) => {
    console.log('Cambiando entrada/salida de:', data.entradaSalidaMerc, 'a:', value);
    onChange({ entradaSalidaMerc: value });
  };

  const handleViaTransporteChange = (value: string) => {
    console.log('Cambiando vía transporte de:', data.viaTransporte, 'a:', value);
    onChange({ viaTransporte: value });
  };

  const handlePaisOrigenDestinoChange = (value: string) => {
    console.log('Cambiando país origen/destino de:', data.pais_origen_destino, 'a:', value);
    onChange({ pais_origen_destino: value });
  };

  const handleViaEntradaSalidaChange = (value: string) => {
    console.log('Cambiando vía entrada/salida de:', data.via_entrada_salida, 'a:', value);
    onChange({ via_entrada_salida: value });
  };

  const isTransporteInternacional = Boolean(data.transporteInternacional);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="transporte-internacional"
              checked={isTransporteInternacional}
              onCheckedChange={handleTransporteInternacionalChange}
            />
            <Label htmlFor="transporte-internacional">
              Transporte Internacional
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="registro-istmo"
              checked={Boolean(data.registroIstmo)}
              onCheckedChange={handleRegistroIstmoChange}
            />
            <Label htmlFor="registro-istmo">
              Registro Istmo
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="entrada-salida">Entrada/Salida de Mercancías</Label>
            <Select 
              value={data.entradaSalidaMerc || ''} 
              onValueChange={handleEntradaSalidaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Salida">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="via-transporte">
              Vía de Transporte
              {loadingConfiguraciones && <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />}
            </Label>
            {errorConfiguraciones && (
              <Alert variant="destructive" className="mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error cargando configuraciones de transporte</AlertDescription>
              </Alert>
            )}
            <Select 
              value={data.viaTransporte || ''} 
              onValueChange={handleViaTransporteChange}
              disabled={loadingConfiguraciones}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingConfiguraciones ? "Cargando..." : "Selecciona..."} />
              </SelectTrigger>
              <SelectContent>
                {configuracionesAuto && configuracionesAuto.length > 0 ? (
                  configuracionesAuto.map((config) => (
                    <SelectItem key={config.clave_config} value={config.clave_config}>
                      {config.descripcion}
                    </SelectItem>
                  ))
                ) : !loadingConfiguraciones ? (
                  <>
                    <SelectItem value="01">Autotransporte</SelectItem>
                    <SelectItem value="02">Marítimo</SelectItem>
                    <SelectItem value="03">Aéreo</SelectItem>
                    <SelectItem value="04">Ferroviario</SelectItem>
                    <SelectItem value="05">Ducto</SelectItem>
                  </>
                ) : null}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isTransporteInternacional && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="pais-origen-destino">
              País de Origen/Destino
              {loadingPaises && <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />}
            </Label>
            {errorPaises && (
              <Alert variant="destructive" className="mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error cargando países</AlertDescription>
              </Alert>
            )}
            {!loadingPaises && (!paises || paises.length === 0) && (
              <Alert className="mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay países disponibles en el catálogo</AlertDescription>
              </Alert>
            )}
            <Select 
              value={data.pais_origen_destino || ''} 
              onValueChange={handlePaisOrigenDestinoChange}
              disabled={loadingPaises || !paises || paises.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPaises ? "Cargando..." : "Selecciona un país..."} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {paises && paises.length > 0 && paises.map((pais) => (
                  <SelectItem key={pais.clave_pais} value={pais.clave_pais}>
                    {pais.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="via-entrada-salida">
              Vía de Entrada/Salida
              {loadingViasEntradaSalida && <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />}
            </Label>
            {errorVias && (
              <Alert variant="destructive" className="mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error cargando vías de entrada/salida</AlertDescription>
              </Alert>
            )}
            {!loadingViasEntradaSalida && (!viasEntradaSalida || viasEntradaSalida.length === 0) && (
              <Alert className="mt-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay vías disponibles en el catálogo</AlertDescription>
              </Alert>
            )}
            <Select 
              value={data.via_entrada_salida || ''} 
              onValueChange={handleViaEntradaSalidaChange}
              disabled={loadingViasEntradaSalida || !viasEntradaSalida || viasEntradaSalida.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingViasEntradaSalida ? "Cargando..." : "Selecciona..."} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {viasEntradaSalida && viasEntradaSalida.length > 0 && viasEntradaSalida.map((via) => (
                  <SelectItem key={via.clave_via} value={via.clave_via}>
                    {via.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
