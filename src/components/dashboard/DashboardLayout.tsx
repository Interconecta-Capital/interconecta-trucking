
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { DocumentosProcesadosWidget } from './DocumentosProcesadosWidget';

interface DashboardLayoutProps {
  children?: ReactNode;
  showWidgets?: boolean;
  hideWidgetsForPrincipal?: boolean;
}

export function DashboardLayout({ 
  children, 
  showWidgets = true,
  hideWidgetsForPrincipal = false 
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  // Si está configurado para ocultar widgets en el dashboard principal
  const shouldShowWidgets = showWidgets && !hideWidgetsForPrincipal;

  if (isMobile) {
    return (
      <div className="space-y-6">
        {children}
        {shouldShowWidgets && (
          <>
            <DocumentosProcesadosWidget />
            <EnhancedCalendarView />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {children}
      
      {shouldShowWidgets && (
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
      )}
    </div>
  );
}
