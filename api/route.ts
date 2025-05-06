import { VercelRequest, VercelResponse } from '@vercel/node';

const isDev = process.env.NODE_ENV === 'development';

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

    if (!start || !end) {
      return res.status(400).json({ error: 'Missing start or end coordinates' });
    }

    // Use OSRM's routing service
    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
    if (isDev) {
      console.log('OSRM API URL:', url);
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const responseText = await response.text();
    if (isDev) {
      console.log('OSRM API Response Status:', response.status);
      console.log('OSRM API Response Body:', responseText);
    }

    if (!response.ok) {
      if (isDev) {
        console.error('OSRM API error:', responseText);
      }
      return res.status(response.status).json({ 
        error: 'Failed to calculate route',
        details: responseText
      });
    }

    try {
      const data = JSON.parse(responseText);
      if (isDev) {
        console.log('Route calculation successful');
      }
      res.status(200).json(data);
    } catch (parseError) {
      if (isDev) {
        console.error('Failed to parse API response:', parseError);
      }
      return res.status(500).json({ 
        error: 'Failed to parse route data',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      });
    }
  } catch (error) {
    if (isDev) {
      console.error('Route calculation error:', error);
    }
    res.status(500).json({ 
      error: 'Failed to calculate route',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 