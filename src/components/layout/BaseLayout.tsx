
import { ReactNode } from 'react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function BaseLayout({ children, showSidebar = true }: BaseLayoutProps) {
  const isMobile = useIsMobile();

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-05 apple-grid">
        <GlobalHeader />
        <main className={cn(
          "p-4",
          // Espaciado específico para móvil
          isMobile && "px-4 py-6",
          // Espaciado para desktop
          !isMobile && "p-8"
        )}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-05 flex w-full apple-grid">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <GlobalHeader />
          <main className={cn(
            "flex-1 overflow-auto",
            // Espaciado específico para móvil
            isMobile && "p-4",
            // Espaciado para desktop
            !isMobile && "p-8"
          )}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
