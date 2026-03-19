/**
 * Tests auth validation, password hashing behaviour, and booking reference generation
 */

import bcrypt from 'bcryptjs';

describe('Auth Logic', () => {
  describe('Email validation', () => {
    const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('jose@jalltech.co.za')).toBe(true);
      expect(isValidEmail('test+tag@domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('missing@tld')).toBe(false);
    });
  });

  describe('Password hashing', () => {
    it('should hash a password', async () => {
      const plain = 'SecurePass123';
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(plain, salt);
      expect(hashed).not.toBe(plain);
      expect(hashed.length).toBeGreaterThan(30);
    });

    it('should verify correct password', async () => {
      const plain = 'SecurePass123';
      const hashed = await bcrypt.hash(plain, 10);
      const match = await bcrypt.compare(plain, hashed);
      expect(match).toBe(true);
    });

    it('should reject wrong password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      const match = await bcrypt.compare('wrong', hashed);
      expect(match).toBe(false);
    });

    it('should produce different hashes for same password (salt)', async () => {
      const plain = 'SamePassword';
      const hash1 = await bcrypt.hash(plain, 10);
      const hash2 = await bcrypt.hash(plain, 10);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password length validation', () => {
    const isValidPassword = (pwd: string) => pwd.length >= 6;

    it('should accept passwords of 6+ chars', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('longpassword')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('Booking reference generation', () => {
    const generateRef = () =>
      `JB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    it('should start with JB', () => {
      expect(generateRef().startsWith('JB')).toBe(true);
    });

    it('should be uppercase', () => {
      const ref = generateRef();
      expect(ref).toBe(ref.toUpperCase());
    });

    it('should be unique across calls', () => {
      const refs = new Set(Array.from({ length: 100 }, generateRef));
      expect(refs.size).toBe(100);
    });

    it('should be at least 8 characters', () => {
      expect(generateRef().length).toBeGreaterThanOrEqual(8);
    });
  });
});
