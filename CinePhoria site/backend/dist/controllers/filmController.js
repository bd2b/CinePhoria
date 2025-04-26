"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilmController = void 0;
const FilmDAO_1 = require("../dao/FilmDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const Film_1 = require("../shared-models/Film");
class FilmController {
    static async getAllFilms(req, res) {
        try {
            const films = await FilmDAO_1.FilmDAO.findAll();
            res.json(films);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    static async getFilmById(req, res) {
        try {
            const film = await FilmDAO_1.FilmDAO.findById(req.params.id);
            //   if (!film) {
            //     return res.status(404).json({ message: 'Film non trouvé' });
            //   }
            res.json(film);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSortiesDeLaSemaine(req, res) {
        try {
            const films = await FilmDAO_1.FilmDAO.findSortiesDeLaSemaine();
            res.json(films);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
    // POST => create a Film
    static async createFilm(req, res) {
        try {
            // On récupère les données dans req.body
            // ex: {titleFilm, filmPitch, genreArray, ...}
            const data = req.body;
            configLog_1.default.info("Creation d'un film avec data = ", data);
            // On construit un Film
            const filmToCreate = new Film_1.Film(data);
            // Appel du DAO
            const newId = await FilmDAO_1.FilmDAO.createFilm(filmToCreate);
            // On renvoie l’ID ou un message
            res.status(201).json({ message: 'OK', id: newId });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // PUT => update a Film
    static async updateFilm(req, res) {
        try {
            const filmId = req.params.id;
            const data = req.body;
            configLog_1.default.info(`Mise à jour du film ${filmId} avec data=`, data);
            const filmToUpdate = new Film_1.Film(data);
            const result = await FilmDAO_1.FilmDAO.updateFilm(filmId, filmToUpdate);
            if (result) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Film non trouvé ou non mis à jour' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // DELETE => remove a Film
    static async deleteFilm(req, res) {
        try {
            const filmId = req.params.id;
            configLog_1.default.info(`Suppression du film ${filmId}`);
            const success = await FilmDAO_1.FilmDAO.deleteFilm(filmId);
            if (success) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Film non trouvé ou déjà supprimé' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.FilmController = FilmController;
