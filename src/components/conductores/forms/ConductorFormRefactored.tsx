
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useConductores } from '@/hooks/useConductores';
import { ConductorBasicFields } from './ConductorBasicFields';
import { ConductorLicenciaFields } from './ConductorLicenciaFields';
import { ConductorSCTFields } from './ConductorSCTFields';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ConductorFormRefactoredProps {
  conductorId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ConductorFormRefactored({ conductorId, onSuccess, onCancel }: ConductorFormRefactoredProps) {
  const { conductores, crearConductor, actualizarConductor, isCreating, isUpdating } = useConductores();
  const [formData, setFormData] = useState<any>({
    nombre: '',
    rfc: '',
    curp: '',
    telefono: '',
    email: '',
    num_licencia: '',
    tipo_licencia: '',
    vigencia_licencia: '',
    operador_sct: false,
    residencia_fiscal: 'MEX',
    num_reg_id_trib: '',
    estado: 'disponible',
    activo: true,
    direccion: {}
  });

  const [domicilio, setDomicilio] = useState<DomicilioUnificado>({
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
    if (conductorId && conductores.length > 0) {
      const conductor = conductores.find(c => c.id === conductorId);
      if (conductor) {
        setFormData(conductor);
        if (conductor.direccion) {
          const direccionSafe = extractDireccionSafe(conductor.direccion);
          setDomicilio(direccionSafe);
        }
      }
    }
  }, [conductorId, conductores]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDomicilioChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setDomicilio(prev => ({ ...prev, [campo]: valor }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (formData.rfc && formData.rfc.length < 10) {
      newErrors.rfc = 'RFC inválido';
    }

    if (formData.operador_sct && !formData.num_licencia?.trim()) {
      newErrors.num_licencia = 'Los operadores SCT requieren licencia';
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
      const conductorData = {
        ...formData,
        direccion: domicilio
      };

      if (conductorId) {
        await actualizarConductor({ id: conductorId, data: conductorData });
      } else {
        await crearConductor(conductorData);
      }

      onSuccess?.();
    } catch (error) {
      toast.error('Error al guardar conductor');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <ConductorBasicFields
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
      />

      <ConductorLicenciaFields
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
      />

      <ConductorSCTFields
        formData={formData}
        onFieldChange={handleFieldChange}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Domicilio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioDomicilioUnificado
            domicilio={domicilio}
            onDomicilioChange={handleDomicilioChange}
            camposOpcionales={['numInterior', 'referencia']}
          />
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
          {isLoading ? 'Guardando...' : (conductorId ? 'Actualizar' : 'Crear Conductor')}
        </Button>
      </div>
    </div>
  );
}
