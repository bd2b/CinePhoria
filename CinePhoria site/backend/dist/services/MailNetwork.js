"use strict";
// services/MailNetwork.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailNetwork = void 0;
const config_1 = require("../config/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const configLog_1 = __importDefault(require("../config/configLog"));
const Mail_1 = require("../models/Mail");
let isBouchon = true;
if (config_1.modeExec === 'développement')
    isBouchon = false;
configLog_1.default.info(isBouchon ? "ENVOI DE MAIL bouchonne" : "ENVOI DE MAIL en service");
// Ce contrôleur effectue l'envoi de mail en s'appuyant sur la configuration
class MailNetwork {
    static async sendMailContact(mail) {
        try {
            // Paramètres de connexion SMTP
            const transporter = nodemailer_1.default.createTransport({
                host: config_1.mailConfig.SMTP_HOST,
                port: parseInt(config_1.mailConfig.SMTP_PORT, 10),
                secure: config_1.mailConfig.SMTP_PORT === '465', // true pour 465, sinon false
                auth: {
                    user: config_1.mailConfig.SMTP_USER,
                    pass: config_1.mailConfig.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false, // en dev, ou si STARTTLS...
                },
            });
            // Préparer l’objet mail
            const mailOptions = {
                from: config_1.mailConfig.SMTP_FROM,
                to: mail.emailDest,
                subject: mail.subject || 'Message de Cinephoria',
                // Si isHtml => 'html' sinon 'text'
                [mail.isHtml ? 'html' : 'text']: mail.body || '',
                cc: mail.cc?.length ? mail.cc.join(',') : undefined,
                bcc: config_1.mailConfig.SMTP_FROM
                // attachments: ...
            };
            configLog_1.default.info("mailOptions = " + JSON.stringify(mailOptions));
            if (isBouchon) {
                return 'OK : appel bouchonné';
            }
            else {
                // Envoi via nodemailer
                const info = await transporter.sendMail(mailOptions);
                // Retour d’info
                return `OK : Envoi réussi, messageId = ${info.messageId}`;
            }
        }
        catch (error) {
            console.error('Erreur lors de l’envoi du mail :', error);
            return `Erreur : ${error.message || error}`;
        }
    }
    static async sendMailCodeConfirm(email, codeConfirm) {
        try {
            // Paramètres de connexion SMTP
            const transporter = nodemailer_1.default.createTransport({
                host: config_1.mailConfig.SMTP_HOST,
                port: parseInt(config_1.mailConfig.SMTP_PORT, 10),
                secure: config_1.mailConfig.SMTP_PORT === '465', // true pour 465, sinon false
                auth: {
                    user: config_1.mailConfig.SMTP_USER,
                    pass: config_1.mailConfig.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false, // en dev, ou si STARTTLS...
                },
            });
            // Préparer l’objet mail
            const mailOptions = {
                from: config_1.mailConfig.SMTP_FROM,
                to: email,
                subject: 'CinePhoria: Vérification de votre email',
                html: (0, Mail_1.mailToSend)('Bonjour', `<p>Voici le code de vérification à renseigner sur le site CinePhoria<br>
          ${codeConfirm}<br>
          <br>A bientôt dans nos cinémas,<\p>`, `L'équipe de Cinephoria`),
            };
            configLog_1.default.info("mailOptions = " + JSON.stringify(mailOptions));
            if (isBouchon) {
                return 'OK : appel bouchonné';
            }
            else {
                // Envoi via nodemailer
                const info = await transporter.sendMail(mailOptions);
                // Retour d’info
                return `OK : Envoi réussi, messageId = ${info.messageId}`;
            }
        }
        catch (error) {
            console.error('Erreur lors de l’envoi du mail de vérification :', error);
            return `Erreur : ${error.message || error}`;
        }
    }
}
exports.MailNetwork = MailNetwork;
