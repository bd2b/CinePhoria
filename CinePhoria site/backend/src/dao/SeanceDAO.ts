import mysql from 'mysql2/promise';
import { Seance, TarifQualite } from "../shared-models/Seance";
import logger from '../config/configLog';

import { dbConfig } from "../config/config"


export class SeanceDAO {
  static async findAll(): Promise<Seance[]> {

    const connection = await mysql.createConnection(dbConfig);
    logger.info('Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle');
    const [rows] = await connection.execute('SELECT * FROM ViewFilmsSeancesSalle');
    await connection.end();

    // On convertit chaque record en Seance
    return (rows as any[]).map(row => new Seance(row));

  }

  static async findByCinemas(nameCinemaList: string): Promise<Seance[]> {
    const connection = await mysql.createConnection(dbConfig);
    let requete: string = '';
    logger.info("Selecteur de cinema = " + nameCinemaList);
    if (nameCinemaList === '"all"') {
      requete = `SELECT * FROM ViewFilmsSeancesSalle`;
    } else {
      requete = `SELECT * FROM ViewFilmsSeancesSalle WHERE nameCinema in (${nameCinemaList})`;
    }
    logger.info(`Exécution de la requête : ${requete}`);

    const [rows] = await connection.execute(requete);
    await connection.end();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new Seance(row));
  }

  static async findTarifs(): Promise<TarifQualite[]> {
    const connection = await mysql.createConnection(dbConfig);
    const requete = `SELECT * FROM TarifQualite`;
    logger.info(`Exécution de la requête : ${requete}`);

    const [rows] = await connection.execute(requete);
    await connection.end();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new TarifQualite(row));

  }
}