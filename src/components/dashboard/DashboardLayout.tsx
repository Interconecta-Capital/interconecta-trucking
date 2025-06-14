
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { QuickActionsCard } from './QuickActionsCard';
import { AnalyticsPanel } from './AnalyticsPanel';
import { AIInsights } from '@/components/ai/AIInsights';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {children}
        <AIInsights />
        <QuickActionsCard />
        <EnhancedCalendarView />
        <AnalyticsPanel />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {children}
      
      {/* Desktop layout - calendario e insights con IA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <EnhancedCalendarView />
        </div>
        <div className="lg:col-span-1">
          <AIInsights />
        </div>
        <div className="lg:col-span-1">
          <QuickActionsCard />
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 md:gap-6">
        <AnalyticsPanel />
      </div>
    </div>
  );
}
