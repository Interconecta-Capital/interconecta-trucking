
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, MapPin, Phone, Mail, Clock, Award } from 'lucide-react';

interface TallerSelectorProps {
  talleres: any[];
  onSelect?: (taller: any) => void;
  selectedTallerId?: string;
}

export const TallerSelector: React.FC<TallerSelectorProps> = ({
  talleres,
  onSelect,
  selectedTallerId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');

  const especialidadesUnicas = Array.from(
    new Set(talleres.flatMap(t => t.especialidades))
  ).filter(Boolean);

  const talleresFiltrados = talleres.filter(taller => {
    const matchesSearch = taller.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taller.direccion?.ciudad?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEspecialidad = !filterEspecialidad || 
                               taller.especialidades.includes(filterEspecialidad);
    
    return matchesSearch && matchesEspecialidad;
  });

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterEspecialidad}
          onChange={(e) => setFilterEspecialidad(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todas las especialidades</option>
          {especialidadesUnicas.map((especialidad) => (
            <option key={especialidad} value={especialidad}>
              {especialidad}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Talleres */}
      <div className="grid gap-4">
        {talleresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No se encontraron talleres con los filtros aplicados
            </CardContent>
          </Card>
        ) : (
          talleresFiltrados.map((taller) => (
            <Card 
              key={taller.id} 
              className={`cursor-pointer transition-colors ${
                selectedTallerId === taller.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect?.(taller)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{taller.nombre}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {getRatingStars(taller.calificacion_promedio)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {taller.calificacion_promedio.toFixed(1)} ({taller.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <Badge variant={taller.activo ? 'default' : 'secondary'}>
                    {taller.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Información de contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {taller.direccion && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p>{taller.direccion.calle || 'Dirección no especificada'}</p>
                        <p className="text-gray-600">
                          {taller.direccion.ciudad}, {taller.direccion.estado}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {taller.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{taller.telefono}</span>
                    </div>
                  )}
                  
                  {taller.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{taller.email}</span>
                    </div>
                  )}
                  
                  {taller.horarios && Object.keys(taller.horarios).length > 0 && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p>Lun-Vie: {taller.horarios.semana || '8:00-18:00'}</p>
                        <p className="text-gray-600">Sáb: {taller.horarios.sabado || '8:00-14:00'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Especialidades */}
                {taller.especialidades.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Especialidades
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {taller.especialidades.map((especialidad: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {especialidad}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificaciones */}
                {taller.certificaciones.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Certificaciones</p>
                    <div className="flex flex-wrap gap-1">
                      {taller.certificaciones.map((cert: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precios promedio */}
                {taller.precios_promedio && Object.keys(taller.precios_promedio).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Precios Promedio</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(taller.precios_promedio).map(([servicio, precio]) => (
                        <div key={servicio} className="flex justify-between">
                          <span className="text-gray-600">{servicio}:</span>
                          <span className="font-medium">${precio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {onSelect && (
                  <div className="pt-2 border-t">
                    <Button 
                      variant={selectedTallerId === taller.id ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                    >
                      {selectedTallerId === taller.id ? 'Seleccionado' : 'Seleccionar Taller'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
