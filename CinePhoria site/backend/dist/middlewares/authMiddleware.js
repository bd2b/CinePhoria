"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
        return;
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Accès interdit, token invalide ou expiré' });
        }
        // Stocker l'utilisateur dans req.user
        req.user = decoded;
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
