import { Request, Response } from 'express';
import { SeanceSeuleDAO } from '../dao/SeanceSeuleDAO';
import logger from '../config/configLog';
import { SeanceSeule } from "../shared-models/SeanceSeule";

export class SeanceSeuleController {

    static async getAllSeanceSeules(req: Request, res: Response) {
        try {
         
          const films = await SeanceSeuleDAO.findAll();
          res.json(films);
          
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      };
  
    static async getSeanceSeuleById(req: Request, res: Response) {
        try {
          const seanceSeule = await SeanceSeuleDAO.findById(req.params.id);
        //   if (!film) {
        //     return res.status(404).json({ message: 'SeanceSeule non trouvé' });
        //   }
          res.json(seanceSeule);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }

  // POST => create a SeanceSeule
  static async createSeanceSeule(req: Request, res: Response) {
    try {
      // On récupère les données dans req.body
      
      const data = req.body; 
      logger.info("Creation d'une salle film avec data = ", data);

      // On construit un SeanceSeule
      const filmToCreate = new SeanceSeule(data);
      // Appel du DAO
      const newId = await SeanceSeuleDAO.createSeanceSeule(filmToCreate);

      // On renvoie l’ID ou un message
      res.status(201).json({ message: 'OK', id: newId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT => update a SeanceSeule
  static async updateSeanceSeule(req: Request, res: Response) {
    try {
      const salleId = req.params.id;
      const data = req.body;
      logger.info(`Mise à jour de la salle ${salleId} avec data=`, data);

      const salleToUpdate = new SeanceSeule(data);
      const result = await SeanceSeuleDAO.updateSeanceSeule(salleId, salleToUpdate);

      if (result) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: SeanceSeule non trouvé ou non mis à jour' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE => remove a SeanceSeule
  static async deleteSeanceSeule(req: Request, res: Response) {
    try {
      const salleId = req.params.id;
      logger.info(`Suppression de la salle ${salleId}`);

      const success = await SeanceSeuleDAO.deleteSeanceSeule(salleId);

      if (success) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: SeanceSeule non trouvé ou déjà supprimé' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  

}