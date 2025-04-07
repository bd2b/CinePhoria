import mysql from 'mysql2/promise';
import { Film } from "../shared-models/Film";

import { dbConfig } from "../config/config";
import logger from '../config/configLog';

import { formatDateLocalYYYYMMDD } from '../shared-models/HelpersCommon';


export class FilmDAO {
  static async findAll(): Promise<Film[]> {

    const connection = await mysql.createConnection(dbConfig);
    logger.info('Exécution de la requête : SELECT * FROM Film');
    const [rows] = await connection.execute('SELECT * FROM Film');
    await connection.end();

    // On convertit chaque record en Film
    return (rows as any[]).map(row => new Film(row));

  }

  static async findById(id: string): Promise<Film | null> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    const [rows] = await connection.execute('SELECT * FROM Film WHERE id = ?', [id]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? new Film(data) : null;
  }

  static async findSortiesDeLaSemaine(): Promise<Film[]> {

    const connection = await mysql.createConnection(dbConfig);
    logger.info('Exécution de la requête : SELECT * FROM viewfilmssortiesdelasemaine');
    const [rows] = await connection.execute('SELECT * FROM viewfilmssortiesdelasemaine');
    await connection.end();

    // On convertit chaque record en Film
    return (rows as any[]).map(row => new Film(row));

  }

  // Create
  static async createFilm(film: Film): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // On génére un id (UUID) côté back si il n'est pas fourni
      const newId = film.id || generateUUID(); 

      logger.info(`Insertion d'un nouveau film : ${newId}, ${film.titleFilm}`);
      await connection.execute(
        `INSERT INTO Film
       (id, titleFilm, filmPitch, genreArray, duration, linkBO, dateSortieCinePhoria,
        categorySeeing, note, isCoupDeCoeur, filmDescription, filmAuthor, filmDistribution,
        imageFilm128, imageFilm1024)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          film.titleFilm || null,
          film.filmPitch || null,
          film.genreArray || null,
          film.duration || null,
          film.linkBO || null,
          film.dateSortieCinePhoria || null,
          film.categorySeeing || null,
          film.note || 0,
          film.isCoupDeCoeur ? 1 : 0,
          film.filmDescription || null,
          film.filmAuthor || null,
          film.filmDistribution || null,
          film.imageFilm128 || null,
          film.imageFilm1024 || null,
        ]
      );
      await connection.end();
      return newId;
    } catch (err) {
      await connection.end();
      logger.error('Erreur creation film:', err);
      throw err;
    }
  }

  // Update
  static async updateFilm(id: string, film: Film): Promise<boolean> {
    // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
    const dateSortie = formatDateLocalYYYYMMDD(new Date(film.dateSortieCinePhoria || ''));
    const connection = await mysql.createConnection(dbConfig);
    try {
      logger.info(`Mise à jour du film ${id}`);
      const [result] = await connection.execute(
        `UPDATE Film SET
          titleFilm=?,
          filmPitch=?,
          genreArray=?,
          duration=?,
          linkBO=?,
          dateSortieCinePhoria=?,
          categorySeeing=?,
          note=?,
          isCoupDeCoeur=?,
          filmDescription=?,
          filmAuthor=?,
          filmDistribution=?,
          imageFilm128=?,
          imageFilm1024=?
       WHERE id=?`,
        [
          film.titleFilm || null,
          film.filmPitch || null,
          film.genreArray || null,
          film.duration || null,
          film.linkBO || null,
          dateSortie || null,
          film.categorySeeing || null,
          film.note || 0,
          film.isCoupDeCoeur ? 1 : 0,
          film.filmDescription || null,
          film.filmAuthor || null,
          film.filmDistribution || null,
          film.imageFilm128 || null,
          film.imageFilm1024 || null,
          id
        ]
      );
      await connection.end();
      // result => un objet du type ResultSetHeader
      const rowsAffected = (result as any).affectedRows || 0;
      return rowsAffected > 0;
    } catch (err) {
      await connection.end();
      logger.error('Erreur update film:', err);
      throw err;
    }
  }

  // Delete
  static async deleteFilm(id: string): Promise<boolean> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      logger.info(`Suppression du film ${id}`);
      const [result] = await connection.execute(
        'DELETE FROM Film WHERE id = ?',
        [id]
      );
      await connection.end();
      const rowsAffected = (result as any).affectedRows || 0;
      return rowsAffected > 0;
    } catch (err) {
      await connection.end();
      logger.error('Erreur delete film:', err);
      throw err;
    }
  }
}

// *** générateur d'UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


