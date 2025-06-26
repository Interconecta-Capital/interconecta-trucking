
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { DocumentosProcesadosWidget } from './DocumentosProcesadosWidget';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-6">
        {children}
        <DocumentosProcesadosWidget />
        <EnhancedCalendarView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {children}
      
      {/* Desktop layout optimizado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-2">
          <EnhancedCalendarView />
        </div>
        
        {/* Panel lateral de documentos */}
        <div className="lg:col-span-1">
          <DocumentosProcesadosWidget />
        </div>
      </div>
    </div>
  );
}
