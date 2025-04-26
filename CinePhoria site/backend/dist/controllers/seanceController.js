"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeanceController = void 0;
const SeanceDAO_1 = require("../dao/SeanceDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
class SeanceController {
    static async getAllSeances(req, res) {
        try {
            const seances = await SeanceDAO_1.SeanceDAO.findAll();
            res.json(seances);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async getAllSeancesDisplay(req, res) {
        try {
            const seancesDisplay = await SeanceDAO_1.SeanceDAO.findAllForDisplay();
            res.json(seancesDisplay);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async getSeancesById(req, res) {
        try {
            // Recuperation des ids de seance
            const idsParam = req.query.ids;
            if (!idsParam || typeof idsParam !== 'string') {
                res.status(400).json({ message: 'Le paramètre "ids" est requis et doit être une chaîne.' });
                return;
            }
            const idsArray = idsParam.split(',').map(id => id.trim());
            // Transformer en chaîne de caractères avec des guillemets doubles
            const idsFormatted = idsArray.map(id => `"${id}"`).join(',');
            const seances = await SeanceDAO_1.SeanceDAO.findByIds(idsFormatted);
            res.json(seances);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSeanceByCinemas(req, res) {
        try {
            // Vérification et conversion de cinemasList en string
            const cinemasList = req.query.cinemasList;
            if (!cinemasList || typeof cinemasList !== 'string') {
                return res.status(400).json({ message: `cinemasList doit être une chaîne de caractères : ${cinemasList}` });
            }
            const seances = await SeanceDAO_1.SeanceDAO.findByCinemas(cinemasList);
            if (seances.length === 0) {
                return res.status(404).json({ message: `Seances non trouvées pour ${cinemasList}` });
            }
            res.json(seances);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSeanceDisplayByCinemas(req, res) {
        try {
            // Vérification et conversion de cinemasList en string
            const cinemasList = req.query.cinemasList;
            if (!cinemasList || typeof cinemasList !== 'string') {
                return res.status(400).json({ message: `cinemasList doit être une chaîne de caractères : ${cinemasList}` });
            }
            const seances = await SeanceDAO_1.SeanceDAO.findDisplayByCinemas(cinemasList);
            if (seances.length === 0) {
                return res.status(404).json({ message: `Seances Display non trouvées pour ${cinemasList}` });
            }
            res.json(seances);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getTarifs(req, res) {
        try {
            const tarifs = await SeanceDAO_1.SeanceDAO.findTarifs();
            res.json(tarifs);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async getSeatsBooked(req, res) {
        try {
            // Recuperation de l'ID de la seance
            const seanceId = req.params.seanceid?.trim();
            if (!seanceId) {
                res.status(400).json({ message: `L'ID de la séance est requis.` });
                return;
            }
            // Récupération des places
            const siegesReserves = await SeanceDAO_1.SeanceDAO.getSeatsBooked(seanceId);
            const response = siegesReserves ? siegesReserves : { siegesReserves: "" };
            configLog_1.default.info("Sièges déjà réservés : " + JSON.stringify(response));
            res.status(200).json(response);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des sièges d'une séance : ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
}
exports.SeanceController = SeanceController;
