// src/models/Affiche.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface AfficheDocument extends Document {
    filmId: string;
    resolution: Number;
    imageFile: Buffer; // stockage binaire BSON
    contentType: string; // pour préciser le type MIME, ex : 'image/png'
}

const AfficheSchema: Schema = new Schema({
    filmId: { type: String, required: true, unique: true },
    resolution: { type: Number, required: true },
    imageFile: { type: Buffer, required: true },
    contentType: { type: String, required: true }
});

const Affiche = mongoose.model<AfficheDocument>('Affiche', AfficheSchema);
export default Affiche;