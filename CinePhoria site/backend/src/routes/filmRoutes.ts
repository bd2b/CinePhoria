import { Router } from 'express';
import { FilmController } from '../controllers/filmController';
import { AfficheController } from '../controllers/afficheController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog'

const router = Router();

// /api/films



router.get('/sorties', FilmController.getSortiesDeLaSemaine);

logger.info('Declaration route POST /api/films/affiche');
router.post('/affiche', AfficheController.create);

logger.info('Declaration route GET /api/films/affiche');
router.get('/affiche', AfficheController.getAll);

logger.info('Declaration route GET /api/films/affiche/:filmId');
router.get('/affiche/:filmId', AfficheController.getById);

logger.info('Declaration route GET /api/films/affichefile/:filmId');
router.get('/affichefile/:filmId', AfficheController.getImageById);

logger.info('Declaration route PUT /api/films/affiche/:filmId');
router.put('/affiche/:filmId', AfficheController.update);

logger.info('Declaration route DELETE /api/films/affiche/:filmId');
router.delete('/affiche/:filmId', AfficheController.delete);

logger.info('Declaration route GET /api/films/');
router.get('/', authenticateJWT , FilmController.getAllFilms);

logger.info('Declaration route POST /api/films');
router.post('/', authenticateJWT, FilmController.createFilm);

logger.info('Declaration route /api/films/:id');
router.get('/:id', authenticateJWT , FilmController.getFilmById);

logger.info('Declaration route PUT /api/films/:id');
router.put('/:id', authenticateJWT, FilmController.updateFilm);

logger.info('Declaration route DELETE /api/films/:id');
router.delete('/:id', authenticateJWT, FilmController.deleteFilm);

export default router;