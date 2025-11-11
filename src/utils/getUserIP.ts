/**
 * Utilidad para obtener la IP del usuario y datos del navegador
 * Usado para cumplimiento GDPR/LFPDPPP en registro de consentimientos
 */

/**
 * Obtiene la IP pública del usuario usando un servicio externo
 * Fallback a 'unknown' si no se puede obtener
 */
export async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch IP');
    }
    
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('No se pudo obtener IP del usuario:', error);
    return 'unknown';
  }
}

/**
 * Obtiene el User Agent del navegador
 */
export function getUserAgent(): string {
  return navigator.userAgent || 'unknown';
}
