import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Web Vitals Reporting
 * Mide y reporta Core Web Vitals a la consola (puede extenderse a analytics)
 */

interface WebVitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds basados en Core Web Vitals de Google
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: Metric) {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric),
    delta: metric.delta,
    id: metric.id,
  };

  // Log en consola (en producción, enviar a analytics)
  const emoji = report.rating === 'good' ? '✅' : report.rating === 'needs-improvement' ? '⚠️' : '❌';
  console.log(
    `${emoji} ${report.name}: ${Math.round(report.value)}${metric.name === 'CLS' ? '' : 'ms'} (${report.rating})`
  );

  // TODO: Enviar a analytics service
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     event_category: 'Web Vitals',
  //     value: Math.round(metric.value),
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }

  // TODO: Enviar a Supabase para tracking
  // supabase.from('web_vitals').insert({
  //   metric_name: report.name,
  //   metric_value: report.value,
  //   rating: report.rating,
  //   page: window.location.pathname,
  //   timestamp: new Date().toISOString()
  // });
}

export function reportWebVitals() {
  // Solo en producción
  if (import.meta.env.DEV) {
    console.log('📊 Web Vitals tracking enabled (dev mode - console only)');
  }

  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Custom Time to Interactive (TTI) tracking
export function trackTTI() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name === 'TTI') {
            console.log(`⏱️ TTI: ${Math.round(entry.duration)}ms`);
            observer.disconnect();
          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });

      // Mark TTI cuando la app está lista
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (performance.mark && performance.measure) {
            performance.mark('tti-end');
            performance.measure('TTI', 'navigationStart', 'tti-end');
          }
        }, 0);
      });
    } catch (error) {
      console.error('Error tracking TTI:', error);
    }
  }
}
