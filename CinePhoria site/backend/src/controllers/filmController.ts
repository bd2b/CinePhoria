import { Request, Response } from 'express';
import { FilmDAO } from '../dao/FilmDAO';
import logger from '../config/configLog';
import { Film } from "../shared-models/Film";
import { MajSite } from '../shared-models/MajSite';
import { AuthDAO } from '../dao/AuthDAO';
import { AuthController } from './authController';

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

  static async getFilmByUtilisateurId(req: Request, res: Response) {
    try {
      const films = await FilmDAO.findByUtilisateurId(req.params.utilisateurId);
    //   if (!film) {
    //     return res.status(404).json({ message: 'Film non trouvé' });
    //   }
      res.json(films);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSortiesDeLaSemaine(req: Request, res: Response) {
    try {
     
      const films = await FilmDAO.findSortiesDeLaSemaine();
      res.json(films);
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // POST => create a Film
  static async createFilm(req: Request, res: Response) {
    try {
      // On récupère les données dans req.body
      // ex: {titleFilm, filmPitch, genreArray, ...}
      const data = req.body; 
      logger.info("Creation d'un film avec data = ", data);

      // On construit un Film
      const filmToCreate = new Film(data);
      // Appel du DAO
      const newId = await FilmDAO.createFilm(filmToCreate);

      // On push une version 
      await AuthController.simplePushVersion(`Film cree = ${filmToCreate.titleFilm}`)

      // On renvoie l’ID ou un message
      res.status(201).json({ message: 'OK', id: newId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT => update a Film
  static async updateFilm(req: Request, res: Response) {
    try {
      const filmId = req.params.id;
      const data = req.body;
      logger.info(`Mise à jour du film ${filmId} avec data=`, data);

      const filmToUpdate = new Film(data);
      const result = await FilmDAO.updateFilm(filmId, filmToUpdate);

      if (result) {
        // On push une version 
        await AuthController.simplePushVersion(`Film mis à jour = ${filmToUpdate.titleFilm}`)
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Film non trouvé ou non mis à jour' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE => remove a Film
  static async deleteFilm(req: Request, res: Response) {
    try {
      const filmId = req.params.id;
      logger.info(`Suppression du film ${filmId}`);

      const success = await FilmDAO.deleteFilm(filmId);

      if (success) {
        res.json({ message: 'OK' });
      } else {
        res.status(404).json({ message: 'Erreur: Film non trouvé ou déjà supprimé' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  

}