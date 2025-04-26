// controllers/MailController.ts

import { Request, Response } from 'express';
import { MailNetwork } from '../services/MailNetwork';
import { Mail } from '../shared-models/Mail';
import logger from '../config/configLog';

export class MailController {

  /**
   * Exemple d'endpoint POST /api/mail/confirmUtilisateur
   * qui reçoit un objet { emailDest, subject, body, ... }
   */
  static async sendMail(req: Request, res: Response): Promise<void> {
    try {
      logger.info(JSON.stringify(req.body));
      // Extraire les données du body
      let { mailInput } = req.body;

      // Vérification que mailInput est bien un objet valide
      if (!mailInput || !mailInput.emailDest) {
        res.status(400).json({ message: "Parametre d'appel invalide" });
        return;
      }

      // Validation de base
      if (!mailInput.emailDest) {
        res.status(400).json({ message: 'emailDest est obligatoire.' });
        return;
      }

      // Construire l’objet Mail
      const mail = new Mail(
        mailInput.emailDest,
        mailInput.subject,
        mailInput.body,
        mailInput.emailFrom,
        mailInput.isHtml
      );

      // Appeler la fonction d’envoi
      const result = await MailNetwork.sendMailContact(mail);
      logger.info("Résultat envoi mail => ", result);

      // Gérer le résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        res.status(200).json({ statut: result });
      }

    } catch (error) {
      logger.error('Erreur dans envoi de mail:', error);
      res.status(500).json({ message: `Erreur dans envoi de mail : ${error}` });
    }
  }

}