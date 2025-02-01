import { Request, Response } from 'express';
import logger from '../config/configLog';
import { ReservationDAO } from '../dao/ReservationDAO';

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

  // Placeholder pour les méthodes futures
  static async getReservation(req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Non implémenté.' });
  }

  static async getSeatsForTarif(req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Non implémenté.' });
  }


  static async confirmReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId, utilisateurId, seanceId } = req.body;

      // Validation des données d'entrée
      if (!reservationId) {
        res.status(400).json({ message: 'Données manquantes ou invalides.' });
        return;
      }

      // Appel au DAO pour exécuter la procédure stockée
      const result = await ReservationDAO.confirmReserve(
        reservationId, utilisateurId, seanceId
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
      console.error('Erreur dans confirmReservation:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
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
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  }

}