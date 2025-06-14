
import { ReactNode } from 'react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function BaseLayout({ 
  children, 
  showSidebar = true, 
  fullWidth = false,
  className 
}: BaseLayoutProps) {
  const isMobile = useIsMobile();

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader />
        <main className={cn(
          fullWidth ? "p-0" : "p-4",
          // Espaciado específico para móvil
          !fullWidth && isMobile && "px-3 py-4",
          // Espaciado para desktop
          !fullWidth && !isMobile && "p-6",
          className
        )}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <GlobalHeader />
          <main className={cn(
            "flex-1 overflow-auto",
            fullWidth ? "p-0" : (
              // Espaciado específico para móvil
              isMobile ? "p-3" : "p-6"
            ),
            className
          )}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
