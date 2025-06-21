
import { useEffect } from 'react';

export function SecurityHeaders() {
  useEffect(() => {
    // Set security headers programmatically where possible
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com;
      style-src 'self' 'unsafe-inline' https://api.mapbox.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://*.supabase.co https://api.mapbox.com wss://*.supabase.co;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(meta);

    // Add X-Frame-Options
    const frameOptions = document.createElement('meta');
    frameOptions.httpEquiv = 'X-Frame-Options';
    frameOptions.content = 'DENY';
    document.head.appendChild(frameOptions);

    // Add X-Content-Type-Options
    const contentType = document.createElement('meta');
    contentType.httpEquiv = 'X-Content-Type-Options';
    contentType.content = 'nosniff';
    document.head.appendChild(contentType);

    return () => {
      // Cleanup
      document.head.removeChild(meta);
      document.head.removeChild(frameOptions);
      document.head.removeChild(contentType);
    };
  }, []);

  return null;
}
