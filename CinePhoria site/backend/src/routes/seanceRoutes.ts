import { Router } from 'express';
import { SeanceController } from '../controllers/seanceController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { isAuthenticated } from '../middlewares/sessionMidleWare';
import logger from '../config/configLog'

const router = Router();

// /api/seances
logger.info('Declaration route /api/seances/');

/**
 * Route pour récupérer toutes les séances futures de tous les cinemas
 */
router.get('/', SeanceController.getAllSeances);

/** 
 * Filtre pour selectionner les séances future d'un ou plusieurs cinemas
 * http://localhost:3000/api/seances/filter?cinemasList="Liege","Toulouse"
 */
router.get('/filter', (req, res) => { 
    SeanceController.getSeanceByCinemas(req, res)
});

export default router;