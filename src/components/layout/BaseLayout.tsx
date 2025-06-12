
import { ReactNode } from 'react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface BaseLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function BaseLayout({ children, showSidebar = true }: BaseLayoutProps) {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader />
        <main>
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <GlobalHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
