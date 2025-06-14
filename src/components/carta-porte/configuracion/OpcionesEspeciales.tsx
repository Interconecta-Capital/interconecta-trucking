
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { usePaises, useViasEntradaSalida, useConfiguracionesAutotransporte } from '@/hooks/useCatalogosSAT';

interface OpcionesEspecialesProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
}

export function OpcionesEspeciales({ data, onChange }: OpcionesEspecialesProps) {
  const { data: paises, isLoading: loadingPaises } = usePaises();
  const { data: viasEntradaSalida, isLoading: loadingViasEntradaSalida } = useViasEntradaSalida();
  const { data: configuracionesAuto, isLoading: loadingConfiguraciones } = useConfiguracionesAutotransporte();

  console.log('OpcionesEspeciales - Data loaded:', {
    paises: paises?.length || 0,
    viasEntradaSalida: viasEntradaSalida?.length || 0,
    configuracionesAuto: configuracionesAuto?.length || 0,
    loadingPaises,
    loadingViasEntradaSalida,
    loadingConfiguraciones
  });

  const handleTransporteInternacionalChange = (checked: boolean) => {
    console.log('Transporte internacional changed:', checked);
    onChange({ 
      transporteInternacional: checked,
      // Limpiar campos relacionados si se desactiva
      ...(checked ? {} : {
        pais_origen_destino: '',
        via_entrada_salida: ''
      })
    });
  };

  const handleRegistroIstmoChange = (checked: boolean) => {
    console.log('Registro istmo changed:', checked);
    onChange({ registroIstmo: checked });
  };

  const handleEntradaSalidaChange = (value: string) => {
    console.log('Entrada/Salida changed:', value);
    onChange({ entradaSalidaMerc: value });
  };

  const handleViaTransporteChange = (value: string) => {
    console.log('Via transporte changed:', value);
    onChange({ viaTransporte: value });
  };

  const handlePaisOrigenDestinoChange = (value: string) => {
    console.log('Pais origen/destino changed:', value);
    onChange({ pais_origen_destino: value });
  };

  const handleViaEntradaSalidaChange = (value: string) => {
    console.log('Via entrada/salida changed:', value);
    onChange({ via_entrada_salida: value });
  };

  // Ensure transporteInternacional is treated as boolean for the switch
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

      {/* Campos adicionales para transporte internacional */}
      {isTransporteInternacional && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="pais-origen-destino">
              País de Origen/Destino
              {loadingPaises && <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />}
            </Label>
            <Select 
              value={data.pais_origen_destino || ''} 
              onValueChange={handlePaisOrigenDestinoChange}
              disabled={loadingPaises}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPaises ? "Cargando..." : "Selecciona un país..."} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {paises && paises.length > 0 ? (
                  paises.map((pais) => (
                    <SelectItem key={pais.clave_pais} value={pais.clave_pais}>
                      {pais.descripcion}
                    </SelectItem>
                  ))
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="via-entrada-salida">
              Vía de Entrada/Salida
              {loadingViasEntradaSalida && <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />}
            </Label>
            <Select 
              value={data.via_entrada_salida || ''} 
              onValueChange={handleViaEntradaSalidaChange}
              disabled={loadingViasEntradaSalida}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingViasEntradaSalida ? "Cargando..." : "Selecciona..."} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {viasEntradaSalida && viasEntradaSalida.length > 0 ? (
                  viasEntradaSalida.map((via) => (
                    <SelectItem key={via.clave_via} value={via.clave_via}>
                      {via.descripcion}
                    </SelectItem>
                  ))
                ) : null}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
