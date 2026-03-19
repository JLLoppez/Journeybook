import mongoose from 'mongoose';
import { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken } from '../src/utils/jwt';

// Minimal mock for env
process.env.JWT_SECRET = 'test_jwt_secret_32chars_minimum!!';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32chars_min!!';

const mockUserId = new mongoose.Types.ObjectId();

describe('JWT Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUserId, 'test@test.com', 'user');
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should include correct payload fields', () => {
      const token = generateToken(mockUserId, 'test@test.com', 'user');
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(mockUserId.toString());
      expect(decoded.email).toBe('test@test.com');
      expect(decoded.role).toBe('user');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const token = generateRefreshToken(mockUserId);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify refresh token and return userId', () => {
      const token = generateRefreshToken(mockUserId);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(mockUserId.toString());
    });
  });

  describe('verifyToken', () => {
    it('should throw on invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw on tampered token', () => {
      const token = generateToken(mockUserId, 'test@test.com', 'user');
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should throw on invalid refresh token', () => {
      expect(() => verifyRefreshToken('bad.token')).toThrow();
    });
  });
});
