import { Request, Response } from 'express';
import { CinemaDAO } from '../dao/CinemaDAO';
import logger from '../config/configLog';

export class CinemaController {
  static async getAllCinemas(req: Request, res: Response) {
    try {
     
      const cinemas = await CinemaDAO.findAll();
      res.json(cinemas);
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}