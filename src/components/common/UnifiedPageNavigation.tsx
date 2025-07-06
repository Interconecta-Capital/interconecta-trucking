
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';

interface UnifiedPageNavigationProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function UnifiedPageNavigation({ title, description, children }: UnifiedPageNavigationProps) {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
