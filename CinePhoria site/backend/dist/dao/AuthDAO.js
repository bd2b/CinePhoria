"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthDAO = void 0;
const MajSite_1 = require("../shared-models/MajSite");
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
class AuthDAO {
    static async getVersion() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM MajSite ORDER BY dateMaj DESC LIMIT 1;');
        const [rows] = await connection.execute('SELECT * FROM MajSite ORDER BY dateMaj DESC LIMIT 1;');
        connection.release();
        // On convertit chaque record en Incident
        return rows.map(row => new MajSite_1.MajSite(row))[0];
    }
    static async pushVersion(majSite) {
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Insertion d'un nouvelle maj raison = ${majSite.message}`);
            // A noter la date de maj est calculé par le serveur est est en utc
            const [result] = await connection.execute(`
                INSERT INTO MajSite
                    (MAJEURE, MINEURE, BUILD, 
                     
                    message)
                    VALUES (?, ?, ?, ?)`, [
                majSite.MAJEURE || null,
                majSite.MINEURE || null,
                majSite.BUILD || null,
                majSite.message
            ]);
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0 ? "OK" : "Erreur inconue";
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur creation incident:', err);
            throw err;
        }
    }
}
exports.AuthDAO = AuthDAO;
