
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSocios } from '@/hooks/useSocios';
import { SocioBasicFields } from './SocioBasicFields';
import { SocioFiscalFields } from './SocioFiscalFields';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { SocioSyncWarning } from '../SocioSyncWarning';
import { validarIntegridadSocio, calcularDocumentosAfectados } from '@/utils/socioDataSync';

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
  const [cambiosImportantes, setCambiosImportantes] = useState<string[]>([]);
  const [socioOriginal, setSocioOriginal] = useState<any>(null);
  const [documentosAfectados, setDocumentosAfectados] = useState(0);

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
        setSocioOriginal(socio); // Guardar original para comparación
        
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

  // Calcular documentos afectados cuando se carga un socio existente
  useEffect(() => {
    if (socioId && socioOriginal) {
      calcularDocumentosAfectados(socioId, socioOriginal.user_id).then(setDocumentosAfectados);
    }
  }, [socioId, socioOriginal]);

  // Detectar cambios importantes para mostrar warning
  useEffect(() => {
    if (!socioOriginal || !socioId) {
      setCambiosImportantes([]);
      return;
    }
    
    const cambios: string[] = [];
    
    if (formData.rfc !== socioOriginal.rfc) {
      cambios.push(`RFC: ${socioOriginal.rfc} → ${formData.rfc}`);
    }
    if (formData.regimen_fiscal !== socioOriginal.regimen_fiscal) {
      cambios.push('Régimen Fiscal actualizado');
    }
    if (formData.uso_cfdi !== socioOriginal.uso_cfdi) {
      cambios.push('Uso CFDI actualizado');
    }
    if (JSON.stringify(domicilioFiscal) !== JSON.stringify(extractDireccionSafe(socioOriginal.direccion_fiscal))) {
      cambios.push('Domicilio Fiscal actualizado');
    }
    if (JSON.stringify(domicilioGeneral) !== JSON.stringify(extractDireccionSafe(socioOriginal.direccion))) {
      cambios.push('Domicilio General actualizado');
    }
    
    setCambiosImportantes(cambios);
  }, [formData, domicilioFiscal, domicilioGeneral, socioOriginal, socioId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Memoizar callbacks para evitar re-renders innecesarios
  const handleDomicilioGeneralChange = useCallback((campo: keyof DomicilioUnificado, valor: string) => {
    setDomicilioGeneral(prev => {
      const updated = { ...prev, [campo]: valor };
      // Si usar mismo domicilio está activo, sincronizar automáticamente
      if (usarMismoDomicilio) {
        setDomicilioFiscal(updated);
        console.log('[FORM] Sincronizando domicilio fiscal:', campo, valor);
      }
      return updated;
    });
  }, [usarMismoDomicilio]);

  const handleDomicilioFiscalChange = useCallback((campo: keyof DomicilioUnificado, valor: string) => {
    setDomicilioFiscal(prev => ({ ...prev, [campo]: valor }));
  }, []);

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

    const socioData = {
      ...formData,
      direccion: domicilioGeneral,
      direccion_fiscal: usarMismoDomicilio ? domicilioGeneral : domicilioFiscal
    };

    // Validar integridad de datos antes de guardar
    const validacion = validarIntegridadSocio(socioData);
    if (!validacion.valido) {
      toast.error('Datos incompletos', {
        description: validacion.errores[0]
      });
      return;
    }

    try {
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
      {/* Mostrar warning de sincronización si hay cambios importantes */}
      {socioId && cambiosImportantes.length > 0 && (
        <SocioSyncWarning
          socioId={socioId}
          cantidadDocumentosAfectados={documentosAfectados}
          cambiosImportantes={cambiosImportantes}
        />
      )}

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
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="usar_mismo_domicilio"
              checked={usarMismoDomicilio}
              onChange={(e) => {
                const checked = e.target.checked;
                setUsarMismoDomicilio(checked);
                if (checked) {
                  // Copiar TODOS los campos del domicilio general al fiscal
                  setDomicilioFiscal({...domicilioGeneral});
                  console.log('[FORM] Usando mismo domicilio - copiado completo');
                }
              }}
              className="rounded border-gray-300"
            />
            <label htmlFor="usar_mismo_domicilio" className="text-sm font-medium cursor-pointer">
              Usar el mismo domicilio general como domicilio fiscal
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
