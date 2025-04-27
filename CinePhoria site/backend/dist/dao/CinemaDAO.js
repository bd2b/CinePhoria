"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CinemaDAO = void 0;
const config_1 = require("../config/config");
const Cinema_1 = require("../shared-models/Cinema");
const configLog_1 = __importDefault(require("../config/configLog"));
class CinemaDAO {
    static async findAll() {
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info('Exécution de la requête : SELECT * FROM Cinema');
            const [rows] = await connection.execute('SELECT * FROM Cinema');
            return rows.map(row => new Cinema_1.Cinema(row));
        }
        finally {
            connection.release();
        }
    }
}
exports.CinemaDAO = CinemaDAO;
