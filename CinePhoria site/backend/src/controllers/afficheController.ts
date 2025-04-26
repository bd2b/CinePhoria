import { Request, Response } from 'express';
import { AfficheDAO } from '../dao/AfficheDAO';
import { AfficheDocument } from '../models/Affiche';
import logger from '../config/configLog';

const afficheDAO = new AfficheDAO();

export class AfficheController {
    /**
     * Crée un nouvel enregistrement Affiche
     * POST /api/affiches
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            logger.info("Appel Create")
            // Récupérer les données depuis req.body
            const { filmId, resolution, contentType } = req.body;

            // Validation minimale
            if (!filmId || !resolution || !contentType) {
                res.status(400).json({ message: 'Tous les champs (filmId, resolution, afficheFile, contentType) sont requis.' });
                return;
            }

            // Vérification de la présence d’un fichier dans req.files (express-fileupload)
            if (!req.files || !req.files.imageFile) {
                res.status(400).json({
                    message: 'Le champ file imageFile est requis (fichier).'
                });
                return;
            }

            // Convertir `req.files.imageFile` en Buffer
            const uploadedFile = req.files.imageFile;
            // `uploadedFile` peut être soit un tableau de fichiers, soit un seul fichier
            // si `multiple` upload n’est pas activé.
            // On suppose ici un unique fichier.
            if (Array.isArray(uploadedFile)) {
                res.status(400).json({ message: 'Un seul fichier attendu.' });
                return;
            }

            const fileBuffer = uploadedFile.data; // le Buffer du fichier
            const mimeType = uploadedFile.mimetype; // ex: 'image/jpeg'


            // Construction d'un objet partiel
            const afficheData: Partial<AfficheDocument> = {
                filmId,
                resolution: parseInt(resolution, 10),
                contentType: contentType || mimeType, // On peut prendre le mimetype si besoin
                imageFile: fileBuffer, // Stockage direct du buffer
            };

            // Appel au DAO
            const affiche = await afficheDAO.create(afficheData);

            res.status(201).json(affiche);
            return;
        } catch (error: any) {
            console.error('Erreur lors de la création de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }

    /**
     * Récupère toutes les affiches
     * GET /api/affiches
     */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const affiches = await afficheDAO.getAll();
            res.status(200).json(affiches);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des affiches :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }

    /**
     * Récupère une affiche par filmId
     * GET /api/affiches/:filmId
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { filmId } = req.params;
            if (!filmId) {
                res.status(400).json({ message: 'Paramètre filmId requis.' });
                return;
            }

            const affiche = await afficheDAO.getById(filmId);
            if (!affiche) {
                res.status(404).json({ message: `Aucune affiche trouvée pour filmId : ${filmId}` });
                return;
            }
            res.status(200).json(affiche);
        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }

    /**
     * Met à jour l'affiche pour un filmId donné
     * PUT /api/affiches/:filmId
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {

            // logger.info('BODY:', req.body);
            // logger.info('FILES:', req.files);

            const { filmId } = req.params;

            if (!filmId) {
                res.status(400).json({ message: 'Paramètre filmId requis.' });
                return;
            }
            // Données de mise à jour basées sur req.body
            const updateData: Partial<AfficheDocument> = {
                resolution: parseInt(req.body.resolution, 10),
                contentType: req.body.contentType
            };

            // Vérifier la présence d’un fichier dans req.files
            if (req.files && req.files.imageFile) {
                const uploadedFile = req.files.imageFile;
                if (Array.isArray(uploadedFile)) {
                    res.status(400).json({ message: 'Un seul fichier imageFile est attendu.' });
                    return;
                }

                // Récupération du buffer
                const fileBuffer = uploadedFile.data;
                updateData.imageFile = fileBuffer;

                // On peut prendre le mimetype du fichier si besoin
                const mimeType = uploadedFile.mimetype;
                if (!updateData.contentType) {
                    updateData.contentType = mimeType;
                }
            }


            const updated = await afficheDAO.update(filmId, updateData);
            if (!updated) {
                res.status(404).json({ message: `Aucune affiche trouvée pour filmId : ${filmId}` });
                return;
            }
            res.status(200).json(updated);
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }

    /**
     * Supprime l'affiche d'un film
     * DELETE /api/affiches/:filmId
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { filmId } = req.params;
            if (!filmId) {
                res.status(400).json({ message: 'Paramètre filmId requis.' });
                return;
            }

            const isDeleted = await afficheDAO.delete(filmId);
            if (!isDeleted) {
                res.status(404).json({ message: `Aucune affiche trouvée pour filmId : ${filmId}` });
                return;
            }
            res.status(204).send(); // Pas de contenu
        } catch (error: any) {
            console.error('Erreur lors de la suppression de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }

    static async getImageById(req: Request, res: Response): Promise<void> {
        try {
          const { filmId } = req.params;
          const affiche = await new AfficheDAO().getById(filmId);
          if (!affiche) {
            res.status(404).send('Affiche non trouvée');
            return;
          }
      
          res.setHeader('Content-Type', affiche.contentType);
          res.send(affiche.imageFile);
        } catch (error) {
          console.error("Erreur récupération affiche :", error);
          res.status(500).send("Erreur serveur");
        }
      }
}