"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configLog_1 = __importDefault(require("../config/configLog"));
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
        return;
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
        if (err || typeof decoded !== 'object' || decoded === null) {
            return res.status(403).json({ message: 'Accès interdit, token invalide ou expiré' });
        }
        const { iat, exp, compte } = decoded;
        const issuedAt = new Date(iat * 1000);
        const expiresAt = new Date(exp * 1000);
        const now = new Date();
        configLog_1.default.info(`🔐 Token reçu - compte: ${compte}`);
        configLog_1.default.info(`   iat (issued at)  = ${iat} -> ${issuedAt.toISOString()}`);
        configLog_1.default.info(`   exp (expiration) = ${exp} -> ${expiresAt.toISOString()}`);
        configLog_1.default.info(`   now              = ${now.toISOString()}`);
        req.user = { compte }; // Sécurité : on ne transmet que ce qu'on attend
        next();
    });
};
exports.authenticateJWT = authenticateJWT;
// export const authenticateJWT2 = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
//     return;
//   }
//   const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"
//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       res.status(403).json({ message: 'Accès interdit' });
//       return;
//     }
//     // Stocker l'utilisateur dans req.user
//     req.user = decoded as { compte: string };
//     next(); 
//   });
// };
