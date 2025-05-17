import { Router } from 'express';
import { SeanceSeuleController } from '../controllers/seanceseuleController';
import { AfficheController } from '../controllers/afficheController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog'

const router = Router();

// /api/salles

logger.info('Declaration route GET /api/seancesseules/');
router.get('/', authenticateJWT , SeanceSeuleController.getAllSeanceSeules);

logger.info('Declaration route POST /api/seancesseules');
router.post('/', authenticateJWT, SeanceSeuleController.createSeanceSeule);

/** 
 * Récupération d'un tableau de seance
 */
router.get('/seancesseules', SeanceSeuleController.getSeancesSeulesById);

logger.info('Declaration route GET /api/seancesseules/:id');
router.get('/:id', authenticateJWT , SeanceSeuleController.getSeanceSeuleById);

logger.info('Declaration route PUT /api/seancesseules/:id');
router.put('/:id', authenticateJWT, SeanceSeuleController.updateSeanceSeule);

logger.info('Declaration route DELETE /api/seancesseules/:id');
router.delete('/:id', authenticateJWT, SeanceSeuleController.deleteSeanceSeule);



export default router;