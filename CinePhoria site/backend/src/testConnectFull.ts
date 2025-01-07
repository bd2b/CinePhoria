import { dbConfig } from './config/config'; // Importer la configuration de la base de données
console.log(JSON.stringify(dbConfig));
console.log("1");
import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const dbConfigLocal = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mydatabase',
  };



class Film {
  id!: string;
  titleFilm?: string;
  genreArray?: string;
  duration?: string;
  linkBO?: string;
  categorySeeing?: string;
  note?: number;
  isCoupDeCoeur?: boolean;
  filmDescription?: string;
  filmAuthor?: string;
  filmDistribution?: string;
  imageFilm128?: string;
  imageFilm1024?: string;

  constructor(data: Partial<Film>) {
    Object.assign(this, data);
  }
}

class TestDAO {
  static async findAll(): Promise<Film[]> {
    console.log("2");
    console.log(JSON.stringify(dbConfigLocal));
    console.log("3");
    const connection = await mysql.createConnection(dbConfigLocal); // Utilise dbConfig ici
    console.log('Connexion réussie, exécution de la requête : SELECT * FROM Film');
    const [rows] = await connection.execute('SELECT * FROM Film');
    await connection.end();
    return (rows as any[]).map(row => new Film(row));
  }
}

async function main() {
  try {
    console.log('Début du test de connexion');
    const films = await TestDAO.findAll();
    console.log('Films récupérés :', JSON.stringify(films, null, 2));
  } catch (error) {
    console.error('Erreur lors du test de connexion :', error);
  }
}

main();