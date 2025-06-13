
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

export function PersonalizedGreeting() {
  const { user } = useSimpleAuth();
  
  const getTimeBasedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Buenos días';
    } else if (hour >= 12 && hour < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  const userName = user?.user_metadata?.nombre || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Usuario';
  const greeting = getTimeBasedGreeting();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {greeting}, {userName}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control
        </p>
      </div>
    </div>
  );
}
