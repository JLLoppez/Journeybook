import { Request, Response } from 'express';
import { Flight } from '../models/Flight';
import airports from '../../data/airports.json';
import airlines from '../../data/airlines.json';
import { getDistance } from 'geolib';

const CABIN_MULTIPLIERS: Record<string, number> = {
  economy: 1,
  business: 2.8,
  first: 5.2,
};

const AIRLINE_IATA: Record<string, string> = {
  'Emirates': 'EK', 'Qatar Airways': 'QR', 'British Airways': 'BA',
  'Lufthansa': 'LH', 'Air France': 'AF', 'KLM': 'KL',
  'Turkish Airlines': 'TK', 'Singapore Airlines': 'SQ', 'Etihad Airways': 'EY',
  'South African Airways': 'SA', 'Comair': 'MN', 'Airlink': '4Z',
  'FlySafair': 'FA', 'Kulula': 'MN', 'Air Mauritius': 'MK',
  'Kenya Airways': 'KQ', 'Ethiopian Airlines': 'ET', 'EgyptAir': 'MS',
  'Air Arabia': 'G9', 'flydubai': 'FZ', 'Air Portugal': 'TP',
  'Iberia': 'IB', 'Alitalia': 'AZ', 'Swiss': 'LX',
  'Austrian Airlines': 'OS', 'Brussels Airlines': 'SN', 'Finnair': 'AY',
  'Scandinavian Airlines': 'SK', 'United Airlines': 'UA', 'Delta Air Lines': 'DL',
  'American Airlines': 'AA', 'Air Canada': 'AC', 'Qantas': 'QF',
};

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

const formatTime = (date: Date): string => {
  return date.toISOString().slice(11, 16);
};

const generateFlights = (
  originAirport: any,
  destAirport: any,
  date: string,
  cabinClass: string,
  count: number = 6
) => {
  const distanceMeters = getDistance(
    { latitude: originAirport.lat, longitude: originAirport.lon },
    { latitude: destAirport.lat, longitude: destAirport.lon }
  );
  const distanceKm = Math.round(distanceMeters / 1000);

  // Flight duration based on distance (avg 850 km/h)
  const baseDurationMinutes = Math.round((distanceKm / 850) * 60) + 45; // +45 for taxi/takeoff

  // Base price per km (ZAR)
  const basePrice = Math.round(distanceKm * 0.18 + 800);
  const multiplier = CABIN_MULTIPLIERS[cabinClass] || 1;

  const stops = distanceKm > 8000 ? 1 : distanceKm > 4000 ? randomBetween(0, 1) : 0;

  const flights = [];
  const departureDate = new Date(date);

  // Generate departure times spread through the day
  const departureTimes = [
    randomBetween(5, 8),   // early morning
    randomBetween(8, 11),  // morning
    randomBetween(11, 14), // midday
    randomBetween(14, 17), // afternoon
    randomBetween(17, 20), // evening
    randomBetween(20, 23), // night
  ].slice(0, count);

  for (let i = 0; i < count; i++) {
    const airline = (airlines as any[])[randomBetween(0, airlines.length - 1)];
    const iataCode = AIRLINE_IATA[airline.name] || 'FL';
    const flightNumber = iataCode + randomBetween(100, 999);

    const depHour = departureTimes[i];
    const depMinute = randomBetween(0, 55);
    const depDateTime = new Date(departureDate);
    depDateTime.setHours(depHour, depMinute, 0, 0);

    // Add extra time for stops
    const stopExtra = stops * randomBetween(60, 120);
    const totalDuration = baseDurationMinutes + stopExtra + randomBetween(-20, 30);
    const arrDateTime = addMinutes(depDateTime, totalDuration);

    // Price variation per flight
    const priceVariation = randomBetween(-15, 25) / 100;
    const finalPrice = Math.round(basePrice * multiplier * (1 + priceVariation) / 100) * 100;

    flights.push({
      airline: airline.name,
      logo: airline.logo,
      flightNumber,
      origin: {
        code: originAirport.iata,
        city: originAirport.city,
        airport: originAirport.name,
        country: originAirport.country,
      },
      destination: {
        code: destAirport.iata,
        city: destAirport.city,
        airport: destAirport.name,
        country: destAirport.country,
      },
      departure: {
        date: depDateTime,
        time: formatTime(depDateTime),
      },
      arrival: {
        date: arrDateTime,
        time: formatTime(arrDateTime),
      },
      duration: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
      distanceKm,
      price: finalPrice,
      availableSeats: randomBetween(4, 180),
      class: cabinClass,
      stops,
      amenities: cabinClass === 'economy'
        ? ['Cabin baggage', 'Meal included']
        : cabinClass === 'business'
        ? ['Cabin baggage', 'Checked baggage', 'Meal included', 'Lounge access', 'Extra legroom']
        : ['Cabin baggage', 'Checked baggage', 'Gourmet dining', 'Lounge access', 'Flat bed', 'Chauffeur service'],
    });
  }

  return flights.sort((a, b) => a.departure.date.getTime() - b.departure.date.getTime());
};

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const origin = String(req.query.origin || '').toUpperCase().trim();
    const destination = String(req.query.destination || '').toUpperCase().trim();
    const date = String(req.query.date || req.query.departureDate || '').trim();
    const cabinClass = String(req.query.cabinClass || 'economy').toLowerCase().trim();

    if (!origin || !destination || !date) {
      return res.status(400).json({ message: 'origin, destination and date are required' });
    }

    const originAirport = (airports as any[]).find(a => a.iata === origin);
    const destAirport = (airports as any[]).find(a => a.iata === destination);

    if (!originAirport || !destAirport) {
      return res.status(404).json({
        message: `Airport not found: ${!originAirport ? origin : destination}`,
        flights: [],
      });
    }

    const flights = generateFlights(originAirport, destAirport, date, cabinClass, 6);

    return res.status(200).json({
      count: flights.length,
      flights,
      source: 'simulated',
      route: {
        origin: { code: originAirport.iata, city: originAirport.city, country: originAirport.country },
        destination: { code: destAirport.iata, city: destAirport.city, country: destAirport.country },
        distanceKm: flights[0]?.distanceKm,
      },
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    return res.status(500).json({ message: 'Failed to search flights', details: error.message });
  }
};

export const getAllFlights = async (_req: Request, res: Response) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(flights);
  } catch (error) {
    console.error('Get all flights error:', error);
    return res.status(500).json({ message: 'Failed to fetch flights' });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findById(req.params.id).lean();
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    return res.status(200).json(flight);
  } catch (error) {
    console.error('Get flight by id error:', error);
    return res.status(500).json({ message: 'Failed to fetch flight' });
  }
};
