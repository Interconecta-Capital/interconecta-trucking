
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RouteRequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  waypoints?: Array<{
    lat: number;
    lng: number;
  }>;
}

interface RouteResponse {
  distance_km: number;
  duration_minutes: number;
  route_geometry: {
    type: string;
    coordinates: number[][];
  };
  success: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    
    if (!MAPBOX_TOKEN) {
      console.error('MAPBOX_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { origin, destination, waypoints }: RouteRequest = await req.json();

    // Validar datos de entrada
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return new Response(
        JSON.stringify({ 
          error: 'Coordenadas de origen y destino requeridas',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construir coordenadas para la ruta
    let coordinates = `${origin.lng},${origin.lat}`;
    
    // Agregar waypoints si existen
    if (waypoints && waypoints.length > 0) {
      const waypointCoords = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
      coordinates += `;${waypointCoords}`;
    }
    
    coordinates += `;${destination.lng},${destination.lat}`;

    console.log('Calculando ruta con Mapbox:', coordinates);

    // Llamar a la API de Mapbox Directions
    const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&steps=false&access_token=${MAPBOX_TOKEN}`;
    
    const mapboxResponse = await fetch(mapboxUrl);
    
    if (!mapboxResponse.ok) {
      const errorText = await mapboxResponse.text();
      console.error('Error de Mapbox:', errorText);
      throw new Error(`Mapbox API error: ${mapboxResponse.status}`);
    }

    const mapboxData = await mapboxResponse.json();

    if (!mapboxData.routes || mapboxData.routes.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No se pudo calcular la ruta entre los puntos especificados',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const route = mapboxData.routes[0];
    
    const response: RouteResponse = {
      distance_km: Math.round((route.distance / 1000) * 100) / 100, // Convertir metros a km con 2 decimales
      duration_minutes: Math.round(route.duration / 60), // Convertir segundos a minutos
      route_geometry: route.geometry,
      success: true
    };

    console.log('Ruta calculada exitosamente:', {
      distance: response.distance_km,
      duration: response.duration_minutes
    });

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error en calculate-route function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
