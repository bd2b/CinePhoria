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

    if (err || typeof decoded !== 'object' || decoded === null) {
      return res.status(403).json({ message: 'Accès interdit, token invalide ou expiré' });
    }

    const { iat, exp, compte } = decoded as jwt.JwtPayload;

    const issuedAt = new Date(iat! * 1000);
    const expiresAt = new Date(exp! * 1000);
    const now = new Date();

    logger.debug(`🔐 Token reçu - compte: ${compte}`);
    logger.debug(`   iat (issued at)  = ${iat} -> ${issuedAt.toISOString()}`);
    logger.debug(`   exp (expiration) = ${exp} -> ${expiresAt.toISOString()}`);
    logger.debug(`   now              = ${now.toISOString()}`);

    req.user = { compte }; // Sécurité : on ne transmet que ce qu'on attend
    next();
  });
};


