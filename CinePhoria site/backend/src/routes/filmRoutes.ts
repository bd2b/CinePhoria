import { Router } from 'express';
import { FilmController } from '../controllers/filmController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog'

const router = Router();

// /api/films
logger.info('Declaration route GET /api/films/');
router.get('/', authenticateJWT , FilmController.getAllFilms);

logger.info('Declaration route /api/films/:id');
router.get('/:id', authenticateJWT , FilmController.getFilmById);

router.get('/sorties', FilmController.getSortiesDeLaSemaine);

logger.info('Declaration route POST /api/films');
router.post('/', authenticateJWT, FilmController.createFilm);

logger.info('Declaration route PUT /api/films/:id');
router.put('/:id', authenticateJWT, FilmController.updateFilm);

logger.info('Declaration route DELETE /api/films/:id');
router.delete('/:id', authenticateJWT, FilmController.deleteFilm);

export default router;