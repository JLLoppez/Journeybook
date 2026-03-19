/**
 * Tests location search normalisation and filtering logic
 */

describe('Location Search', () => {
  const normaliseResults = (raw: any[]) =>
    raw.slice(0, 10).map((item: any) => ({
      city: item.city_name || item.name || '',
      country: item.country_name || '',
      airport: item.name || item.city_name || '',
      code: item.code || item.iata || '',
      type: item.type || 'place',
    })).filter((item: any) => item.code || item.city || item.airport);

  it('should normalise travelpayouts response format', () => {
    const raw = [
      { city_name: 'Cape Town', country_name: 'South Africa', name: 'Cape Town International', code: 'CPT', type: 'airport' },
      { city_name: 'Dubai', country_name: 'UAE', name: 'Dubai International', code: 'DXB', type: 'airport' },
    ];
    const result = normaliseResults(raw);
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('CPT');
    expect(result[0].city).toBe('Cape Town');
    expect(result[1].code).toBe('DXB');
  });

  it('should limit results to 10 items', () => {
    const raw = Array.from({ length: 20 }, (_, i) => ({
      city_name: `City ${i}`, country_name: 'Test', name: `Airport ${i}`, code: `T${i.toString().padStart(2,'0')}`,
    }));
    expect(normaliseResults(raw)).toHaveLength(10);
  });

  it('should filter out items with no identifying info', () => {
    const raw = [
      { city_name: '', country_name: '', name: '', code: '' },
      { city_name: 'Johannesburg', country_name: 'South Africa', name: 'OR Tambo', code: 'JNB' },
    ];
    const result = normaliseResults(raw);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('JNB');
  });

  it('should handle missing optional fields gracefully', () => {
    const raw = [{ name: 'Unknown Airport', code: 'UNK' }];
    const result = normaliseResults(raw);
    expect(result[0].city).toBe('Unknown Airport');
    expect(result[0].country).toBe('');
    expect(result[0].type).toBe('place');
  });

  describe('Query validation', () => {
    const shouldSearch = (q: string) => q.trim().length >= 2;

    it('should search for queries of 2+ characters', () => {
      expect(shouldSearch('ca')).toBe(true);
      expect(shouldSearch('Cape Town')).toBe(true);
    });

    it('should skip search for very short queries', () => {
      expect(shouldSearch('')).toBe(false);
      expect(shouldSearch('c')).toBe(false);
      expect(shouldSearch('  ')).toBe(false);
    });
  });
});
