"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationDAO = void 0;
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
const Reservation_1 = require("../shared-models/Reservation");
class ReservationDAO {
    static async checkAvailabilityAndReserve(email, seanceId, tarifSeats, pmrSeats, seatsReserved) {
        const connection = await config_1.dbPool.getConnection();
        try {
            //    Exécution de la procédure stockée avec @result
            const [results] = await connection.query(`CALL CheckAvailabilityAndReserve(?, ?, ?, ?, ?, @result);
         SELECT @result AS result;`, [email, seanceId, JSON.stringify(tarifSeats), pmrSeats, seatsReserved]);
            configLog_1.default.info("Execution de la procedure CheckAvailabilityAndReserve ");
            configLog_1.default.info("Parametre =", [email, seanceId, JSON.stringify(tarifSeats), pmrSeats, seatsReserved]);
            // Forcer TypeScript à comprendre la structure des résultats
            configLog_1.default.info(`Resultat = ${JSON.stringify(results)}`);
            const [procedureResult, selectResult] = results;
            // Recherche sécurisée du champ "result"
            const retour = Array.isArray(selectResult)
                ? selectResult.find(row => 'result' in row)?.result
                : null;
            return retour || 'Erreur : Résultat non disponible dans retour.';
        }
        catch (error) {
            configLog_1.default.info('Erreur dans checkAvailabilityAndReserve:', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    static async confirmReserve(p_reservationId, p_utilisateurId, p_seanceId) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info("Confirm R U S " + p_reservationId + " " + p_utilisateurId + " " + p_seanceId);
        try {
            // Étape 1 : Vérification de l'existence de la réservation
            const [rows] = await connection.execute(`SELECT utilisateurId, seanceId, stateReservation FROM Reservation WHERE id = ?`, [p_reservationId]);
            const reservationData = rows[0];
            if (!reservationData) {
                configLog_1.default.info(`Reservation inexistante pour ${p_reservationId}`);
                return 'Erreur: Reservation inexistante';
            }
            configLog_1.default.info("Resultat select = " + JSON.stringify(reservationData));
            const { utilisateurId, seanceId, stateReservation } = reservationData;
            if ((p_utilisateurId !== utilisateurId) || (p_seanceId !== seanceId) || (stateReservation !== 'ReserveToConfirm')) {
                configLog_1.default.info(`Reservation incoherente u = ${p_utilisateurId} s = ${p_seanceId} , st =  ${stateReservation}`);
                return 'Erreur: Reservation incoherente pour les données communiquées';
            }
            // Étape 2 : Exécution de la procédure stockée
            const [results] = await connection.query(`CALL ConfirmReserve(?, @result); SELECT @result AS result;`, [p_reservationId]);
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
        }
        catch (error) {
            configLog_1.default.error("Erreur SQL:", error);
            return "Erreur: Problème interne du serveur.";
        }
        finally {
            connection.release();
        }
    }
    static async cancelReserve(p_reservationId) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info("Cancel reservation : " + p_reservationId);
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
        const [results] = await connection.query(`CALL cancelReserve(?, @result);
     SELECT @result AS result;`, [p_reservationId]);
        ;
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
        configLog_1.default.info("resultValue =", resultValue);
        return resultValue;
    }
    static async reserveForUtilisateur(p_utilisateurId) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // Étape 1 : Récupérer les informations des reservations dans la base pour l'utilisateur donné
            const [rows] = await connection.execute(`SELECT *
     FROM ViewUtilisateurReservation 
     WHERE utilisateurId = ?`, [p_utilisateurId]);
            configLog_1.default.info(`SELECT * FROM ViewUtilisateurReservation WHERE utilisateurId = ${p_utilisateurId}`);
            connection.release();
            // Map des lignes pour les convertir en instances de Seance
            return rows.map((row) => new Reservation_1.ReservationForUtilisateur(row));
        }
        catch (error) {
            configLog_1.default.info("Erreur dans reserveForUtilisateur");
            return [];
        }
    }
    static async getReservationById(p_reservationId) {
        const connection = await config_1.dbPool.getConnection();
        // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
        const [rows] = await connection.execute(`SELECT *
     FROM ViewUtilisateurReservation 
     WHERE reservationId = ? LIMIT 1`, [p_reservationId]);
        configLog_1.default.info(`SELECT * FROM ViewUtilisateurReservation WHERE reservationId = ${p_reservationId}`);
        connection.release();
        // Map des lignes pour les convertir en instances de Seance
        return rows.map((row) => new Reservation_1.ReservationForUtilisateur(row));
    }
    static async getReservationsByCinemas(nameCinemaList) {
        const connection = await config_1.dbPool.getConnection();
        let requete = '';
        configLog_1.default.info("Selecteur de cinema = " + nameCinemaList);
        if (nameCinemaList === '"all"') {
            requete = `
      SELECT 
        *
      FROM ViewUtilisateurReservation `;
        }
        else {
            requete = `
        SELECT 
        *
      FROM ViewUtilisateurReservation 
      WHERE nameCinema in (${nameCinemaList})`;
        }
        configLog_1.default.info(`Exécution de la requête : ${requete}`);
        const [rows] = await connection.execute(requete);
        connection.release();
        // Map des lignes pour les convertir en instances de Seance
        return rows.map((row) => new Reservation_1.ReservationForUtilisateur(row));
    }
    static async setReservationStateById(p_reservationId, p_stateReservation) {
        const connection = await config_1.dbPool.getConnection();
        try {
            const [result] = await connection.execute(`UPDATE Reservation 
            SET stateReservation = ?
            WHERE id = ?`, [p_stateReservation, p_reservationId]);
            configLog_1.default.info(`UPDATE Reservation SET stateReservation = ${p_stateReservation} WHERE id = ${p_reservationId}`);
            // Vérification du succès de l'update
            const updateResult = result; // Type générique pour accéder aux propriétés MySQL
            return updateResult.affectedRows > 0; // Retourne true si au moins une ligne a été affectée
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la mise à jour de la réservation ${p_reservationId}:`, error);
            return false;
        }
        finally {
            connection.release();
        }
    }
    static async setReservationEvaluationById(p_reservationId, p_note, p_evaluation, p_isEvaluationMustBeReview) {
        const connection = await config_1.dbPool.getConnection();
        try {
            const isEvaluationMustBeReview = p_isEvaluationMustBeReview ? 1 : 0;
            const [result] = await connection.execute(`UPDATE Reservation 
          SET note = ?,
          evaluation = ?,
          isEvaluationMustBeReview = ?
          WHERE id = ?`, [p_note, p_evaluation, isEvaluationMustBeReview, p_reservationId]);
            configLog_1.default.info(`UPDATE Reservation SET note = ${p_note}, evaluation = ${p_evaluation}, isEvaluationMustBeReview = ${(p_isEvaluationMustBeReview ? 1 : 0)} WHERE id = ${p_reservationId}`);
            // Vérification du succès de l'update
            const updateResult = result; // Type générique pour accéder aux propriétés MySQL
            return updateResult.affectedRows > 0; // Retourne true si au moins une ligne a été affectée
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la mise à jour de la réservation ${p_reservationId}:`, error);
            return false;
        }
        finally {
            connection.release();
        }
    }
    static async getSeatsForReservation(p_reservationId) {
        const connection = await config_1.dbPool.getConnection();
        // Étape 1 : Récupérer les informations des reservations dans la base selon l'id de reservation
        const [rows] = await connection.execute(`SELECT 
      SeatsForTarif.numberSeats as numberSeats,
      TarifQualite.nameTarif as nameTarif,
      TarifQualite.price as price
    
    FROM Reservation
    JOIN SeatsForTarif ON Reservation.id = SeatsForTarif.ReservationId
    JOIN TarifQualite ON SeatsForTarif.TarifQualiteid = TarifQualite.id

    WHERE Reservation.id = ?`, [p_reservationId]);
        configLog_1.default.info(`SELECT * FROM ViewUtilisateurReservation WHERE reservationId = ${p_reservationId}`);
        connection.release();
        // Map des lignes pour les convertir en liste de places avec tarif
        return rows.map((row) => new Reservation_1.SeatsForReservation(row));
    }
    // Update
    static async updateReservationAvis(id, reservationAvis) {
        // Gérer le probleme de mise à jour de champ date en MySQL qui attend 'yyyy-mm-dd'
        const connection = await config_1.dbPool.getConnection();
        try {
            // Début de la transaction
            await connection.beginTransaction();
            configLog_1.default.info(`Mise à jour de l'avis pour ${id}`);
            const [result] = await connection.execute(`UPDATE Reservation SET
          evaluation = ?,
          note = ?,
          isEvaluationMustBeReview = ?
          WHERE id=?`, [reservationAvis.evaluation || null,
                reservationAvis.note || null,
                reservationAvis.isEvaluationMustBeReview !== undefined
                    ? reservationAvis.isEvaluationMustBeReview
                    : false,
                id
            ]);
            // result => un objet du type ResultSetHeader
            const rowsAffected = result.affectedRows || 0;
            if (rowsAffected === 0) {
                throw new Error("Mise à jour avis non effectuée");
            }
            // Mise à jour de la note du film
            if (reservationAvis.note) {
                configLog_1.default.info(`Mise à jour de la note du film`);
                const [result] = await connection.execute(`UPDATE Film f
            JOIN (
                    SELECT s.Filmid AS filmId, AVG(r.note) AS avgNote
                    FROM Reservation r
                    JOIN Seance s ON r.Seanceid = s.id
                    WHERE r.stateReservation = 'doneEvaluated'
                          AND r.isEvaluationMustBeReview = 0
                          AND r.note IS NOT NULL
                          AND s.Filmid = (
                                SELECT s2.Filmid
                                FROM Reservation r2
                                JOIN Seance s2 ON r2.Seanceid = s2.id
                                WHERE r2.id = ?
                                LIMIT 1
                          )
                    GROUP BY s.Filmid
                  ) AS sub ON f.id = sub.filmId
              SET f.note = ROUND(sub.avgNote, 1);`, [id]);
                // result => un objet du type ResultSetHeader
                const rowsAffected = result.affectedRows || 0;
                if (rowsAffected === 0) {
                    throw new Error("Mise à jour note du film non effectuée");
                }
            }
            // Valider la transaction
            await connection.commit();
            return true;
        }
        catch (err) {
            await connection.rollback();
            configLog_1.default.error('Erreur update ReservationAvis:', err);
            throw err;
        }
        finally {
            connection.release();
        }
    }
    static async getReservationStatsAll() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Exécution de la requête : SELECT * FROM ViewFilmReservationDate');
        const [rows] = await connection.execute('SELECT * FROM ViewFilmReservationDate');
        connection.release();
        // On convertit chaque record en SeanceSeule
        return rows.map(row => new Reservation_1.ReservationStats(row));
    }
}
exports.ReservationDAO = ReservationDAO;
