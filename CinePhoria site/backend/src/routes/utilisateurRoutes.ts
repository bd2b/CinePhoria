import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog'

import { UtilisateurController } from '../controllers/utilisateurController';

const router = Router();

// POST /api/utilisateur
logger.info('Declaration route /api/utilisateur/');
router.post('/create', UtilisateurController.createUtilisateur);
router.post('/confirmUtilisateur', UtilisateurController.confirmUtilisateur);
router.post('/confirmCompte', UtilisateurController.confirmCompte);
router.post('/askresetpwd', UtilisateurController.sendCodeReset);
router.post('/resetpwd', UtilisateurController.validateChangePwd);

// (Futur) GET /api/reservation/:id
// router.get('/:id', authenticateJWT, UtilisateurController.getUtilisateurById);

// GET /api/utilisateur
router.get('/:ident', UtilisateurController.getUtilisateur);


// (Futur) GET /api/reservation/:email
router.get('/mail/:email', UtilisateurController.getUtilisateurByMail);

export default router;