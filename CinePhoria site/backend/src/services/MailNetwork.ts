// services/MailNetwork.ts

import { Mail } from '../shared-models/Mail';
import { mailConfig , modeExec } from '../config/config';
import nodemailer from 'nodemailer';
import logger from '../config/configLog'
import { mailToSend } from '../models/Mail';

let isBouchon = true;
if (modeExec === 'production') isBouchon = false;

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

logger.info ( isBouchon ? "ENVOI DE MAIL bouchonne" : "ENVOI DE MAIL en service");
// Ce contrôleur effectue l'envoi de mail en s'appuyant sur la configuration
export class MailNetwork {
  static async sendMailContact(mail: Mail): Promise<string> {
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
        to: `${validateEmail(mail.emailDest) ? mail.emailDest : mailConfig.SMTP_FROM}`,
        subject: '[Cinephoria]: Demande de contact - ' + mail.subject || 'Message de Cinephoria',
        // Si isHtml => 'html' sinon 'text'
        [mail.isHtml ? 'html' : 'text']: 
        ` Bonjour,

          Nous avons pris en compte votre demande au sujet de : "${mail.subject}".
          
          Détail de votre demande : "${mail.body}"
          
          ${validateEmail(mail.emailDest) ? "Nous vous répondons dans les plus brefs délais." : "Sans coordonnées de réponse, n'hésitez pas à revenir vers nous si nécessaire."} 
          En attendant de vous revoir dans nos salles,
          
          L'équipe Cinephoria
          `  || '',
        cc: mail.cc?.length ? mail.cc.join(',') : undefined,
        bcc: `${validateEmail(mail.emailDest) ? mailConfig.SMTP_FROM : ""}`
        // attachments: ...
      };
      logger.info( "mailOptions = " + JSON.stringify(mailOptions))
      if (isBouchon) {
        logger.info("Appel bouchonne");
        return 'OK : appel bouchonné'
      } else {
        // Envoi via nodemailer
        logger.info("Appel non bouchonne");
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

        html: mailToSend(
          'Bonjour',
          `<p>Voici le code de vérification à renseigner sur le site CinePhoria<br>
          ${codeConfirm}<br>
          <br>A bientôt dans nos cinémas,<\p>`,
        `L'équipe de Cinephoria`
        ),

        
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


