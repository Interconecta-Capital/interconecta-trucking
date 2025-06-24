import { useState } from 'react';
import { ProtectedContent } from '@/components/ProtectedContent';
import { OperationsCalendar } from '@/components/calendar/OperationsCalendar';
import { Checkbox } from '@/components/ui/checkbox';

export default function Calendario() {
  const [showViajes, setShowViajes] = useState(true);
  const [showMantenimientos, setShowMantenimientos] = useState(true);

  return (
    <ProtectedContent requiredFeature="calendario">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 space-y-4">
            <h2 className="font-semibold">Mis Calendarios</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="viajes" checked={showViajes} onCheckedChange={setShowViajes} />
                <label htmlFor="viajes" className="text-sm">Viajes Programados</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="mantenimientos" checked={showMantenimientos} onCheckedChange={setShowMantenimientos} />
                <label htmlFor="mantenimientos" className="text-sm">Mantenimientos</label>
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex justify-end mb-4">
              <GoogleConnectButton />
            </div>
            <OperationsCalendar
              showViajes={showViajes}
              showMantenimientos={showMantenimientos}
            />
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
}

function GoogleConnectButton() {
  const handleConnect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = url;
  };

  return (
    <button onClick={handleConnect} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
      Conectar con Google Calendar
    </button>
  );
}
