import { Request, Response } from 'express';
import { UtilisateurDAO } from '../dao/UtilisateurDAO';
import logger from '../config/configLog';
import { MailNetwork } from '../services/MailNetwork';
import { ComptePersonne, TypeCompte } from '../shared-models/Utilisateur';

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
      logger.info("Début sendCodeReset")
      const { email } = req.body;
      logger.info("Début sendCodeReset 2")

      // Validation des données d'entrée
      if (!email ) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }
      logger.info("Début sendCodeReset 3")
      // Appel au DAO pour Recupérer le code de confirmation
      const result = await UtilisateurDAO.createCodeConfirm(email, 'reset');
      logger.info("Début sendCodeReset 4")
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


  static async createEmploye(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, isAdministrateur, firstnameEmploye, 
        lastnameEmploye, matricule, listCinemas } = req.body;

      // Validation des données d'entrée
      if (  !email || !password || !isAdministrateur ||
         !firstnameEmploye || !lastnameEmploye || !matricule ) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await UtilisateurDAO.createEmploye(
        email, password, isAdministrateur, firstnameEmploye, 
        lastnameEmploye, matricule, listCinemas
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        res.status(200).json({ id: result });
      };
    } catch (error) {
      console.error('Erreur dans createEmploye:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  };


  static async getEmployesComptes(req: Request,res: Response) {
    try {
      const comptePersonnes = await UtilisateurDAO.getEmployesComptes();
      res.json(comptePersonnes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
// PUT => update a ComptePersonne pour les champs modifiables
  static async updateEmploye(req: Request, res: Response) {
    try {
      const { email, password, isAdministrateur, firstnameEmploye, 
        lastnameEmploye, matricule, listCinemas } = req.body;

      logger.info(`Mise à jour de l'employe ${matricule} avec data=`, req.body);

      const result = await UtilisateurDAO.updateEmploye(email, password, isAdministrateur, firstnameEmploye, 
        lastnameEmploye, matricule, listCinemas);
      if (result) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Employe non trouvé ou non mis à jour' });
      } 
    } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }

    
    // GET => Récupérer un compte unitaire
    static async getEmployeByMatricule(req: Request, res: Response) {
      try {
        const employe = await UtilisateurDAO.getEmployeByMatricule(req.params.matricule);
        res.json(employe);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    };
    
    

    // DELETE => remove a SeanceSeule
  static async deleteEmployeByMatricule(req: Request, res: Response) {
    try {
      const matricule = parseInt(req.params.matricule, 10);
      logger.info(`Suppression de l'employe ${matricule}`);

      const success = await UtilisateurDAO.deleteEmployeByMatricule(matricule);

      if (success) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Employe non trouvé ou déjà supprimé' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

}