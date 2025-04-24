export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  });

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    const url = new URL(req.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    if (!start || !end) {
      return new Response(
        JSON.stringify({ error: 'Missing start or end coordinates' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Use OSRM's routing service
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
    console.log('OSRM API URL:', osrmUrl);

    const response = await fetch(osrmUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log('OSRM API Response Status:', response.status);
    console.log('OSRM API Response Body:', responseText);

    if (!response.ok) {
      console.error('OSRM API error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to calculate route',
          details: responseText
        }),
        { 
          status: response.status, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Route calculation successful');
      return new Response(
        JSON.stringify(data),
        { 
          status: 200, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse route data',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        }),
        { 
          status: 500, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Route calculation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to calculate route',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  }
} 