
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

    // Intentar diferentes nombres de secretos que pueden estar configurados
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || 
                             Deno.env.get('Publicaciones_interconecta') ||
                             Deno.env.get('GOOGLE_API_KEY') ||
                             Deno.env.get('MAPS_API_KEY');
    
    if (!googleMapsApiKey) {
      console.error('❌ Google Maps API key not found in any expected environment variable');
      console.log('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => 
        key.toLowerCase().includes('google') || key.toLowerCase().includes('map')
      ));
      
      // Provide enhanced fallback calculation
      console.log('🔄 Using enhanced fallback calculation');
      const fallbackDistance = calculateDirectDistance(origin, destination);
      const fallbackDuration = Math.round(fallbackDistance * 1.5); // 1.5 min per km estimate for Mexico
      
      return new Response(
        JSON.stringify({
          success: true,
          distance_km: Math.round(fallbackDistance * 1.4 * 100) / 100, // Add 40% for real roads in Mexico
          duration_minutes: fallbackDuration,
          route_geometry: {
            type: 'LineString',
            coordinates: ''
          },
          fallback: true,
          fallback_reason: 'API key not configured correctly',
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

    console.log('✅ API Key found and configured');

    // Enhanced coordinate validation
    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng ||
        Math.abs(origin.lat) > 90 || Math.abs(origin.lng) > 180 ||
        Math.abs(destination.lat) > 90 || Math.abs(destination.lng) > 180) {
      throw new Error('Invalid origin or destination coordinates');
    }

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

    // Enhanced Google Directions API call with comprehensive retry logic
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${waypointsParam}&key=${googleMapsApiKey}&language=es&region=mx`;
    
    console.log('🌐 Calling Google Directions API');
    let response;
    let data;
    
    // Enhanced retry logic with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        response = await fetch(directionsUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'CartaPorte-App/1.0',
            'Accept': 'application/json',
            'Referer': 'https://qulhweffinppyjpfkknh.supabase.co'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`❌ HTTP error (attempt ${attempt}):`, response.status, response.statusText);
          if (attempt === 3) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
          }
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        data = await response.json();
        console.log('📦 Google API Response status:', data.status);
        break;
        
      } catch (error) {
        console.error(`❌ Fetch error (attempt ${attempt}):`, error);
        if (attempt === 3) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Enhanced error handling for different Google API statuses
    if (data.status !== 'OK') {
      console.error('❌ Google Directions API error:', data.status, data.error_message);
      
      // Provide smart fallback calculations for specific errors
      if (['ZERO_RESULTS', 'NOT_FOUND', 'INVALID_REQUEST'].includes(data.status)) {
        console.log('🔄 Providing smart fallback calculation');
        const fallbackDistance = calculateDirectDistance(origin, destination);
        
        // Enhanced distance calculation based on Mexican geography
        let distanceMultiplier = 1.3; // Base multiplier
        if (fallbackDistance > 1000) distanceMultiplier = 1.2; // Long distances are more direct
        if (fallbackDistance < 50) distanceMultiplier = 1.6; // Short distances have more detours
        
        const adjustedDistance = Math.round(fallbackDistance * distanceMultiplier * 100) / 100;
        const fallbackDuration = Math.round(adjustedDistance * 1.2); // 1.2 min per km average in Mexico
        
        return new Response(
          JSON.stringify({
            success: true,
            distance_km: adjustedDistance,
            duration_minutes: fallbackDuration,
            route_geometry: {
              type: 'LineString',
              coordinates: generateStraightLinePolyline(origin, destination)
            },
            fallback: true,
            fallback_reason: `Google API error: ${data.status}`,
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
      throw new Error('No routes found in Google response');
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
      const fallbackDistance = calculateDirectDistance(origin, destination);
      totalDistance = fallbackDistance * 1300; // Convert to meters with multiplier
      totalDuration = fallbackDistance * 72; // ~1.2 min per km converted to seconds
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
    console.error('❌ Error in google-directions function:', error);
    
    // Enhanced fallback when everything fails
    try {
      const body = await req.json();
      if (body.origin && body.destination) {
        console.log('🔄 Providing emergency fallback calculation');
        const fallbackDistance = calculateDirectDistance(body.origin, body.destination);
        const adjustedDistance = Math.round(fallbackDistance * 1.35 * 100) / 100;
        const fallbackDuration = Math.round(adjustedDistance * 1.3);
        
        return new Response(
          JSON.stringify({
            success: true,
            distance_km: adjustedDistance,
            duration_minutes: fallbackDuration,
            route_geometry: {
              type: 'LineString',
              coordinates: generateStraightLinePolyline(body.origin, body.destination)
            },
            fallback: true,
            fallback_reason: `Service error: ${error.message}`,
            google_data: {
              polyline: generateStraightLinePolyline(body.origin, body.destination),
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
    } catch (fallbackError) {
      console.error('❌ Emergency fallback also failed:', fallbackError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        fallback_available: false
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

// Enhanced helper function to calculate direct distance (Haversine formula)
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
  // This is a simplified polyline - in production you might want to use a proper encoding library
  return `${origin.lat},${origin.lng};${destination.lat},${destination.lng}`;
}
