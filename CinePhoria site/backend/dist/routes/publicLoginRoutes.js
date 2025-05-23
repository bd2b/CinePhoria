"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const configLog_1 = __importDefault(require("../config/configLog"));
const router = (0, express_1.Router)();
// POST /api/login
configLog_1.default.info('Declaration route /api/login/');
// api de login
router.post('/', authController_1.AuthController.login);
// api de logout
router.get('/logout', authController_1.AuthController.logout);
// api de verification de logging
router.get('/isLogged', authMiddleware_1.authenticateJWT, (req, res) => {
    const user = req.user;
    res.send(user);
});
// api de renouvellement de accessToken via refreshToken
router.post('/refresh', authController_1.AuthController.refresh);
// api de verification du refreshToken en httpOnly 
router.get('/refresh-token-status', authMiddleware_1.authenticateJWT, (req, res) => {
    res.json({ message: "Refresh Token valide" });
});
// api de recupération de la version, build et date de mise à jour
router.get('/version', authController_1.AuthController.getVersion);
// api de push d'une maj version, build, date de mise à jour, message
router.post('/pushversion', authMiddleware_1.authenticateJWT, authController_1.AuthController.pushVersion);
exports.default = router;
