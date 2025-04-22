import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
} 