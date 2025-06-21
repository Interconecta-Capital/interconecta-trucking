import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, User, Menu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/UserMenu';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlanBadge } from '@/components/PlanBadge';
import { MobileTrialInfo } from '@/components/MobileTrialInfo';

interface GlobalHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { notifications } = useNotifications();
  const isMobile = useIsMobile();

  return (
    <header className="bg-pure-white border-b border-gray-20 sticky top-0 z-40">
      <div className="flex h-16 items-center gap-4 px-6">
        {isMobile ? (
          <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
        ) : null}
        <Button variant="ghost" className="px-0 lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <PlanBadge />
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {isMobile ? <MobileTrialInfo /> : null}
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 data-[state=open]:bg-secondary">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <Badge
                variant="primary"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0"
              >
                {notifications.length}
              </Badge>
            )}
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
