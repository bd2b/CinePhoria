import mysql from 'mysql2/promise';
import { Cinema } from "../shared-models/Cinema";

import { dbConfig } from "../config/config"


export class CinemaDAO {
  static async findAll(): Promise<Cinema[]> {
  
    const connection = await mysql.createConnection(dbConfig);
    console.log('Exécution de la requête : SELECT * FROM Cinema');
    const [rows] = await connection.execute('SELECT * FROM Cinema');
    console.log(rows);
    await connection.end();

    // On convertit chaque record en Film
    return (rows as any[]).map(row => new Cinema(row));
   
  }
}