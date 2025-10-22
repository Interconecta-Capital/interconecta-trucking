/**
 * DOM Helper Utilities para prevenir forced reflows
 * Separa lecturas y escrituras del DOM usando requestAnimationFrame
 */

// Batch de lecturas del DOM
export function batchDOMReads<T>(reads: Array<() => T>): T[] {
  return reads.map(read => read());
}

// Batch de escrituras del DOM
export function batchDOMWrites(writes: Array<() => void>): void {
  requestAnimationFrame(() => {
    writes.forEach(write => write());
  });
}

// Throttle para limitar ejecuciones
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Debounce para retrasar ejecuciones
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Hook de React para ResizeObserver
import { useEffect, useRef, useState } from 'react';

export interface ResizeObserverEntry {
  width: number;
  height: number;
}

export function useResizeObserver<T extends HTMLElement>(): [
  React.RefObject<T>,
  ResizeObserverEntry
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ResizeObserverEntry>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      
      // Batch read
      const { width, height } = entries[0].contentRect;
      
      // Batch write
      requestAnimationFrame(() => {
        setSize({ width, height });
      });
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, size];
}
