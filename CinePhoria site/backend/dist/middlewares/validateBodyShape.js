"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBodyShape = validateBodyShape;
function validateObjectShape(obj, shape) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    for (const key in shape) {
        const expected = shape[key];
        const value = obj[key];
        if (value === undefined || value === null) {
            if (!expected.startsWith('nullable'))
                return false;
            continue;
        }
        const baseType = expected.replace('nullable-', '');
        if (typeof value !== baseType)
            return false;
    }
    return true;
}
/**
 * Middleware générateur pour valider req.body
 * @param shape la structure attendue (types)
 */
function validateBodyShape(shape) {
    return (req, res, next) => {
        if (!validateObjectShape(req.body, shape)) {
            res.status(400).json({ error: 'Requête invalide : structure incorrecte' });
            return; // important : arrêter l'exécution
        }
        next();
    };
}
