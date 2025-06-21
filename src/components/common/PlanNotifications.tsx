
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { useAlertManager } from '@/hooks/notifications/useAlertManager';
import { useNavigate } from 'react-router-dom';
import { SuperuserAlert } from '@/components/notifications/SuperuserAlert';
import { AlertItem } from '@/components/notifications/AlertItem';

export function PlanNotifications() {
  const permissions = useUnifiedPermissionsV2();
  const { generateAlerts, dismissAlert } = useAlertManager();
  const navigate = useNavigate();

  // Superusers no ven notificaciones excepto su badge
  if (permissions.accessLevel === 'superuser') {
    return <SuperuserAlert />;
  }

  const visibleAlerts = generateAlerts();

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onAction={() => navigate('/planes')}
          onDismiss={alert.type !== 'critical' ? dismissAlert : undefined}
        />
      ))}
    </div>
  );
}
