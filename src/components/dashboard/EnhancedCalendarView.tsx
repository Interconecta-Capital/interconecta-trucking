
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export function EnhancedCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const events = [
    {
      id: 1,
      title: 'Viaje CDMX - Guadalajara',
      date: new Date(),
      type: 'viaje',
      status: 'programado'
    },
    {
      id: 2,
      title: 'Mantenimiento Vehículo ABC-123',
      date: new Date(Date.now() + 86400000), // Tomorrow
      type: 'mantenimiento',
      status: 'pendiente'
    }
  ];

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDay = (day: number) => {
    if (!day) return [];
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => 
      event.date.toDateString() === dayDate.toDateString()
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Eventos
          </span>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg capitalize">
            {getMonthName(currentDate)}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day && 
              new Date().toDateString() === 
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border rounded-md ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
                } ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-2">
          <h4 className="font-medium">Próximos Eventos</h4>
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-sm">{event.title}</div>
                <div className="text-xs text-muted-foreground">
                  {event.date.toLocaleDateString('es-MX')}
                </div>
              </div>
              <Badge variant={event.status === 'programado' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
