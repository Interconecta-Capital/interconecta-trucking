
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
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  const { origin, destination, waypoints = [] } = requestBody;
    
  console.log('🚀 Calculating route with Google Directions API');
  console.log('📍 Origin:', origin);
  console.log('📍 Destination:', destination);
  console.log('🛤️ Waypoints:', waypoints);

  // Enhanced coordinate validation
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng ||
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
        status: 400,
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
      route_geometry: {
        type: 'LineString',
        coordinates: generateStraightLinePolyline(origin, destination)
      },
      fallback: true,
      fallback_reason: reason,
      google_data: {
        polyline: generateStraightLinePolyline(origin, destination),
        bounds: {
          northeast: {
            lat: Math.max(origin.lat, destination.lat),
            lng: Math.max(origin.lng, destination.lng)
          },
          southwest: {
            lat: Math.min(origin.lat, destination.lat),
            lng: Math.min(origin.lng, destination.lng)
          }
        },
        legs: [{
          distance: { text: `${adjustedDistance} km`, value: adjustedDistance * 1000 },
          duration: { text: `${Math.floor(fallbackDuration/60)}h ${fallbackDuration%60}m`, value: fallbackDuration * 60 },
          start_location: origin,
          end_location: destination
        }]
      }
    };
  };

  // Get the Google Maps API key from Supabase secrets
  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  
  if (!googleMapsApiKey) {
    console.error('❌ Google Maps API key not found in secrets');
    console.log('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => 
      key.toLowerCase().includes('google') || key.toLowerCase().includes('map')
    ));
    
    const fallbackResponse = createFallbackResponse('API key not configured');
    
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

  console.log('✅ Google Maps API Key found and configured');

  // Build waypoints string for Google API
  let waypointsParam = '';
  if (waypoints.length > 0) {
    const validWaypoints = waypoints.filter(wp => 
      wp.lat && wp.lng && Math.abs(wp.lat) <= 90 && Math.abs(wp.lng) <= 180
    );
    if (validWaypoints.length > 0) {
      const waypointStrings = validWaypoints.map(wp => `${wp.lat},${wp.lng}`);
      waypointsParam = `&waypoints=${waypointStrings.join('|')}`;
    }
  }

  // Enhanced Google Directions API call
  const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${waypointsParam}&key=${googleMapsApiKey}&language=es&region=mx&units=metric`;
  
  console.log('🌐 Calling Google Directions API');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(directionsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CartaPorte-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      const fallbackResponse = createFallbackResponse(`HTTP error: ${response.status}`);
      
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
    console.log('📦 Google API Response status:', data.status);

    // Handle different Google API response statuses
    if (data.status !== 'OK') {
      console.error('❌ Google Directions API error:', data.status, data.error_message);
      
      let fallbackReason = `Google API error: ${data.status}`;
      if (data.error_message) {
        fallbackReason += ` - ${data.error_message}`;
      }
      
      const fallbackResponse = createFallbackResponse(fallbackReason);
      
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

    // Calculate total distance and duration with validation
    let totalDistance = 0;
    let totalDuration = 0;

    if (route.legs && route.legs.length > 0) {
      route.legs.forEach((leg: any) => {
        if (leg.distance && leg.distance.value) {
          totalDistance += leg.distance.value; // meters
        }
        if (leg.duration && leg.duration.value) {
          totalDuration += leg.duration.value; // seconds
        }
      });
    }

    // Validate calculated values
    if (totalDistance === 0 || totalDuration === 0) {
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
    const distanceKm = Math.round(totalDistance / 1000 * 100) / 100;
    const durationMinutes = Math.round(totalDuration / 60);

    const result = {
      success: true,
      distance_km: distanceKm,
      duration_minutes: durationMinutes,
      route_geometry: {
        type: 'LineString',
        coordinates: route.overview_polyline?.points || ''
      },
      fallback: false,
      google_data: {
        polyline: route.overview_polyline?.points || '',
        bounds: route.bounds,
        legs: route.legs.map((leg: any) => ({
          distance: leg.distance,
          duration: leg.duration,
          start_location: leg.start_location,
          end_location: leg.end_location
        }))
      }
    };

    console.log('✅ Route calculated successfully:', {
      distance: result.distance_km,
      duration: result.duration_minutes,
      legs: result.google_data.legs.length
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
    console.error('❌ Error calling Google Directions API:', error);
    
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

// Generate a simple straight line polyline for fallback visualization
function generateStraightLinePolyline(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): string {
  return `${origin.lat},${origin.lng};${destination.lat},${destination.lng}`;
}
