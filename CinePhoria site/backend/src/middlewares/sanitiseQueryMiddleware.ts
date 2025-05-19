import { Request, Response, NextFunction } from 'express';
import logger from '../config/configLog'

const sanitizeQueryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const dangerousPatterns = [
    /<script.*?>.*?<\/script>/gi,  // Scripts HTML
    /javascript:/gi,              // URLs JavaScript
    /on\w+=["'].*?["']/gi,        // Gestionnaires d'événements HTML
    /[';]/g,                     // Caractères utilisés pour l'injection SQL. On autorise les "" pour les valeurs string mais pas les ''
    /(\b(UNION|SELECT|DROP|INSERT|DELETE|UPDATE|ALTER|CREATE|EXEC)\b)/gi, // Commandes SQL
  ];
  // Parcourt chaque clé dans req.query
  for (const key in req.query) {
    const value = req.query[key];

    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          logger.warn(`Tentative d'injection détectée dans le paramètre "${key}": ${value} par le pattern ${pattern}`);
          if (!res.headersSent) {
            res.status(400).json({ message: `Paramètre "${key}" contient un contenu non autorisé.` });
            return;
          }
          return; // Empêche d'autres réponses ou erreurs
        }
      }
    }
  }
  return next(); // Poursuit la requête si tout est correct
};

export default sanitizeQueryMiddleware;