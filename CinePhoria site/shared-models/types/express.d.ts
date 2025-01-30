// src/types/express.d.ts
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: { compte: string }; // Ajoute la propriété `user` à Request
  }
}