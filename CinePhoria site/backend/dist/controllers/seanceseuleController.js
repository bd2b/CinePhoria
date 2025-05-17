"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeanceSeuleController = void 0;
const SeanceSeuleDAO_1 = require("../dao/SeanceSeuleDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const SeanceSeule_1 = require("../shared-models/SeanceSeule");
class SeanceSeuleController {
    static async getAllSeanceSeules(req, res) {
        try {
            const films = await SeanceSeuleDAO_1.SeanceSeuleDAO.findAll();
            res.json(films);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    // SELECT => select a SeanceSeule
    static async getSeanceSeuleById(req, res) {
        try {
            const seanceSeule = await SeanceSeuleDAO_1.SeanceSeuleDAO.findById(req.params.id);
            //   if (!film) {
            //     return res.status(404).json({ message: 'SeanceSeule non trouvé' });
            //   }
            res.json(seanceSeule);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSeancesSeulesById(req, res) {
        try {
            // Recuperation des ids de seance
            const idsParam = req.query.ids;
            if (!idsParam || (typeof idsParam !== 'string' && !Array.isArray(idsParam))) {
                res.status(400).json({ message: 'Le paramètre "ids" est requis et doit être une chaîne ou un tableau de chaînes.' });
                return;
            }
            const idsArray = Array.isArray(idsParam) ? idsParam : idsParam.split(',').map(id => id.trim());
            // Transformer en chaîne de caractères avec des guillemets doubles
            const idsFormatted = idsArray.map(id => `"${id}"`).join(',');
            const seances = await SeanceSeuleDAO_1.SeanceSeuleDAO.findByIds(idsFormatted);
            res.json(seances);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // POST => create a SeanceSeule
    static async createSeanceSeule(req, res) {
        try {
            // On récupère les données dans req.body
            const data = req.body;
            configLog_1.default.info("Creation d'une salle film avec data = ", data);
            // On construit un SeanceSeule
            const filmToCreate = new SeanceSeule_1.SeanceSeule(data);
            // Appel du DAO
            const newId = await SeanceSeuleDAO_1.SeanceSeuleDAO.createSeanceSeule(filmToCreate);
            // On renvoie l’ID ou un message
            res.status(201).json({ message: 'OK', id: newId });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // PUT => update a SeanceSeule
    static async updateSeanceSeule(req, res) {
        try {
            const salleId = req.params.id;
            const data = req.body;
            configLog_1.default.info(`Mise à jour de la salle ${salleId} avec data=`, data);
            const salleToUpdate = new SeanceSeule_1.SeanceSeule(data);
            const result = await SeanceSeuleDAO_1.SeanceSeuleDAO.updateSeanceSeule(salleId, salleToUpdate);
            if (result) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: SeanceSeule non trouvé ou non mis à jour' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // DELETE => remove a SeanceSeule
    static async deleteSeanceSeule(req, res) {
        try {
            const salleId = req.params.id;
            configLog_1.default.info(`Suppression de la salle ${salleId}`);
            const success = await SeanceSeuleDAO_1.SeanceSeuleDAO.deleteSeanceSeule(salleId);
            if (success) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: SeanceSeule non trouvé ou déjà supprimé' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.SeanceSeuleController = SeanceSeuleController;
