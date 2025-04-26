import mysql from 'mysql2/promise';
import { Cinema } from "../shared-models/Cinema";

import { dbConfig } from "../config/config";

import logger from '../config/configLog';


export class CinemaDAO {
  static async findAll(): Promise<Cinema[]> {
  
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Exécution de la requête : SELECT * FROM Cinema');
    const [rows] = await connection.execute('SELECT * FROM Cinema');
    await connection.end();

    // On convertit chaque record en Film
    return (rows as any[]).map(row => new Cinema(row));
   
  }
}