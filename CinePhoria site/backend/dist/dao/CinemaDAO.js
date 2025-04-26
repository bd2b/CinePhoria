"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CinemaDAO = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const Cinema_1 = require("../shared-models/Cinema");
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
class CinemaDAO {
    static async findAll() {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        configLog_1.default.info('Exécution de la requête : SELECT * FROM Cinema');
        const [rows] = await connection.execute('SELECT * FROM Cinema');
        await connection.end();
        // On convertit chaque record en Film
        return rows.map(row => new Cinema_1.Cinema(row));
    }
}
exports.CinemaDAO = CinemaDAO;
