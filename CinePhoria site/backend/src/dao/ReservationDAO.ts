import mysql from 'mysql2/promise';
import { dbConfig } from '../config/config';
import logger from '../config/configLog';

export class ReservationDAO {
  static async checkAvailabilityAndReserve(
    email: string,
    seanceId: string,
    tarifSeats: Record<string, number>,
    pmrSeats: number
  ): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const [results] = await connection.query(
        `CALL CheckAvailabilityAndReserve(?, ?, ?, ?, @result);
         SELECT @result AS result;`,
        [email, seanceId, JSON.stringify(tarifSeats), pmrSeats]
      );
      logger.info("Execution de la procedure CheckAvailabilityAndReserve ")
      logger.info("Parametre =", [email, seanceId, JSON.stringify(tarifSeats), pmrSeats]);
      // Forcer TypeScript à comprendre la structure des résultats
      const callResults = results as any[]; // Type générique pour le résultat brut
      const selectResult = callResults[1] as Array<{ result: string }>; // Spécifier que le résultat attendu est un tableau d'objets avec une clé "result"

      // Récupérer la chaîne dans @result
      return selectResult[0]?.result || 'Erreur : Résultat non disponible.';
    } catch (error) {
        logger.info('Erreur dans checkAvailabilityAndReserve:', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  }

  static async confirmReserve ( reservationId : string , utilisateurId: string, seanceId: string) : Promise<string> {
    const connection = await mysql.createConnection(dbConfig);

    // Étape 1 : Récupérer les informations de la reservation dans la base
    const [rows] = await connection.execute(
      `SELECT utilisateurId, seanceId, stateReservation
       FROM Reservation 
       WHERE id = ?`,
      [reservationId]
    );

    const reservationData = (rows as any[])[0];

    if (!reservationData) {
      logger.info(`Reservation inexistante pour ${reservationId}`);
      return 'Reservation inexistante';
    }

    const { v_utilisateurId, v_seanceId, v_stateReservation } = reservationData;
    if ((v_utilisateurId !== utilisateurId) || (v_seanceId !== seanceId) ||(v_stateReservation !== 'future') ) {
      logger.info(`Reservation incoherente pour les données communiquées u = ${v_utilisateurId} s = ${v_seanceId} , st =  ${v_stateReservation}`);
      return 'Reservation incoherente pour les données communiquées';
    }
    // On peut confirmer la reservation
    const [results] = await connection.query(
      `CALL ConfirmReserve(?, @result);
       SELECT @result AS result;`,
      [reservationId]
    );

    const resultConfirm = (results as any[])[0];
    if (!resultConfirm) {
      logger.info(`Erreur dans l'execution de la confirmation`);
      return 'Reservation inexistante';
    }
    const { statut } = resultConfirm;
    return statut;
}
}