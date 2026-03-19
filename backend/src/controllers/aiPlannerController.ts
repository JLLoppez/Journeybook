import { Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { AuthRequest } from '../middleware/auth';
import { Flight } from '../models/Flight';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export const generateTravelPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      prompt,
      origin = 'CPT',
      destination = '',
      destinationDisplay = '',
      originDisplay = '',
      budget,
      budgetOriginal,
      budgetCurrency = 'ZAR',
      duration = '5',
      passengers = { adults: 1, children: 0, infants: 0 },
      tripType = 'solo',
      isReturn = true,
      departureDate = '',
      returnDate = '',
      cabinClass = 'economy',
    } = req.body;

    if (!prompt) { res.status(400).json({ error: 'Travel prompt is required' }); return; }

    const totalPax = (passengers.adults || 1) + (passengers.children || 0);
    const budgetZAR = budget ? parseInt(budget) : null;

    const departureDateSuggested = departureDate || new Date().toISOString().split('T')[0];
    const returnDateSuggested = returnDate || (() => {
      const d = new Date(departureDateSuggested);
      d.setDate(d.getDate() + parseInt(duration || '5'));
      return d.toISOString().split('T')[0];
    })();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_key_here') {
      const mockPlan = generateMockPlan(
        prompt, origin, budget, duration, passengers,
        destination, departureDateSuggested, isReturn ? returnDateSuggested : undefined
      );
      res.json({ plan: mockPlan, source: 'demo', totalPax });
      return;
    }

    const availableFlights = await Flight.find({ availableSeats: { $gte: 1 } }).limit(20).lean();
    const flightSummary = availableFlights.slice(0, 8).map(f =>
      f.flightNumber + ': ' + f.origin.code + '->' + f.destination.code + ' R' + f.price + ' (' + f.class + ')'
    ).join('\n');

    const systemPrompt = 'You are an expert AI travel planner for JourneyBook, a South African travel booking platform. '
      + 'You create detailed, practical travel itineraries in valid JSON only - no markdown, no extra text. '
      + 'Available flights:\n' + (flightSummary || 'No flights in DB.') + '\n'
      + 'All costs in South African Rand (ZAR). Be realistic about costs from South Africa. '
      + 'Today: ' + new Date().toISOString().split('T')[0] + '.';

    const budgetLine = budgetZAR
      ? 'Budget: R' + budgetZAR + ' per person (R' + (budgetZAR * totalPax) + ' total)'
        + (budgetCurrency !== 'ZAR' ? ' - originally ' + budgetOriginal + ' ' + budgetCurrency : '')
      : '';

    const returnLine = isReturn ? 'Return: ' + returnDateSuggested : '';

    const jsonTemplate = '{'
      + '"destination": "string",'
      + '"originCode": "' + origin + '",'
      + '"destinationCode": "IATA code string",'
      + '"duration": "string",'
      + '"departureDateSuggested": "' + departureDateSuggested + '",'
      + '"returnDateSuggested": "' + (isReturn ? returnDateSuggested : '') + '",'
      + '"totalBudgetZAR": 0,'
      + '"perPersonBudgetZAR": 0,'
      + '"totalBudgetDisplay": "string",'
      + '"perPersonBudgetDisplay": "string",'
      + '"summary": "2-3 sentences personalised to group and trip type",'
      + '"itinerary": [{"day": 1, "title": "string", "activities": ["string"], "accommodation": "string", "estimatedCostZAR": 0}],'
      + '"tips": ["string"],'
      + '"bestTimeToVisit": "string",'
      + '"requiredDocuments": ["string"]'
      + '}';

    const userMessage = [
      'Create a travel plan for: "' + prompt + '"',
      'From: ' + (originDisplay || origin),
      'To: ' + (destinationDisplay || destination),
      'Trip type: ' + tripType,
      'Journey: ' + (isReturn ? 'Return trip' : 'One-way'),
      'Departure: ' + departureDateSuggested,
      returnLine,
      'Passengers: ' + passengers.adults + ' adult(s), ' + (passengers.children || 0) + ' child(ren), ' + (passengers.infants || 0) + ' infant(s)',
      'Total paying passengers: ' + totalPax,
      'Cabin class: ' + cabinClass,
      budgetLine,
      'Duration: ' + duration + ' days',
      '',
      'Scale ALL costs for ' + totalPax + ' paying passengers. Infants are free.',
      '',
      'Respond ONLY with this JSON (no markdown):',
      jsonTemplate,
    ].filter(Boolean).join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);

    plan.originCode = plan.originCode || origin;
    plan.destinationCode = plan.destinationCode || extractDestCode(plan.destination) || destination;

    const destCode = plan.destinationCode || extractDestCode(plan.destination);
    plan.flights = destCode
      ? availableFlights.filter(f => f.destination.code === destCode).slice(0, 2)
      : [];

    res.json({ plan, source: 'ai', totalPax, passengers });
  } catch (error: any) {
    console.error('AI planner error:', error);
    const mockPlan = generateMockPlan(
      req.body.prompt, req.body.origin, req.body.budget, req.body.duration,
      req.body.passengers, req.body.destination,
      req.body.departureDate, req.body.isReturn ? req.body.returnDate : undefined
    );
    res.json({ plan: mockPlan, source: 'demo', warning: 'AI unavailable - showing sample plan', totalPax: 1 });
  }
};

function extractDestCode(destination: string): string | null {
  const map: Record<string, string> = {
    zanzibar: 'ZNZ', nairobi: 'NBO', dubai: 'DXB', london: 'LHR',
    'new york': 'JFK', paris: 'CDG', sydney: 'SYD', amsterdam: 'AMS',
    johannesburg: 'JNB', 'cape town': 'CPT', addis: 'ADD', accra: 'ACC',
    bali: 'DPS', bangkok: 'BKK', istanbul: 'IST', rome: 'FCO',
    barcelona: 'BCN', tokyo: 'NRT', miami: 'MIA',
    mauritius: 'MRU', maldives: 'MLE', seychelles: 'SEZ',
  };
  const lower = destination.toLowerCase();
  for (const [key, code] of Object.entries(map)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

function generateMockPlan(
  prompt: string,
  origin: string,
  budget?: string,
  duration?: string,
  passengers?: { adults?: number; children?: number; infants?: number },
  destinationCode?: string,
  departureDate?: string,
  returnDate?: string
): any {
  const dest = detectDestination((prompt || '') + ' ' + (destinationCode || ''));
  const days = parseInt(duration || '5');
  const adults = passengers?.adults || 1;
  const children = passengers?.children || 0;
  const totalPax = adults + children;

  const itinerary = dest.itinerary.slice(0, days).map((day: any, i: number) => ({
    ...day,
    day: i + 1,
    estimatedCostZAR: (day.estimatedCost || 0) * totalPax,
  }));

  const totalCostZAR = itinerary.reduce((s: number, d: any) => s + (d.estimatedCostZAR || 0), 0);
  const perPersonZAR = Math.round(totalCostZAR / totalPax);
  const budgetNum = budget ? parseInt(budget) : 0;

  const suggestedDeparture = departureDate || new Date().toISOString().split('T')[0];
  const suggestedReturn = returnDate || (() => {
    const d = new Date(suggestedDeparture);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  })();

  return {
    destination: dest.name,
    originCode: origin,
    destinationCode: destinationCode || extractDestCode(dest.name) || '',
    duration: days + ' days',
    departureDateSuggested: suggestedDeparture,
    returnDateSuggested: suggestedReturn,
    totalBudgetZAR: budgetNum ? budgetNum * totalPax : totalCostZAR,
    perPersonBudgetZAR: budgetNum || perPersonZAR,
    totalBudgetDisplay: 'R' + (budgetNum ? budgetNum * totalPax : totalCostZAR).toLocaleString(),
    perPersonBudgetDisplay: 'R' + (budgetNum || perPersonZAR).toLocaleString() + ' per person',
    summary: dest.summary + (totalPax > 1 ? ' Planned for ' + totalPax + ' travellers.' : ''),
    itinerary,
    flights: [],
    tips: dest.tips,
    bestTimeToVisit: dest.bestTime,
    requiredDocuments: dest.documents,
  };
}

function detectDestination(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes('zanzibar')) return zanzibarPlan();
  if (p.includes('nairobi') || p.includes('kenya') || p.includes('nbo')) return nairobiPlan();
  if (p.includes('dubai') || p.includes('dxb')) return dubaiPlan();
  if (p.includes('london') || p.includes('uk') || p.includes('lhr')) return londonPlan();
  if (p.includes('paris') || p.includes('france') || p.includes('cdg')) return parisPlan();
  if (p.includes('mauritius') || p.includes('mru')) return mauritiusPlan();
  if (p.includes('bali') || p.includes('indonesia') || p.includes('dps')) return baliPlan();
  if (p.includes('johannesburg') || p.includes('joburg') || p.includes('jnb')) return joburgPlan();
  return zanzibarPlan();
}

function zanzibarPlan() {
  return {
    name: 'Zanzibar, Tanzania',
    bestTime: 'June–October (dry season)',
    summary: 'Zanzibar offers pristine beaches, rich Swahili culture, and incredible marine life. A perfect tropical getaway from South Africa.',
    tips: ['Book snorkelling tours in advance', 'Carry cash – ATMs are unreliable', 'Dress conservatively in Stone Town', 'Try street food at Forodhani Gardens night market'],
    documents: ['Valid passport (6+ months validity)', 'Visa on arrival for South Africans', 'Yellow fever certificate if via endemic country'],
    itinerary: [
      { day: 1, title: 'Arrival & Stone Town', activities: ['Fly to ZNZ via Nairobi', 'Hotel check-in', 'Evening walk in Stone Town', 'Dinner at Forodhani Gardens'], accommodation: 'Stone Town Heritage Hotel', estimatedCost: 3200 },
      { day: 2, title: 'Stone Town Deep Dive', activities: ['House of Wonders tour', 'Old Fort visit', 'Spice market', 'Sunset dhow cruise'], accommodation: 'Stone Town Heritage Hotel', estimatedCost: 1200 },
      { day: 3, title: 'Safari Blue Excursion', activities: ['Full-day Safari Blue boat trip', 'Snorkelling at Menai Bay', 'Sandbank picnic', 'Dolphin watching'], accommodation: 'Nungwi Beach Resort', estimatedCost: 1800 },
      { day: 4, title: 'Beach & Water Sports', activities: ['Kite surfing lesson', 'Nungwi Beach afternoon', 'Sundowner cocktails', 'Seafood dinner'], accommodation: 'Nungwi Beach Resort', estimatedCost: 1500 },
      { day: 5, title: 'Prison Island & Departure', activities: ['Giant tortoise sanctuary', 'Final beach swim', 'Local craft shopping', 'Evening flight home'], accommodation: 'N/A – departure', estimatedCost: 1000 },
    ],
  };
}

function nairobiPlan() {
  return {
    name: 'Nairobi, Kenya',
    bestTime: 'July–October (Great Migration season)',
    summary: "Nairobi is Africa's most dynamic capital — a gateway to world-class safaris, vibrant culture, and stunning wildlife.",
    tips: ['Arrange e-visa before travel at evisa.go.ke', 'Book Masai Mara drives early', 'Use Uber/Bolt in the city', 'Carry USD for national park fees'],
    documents: ['Valid passport', 'Kenya e-visa (apply online)', 'Travel insurance recommended'],
    itinerary: [
      { day: 1, title: 'Arrival & City Overview', activities: ['Fly to NBO', 'Nairobi National Park game drive', 'Karen Blixen Museum', 'Carnivore Restaurant dinner'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 2800 },
      { day: 2, title: 'Elephant & Giraffe Day', activities: ['David Sheldrick Elephant Orphanage', 'Giraffe Centre', 'Kazuri Beads workshop', 'Ngong Hills sunset'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 1500 },
      { day: 3, title: 'Masai Mara Day Trip', activities: ['Morning flight to Mara', 'Full-day Big Five game drive', 'Sundowner in the bush', 'Return to Nairobi'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 4500 },
      { day: 4, title: 'Markets & Culture', activities: ['Maasai Market', 'National Museum', 'Westlands food tour', 'Rooftop bar evening'], accommodation: 'Nairobi Serena Hotel', estimatedCost: 1200 },
      { day: 5, title: 'Departure Day', activities: ['Morning hike', 'Java House lunch', 'Airport transfer', 'Return flight'], accommodation: 'N/A', estimatedCost: 800 },
    ],
  };
}

function dubaiPlan() {
  return {
    name: 'Dubai, UAE',
    bestTime: 'November–April (mild weather)',
    summary: 'Dubai blends futuristic architecture with traditional Arabian culture. World-class shopping, dining, and desert adventures await.',
    tips: ['Book Burj Khalifa tickets in advance', 'Use the Dubai Metro', 'Desert safari is unmissable', 'Dress modestly in old Dubai'],
    documents: ['Valid passport', 'South Africans get visa on arrival (30 days free)', 'Travel insurance recommended'],
    itinerary: [
      { day: 1, title: 'Arrival & Downtown', activities: ['Fly to DXB', 'Hotel check-in', 'Dubai Mall & Fountain show', 'Burj Khalifa deck'], accommodation: 'Address Downtown', estimatedCost: 5000 },
      { day: 2, title: 'Old Dubai', activities: ['Al Fahidi Historic District', 'Gold & Spice Souks', 'Abra water taxi', 'Deira dinner'], accommodation: 'Address Downtown', estimatedCost: 2000 },
      { day: 3, title: 'Desert Safari', activities: ['Free morning', 'Desert safari afternoon', 'Dune bashing', 'Camel riding', 'BBQ under stars'], accommodation: 'Address Downtown', estimatedCost: 2500 },
      { day: 4, title: 'Beaches & Palm', activities: ['Jumeirah Beach', 'Palm Jumeirah', 'Aquaventure Waterpark', 'Marina Walk dining'], accommodation: 'Address Downtown', estimatedCost: 3000 },
      { day: 5, title: 'Shopping & Departure', activities: ['Mall of Emirates', 'Ski Dubai', 'Souvenir shopping', 'Return flight'], accommodation: 'N/A', estimatedCost: 2000 },
    ],
  };
}

function londonPlan() {
  return {
    name: 'London, United Kingdom',
    bestTime: 'May–September (best weather)',
    summary: "London is one of the world's great cities — royal heritage, world-class museums, incredible food, and vibrant neighbourhoods.",
    tips: ['Get an Oyster card for public transport', 'Book popular attractions in advance', 'Many world-class museums are free', 'Pack layers — weather changes quickly'],
    documents: ['Valid passport', 'UK ETA required for South Africans (apply online)', 'Proof of accommodation and return ticket'],
    itinerary: [
      { day: 1, title: 'Arrival & Central London', activities: ['Fly to LHR', 'Hotel check-in', 'Walk along the Thames', 'Borough Market dinner'], accommodation: 'Premier Inn London City', estimatedCost: 6000 },
      { day: 2, title: 'Royal London', activities: ['Buckingham Palace', 'Westminster Abbey', 'Big Ben', 'West End show'], accommodation: 'Premier Inn London City', estimatedCost: 4500 },
      { day: 3, title: 'Museums & Culture', activities: ['British Museum', 'Covent Garden', 'National Gallery', 'Soho food tour'], accommodation: 'Premier Inn London City', estimatedCost: 3500 },
      { day: 4, title: 'East London', activities: ['Tower of London', 'Tower Bridge', 'Brick Lane Market', 'Shoreditch street art'], accommodation: 'Premier Inn London City', estimatedCost: 4000 },
      { day: 5, title: 'Departure', activities: ['Portobello Road Market', 'Hyde Park', 'Heathrow transfer', 'Return flight'], accommodation: 'N/A', estimatedCost: 2000 },
    ],
  };
}

function parisPlan() {
  return {
    name: 'Paris, France',
    bestTime: 'April–June or September–October',
    summary: 'Paris is the city of light, love, and incredible food. From the Eiffel Tower to world-class art, it never disappoints.',
    tips: ['Book Eiffel Tower well in advance', 'Get a Paris Visite metro pass', 'Many museums free on first Sunday of month', 'Tipping is not expected but appreciated'],
    documents: ['Valid passport', 'South Africans need a Schengen visa — apply 6–8 weeks in advance', 'Travel insurance mandatory for Schengen visa'],
    itinerary: [
      { day: 1, title: 'Arrival & Eiffel Tower', activities: ['Fly to CDG', 'Hotel check-in', 'Evening Eiffel Tower visit', 'Seine river cruise'], accommodation: 'Hotel near Champs-Elysees', estimatedCost: 5500 },
      { day: 2, title: 'Art & Culture', activities: ['Louvre Museum', 'Tuileries Garden', 'Musee d\'Orsay', 'Saint-Germain dinner'], accommodation: 'Hotel near Champs-Elysees', estimatedCost: 4000 },
      { day: 3, title: 'Montmartre', activities: ['Montmartre walk', 'Sacre-Coeur', 'Artist quarter', 'Moulin Rouge area'], accommodation: 'Hotel near Champs-Elysees', estimatedCost: 3500 },
      { day: 4, title: 'Versailles Day Trip', activities: ['Palace of Versailles', 'Hall of Mirrors', 'Palace gardens', 'Return to Paris evening'], accommodation: 'Hotel near Champs-Elysees', estimatedCost: 4500 },
      { day: 5, title: 'Shopping & Departure', activities: ['Champs-Elysees shopping', 'Arc de Triomphe', 'CDG transfer', 'Return flight'], accommodation: 'N/A', estimatedCost: 3000 },
    ],
  };
}

function mauritiusPlan() {
  return {
    name: 'Mauritius',
    bestTime: 'May–December (dry season)',
    summary: 'Mauritius is paradise — turquoise lagoons, pristine beaches, and a melting pot of cultures just a short flight from South Africa.',
    tips: ['Hire a car to explore the island', 'Visit Chamarel Coloured Earths', 'Book water sports in advance', 'No visa required for South Africans'],
    documents: ['Valid passport (6+ months validity)', 'No visa required for South Africans (60 days)', 'Return ticket required on arrival'],
    itinerary: [
      { day: 1, title: 'Arrival & Beach', activities: ['Fly to MRU', 'Resort check-in', 'Beach afternoon', 'Seafood dinner'], accommodation: 'Beachfront resort', estimatedCost: 4000 },
      { day: 2, title: 'North Island Tour', activities: ['Grand Baie market', 'Pamplemousses Botanical Garden', 'Snorkelling', 'Sunset cocktails'], accommodation: 'Beachfront resort', estimatedCost: 2500 },
      { day: 3, title: 'Coloured Earths', activities: ['Chamarel Coloured Earths', 'Chamarel Waterfall', 'Black River Gorges', 'Rum distillery'], accommodation: 'Beachfront resort', estimatedCost: 2000 },
      { day: 4, title: 'Water Sports', activities: ['Morning snorkelling', 'Undersea walk', 'Beach afternoon', 'Beach BBQ'], accommodation: 'Beachfront resort', estimatedCost: 3000 },
      { day: 5, title: 'Departure', activities: ['Final beach morning', 'Market souvenirs', 'Airport transfer', 'Return flight'], accommodation: 'N/A', estimatedCost: 1500 },
    ],
  };
}

function baliPlan() {
  return {
    name: 'Bali, Indonesia',
    bestTime: 'April–October (dry season)',
    summary: 'Bali offers a magical blend of lush rice terraces, ancient temples, world-class surf, and vibrant nightlife at very affordable prices.',
    tips: ['Hire a scooter or private driver', 'Respect temple dress codes — bring a sarong', 'Negotiate prices at markets', 'Ubud for culture, Seminyak for nightlife'],
    documents: ['Valid passport (6+ months validity)', 'Visa on arrival for South Africans (~$35 USD)', 'Travel insurance strongly recommended'],
    itinerary: [
      { day: 1, title: 'Arrival & Seminyak', activities: ['Fly to DPS via Singapore', 'Villa check-in', 'Seminyak Beach sunset', 'Potato Head beach club'], accommodation: 'Villa in Seminyak', estimatedCost: 2500 },
      { day: 2, title: 'Ubud Culture Day', activities: ['Tegallalang Rice Terraces', 'Ubud Monkey Forest', 'Traditional dance performance', 'Ubud food tour'], accommodation: 'Villa in Seminyak', estimatedCost: 1800 },
      { day: 3, title: 'Temples & Sacred Sites', activities: ['Tanah Lot temple at sunrise', 'Besakih Mother Temple', 'Kintamani volcano view', 'Tirta Empul holy spring'], accommodation: 'Villa in Seminyak', estimatedCost: 1500 },
      { day: 4, title: 'Uluwatu & Surf', activities: ['Uluwatu cliff temple', 'Kecak fire dance', 'Padang Padang beach', 'Surf lesson at Kuta'], accommodation: 'Villa in Seminyak', estimatedCost: 1800 },
      { day: 5, title: 'Spa & Departure', activities: ['Balinese spa morning', 'Last beach swim', 'Sukawati market', 'Evening flight home'], accommodation: 'N/A', estimatedCost: 1200 },
    ],
  };
}

function joburgPlan() {
  return {
    name: 'Johannesburg, South Africa',
    bestTime: 'May–September (dry winter)',
    summary: "Joburg is South Africa's beating economic heart — rich in history, great food, world-class art, and the gateway to Kruger National Park.",
    tips: ['Use Uber exclusively', 'Sandton is the safest base', 'Book Apartheid Museum tickets online', 'Do a Soweto tour with a local guide'],
    documents: ['South African ID/passport', 'No visa required for South Africans', 'Travel insurance recommended for Kruger'],
    itinerary: [
      { day: 1, title: 'Arrival & Sandton', activities: ['Fly to JNB', 'Sandton City Mall', 'Nelson Mandela Square', 'Marble restaurant dinner'], accommodation: 'Sandton Sun Hotel', estimatedCost: 1800 },
      { day: 2, title: 'History & Heritage', activities: ['Apartheid Museum', 'Constitution Hill', 'Braamfontein lunch', 'Maboneng Precinct art walk'], accommodation: 'Sandton Sun Hotel', estimatedCost: 1200 },
      { day: 3, title: 'Soweto Township Tour', activities: ['Vilakazi Street', 'Mandela House Museum', 'Hector Pieterson Memorial', 'Local shebeen lunch'], accommodation: 'Sandton Sun Hotel', estimatedCost: 1500 },
      { day: 4, title: 'Cradle of Humankind', activities: ['Sterkfontein Caves', 'Maropeng Visitor Centre', 'Lion & Rhino Nature Reserve', 'Walter Sisulu Botanical Garden'], accommodation: 'Sandton Sun Hotel', estimatedCost: 1800 },
      { day: 5, title: 'Departure', activities: ['Rosebank Market morning', 'OR Tambo airport', 'Return flight to Cape Town'], accommodation: 'N/A', estimatedCost: 500 },
    ],
  };
}
