// src/dao/AfficheDAO.ts
import Affiche, { AfficheDocument } from '../models/Affiche';

export class AfficheDAO {
    async create(afficheData: Partial<AfficheDocument>): Promise<AfficheDocument> {
        const affiche = new Affiche(afficheData);
        return await affiche.save();
    }

    async getById(filmId: string): Promise<AfficheDocument | null> {
        return await Affiche.findOne({ filmId });
    }

    async update(filmId: string, updateData: Partial<AfficheDocument>): Promise<AfficheDocument | null> {
        return await Affiche.findOneAndUpdate({ filmId }, updateData, { new: true });
    }

    async delete(filmId: string): Promise<boolean> {
        const result = await Affiche.findOneAndDelete({ filmId });
        return result !== null;
    }

    async getAll(): Promise<AfficheDocument[]> {
        return await Affiche.find();
    }
}