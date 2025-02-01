import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/configLog';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"

  jwt.verify(token, JWT_SECRET, (err, token) => {
    if (err) {
      res.status(403).json({ message: 'Accès interdit' });
      return;
    }
    // Stocker les informations utilisateur dans la requête
  //  req.user = decoded as { compte: string }; 
    next(); // Passe à la route suivante
  });
};

//Extension du type Request pour véhiculer le compte, soit l'email de la personne connectée
// src/types/express.d.ts

