
import { Ubicacion } from '@/types/ubicaciones';

export const calcularDistanciaTotal = (ubicaciones: Ubicacion[]): number => {
  return ubicaciones.reduce((total, ubicacion) => {
    return total + (ubicacion.distanciaRecorrida || 0);
  }, 0);
};

export const validarSecuenciaUbicaciones = (ubicaciones: Ubicacion[]) => {
  const tieneOrigen = ubicaciones.some(u => u.tipoUbicacion === 'Origen');
  const tieneDestino = ubicaciones.some(u => u.tipoUbicacion === 'Destino');
  const tieneMinimo = ubicaciones.length >= 2;
  
  return {
    esValido: tieneOrigen && tieneDestino && tieneMinimo,
    mensaje: [
      ...(!tieneOrigen ? ['Falta ubicación de origen'] : []),
      ...(!tieneDestino ? ['Falta ubicación de destino'] : []),
      ...(!tieneMinimo ? ['Se requieren al menos 2 ubicaciones'] : [])
    ].join(', ') || 'Configuración válida'
  };
};

export const generarIdUbicacion = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio', ubicaciones: Ubicacion[]): string => {
  const prefix = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'IN';
  const count = ubicaciones.filter(u => u.tipoUbicacion === tipo).length + 1;
  return `${prefix}${count.toString().padStart(6, '0')}`;
};
