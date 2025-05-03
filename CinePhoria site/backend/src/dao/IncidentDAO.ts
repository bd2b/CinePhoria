import { Incident } from "../shared-models/Incident";

import { dbPool} from "../config/config";
import logger from '../config/configLog';

import { formatDateLocalYYYYMMDD } from '../shared-models/HelpersCommon';


export class IncidentDAO {

    static async findAll(): Promise<Incident[]> {

        const connection = await dbPool.getConnection();
        logger.info('Exécution de la requête : SELECT * FROM Incident');
        const [rows] = await connection.execute('SELECT * FROM Incident');
        connection.release();
    
        // On convertit chaque record en Incident
        return (rows as any[]).map(row => new Incident(row));
    
      }

    // Create
    static async createIncident(incident: Incident): Promise<string> {
        const connection = await dbPool.getConnection();
        try {
            // On génére un id (UUID) côté back si il n'est pas fourni
            const newId = incident.id || generateUUID();

            logger.info(`Insertion dun nouveau incident : ${newId}`);
            await connection.execute(
                `INSERT INTO Incident

    (id, Salleid, matricule, status, title, description, dateOpen, dateClose)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newId, 
                    incident.Salleid || null,
                    incident.matricule || null,
                    incident.status || null ,
                    incident.title || "",
                    incident.description || "",
                    formatDateLocalYYYYMMDD(incident.dateOpen!) || "" ,
                    formatDateLocalYYYYMMDD(incident.dateClose!) || ""   
                ]
            );
            connection.release();
            return newId;
        } catch (err) {
            connection.release();
            logger.error('Erreur creation incident:', err);
            throw err;
        }
    }

    // Update
    static async updateIncident(id: string, incident: Incident): Promise<boolean> {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        
        const connection = await dbPool.getConnection();
        try {
            logger.info(`Mise à jour de la incident ${id}`);
            const [result] = await connection.execute(
            `UPDATE Incident SET
              Salleid, matricule, status, title, description, dateOpen, dateClose
            
                WHERE id=?`,
                [    
                    incident.Salleid || null,
                    incident.matricule || null,
                    incident.status || null ,
                    incident.title || "",
                    incident.description || "",
                    formatDateLocalYYYYMMDD(incident.dateOpen!) || "" ,
                    formatDateLocalYYYYMMDD(incident.dateClose!) || ""  ,
                    id  

                ]
            );
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0;
        } catch (err) {
            connection.release();
            logger.error('Erreur update incident:', err);
            throw err;
        }
    }

    // Delete
    static async deleteIncident(id: string): Promise<boolean> {
        const connection = await dbPool.getConnection();
        try {
            logger.info(`Suppression de l'incident ${id}`);
            const [result] = await connection.execute(
                'DELETE FROM Incident WHERE id = ?',
                [id]
            );
            connection.release();
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0;
        } catch (err) {
            connection.release();
            logger.error('Erreur delete incident:', err);
            throw Error('Impossible de supprimer l"incident');
        }
    }

    static async findById(id: string): Promise<Incident | null> {
        const connection = await dbPool.getConnection();
        logger.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT * FROM Incident WHERE id = ?', [id]);
        connection.release();
    
        const data = (rows as any[])[0];
        return data ? new Incident(data) : null;
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


