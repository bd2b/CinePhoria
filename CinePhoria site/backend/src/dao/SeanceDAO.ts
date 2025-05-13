import mysql from 'mysql2/promise';
import { Seance, SeanceDisplay, TarifQualite } from "../shared-models/Seance";
import logger from '../config/configLog';

import { dbConfig , dbPool } from "../config/config"


export class SeanceDAO {
  static async findAll(): Promise<Seance[]> {

    const connection = await dbPool.getConnection();
    logger.info('Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle');
    const [rows] = await connection.execute('SELECT * FROM ViewFilmsSeancesSalle');
    connection.release();

    // On convertit chaque record en Seance
    return (rows as any[]).map(row => new Seance(row));

  }

  static async findAllForDisplay(): Promise<SeanceDisplay[]> {

    const connection = await dbPool.getConnection();
    const requeteSelect = `
    SELECT 
      seanceId, titleFilm, nameSalle, nameCinema, 
      capacity,
      dateJour, hourBeginHHSMM, hourEndHHSMM, 
      bo, duration, qualite, imageFilm128,
      salleId, filmId
    FROM ViewFilmsSeancesSalle
    `
    logger.info(`Exécution de la requête : ${requeteSelect}`);
    const [rows] = await connection.execute(requeteSelect);
    connection.release();

    // On convertit chaque record en Seance
    return (rows as any[]).map(row => new SeanceDisplay(row));

  }


  static async findByIds(seanceids: string): Promise<Seance[]> {

    const connection = await dbPool.getConnection();
    logger.info(`Exécution de la requête : SELECT * FROM ViewFilmsSeancesSalle where seanceId in (${seanceids})`);
    const [rows] = await connection.execute(`SELECT * FROM ViewFilmsSeancesSalle where seanceId in (${seanceids})`);
    connection.release();

    // On convertit chaque record en Seance et on renvoie le premier et seul élément
    return (rows as any[]).map(row => new Seance(row));

  }

  static async findByCinemas(nameCinemaList: string): Promise<Seance[]> {
    const connection = await dbPool.getConnection();
    let requete: string = '';
    logger.info("Selecteur de cinema = " + nameCinemaList);
    if (nameCinemaList === '"all"') {
      requete = `SELECT * FROM ViewFilmsSeancesSalle`;
    } else {
      requete = `SELECT * FROM ViewFilmsSeancesSalle WHERE nameCinema in (${nameCinemaList})`;
    }
    logger.info(`Exécution de la requête : ${requete}`);

    const [rows] = await connection.execute(requete);
    connection.release();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new Seance(row));
  }

  static async findDisplayByCinemas(nameCinemaList: string): Promise<SeanceDisplay[]> {
    const connection = await dbPool.getConnection();
    let requete: string = '';
    logger.info("Selecteur de cinema = " + nameCinemaList);
    if (nameCinemaList === '"all"') {
      requete = `
      SELECT 
        seanceId, titleFilm, nameSalle, nameCinema, 
        capacity,
        dateJour, hourBeginHHSMM, hourEndHHSMM, 
        bo, duration, qualite, imageFilm128,
        salleId, filmId
      FROM ViewFilmsSeancesSalle
      INNER JOIN Film ON Film.id = ViewFilmsSeancesSalle.filmId ;
      `;
    } else {
      requete = `SELECT 
        seanceId, titleFilm, nameSalle, nameCinema, 
        capacity,
        dateJour, hourBeginHHSMM, hourEndHHSMM, 
        bo, duration, qualite, imageFilm128,
        salleId, filmId
      FROM ViewFilmsSeancesSalle
      INNER JOIN Film ON Film.id = ViewFilmsSeancesSalle.filmId
      WHERE nameCinema in (${nameCinemaList})`;
    }
    logger.info(`Exécution de la requête : ${requete}`);

    const [rows] = await connection.execute(requete);
    connection.release();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new SeanceDisplay(row));
  }

  static async findTarifs(): Promise<TarifQualite[]> {
    const connection = await dbPool.getConnection();
    const requete = `SELECT * FROM TarifQualite`;
    logger.info(`Exécution de la requête : ${requete}`);

    const [rows] = await connection.execute(requete);
    connection.release();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new TarifQualite(row));

  }

  static async getSeatsBooked(p_seanceId: string): Promise<string> {
    const connection = await dbPool.getConnection();
    // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
    const [rows] = await connection.execute(
      `SELECT siegesReserves
     FROM ViewSeanceSiegesReserves 
     WHERE seanceId = ? LIMIT 1`,
      [p_seanceId]
    );
    logger.info(`SELECT siegesReserves FROM ViewSeanceSiegesReserves WHERE seanceId = ${p_seanceId}`);
    connection.release();

    // Map des lignes pour les convertir en instances de string
    return (rows as any[]).map((row) => row as string)[0];

  }
}