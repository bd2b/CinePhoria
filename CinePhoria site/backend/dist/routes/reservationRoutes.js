"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const configLog_1 = __importDefault(require("../config/configLog"));
const reservationController_1 = require("../controllers/reservationController");
const router = (0, express_1.Router)();
// POST /api/reservation
configLog_1.default.info('Declaration route /api/reservation/');
router.post('/', reservationController_1.ReservationController.createReservation);
// Confirmer une reservation
router.post('/confirm', authMiddleware_1.authenticateJWT, reservationController_1.ReservationController.confirmReservation);
// Annuler une reservation
router.post('/cancel', reservationController_1.ReservationController.cancelReservation);
// Modifier un etat de reservation
router.post('/setstate', authMiddleware_1.authenticateJWT, reservationController_1.ReservationController.setReservationStateById);
// Modifier une évaluation
router.post('/setevaluation', authMiddleware_1.authenticateJWT, reservationController_1.ReservationController.setReservationEvaluationById);
// Recupérer les stats de reservations
router.get('/getreservationstats', authMiddleware_1.authenticateJWT, reservationController_1.ReservationController.getReservationStatsAll);
// Recupérer les reservations d'un utilisateur
router.get('/:utilisateurId', authMiddleware_1.authenticateJWT, reservationController_1.ReservationController.getReservationForUtilisateur);
// GET /api/reservation/id/:reservationid'
router.get('/id/:reservationid', reservationController_1.ReservationController.getReservationById);
/**
 * Filtre pour selectionner les séances futures au format Display
 * d'un ou plusieurs cinemas
 * http://localhost:3000/api/reservation/filter?cinemasList="Liege","Toulouse"
 */
router.get('/cinema/filter', (req, res) => {
    reservationController_1.ReservationController.getReservationsByCinemas(req, res);
});
// GET /api/seats/id/:reservationid'
router.get('/seats/id/:reservationid', reservationController_1.ReservationController.getSeatsForReservation);
// PUT /api/reservation/avis/:reservationid
router.put('/avis/:reservationid', reservationController_1.ReservationController.updateReservationAvis);
// GET /api/reservation/qrcode
router.get('/qrcode/:reservationid', reservationController_1.ReservationController.getQRCode);
// GET /api/reservation/qrcodeimage
router.get('/qrcodeimage/:reservationid', authMiddleware_1.authenticateJWT, reservationController_1.ReservationController.getQRCodeImage);
// (Futur) GET /api/reservation/:id/seats
// router.get('/:id/seats', ReservationController.getSeatsForTarif);
exports.default = router;
