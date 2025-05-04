"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentController = void 0;
const IncidentDAO_1 = require("../dao/IncidentDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const Incident_1 = require("../shared-models/Incident");
class IncidentController {
    static async getAllIncidents(req, res) {
        try {
            const incidents = await IncidentDAO_1.IncidentDAO.findAll();
            res.json(incidents);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    // SELECT => select a Incident
    static async getIncidentById(req, res) {
        try {
            const incident = await IncidentDAO_1.IncidentDAO.findById(req.params.id);
            //   if (!film) {
            //     return res.status(404).json({ message: 'Incident non trouvé' });
            //   }
            res.json(incident);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // POST => create a Incident
    static async createIncident(req, res) {
        try {
            // On récupère les données dans req.body
            const data = req.body;
            configLog_1.default.info("Creation d'un incident avec data = ", data);
            // On construit un Incident
            const incidentToCreate = new Incident_1.Incident(data);
            // Appel du DAO
            const newId = await IncidentDAO_1.IncidentDAO.createIncident(incidentToCreate);
            // On renvoie l’ID ou un message
            res.status(201).json({ message: 'OK', id: newId });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // PUT => update a Incident
    static async updateIncident(req, res) {
        try {
            const id = req.params.id;
            const data = req.body;
            configLog_1.default.info(`Mise à jour de l'incident' ${id} avec data=`, data);
            const incidentToUpdate = new Incident_1.Incident(data);
            const result = await IncidentDAO_1.IncidentDAO.updateIncident(id, incidentToUpdate);
            if (result) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Incident non trouvé ou non mis à jour' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // DELETE => remove a Incident
    static async deleteIncident(req, res) {
        try {
            const id = req.params.id;
            configLog_1.default.info(`Suppression de l"incident' ${id}`);
            const success = await IncidentDAO_1.IncidentDAO.deleteIncident(id);
            if (success) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Incident non trouvé ou déjà supprimé' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.IncidentController = IncidentController;
