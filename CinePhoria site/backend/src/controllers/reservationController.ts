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
        const [statut , utilisateurId, reservationId] = result.split(',');
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
}