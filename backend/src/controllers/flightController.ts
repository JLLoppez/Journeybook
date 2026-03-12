import { Request, Response } from 'express';
import axios from 'axios';
import { Flight } from '../models/Flight';

type DuffelOffer = {
  total_amount?: string;
  slices?: Array<{
    origin?: { iata_code?: string; city_name?: string; name?: string };
    destination?: { iata_code?: string; city_name?: string; name?: string };
    segments?: Array<{
      departing_at?: string;
      arriving_at?: string;
      marketing_carrier?: {
        name?: string;
        iata_code?: string;
      };
    }>;
  }>;
  cabin_class?: string;
  owner?: {
    name?: string;
    iata_code?: string;
  };
};

const toDateParts = (iso?: string) => {
  if (!iso) {
    const now = new Date();
    return {
      date: now,
      time: now.toISOString().slice(11, 16),
    };
  }

  const d = new Date(iso);
  return {
    date: d,
    time: d.toISOString().slice(11, 16),
  };
};

const diffDuration = (start?: string, end?: string) => {
  if (!start || !end) return 'N/A';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 'N/A';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

const mapDuffelOffer = (offer: DuffelOffer, requestedOrigin: string, requestedDestination: string) => {
  const firstSlice = offer.slices?.[0];
  const firstSegment = firstSlice?.segments?.[0];

  const dep = toDateParts(firstSegment?.departing_at);
  const arr = toDateParts(firstSegment?.arriving_at);

  return {
    airline:
      firstSegment?.marketing_carrier?.name ||
      offer.owner?.name ||
      'Unknown Airline',
    flightNumber:
      `${firstSegment?.marketing_carrier?.iata_code || 'FL'}${Math.floor(100 + Math.random() * 900)}`,
    origin: {
      city: firstSlice?.origin?.city_name || requestedOrigin,
      airport: firstSlice?.origin?.name || requestedOrigin,
      code: firstSlice?.origin?.iata_code || requestedOrigin,
    },
    destination: {
      city: firstSlice?.destination?.city_name || requestedDestination,
      airport: firstSlice?.destination?.name || requestedDestination,
      code: firstSlice?.destination?.iata_code || requestedDestination,
    },
    departure: dep,
    arrival: arr,
    duration: diffDuration(firstSegment?.departing_at, firstSegment?.arriving_at),
    price: Number(offer.total_amount || 0),
    availableSeats: 9,
    class: (offer.cabin_class || 'economy').toLowerCase(),
    amenities: ['Cabin baggage'],
    stops: Math.max((firstSlice?.segments?.length || 1) - 1, 0),
  };
};

const searchDuffelFlights = async (origin: string, destination: string, date: string, cabinClass?: string) => {
  const apiKey = process.env.DUFFEL_API_KEY;

  if (!apiKey || !apiKey.startsWith('duffel_')) {
    return [];
  }

  const payload = {
    slices: [
      {
        origin,
        destination,
        departure_date: date,
      },
    ],
    passengers: [{ type: 'adult' }],
    cabin_class: (cabinClass || 'economy').toLowerCase(),
  };

  const response = await axios.post(
    'https://api.duffel.com/air/offer_requests',
    payload,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );

  console.log('Duffel raw response:', JSON.stringify(response.data, null, 2));
  const offers =
    response.data?.data?.offers ||
    response.data?.data ||
    response.data?.offers ||
    [];

  return Array.isArray(offers)
    ? offers.map((offer: DuffelOffer) => mapDuffelOffer(offer, origin, destination))
    : [];
};

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const origin = String(req.query.origin || '').toUpperCase().trim();
    const destination = String(req.query.destination || '').toUpperCase().trim();
    const date = String(req.query.date || req.query.departureDate || '').trim();
    const cabinClass = String(req.query.cabinClass || 'economy').toLowerCase().trim();

    if (!origin || !destination || !date) {
      return res.status(400).json({
        message: 'origin, destination and date are required',
      });
    }

    try {
      const liveFlights = await searchDuffelFlights(origin, destination, date, cabinClass);

      if (liveFlights.length > 0) {
        await Flight.deleteMany({
          'origin.code': origin,
          'destination.code': destination,
          class: cabinClass,
        });

        await Flight.insertMany(liveFlights);

        return res.status(200).json({
          count: liveFlights.length,
          flights: liveFlights,
          source: 'duffel',
        });
      }
    } catch (duffelError: any) {
      console.error(
        'Duffel search failed, falling back to database:',
        duffelError?.response?.data || duffelError?.message || duffelError
      );
    }

    const searchDate = new Date(date);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const dbFlights = await Flight.find({
      'origin.code': origin,
      'destination.code': destination,
      class: cabinClass,
      'departure.date': { $gte: searchDate, $lt: nextDate },
    }).lean();

    if (dbFlights.length > 0) {
      return res.status(200).json({
        count: dbFlights.length,
        flights: dbFlights,
        source: 'database',
      });
    }

    const fallbackFlights = await Flight.find({
      'origin.code': origin,
      'destination.code': destination,
      'departure.date': { $gte: searchDate, $lt: nextDate },
    }).lean();

    return res.status(200).json({
      count: fallbackFlights.length,
      flights: fallbackFlights,
      source: fallbackFlights.length ? 'database' : 'none',
    });
  } catch (error: any) {
    const details =
      error?.response?.data ||
      error?.message ||
      error?.stack ||
      error;

    console.error('Flight search error details:', details);

    return res.status(500).json({
      message: 'Failed to search flights',
      details: process.env.NODE_ENV !== 'production' ? details : undefined,
    });
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

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    return res.status(200).json(flight);
  } catch (error) {
    console.error('Get flight by id error:', error);
    return res.status(500).json({ message: 'Failed to fetch flight' });
  }
};
