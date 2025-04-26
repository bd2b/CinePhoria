 

// Étendre Request pour ajouter la propriété `user`
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { compte: string };
    }
  }
}