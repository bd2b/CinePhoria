import mysql from 'mysql2/promise';
import { Salle } from "../shared-models/Salle";

import { dbConfig } from "../config/config";
import logger from '../config/configLog';

import { formatDateLocalYYYYMMDD } from '../shared-models/HelpersCommon';


export class SalleDAO {

    static async findAll(): Promise<Salle[]> {

        const connection = await mysql.createConnection(dbConfig);
        logger.info('Exécution de la requête : SELECT * FROM Salle');
        const [rows] = await connection.execute('SELECT * FROM Salle');
        await connection.end();

        // On convertit chaque record en Salle
        return (rows as any[]).map(row => new Salle(row));

    }

    // Create
    static async createSalle(salle: Salle): Promise<string> {
        const connection = await mysql.createConnection(dbConfig);
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = salle.id || generateUUID();

            logger.info(`Insertion d'une nouvelle salle : ${newId}, ${salle.nameSalle}`);
            await connection.execute(
                `INSERT INTO Salle

    (id, nameCinema, nameSalle, capacity, numPMR, rMax, fMax, seatsAbsents)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newId,
                    salle.nameCinema || null,
                    salle.nameSalle || null,
                    salle.capacity || 0,
                    salle.numPMR || 0,
                    salle.rMax || 0,
                    salle.fMax || 0,
                    salle.seatsAbsents || ""

                ]
            );
            await connection.end();
            return newId;
        } catch (err) {
            await connection.end();
            logger.error('Erreur creation salle:', err);
            throw err;
        }
    }

    // Update
    static async updateSalle(id: string, salle: Salle): Promise<boolean> {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'

        const connection = await mysql.createConnection(dbConfig);
        try {
            logger.info(`Mise à jour de la salle ${id} ${salle.nameSalle}`);
            const [result] = await connection.execute(
                `UPDATE Salle SET
                nameCinema=?, nameSalle=?, capacity=?, numPMR=?, rMax=?, fMax=?, seatsAbsents=?
                WHERE id=?`,
                [
                    salle.nameCinema || null,
                    salle.nameSalle || null,
                    salle.capacity || 0,
                    salle.numPMR || 0,
                    salle.rMax || 0,
                    salle.fMax || 0,
                    salle.seatsAbsents || "",
                    id

                ]
            );
            await connection.end();
            // result => un objet du type ResultSetHeader
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0;
        } catch (err) {
            await connection.end();
            logger.error('Erreur update salle:', err);
            throw err;
        }
    }

    // Delete
    static async deleteSalle(id: string): Promise<boolean> {
        const connection = await mysql.createConnection(dbConfig);
        try {
            logger.info(`Suppression de la salle ${id}`);
            const [result] = await connection.execute(
                'DELETE FROM Salle WHERE id = ?',
                [id]
            );
            await connection.end();
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0;
        } catch (err) {
            await connection.end();
            logger.error('Erreur delete salle:', err);
            throw Error('Impossible de supprimer la salle');
        }
    }

    static async findById(id: string): Promise<Salle | null> {
        const connection = await mysql.createConnection(dbConfig);
        logger.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Salle WHERE id = ?', [id]);
        await connection.end();

        const data = (rows as any[])[0];
        return data ? new Salle(data) : null;
    }

    static async findByCinema(nameCinema: string): Promise<Salle[] | null> {
        const connection = await mysql.createConnection(dbConfig);
        logger.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Salle WHERE nameCinema = ?', [nameCinema]);
        await connection.end();

        const data = (rows as any[]);
        return data ;
    }

}

// *** générateur d'UUID
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


