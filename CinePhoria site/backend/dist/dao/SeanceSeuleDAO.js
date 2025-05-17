"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeanceSeuleDAO = void 0;
const SeanceSeule_1 = require("../shared-models/SeanceSeule");
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
class SeanceSeuleDAO {
    static async findAll() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM Seance');
        const [rows] = await connection.execute('SELECT * FROM Seance');
        connection.release();
        // On convertit chaque record en SeanceSeule
        return rows.map(row => new SeanceSeule_1.SeanceSeule(row));
    }
    // Create
    static async createSeanceSeule(seanceseule) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = seanceseule.id || generateUUID();
            configLog_1.default.info(`Insertion d'une nouvelle séance : ${newId}`);
            await connection.execute(`INSERT INTO Seance

    (id, filmId, salleId, dateJour, hourBeginHHSMM, hourEndHHSMM, qualite, bo, numFreeSeats, numFreePMR, alertAvailibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                newId,
                seanceseule.filmId || null,
                seanceseule.salleId || null,
                seanceseule.dateJour || null,
                seanceseule.hourBeginHHSMM || "",
                seanceseule.hourEndHHSMM || "",
                seanceseule.qualite || "",
                seanceseule.bo || "",
                seanceseule.numFreeSeats || "",
                seanceseule.numFreePMR || "",
                seanceseule.alertAvailibility || ""
            ]);
            connection.release();
            return newId;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur creation salleseule:', err);
            throw err;
        }
    }
    // Update
    static async updateSeanceSeule(id, salleseule) {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Mise à jour de la seanceseule ${id}`);
            const [result] = await connection.execute(`UPDATE Seance SET
             filmId=?, salleId=?, dateJour=?, hourBeginHHSMM=?, hourEndHHSMM=?, 
             qualite=?, bo=?, numFreeSeats=?, numFreePMR=?, alertAvailibility=?
            
                WHERE id=?`, [salleseule.filmId || null,
                salleseule.salleId || null,
                salleseule.dateJour || null,
                salleseule.hourBeginHHSMM || "",
                salleseule.hourEndHHSMM || "",
                salleseule.qualite || "",
                salleseule.bo || "",
                salleseule.numFreeSeats || "",
                salleseule.numFreePMR || "",
                salleseule.alertAvailibility || "",
                id
            ]);
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur update seanceseule:', err);
            throw err;
        }
    }
    // Delete
    static async deleteSeanceSeule(id) {
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Suppression de la seanceseule ${id}`);
            const [result] = await connection.execute('DELETE FROM Seance WHERE id = ?', [id]);
            connection.release();
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur delete seanceseule:', err);
            throw Error('Impossible de supprimer la seanceseule');
        }
    }
    static async findById(id) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Seance WHERE id = ?', [id]);
        connection.release();
        const data = rows[0];
        return data ? new SeanceSeule_1.SeanceSeule(data) : null;
    }
    static async findByIds(seanceids) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        configLog_1.default.info(`SELECT * FROM Seance WHERE id in (${seanceids})`);
        const [rows] = await connection.execute(`SELECT * FROM Seance WHERE id in (${seanceids})`);
        connection.release();
        // On convertit chaque record en Seance et on renvoie le premier et seul élément
        return rows.map(row => new SeanceSeule_1.SeanceSeule(row));
    }
}
exports.SeanceSeuleDAO = SeanceSeuleDAO;
// *** générateur d'UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
;
