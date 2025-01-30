import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
}
 
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: 'Accès interdit' });
        return;
      }
      req.user = decoded as { compte: string }; // Assigner les infos du JWT à `req.user`
      next();
    });
  
};

//Extension du type Request pour véhiculer le compte, soit l'email de la personne connectée
// src/types/express.d.ts

