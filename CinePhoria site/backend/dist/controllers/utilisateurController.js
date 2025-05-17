"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilisateurController = void 0;
const UtilisateurDAO_1 = require("../dao/UtilisateurDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const MailNetwork_1 = require("../services/MailNetwork");
class UtilisateurController {
    static async createUtilisateur(req, res) {
        try {
            const { email, password, displayName } = req.body;
            // Validation des données d'entrée
            if (!email || !password || !displayName === undefined) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour exécuter la procédure stockée
            const result = await UtilisateurDAO_1.UtilisateurDAO.createUtilisateur(email, password, displayName);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                res.status(200).json({ id: result });
            }
            ;
        }
        catch (error) {
            console.error('Erreur dans createUtilisateur:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    ;
    static async confirmUtilisateur(req, res) {
        try {
            const { id, password, displayName } = req.body;
            console.log(id, password, displayName);
            // Validation des données d'entrée
            if (!id || !password || displayName === undefined) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour exécuter la procédure stockée
            const result = await UtilisateurDAO_1.UtilisateurDAO.confirmUtilisateur(id, password, displayName);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                res.status(200).json({ statut: result });
            }
            ;
        }
        catch (error) {
            console.error('Erreur dans confirmUtilisateur:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    ;
    static async confirmCompte(req, res) {
        try {
            const { email, codeConfirm } = req.body;
            console.log(email, codeConfirm);
            // Validation des données d'entrée
            if (!email || !codeConfirm) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour exécuter la procédure stockée
            const result = await UtilisateurDAO_1.UtilisateurDAO.confirmCompte(email, codeConfirm);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                res.status(200).json({ statut: result });
            }
            ;
        }
        catch (error) {
            console.error('Erreur dans confirmCompte:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    ;
    static async getUtilisateurById(req, res) {
        try {
            const utilisateur = await UtilisateurDAO_1.UtilisateurDAO.findById(req.params.id);
            res.json(utilisateur);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    // Récupérer par ident 
    static async getUtilisateur(req, res) {
        try {
            const utilisateur = await UtilisateurDAO_1.UtilisateurDAO.findByIdent(req.params.ident);
            res.json(utilisateur);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async getUtilisateurByMail(req, res) {
        try {
            const utilisateur = await UtilisateurDAO_1.UtilisateurDAO.findByMail(req.params.email);
            res.json(utilisateur);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async sendCodeReset(req, res) {
        try {
            const { email } = req.body;
            // Validation des données d'entrée
            if (!email) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour Recupérer le code de confirmation
            const result = await UtilisateurDAO_1.UtilisateurDAO.createCodeConfirm(email, 'reset');
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                // Envoie du mail
                const statutMail = await MailNetwork_1.MailNetwork.sendMailCodeConfirm(email, result);
                if (!statutMail.startsWith('OK'))
                    res.status(500).json({ message: "Erreur sur l'envoi du code de vérification de mail " + statutMail });
            }
        }
        catch (error) {
            console.error('Erreur dans sendCodeReset:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    static async validateChangePwd(req, res) {
        try {
            const { email, codeConfirm, newPassword } = req.body;
            console.log(email, codeConfirm, '**********');
            // Validation des données d'entrée
            if (!email || !codeConfirm || !newPassword) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour verifier le code de confirmation
            const result = await UtilisateurDAO_1.UtilisateurDAO.verifyCodeConfirm(email, 'reset', codeConfirm);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                // On peut changer le mot de passe
                await UtilisateurDAO_1.UtilisateurDAO.changePWD(email, newPassword);
                res.status(200).json({ statut: result });
            }
            ;
        }
        catch (error) {
            console.error('Erreur dans confirmCompte:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    ;
    static async createEmploye(req, res) {
        try {
            const { email, password, isAdministrateur, firstnameEmploye, lastnameEmploye, matricule, listCinemas } = req.body;
            // Validation des données d'entrée
            if (!email || !password || !isAdministrateur ||
                !firstnameEmploye || !lastnameEmploye || !matricule) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour exécuter la procédure stockée
            const result = await UtilisateurDAO_1.UtilisateurDAO.createEmploye(email, password, isAdministrateur, firstnameEmploye, lastnameEmploye, matricule, listCinemas);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                res.status(200).json({ id: result });
            }
            ;
        }
        catch (error) {
            console.error('Erreur dans createEmploye:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    ;
    static async getEmployesComptes(req, res) {
        try {
            const comptePersonnes = await UtilisateurDAO_1.UtilisateurDAO.getEmployesComptes();
            res.json(comptePersonnes);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    // PUT => update a ComptePersonne pour les champs modifiables
    static async updateEmploye(req, res) {
        try {
            const { email, password, isAdministrateur, firstnameEmploye, lastnameEmploye, matricule, listCinemas } = req.body;
            configLog_1.default.info(`Mise à jour de l'employe ${matricule} avec data=`, req.body);
            const result = await UtilisateurDAO_1.UtilisateurDAO.updateEmploye(email, password, isAdministrateur, firstnameEmploye, lastnameEmploye, matricule, listCinemas);
            if (result) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Employe non trouvé ou non mis à jour' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // GET => Récupérer un compte unitaire
    static async getEmployeByMatricule(req, res) {
        try {
            const employe = await UtilisateurDAO_1.UtilisateurDAO.getEmployeByMatricule(req.params.matricule);
            res.json(employe);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    // DELETE => remove a SeanceSeule
    static async deleteEmployeByMatricule(req, res) {
        try {
            const matricule = parseInt(req.params.matricule, 10);
            configLog_1.default.info(`Suppression de l'employe ${matricule}`);
            const success = await UtilisateurDAO_1.UtilisateurDAO.deleteEmployeByMatricule(matricule);
            if (success) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Employe non trouvé ou déjà supprimé' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.UtilisateurController = UtilisateurController;
