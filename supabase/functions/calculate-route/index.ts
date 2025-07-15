
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RouteRequest {
  origin: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  destination: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  waypoints?: Array<{
    lat?: number;
    lng?: number;
    address?: string;
  }>;
}

interface RouteResponse {
  distance_km: number;
  duration_minutes: number;
  distance: number; // in meters for compatibility
  duration: number; // in seconds for compatibility
  route_geometry?: {
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

    // Helper function to geocode address to coordinates
    const geocodeAddress = async (address: string) => {
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=MX`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      throw new Error(`No se pudo geocodificar la dirección: ${address}`);
    };

    // Resolve coordinates for origin
    let originCoords;
    if (origin.lat && origin.lng) {
      originCoords = { lat: origin.lat, lng: origin.lng };
    } else if (origin.address) {
      originCoords = await geocodeAddress(origin.address);
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Origen debe tener coordenadas o dirección',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Resolve coordinates for destination
    let destinationCoords;
    if (destination.lat && destination.lng) {
      destinationCoords = { lat: destination.lat, lng: destination.lng };
    } else if (destination.address) {
      destinationCoords = await geocodeAddress(destination.address);
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Destino debe tener coordenadas o dirección',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construir coordenadas para la ruta
    let coordinates = `${originCoords.lng},${originCoords.lat}`;
    
    // Agregar waypoints si existen
    if (waypoints && waypoints.length > 0) {
      const waypointCoords = [];
      for (const wp of waypoints) {
        if (wp.lat && wp.lng) {
          waypointCoords.push(`${wp.lng},${wp.lat}`);
        } else if (wp.address) {
          const coords = await geocodeAddress(wp.address);
          waypointCoords.push(`${coords.lng},${coords.lat}`);
        }
      }
      if (waypointCoords.length > 0) {
        coordinates += `;${waypointCoords.join(';')}`;
      }
    }
    
    coordinates += `;${destinationCoords.lng},${destinationCoords.lat}`;

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
      distance: route.distance, // meters for compatibility
      duration: route.duration, // seconds for compatibility
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
