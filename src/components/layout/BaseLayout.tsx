
import { ReactNode, useState } from 'react'
import { GlobalHeader } from '@/components/GlobalHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { useFAB } from '@/contexts/FABContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface BaseLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function BaseLayout({ children, showSidebar = true, className }: BaseLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { fabConfig } = useFAB()
  const isMobile = useIsMobile()

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-05">
        <GlobalHeader />
        <main
          className={cn(
            "transition-all duration-200 overflow-x-hidden",
            "p-3 sm:p-4 md:p-6 lg:p-8",
            "min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]",
            className
          )}
        >
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
        {isMobile && (
          <FloatingActionButton
            icon={fabConfig.icon as React.ReactNode}
            text={fabConfig.text ?? ''}
            onClick={fabConfig.onClick ?? (() => {})}
            isVisible={!!fabConfig.isVisible}
          />
        )}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-05 flex w-full">
        {/* Fixed sidebar on desktop, overlay on mobile */}
        <div className={cn(
          "transition-all duration-200",
          isMobile ? "relative" : "fixed left-0 top-0 h-full z-30"
        )}>
          <AppSidebar isMobileOpen={mobileOpen} setIsMobileOpen={setMobileOpen} />
        </div>
        
        {/* Main content with proper spacing for fixed sidebar on desktop */}
        <div 
          className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isMobile ? 0 : 'var(--sidebar-actual-width, 256px)'
          }}
        >
          <GlobalHeader onOpenSidebar={() => setMobileOpen(true)} />
          <main
          className={cn(
              "flex-1 overflow-auto overflow-x-hidden transition-all duration-200",
              "p-3 sm:p-4 md:p-6 lg:p-8",
              "space-y-4 sm:space-y-6",
              className
            )}
          >
            <div className="mx-auto max-w-7xl w-full space-y-4 sm:space-y-6">
              {children}
            </div>
          </main>
          {isMobile && (
            <FloatingActionButton
              icon={fabConfig.icon as React.ReactNode}
              text={fabConfig.text ?? ''}
              onClick={fabConfig.onClick ?? (() => {})}
              isVisible={!!fabConfig.isVisible}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
