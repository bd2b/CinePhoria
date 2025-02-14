import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/configLog';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

// Étendre le type Request pour ajouter "user"
interface AuthenticatedRequest extends Request {
  user?: { compte: string };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: 'Accès interdit' });
      return;
    }

    // Stocker l'utilisateur dans req.user
    req.user = decoded as { compte: string };

    next(); // Passe à la route suivante

    
    // // Vérifier que le token est bien décodé et qu'il contient un compte
    // if (typeof decoded === 'object' && decoded !== null && 'compte' in decoded) {
    //   // Stocker l'utilisateur dans la requête
    //    const compteObjet = decoded as { compte: string };
    //    console.log("Middleware Compte = ", compteObjet.compte);
    // //  (req as any).user = compteObjet.compte;

    // req.user = decoded as { compte: string; role?: string };

    //   next(); // Passe à la route suivante
    // } else {
    //   res.status(403).json({ message: 'Accès interdit : token invalide' });
    // }
    // next(); // Passe à la route suivante
  });
};

