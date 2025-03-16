import { Router } from 'express';
import { SeanceController } from '../controllers/seanceController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog';

import { ReservationController } from '../controllers/reservationController';


const router = Router();

// POST /api/reservation
logger.info('Declaration route /api/reservation/');
router.post('/', ReservationController.createReservation);

// Confirmer une reservation
router.post('/confirm', authenticateJWT ,ReservationController.confirmReservation);

// Annuler une reservation
router.post('/cancel', ReservationController.cancelReservation);

// Modifier un etat de reservation
router.post('/setstate', authenticateJWT , ReservationController.setReservationStateById);

// Modifier une évaluation
router.post('/setevaluation', authenticateJWT, ReservationController.setReservationEvaluationById);

// Recupérer les reservations d'un utilisateur
router.get('/:utilisateurId', authenticateJWT ,ReservationController.getReservationForUtilisateur);

// GET /api/reservation/id/:reservationid'
router.get('/id/:reservationid', ReservationController.getReservationById);

// GET /api/seats/id/:reservationid'
router.get('/seats/id/:reservationid', ReservationController.getSeatsForReservation);

// GET /api/reservation/qrcode
router.get('/qrcode/:reservationid', ReservationController.getQRCode)

// GET /api/reservation/qrcodeimage
router.get('/qrcodeimage/:reservationid', ReservationController.getQRCodeImage)

// (Futur) GET /api/reservation/:id/seats
// router.get('/:id/seats', ReservationController.getSeatsForTarif);

export default router;