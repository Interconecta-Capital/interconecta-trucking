/**
 * Utilidades de formateo de fechas para cumplir con especificaciones SAT
 */

/**
 * Normaliza fecha de datetime-local para SAT
 * Agrega :00 si solo tiene formato YYYY-MM-DDTHH:MM
 * 
 * @param fecha - Fecha en formato ISO o datetime-local
 * @returns Fecha normalizada en formato YYYY-MM-DDTHH:MM:SS
 * 
 * @example
 * normalizarFechaLocal("2025-11-22T11:29") // "2025-11-22T11:29:00"
 * normalizarFechaLocal("2025-11-22T11:29:45") // "2025-11-22T11:29:45"
 */
export function normalizarFechaLocal(fecha: string): string {
  if (!fecha) return '';
  
  // Si tiene formato YYYY-MM-DDTHH:MM (sin segundos), agregar :00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fecha)) {
    return fecha + ':00';
  }
  
  return fecha;
}

/**
 * Formatea Date para input datetime-local
 * Retorna YYYY-MM-DDTHH:MM (sin segundos para el input HTML)
 * 
 * @param fecha - Objeto Date o string ISO
 * @returns Fecha en formato YYYY-MM-DDTHH:MM para datetime-local input
 * 
 * @example
 * formatParaDateTimeLocal(new Date()) // "2025-11-24T14:30"
 */
export function formatParaDateTimeLocal(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return fechaObj.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

/**
 * Formatea fecha según especificación del SAT para CFDI 4.0
 * Formato: YYYY-MM-DDTHH:MM:SS (sin milisegundos ni zona horaria)
 * 
 * @param fecha - Objeto Date (por defecto: fecha actual)
 * @returns Fecha en formato SAT
 * 
 * @example
 * formatFechaSAT(new Date()) // "2025-11-24T14:30:15"
 */
export function formatFechaSAT(fecha: Date = new Date()): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  const seconds = String(fecha.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
