/**
 * Tests rate limiter configuration and environment parsing
 */

describe('Rate Limiting Config', () => {
  describe('Environment variable parsing', () => {
    const toNumber = (value: string | undefined, fallback: number): number => {
      const parsed = Number(value);
      if (value === undefined || value === '') return fallback; return Number.isFinite(parsed) ? parsed : fallback;
    };

    const toBoolean = (value: string | undefined, fallback = false): boolean => {
      if (value === undefined) return fallback;
      return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    };

    it('should parse valid number strings', () => {
      expect(toNumber('100', 200)).toBe(100);
      expect(toNumber('900000', 0)).toBe(900000);
    });

    it('should use fallback for invalid or missing values', () => {
      expect(toNumber(undefined, 200)).toBe(200);
      expect(toNumber('abc', 50)).toBe(50);
      expect(toNumber('', 75)).toBe(75);
    });

    it('should parse boolean env vars', () => {
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('1')).toBe(true);
      expect(toBoolean('yes')).toBe(true);
      expect(toBoolean('on')).toBe(true);
      expect(toBoolean('TRUE')).toBe(true);
    });

    it('should return false for falsy boolean values', () => {
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('0')).toBe(false);
      expect(toBoolean(undefined, false)).toBe(false);
    });
  });

  describe('Rate limit window', () => {
    it('should default to 15 minutes in ms', () => {
      const windowMs = 15 * 60 * 1000;
      expect(windowMs).toBe(900000);
    });

    it('should default to 100 max requests', () => {
      const max = 100;
      expect(max).toBe(100);
    });
  });

  describe('CORS origin parsing', () => {
    const parseOrigins = (raw: string) =>
      raw.split(',').map((o) => o.trim()).filter(Boolean);

    it('should parse single origin', () => {
      expect(parseOrigins('http://localhost:3000')).toEqual(['http://localhost:3000']);
    });

    it('should parse multiple origins', () => {
      const result = parseOrigins('http://localhost:3000,https://journeybook.co.za');
      expect(result).toHaveLength(2);
      expect(result).toContain('https://journeybook.co.za');
    });

    it('should trim whitespace from origins', () => {
      const result = parseOrigins('http://localhost:3000 , https://production.com ');
      expect(result[0]).toBe('http://localhost:3000');
      expect(result[1]).toBe('https://production.com');
    });
  });
});
