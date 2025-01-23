import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Exemple d'utilisateurs enregistrés
const users = [
    {
      email: 'example@user.com',
      password: 'password123',
    },
  ];

export class AuthController {
  static login(req: Request, res: Response) : void {
    const { email, password } = req.body;

    // Vérification des identifiants
    const user = users.find((u) => u.email === email && u.password === password);
    
    // Exemple simple (remplacez par une vérification réelle des identifiants)
    if (!user) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    
  }

  static confirmUser(req: Request, res: Response) : void {
    const { utilisateurId, displayName, password} = req.body;

    
  }
}