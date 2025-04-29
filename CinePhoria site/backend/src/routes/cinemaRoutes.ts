import { Router } from 'express';
import { CinemaController } from '../controllers/cinemaController';
import logger from '../config/configLog'
import { authenticateOrigin } from '../middlewares/authenticateOrigin';

const router = Router();

// /api/films
logger.info('Declaration route /api/cinemas/');
 router.get('/', authenticateOrigin, CinemaController.getAllCinemas);

export default router;