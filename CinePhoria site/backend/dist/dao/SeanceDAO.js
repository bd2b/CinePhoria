"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeanceDAO = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const Seance_1 = require("../shared-models/Seance");
const configLog_1 = __importDefault(require("../config/configLog"));
const config_1 = require("../config/config");
class SeanceDAO {
    static async findAll() {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        configLog_1.default.info('Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle');
        const [rows] = await connection.execute('SELECT * FROM ViewFilmsSeancesSalle');
        await connection.end();
        // On convertit chaque record en Seance
        return rows.map(row => new Seance_1.Seance(row));
    }
    static async findAllForDisplay() {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        const requeteSelect = `
    SELECT 
      seanceId, titleFilm, nameSalle, nameCinema, 
      capacity,
      dateJour, hourBeginHHSMM, hourEndHHSMM, 
      bo, duration, qualite, imageFilm128,
      salleId, filmId
    FROM ViewFilmsSeancesSalle
    `;
        configLog_1.default.info(`Exécution de la requête : ${requeteSelect}`);
        const [rows] = await connection.execute(requeteSelect);
        await connection.end();
        // On convertit chaque record en Seance
        return rows.map(row => new Seance_1.SeanceDisplay(row));
    }
    static async findByIds(seanceids) {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        configLog_1.default.info(`Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle where seanceId in (${seanceids})`);
        const [rows] = await connection.execute(`SELECT * FROM ViewFilmsSeancesSalle where seanceId in (${seanceids})`);
        await connection.end();
        // On convertit chaque record en Seance et on renvoie le premier et seul élément
        return rows.map(row => new Seance_1.Seance(row));
    }
    static async findByCinemas(nameCinemaList) {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        let requete = '';
        configLog_1.default.info("Selecteur de cinema = " + nameCinemaList);
        if (nameCinemaList === '"all"') {
            requete = `SELECT * FROM ViewFilmsSeancesSalle`;
        }
        else {
            requete = `SELECT * FROM ViewFilmsSeancesSalle WHERE nameCinema in (${nameCinemaList})`;
        }
        configLog_1.default.info(`Exécution de la requête : ${requete}`);
        const [rows] = await connection.execute(requete);
        await connection.end();
        // Map des lignes pour les convertir en instances de Seance
        return rows.map((row) => new Seance_1.Seance(row));
    }
    static async findDisplayByCinemas(nameCinemaList) {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        let requete = '';
        configLog_1.default.info("Selecteur de cinema = " + nameCinemaList);
        if (nameCinemaList === '"all"') {
            requete = `
      SELECT 
        seanceId, titleFilm, nameSalle, nameCinema, 
        capacity,
        dateJour, hourBeginHHSMM, hourEndHHSMM, 
        bo, duration, qualite, imageFilm128,
        salleId, filmId
      FROM ViewFilmsSeancesSalle`;
        }
        else {
            requete = `SELECT 
        seanceId, titleFilm, nameSalle, nameCinema, 
        capacity,
        dateJour, hourBeginHHSMM, hourEndHHSMM, 
        bo, duration, qualite, imageFilm128,
        salleId, filmId
      FROM ViewFilmsSeancesSalle
      WHERE nameCinema in (${nameCinemaList})`;
        }
        configLog_1.default.info(`Exécution de la requête : ${requete}`);
        const [rows] = await connection.execute(requete);
        await connection.end();
        // Map des lignes pour les convertir en instances de Seance
        return rows.map((row) => new Seance_1.SeanceDisplay(row));
    }
    static async findTarifs() {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        const requete = `SELECT * FROM TarifQualite`;
        configLog_1.default.info(`Exécution de la requête : ${requete}`);
        const [rows] = await connection.execute(requete);
        await connection.end();
        // Map des lignes pour les convertir en instances de Seance
        return rows.map((row) => new Seance_1.TarifQualite(row));
    }
    static async getSeatsBooked(p_seanceId) {
        const connection = await promise_1.default.createConnection(config_1.dbConfig);
        // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
        const [rows] = await connection.execute(`SELECT siegesReserves
     FROM ViewSeanceSiegesReserves 
     WHERE seanceId = ? LIMIT 1`, [p_seanceId]);
        configLog_1.default.info(`SELECT siegesReserves FROM ViewSeanceSiegesReserves WHERE seanceId = ${p_seanceId}`);
        await connection.end();
        // Map des lignes pour les convertir en instances de string
        return rows.map((row) => row)[0];
    }
}
exports.SeanceDAO = SeanceDAO;
