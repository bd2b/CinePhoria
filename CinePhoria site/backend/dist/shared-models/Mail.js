"use strict";
// shared-models/Mail.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mail = void 0;
/**
 * Décrit les caractéristiques du mail à envoyer.
 * emailDest est obligatoire, les autres champs sont facultatifs.
 */
class Mail {
    /**
     * Constructeur classique pour créer une instance de Mail.
     * @param emailDest L'adresse mail du destinataire (obligatoire)
     * @param subject Le sujet du mail
     * @param body Le contenu du mail (texte ou HTML)
     * @param isHtml Précise si le contenu est en HTML (false par défaut)
     * @param emailFrom L'adresse mail de l'expéditeur
     * @param cc Liste des adresses en copie (facultatif)
     * @param bcc Liste des adresses en copie cachée (facultatif)
     */
    constructor(emailDest, subject, body, emailFrom, isHtml = false, cc, bcc) {
        this.emailDest = emailDest;
        this.subject = subject;
        this.body = body;
        this.emailFrom = emailFrom;
        this.isHtml = isHtml;
        this.cc = cc;
        this.bcc = bcc;
    }
}
exports.Mail = Mail;
