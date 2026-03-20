import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AuthRequest } from '../middleware/auth';
import { Flight } from '../models/Flight';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const availableFlights = await Flight.find({ availableSeats: { $gte: 1 } }).limit(20).lean();
    const flightSummary = availableFlights.slice(0, 8).map(f =>
      f.flightNumber + ': ' + f.origin.code + '->' + f.destination.code + ' R' + f.price + ' (' + f.class + ')'
    ).join('\n');

    const budgetLine = budgetZAR
      ? 'Budget: R' + budgetZAR + ' per person (R' + (budgetZAR * totalPax) + ' total)'
        + (budgetCurrency !== 'ZAR' ? ' - originally ' + budgetOriginal + ' ' + budgetCurrency : '')
      : '';

    const returnLine = isReturn ? 'Return: ' + returnDateSuggested : '';

    const jsonTemplate = `{
  "destination": "string",
  "originCode": "${origin}",
  "destinationCode": "IATA code string",
  "duration": "string",
  "departureDateSuggested": "${departureDateSuggested}",
  "returnDateSuggested": "${isReturn ? returnDateSuggested : ''}",
  "totalBudgetZAR": 0,
  "perPersonBudgetZAR": 0,
  "totalBudgetDisplay": "string",
  "perPersonBudgetDisplay": "string",
  "summary": "2-3 sentences personalised to group and trip type",
  "itinerary": [{"day": 1, "title": "string", "activities": ["string"], "accommodation": "string", "estimatedCostZAR": 0}],
  "tips": ["string"],
  "bestTimeToVisit": "string",
  "requiredDocuments": ["string"]
}`;

    const fullPrompt = [
      'You are an expert AI travel planner for JourneyBook, a South African travel booking platform.',
      'Create a detailed, practical travel itinerary in valid JSON only - no markdown, no extra text, no code blocks.',
      flightSummary ? 'Available flights:\n' + flightSummary : '',
      'All costs in South African Rand (ZAR). Be realistic about costs from South Africa.',
      'Today: ' + new Date().toISOString().split('T')[0],
      '',
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
      'Respond ONLY with this JSON structure (no markdown, no backticks):',
      jsonTemplate,
    ].filter(Boolean).join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const rawText = result.response.text();
    const clean = rawText.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);

    plan.originCode = plan.originCode || origin;
    plan.destinationCode = plan.destinationCode || destination;

    const destCode = plan.destinationCode;
    plan.flights = destCode
      ? availableFlights.filter(f => f.destination.code === destCode).slice(0, 2)
      : [];

    res.json({ plan, source: 'ai', totalPax, passengers });

  } catch (error: any) {
    console.error('AI planner error:', error);
    res.status(500).json({ error: 'Failed to generate travel plan. Please try again.', details: error.message });
  }
};
