"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeDAO = void 0;
// src/dao/QRCodeDAO.ts
const QRCode_1 = __importDefault(require("../models/QRCode"));
class QRCodeDAO {
    async create(qrCodeData) {
        const qrCode = new QRCode_1.default(qrCodeData);
        return await qrCode.save();
    }
    async getById(reservationid) {
        return await QRCode_1.default.findOne({ reservationid });
    }
    async update(reservationid, updateData) {
        return await QRCode_1.default.findOneAndUpdate({ reservationid }, updateData, { new: true });
    }
    async delete(reservationid) {
        const result = await QRCode_1.default.findOneAndDelete({ reservationid });
        return result !== null;
    }
    async getAll() {
        return await QRCode_1.default.find();
    }
}
exports.QRCodeDAO = QRCodeDAO;
