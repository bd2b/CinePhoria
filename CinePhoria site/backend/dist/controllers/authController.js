"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UtilisateurDAO_1 = require("../dao/UtilisateurDAO");
const AuthDAO_1 = require("../dao/AuthDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
// Durée de vie
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '15m'; // ex. 15 minutes
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d'; // ex. 7 jours
const MajSite_1 = require("../shared-models/MajSite");
class AuthController {
    /**
     * POST /api/login
     * Le user envoie { compte, password }
     * -> Vérification
     * -> Renvoi { accessToken } et , refreshToken dans les cookie   */
    static async login(req, res) {
        configLog_1.default.info("Controller = ", JSON.stringify(req.body));
        const { compte, password } = req.body;
        // Vérification des identifiants (ex. via DAO)
        const resultText = await UtilisateurDAO_1.UtilisateurDAO.login(compte, password);
        if (resultText !== 'OK') {
            if (resultText === 'KO : Compte bloqué') {
                res.status(401).json({ message: 'Compte bloqué suite trop d\'erreurs' });
            }
            else {
                res.status(401).json({ message: 'Erreur de mail ou de mot de passe' });
            }
            return;
        }
        // Générer un access token
        const accessToken = jsonwebtoken_1.default.sign({ compte }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        // Générer un refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ compte }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
        // Stocker refreshToken dans un cookie httpOnly
        res.cookie('refreshToken', refreshToken, {
            // TODO a voir quand on sera en https
            httpOnly: true, // empêche l'accès en JavaScript => plus sûr
            secure: true, // mettre true si HTTPS en production
            sameSite: 'none',
            partitioned: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en ms
        });
        // Renvoyer l'accessToken dans le body (ou dans l'en-tête)
        res.json({ accessToken });
    }
    /**
     * POST /api/login/refresh
     * Le user envoie le refreshToken via le cookie HttpOnly
     * On vérifie que le refreshToken est encore valide => renvoyer un nouveau accessToken
     */
    static async refresh(req, res) {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            res.status(401).json({ message: 'Aucun refresh token' });
            return;
        }
        jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({ message: 'Refresh token invalide ou expiré' });
                return;
            }
            // Générer un nouveau accessToken
            const compte = decoded.compte;
            //jwt.sign({ compte }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
            const newAccessToken = jsonwebtoken_1.default.sign({ compte }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_SECRET });
            res.json({ accessToken: newAccessToken });
        });
    }
    /**
   * POST /api/login/logout
   * Reçoit { refreshToken }, on le supprime du store => invalidation
   */
    static async logout(req, res) {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            res.status(401).json({ message: 'Aucun refresh token' });
            return;
        }
        // 2) Invalider le cookie côté client
        res.cookie('refreshToken', '', {
            // TODO a voir quand on sera en https
            httpOnly: true,
            secure: true, // en prod => true si HTTPS
            sameSite: 'none',
            expires: new Date(0) // date expirée
        });
        // 3) Réponse
        res.json({ message: 'Logout effectué, refresh token révoqué' });
        return; // S'assure que la fonction respecte `Promise<void>`
    }
    // Renvoi la version issue du .env
    static async getVersion(req, res) {
        try {
            const version = await AuthDAO_1.AuthDAO.getVersion();
            configLog_1.default.info(JSON.stringify(version));
            res.json(version);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async pushVersion(req, res) {
        try {
            // On récupère les données dans req.body
            const data = req.body;
            configLog_1.default.info("Creation d'une mise a jour avec data = ", data);
            // On construit une Maj
            const majToCreate = new MajSite_1.MajSite(data);
            // Appel du DAO
            const result = await AuthDAO_1.AuthDAO.pushVersion(majToCreate);
            // On renvoie l’ID ou un message
            res.status(201).json({ message: result });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async simplePushVersion(message) {
        const majSite = new MajSite_1.MajSite({ message: message });
        configLog_1.default.info(`Nouvelle Version =  + ${message}`);
        await AuthDAO_1.AuthDAO.pushVersion(majSite);
    }
}
exports.AuthController = AuthController;
