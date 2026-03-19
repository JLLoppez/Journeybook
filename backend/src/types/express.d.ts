import { AuthRequest } from '../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

declare module 'express';
declare module 'cors';
declare module 'morgan';
declare module 'bcryptjs';
declare module 'jsonwebtoken';

export {};
