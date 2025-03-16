// src/dao/QRCodeDAO.ts
import QRCode, { QRCodeDocument } from '../models/QRCode';

export class QRCodeDAO {
    async create(qrCodeData: Partial<QRCodeDocument>): Promise<QRCodeDocument> {
        const qrCode = new QRCode(qrCodeData);
        return await qrCode.save();
    }

    async getById(reservationid: string): Promise<QRCodeDocument | null> {
        return await QRCode.findOne({ reservationid });
    }

    async update(reservationid: string, updateData: Partial<QRCodeDocument>): Promise<QRCodeDocument | null> {
        return await QRCode.findOneAndUpdate({ reservationid }, updateData, { new: true });
    }

    async delete(reservationid: string): Promise<boolean> {
        const result = await QRCode.findOneAndDelete({ reservationid });
        return result !== null;
    }

    async getAll(): Promise<QRCodeDocument[]> {
        return await QRCode.find();
    }
}