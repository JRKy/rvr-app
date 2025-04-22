import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { start, end } = req.query;
    const apiKey = process.env.VITE_OPENROUTE_API_KEY;

    if (!apiKey) {
      console.error('OpenRouteService API key is missing');
      return res.status(500).json({ error: 'API key not configured' });
    }

    if (!start || !end) {
      return res.status(400).json({ error: 'Missing start or end coordinates' });
    }

    console.log('Calculating route with coordinates:', { start, end });

    const url = `https://api.openrouteservice.org/directions/driving-hgv?api_key=${apiKey}&start=${start}&end=${end}`;
    console.log('OpenRouteService API URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('OpenRouteService API Response Status:', response.status);
    console.log('OpenRouteService API Response Headers:', response.headers);
    console.log('OpenRouteService API Response Body:', responseText);

    if (!response.ok) {
      console.error('OpenRouteService API error:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: responseText
      });
      return res.status(response.status).json({ 
        error: 'Failed to calculate route',
        status: response.status,
        statusText: response.statusText,
        details: responseText
      });
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Route calculation successful');
      res.status(200).json(data);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse route data',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        responseText: responseText
      });
    }
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate route',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 