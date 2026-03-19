export interface Airport {
  code: string;
  city: string;
  country: string;
  airport: string;
  emoji: string;
}

export const AIRPORTS: Airport[] = [
  // South Africa – first for relevance
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', airport: 'Cape Town International', emoji: '🏔️' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', airport: 'OR Tambo International', emoji: '🌍' },
  { code: 'DUR', city: 'Durban', country: 'South Africa', airport: 'King Shaka International', emoji: '🌊' },
  { code: 'PLZ', city: 'Gqeberha', country: 'South Africa', airport: 'Chief Dawid Stuurman', emoji: '🦏' },
  { code: 'BFN', city: 'Bloemfontein', country: 'South Africa', airport: 'Bram Fischer International', emoji: '🌻' },
  { code: 'GRJ', city: 'George', country: 'South Africa', airport: 'George Airport', emoji: '🌿' },
  { code: 'ELS', city: 'East London', country: 'South Africa', airport: 'East London Airport', emoji: '🌊' },
  // Africa
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', airport: 'Jomo Kenyatta International', emoji: '🦁' },
  { code: 'MBA', city: 'Mombasa', country: 'Kenya', airport: 'Moi International', emoji: '🐘' },
  { code: 'ZNZ', city: 'Zanzibar', country: 'Tanzania', airport: 'Abeid Amani Karume International', emoji: '🏝️' },
  { code: 'DAR', city: 'Dar es Salaam', country: 'Tanzania', airport: 'Julius Nyerere International', emoji: '🌴' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', airport: 'Bole International', emoji: '☕' },
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', airport: 'Murtala Muhammed International', emoji: '🌆' },
  { code: 'ABV', city: 'Abuja', country: 'Nigeria', airport: 'Nnamdi Azikiwe International', emoji: '🏛️' },
  { code: 'ACC', city: 'Accra', country: 'Ghana', airport: 'Kotoka International', emoji: '🥁' },
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', airport: 'Mohammed V International', emoji: '🕌' },
  { code: 'RAK', city: 'Marrakech', country: 'Morocco', airport: 'Menara Airport', emoji: '🌅' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', airport: 'Cairo International', emoji: '🏺' },
  { code: 'HBE', city: 'Alexandria', country: 'Egypt', airport: 'Borg El Arab', emoji: '🏛️' },
  { code: 'MRU', city: 'Mauritius', country: 'Mauritius', airport: 'Sir Seewoosagur Ramgoolam', emoji: '🦤' },
  { code: 'SEZ', city: 'Seychelles', country: 'Seychelles', airport: 'Seychelles International', emoji: '🐠' },
  { code: 'HRE', city: 'Harare', country: 'Zimbabwe', airport: 'Robert Gabriel Mugabe International', emoji: '🌍' },
  { code: 'VFA', city: 'Victoria Falls', country: 'Zimbabwe', airport: 'Victoria Falls Airport', emoji: '💧' },
  { code: 'GBE', city: 'Gaborone', country: 'Botswana', airport: 'Sir Seretse Khama International', emoji: '🦒' },
  { code: 'WDH', city: 'Windhoek', country: 'Namibia', airport: 'Hosea Kutako International', emoji: '🏜️' },
  { code: 'LUN', city: 'Lusaka', country: 'Zambia', airport: 'Kenneth Kaunda International', emoji: '🐆' },
  { code: 'MLA', city: 'Lilongwe', country: 'Malawi', airport: 'Kamuzu International', emoji: '🦅' },
  { code: 'MPM', city: 'Maputo', country: 'Mozambique', airport: 'Maputo International', emoji: '🌊' },
  // Middle East
  { code: 'DXB', city: 'Dubai', country: 'UAE', airport: 'Dubai International', emoji: '🌆' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', airport: 'Zayed International', emoji: '🕌' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', airport: 'Hamad International', emoji: '⛽' },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', airport: 'King Khalid International', emoji: '🕌' },
  // Europe
  { code: 'LHR', city: 'London', country: 'United Kingdom', airport: 'Heathrow', emoji: '🎡' },
  { code: 'LGW', city: 'London Gatwick', country: 'United Kingdom', airport: 'Gatwick', emoji: '🎡' },
  { code: 'CDG', city: 'Paris', country: 'France', airport: 'Charles de Gaulle', emoji: '🗼' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', airport: 'Schiphol', emoji: '🌷' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', airport: 'Frankfurt Airport', emoji: '🍺' },
  { code: 'MUC', city: 'Munich', country: 'Germany', airport: 'Franz Josef Strauss', emoji: '🥨' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', airport: 'Zurich Airport', emoji: '⛷️' },
  { code: 'FCO', city: 'Rome', country: 'Italy', airport: 'Leonardo da Vinci', emoji: '🍕' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', airport: 'Barcelona–El Prat', emoji: '🏖️' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', airport: 'Adolfo Suárez Barajas', emoji: '💃' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', airport: 'Humberto Delgado', emoji: '🛶' },
  { code: 'ATH', city: 'Athens', country: 'Greece', airport: 'Eleftherios Venizelos', emoji: '🏛️' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', airport: 'Istanbul Airport', emoji: '🌉' },
  // Asia-Pacific
  { code: 'SYD', city: 'Sydney', country: 'Australia', airport: 'Kingsford Smith', emoji: '🦘' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', airport: 'Tullamarine', emoji: '☕' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', airport: 'Changi', emoji: '🌿' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', airport: 'Suvarnabhumi', emoji: '🛕' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan', airport: 'Narita International', emoji: '🗾' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', airport: 'Hong Kong International', emoji: '🏙️' },
  { code: 'BOM', city: 'Mumbai', country: 'India', airport: 'Chhatrapati Shivaji Maharaj', emoji: '🎬' },
  { code: 'DEL', city: 'New Delhi', country: 'India', airport: 'Indira Gandhi International', emoji: '🕌' },
  // Americas
  { code: 'JFK', city: 'New York', country: 'USA', airport: 'John F. Kennedy International', emoji: '🗽' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', airport: 'Los Angeles International', emoji: '🎬' },
  { code: 'MIA', city: 'Miami', country: 'USA', airport: 'Miami International', emoji: '🌴' },
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', airport: 'Guarulhos International', emoji: '🌎' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', airport: 'Galeão International', emoji: '🏖️' },
];

/** Fuzzy search: matches city, country, airport name, or IATA code */
export function searchAirports(query: string): Airport[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  return AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q) ||
    a.airport.toLowerCase().includes(q) ||
    a.code.toLowerCase().startsWith(q)
  ).slice(0, 7);
}

/** Resolve a free-text city name or IATA code → canonical IATA code */
export function resolveToCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  // Already a 3-letter IATA code
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    const exact = AIRPORTS.find(a => a.code === trimmed.toUpperCase());
    return exact ? exact.code : trimmed.toUpperCase();
  }
  // Exact city match (case-insensitive)
  const q = trimmed.toLowerCase();
  const exact = AIRPORTS.find(a => a.city.toLowerCase() === q);
  if (exact) return exact.code;
  // Starts-with city match
  const partial = AIRPORTS.find(a => a.city.toLowerCase().startsWith(q));
  if (partial) return partial.code;
  // Return the raw string uppercased as last resort
  return trimmed.toUpperCase();
}
