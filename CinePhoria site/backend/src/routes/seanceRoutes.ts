import { Router } from 'express';
import { SeanceController } from '../controllers/seanceController';
import { authenticateJWT } from '../middlewares/authMiddleware';
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

/** 
 * Récupération des tarifs
 */
router.get('/tarif', (req, res) => { 
    SeanceController.getTarifs(req, res)
});

/** 
 * Récupération des sieges reservés pour une séance
 */
router.get('/seats/:seanceid', (req, res) => { 
    SeanceController.getSeatsBooked(req, res)
});


/** 
 * Récupération d'un tableau de seance
 */
router.get('/seances', (req, res) => { 
    SeanceController.getSeancesById(req, res)
});

export default router;