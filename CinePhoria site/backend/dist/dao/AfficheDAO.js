"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfficheDAO = void 0;
// src/dao/AfficheDAO.ts
const Affiche_1 = __importDefault(require("../models/Affiche"));
class AfficheDAO {
    async create(afficheData) {
        const affiche = new Affiche_1.default(afficheData);
        return await affiche.save();
    }
    async getById(filmId) {
        return await Affiche_1.default.findOne({ filmId });
    }
    async update(filmId, updateData) {
        return await Affiche_1.default.findOneAndUpdate({ filmId }, updateData, { new: true });
    }
    async delete(filmId) {
        const result = await Affiche_1.default.findOneAndDelete({ filmId });
        return result !== null;
    }
    async getAll() {
        return await Affiche_1.default.find();
    }
}
exports.AfficheDAO = AfficheDAO;
