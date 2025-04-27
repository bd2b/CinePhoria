
import { dbPool } from "../config/config";
import { Cinema } from "../shared-models/Cinema";

import logger from '../config/configLog';


export class CinemaDAO {
  static async findAll(): Promise<Cinema[]> {
  
    const connection = await dbPool.getConnection();
    try {
      logger.info('Exécution de la requête : SELECT * FROM Cinema');
      const [rows] = await connection.execute('SELECT * FROM Cinema');
      return (rows as any[]).map(row => new Cinema(row));
    } finally {
      connection.release();
    }
   
  }
}