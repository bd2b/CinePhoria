"use strict";
// src/middleware/authenticateOrigin.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateOrigin = authenticateOrigin;
const configLog_1 = __importDefault(require("../config/configLog"));
// Liste blanche des origines autorisées (frontend web et mobile app)
const allowedOrigins = [
    'http://128.0.0.1:3500',
    'https://cinephoria.bd2db.fr',
    'capacitor://localhost', // Si tu as une app mobile Capacitor
    'ionic://localhost', // Ou Cordova/Ionic
];
// Middleware pour sécuriser les appels API
function authenticateOrigin(req, res, next) {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const userAgent = req.get('User-Agent') || '';
    configLog_1.default.info(`AuthOrigin: origin=${origin}, referer=${referer}, ua=${userAgent}`);
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    const isAllowedReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));
    const isMobileApp = userAgent.includes('Mobile') && (referer === undefined || referer === null);
    configLog_1.default.info(`AuthOrigin: origin=${isAllowedOrigin}, referer=${isAllowedReferer}, ua=${isMobileApp}`);
    next();
    // if (isAllowedOrigin || isAllowedReferer || isMobileApp) {
    //     next();
    // } else {
    //     logger.warn(`Requête refusée : origine non autorisée. origin=${origin} referer=${referer}`);
    //     res.status(403).json({ message: 'Accès interdit : origine non autorisée.' });
    // }
}
