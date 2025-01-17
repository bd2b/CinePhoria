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

  
}