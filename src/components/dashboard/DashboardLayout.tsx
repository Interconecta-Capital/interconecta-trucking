
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { QuickActionsCard } from './QuickActionsCard';
import { AnalyticsPanel } from './AnalyticsPanel';
import { AIInsights } from '@/components/ai/AIInsights';
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
        <AIInsights />
        <DocumentosProcesadosWidget />
        <QuickActionsCard />
        <EnhancedCalendarView />
        <AnalyticsPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {children}
      
      {/* Desktop layout optimizado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-2">
          <EnhancedCalendarView />
        </div>
        
        {/* Panel lateral de insights */}
        <div className="lg:col-span-1">
          <AIInsights />
        </div>
        
        {/* Panel lateral de acciones */}
        <div className="lg:col-span-1 space-y-6">
          <DocumentosProcesadosWidget />
          <QuickActionsCard />
        </div>
      </div>

      {/* Panel de analytics completo */}
      <AnalyticsPanel />
    </div>
  );
}
