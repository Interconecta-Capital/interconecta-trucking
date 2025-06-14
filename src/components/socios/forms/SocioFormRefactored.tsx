
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSocios } from '@/hooks/useSocios';
import { SocioBasicFields } from './SocioBasicFields';
import { SocioFiscalFields } from './SocioFiscalFields';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocioFormRefactoredProps {
  socioId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SocioFormRefactored({ socioId, onSuccess, onCancel }: SocioFormRefactoredProps) {
  const { socios, crearSocio, actualizarSocio, isCreating, isUpdating } = useSocios();
  const [formData, setFormData] = useState<any>({
    nombre_razon_social: '',
    rfc: '',
    tipo_persona: 'moral',
    telefono: '',
    email: '',
    regimen_fiscal: '',
    uso_cfdi: 'G03',
    estado: 'activo',
    activo: true,
    direccion: {},
    direccion_fiscal: {}
  });

  const [domicilioGeneral, setDomicilioGeneral] = useState<DomicilioUnificado>({
    pais: 'México',
    codigoPostal: '',
    estado: '',
    municipio: '',
    localidad: '',
    colonia: '',
    calle: '',
    numExterior: '',
    numInterior: '',
    referencia: ''
  });

  const [domicilioFiscal, setDomicilioFiscal] = useState<DomicilioUnificado>({
    pais: 'México',
    codigoPostal: '',
    estado: '',
    municipio: '',
    localidad: '',
    colonia: '',
    calle: '',
    numExterior: '',
    numInterior: '',
    referencia: ''
  });

  const [usarMismoDomicilio, setUsarMismoDomicilio] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Función helper para extraer dirección de forma segura
  const extractDireccionSafe = (direccionData: any): DomicilioUnificado => {
    if (!direccionData || typeof direccionData !== 'object') {
      return {
        pais: 'México',
        codigoPostal: '',
        estado: '',
        municipio: '',
        localidad: '',
        colonia: '',
        calle: '',
        numExterior: '',
        numInterior: '',
        referencia: ''
      };
    }

    return {
      pais: (direccionData as any).pais || 'México',
      codigoPostal: (direccionData as any).codigoPostal || '',
      estado: (direccionData as any).estado || '',
      municipio: (direccionData as any).municipio || '',
      localidad: (direccionData as any).localidad || '',
      colonia: (direccionData as any).colonia || '',
      calle: (direccionData as any).calle || '',
      numExterior: (direccionData as any).numExterior || '',
      numInterior: (direccionData as any).numInterior || '',
      referencia: (direccionData as any).referencia || ''
    };
  };

  // Cargar datos si es edición
  useEffect(() => {
    if (socioId && socios.length > 0) {
      const socio = socios.find(s => s.id === socioId);
      if (socio) {
        setFormData(socio);
        
        if (socio.direccion) {
          const direccionGeneralSafe = extractDireccionSafe(socio.direccion);
          setDomicilioGeneral(direccionGeneralSafe);
        }

        if (socio.direccion_fiscal) {
          const direccionFiscalSafe = extractDireccionSafe(socio.direccion_fiscal);
          setDomicilioFiscal(direccionFiscalSafe);
          setUsarMismoDomicilio(false);
        }
      }
    }
  }, [socioId, socios]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDomicilioGeneralChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setDomicilioGeneral(prev => ({ ...prev, [campo]: valor }));
    if (usarMismoDomicilio) {
      setDomicilioFiscal(prev => ({ ...prev, [campo]: valor }));
    }
  };

  const handleDomicilioFiscalChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setDomicilioFiscal(prev => ({ ...prev, [campo]: valor }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_razon_social?.trim()) {
      newErrors.nombre_razon_social = 'El nombre o razón social es requerido';
    }

    if (!formData.rfc?.trim()) {
      newErrors.rfc = 'El RFC es requerido';
    } else if (formData.rfc.length < 10) {
      newErrors.rfc = 'RFC inválido';
    }

    if (!formData.tipo_persona) {
      newErrors.tipo_persona = 'Selecciona el tipo de persona';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const socioData = {
        ...formData,
        direccion: domicilioGeneral,
        direccion_fiscal: usarMismoDomicilio ? domicilioGeneral : domicilioFiscal
      };

      if (socioId) {
        await actualizarSocio({ id: socioId, data: socioData });
      } else {
        await crearSocio(socioData);
      }

      onSuccess?.();
    } catch (error) {
      toast.error('Error al guardar socio');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <SocioBasicFields
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
      />

      <SocioFiscalFields
        formData={formData}
        onFieldChange={handleFieldChange}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Domicilio General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioDomicilioUnificado
            domicilio={domicilioGeneral}
            onDomicilioChange={handleDomicilioGeneralChange}
            camposOpcionales={['numInterior', 'referencia']}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Domicilio Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="usar_mismo_domicilio"
              checked={usarMismoDomicilio}
              onChange={(e) => {
                setUsarMismoDomicilio(e.target.checked);
                if (e.target.checked) {
                  setDomicilioFiscal(domicilioGeneral);
                }
              }}
              className="rounded border-gray-300"
            />
            <label htmlFor="usar_mismo_domicilio" className="text-sm">
              Usar el mismo domicilio general
            </label>
          </div>

          {!usarMismoDomicilio && (
            <FormularioDomicilioUnificado
              domicilio={domicilioFiscal}
              onDomicilioChange={handleDomicilioFiscalChange}
              camposOpcionales={['numInterior', 'referencia']}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Guardando...' : (socioId ? 'Actualizar' : 'Crear Socio')}
        </Button>
      </div>
    </div>
  );
}
