import mysql from 'mysql2/promise';
import { Seance, SeanceDisplay, TarifQualite } from "../shared-models/Seance";
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

  static async findAllForDisplay(): Promise<SeanceDisplay[]> {

    const connection = await mysql.createConnection(dbConfig);
    const requeteSelect = `
    SELECT 
      seanceId, titleFilm, nameSalle, nameCinema, 
      capacity,
      dateJour, hourBeginHHSMM, hourEndHHSMM, 
      bo, duration, qualite, imageFilm128
    FROM ViewFilmsSeancesSalle
    `
    logger.info(`Exécution de la requête : ${requeteSelect}`);
    const [rows] = await connection.execute(requeteSelect);
    await connection.end();

    // On convertit chaque record en Seance
    return (rows as any[]).map(row => new SeanceDisplay(row));

  }


  static async findByIds(seanceids: string): Promise<Seance[]> {

    const connection = await mysql.createConnection(dbConfig);
    logger.info(`Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle where seanceId in (${seanceids})`);
    const [rows] = await connection.execute(`SELECT * FROM ViewFilmsSeancesSalle where seanceId in (${seanceids})`);
    await connection.end();

    // On convertit chaque record en Seance et on renvoie le premier et seul élément
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

  static async findDisplayByCinemas(nameCinemaList: string): Promise<SeanceDisplay[]> {
    const connection = await mysql.createConnection(dbConfig);
    let requete: string = '';
    logger.info("Selecteur de cinema = " + nameCinemaList);
    if (nameCinemaList === '"all"') {
      requete = `
      SELECT 
        seanceId, titleFilm, nameSalle, nameCinema, 
        capacity,
        dateJour, hourBeginHHSMM, hourEndHHSMM, 
        bo, duration, qualite, imageFilm128
      FROM ViewFilmsSeancesSalle`;
    } else {
      requete = `SELECT 
        seanceId, titleFilm, nameSalle, nameCinema, 
        capacity,
        dateJour, hourBeginHHSMM, hourEndHHSMM, 
        bo, duration, qualite, imageFilm128
      FROM ViewFilmsSeancesSalle
      WHERE nameCinema in (${nameCinemaList})`;
    }
    logger.info(`Exécution de la requête : ${requete}`);

    const [rows] = await connection.execute(requete);
    await connection.end();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new SeanceDisplay(row));
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

  static async getSeatsBooked(p_seanceId: string): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
    const [rows] = await connection.execute(
      `SELECT siegesReserves
     FROM viewseancesiegesreserves 
     WHERE seanceId = ? LIMIT 1`,
      [p_seanceId]
    );
    logger.info(`SELECT siegesReserves FROM viewseancesiegesreserves WHERE seanceId = ${p_seanceId}`);
    await connection.end();

    // Map des lignes pour les convertir en instances de string
    return (rows as any[]).map((row) => row as string)[0];

  }
}