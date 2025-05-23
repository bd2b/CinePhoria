"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configLog_1 = __importDefault(require("../config/configLog"));
const sanitizeQueryMiddleware = (req, res, next) => {
    const dangerousPatterns = [
        /<script.*?>.*?<\/script>/gi, // Scripts HTML
        /javascript:/gi, // URLs JavaScript
        /on\w+=["'].*?["']/gi, // Gestionnaires d'événements HTML
        /[';]/g, // Caractères utilisés pour l'injection SQL. On autorise les "" pour les valeurs string mais pas les ''
        /(\b(UNION|SELECT|DROP|INSERT|DELETE|UPDATE|ALTER|CREATE|EXEC)\b)/gi, // Commandes SQL
    ];
    let mustContinue = true;
    // Parcourt chaque clé dans req.query
    for (const key in req.query) {
        const value = req.query[key];
        if (typeof value === 'string') {
            dangerousPatterns.forEach((pattern) => {
                if (pattern.test(value)) {
                    // Journalisation pour le débogage ou la sécurité
                    mustContinue = false;
                    configLog_1.default.warn(`Tentative d'injection détectée dans le paramètre "${key}": ${value} par le pattern ${pattern}`);
                    res.status(400).json({ message: `Paramètre "${key}" contient un contenu non autorisé.` });
                    return;
                }
            });
        }
    }
    if (mustContinue) {
        next(); // Poursuit la requête si tout est correct
    }
};
exports.default = sanitizeQueryMiddleware;
