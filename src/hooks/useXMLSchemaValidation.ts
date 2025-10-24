import { useState } from 'react';
import { XMLSchemaValidator, XMLValidationResult } from '@/services/xml/xmlSchemaValidator';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';

export function useXMLSchemaValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<XMLValidationResult | null>(null);
  const [historialValidaciones, setHistorialValidaciones] = useState<any[]>([]);

  const validateXML = async (xmlString: string, cartaPorteData: CartaPorteData) => {
    setIsValidating(true);
    try {
      const result = await XMLSchemaValidator.validateXMLAgainstSchema(xmlString, cartaPorteData);
      setValidationResult(result);

      if (result.esValido) {
        toast.success(`XML válido - Conformidad: ${result.puntajeConformidad}%`, {
          description: 'El XML cumple con el esquema SAT'
        });
      } else {
        toast.error(`Errores de validación - Conformidad: ${result.puntajeConformidad}%`, {
          description: `${result.errores.length} errores encontrados`
        });
      }

      return result;
    } catch (error) {
      console.error('Error en validación:', error);
      toast.error('Error al validar XML');
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const loadHistorial = async (cartaPorteId: string) => {
    try {
      const historial = await XMLSchemaValidator.obtenerHistorialValidaciones(cartaPorteId);
      setHistorialValidaciones(historial);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const clearValidation = () => {
    setValidationResult(null);
  };

  return {
    isValidating,
    validationResult,
    historialValidaciones,
    validateXML,
    loadHistorial,
    clearValidation
  };
}
