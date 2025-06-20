
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
      throw new Error('Google Maps API key not configured');
    }

    console.log('✅ API Key configured');

    // Validate coordinates
    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      throw new Error('Invalid origin or destination coordinates');
    }

    // Build waypoints string for Google API
    let waypointsParam = '';
    if (waypoints.length > 0) {
      const waypointStrings = waypoints.map(wp => `${wp.lat},${wp.lng}`);
      waypointsParam = `&waypoints=${waypointStrings.join('|')}`;
    }

    // Call Google Directions API with retry logic
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${waypointsParam}&key=${googleMapsApiKey}`;
    
    console.log('🌐 Calling Google Directions API');
    let response;
    let data;
    
    // Retry logic for API calls
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(directionsUrl);
        
        if (!response.ok) {
          console.error(`❌ HTTP error (attempt ${attempt}):`, response.status, response.statusText);
          if (attempt === 3) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        data = await response.json();
        break;
      } catch (error) {
        console.error(`❌ Fetch error (attempt ${attempt}):`, error);
        if (attempt === 3) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    console.log('📦 Google API Response status:', data.status);

    if (data.status !== 'OK') {
      console.error('❌ Google Directions API error:', data.status, data.error_message);
      
      // Provide fallback calculation for specific errors
      if (data.status === 'ZERO_RESULTS' || data.status === 'NOT_FOUND') {
        console.log('🔄 Providing fallback calculation');
        const fallbackDistance = calculateDirectDistance(origin, destination);
        const fallbackDuration = Math.round(fallbackDistance * 1.2); // 1.2 min per km estimate
        
        return new Response(
          JSON.stringify({
            success: true,
            distance_km: Math.round(fallbackDistance * 1.3 * 100) / 100, // Add 30% for real roads
            duration_minutes: fallbackDuration,
            route_geometry: {
              type: 'LineString',
              coordinates: '' // No polyline for fallback
            },
            fallback: true,
            google_data: {
              polyline: '',
              bounds: null,
              legs: []
            }
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      let errorMessage = `Google Directions API error: ${data.status}`;
      if (data.error_message) {
        errorMessage += ` - ${data.error_message}`;
      }
      
      throw new Error(errorMessage);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = data.routes[0];

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    route.legs.forEach((leg: any) => {
      totalDistance += leg.distance.value; // meters
      totalDuration += leg.duration.value; // seconds
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
    console.error('❌ Error in google-directions function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error'
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

// Helper function to calculate direct distance
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
