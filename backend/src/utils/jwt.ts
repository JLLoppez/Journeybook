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
    env.jwtSecret as string,
    { expiresIn: (process.env.JWT_EXPIRE || '1h') as any }
  );
};

export const generateRefreshToken = (userId: mongoose.Types.ObjectId): string => {
  return jwt.sign(
    { userId: userId.toString() },
    env.jwtRefreshSecret as string,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any }
  );
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtSecret as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.jwtRefreshSecret as string) as { userId: string };
};
