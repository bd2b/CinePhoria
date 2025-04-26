// src/models/QRCode.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface QRCodeDocument extends Document {
    reservationid: string;
    dateExpiration: Date;
    qrCodeFile: Buffer; // stockage binaire BSON
    contentType: string; // pour préciser le type MIME, ex : 'image/png'
}

const QRCodeSchema: Schema = new Schema({
    reservationid: { type: String, required: true, unique: true },
    dateExpiration: { type: Date, required: true },
    qrCodeFile: { type: Buffer, required: true },
    contentType: { type: String, required: true }
});

const QRCode = mongoose.model<QRCodeDocument>('QRCode', QRCodeSchema);
export default QRCode;