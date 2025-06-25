
import { ReactNode, useState } from 'react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function BaseLayout({ children, showSidebar = true, className }: BaseLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-05">
        <GlobalHeader />
        <main className={cn(
          "transition-all duration-200",
          // Responsive padding with proper mobile spacing
          "p-3 sm:p-4 md:p-6 lg:p-8",
          // Better mobile viewport handling
          "min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]",
          className
        )}>
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-05 flex w-full">
        <AppSidebar isMobileOpen={mobileOpen} setIsMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col w-full min-w-0">
          <GlobalHeader onOpenSidebar={() => setMobileOpen(true)} />
          <main className={cn(
            "flex-1 overflow-auto transition-all duration-200",
            // Enhanced responsive padding
            "p-3 sm:p-4 md:p-6 lg:p-8",
            // Better mobile spacing
            "space-y-4 sm:space-y-6",
            className
          )}>
            <div className="mx-auto max-w-7xl w-full space-y-4 sm:space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
