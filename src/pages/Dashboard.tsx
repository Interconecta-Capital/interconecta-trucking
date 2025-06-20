import { PersonalizedGreeting } from '@/components/dashboard/PersonalizedGreeting';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { DashboardMetricsGrid } from '@/components/dashboard/DashboardMetricsGrid';
import { EnhancedDashboardLayout } from '@/components/dashboard/EnhancedDashboardLayout';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanBadge } from '@/components/common/PlanBadge';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

export default function Dashboard() {
  return <EnhancedDashboardLayout />;
}
