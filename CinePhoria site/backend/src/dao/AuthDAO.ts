import { MajSite } from "../shared-models/MajSite";
import { dbPool } from "../config/config";
import logger from '../config/configLog';
import { formatDateLocalYYYYMMDD } from '../shared-models/HelpersCommon';



export class AuthDAO {

    static async getVersion(): Promise<MajSite> {

        const connection = await dbPool.getConnection();
        logger.info('Exécution de la requête : SELECT * FROM MajSite ORDER BY dateMaj DESC LIMIT 1;');
        const [rows] = await connection.execute('SELECT * FROM MajSite ORDER BY dateMaj DESC LIMIT 1;');
        connection.release();
        // On convertit chaque record en Incident
        return (rows as any[]).map(row => new MajSite(row))[0];

    }

    static async pushVersion(majSite: MajSite): Promise<string> {

        const connection = await dbPool.getConnection();
        try {

            logger.info(`Insertion d'un nouvelle maj raison = ${majSite.message}`);
            // A noter la date de maj est calculé par le serveur est est en utc
            const [result] = await connection.execute(
                `
                INSERT INTO MajSite
                    (MAJEURE, MINEURE, BUILD, 
                     
                    message)
                    VALUES (?, ?, ?, ?)`,
                [
                    majSite.MAJEURE || null,
                    majSite.MINEURE || null,
                    majSite.BUILD || null,
                    majSite.message
                ]
            );
            connection.release();
            // result => un objet du type ResultSetHeader
            const rowsAffected = (result as any).affectedRows || 0;
            return rowsAffected > 0 ? "OK" : "Erreur inconue"
        } catch (err) {
            connection.release();
            logger.error('Erreur creation incident:', err);
            throw err;
        }

    }
}