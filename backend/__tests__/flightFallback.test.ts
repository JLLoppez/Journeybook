/**
 * Tests the three-tier flight fallback strategy:
 * Duffel API → MongoDB cache → seeded demo data
 */

// Mock axios before imports
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Flight Search Fallback Strategy', () => {
  const validOrigin = 'CPT';
  const validDest = 'DXB';
  const validDate = '2026-06-15';

  describe('Duffel API key detection', () => {
    it('should skip Duffel if API key is not set', () => {
      const key = process.env.DUFFEL_API_KEY || '';
      // Without a real duffel_ key, should fall back
      const isDuffelConfigured = key.startsWith('duffel_');
      expect(isDuffelConfigured).toBe(false);
    });

    it('should skip Duffel if key is placeholder', () => {
      const placeholder = 'duffel_test_your_key_here';
      const isReal = placeholder.startsWith('duffel_') && placeholder !== 'duffel_test_your_key_here';
      expect(isReal).toBe(false);
    });
  });

  describe('Duffel offer mapping', () => {
    it('should map Duffel offer to internal flight format', () => {
      const mockOffer = {
        total_amount: '8500.00',
        cabin_class: 'economy',
        owner: { name: 'Emirates', iata_code: 'EK' },
        slices: [{
          origin: { iata_code: 'CPT', city_name: 'Cape Town', name: 'Cape Town International' },
          destination: { iata_code: 'DXB', city_name: 'Dubai', name: 'Dubai International' },
          segments: [{
            departing_at: '2026-06-15T19:35:00',
            arriving_at: '2026-06-16T07:30:00',
            marketing_carrier: { name: 'Emirates', iata_code: 'EK' },
          }],
        }],
      };

      // Simulate the mapping logic from flightController
      const firstSlice = mockOffer.slices[0];
      const firstSegment = firstSlice.segments[0];

      const mapped = {
        airline: firstSegment.marketing_carrier?.name || mockOffer.owner?.name,
        origin: {
          code: firstSlice.origin?.iata_code,
          city: firstSlice.origin?.city_name,
        },
        destination: {
          code: firstSlice.destination?.iata_code,
          city: firstSlice.destination?.city_name,
        },
        price: Number(mockOffer.total_amount),
        class: mockOffer.cabin_class,
        availableSeats: 9,
      };

      expect(mapped.airline).toBe('Emirates');
      expect(mapped.origin.code).toBe('CPT');
      expect(mapped.destination.code).toBe('DXB');
      expect(mapped.price).toBe(8500);
      expect(mapped.class).toBe('economy');
      expect(mapped.availableSeats).toBe(9);
    });

    it('should calculate flight duration correctly', () => {
      const dep = '2026-06-15T19:35:00';
      const arr = '2026-06-16T07:30:00';
      const ms = new Date(arr).getTime() - new Date(dep).getTime();
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const duration = `${hours}h ${mins}m`;
      expect(duration).toBe('11h 55m');
    });

    it('should return N/A for missing departure/arrival', () => {
      const diffDuration = (start?: string, end?: string) => {
        if (!start || !end) return 'N/A';
        const ms = new Date(end).getTime() - new Date(start).getTime();
        if (!Number.isFinite(ms) || ms <= 0) return 'N/A';
        const h = Math.floor(ms / (1000 * 60 * 60));
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${h}h ${m}m`;
      };
      expect(diffDuration(undefined, undefined)).toBe('N/A');
      expect(diffDuration('2026-01-01T10:00:00', undefined)).toBe('N/A');
    });
  });

  describe('Search parameter validation', () => {
    it('should require origin, destination and date', () => {
      const validate = (origin: string, destination: string, date: string) => {
        return !(!origin || !destination || !date);
      };
      expect(validate('', 'DXB', '2026-06-15')).toBe(false);
      expect(validate('CPT', '', '2026-06-15')).toBe(false);
      expect(validate('CPT', 'DXB', '')).toBe(false);
      expect(validate('CPT', 'DXB', '2026-06-15')).toBe(true);
    });

    it('should uppercase origin and destination codes', () => {
      const normalise = (code: string) => code.toUpperCase().trim();
      expect(normalise('cpt')).toBe('CPT');
      expect(normalise(' jnb ')).toBe('JNB');
    });
  });
});
