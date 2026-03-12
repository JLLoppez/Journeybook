export interface FlightOriginDest {
  city: string;
  airport: string;
  code: string;
}

export interface Flight {
  _id: string;
  airline: string;
  airlineCode?: string;
  airlineLogo?: string | null;
  flightNumber: string;
  origin: FlightOriginDest;
  destination: FlightOriginDest;
  departure: { date: string; time: string };
  arrival: { date: string; time: string };
  duration: string;
  price: number;
  originalPrice?: number;
  originalCurrency?: string;
  availableSeats: number;
  class: 'economy' | 'business' | 'first';
  amenities: string[];
  stops: number;
  isLive?: boolean;
  source?: 'duffel' | 'database';
  duffelOfferId?: string;
  offerExpiresAt?: string;
  co2Emissions?: string | null;
  conditions?: object | null;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  flight: Flight;
  passengers: number;
  class: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  contactEmail: string;
  contactPhone: string;
  savedItinerary?: object;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  class?: string;
  passengers?: string;
}

export interface TravelPlanDay {
  day: number;
  title: string;
  activities: string[];
  accommodation?: string;
  estimatedCost?: number;
}

export interface TravelPlan {
  destination: string;
  duration: string;
  totalBudget: string;
  summary: string;
  itinerary: TravelPlanDay[];
  flights: Flight[];
  tips: string[];
  bestTimeToVisit?: string;
  requiredDocuments?: string[];
}
