"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CinemaController = void 0;
const CinemaDAO_1 = require("../dao/CinemaDAO");
class CinemaController {
    static async getAllCinemas(req, res) {
        try {
            const cinemas = await CinemaDAO_1.CinemaDAO.findAll();
            res.json(cinemas);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
}
exports.CinemaController = CinemaController;
