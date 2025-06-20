
import { UnifiedProtectedContent } from '@/components/UnifiedProtectedContent';
import { EnhancedDashboardLayout } from '@/components/dashboard/EnhancedDashboardLayout';

export default function Dashboard() {
  return (
    <UnifiedProtectedContent
      requiredAction="read"
      blockOnRestriction={false}
      showUpgradePrompt={false}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
            <p className="text-gray-600">No tiene permisos para acceder al dashboard.</p>
          </div>
        </div>
      }
    >
      <EnhancedDashboardLayout />
    </UnifiedProtectedContent>
  );
}
