import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'student' | 'admin';
      };
    }
  }
}

// Utiliser la même clé secrète que dans authController
const JWT_SECRET = process.env.JWT_SECRET || 'braille-tutor-secret-key-2026';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Aucun token fourni' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: 'student' | 'admin';
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    return;
  }
  next();
};
