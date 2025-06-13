
import { useCallback } from 'react';

interface ContentSecurityOptions {
  allowedTags?: string[];
  maxLength?: number;
  blockSuspiciousPatterns?: boolean;
}

export const useContentSecurity = () => {
  const sanitizeAIResponse = useCallback((
    content: string, 
    options: ContentSecurityOptions = {}
  ): string => {
    const {
      allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      maxLength = 5000,
      blockSuspiciousPatterns = true
    } = options;

    if (!content || typeof content !== 'string') return '';

    let sanitized = content.trim();

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }

    // Remove potentially dangerous patterns
    if (blockSuspiciousPatterns) {
      // Remove script tags and javascript
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
      
      // Remove data URLs and suspicious protocols
      sanitized = sanitized.replace(/data:/gi, '');
      sanitized = sanitized.replace(/vbscript:/gi, '');
      sanitized = sanitized.replace(/file:/gi, '');
      
      // Remove suspicious HTML attributes
      sanitized = sanitized.replace(/style\s*=/gi, '');
      sanitized = sanitized.replace(/class\s*=/gi, '');
      
      // Remove potentially malicious content
      sanitized = sanitized.replace(/(<iframe|<object|<embed|<form)/gi, '&lt;$1');
    }

    // Sanitize HTML tags - only allow specific tags
    if (allowedTags.length > 0) {
      const allowedTagsRegex = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\s*\/?>)[^>]+>`, 'gi');
      sanitized = sanitized.replace(allowedTagsRegex, '');
    } else {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Encode remaining special characters
    sanitized = sanitized
      .replace(/&(?!(?:amp|lt|gt|quot|#x27|#x2F);)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }, []);

  const validateUploadedFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // File size limit (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'Archivo demasiado grande (máximo 5MB)' };
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de archivo no permitido' };
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return { isValid: false, error: 'Nombre de archivo no permitido' };
    }

    return { isValid: true };
  }, []);

  const sanitizeFileName = useCallback((fileName: string): string => {
    // Remove or replace dangerous characters
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }, []);

  return {
    sanitizeAIResponse,
    validateUploadedFile,
    sanitizeFileName
  };
};
