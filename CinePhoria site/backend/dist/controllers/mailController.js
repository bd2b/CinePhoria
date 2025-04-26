"use strict";
// controllers/MailController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const MailNetwork_1 = require("../services/MailNetwork");
const Mail_1 = require("../shared-models/Mail");
const configLog_1 = __importDefault(require("../config/configLog"));
class MailController {
    /**
     * Exemple d'endpoint POST /api/mail/confirmUtilisateur
     * qui reçoit un objet { emailDest, subject, body, ... }
     */
    static async sendMail(req, res) {
        try {
            configLog_1.default.info(JSON.stringify(req.body));
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
            const mail = new Mail_1.Mail(mailInput.emailDest, mailInput.subject, mailInput.body, mailInput.emailFrom, mailInput.isHtml);
            // Appeler la fonction d’envoi
            const result = await MailNetwork_1.MailNetwork.sendMailContact(mail);
            configLog_1.default.info("Résultat envoi mail => ", result);
            // Gérer le résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                res.status(200).json({ statut: result });
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans envoi de mail:', error);
            res.status(500).json({ message: `Erreur dans envoi de mail : ${error}` });
        }
    }
}
exports.MailController = MailController;
