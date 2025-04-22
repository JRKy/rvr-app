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

  const { start, end } = req.query;
  const apiKey = process.env.VITE_OPENROUTE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end coordinates' });
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/directions/driving-hgv?api_key=${apiKey}&start=${start}&end=${end}`,
      {
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService API error:', errorText);
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate route', details: error.message });
  }
} 