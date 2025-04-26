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
 * Route pour récupérer toutes les séances futures de tous les cinemas
 * en format Display pour l'Intranet
 */
router.get('/display', SeanceController.getAllSeancesDisplay);

/** 
 * Filtre pour selectionner les séances future d'un ou plusieurs cinemas
 * /api/seances/filter?cinemasList="Liege","Toulouse"
 */
router.get('/filter', (req, res) => { 
    SeanceController.getSeanceByCinemas(req, res)
});

/** 
 * Filtre pour selectionner les séances futures au format Display
 * d'un ou plusieurs cinemas
 * /api/seances/display/filter?cinemasList="Liege","Toulouse"
 */
router.get('/display/filter', (req, res) => { 
    SeanceController.getSeanceDisplayByCinemas(req, res)
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