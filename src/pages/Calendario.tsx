import { ProtectedContent } from '@/components/ProtectedContent';
import { EnhancedCalendarView } from '@/components/dashboard/EnhancedCalendarView';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { useIsMobile } from '@/hooks/use-mobile';
export default function Calendario() {
  const isMobile = useIsMobile();

  return (
    <ProtectedContent requiredFeature="calendario">
      <div className="p-4 md:p-6">
        {isMobile ? (
          <div className="space-y-6">
            <QuickActionsCard />
            <EnhancedCalendarView />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <EnhancedCalendarView />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <QuickActionsCard />
            </div>
          </div>
        )}
      </div>
    </ProtectedContent>
  );
}
