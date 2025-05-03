"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentDAO = void 0;
const Incident_1 = require("../shared-models/Incident");
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
const HelpersCommon_1 = require("../shared-models/HelpersCommon");
class IncidentDAO {
    static async findAll() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM Incident');
        const [rows] = await connection.execute('SELECT * FROM Incident');
        connection.release();
        // On convertit chaque record en Incident
        return rows.map(row => new Incident_1.Incident(row));
    }
    // Create
    static async createIncident(incident) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = incident.id || generateUUID();
            configLog_1.default.info(`Insertion dun nouveau incident : ${newId}`);
            await connection.execute(`INSERT INTO Incident

    (id, Salleid, matricule, status, title, description, dateOpen, dateClose)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                newId,
                incident.Salleid || null,
                incident.matricule || null,
                incident.status || null,
                incident.title || "",
                incident.description || "",
                (0, HelpersCommon_1.formatDateLocalYYYYMMDD)(incident.dateOpen) || "",
                (0, HelpersCommon_1.formatDateLocalYYYYMMDD)(incident.dateClose) || ""
            ]);
            connection.release();
            return newId;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur creation incident:', err);
            throw err;
        }
    }
    // Update
    static async updateIncident(id, incident) {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Mise à jour de la incident ${id}`);
            const [result] = await connection.execute(`UPDATE Incident SET
              Salleid, matricule, status, title, description, dateOpen, dateClose
            
                WHERE id=?`, [
                incident.Salleid || null,
                incident.matricule || null,
                incident.status || null,
                incident.title || "",
                incident.description || "",
                (0, HelpersCommon_1.formatDateLocalYYYYMMDD)(incident.dateOpen) || "",
                (0, HelpersCommon_1.formatDateLocalYYYYMMDD)(incident.dateClose) || "",
                id
            ]);
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur update incident:', err);
            throw err;
        }
    }
    // Delete
    static async deleteIncident(id) {
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Suppression de l'incident ${id}`);
            const [result] = await connection.execute('DELETE FROM Incident WHERE id = ?', [id]);
            connection.release();
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur delete incident:', err);
            throw Error('Impossible de supprimer l"incident');
        }
    }
    static async findById(id) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Incident WHERE id = ?', [id]);
        connection.release();
        const data = rows[0];
        return data ? new Incident_1.Incident(data) : null;
    }
}
exports.IncidentDAO = IncidentDAO;
// *** générateur d'UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
;
