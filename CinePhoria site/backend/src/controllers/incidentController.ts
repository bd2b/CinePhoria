import { Request, Response } from 'express';
import { IncidentDAO } from '../dao/IncidentDAO';
import logger from '../config/configLog';
import { Incident } from '../shared-models/Incident';

export class IncidentController {

    static async getAllIncidents(req: Request, res: Response) {
        try {
         
          const incidents = await IncidentDAO.findAll();
          res.json(incidents);
          
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      };
  // SELECT => select a Incident
    static async getIncidentById(req: Request, res: Response) {
        try {
          const incident = await IncidentDAO.findById(req.params.id);
        //   if (!film) {
        //     return res.status(404).json({ message: 'Incident non trouvé' });
        //   }
          res.json(incident);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }

  // POST => create a Incident
  static async createIncident(req: Request, res: Response) {
    try {
      // On récupère les données dans req.body
      
      const data = req.body; 
      logger.info("Creation d'un incident avec data = ", data);

      // On construit un Incident
      const incidentToCreate = new Incident(data);
      // Appel du DAO
      const newId = await IncidentDAO.createIncident(incidentToCreate);

      // On renvoie l’ID ou un message
      res.status(201).json({ message: 'OK', id: newId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT => update a Incident
  static async updateIncident(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = req.body;
      logger.info(`Mise à jour de l'incident' ${id} avec data=`, data);

      const incidentToUpdate = new Incident(data);
      const result = await IncidentDAO.updateIncident(id, incidentToUpdate);

      if (result) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Incident non trouvé ou non mis à jour' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE => remove a Incident
  static async deleteIncident(req: Request, res: Response) {
    try {
      const id = req.params.id;
      logger.info(`Suppression de l"incident' ${id}`);

      const success = await IncidentDAO.deleteIncident(id);

      if (success) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Incident non trouvé ou déjà supprimé' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  

}