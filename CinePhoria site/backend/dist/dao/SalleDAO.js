"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalleDAO = void 0;
const Salle_1 = require("../shared-models/Salle");
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
class SalleDAO {
    static async findAll() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM Salle');
        const [rows] = await connection.execute('SELECT * FROM Salle');
        connection.release();
        // On convertit chaque record en Salle
        return rows.map(row => new Salle_1.Salle(row));
    }
    // Create
    static async createSalle(salle) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = salle.id || generateUUID();
            configLog_1.default.info(`Insertion d'une nouvelle salle : ${newId}, ${salle.nameSalle}`);
            await connection.execute(`INSERT INTO Salle

    (id, nameCinema, nameSalle, capacity, numPMR, rMax, fMax, seatsAbsents)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                newId,
                salle.nameCinema || null,
                salle.nameSalle || null,
                salle.capacity || 0,
                salle.numPMR || 0,
                salle.rMax || 0,
                salle.fMax || 0,
                salle.seatsAbsents || ""
            ]);
            connection.release();
            return newId;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur creation salle:', err);
            throw err;
        }
    }
    // Update
    static async updateSalle(id, salle) {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Mise à jour de la salle ${id} ${salle.nameSalle}`);
            const [result] = await connection.execute(`UPDATE Salle SET
                nameCinema=?, nameSalle=?, capacity=?, numPMR=?, rMax=?, fMax=?, seatsAbsents=?
                WHERE id=?`, [
                salle.nameCinema || null,
                salle.nameSalle || null,
                salle.capacity || 0,
                salle.numPMR || 0,
                salle.rMax || 0,
                salle.fMax || 0,
                salle.seatsAbsents || "",
                id
            ]);
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur update salle:', err);
            throw err;
        }
    }
    // Delete
    static async deleteSalle(id) {
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Suppression de la salle ${id}`);
            const [result] = await connection.execute('DELETE FROM Salle WHERE id = ?', [id]);
            connection.release();
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur delete salle:', err);
            throw Error('Impossible de supprimer la salle');
        }
    }
    static async findById(id) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Salle WHERE id = ?', [id]);
        connection.release();
        const data = rows[0];
        return data ? new Salle_1.Salle(data) : null;
    }
    static async findByCinema(nameCinema) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Salle WHERE nameCinema = ?', [nameCinema]);
        connection.release();
        const data = rows;
        return data;
    }
}
exports.SalleDAO = SalleDAO;
// *** générateur d'UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
;
