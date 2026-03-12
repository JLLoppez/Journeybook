import { Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { AuthRequest } from '../middleware/auth';
import { Flight } from '../models/Flight';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

interface ItineraryDay {
  day: number;
  date?: string;
  title: string;
  activities: string[];
  accommodation?: string;
  flight?: any;
  estimatedCost?: number;
}

interface TravelPlan {
  destination: string;
  duration: string;
  totalBudget: string;
  summary: string;
  itinerary: ItineraryDay[];
  flights: any[];
  tips: string[];
  bestTimeToVisit?: string;
}

export const generateTravelPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, origin = 'CPT', budget, duration } = req.body;

    if (!prompt) { res.status(400).json({ error: 'Travel prompt is required' }); return; }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_key_here') {
      // Return a realistic mock plan for demo
      const mockPlan = generateMockPlan(prompt, origin, budget, duration);
      res.json({ plan: mockPlan, source: 'demo' });
      return;
    }

    // Fetch available flights from DB to give AI real options
    const availableFlights = await Flight.find({ availableSeats: { $gte: 1 } }).limit(20).lean();
    const flightSummary = availableFlights.slice(0, 8).map(f =>
      `${f.flightNumber}: ${f.origin.code}→${f.destination.code} R${f.price} (${f.class})`
    ).join('\n');

    const systemPrompt = `You are an expert AI travel planner for JourneyBook, a South African travel platform. 
You create detailed, practical travel itineraries. Always respond in valid JSON only – no markdown, no extra text.
Available flights in our system:
${flightSummary || 'No flights in DB – suggest general flight options.'}
Prices are in South African Rand (ZAR). Be realistic about costs from South Africa.`;

    const userMessage = `Create a travel plan for: "${prompt}"
${origin ? `Departing from: ${origin}` : ''}
${budget ? `Budget: R${budget}` : ''}
${duration ? `Duration: ${duration} days` : ''}

Respond ONLY with this JSON structure:
{
  "destination": "string",
  "duration": "string",
  "totalBudget": "string (ZAR estimate)",
  "summary": "string (2-3 sentences)",
  "itinerary": [
    { "day": 1, "title": "string", "activities": ["string"], "accommodation": "string", "estimatedCost": number }
  ],
  "tips": ["string"],
  "bestTimeToVisit": "string",
  "requiredDocuments": ["string"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const plan: TravelPlan = JSON.parse(clean);

    // Attach real flights from DB matching the destination
    const destCode = extractDestCode(plan.destination);
    const matchedFlights = destCode
      ? availableFlights.filter(f => f.destination.code === destCode).slice(0, 2)
      : [];
    plan.flights = matchedFlights;

    res.json({ plan, source: 'ai' });
  } catch (error: any) {
    console.error('AI planner error:', error);
    // Fallback to mock on error
    const mockPlan = generateMockPlan(req.body.prompt, req.body.origin, req.body.budget, req.body.duration);
    res.json({ plan: mockPlan, source: 'demo', warning: 'AI unavailable – showing sample plan' });
  }
};

function extractDestCode(destination: string): string | null {
  const map: Record<string, string> = {
    zanzibar: 'ZNZ', nairobi: 'NBO', dubai: 'DXB', london: 'LHR',
    'new york': 'JFK', paris: 'CDG', sydney: 'SYD', amsterdam: 'AMS',
    johannesburg: 'JNB', 'cape town': 'CPT', addis: 'ADD', accra: 'ACC',
  };
  const lower = destination.toLowerCase();
  for (const [key, code] of Object.entries(map)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

function generateMockPlan(prompt: string, origin: string, budget?: string, duration?: string): TravelPlan {
  const dest = detectDestination(prompt);
  const days = parseInt(duration || '5');
  return {
    destination: dest.name,
    duration: `${days} days`,
    totalBudget: budget ? `R${budget}` : dest.budget,
    summary: dest.summary,
    itinerary: dest.itinerary.slice(0, days).map((day, i) => ({ ...day, day: i + 1 })),
    flights: [],
    tips: dest.tips,
    bestTimeToVisit: dest.bestTime,
  };
}

function detectDestination(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes('zanzibar')) return zanzibarPlan();
  if (p.includes('nairobi') || p.includes('kenya')) return nairobiPlan();
  if (p.includes('dubai')) return dubaiPlan();
  return zanzibarPlan(); // default
}

function zanzibarPlan() {
  return {
    name: 'Zanzibar, Tanzania',
    budget: 'R18,000–R25,000 per person',
    bestTime: 'June–October (dry season)',
    summary: 'Zanzibar offers pristine beaches, rich Swahili culture, and incredible marine life. A perfect tropical getaway from South Africa.',
    tips: ['Book snorkelling tours in advance', 'Carry cash – ATMs are unreliable', 'Respect local culture and dress conservatively in Stone Town', 'Try the local street food at Forodhani Gardens night market'],
    itinerary: [
      { day: 1, title: 'Arrival & Stone Town Exploration', activities: ['Fly CPT→ZNZ via Nairobi', 'Check into hotel', 'Evening walk in Stone Town', 'Dinner at Forodhani Gardens'], accommodation: 'Stone Town Heritage Hotel', estimatedCost: 3200 },
      { day: 2, title: 'Stone Town Deep Dive', activities: ['House of Wonders tour', 'Old Fort visit', 'Spice market exploration', 'Sunset cruise'], accommodation: 'Stone Town Heritage Hotel', estimatedCost: 1200 },
      { day: 3, title: 'Safari Blue Excursion', activities: ['Full-day Safari Blue boat trip', 'Snorkelling at Menai Bay', 'Sandbank lunch', 'Dolphin watching'], accommodation: 'Beach Resort Nungwi', estimatedCost: 1800 },
      { day: 4, title: 'Beach & Water Sports', activities: ['Morning kite surfing lesson', 'Afternoon relaxation at Nungwi Beach', 'Sundowner cocktails', 'Seafood dinner'], accommodation: 'Beach Resort Nungwi', estimatedCost: 1500 },
      { day: 5, title: 'Prison Island & Departure', activities: ['Giant tortoise sanctuary at Prison Island', 'Final beach swim', 'Local craft shopping', 'Evening flight home'], accommodation: 'N/A – departure', estimatedCost: 1000 },
    ],
  };
}

function nairobiPlan() {
  return {
    name: 'Nairobi, Kenya',
    budget: 'R15,000–R22,000 per person',
    bestTime: 'July–October (Great Migration season)',
    summary: 'Nairobi is Africa\'s most dynamic capital – a gateway to world-class safaris, vibrant culture, and stunning wildlife.',
    tips: ['Arrange visa on arrival or e-visa beforehand', 'Book Masai Mara game drives early', 'Use Uber/Bolt for city transport', 'Carry USD for park fees'],
    itinerary: [
      { day: 1, title: 'Arrival & City Overview', activities: ['Fly CPT→NBO', 'Nairobi National Park game drive', 'Karen Blixen Museum', 'Dinner at Carnivore Restaurant'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 2800 },
      { day: 2, title: 'Elephant & Giraffe Encounters', activities: ['David Sheldrick Elephant Orphanage', 'Giraffe Centre', 'Kazuri Beads workshop', 'Ngong Hills sunset'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 1500 },
      { day: 3, title: 'Masai Mara Day Trip', activities: ['Early morning flight to Mara', 'Full-day game drive', 'Sundowner in the bush', 'Return to Nairobi'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 4500 },
      { day: 4, title: 'Markets & Culture', activities: ['Maasai Market shopping', 'Nairobi National Museum', 'Westlands food tour', 'Rooftop bar evening'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 1200 },
      { day: 5, title: 'Departure Day', activities: ['Morning Kilimambogo hike', 'Final lunch at Java House', 'Airport transfer', 'Return flight to Cape Town'], accommodation: 'N/A', estimatedCost: 800 },
    ],
  };
}

function dubaiPlan() {
  return {
    name: 'Dubai, UAE',
    budget: 'R25,000–R40,000 per person',
    bestTime: 'November–April (mild weather)',
    summary: 'Dubai blends futuristic architecture with traditional Arabian culture. World-class shopping, dining, and desert adventures await.',
    tips: ['Book Burj Khalifa at sunrise for best views', 'Use the Dubai Metro – very efficient', 'Desert safari is unmissable', 'Dress modestly in old Dubai areas'],
    itinerary: [
      { day: 1, title: 'Arrival & Downtown', activities: ['Fly CPT→DXB', 'Check into hotel', 'Dubai Mall & Dubai Fountain', 'Burj Khalifa observation deck'], accommodation: 'Address Downtown', estimatedCost: 5000 },
      { day: 2, title: 'Old Dubai & Gold Souk', activities: ['Al Fahidi Historic District', 'Dubai Museum', 'Gold Souk & Spice Souk', 'Abra water taxi ride', 'Dinner in Deira'], accommodation: 'Address Downtown', estimatedCost: 2000 },
      { day: 3, title: 'Desert Safari', activities: ['Morning free time', 'Afternoon desert safari', 'Dune bashing 4x4', 'Camel riding', 'BBQ dinner under stars'], accommodation: 'Address Downtown', estimatedCost: 2500 },
      { day: 4, title: 'Beaches & Atlantis', activities: ['Jumeirah Beach morning', 'Palm Jumeirah tour', 'Aquaventure Waterpark', 'Marina Walk dining'], accommodation: 'Address Downtown', estimatedCost: 3000 },
      { day: 5, title: 'Shopping & Departure', activities: ['Mall of Emirates & ski slope', 'Final souvenir shopping', 'Airport at DXB', 'Return flight home'], accommodation: 'N/A', estimatedCost: 2000 },
    ],
  };
}
