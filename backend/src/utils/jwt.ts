import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (userId: mongoose.Types.ObjectId, email: string, role: string): string => {
  return jwt.sign(
    { userId: userId.toString(), email, role },
    env.jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

export const generateRefreshToken = (userId: mongoose.Types.ObjectId): string => {
  return jwt.sign(
    { userId: userId.toString() },
    env.jwtRefreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.jwtRefreshSecret) as { userId: string };
};
