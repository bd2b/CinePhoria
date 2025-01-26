import { Router } from 'express';
import { SeanceController } from '../controllers/seanceController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { isAuthenticated } from '../middlewares/sessionMidleWare';
import logger from '../config/configLog';

import { ReservationController } from '../controllers/reservationController';

const router = Router();

// POST /api/reservation
logger.info('Declaration route /api/reservation/');
router.post('/', ReservationController.createReservation);

// (Futur) GET /api/reservation/:id
router.get('/:id', ReservationController.getReservation);

// (Futur) GET /api/reservation/:id/seats
router.get('/:id/seats', ReservationController.getSeatsForTarif);

export default router;