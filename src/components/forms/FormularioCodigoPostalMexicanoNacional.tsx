
import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle, Loader2, AlertCircle, Home, Search, Database } from 'lucide-react';
import { useCodigoPostalMexicanoNacional, DireccionInfo } from '@/hooks/useCodigoPostalMexicanoNacional';

interface DatosDomicilio {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad: string;
  colonia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  referencia: string;
  domicilioCompleto: string;
}

interface FormularioCodigoPostalMexicanoNacionalProps {
  onDomicilioChange?: (domicilio: DatosDomicilio) => void;
  onDomicilioCompleto?: (domicilio: DatosDomicilio) => void;
  valorInicial?: Partial<DatosDomicilio>;
  mostrarPreview?: boolean;
  className?: string;
}

export const FormularioCodigoPostalMexicanoNacional: React.FC<FormularioCodigoPostalMexicanoNacionalProps> = ({
  onDomicilioChange,
  onDomicilioCompleto,
  valorInicial = {},
  mostrarPreview = true,
  className = ''
}) => {
  const {
    direccionInfo,
    loading,
    error,
    sugerencias,
    buscarConDebounce,
    usarSugerencia
  } = useCodigoPostalMexicanoNacional();

  // Estado del formulario
  const [formData, setFormData] = useState<DatosDomicilio>({
    codigoPostal: valorInicial.codigoPostal || '',
    estado: valorInicial.estado || '',
    municipio: valorInicial.municipio || '',
    localidad: valorInicial.localidad || '',
    colonia: valorInicial.colonia || '',
    calle: valorInicial.calle || '',
    numeroExterior: valorInicial.numeroExterior || '',
    numeroInterior: valorInicial.numeroInterior || '',
    referencia: valorInicial.referencia || '',
    domicilioCompleto: ''
  });

  // Estados para el filtro de colonias
  const [filtroColonia, setFiltroColonia] = useState('');
  const [coloniasFiltradas, setColoniasFiltradas] = useState(direccionInfo?.colonias || []);

  // Filtrar colonias cuando cambie el filtro o la dirección
  useEffect(() => {
    if (direccionInfo?.colonias) {
      if (filtroColonia.trim() === '') {
        setColoniasFiltradas(direccionInfo.colonias);
      } else {
        const filtradas = direccionInfo.colonias.filter(colonia =>
          colonia.nombre.toLowerCase().includes(filtroColonia.toLowerCase()) ||
          colonia.tipo.toLowerCase().includes(filtroColonia.toLowerCase())
        );
        setColoniasFiltradas(filtradas);
      }
    }
  }, [direccionInfo?.colonias, filtroColonia]);

  // Generar domicilio completo formateado
  const generarDomicilioCompleto = useCallback((datos: DatosDomicilio): string => {
    const partes = [];
    
    if (datos.calle) partes.push(datos.calle);
    if (datos.numeroExterior) partes.push(`#${datos.numeroExterior}`);
    if (datos.numeroInterior) partes.push(`Int. ${datos.numeroInterior}`);
    if (datos.colonia) partes.push(`Col. ${datos.colonia}`);
    if (datos.municipio) partes.push(datos.municipio);
    if (datos.estado) partes.push(datos.estado);
    if (datos.codigoPostal) partes.push(`CP ${datos.codigoPostal}`);
    
    return partes.join(', ');
  }, []);

  // Actualizar campo del formulario
  const actualizarCampo = useCallback((campo: keyof DatosDomicilio, valor: string) => {
    setFormData(prev => {
      const nuevosDatos = { ...prev, [campo]: valor };
      nuevosDatos.domicilioCompleto = generarDomicilioCompleto(nuevosDatos);
      
      onDomicilioChange?.(nuevosDatos);
      
      if (nuevosDatos.codigoPostal && nuevosDatos.estado && nuevosDatos.municipio && 
          nuevosDatos.colonia && nuevosDatos.calle && nuevosDatos.numeroExterior) {
        console.log('[DOMICILIO_NACIONAL_COMPLETO]', nuevosDatos);
        onDomicilioCompleto?.(nuevosDatos);
      }
      
      return nuevosDatos;
    });
  }, [onDomicilioChange, onDomicilioCompleto, generarDomicilioCompleto]);

  // Manejar cambio de código postal
  const handleCodigoPostalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 5);
    actualizarCampo('codigoPostal', valor);
    
    if (valor.length === 5) {
      buscarConDebounce(valor);
    } else {
      actualizarCampo('estado', '');
      actualizarCampo('municipio', '');
      actualizarCampo('localidad', '');
      actualizarCampo('colonia', '');
      setFiltroColonia('');
    }
  }, [actualizarCampo, buscarConDebounce]);

  // Actualizar datos cuando se obtiene información del CP
  useEffect(() => {
    if (direccionInfo) {
      actualizarCampo('estado', direccionInfo.estado);
      actualizarCampo('municipio', direccionInfo.municipio);
      actualizarCampo('localidad', direccionInfo.localidad);
      actualizarCampo('colonia', '');
      setFiltroColonia('');
    }
  }, [direccionInfo, actualizarCampo]);

  // Validar si el formulario está completo
  const esFormularioValido = useCallback(() => {
    return formData.codigoPostal.length === 5 &&
           formData.estado &&
           formData.municipio &&
           formData.colonia &&
           formData.calle &&
           formData.numeroExterior;
  }, [formData]);

  // Manejar selección de sugerencia
  const handleSugerencia = (cp: string) => {
    actualizarCampo('codigoPostal', cp);
    usarSugerencia(cp);
  };

  // Manejar selección de colonia
  const handleColoniaChange = (coloniaNombre: string) => {
    actualizarCampo('colonia', coloniaNombre);
    setFiltroColonia('');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Domicilio Mexicano Nacional
            <span className="text-sm text-muted-foreground font-normal">
              (Base de datos completa de México)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Código Postal */}
          <div className="space-y-2">
            <Label htmlFor="codigo-postal" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Código Postal *
            </Label>
            
            <div className="relative">
              <Input
                id="codigo-postal"
                type="text"
                value={formData.codigoPostal}
                onChange={handleCodigoPostalChange}
                placeholder="Ej: 06600"
                maxLength={5}
                disabled={loading}
                className={`${
                  error ? 'border-red-500' : 
                  direccionInfo ? 'border-green-500' : ''
                } ${loading ? 'opacity-75' : ''}`}
              />
              
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                </div>
              )}
              
              {direccionInfo && !loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>

            {/* Error con sugerencias */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <span>{error}</span>
                    {sugerencias.length > 0 && (
                      <div>
                        <p className="text-xs mb-2">Códigos postales similares:</p>
                        <div className="flex flex-wrap gap-2">
                          {sugerencias.map((sugerencia) => (
                            <Button
                              key={sugerencia.codigo}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSugerencia(sugerencia.codigo)}
                              className="h-8 px-2 py-1 text-xs"
                            >
                              {sugerencia.codigo}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Información de éxito */}
            {direccionInfo && !loading && (
              <Alert>
                <Database className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ✓ {direccionInfo.municipio}, {direccionInfo.estado} - {direccionInfo.totalColonias} colonias disponibles
                  <span className="text-xs ml-2 opacity-75">
                    (Fuente: {direccionInfo.fuente === 'database_nacional' ? 'Base Nacional' : 'API Externa'})
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Estado y Municipio (solo lectura) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Input
                value={formData.estado}
                placeholder="Se autocompleta con el CP"
                className="bg-gray-50"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>Municipio *</Label>
              <Input
                value={formData.municipio}
                placeholder="Se autocompleta con el CP"
                className="bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Localidad y Colonia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Localidad</Label>
              <Input
                value={formData.localidad}
                placeholder="Se autocompleta con el CP"
                className="bg-gray-50"
                readOnly
              />
            </div>

            {/* Selector de Colonia MEJORADO con todas las colonias */}
            {direccionInfo && direccionInfo.colonias.length > 0 && (
              <div className="space-y-2">
                <Label>
                  Colonia *
                  <span className="text-sm text-muted-foreground ml-2">
                    ({coloniasFiltradas.length} de {direccionInfo.totalColonias} mostradas)
                  </span>
                </Label>
                
                {/* Filtro de búsqueda para colonias */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar colonia..."
                    value={filtroColonia}
                    onChange={(e) => setFiltroColonia(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select 
                  value={formData.colonia} 
                  onValueChange={handleColoniaChange}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecciona una colonia" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50 max-h-80">
                    {coloniasFiltradas.length > 0 ? (
                      coloniasFiltradas.map((coloniaObj, index) => (
                        <SelectItem 
                          key={`${coloniaObj.nombre}-${index}`} 
                          value={coloniaObj.nombre}
                          className="cursor-pointer hover:bg-accent"
                        >
                          <div className="flex flex-col py-1">
                            <span className="font-medium">{coloniaObj.nombre}</span>
                            <span className="text-xs text-muted-foreground">
                              {coloniaObj.tipo}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No se encontraron colonias con ese filtro
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {filtroColonia && (
                  <p className="text-xs text-muted-foreground">
                    Filtro activo: "{filtroColonia}" - {coloniasFiltradas.length} resultado(s)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Calle y Números */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Calle *</Label>
              <Input
                value={formData.calle}
                onChange={(e) => actualizarCampo('calle', e.target.value)}
                placeholder="Nombre de la calle"
              />
            </div>

            <div className="space-y-2">
              <Label>Número Exterior *</Label>
              <Input
                value={formData.numeroExterior}
                onChange={(e) => actualizarCampo('numeroExterior', e.target.value)}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label>Número Interior</Label>
              <Input
                value={formData.numeroInterior}
                onChange={(e) => actualizarCampo('numeroInterior', e.target.value)}
                placeholder="A, B, 1, 2..."
              />
            </div>
          </div>

          {/* Referencias */}
          <div className="space-y-2">
            <Label>Referencias</Label>
            <Input
              value={formData.referencia}
              onChange={(e) => actualizarCampo('referencia', e.target.value)}
              placeholder="Entre calles, cerca de..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview del Domicilio Completo */}
      {mostrarPreview && formData.domicilioCompleto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4" />
              Vista Previa del Domicilio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-sm font-mono">{formData.domicilioCompleto}</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {esFormularioValido() ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Domicilio completo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">Faltan campos obligatorios</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormularioCodigoPostalMexicanoNacional;
export type { DatosDomicilio };
