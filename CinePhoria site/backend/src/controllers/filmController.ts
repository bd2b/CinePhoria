import { Request, Response } from 'express';
import { FilmDAO } from '../dao/FilmDAO';
import logger from '../config/configLog';

export class FilmController {
  static async getAllFilms(req: Request, res: Response) {
    try {
     
      const films = await FilmDAO.findAll();
      res.json(films);
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  static async getFilmById(req: Request, res: Response) {
    try {
      const film = await FilmDAO.findById(req.params.id);
    //   if (!film) {
    //     return res.status(404).json({ message: 'Film non trouvé' });
    //   }
      res.json(film);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}