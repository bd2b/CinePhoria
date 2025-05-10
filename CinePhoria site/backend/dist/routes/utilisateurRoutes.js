"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateBodyShape_1 = require("../middlewares/validateBodyShape");
const configLog_1 = __importDefault(require("../config/configLog"));
const utilisateurController_1 = require("../controllers/utilisateurController");
const router = (0, express_1.Router)();
// POST /api/utilisateur
configLog_1.default.info('Declaration route /api/utilisateur/');
router.post('/create', utilisateurController_1.UtilisateurController.createUtilisateur);
router.post('/confirmUtilisateur', (0, validateBodyShape_1.validateBodyShape)({
    id: 'string',
    password: 'string',
    displayName: 'string'
}), utilisateurController_1.UtilisateurController.confirmUtilisateur);
(0, validateBodyShape_1.validateBodyShape)({
    id: 'string',
    password: 'string',
    displayName: 'string'
}),
    router.post('/confirmCompte', utilisateurController_1.UtilisateurController.confirmCompte);
router.post('/askresetpwd', utilisateurController_1.UtilisateurController.sendCodeReset);
router.post('/resetpwd', utilisateurController_1.UtilisateurController.validateChangePwd);
// (Futur) GET /api/reservation/:id
// router.get('/:id', authenticateJWT, UtilisateurController.getUtilisateurById);
router.post('/createEmploye', authMiddleware_1.authenticateJWT, utilisateurController_1.UtilisateurController.createEmploye);
router.get('/getemployes', authMiddleware_1.authenticateJWT, utilisateurController_1.UtilisateurController.getEmployesComptes);
router.put('/updateemploye', authMiddleware_1.authenticateJWT, utilisateurController_1.UtilisateurController.updateEmploye);
router.get('/getemploye/:matricule', authMiddleware_1.authenticateJWT, utilisateurController_1.UtilisateurController.getEmployeByMatricule);
router.delete('/deleteemploye/:matricule', authMiddleware_1.authenticateJWT, utilisateurController_1.UtilisateurController.deleteEmployeByMatricule);
// GET /api/utilisateur
router.get('/:ident', utilisateurController_1.UtilisateurController.getUtilisateur);
// (Futur) GET /api/reservation/:email
router.get('/mail/:email', utilisateurController_1.UtilisateurController.getUtilisateurByMail);
exports.default = router;
