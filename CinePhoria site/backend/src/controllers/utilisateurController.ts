import { Request, Response } from 'express';
import { UtilisateurDAO } from '../dao/UtilisateurDAO';
import logger from '../config/configLog';
import { MailNetwork } from '../services/MailNetwork';

export class UtilisateurController {
  static async createUtilisateur(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, displayName } = req.body;

      // Validation des données d'entrée
      if (!email || !password || !displayName === undefined) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await UtilisateurDAO.createUtilisateur(
        email,
        password,
        displayName
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        res.status(200).json({ id: result });
      };
    } catch (error) {
      console.error('Erreur dans createUtilisateur:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

  static async confirmUtilisateur(req: Request, res: Response): Promise<void> {
    try {
      const { id, password, displayName } = req.body;
      console.log(id, password, displayName);

      // Validation des données d'entrée
      if (!id || !password || displayName === undefined) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await UtilisateurDAO.confirmUtilisateur(
        id,
        password,
        displayName
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        res.status(200).json({ statut: result })
      };
    } catch (error) {
      console.error('Erreur dans confirmUtilisateur:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

  static async confirmCompte(req: Request, res: Response): Promise<void> {
    try {
      const { email, codeConfirm } = req.body;
      console.log(email, codeConfirm);

      // Validation des données d'entrée
      if (!email || !codeConfirm) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await UtilisateurDAO.confirmCompte(
        email,
        codeConfirm
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        res.status(200).json({ statut: result })
      };
    } catch (error) {
      console.error('Erreur dans confirmCompte:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

  static async getUtilisateurById(req: Request, res: Response) {
    try {
      const utilisateur = await UtilisateurDAO.findById(req.params.id);
      res.json(utilisateur);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  // Récupérer par ident 
  static async getUtilisateur(req: Request, res: Response) {
    try {
      const utilisateur = await UtilisateurDAO.findByIdent(req.params.ident);
      res.json(utilisateur);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };


  static async getUtilisateurByMail(req: Request, res: Response) {
    try {
      const utilisateur = await UtilisateurDAO.findByMail(req.params.email);
      res.json(utilisateur);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  static async sendCodeReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validation des données d'entrée
      if (!email ) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour Recupérer le code de confirmation
      const result = await UtilisateurDAO.createCodeConfirm(email, 'reset');
        
      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
          // Envoie du mail
          const statutMail = await MailNetwork.sendMailCodeConfirm(email, result);
          if (!statutMail.startsWith('OK')) res.status(500).json({ message: "Erreur sur l'envoi du code de vérification de mail " + statutMail });
      } 

    } catch (error) {
      console.error('Erreur dans sendCodeReset:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  }


  static async validateChangePwd(req: Request, res: Response): Promise<void> {
    try {
      const { email, codeConfirm , newPassword} = req.body;
      console.log(email, codeConfirm, '**********');

      // Validation des données d'entrée
      if (!email || !codeConfirm || !newPassword) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour verifier le code de confirmation
      const result = await UtilisateurDAO.verifyCodeConfirm(
        email,
        'reset',
        codeConfirm
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        // On peut changer le mot de passe
        await UtilisateurDAO.changePWD(email, newPassword);
        res.status(200).json({ statut: result })
      };
    } catch (error) {
      console.error('Erreur dans confirmCompte:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };

}