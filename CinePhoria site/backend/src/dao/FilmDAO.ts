import mysql from 'mysql2/promise';
import { Film } from "../shared-models/Film";

import { dbConfig } from "../config/config"


export class FilmDAO {
  static async findAll(): Promise<Film[]> {
  
    const connection = await mysql.createConnection(dbConfig);
    console.log('Exécution de la requête : SELECT * FROM Film');
    const [rows] = await connection.execute('SELECT * FROM Film');
    console.log(rows);
    await connection.end();

    // On convertit chaque record en Film
    return (rows as any[]).map(row => new Film(row));
   
  }

  static async findById(id: string): Promise<Film | null> {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion réussie à la base de données');
    const [rows] = await connection.execute('SELECT * FROM Film WHERE id = ?', [id]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? new Film(data) : null;
  }

  static async findSortiesDeLaSemaine(): Promise<Film[]> {
  
    const connection = await mysql.createConnection(dbConfig);
    console.log('Exécution de la requête : SELECT * FROM viewfilmssortiesdelasemaine');
    const [rows] = await connection.execute('SELECT * FROM viewfilmssortiesdelasemaine');
    console.log(rows);
    await connection.end();

    // On convertit chaque record en Film
    return (rows as any[]).map(row => new Film(row));
   
  }


  // Autres méthodes CRUD...
}


