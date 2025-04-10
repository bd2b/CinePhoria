import { Router } from 'express';
import { SalleController } from '../controllers/salleController';
import { AfficheController } from '../controllers/afficheController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog'

const router = Router();

// /api/salles

logger.info('Declaration route GET /api/salles/');
router.get('/', authenticateJWT , SalleController.getAllSalles);

logger.info('Declaration route POST /api/salles');
router.post('/', authenticateJWT, SalleController.createSalle);

logger.info('Declaration route GET /api/salles/:id');
router.get('/:id', authenticateJWT , SalleController.getSalleById);

logger.info('Declaration route PUT /api/salles/:id');
router.put('/:id', authenticateJWT, SalleController.updateSalle);

logger.info('Declaration route DELETE /api/salles/:id');
router.delete('/:id', authenticateJWT, SalleController.deleteSalle);

export default router;