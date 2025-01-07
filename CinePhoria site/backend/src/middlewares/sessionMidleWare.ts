import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if ((req.session as any).user) {
    next(); // Passe à la prochaine route ou middleware
  } else {
    res.status(401).json({ message: 'Non autorisé, veuillez vous connecter' });
  }
};