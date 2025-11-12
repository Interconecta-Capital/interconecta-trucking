
import { Ubicacion } from '@/types/ubicaciones';

export const calcularDistanciaTotal = (ubicaciones: Ubicacion[]): number => {
  // ✅ FASE 1: SOLO buscar en el destino, en AMBOS formatos
  const destino = ubicaciones.find(u => 
    u.tipoUbicacion === 'Destino' || 
    (u as any).tipo_ubicacion === 'Destino'
  );
  
  if (!destino) {
    console.log('📊 calcularDistanciaTotal: No hay destino');
    return 0;
  }
  
  // ✅ Buscar en AMBOS formatos
  const distancia = destino.distanciaRecorrida || 
                    (destino as any).distancia_recorrida || 
                    0;
  
  console.log('📊 calcularDistanciaTotal:', {
    distancia,
    destino: destino.idUbicacion || (destino as any).id_ubicacion
  });
  
  return distancia;
};

export const validarSecuenciaUbicaciones = (ubicaciones: Ubicacion[]) => {
  console.log('🔍 Validando secuencia de ubicaciones:', ubicaciones);
  
  // Validación más robusta
  const ubicacionesValidas = ubicaciones.filter(u => 
    u && 
    u.tipoUbicacion && 
    u.tipoUbicacion.trim() !== '' &&
    u.domicilio &&
    u.domicilio.calle &&
    u.domicilio.codigoPostal
  );
  
  console.log('📍 Ubicaciones válidas encontradas:', ubicacionesValidas.length, ubicacionesValidas);
  
  const tieneOrigen = ubicacionesValidas.some(u => u.tipoUbicacion === 'Origen');
  const tieneDestino = ubicacionesValidas.some(u => u.tipoUbicacion === 'Destino');
  const tieneMinimo = ubicacionesValidas.length >= 2;
  
  console.log('✅ Validación:', { tieneOrigen, tieneDestino, tieneMinimo });
  
  const errores = [];
  if (!tieneOrigen) errores.push('Falta ubicación de origen');
  if (!tieneDestino) errores.push('Falta ubicación de destino');
  if (!tieneMinimo) errores.push('Se requieren al menos 2 ubicaciones');
  
  const resultado = {
    esValido: tieneOrigen && tieneDestino && tieneMinimo,
    mensaje: errores.length > 0 ? errores.join(', ') : 'Configuración válida'
  };
  
  console.log('🎯 Resultado validación:', resultado);
  return resultado;
};

export const generarIdUbicacion = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio', ubicaciones: Ubicacion[]): string => {
  const prefix = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'IN';
  const count = ubicaciones.filter(u => u.tipoUbicacion === tipo).length + 1;
  return `${prefix}${count.toString().padStart(6, '0')}`;
};
