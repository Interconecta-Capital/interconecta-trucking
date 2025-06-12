
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export const useUnconfirmedUserDetection = () => {
  const { user } = useAuth();
  const [needsCompletion, setNeedsCompletion] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      const isIncomplete = 
        !user.profile.rfc || 
        !user.profile.telefono || 
        !user.profile.empresa ||
        !user.profile.nombre;
      
      setNeedsCompletion(isIncomplete);
    } else {
      setNeedsCompletion(false);
    }
  }, [user]);

  return { needsCompletion };
};
