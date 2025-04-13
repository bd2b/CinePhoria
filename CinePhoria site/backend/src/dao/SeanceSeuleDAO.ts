import mysql from 'mysql2/promise';
import { SeanceSeule } from "../shared-models/SeanceSeule";

import { dbConfig } from "../config/config";
import logger from '../config/configLog';

import { formatDateLocalYYYYMMDD } from '../shared-models/HelpersCommon';


export class SeanceSeuleDAO {

    static async findAll(): Promise<SeanceSeule[]> {

        const connection = await mysql.createConnection(dbConfig);
        logger.info('Exécution de la requête : SELECT * FROM Seance');
        const [rows] = await connection.execute('SELECT * FROM Seance');
        await connection.end();
    
        // On convertit chaque record en SeanceSeule
        return (rows as any[]).map(row => new SeanceSeule(row));
    
      }

    // Create
    static async createSeanceSeule(seanceseule: SeanceSeule): Promise<string> {
        const connection = await mysql.createConnection(dbConfig);
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = seanceseule.id || generateUUID();

            logger.info(`Insertion d'une nouvelle séence : ${newId}`);
            await connection.execute(
                `INSERT INTO Seance

    (id, filmId, salleId, dateJour, hourBeginHHSMM, hourEndHHSMM, qualite, bo, numFreeSeats, numFreePMR, alertAvailibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newId, 
                    seanceseule.filmId || null,
                    seanceseule.salleId || null,
                    seanceseule.dateJour || null ,
                    seanceseule.hourBeginHHSMM || "",
                    seanceseule.hourEndHHSMM || "",
                    seanceseule.qualite || "",
                    seanceseule.bo || "",
                    seanceseule.numFreeSeats || "",
                    seanceseule.numFreePMR || "",
                    seanceseule.alertAvailibility || ""
                    
                ]
            );
            await connection.end();
            return newId;
        } catch (err) {
            await connection.end();
            logger.error('Erreur creation salleseule:', err);
            throw err;
        }
    }

    // Update
    static async updateSeanceSeule(id: string, salleseule: SeanceSeule): Promise<boolean> {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        
        const connection = await mysql.createConnection(dbConfig);
        try {
            logger.info(`Mise à jour de la seanceseule ${id}`);
            const [result] = await connection.execute(
            `UPDATE Seance SET
             filmId=?, salleId=?, dateJour=?, hourBeginHHSMM=?, hourEndHHSMM=?, 
             qualite=?, bo=?, numFreeSeats=?, numFreePMR=?, alertAvailibility=?
            
                WHERE id=?`,
                [   salleseule.filmId || null,
                    salleseule.salleId || null,
                    salleseule.dateJour || null ,
                    salleseule.hourBeginHHSMM || "",
                    salleseule.hourEndHHSMM || "",
                    salleseule.qualite || "",
                    salleseule.bo || "",
                    salleseule.numFreeSeats || "",
                    salleseule.numFreePMR || "",
                    salleseule.alertAvailibility || "",
                    id

                ]
            );
            await connection.end();
            // result => un objet du type ResultSetHeader
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0;
        } catch (err) {
            await connection.end();
            logger.error('Erreur update seanceseule:', err);
            throw err;
        }
    }

    // Delete
    static async deleteSeanceSeule(id: string): Promise<boolean> {
        const connection = await mysql.createConnection(dbConfig);
        try {
            logger.info(`Suppression de la seanceseule ${id}`);
            const [result] = await connection.execute(
                'DELETE FROM Seance WHERE id = ?',
                [id]
            );
            await connection.end();
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0;
        } catch (err) {
            await connection.end();
            logger.error('Erreur delete seanceseule:', err);
            throw Error('Impossible de supprimer la seanceseule');
        }
    }

    static async findById(id: string): Promise<SeanceSeule | null> {
        const connection = await mysql.createConnection(dbConfig);
        logger.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Seance WHERE id = ?', [id]);
        await connection.end();
    
        const data = (rows as any[])[0];
        return data ? new SeanceSeule(data) : null;
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


