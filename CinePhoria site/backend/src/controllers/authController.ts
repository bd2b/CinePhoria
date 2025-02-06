import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UtilisateurDAO } from '../dao/UtilisateurDAO';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';



export class AuthController {
  static async login(req: Request, res: Response) : Promise<void> {
    const { compte, password } = req.body;

    // Vérification des identifiants
    const resultText = await UtilisateurDAO.login(compte,password)
    // Exemple simple (remplacez par une vérification réelle des identifiants)
    if (resultText !== 'OK') {
      if (resultText === 'KO : Compte bloqué') {
        res.status(401).json({ message: ' Votre compte est bloqué suite un trop grand nombre de tentative de connexion' });
        
      } else {
        res.status(401).json({ message: ' Erreur de mail ou de mot de passe' });
      }
      return;
    }
    const token = jwt.sign({ compte }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    
  }

  static confirmUser(req: Request, res: Response) : void {
    const { utilisateurId, displayName, password} = req.body;
  }

  static isLogged(req: Request, res: Response) : void {
    return;
  }
}