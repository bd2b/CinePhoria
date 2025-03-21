import { Request, Response } from 'express';
import { SeanceDAO } from '../dao/SeanceDAO';
import logger from '../config/configLog';

export class SeanceController {
  static async getAllSeances(req: Request, res: Response) {
    try {
      const seances = await SeanceDAO.findAll();
      res.json(seances);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  static async getSeanceByCinemas(req: Request, res: Response) {
    try {
      // Vérification et conversion de cinemasList en string
      const cinemasList = req.query.cinemasList;
      if (!cinemasList || typeof cinemasList !== 'string') {
        return res.status(400).json({ message: `cinemasList doit être une chaîne de caractères : ${cinemasList}` });
      }
  
      const seances = await SeanceDAO.findByCinemas(cinemasList);
      if (seances.length === 0) {
        return res.status(404).json({ message: `Seances non trouvées pour ${cinemasList}` });
      }
  
      res.json(seances);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTarifs(req: Request, res: Response) {
    try {
      const tarifs = await SeanceDAO.findTarifs();
      res.json(tarifs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  static async getSeatsBooked(req: Request, res: Response): Promise<void> {
    try {
      // Recuperation de l'ID de la seance
      const seanceId = req.params.seanceid?.trim();

      if (!seanceId) {
        res.status(400).json({ message: `L'ID de la séance est requis.` });
        return;
      }
      // Récupération des places
      const siegesReserves = await SeanceDAO.getSeatsBooked(seanceId);
      const response = siegesReserves ?  siegesReserves  : { siegesReserves: "" };

      logger.info("Sièges déjà réservés : " + JSON.stringify(response));
      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Erreur lors de la récupération des sièges d'une séance : ${error.message}`);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  }
}