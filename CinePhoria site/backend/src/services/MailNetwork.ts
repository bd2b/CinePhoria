// services/MailNetwork.ts

import { Mail } from '../shared-models/Mail';
import { mailConfig } from '../config/config';
import nodemailer from 'nodemailer';
import logger from '../config/configLog'

const isBouchon = false;
logger.info ( isBouchon ? "ENVOI DE MAIL bouchonne" : "ENVOI DE MAIL en service");
// Ce contrôleur effectue l'envoi de mail en s'appuyant sur la configuration
export class MailNetwork {
  static async sendMail(mail: Mail): Promise<string> {
    try {
      
      // Paramètres de connexion SMTP
      const transporter = nodemailer.createTransport({
        host: mailConfig.SMTP_HOST,
        port: parseInt(mailConfig.SMTP_PORT, 10),
        secure: mailConfig.SMTP_PORT === '465', // true pour 465, sinon false
        auth: {
          user: mailConfig.SMTP_USER,
          pass: mailConfig.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // en dev, ou si STARTTLS...
        },
      });

      // Préparer l’objet mail
      const mailOptions = {
        from: mailConfig.SMTP_FROM,
        to: mail.emailDest,
        subject: mail.subject || 'Message de Cinephoria',
        // Si isHtml => 'html' sinon 'text'
        [mail.isHtml ? 'html' : 'text']: mail.body || '',
        cc: mail.cc?.length ? mail.cc.join(',') : undefined,
        bcc: mail.bcc?.length ? mail.bcc.join(',') : undefined,
        // attachments: ...
      };
      logger.info( "mailOptions = " + JSON.stringify(mailOptions))
      if (isBouchon) {
        return 'OK : appel bouchonné'
      } else {
        // Envoi via nodemailer
        const info = await transporter.sendMail(mailOptions);

        // Retour d’info
        return `OK : Envoi réussi, messageId = ${info.messageId}`;
      }
    } catch (error: any) {
      console.error('Erreur lors de l’envoi du mail :', error);
      return `Erreur : ${error.message || error}`;
    }
  }

  static async sendMailCodeConfirm(email: string, codeConfirm: string): Promise<string> {
    try {
      
      // Paramètres de connexion SMTP
      const transporter = nodemailer.createTransport({
        host: mailConfig.SMTP_HOST,
        port: parseInt(mailConfig.SMTP_PORT, 10),
        secure: mailConfig.SMTP_PORT === '465', // true pour 465, sinon false
        auth: {
          user: mailConfig.SMTP_USER,
          pass: mailConfig.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // en dev, ou si STARTTLS...
        },
      });

      // Préparer l’objet mail
      const mailOptions = {
        from: mailConfig.SMTP_FROM,
        to: email,
        subject: 'CinePhoria: Vérification de votre email',
        text: `
        Bonjour,

        Voici le code de vérification à renseigner dans le formulaire CinePhoria

        ${codeConfirm}
        
        A bientôt dans nos cinémas,

        L'équipe de CinePhoria
        `
        
      };
      logger.info( "mailOptions = " + JSON.stringify(mailOptions))
      if (isBouchon) {
        return 'OK : appel bouchonné'
      } else {
        // Envoi via nodemailer
        const info = await transporter.sendMail(mailOptions);

        // Retour d’info
        return `OK : Envoi réussi, messageId = ${info.messageId}`;
      }
    } catch (error: any) {
      console.error('Erreur lors de l’envoi du mail de vérification :', error);
      return `Erreur : ${error.message || error}`;
    }
  }
}


