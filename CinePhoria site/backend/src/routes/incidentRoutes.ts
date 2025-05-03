import { Router } from 'express';
import { IncidentController } from '../controllers/incidentController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog'

const router = Router();

// /api/incidents

logger.info('Declaration route GET /api/incidents/');
router.get('/', authenticateJWT , IncidentController.getAllIncidents);

logger.info('Declaration route POST /api/incidents');
router.post('/', authenticateJWT, IncidentController.createIncident);

logger.info('Declaration route GET /api/incidents/:id');
router.get('/:id', authenticateJWT , IncidentController.getIncidentById);

logger.info('Declaration route PUT /api/incidents/:id');
router.put('/:id', authenticateJWT, IncidentController.updateIncident);

logger.info('Declaration route DELETE /api/incidents/:id');
router.delete('/:id', authenticateJWT, IncidentController.deleteIncident);

export default router;