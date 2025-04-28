"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfficheController = void 0;
const AfficheDAO_1 = require("../dao/AfficheDAO");
const configLog_1 = __importDefault(require("../config/configLog"));
const afficheDAO = new AfficheDAO_1.AfficheDAO();
class AfficheController {
    /**
     * Crée un nouvel enregistrement Affiche
     * POST /api/affiches
     */
    static async create(req, res) {
        try {
            configLog_1.default.info("Appel Create");
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
            const afficheData = {
                filmId,
                resolution: parseInt(resolution, 10),
                contentType: contentType || mimeType, // On peut prendre le mimetype si besoin
                imageFile: fileBuffer, // Stockage direct du buffer
            };
            // Appel au DAO
            const affiche = await afficheDAO.create(afficheData);
            res.status(201).json(affiche);
            return;
        }
        catch (error) {
            console.error('Erreur lors de la création de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    /**
     * Récupère toutes les affiches
     * GET /api/affiches
     */
    static async getAll(req, res) {
        try {
            const affiches = await afficheDAO.getAll();
            res.status(200).json(affiches);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des affiches :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    /**
     * Récupère une affiche par filmId
     * GET /api/affiches/:filmId
     */
    static async getById(req, res) {
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
        }
        catch (error) {
            console.error('Erreur lors de la récupération de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    /**
     * Met à jour l'affiche pour un filmId donné
     * PUT /api/affiches/:filmId
     */
    static async update(req, res) {
        try {
            // logger.info('BODY:', req.body);
            // logger.info('FILES:', req.files);
            const { filmId } = req.params;
            if (!filmId) {
                res.status(400).json({ message: 'Paramètre filmId requis.' });
                return;
            }
            // Données de mise à jour basées sur req.body
            const updateData = {
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
            let updated = await afficheDAO.update(filmId, updateData);
            if (!updated) {
                // On va creer l'affiche car il est possible que le film ait une image statique
                // que l'on doit substituer par une image mongo
                updated = await afficheDAO.create(updateData);
            }
            res.status(200).json(updated);
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    /**
     * Supprime l'affiche d'un film
     * DELETE /api/affiches/:filmId
     */
    static async delete(req, res) {
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
        }
        catch (error) {
            console.error('Erreur lors de la suppression de l\'affiche :', error.message);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    static async getImageById(req, res) {
        try {
            const { filmId } = req.params;
            const affiche = await new AfficheDAO_1.AfficheDAO().getById(filmId);
            if (!affiche) {
                res.status(404).send('Affiche non trouvée');
                return;
            }
            res.setHeader('Content-Type', affiche.contentType);
            res.send(affiche.imageFile);
        }
        catch (error) {
            console.error("Erreur récupération affiche :", error);
            res.status(500).send("Erreur serveur");
        }
    }
}
exports.AfficheController = AfficheController;
