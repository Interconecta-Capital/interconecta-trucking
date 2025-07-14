

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DirectionsRequest {
  origin: { lat: number; lng: number } | string;
  destination: { lat: number; lng: number } | string;
  waypoints?: { lat: number; lng: number }[];
  action?: 'geocode' | 'directions';
  address?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody: DirectionsRequest;
  
  try {
    requestBody = await req.json();
  } catch (error) {
    console.error('❌ Error parsing request body:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid request format',
        fallback_available: false
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  const { action, address, origin, destination, waypoints = [] } = requestBody;

  // Handle geocoding requests
  if (action === 'geocode' && address) {
    console.log('📍 [GEOCODE] Iniciando geocodificación para:', address);
    
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!googleMapsApiKey) {
      console.error('❌ [GEOCODE] Google Maps API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Maps API key not configured',
          fallback_available: false
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}&region=mx&language=es`;
      console.log('🌐 [GEOCODE] Llamando a Google Maps API:', geocodeUrl.replace(googleMapsApiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(geocodeUrl);
      console.log('📡 [GEOCODE] Respuesta HTTP status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ [GEOCODE] HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ [GEOCODE] Error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📦 [GEOCODE] Respuesta de Google Maps:', JSON.stringify(data, null, 2));
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log('✅ [GEOCODE] Geocodificación exitosa:', result.formatted_address);
        
        return new Response(
          JSON.stringify({
            success: true,
            results: [result]
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        console.error('❌ [GEOCODE] Google Maps status:', data.status, 'Error message:', data.error_message);
        const errorMsg = data.error_message || `Google Maps status: ${data.status}`;
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `No se encontraron resultados: ${errorMsg}`,
            google_status: data.status,
            fallback_available: false
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error en geocodificación: ' + error.message,
          fallback_available: false
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  }
    
  console.log('🚀 Calculating route with Google Routes API v2');
  console.log('📍 Origin:', origin);
  console.log('📍 Destination:', destination);
  console.log('🛤️ Waypoints:', waypoints);

  // Enhanced coordinate validation for directions
  if (typeof origin !== 'object' || typeof destination !== 'object' ||
      !origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng ||
      Math.abs(origin.lat) > 90 || Math.abs(origin.lng) > 180 ||
      Math.abs(destination.lat) > 90 || Math.abs(destination.lng) > 180) {
    console.error('❌ Invalid coordinates provided');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid origin or destination coordinates',
        fallback_available: false
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  // Helper function to create fallback response
  const createFallbackResponse = (reason: string) => {
    console.log('🔄 Creating fallback response:', reason);
    const fallbackDistance = calculateDirectDistance(origin, destination);
    const adjustedDistance = Math.round(fallbackDistance * 1.4 * 100) / 100;
    const fallbackDuration = Math.round(adjustedDistance * 1.5);
    
    return {
      success: true,
      distance_km: adjustedDistance,
      duration_minutes: fallbackDuration,
      fallback: true,
      fallback_reason: reason,
      google_data: {
        legs: [{
          distance: { text: `${adjustedDistance} km`, value: adjustedDistance * 1000 },
          duration: { text: `${Math.floor(fallbackDuration/60)}h ${fallbackDuration%60}m`, value: fallbackDuration * 60 },
          start_location: origin,
          end_location: destination
        }]
      }
    };
  };

  // Get API key from environment - CONFIGURADA CON TU CLAVE
  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  
  if (!googleMapsApiKey) {
    console.error('❌ Google Maps API key not found in environment');
    const fallbackResponse = createFallbackResponse('API key not configured in Supabase secrets');
    
    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  console.log('✅ Google Maps API Key found and configured:', googleMapsApiKey.substring(0, 10) + '...');

  // Prepare intermediates for waypoints
  const intermediates = waypoints.length > 0 ? waypoints.map(wp => ({
    location: {
      latLng: {
        latitude: wp.lat,
        longitude: wp.lng
      }
    }
  })) : [];

  // Build request body for Google Routes API v2
  const routesRequestBody = {
    origin: {
      location: {
        latLng: {
          latitude: origin.lat,
          longitude: origin.lng
        }
      }
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.lat,
          longitude: destination.lng
        }
      }
    },
    ...(intermediates.length > 0 && { intermediates }),
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
    },
    languageCode: "es-MX",
    regionCode: "MX"
  };

  // Use Google Routes API v2
  const routesUrl = `https://routes.googleapis.com/directions/v2:computeRoutes`;
  
  console.log('🌐 Calling Google Routes API v2 with configured key');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(routesUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleMapsApiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs'
      },
      body: JSON.stringify(routesRequestBody)
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      const fallbackResponse = createFallbackResponse(`HTTP error: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify(fallbackResponse),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const data = await response.json();
    console.log('📦 Google Routes API Response received successfully');

    if (!data.routes || data.routes.length === 0) {
      console.error('❌ No routes found in Google response');
      const fallbackResponse = createFallbackResponse('No routes found');
      
      return new Response(
        JSON.stringify(fallbackResponse),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const route = data.routes[0];

    // Extract distance and duration from the new API format
    const distanceMeters = route.distanceMeters || 0;
    const durationSeconds = route.duration ? parseInt(route.duration.replace('s', '')) : 0;

    // Validate calculated values
    if (distanceMeters === 0 || durationSeconds === 0) {
      console.warn('⚠️ Invalid distance or duration from Google, using fallback');
      const fallbackResponse = createFallbackResponse('Invalid Google response data');
      
      return new Response(
        JSON.stringify(fallbackResponse),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Convert to km and minutes
    const distanceKm = Math.round(distanceMeters / 1000 * 100) / 100;
    const durationMinutes = Math.round(durationSeconds / 60);

    const result = {
      success: true,
      distance_km: distanceKm,
      duration_minutes: durationMinutes,
      fallback: false,
      google_data: {
        legs: route.legs || [{
          distance: { text: `${distanceKm} km`, value: distanceMeters },
          duration: { text: `${Math.floor(durationMinutes/60)}h ${durationMinutes%60}m`, value: durationSeconds },
          start_location: origin,
          end_location: destination
        }]
      }
    };

    console.log('✅ Route calculated successfully with Google Routes API v2:', {
      distance: result.distance_km,
      duration: result.duration_minutes,
      api_key_configured: true
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
    console.error('❌ Error calling Google Routes API:', error);
    
    const fallbackResponse = createFallbackResponse(`Network error: ${error.message || 'Unknown error'}`);
    
    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to calculate direct distance (Haversine formula)
function calculateDirectDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

