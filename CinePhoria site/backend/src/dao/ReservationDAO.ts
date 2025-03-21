import mysql from 'mysql2/promise';
import { dbConfig } from '../config/config';
import logger from '../config/configLog';
import { ReservationForUtilisateur, SeatsForReservation } from "../shared-models/Reservation";

export class ReservationDAO {
  static async checkAvailabilityAndReserve(
    email: string,
    seanceId: string,
    tarifSeats: Record<string, number>,
    pmrSeats: number,
    seatsReserved: string
  ): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const [results] = await connection.query(
        `CALL CheckAvailabilityAndReserve(?, ?, ?, ?, ?, @result);
         SELECT @result AS result;`,
        [email, seanceId, JSON.stringify(tarifSeats), pmrSeats, seatsReserved]
      );
      logger.info("Execution de la procedure CheckAvailabilityAndReserve ")
      logger.info("Parametre =", [email, seanceId, JSON.stringify(tarifSeats), pmrSeats, seatsReserved]);
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

  static async confirmReserve(p_reservationId: string, p_utilisateurId: string, p_seanceId: string): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);

    logger.info("Confirm R U S " + p_reservationId + " " + p_utilisateurId + " " + p_seanceId);

    try {
      // Étape 1 : Vérification de l'existence de la réservation
      const [rows] = await connection.execute(
        `SELECT utilisateurId, seanceId, stateReservation FROM Reservation WHERE id = ?`,
        [p_reservationId]
      );

      const reservationData = (rows as any[])[0];

      if (!reservationData) {
        logger.info(`Reservation inexistante pour ${p_reservationId}`);
        return 'Erreur: Reservation inexistante';
      }

      logger.info("Resultat select = " + JSON.stringify(reservationData));
      const { utilisateurId, seanceId, stateReservation } = reservationData;

      if ((p_utilisateurId !== utilisateurId) || (p_seanceId !== seanceId) || (stateReservation !== 'ReserveToConfirm')) {
        logger.info(`Reservation incoherente u = ${p_utilisateurId} s = ${p_seanceId} , st =  ${stateReservation}`);
        return 'Erreur: Reservation incoherente pour les données communiquées';
      }

      // Étape 2 : Exécution de la procédure stockée
      const [results] = await connection.query(
        `CALL ConfirmReserve(?, @result); SELECT @result AS result;`,
        [p_reservationId]
      ) as [any, any];
      const [ligne, [statut]] = results;
      const retour = statut.result;
      /**
       * Résultat brut SQL: 
      [
        {
          "fieldCount": 0,
          ....
        },
        [ { "result": "OK" } ]
      ]
       */


      
      return retour;

    } catch (error) {
      logger.error("Erreur SQL:", error);
      return "Erreur: Problème interne du serveur.";
    } finally {
      await connection.end();
    }
  }

  static async cancelReserve(p_reservationId: string): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);

    logger.info("Cancel reservation : " + p_reservationId);

    // // Étape 1 : Récupérer les informations de la reservation dans la base
    // const [rows] = await connection.execute(
    //   `SELECT utilisateurId, seanceId, stateReservation
    //    FROM Reservation 
    //    WHERE id = ?`,
    //   [p_reservationId]
    // );

    // const reservationData = (rows as any[])[0];

    // if (!reservationData) {
    //   logger.info(`Reservation inexistante pour ${p_reservationId}`);
    //   return 'Reservation inexistante';
    // }
    // logger.info("Resultat select = " + JSON.stringify(reservationData));
    // const { utilisateurId, seanceId, stateReservation } = reservationData;

    // if ((p_utilisateurId !== utilisateurId) || (p_seanceId !== seanceId) || (stateReservation !== 'future') ) {
    //   logger.info(`Reservation incoherente pour les données communiquées u = ${p_utilisateurId} s = ${p_seanceId} , st =  ${stateReservation}`);
    //   return 'Reservation incoherente pour les données communiquées';
    // }
    // On peut confirmer la reservation
    const [results] = await connection.query(
      `CALL cancelReserve(?, @result);
     SELECT @result AS result;`,
      [p_reservationId]
    ) as [any[], any];;
    // Exemple de retour 
    // {
    //   "0": { "affectedRows": 0, "changedRows": 0, "fieldCount": 0, "info": "", "insertId": 0, "serverStatus": 16394, "warningStatus": 0 },
    //   "1": [{ "result": "OK" }],
    //   "service": "backend-CinePhoria"
    // }
    // console.log("Type de results:", typeof results);
    // console.log("Contenu de results:", JSON.stringify(results, null, 2));

    // Vérification et extraction correcte du résultat
    const resultRows = results["1"]; // Accès à la clé "1"
    const resultValue = Array.isArray(resultRows) && resultRows.length > 0
      ? resultRows[0].result
      : "Erreur : Résultat non trouvé";

    logger.info("resultValue =", resultValue);
    return resultValue;

  }

  static async reserveForUtilisateur(p_utilisateurId: string): Promise<ReservationForUtilisateur[]> {
    const connection = await mysql.createConnection(dbConfig);

    // Étape 1 : Récupérer les informations des reservations dans la base pour l'utilisateur donné
    const [rows] = await connection.execute(
      `SELECT *
     FROM viewutilisateurreservation 
     WHERE utilisateurId = ?`,
      [p_utilisateurId]
    );
    logger.info(`SELECT * FROM viewutilisateurreservation WHERE utilisateurId = ${p_utilisateurId}`);
    await connection.end();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new ReservationForUtilisateur(row));
  }

  static async getReservationById(p_reservationId: string): Promise<ReservationForUtilisateur[]> {
    const connection = await mysql.createConnection(dbConfig);
    // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
    const [rows] = await connection.execute(
      `SELECT *
     FROM viewutilisateurreservation 
     WHERE reservationId = ? LIMIT 1`,
      [p_reservationId]
    );
    logger.info(`SELECT * FROM viewutilisateurreservation WHERE reservationId = ${p_reservationId}`);
    await connection.end();

    // Map des lignes pour les convertir en instances de Seance
    return (rows as any[]).map((row) => new ReservationForUtilisateur(row));

  }

  static async setReservationStateById(p_reservationId: string, p_stateReservation: string): Promise<boolean> {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            `UPDATE Reservation 
            SET stateReservation = ?
            WHERE id = ?`,
            [p_stateReservation, p_reservationId]
        );

        logger.info(`UPDATE Reservation SET stateReservation = ${p_stateReservation} WHERE id = ${p_reservationId}`);

        // Vérification du succès de l'update
        const updateResult = result as any; // Type générique pour accéder aux propriétés MySQL
        return updateResult.affectedRows > 0; // Retourne true si au moins une ligne a été affectée
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de la réservation ${p_reservationId}:`, error);
        return false;
    } finally {
        await connection.end();
    }
}

static async setReservationEvaluationById(p_reservationId: string, p_note: number, p_evaluation: string, p_isEvaluationMustBeReview: boolean): Promise<boolean> {
  const connection = await mysql.createConnection(dbConfig);
  try {
      const [result] = await connection.execute(
          `UPDATE Reservation 
          SET note = ?,
          evaluation = ?,
          isEvaluationMustBeReview = ?
          WHERE id = ?`,
          [p_note, p_evaluation, (p_isEvaluationMustBeReview ? 1 : 0) , p_reservationId]
      );

      logger.info(`UPDATE Reservation SET note = ${p_note}, evaluation = ${p_evaluation}, isEvaluationMustBeReview = ${(p_isEvaluationMustBeReview ? 1 : 0)} WHERE id = ${p_reservationId}`);

      // Vérification du succès de l'update
      const updateResult = result as any; // Type générique pour accéder aux propriétés MySQL
      return updateResult.affectedRows > 0; // Retourne true si au moins une ligne a été affectée
  } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la réservation ${p_reservationId}:`, error);
      return false;
  } finally {
      await connection.end();
  }
}


  static async getSeatsForReservation(p_reservationId: string): Promise<SeatsForReservation[]> {
    const connection = await mysql.createConnection(dbConfig);
    // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
    const [rows] = await connection.execute(
      `SELECT 
      SeatsForTarif.numberSeats as numberSeats,
      TarifQualite.nameTarif as nameTarif,
      TarifQUalite.price as price
    
    FROM Reservation
    JOIN SeatsForTarif ON Reservation.id = SeatsForTarif.ReservationId
    JOIN TarifQualite ON SeatsForTarif.TarifQualiteid = TarifQualite.id

    WHERE Reservation.id = ?`,
      [p_reservationId]
    );
    logger.info(`SELECT * FROM viewutilisateurreservation WHERE reservationId = ${p_reservationId}`);
    await connection.end();

    // Map des lignes pour les convertir en liste de places avec tarif
    return (rows as any[]).map((row) => new SeatsForReservation(row));

  }
}