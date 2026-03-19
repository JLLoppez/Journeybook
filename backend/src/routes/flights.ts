import express, { Request, Response } from 'express';
import airports from '../../data/airports.json';
import airlines from '../../data/airlines.json';
import { getDistance } from 'geolib';

const router = express.Router();

router.get('/airports', (req: Request, res: Response) => {
  const q = (req.query.q as string)?.toLowerCase();
  if (!q) { res.json([]); return; }

  const results = (airports as any[])
    .filter(a =>
      a.city?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.iata?.toLowerCase().includes(q)
    )
    .slice(0, 8);

  res.json(results);
});

router.get('/search', (req: Request, res: Response) => {
  const { from, to } = req.query;

  const a1 = (airports as any[]).find(a => a.iata === from);
  const a2 = (airports as any[]).find(a => a.iata === to);

  if (!a1 || !a2) { res.json([]); return; }

  const distance = getDistance(
    { latitude: a1.lat, longitude: a1.lon },
    { latitude: a2.lat, longitude: a2.lon }
  );

  const duration = Math.round(distance / 850000 * 60);

  const flights = Array.from({ length: 6 }).map(() => {
    const airline = (airlines as any[])[Math.floor(Math.random() * airlines.length)];
    const price = Math.floor(distance / 1000 * 0.12) + 200;
    return {
      airline: airline.name,
      logo: airline.logo,
      from,
      to,
      distance_km: Math.round(distance / 1000),
      duration: Math.floor(duration / 60) + 'h ' + (duration % 60) + 'm',
      departure: Math.floor(Math.random() * 23) + ':' + String(Math.floor(Math.random() * 59)).padStart(2, '0'),
      arrival: Math.floor(Math.random() * 23) + ':' + String(Math.floor(Math.random() * 59)).padStart(2, '0'),
      price,
    };
  });

  res.json(flights);
});

export default router;
