"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seanceController_1 = require("../controllers/seanceController");
const configLog_1 = __importDefault(require("../config/configLog"));
const router = (0, express_1.Router)();
// /api/seances
configLog_1.default.info('Declaration route /api/seances/');
/**
 * Route pour récupérer toutes les séances futures de tous les cinemas
 */
router.get('/', seanceController_1.SeanceController.getAllSeances);
/**
 * Route pour récupérer toutes les séances futures de tous les cinemas
 * en format Display pour l'Intranet
 */
router.get('/display', seanceController_1.SeanceController.getAllSeancesDisplay);
/**
 * Filtre pour selectionner les séances future d'un ou plusieurs cinemas
 * /api/seances/filter?cinemasList="Liege","Toulouse"
 */
router.get('/filter', (req, res) => {
    seanceController_1.SeanceController.getSeanceByCinemas(req, res);
});
/**
 * Filtre pour selectionner les séances futures au format Display
 * d'un ou plusieurs cinemas
 * /api/seances/display/filter?cinemasList="Liege","Toulouse"
 */
router.get('/display/filter', (req, res) => {
    seanceController_1.SeanceController.getSeanceDisplayByCinemas(req, res);
});
/**
 * Récupération des tarifs
 */
router.get('/tarif', (req, res) => {
    seanceController_1.SeanceController.getTarifs(req, res);
});
/**
 * Récupération des sieges reservés pour une séance
 */
router.get('/seats/:seanceid', (req, res) => {
    seanceController_1.SeanceController.getSeatsBooked(req, res);
});
/**
 * Récupération d'un tableau de seance
 */
router.get('/seances', (req, res) => {
    seanceController_1.SeanceController.getSeancesById(req, res);
});
exports.default = router;
