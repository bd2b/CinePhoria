import mysql from 'mysql2/promise';
import { Seance } from "../shared-models/Seance";

import { dbConfig } from "../config/config"


export class SeanceDAO {
  static async findAll(): Promise<Seance[]> {
  
    const connection = await mysql.createConnection(dbConfig);
    console.log('Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle');
    const [rows] = await connection.execute('SELECT * FROM ViewFilmsSeancesSalle');
    await connection.end();

    // On convertit chaque record en Seance
    return (rows as any[]).map(row => new Seance(row));
   
  }

  static async findByCinemas(nameCinemaList: string): Promise<Seance[]> {
    const connection = await mysql.createConnection(dbConfig);
    const requete = `SELECT * FROM ViewFilmsSeancesSalle WHERE nameCinema in (${nameCinemaList})`;
    console.log(`Exécution de la requête : ${requete}`);
    
    const [rows] = await connection.execute(requete);
    await connection.end();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new Seance(row));
  }
}