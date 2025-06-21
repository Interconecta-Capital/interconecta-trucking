
import { ReactNode } from 'react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function BaseLayout({ children, showSidebar = true, className }: BaseLayoutProps) {
  const isMobile = useIsMobile();

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-05">
        <GlobalHeader />
        <main className={cn(
          "transition-all duration-200",
          isMobile ? "p-4" : "p-6 lg:p-8",
          className
        )}>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-05 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full min-w-0">
          <GlobalHeader />
          <main className={cn(
            "flex-1 overflow-auto transition-all duration-200",
            isMobile ? "p-4" : "p-6 lg:p-8",
            className
          )}>
            <div className="mx-auto max-w-7xl space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
