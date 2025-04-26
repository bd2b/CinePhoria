"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQRCode = createQRCode;
exports.deleteQRCode = deleteQRCode;
exports.getQRCodeImage = getQRCodeImage;
const configLog_1 = __importDefault(require("../config/configLog"));
const fs = __importStar(require("fs"));
const util_1 = require("util");
const QRCodeService_1 = require("../services/QRCodeService");
const QRCode_1 = __importDefault(require("../models/QRCode"));
const SeanceDAO_1 = require("../dao/SeanceDAO");
const ReservationDAO_1 = require("../dao/ReservationDAO");
const QRCodeDAO_1 = require("../dao/QRCodeDAO");
const writeFileAsync = (0, util_1.promisify)(fs.writeFile);
async function generateQRCode(textQRCode, reservationId, dateExpiration) {
    // Stockage du QRCode dans Mongo, fonction interne au controller
    const qrCodeBuffer = await QRCodeService_1.QRCodeService.generateQRCodeWithImage(textQRCode);
    const qrCodeData = {
        reservationid: reservationId,
        dateExpiration: dateExpiration,
        qrCodeFile: qrCodeBuffer, // déjà un Buffer
        contentType: 'image/png'
    };
    const qrCodeDoc = new QRCode_1.default(qrCodeData);
    await qrCodeDoc.save();
    configLog_1.default.info(`QR code enregistré avec l'ID : ${qrCodeDoc._id}`);
    // Creation dans un fichier
    // const fileName = `qrcode-${Date.now()}.png`;
    // const filePath = path.join(__dirname, '../../public/qrcodes', fileName);
    // await writeFileAsync(filePath, qrCodeBuffer);
}
async function createQRCode(reservationId) {
    // Création du QRCode avec les informations récupérées à partir de la reservation
    // Appel à la sauvegarde dans MongoDB
    try {
        // Récupération des réservations
        const reservations = await ReservationDAO_1.ReservationDAO.getReservationById(reservationId);
        if (!reservations || reservations.length === 0) {
            throw new Error(`Aucune réservation trouvée pour ${reservationId}`);
        }
        // Récupération de la la seanceFilmSalle
        const seanceId = reservations[0].seanceId || '';
        configLog_1.default.info("seance = " + seanceId);
        const seances = await SeanceDAO_1.SeanceDAO.findByIds('"' + seanceId + '"');
        if (!seances || seances.length === 0) {
            throw new Error(`Aucune seance trouvée pour ${reservationId}`);
        }
        // Génération du text du QRCode
        let textQRCode = reservations[0].displayname + ",";
        textQRCode += seances[0].nameCinema + ",";
        textQRCode += seances[0].nameSalle + ",";
        textQRCode += reservations[0].titleFilm + ",";
        textQRCode += reservations[0].dateJour + ",";
        // textQRCode += formatDateLocalYYYYMMDD(reservations[0].dateJour!) + ",";
        textQRCode += seances[0].hourBeginHHSMM + ",";
        textQRCode += reservations[0].totalSeats + " siège(s),";
        if (reservations[0].seatsReserved && reservations[0].seatsReserved !== '') {
            textQRCode += reservations[0].seatsReserved + ",";
        }
        textQRCode += reservations[0].numberPMR + " placePMR";
        configLog_1.default.info("Génération du QRCode " + textQRCode);
        // Calcul de la date d'exoiration qui est 1h après la date de début de séance
        const [hh, mm] = seances[0].hourBeginHHSMM.split(':').map(Number);
        if (isNaN(hh) || isNaN(mm)) {
            throw new Error("Format d'heure invalide, attendu 'HH:MM'");
        }
        // Création de la date d'expiration
        // Modif à tester
        const dateSeance = new Date(reservations[0].dateJour);
        const dateExpiration = new Date(dateSeance.getFullYear(), dateSeance.getMonth(), dateSeance.getDate(), hh, mm);
        // Ajouter une heure
        dateExpiration.setHours(dateExpiration.getHours() + 1);
        configLog_1.default.info("Date Seance = " + dateSeance + "heure = " + seances[0].hourBeginHHSMM);
        configLog_1.default.info("Date Expiration = " + dateExpiration);
        // Génération du QRCode
        configLog_1.default.info("QRCode = " + textQRCode + reservationId + dateExpiration);
        await generateQRCode(textQRCode, reservationId, dateExpiration);
    }
    catch (error) {
        configLog_1.default.error(`Erreur lors de la creation du QRCode ${error.message}`);
    }
}
async function deleteQRCode(reservationId) {
    // Suppression du document QRCode
    try {
        return await new QRCodeDAO_1.QRCodeDAO().delete(reservationId);
    }
    catch (error) {
        configLog_1.default.error(`Erreur lors de la suppression du QRCode ${error.message}`);
    }
}
async function getQRCodeImage(reservationId) {
    // Suppression du document QRCode
    try {
        return await new QRCodeDAO_1.QRCodeDAO().getById(reservationId) || undefined;
    }
    catch (error) {
        configLog_1.default.error(`Erreur lors de la suppression du QRCode ${error.message}`);
    }
}
