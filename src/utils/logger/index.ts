/**
 * Logger estructurado con niveles y condicional por ambiente
 * Cumple: GDPR/LFPDPPP (no loggea datos sensibles en producción)
 * Clean Code: Single Responsibility Principle
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 
  | 'mapper' | 'validator' | 'timbrado' | 'db' | 'api' | 'general' 
  | 'csd' | 'xml' | 'validador' | 'sw-validator' | 'sw-error' | 'xml-validator' 
  | 'catalogos' | 'pdf' | 'viajes' | 'auth' | 'storage' | 'config' 
  | 'mercancias' | 'ubicaciones' | 'vehiculos' | 'conductores' | 'facturacion'
  | 'ui' | 'wizard' | 'form' | 'cache' | 'routing' | 'maps';

export type { LogLevel, LogCategory };

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  sanitized?: boolean;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private isTest = import.meta.env.MODE === 'test';
  
  /**
   * Campos sensibles que deben ser sanitizados en producción
   */
  private readonly SENSITIVE_FIELDS = [
    'rfc', 
    'curp', 
    'nombre', 
    'razon_social', 
    'password', 
    'token',
    'num_licencia',
    'email',
    'telefono'
  ];

  /**
   * Sanitiza datos sensibles antes de loggear en producción
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    
    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const result = Array.isArray(obj) ? [...obj] : { ...obj };
      
      for (const key in result) {
        const lowerKey = key.toLowerCase();
        
        // Sanitizar campos sensibles
        if (this.SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
          result[key] = `[REDACTED-${key.toUpperCase()}]`;
        } else if (typeof result[key] === 'object' && result[key] !== null) {
          result[key] = sanitizeObject(result[key]);
        }
      }
      
      return result;
    };
    
    return sanitizeObject(sanitized);
  }

  /**
   * Registra un log con el nivel y categoría especificados
   */
  private log(level: LogLevel, category: LogCategory, message: string, metadata?: any): void {
    // Solo loggear en desarrollo/tests, excepto errores que siempre se registran
    if (!this.isDev && !this.isTest && level !== 'error' && level !== 'warn') {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata: this.isDev ? metadata : this.sanitize(metadata),
      sanitized: !this.isDev
    };

    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };

    const logFn = level === 'error' ? console.error : 
                  level === 'warn' ? console.warn : 
                  console.log;

    const categoryUpper = category.toUpperCase();
    logFn(`${emoji[level]} [${categoryUpper}] ${message}`, this.isDev ? metadata : '');
  }

  /**
   * Registra un mensaje de debug (solo en desarrollo)
   */
  debug(category: LogCategory, message: string, metadata?: any): void {
    this.log('debug', category, message, metadata);
  }

  /**
   * Registra un mensaje informativo
   */
  info(category: LogCategory, message: string, metadata?: any): void {
    this.log('info', category, message, metadata);
  }

  /**
   * Registra una advertencia
   */
  warn(category: LogCategory, message: string, metadata?: any): void {
    this.log('warn', category, message, metadata);
  }

  /**
   * Registra un error (siempre se registra, incluso en producción)
   */
  error(category: LogCategory, message: string, error?: Error | any): void {
    this.log('error', category, message, {
      error: error?.message || error,
      stack: this.isDev ? error?.stack : undefined
    });
  }
}

/**
 * Instancia singleton del logger
 */
export const logger = new Logger();
export default logger;
