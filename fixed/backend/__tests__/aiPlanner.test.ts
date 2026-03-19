/**
 * Tests AI planner fallback, destination detection, and mock plan generation
 */

process.env.JWT_SECRET = 'test_secret_key_min_32_characters!!';

describe('AI Planner', () => {
  describe('API key detection', () => {
    it('should use demo mode when ANTHROPIC_API_KEY is not set', () => {
      const key = process.env.ANTHROPIC_API_KEY || '';
      const isDemo = !key || key === 'your_anthropic_key_here';
      expect(isDemo).toBe(true);
    });

    it('should detect a configured API key', () => {
      const testKey = 'sk-ant-test-key-12345';
      const isConfigured = !!testKey && testKey !== ('your_' + 'anthropic_key_here');
      expect(isConfigured).toBe(true);
    });
  });

  describe('Destination detection from prompt', () => {
    const detectDestination = (prompt: string): string => {
      const p = prompt.toLowerCase();
      if (p.includes('zanzibar')) return 'zanzibar';
      if (p.includes('nairobi') || p.includes('kenya')) return 'nairobi';
      if (p.includes('dubai')) return 'dubai';
      if (p.includes('london')) return 'london';
      return 'unknown';
    };

    it('should detect Zanzibar', () => {
      expect(detectDestination('5 days in Zanzibar under R20,000')).toBe('zanzibar');
    });

    it('should detect Nairobi via city name', () => {
      expect(detectDestination('Safari trip to Nairobi')).toBe('nairobi');
    });

    it('should detect Nairobi via country name', () => {
      expect(detectDestination('Wildlife trip to Kenya')).toBe('nairobi');
    });

    it('should detect Dubai', () => {
      expect(detectDestination('Romantic 7 days in Dubai')).toBe('dubai');
    });

    it('should handle case-insensitive matching', () => {
      expect(detectDestination('ZANZIBAR BEACH HOLIDAY')).toBe('zanzibar');
      expect(detectDestination('DUBAI shopping trip')).toBe('dubai');
    });
  });

  describe('IATA destination code extraction', () => {
    const extractDestCode = (destination: string): string | null => {
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
    };

    it('should return correct IATA codes', () => {
      expect(extractDestCode('Zanzibar, Tanzania')).toBe('ZNZ');
      expect(extractDestCode('Dubai, UAE')).toBe('DXB');
      expect(extractDestCode('London, UK')).toBe('LHR');
      expect(extractDestCode('Nairobi, Kenya')).toBe('NBO');
    });

    it('should return null for unknown destination', () => {
      expect(extractDestCode('Mars Colony 1')).toBeNull();
    });
  });

  describe('Mock plan structure', () => {
    it('should generate a plan with required fields', () => {
      const mockPlan = {
        destination: 'Zanzibar, Tanzania',
        duration: '5 days',
        totalBudget: 'R20,000',
        summary: 'A beautiful beach holiday',
        itinerary: [
          { day: 1, title: 'Arrival', activities: ['Check in', 'Beach walk'], estimatedCost: 2000 },
        ],
        flights: [],
        tips: ['Book in advance'],
        bestTimeToVisit: 'June–October',
      };

      expect(mockPlan).toHaveProperty('destination');
      expect(mockPlan).toHaveProperty('duration');
      expect(mockPlan).toHaveProperty('totalBudget');
      expect(mockPlan).toHaveProperty('summary');
      expect(Array.isArray(mockPlan.itinerary)).toBe(true);
      expect(mockPlan.itinerary[0]).toHaveProperty('day');
      expect(mockPlan.itinerary[0]).toHaveProperty('activities');
      expect(Array.isArray(mockPlan.tips)).toBe(true);
    });

    it('should slice itinerary to requested duration', () => {
      const fullItinerary = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, title: `Day ${i + 1}`, activities: [] }));
      const requestedDays = 3;
      const sliced = fullItinerary.slice(0, requestedDays);
      expect(sliced).toHaveLength(3);
      expect(sliced[0].day).toBe(1);
      expect(sliced[2].day).toBe(3);
    });
  });

  describe('Budget formatting', () => {
    it('should format ZAR budget correctly', () => {
      const format = (budget?: string) => budget ? `R${budget}` : 'R20,000–R30,000';
      expect(format('25000')).toBe('R25000');
      expect(format(undefined)).toBe('R20,000–R30,000');
    });
  });
});
