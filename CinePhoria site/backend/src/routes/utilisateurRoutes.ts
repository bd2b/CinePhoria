import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { isAuthenticated } from '../middlewares/sessionMidleWare';
import logger from '../config/configLog'

import { UtilisateurController } from '../controllers/utilisateurController';

const router = Router();

// POST /api/utilisateur
router.post('/create', UtilisateurController.createUtilisateur);
router.post('/confirm', UtilisateurController.confirmUtilisateur);

// (Futur) GET /api/reservation/:id
router.get('/:id', UtilisateurController.getUtilisateurById);

// (Futur) GET /api/reservation/:email
router.get('/mail/:email', UtilisateurController.getUtilisateurByMail);

export default router;