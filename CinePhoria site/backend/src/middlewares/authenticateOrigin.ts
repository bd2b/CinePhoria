// src/middleware/authenticateOrigin.ts

import { Request, Response, NextFunction } from 'express';
import logger from '../config/configLog';

// Liste blanche des origines autorisées (frontend web et mobile app)
const allowedOrigins = [
    'http://128.0.0.1:3500',
    'https://cinephoria.bd2db.fr',
    'capacitor://localhost', // Si tu as une app mobile Capacitor
    'ionic://localhost',     // Ou Cordova/Ionic
];

// Middleware pour sécuriser les appels API
export function authenticateOrigin(req: Request, res: Response, next: NextFunction) {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const userAgent = req.get('User-Agent') || '';

    logger.info(`AuthOrigin: origin=${origin}, referer=${referer}, ua=${userAgent}`);

    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    const isAllowedReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

    const isMobileApp = userAgent.includes('Mobile') && (referer === undefined || referer === null);
    logger.info(`AuthOrigin: origin=${isAllowedOrigin}, referer=${isAllowedReferer}, ua=${isMobileApp}`);

    next();

    // if (isAllowedOrigin || isAllowedReferer || isMobileApp) {
    //     next();
    // } else {
    //     logger.warn(`Requête refusée : origine non autorisée. origin=${origin} referer=${referer}`);
    //     res.status(403).json({ message: 'Accès interdit : origine non autorisée.' });
    // }
}