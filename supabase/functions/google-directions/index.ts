
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DirectionsRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, waypoints = [] }: DirectionsRequest = await req.json();
    
    console.log('🚀 Calculating route with Google Directions API');
    console.log('📍 Origin:', origin);
    console.log('📍 Destination:', destination);
    console.log('🛤️ Waypoints:', waypoints);

    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!googleMapsApiKey) {
      console.error('❌ Google Maps API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Maps API key not configured in Supabase secrets',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Validate coordinates
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      throw new Error('Invalid coordinates provided - origin and destination coordinates are required');
    }

    // Validate coordinate ranges
    if (Math.abs(origin.lat) > 90 || Math.abs(origin.lng) > 180 || 
        Math.abs(destination.lat) > 90 || Math.abs(destination.lng) > 180) {
      throw new Error('Invalid coordinate ranges - latitude must be between -90 and 90, longitude between -180 and 180');
    }

    // Build waypoints string for Google API
    let waypointsParam = '';
    if (waypoints && waypoints.length > 0) {
      const validWaypoints = waypoints.filter(wp => 
        wp && wp.lat && wp.lng && 
        Math.abs(wp.lat) <= 90 && Math.abs(wp.lng) <= 180
      );
      
      if (validWaypoints.length > 0) {
        const waypointStrings = validWaypoints.map(wp => `${wp.lat},${wp.lng}`);
        waypointsParam = `&waypoints=${waypointStrings.join('|')}`;
        console.log(`🛤️ Adding ${validWaypoints.length} valid waypoints`);
      }
    }

    // Call Google Directions API with optimized parameters for Mexico
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.lat},${origin.lng}` +
      `&destination=${destination.lat},${destination.lng}` +
      `${waypointsParam}` +
      `&mode=driving` +
      `&units=metric` +
      `&language=es` +
      `&region=mx` +
      `&avoid=tolls` +
      `&key=${googleMapsApiKey}`;
    
    console.log('🌐 Calling Google Directions API');
    console.log('🔗 URL (masked):', directionsUrl.replace(googleMapsApiKey, '[API_KEY_MASKED]'));
    
    const response = await fetch(directionsUrl);
    
    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Response body:', errorText);
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📄 Google API Response Status:', data.status);

    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ Google API Request Denied:', data.error_message);
      throw new Error(`Google Maps API access denied: ${data.error_message || 'Invalid API key or insufficient permissions'}`);
    }

    if (data.status === 'ZERO_RESULTS') {
      console.warn('⚠️ No routes found between the specified points');
      throw new Error('No se encontraron rutas entre los puntos especificados. Verifica que las coordenadas sean válidas y accesibles por carretera.');
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('❌ Google API quota exceeded');
      throw new Error('Se ha excedido el límite de consultas a la API de Google Maps. Intenta más tarde.');
    }

    if (data.status !== 'OK') {
      console.error('❌ Google Directions API error:', data.status, data.error_message);
      throw new Error(`Google Directions API error: ${data.status} - ${data.error_message || 'Error desconocido'}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found in Google API response');
    }

    const route = data.routes[0];
    console.log('📊 Route found with', route.legs.length, 'legs');

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    route.legs.forEach((leg: any, index: number) => {
      totalDistance += leg.distance.value; // meters
      totalDuration += leg.duration.value; // seconds
      console.log(`📏 Leg ${index + 1}: ${leg.distance.text}, ${leg.duration.text}`);
    });

    // Convert to km and minutes
    const distanceKm = Math.round(totalDistance / 1000 * 100) / 100;
    const durationMinutes = Math.round(totalDuration / 60);

    const result = {
      success: true,
      distance_km: distanceKm,
      duration_minutes: durationMinutes,
      route_geometry: {
        type: 'LineString',
        coordinates: route.overview_polyline.points // Google's encoded polyline
      },
      google_data: {
        polyline: route.overview_polyline.points,
        bounds: route.bounds,
        legs: route.legs.map((leg: any) => ({
          distance: leg.distance,
          duration: leg.duration,
          start_location: leg.start_location,
          end_location: leg.end_location,
          start_address: leg.start_address,
          end_address: leg.end_address
        }))
      }
    };

    console.log('✅ Route calculated successfully:', {
      distance: `${distanceKm} km`,
      duration: `${durationMinutes} min`,
      legs: route.legs.length
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in google-directions function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
