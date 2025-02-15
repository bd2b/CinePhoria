import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/configLog';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';


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

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Accès interdit, token invalide ou expiré' });
    }
   // Stocker l'utilisateur dans req.user
    req.user = decoded as { compte: string };
    next();
  });
};

// export const authenticateJWT2 = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
//     return;
//   }

//   const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       res.status(403).json({ message: 'Accès interdit' });
//       return;
//     }

//     // Stocker l'utilisateur dans req.user
//     req.user = decoded as { compte: string };

//     next(); 
//   });
// };

