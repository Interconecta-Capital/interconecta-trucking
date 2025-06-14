import { CartaPorteData } from '@/types/cartaPorte';

export const validateCartaPorteData = (data: CartaPorteData): string[] => {
  const errors: string[] = [];

  if (!data.rfcEmisor) {
    errors.push('RFC Emisor es requerido');
  }

  if (!data.rfcReceptor) {
    errors.push('RFC Receptor es requerido');
  }

  return errors;
};

export const validateUbicaciones = (ubicaciones: any[]): string[] => {
  const errors: string[] = [];
  
  ubicaciones.forEach((ubicacion, index) => {
    if (!ubicacion.domicilio?.codigo_postal) {
      errors.push(`Ubicación ${index + 1}: Código postal requerido`);
    }
    
    if (ubicacion.tipo_ubicacion === 'Origen' && !ubicacion.domicilio?.codigo_postal) {
      errors.push(`Ubicación origen: Código postal es obligatorio`);
    }
  });
  
  return errors;
};
