import { Request, Response } from 'express';
import axios from 'axios';

export const searchLocations = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(200).json([]);

    const response = await axios.get('http://autocomplete.travelpayouts.com/places2', {
      params: {
        term: q,
        locale: 'en',
        'types[]': ['airport', 'city', 'country'],
      },
      timeout: 15000,
    });

    const raw = Array.isArray(response.data) ? response.data : [];

    const normalized = raw.slice(0, 10).map((item: any) => ({
      city: item.city_name || item.name || '',
      country: item.country_name || '',
      airport: item.name || item.city_name || '',
      code: item.code || item.iata || '',
      type: item.type || 'place',
    })).filter((item: any) => item.code || item.city || item.airport);

    return res.status(200).json(normalized);
  } catch (error: any) {
    console.error('Location search error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ message: 'Failed to search locations' });
  }
};
