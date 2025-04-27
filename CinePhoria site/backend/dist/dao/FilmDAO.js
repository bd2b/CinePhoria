"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilmDAO = void 0;
const Film_1 = require("../shared-models/Film");
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
const HelpersCommon_1 = require("../shared-models/HelpersCommon");
class FilmDAO {
    static async findAll() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM Film');
        const [rows] = await connection.execute('SELECT * FROM Film');
        connection.release();
        // On convertit chaque record en Film
        return rows.map(row => new Film_1.Film(row));
    }
    static async findById(id) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Film WHERE id = ?', [id]);
        connection.release();
        const data = rows[0];
        return data ? new Film_1.Film(data) : null;
    }
    static async findSortiesDeLaSemaine() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM viewfilmssortiesdelasemaine');
        const [rows] = await connection.execute('SELECT * FROM viewfilmssortiesdelasemaine');
        connection.release();
        // On convertit chaque record en Film
        return rows.map(row => new Film_1.Film(row));
    }
    // Create
    static async createFilm(film) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = film.id || generateUUID();
            configLog_1.default.info(`Insertion d'un nouveau film : ${newId}, ${film.titleFilm}`);
            await connection.execute(`INSERT INTO Film
       (id, titleFilm, filmPitch, genreArray, duration, linkBO, dateSortieCinePhoria,
        categorySeeing, note, isCoupDeCoeur, isActiveForNewSeances, filmDescription, filmAuthor, filmDistribution,
        imageFilm128, imageFilm1024)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                newId,
                film.titleFilm || null,
                film.filmPitch || null,
                film.genreArray || null,
                film.duration || null,
                film.linkBO || null,
                film.dateSortieCinePhoria || null,
                film.categorySeeing || null,
                film.note || 0,
                film.isCoupDeCoeur ? 1 : 0,
                film.isActiveForNewSeances ? 1 : 0,
                film.filmDescription || null,
                film.filmAuthor || null,
                film.filmDistribution || null,
                film.imageFilm128 || null,
                film.imageFilm1024 || null,
            ]);
            connection.release();
            return newId;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur creation film:', err);
            throw err;
        }
    }
    // Update
    static async updateFilm(id, film) {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        const dateSortie = (0, HelpersCommon_1.formatDateLocalYYYYMMDD)(new Date(film.dateSortieCinePhoria || ''));
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Mise à jour du film ${id}`);
            const [result] = await connection.execute(`UPDATE Film SET
          titleFilm=?,
          filmPitch=?,
          genreArray=?,
          duration=?,
          linkBO=?,
          dateSortieCinePhoria=?,
          categorySeeing=?,
          note=?,
          isCoupDeCoeur=?,
          isActiveForNewSeances=?,
          filmDescription=?,
          filmAuthor=?,
          filmDistribution=?,
          imageFilm128=?,
          imageFilm1024=?
       WHERE id=?`, [
                film.titleFilm || null,
                film.filmPitch || null,
                film.genreArray || null,
                film.duration || null,
                film.linkBO || null,
                dateSortie || null,
                film.categorySeeing || null,
                film.note || 0,
                film.isCoupDeCoeur ? 1 : 0,
                film.isActiveForNewSeances ? 1 : 0,
                film.filmDescription || null,
                film.filmAuthor || null,
                film.filmDistribution || null,
                film.imageFilm128 || null,
                film.imageFilm1024 || null,
                id
            ]);
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur update film:', err);
            throw err;
        }
    }
    // Delete
    static async deleteFilm(id) {
        const connection = await config_1.dbPool.getConnection();
        try {
            configLog_1.default.info(`Suppression du film ${id}`);
            const [result] = await connection.execute('DELETE FROM Film WHERE id = ?', [id]);
            connection.release();
            const rowsAffected = result.affectedRows || 0;
            return rowsAffected > 0;
        }
        catch (err) {
            connection.release();
            configLog_1.default.error('Erreur delete film:', err);
            throw err;
        }
    }
}
exports.FilmDAO = FilmDAO;
// *** générateur d'UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
