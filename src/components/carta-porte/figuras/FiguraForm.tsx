
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { useFigurasTransporte, useEstados } from '@/hooks/useCatalogos';
import { RFCValidator } from '@/utils/rfcValidation';
import { LicenseValidator } from '@/utils/licenseValidation';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';

interface FiguraFormProps {
  figura?: FiguraTransporte;
  onSave: (figura: FiguraTransporte) => void;
  onCancel: () => void;
}

export function FiguraForm({ figura, onSave, onCancel }: FiguraFormProps) {
  const [formData, setFormData] = useState<FiguraTransporte>({
    tipo_figura: '',
    rfc_figura: '',
    nombre_figura: '',
    num_licencia: '',
    residencia_fiscal_figura: 'MEX',
    num_reg_id_trib_figura: '',
    domicilio: {
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      localidad: '',
      municipio: '',
      estado: '',
      pais: 'MEX',
      codigo_postal: '',
    },
  });
  
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string[]>>({});
  const { data: figuras } = useFigurasTransporte();
  const { data: estados } = useEstados();

  useEffect(() => {
    if (figura) {
      setFormData({
        ...figura,
        domicilio: figura.domicilio || {
          calle: '',
          numero_exterior: '',
          numero_interior: '',
          colonia: '',
          localidad: '',
          municipio: '',
          estado: '',
          pais: 'MEX',
          codigo_postal: '',
        },
      });
    }
  }, [figura]);

  const handleTipoFiguraChange = (tipo: any) => {
    setFormData(prev => ({ 
      ...prev, 
      tipo_figura: tipo.clave,
      num_licencia: tipo.clave === '01' ? prev.num_licencia : '' // Limpiar licencia si no es operador
    }));
  };

  const handleRFCChange = (value: string) => {
    const rfcFormateado = RFCValidator.formatearRFC(value);
    const validacion = RFCValidator.validarRFC(rfcFormateado);
    
    setErroresValidacion(prev => ({
      ...prev,
      rfc_figura: validacion.errores
    }));

    setFormData(prev => ({ ...prev, rfc_figura: rfcFormateado }));
  };

  const handleLicenciaChange = (value: string) => {
    const licenciaFormateada = LicenseValidator.formatearLicencia(value);
    const validacion = LicenseValidator.validarLicencia(licenciaFormateada, formData.tipo_figura);
    
    setErroresValidacion(prev => ({
      ...prev,
      num_licencia: validacion.errores
    }));

    setFormData(prev => ({ ...prev, num_licencia: licenciaFormateada }));
  };

  const handleEstadoChange = (estado: any) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio!,
        estado: estado.clave
      }
    }));
  };

  const handleCodigoPostalChange = (cpData: any) => {
    if (cpData) {
      setFormData(prev => ({
        ...prev,
        domicilio: {
          ...prev.domicilio!,
          codigo_postal: cpData.codigo_postal,
          estado: cpData.estado_clave,
          municipio: cpData.municipio_clave,
        }
      }));
    }
  };

  const handleDomicilioChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio!,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const errores: Record<string, string[]> = {};
    
    if (!formData.tipo_figura) {
      errores.tipo_figura = ['El tipo de figura es requerido'];
    }

    const rfcValidacion = RFCValidator.validarRFC(formData.rfc_figura);
    if (!rfcValidacion.esValido) {
      errores.rfc_figura = rfcValidacion.errores;
    }

    if (!formData.nombre_figura) {
      errores.nombre_figura = ['El nombre de la figura es requerido'];
    }

    const licenciaValidacion = LicenseValidator.validarLicencia(formData.num_licencia || '', formData.tipo_figura);
    if (!licenciaValidacion.esValida) {
      errores.num_licencia = licenciaValidacion.errores;
    }

    // Validar domicilio básico
    if (!formData.domicilio?.codigo_postal) {
      errores.codigo_postal = ['El código postal es requerido'];
    }

    if (!formData.domicilio?.calle) {
      errores.calle = ['La calle es requerida'];
    }

    if (!formData.domicilio?.numero_exterior) {
      errores.numero_exterior = ['El número exterior es requerido'];
    }

    setErroresValidacion(errores);

    if (Object.keys(errores).length === 0) {
      onSave(formData);
    }
  };

  const esOperador = formData.tipo_figura === '01';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {figura ? 'Editar Figura del Transporte' : 'Agregar Figura del Transporte'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h4 className="font-medium">Información de la Figura</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Figura *</Label>
                <CatalogoSelector
                  items={figuras || []}
                  value={formData.tipo_figura}
                  onSelect={handleTipoFiguraChange}
                  placeholder="Seleccionar tipo de figura..."
                  searchPlaceholder="Buscar figura..."
                  displayFormat={(item) => `${item.clave} - ${item.descripcion}`}
                />
                {erroresValidacion.tipo_figura?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                ))}
              </div>

              <div>
                <Label htmlFor="rfc_figura">RFC *</Label>
                <Input
                  id="rfc_figura"
                  value={formData.rfc_figura}
                  onChange={(e) => handleRFCChange(e.target.value)}
                  placeholder="RFC de la figura"
                  className={erroresValidacion.rfc_figura?.length ? 'border-red-500' : ''}
                />
                {erroresValidacion.rfc_figura?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre_figura">Nombre/Razón Social *</Label>
                <Input
                  id="nombre_figura"
                  value={formData.nombre_figura}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_figura: e.target.value }))}
                  placeholder="Nombre completo o razón social"
                  className={erroresValidacion.nombre_figura?.length ? 'border-red-500' : ''}
                />
                {erroresValidacion.nombre_figura?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                ))}
              </div>

              {esOperador && (
                <div>
                  <Label htmlFor="num_licencia">Número de Licencia *</Label>
                  <Input
                    id="num_licencia"
                    value={formData.num_licencia || ''}
                    onChange={(e) => handleLicenciaChange(e.target.value)}
                    placeholder="Número de licencia de conducir"
                    className={erroresValidacion.num_licencia?.length ? 'border-red-500' : ''}
                  />
                  {erroresValidacion.num_licencia?.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-4">
            <h4 className="font-medium">Domicilio</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Código Postal *</Label>
                <CodigoPostalInput
                  value={formData.domicilio?.codigo_postal || ''}
                  onChange={handleCodigoPostalChange}
                />
                {erroresValidacion.codigo_postal?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                ))}
              </div>

              <div>
                <Label>Estado</Label>
                <CatalogoSelector
                  items={estados || []}
                  value={formData.domicilio?.estado || ''}
                  onSelect={handleEstadoChange}
                  placeholder="Seleccionar estado..."
                  searchPlaceholder="Buscar estado..."
                  displayFormat={(item) => item.descripcion}
                />
              </div>

              <div>
                <Label htmlFor="municipio">Municipio</Label>
                <Input
                  id="municipio"
                  value={formData.domicilio?.municipio || ''}
                  onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
                  placeholder="Municipio"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calle">Calle *</Label>
                <Input
                  id="calle"
                  value={formData.domicilio?.calle || ''}
                  onChange={(e) => handleDomicilioChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                  className={erroresValidacion.calle?.length ? 'border-red-500' : ''}
                />
                {erroresValidacion.calle?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                ))}
              </div>

              <div>
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  value={formData.domicilio?.colonia || ''}
                  onChange={(e) => handleDomicilioChange('colonia', e.target.value)}
                  placeholder="Colonia"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero_exterior">Número Exterior *</Label>
                <Input
                  id="numero_exterior"
                  value={formData.domicilio?.numero_exterior || ''}
                  onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
                  placeholder="Número exterior"
                  className={erroresValidacion.numero_exterior?.length ? 'border-red-500' : ''}
                />
                {erroresValidacion.numero_exterior?.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                ))}
              </div>

              <div>
                <Label htmlFor="numero_interior">Número Interior</Label>
                <Input
                  id="numero_interior"
                  value={formData.domicilio?.numero_interior || ''}
                  onChange={(e) => handleDomicilioChange('numero_interior', e.target.value)}
                  placeholder="Número interior"
                />
              </div>

              <div>
                <Label htmlFor="localidad">Localidad</Label>
                <Input
                  id="localidad"
                  value={formData.domicilio?.localidad || ''}
                  onChange={(e) => handleDomicilioChange('localidad', e.target.value)}
                  placeholder="Localidad"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">
              {figura ? 'Actualizar' : 'Agregar'} Figura
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
