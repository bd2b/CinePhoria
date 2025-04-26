// src/models/Affiche.ts
import mongoose, { Schema } from 'mongoose';
const AfficheSchema = new Schema({
    filmId: { type: String, required: true, unique: true },
    resolution: { type: Number, required: true },
    imageFile: { type: Buffer, required: true },
    contentType: { type: String, required: true }
});
const Affiche = mongoose.model('Affiche', AfficheSchema);
export default Affiche;
