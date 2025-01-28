import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UtilisateurDAO } from '../dao/UtilisateurDAO';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Exemple d'utilisateurs enregistrés
const users = [
    {
      compte: 'example@user.com',
      password: 'password123',
    },
  ];

export class AuthController {
  static login(req: Request, res: Response) : void {
    const { compte, password } = req.body;

    // Vérification des identifiants
    const user = users.find((u) => u.compte === compte && u.password === password);
    
    // Exemple simple (remplacez par une vérification réelle des identifiants)
    if (!user) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
    }
    const token = jwt.sign({ compte }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    
  }

  static confirmUser(req: Request, res: Response) : void {
    const { utilisateurId, displayName, password} = req.body;

    
  }
}