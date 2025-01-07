import { Router } from 'express';
import { FilmController } from '../controllers/filmController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { isAuthenticated } from '../middlewares/sessionMidleWare';
import logger from '../config/configLog'

const router = Router();

// /api/films
logger.info('Declaration route /api/films/');
 router.get('/protectJWT', authenticateJWT, FilmController.getAllFilms);
 router.get('/protectSession', isAuthenticated, FilmController.getAllFilms);
 router.get('/', FilmController.getAllFilms);
// logger.info('Declaration route /api/films/:id');
// router.get('/:id', FilmController.getFilmById);

export default router;