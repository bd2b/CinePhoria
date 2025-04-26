"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalleController = void 0;
const SalleDAO_1 = require("../dao/SalleDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const Salle_1 = require("../shared-models/Salle");
class SalleController {
    static async getAllSalles(req, res) {
        try {
            const films = await SalleDAO_1.SalleDAO.findAll();
            res.json(films);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async getSalleById(req, res) {
        try {
            const film = await SalleDAO_1.SalleDAO.findById(req.params.id);
            //   if (!film) {
            //     return res.status(404).json({ message: 'Salle non trouvé' });
            //   }
            res.json(film);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSalleByCinema(req, res) {
        try {
            const salles = await SalleDAO_1.SalleDAO.findByCinema(req.params.cinema);
            //   if (!film) {
            //     return res.status(404).json({ message: 'Salle non trouvé' });
            //   }
            res.json(salles);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // POST => create a Salle
    static async createSalle(req, res) {
        try {
            // On récupère les données dans req.body
            const data = req.body;
            configLog_1.default.info("Creation d'une salle film avec data = ", data);
            // On construit un Salle
            const filmToCreate = new Salle_1.Salle(data);
            // Appel du DAO
            const newId = await SalleDAO_1.SalleDAO.createSalle(filmToCreate);
            // On renvoie l’ID ou un message
            res.status(201).json({ message: 'OK', id: newId });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // PUT => update a Salle
    static async updateSalle(req, res) {
        try {
            const salleId = req.params.id;
            const data = req.body;
            configLog_1.default.info(`Mise à jour de la salle ${salleId} avec data=`, data);
            const salleToUpdate = new Salle_1.Salle(data);
            const result = await SalleDAO_1.SalleDAO.updateSalle(salleId, salleToUpdate);
            if (result) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Salle non trouvé ou non mis à jour' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // DELETE => remove a Salle
    static async deleteSalle(req, res) {
        try {
            const salleId = req.params.id;
            configLog_1.default.info(`Suppression de la salle ${salleId}`);
            const success = await SalleDAO_1.SalleDAO.deleteSalle(salleId);
            if (success) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Salle non trouvé ou déjà supprimé' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.SalleController = SalleController;
