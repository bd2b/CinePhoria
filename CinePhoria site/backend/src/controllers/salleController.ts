import { Request, Response } from 'express';
import { SalleDAO } from '../dao/SalleDAO';
import logger from '../config/configLog';
import { Salle } from "../shared-models/Salle";

export class SalleController {

    static async getAllSalles(req: Request, res: Response) {
        try {
         
          const films = await SalleDAO.findAll();
          res.json(films);
          
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      };
  
    static async getSalleById(req: Request, res: Response) {
        try {
          const film = await SalleDAO.findById(req.params.id);
        //   if (!film) {
        //     return res.status(404).json({ message: 'Salle non trouvé' });
        //   }
          res.json(film);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }

  // POST => create a Salle
  static async createSalle(req: Request, res: Response) {
    try {
      // On récupère les données dans req.body
      
      const data = req.body; 
      logger.info("Creation d'une salle film avec data = ", data);

      // On construit un Salle
      const filmToCreate = new Salle(data);
      // Appel du DAO
      const newId = await SalleDAO.createSalle(filmToCreate);

      // On renvoie l’ID ou un message
      res.status(201).json({ message: 'OK', id: newId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT => update a Salle
  static async updateSalle(req: Request, res: Response) {
    try {
      const salleId = req.params.id;
      const data = req.body;
      logger.info(`Mise à jour de la salle ${salleId} avec data=`, data);

      const salleToUpdate = new Salle(data);
      const result = await SalleDAO.updateSalle(salleId, salleToUpdate);

      if (result) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Salle non trouvé ou non mis à jour' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE => remove a Salle
  static async deleteSalle(req: Request, res: Response) {
    try {
      const salleId = req.params.id;
      logger.info(`Suppression de la salle ${salleId}`);

      const success = await SalleDAO.deleteSalle(salleId);

      if (success) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Salle non trouvé ou déjà supprimé' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  

}