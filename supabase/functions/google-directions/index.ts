
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

    console.log('✅ API Key found, length:', googleMapsApiKey.length);

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

    // Call Google Directions API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${waypointsParam}&key=${googleMapsApiKey}`;
    
    console.log('🌐 Calling Google Directions API');
    const response = await fetch(directionsUrl);
    
    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Google API Response status:', data.status);

    if (data.status !== 'OK') {
      console.error('❌ Google Directions API error:', data.status, data.error_message);
      
      // Provide more specific error messages
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
