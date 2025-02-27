import { Request, Response } from 'express';
import logger from '../config/configLog';
import { ReservationDAO } from '../dao/ReservationDAO';
import { ReservationState } from '../shared-models/Reservation';

// Étendre le type Request pour utiliser "user"

interface AuthenticatedRequest extends Request {
  user?: { compte: string };
}

export class ReservationController {
  static async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const { email, seanceId, tarifSeats, pmrSeats } = req.body;

      // Validation des données d'entrée
      if (!email || !seanceId || !tarifSeats || pmrSeats === undefined) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await ReservationDAO.checkAvailabilityAndReserve(
        email,
        seanceId,
        tarifSeats,
        pmrSeats
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
      } else {
        const [statut, utilisateurId, reservationId] = result.split(',');
        res.status(201).json({ statut, utilisateurId, reservationId });
        logger.info("Resultat =", [statut, utilisateurId, reservationId]);
      }
    } catch (error) {
      console.error('Erreur dans createReservation:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  }


  static async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      // Recuperation de l'ID de la reservation
      const reservationId = req.params.reservationid?.trim();

      if (!reservationId) {
        res.status(400).json({ message: `L'ID de la réservation est requis.` });
        return;

      }
      // Récupération des réservations
      const reservations = await ReservationDAO.getReservationById(reservationId);

      if (!reservations || reservations.length === 0) {
        res.status(404).json({ message: `Aucune réservation trouvée pour ${reservationId}` });
        return;
      }

      res.status(200).json(reservations);
    } catch (error: any) {
      logger.error(`Erreur lors de la récupération des réservations: ${error.message}`);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }

  }
  static async setReservationStateById(req: Request, res: Response): Promise<void> {
    try {
        // Récupération des paramètres de la requête
        const { reservationId, stateReservation } = req.body;

        // Vérification des entrées
        if (!reservationId || !stateReservation) {
            res.status(400).json({ message: `L'ID de la réservation et l'état sont requis.` });
            return;
        }

        // Vérification si stateReservation est une valeur valide de l'ENUM
        if (!Object.values(ReservationState).includes(stateReservation as ReservationState)) {
            res.status(400).json({ message: `Valeur de l'état non conforme: ${stateReservation}` });
            return;
        }

        // Appel au DAO pour mettre à jour l'état de la réservation
        const updateSuccess = await ReservationDAO.setReservationStateById(reservationId, stateReservation);

        // Gestion du résultat
        if (updateSuccess) {
            res.status(200).json({ message: `L'état de la réservation ${reservationId} a été mis à jour avec succès.` });
            logger.info(`setReservationStateById: Réservation ${reservationId} mise à jour avec état "${stateReservation}".`);
        } else {
            res.status(404).json({ message: `Aucune réservation trouvée pour ${reservationId}.` });
            logger.warn(`setReservationStateById: Échec de mise à jour, réservation ${reservationId} introuvable.`);
        }
    } catch (error: any) {
        logger.error(`Erreur lors de la mise à jour de la réservation ${req.body.reservationId}: ${error.message}`);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
}
static async setReservationEvaluationById(req: Request, res: Response): Promise<void> {
  try {
      // Récupération des paramètres de la requête
      const { reservationId, note, evaluation, isEvaluationMustBeReview } = req.body;

      // Vérification des entrées
      if (!reservationId || !note || !evaluation || !isEvaluationMustBeReview ) {
          res.status(400).json({ message: `L'ID de la réservation et les parametres sont requis.` });
          return;
      }

      // Vérification si la note est valide
      if (![0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(note)) {
        res.status(400).json({ message: `Valeur de la note non conforme: ${note}` });
          return;
      }

      // Appel au DAO pour mettre à jour l'état de la réservation
      const updateSuccess = await ReservationDAO.setReservationEvaluationById(reservationId, note, evaluation, isEvaluationMustBeReview);

      // Gestion du résultat
      if (updateSuccess) {
          res.status(200).json({ message: `L'evaluation de la réservation ${reservationId} a été mis à jour avec succès.` });
          logger.info(`setReservationEvaluationById: Evaluation de réservation ${reservationId} mise à jour avec succes.`);
      } else {
          res.status(404).json({ message: `Aucune réservation trouvée pour ${reservationId}.` });
          logger.warn(`setReservationEvaluationById: Échec de mise à jour, réservation ${reservationId} introuvable.`);
      }
  } catch (error: any) {
      logger.error(`Erreur lors de la mise à jour de la réservation ${req.body.reservationId}: ${error.message}`);
      res.status(500).json({ error: "Erreur interne du serveur." });
  }
}
  static async getSeatsForReservation(req: Request, res: Response): Promise<void> {
    try {
      // Recuperation de l'ID de la reservation
      const reservationId = req.params.reservationid?.trim();

      if (!reservationId) {
        res.status(400).json({ message: `L'ID de la réservation est requis.` });
        return;

      }
      // Récupération des places
      const seats = await ReservationDAO.getSeatsForReservation(reservationId);

      if (!seats || seats.length === 0) {
        res.status(404).json({ message: `Aucune place trouvée pour la reservation ${reservationId}` });
        return;
      }

      res.status(200).json(seats);
    } catch (error: any) {
      logger.error(`Erreur lors de la récupération des places d'une réservation : ${error.message}`);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  }

  static async getSeatsForTarif(req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Non implémenté.' });
  }

  

  static async confirmReservation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const { reservationId, utilisateurId, seanceId } = req.body;
        const { user } = req ;
        if (user ) {
          logger.info("Compte récupéré = ", user);
      }

      

        // Validation des données d'entrée
        if (!reservationId || !utilisateurId || !seanceId) {
            if (!res.headersSent) res.status(400).json({ message: 'Données manquantes ou invalides.' });
            return;
        }

        // Exécution du DAO
        const result = await ReservationDAO.confirmReserve(reservationId, utilisateurId, seanceId);

        logger.info("Résultat retour du DAO:", JSON.stringify(result));

        // ✅ Vérification avant d'envoyer une réponse pour éviter "Cannot set headers after they are sent"
        if (res.headersSent) {
            logger.warn("Tentative d'envoi d'une réponse après que les headers ont déjà été envoyés.");
            return;
        }

        // Gestion du résultat
        if (result.startsWith('Erreur')) {
            res.status(400).json({ message: result });
            logger.error(`Échec de l'opération: ${result}`);
        } else if (result === "OK") {
            res.status(201).json({ result: "OK" });
            logger.info("Opération réussie.");
        } else if (result.startsWith('Warning')) {
            res.status(201).json({ result: "Warning", message: result });
            logger.warn(`Avertissement: ${result}`);
        } else {
            res.status(500).json({ message: "Réponse inattendue du serveur." });
            logger.error(`Réponse inattendue: ${result}`);
        }

    } catch (error) {
        logger.error('Erreur dans confirmReservation:', error);

        // Vérifier avant d'envoyer une réponse pour éviter les erreurs HTTP
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
}

  static async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.body;

      // Validation des données d'entrée
      if (!reservationId) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await ReservationDAO.cancelReserve(
        reservationId
      );

      // Gestion du résultat
      if (result.startsWith('Erreur')) {
        res.status(400).json({ message: result });
        logger.error(`Échec de l'opération: ${result}`);
      } else if (result === "OK") {
        res.status(201).json({ result: "OK" });
        logger.info("Opération réussie.");
      } else if (result.startsWith('Warning')) {
        res.status(201).json({ result: "Warning", message: result });
        logger.warn(`Avertissement: ${result}`);
      } else {
        res.status(500).json({ message: "Réponse inattendue du serveur." });
        logger.error(`Réponse inattendue: ${result}`);
      }
    } catch (error) {
      console.error('Erreur dans cancelReservation:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  }

  static async getReservationForUtilisateur2(req: Request, res: Response): Promise<void> {
    try {
      // Récupération de l'ID utilisateur
      const utilisateurId = req.params.utilisateurId?.trim();

      if (!utilisateurId) {
        res.status(400).json({ message: `L'ID utilisateur est requis.` });
        return;
      }

      // Récupération des réservations
      const reservations = await ReservationDAO.reserveForUtilisateur(utilisateurId);

      if (!reservations || reservations.length === 0) {
        res.status(404).json({ message: `Aucune réservation trouvée pour ${utilisateurId}` });
        return;
      }

      res.status(200).json(reservations);
    } catch (error: any) {
      logger.error(`Erreur lors de la récupération des réservations: ${error.message}`);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  }
  static async getReservationForUtilisateur(req: Request, res: Response): Promise<void> {
    try {
      // Récupération de l'ID utilisateur
      const utilisateurId = req.params.utilisateurId?.trim();

      if (!utilisateurId) {
        res.status(400).json({ message: `L'ID utilisateur est requis.` });
        return;
      }

      // Récupération des réservations
      const reservations = await ReservationDAO.reserveForUtilisateur(utilisateurId);

      if (!reservations || reservations.length === 0) {
        res.status(404).json({ message: `Aucune réservation trouvée pour ${utilisateurId}` });
        return;
      }

      res.status(200).json(reservations);
      

    } catch (error: any) {
      logger.error(`Erreur lors de la récupération des réservations: ${error.message}`);

      if (!res.headersSent) { // ✅ Vérifie si une réponse a déjà été envoyée
        res.status(500).json({ error: "Erreur interne du serveur." });
      }
    }
  }

}