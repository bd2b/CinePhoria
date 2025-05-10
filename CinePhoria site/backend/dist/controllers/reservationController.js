"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationController = void 0;
const configLog_1 = __importDefault(require("../config/configLog"));
const ReservationDAO_1 = require("../dao/ReservationDAO");
const Reservation_1 = require("../shared-models/Reservation");
const UtilisateurDAO_1 = require("../dao/UtilisateurDAO");
const MailNetwork_1 = require("../services/MailNetwork");
const QRCodeController_1 = require("../controllers/QRCodeController");
class ReservationController {
    static async createReservation(req, res) {
        try {
            const { email, seanceId, tarifSeats, pmrSeats, seatsReserved } = req.body;
            // Validation des données d'entrée
            if (!email || !seanceId || !tarifSeats || pmrSeats === undefined || seatsReserved === undefined) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour exécuter la procédure stockée
            const result = await ReservationDAO_1.ReservationDAO.checkAvailabilityAndReserve(email, seanceId, tarifSeats, pmrSeats, seatsReserved);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
            }
            else {
                const codesConfirm = await UtilisateurDAO_1.UtilisateurDAO.getCodeConfirm(email, 'create');
                if (codesConfirm.length === 0) {
                    configLog_1.default.error("Erreur dans la récupération de code");
                }
                else {
                    // Envoie du mail
                    const statutMail = await MailNetwork_1.MailNetwork.sendMailCodeConfirm(email, codesConfirm[0].codeConfirm);
                    if (!statutMail.startsWith('OK'))
                        res.status(500).json({ message: "Erreur sur l'envoi du code de vérification de mail " + statutMail });
                } // else on ne fait rien le compte est confirmé
                // Retour des résultats
                const [statut, utilisateurId, reservationId] = result.split(',');
                res.status(201).json({ statut, utilisateurId, reservationId });
                configLog_1.default.info("Resultat =", [statut, utilisateurId, reservationId]);
            }
        }
        catch (error) {
            console.error('Erreur dans createReservation:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    static async setReservationStateById(req, res) {
        try {
            // Récupération des paramètres de la requête
            const { reservationId, stateReservation } = req.body;
            // Vérification des entrées
            if (!reservationId || !stateReservation) {
                res.status(400).json({ message: `L'ID de la réservation et l'état sont requis.` });
                return;
            }
            // Vérification si stateReservation est une valeur valide de l'ENUM
            if (!Object.values(Reservation_1.ReservationState).includes(stateReservation)) {
                res.status(400).json({ message: `Valeur de l'état non conforme: ${stateReservation}` });
                return;
            }
            // Appel au DAO pour mettre à jour l'état de la réservation
            const updateSuccess = await ReservationDAO_1.ReservationDAO.setReservationStateById(reservationId, stateReservation);
            // Gestion du résultat
            if (updateSuccess) {
                res.status(200).json({ message: `L'état de la réservation ${reservationId} a été mis à jour avec succès.` });
                configLog_1.default.info(`setReservationStateById: Réservation ${reservationId} mise à jour avec état "${stateReservation}".`);
            }
            else {
                res.status(404).json({ message: `Aucune réservation trouvée pour ${reservationId}.` });
                configLog_1.default.warn(`setReservationStateById: Échec de mise à jour, réservation ${reservationId} introuvable.`);
            }
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la mise à jour de la réservation ${req.body.reservationId}: ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    static async setReservationEvaluationById(req, res) {
        try {
            // Récupération des paramètres de la requête
            const { reservationId, note, evaluation, isEvaluationMustBeReview } = req.body;
            // Vérification des entrées
            if (!reservationId || !note || !isEvaluationMustBeReview) {
                res.status(400).json({ message: `L'ID de la réservation et les parametres sont requis.` });
                return;
            }
            // Vérification si la note est valide
            if (![0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(note)) {
                res.status(400).json({ message: `Valeur de la note non conforme: ${note}` });
                return;
            }
            // Appel au DAO pour mettre à jour l'état de la réservation
            const updateSuccess = await ReservationDAO_1.ReservationDAO.setReservationEvaluationById(reservationId, note, evaluation, isEvaluationMustBeReview);
            // Gestion du résultat
            if (updateSuccess) {
                res.status(200).json({ message: `L'evaluation de la réservation ${reservationId} a été mis à jour avec succès.` });
                configLog_1.default.info(`setReservationEvaluationById: Evaluation de réservation ${reservationId} mise à jour avec succes.`);
            }
            else {
                res.status(404).json({ message: `Aucune réservation trouvée pour ${reservationId}.` });
                configLog_1.default.warn(`setReservationEvaluationById: Échec de mise à jour, réservation ${reservationId} introuvable.`);
            }
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la mise à jour de la réservation ${req.body.reservationId}: ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    static async getSeatsForReservation(req, res) {
        try {
            // Recuperation de l'ID de la reservation
            const reservationId = req.params.reservationid?.trim();
            if (!reservationId) {
                res.status(400).json({ message: `L'ID de la réservation est requis.` });
                return;
            }
            // Récupération des places
            const seats = await ReservationDAO_1.ReservationDAO.getSeatsForReservation(reservationId);
            if (!seats || seats.length === 0) {
                res.status(404).json({ message: `Aucune place trouvée pour la reservation ${reservationId}` });
                return;
            }
            res.status(200).json(seats);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des places d'une réservation : ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    static async getSeatsForTarif(req, res) {
        res.status(501).json({ message: 'Non implémenté.' });
    }
    static async confirmReservation(req, res) {
        try {
            const { reservationId, utilisateurId, seanceId } = req.body;
            const { user } = req;
            if (user) {
                configLog_1.default.info("Compte récupéré = ", user);
            }
            // Validation des données d'entrée
            if (!reservationId || !utilisateurId || !seanceId) {
                if (!res.headersSent)
                    res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Exécution du DAO
            const result = await ReservationDAO_1.ReservationDAO.confirmReserve(reservationId, utilisateurId, seanceId);
            configLog_1.default.info("Résultat retour du DAO:", JSON.stringify(result));
            // ✅ Vérification avant d'envoyer une réponse pour éviter "Cannot set headers after they are sent"
            if (res.headersSent) {
                configLog_1.default.warn("Tentative d'envoi d'une réponse après que les headers ont déjà été envoyés.");
                return;
            }
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
                configLog_1.default.error(`Échec de l'opération: ${result}`);
            }
            else if (result === "OK") {
                // On créé le QRCode
                await (0, QRCodeController_1.createQRCode)(reservationId);
                res.status(201).json({ result: "OK" });
                configLog_1.default.info("Opération réussie.");
            }
            else if (result.startsWith('Warning')) {
                // On créé le QRCode
                await (0, QRCodeController_1.createQRCode)(reservationId);
                res.status(201).json({ result: "Warning", message: result });
                configLog_1.default.warn(`Avertissement: ${result}`);
            }
            else {
                res.status(500).json({ message: "Réponse inattendue du serveur." });
                configLog_1.default.error(`Réponse inattendue: ${result}`);
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans confirmReservation:', error);
            // Vérifier avant d'envoyer une réponse pour éviter les erreurs HTTP
            if (!res.headersSent) {
                res.status(500).json({ message: 'Erreur interne du serveur.' });
            }
        }
    }
    static async cancelReservation(req, res) {
        try {
            const { reservationId } = req.body;
            // Validation des données d'entrée
            if (!reservationId) {
                res.status(400).json({ message: 'Données manquantes ou invalides.' });
                return;
            }
            // Appel au DAO pour exécuter la procédure stockée
            const result = await ReservationDAO_1.ReservationDAO.cancelReserve(reservationId);
            // Gestion du résultat
            if (result.startsWith('Erreur')) {
                res.status(400).json({ message: result });
                configLog_1.default.error(`Échec de l'opération: ${result}`);
            }
            else if (result === "OK") {
                // Suppression du QRCode
                if (!(await (0, QRCodeController_1.deleteQRCode)(reservationId)))
                    configLog_1.default.error("Erreur sur la suppression du QRCode");
                res.status(201).json({ result: "OK" });
                configLog_1.default.info("Opération réussie.");
            }
            else if (result.startsWith('Warning')) {
                if (!(await (0, QRCodeController_1.deleteQRCode)(reservationId)))
                    configLog_1.default.error("Erreur sur la suppression du QRCode");
                res.status(201).json({ result: "Warning", message: result });
                configLog_1.default.warn(`Avertissement: ${result}`);
            }
            else {
                res.status(500).json({ message: "Réponse inattendue du serveur." });
                configLog_1.default.error(`Réponse inattendue: ${result}`);
            }
        }
        catch (error) {
            console.error('Erreur dans cancelReservation:', error);
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
    static async getReservationForUtilisateur2(req, res) {
        try {
            // Récupération de l'ID utilisateur
            const utilisateurId = req.params.utilisateurId?.trim();
            if (!utilisateurId) {
                res.status(400).json({ message: `L'ID utilisateur est requis.` });
                return;
            }
            // Récupération des réservations
            const reservations = await ReservationDAO_1.ReservationDAO.reserveForUtilisateur(utilisateurId);
            if (!reservations || reservations.length === 0) {
                res.status(404).json({ message: `Aucune réservation trouvée pour ${utilisateurId}` });
                return;
            }
            res.status(200).json(reservations);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des réservations: ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    static async getReservationForUtilisateur(req, res) {
        try {
            // Récupération de l'ID utilisateur
            const utilisateurId = req.params.utilisateurId?.trim();
            if (!utilisateurId) {
                res.status(400).json({ message: `L'ID utilisateur est requis.` });
                return;
            }
            // Récupération des réservations
            const reservations = await ReservationDAO_1.ReservationDAO.reserveForUtilisateur(utilisateurId);
            if (!reservations || reservations.length === 0) {
                res.status(404).json({ message: `Aucune réservation trouvée pour ${utilisateurId}` });
                return;
            }
            res.status(200).json(reservations);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des réservations: ${error.message}`);
            if (!res.headersSent) { // ✅ Vérifie si une réponse a déjà été envoyée
                res.status(500).json({ error: "Erreur interne du serveur." });
            }
        }
    }
    static async getReservationForUtilisateurMobile(req, res) {
        try {
            // Récupération de l'ID utilisateur
            const email = req.params.email?.trim();
            if (!email) {
                res.status(400).json({ message: `Le mail de l'utilisateur est requis.` });
                return;
            }
            // Récupération des réservations
            const reservations = await ReservationDAO_1.ReservationDAO.reserveForUtilisateurMobile(email);
            if (!reservations || reservations.length === 0) {
                res.status(404).json({ message: `Aucune réservation mobile trouvée pour ${email}` });
                return;
            }
            res.status(200).json(reservations);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des réservations mobile: ${error.message}`);
            if (!res.headersSent) { // ✅ Vérifie si une réponse a déjà été envoyée
                res.status(500).json({ error: "Erreur interne du serveur." });
            }
        }
    }
    static async getReservationsByCinemas(req, res) {
        try {
            // Vérification et conversion de cinemasList en string
            const cinemasList = req.query.cinemasList;
            if (!cinemasList || typeof cinemasList !== 'string') {
                return res.status(400).json({ message: `cinemasList doit être une chaîne de caractères : ${cinemasList}` });
            }
            const seances = await ReservationDAO_1.ReservationDAO.getReservationsByCinemas(cinemasList);
            res.json(seances);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // SELECT => select a Reservation
    static async getReservationById(req, res) {
        try {
            // Recuperation de l'ID de la reservation
            const reservationId = req.params.reservationid?.trim();
            if (!reservationId) {
                res.status(400).json({ message: `L'ID de la réservation est requis.` });
                return;
            }
            // Récupération des réservations
            const reservations = await ReservationDAO_1.ReservationDAO.getReservationById(reservationId);
            if (!reservations || reservations.length === 0) {
                res.status(404).json({ message: `Aucune réservation trouvée pour ${reservationId}` });
                return;
            }
            res.status(200).json(reservations);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des réservations: ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    // PUT => update a Reservation
    static async updateReservationAvis(req, res) {
        try {
            const reservationid = req.params.reservationid;
            const data = req.body;
            configLog_1.default.info(req.body);
            const reservationAvisToUpdate = {
                id: reservationid,
                evaluation: typeof data.evaluation === 'string' ? data.evaluation : '',
                isEvaluationMustBeReview: Boolean(data.isEvaluationMustBeReview),
                note: data.note === null || typeof data.note === 'number' ? data.note : null
            };
            configLog_1.default.info(`Mise à jour de l'avis ${reservationid} avec data = ${JSON.stringify(reservationAvisToUpdate)}`);
            // const reservationAvisToUpdate = data;
            const result = await ReservationDAO_1.ReservationDAO.updateReservationAvis(reservationid, reservationAvisToUpdate);
            if (result) {
                res.json({ message: 'OK' });
            }
            else {
                res.status(404).json({ message: 'Erreur: Reservation non trouvée, avis non mis à jour' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // API Rest pour tester la création de QRCode
    static async getQRCode(req, res) {
        try {
            // Recuperation de l'ID de la reservation
            const reservationId = req.params.reservationid?.trim();
            if (!reservationId) {
                res.status(400).json({ message: `L'ID de la réservation est requis.` });
                return;
            }
            await (0, QRCodeController_1.createQRCode)(reservationId);
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération des places d'une réservation : ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    // API Rest pour récupérer le QRCode image
    static async getQRCodeImage(req, res) {
        try {
            // Recuperation de l'ID de la reservation
            const reservationId = req.params.reservationid?.trim();
            if (!reservationId) {
                res.status(400).json({ message: `L'ID de la réservation est requis.` });
                return;
            }
            const qrCodeDoc = await (0, QRCodeController_1.getQRCodeImage)(reservationId);
            if (qrCodeDoc) {
                res.json({
                    reservationid: qrCodeDoc.reservationid,
                    dateExpiration: qrCodeDoc.dateExpiration,
                    qrCodeFile: qrCodeDoc.qrCodeFile.toJSON().data, // Conversion explicite ici
                    contentType: qrCodeDoc.contentType
                });
            }
            else {
                res.status(404).json({ message: 'QR Code non trouvé' });
            }
            return;
        }
        catch (error) {
            configLog_1.default.error(`Erreur lors de la récupération de l'image : ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur." });
        }
    }
    static async getReservationStatsAll(req, res) {
        try {
            const reservationStats = await ReservationDAO_1.ReservationDAO.getReservationStatsAll();
            res.json(reservationStats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ;
}
exports.ReservationController = ReservationController;
