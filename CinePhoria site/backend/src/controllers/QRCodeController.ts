import { Request, Response } from 'express';
import logger from '../config/configLog';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { QRCodeService } from '../services/QRCodeService';
import QRCode, { QRCodeDocument } from '../models/QRCode';
import { SeanceDAO } from '../dao/SeanceDAO';
import { ReservationDAO } from '../dao/ReservationDAO';
import { formatDateLocalYYYYMMDD } from '../shared-models/HelpersCommon';


const writeFileAsync = promisify(fs.writeFile);

export async function generateQRCode(textQRCode: string, reservationId: string, dateExpiration: Date) {
  // Utilisation de QRCodeService pour générer l'image

  const qrCodeBuffer = await QRCodeService.generateQRCodeWithImage(textQRCode);
  const qrCodeData: Partial<QRCodeDocument> = {
    reservationid: reservationId,
    dateExpiration: dateExpiration,
    qrCodeFile: qrCodeBuffer, // déjà un Buffer
    contentType: 'image/png'
  };

  const qrCodeDoc = new QRCode(qrCodeData);
  await qrCodeDoc.save();

  logger.info(`QR code enregistré avec l'ID : ${qrCodeDoc._id}`);




  const fileName = `qrcode-${Date.now()}.png`;
  const filePath = path.join(__dirname, '../../public/qrcodes', fileName);

  await writeFileAsync(filePath, qrCodeBuffer);

}

export async function createQRCode(reservationId: string): Promise<void> {
  try {
    // Récupération des réservations
    const reservations = await ReservationDAO.getReservationById(reservationId);
    if (!reservations || reservations.length === 0) {
      throw new Error(`Aucune réservation trouvée pour ${reservationId}`)
    }

    // Récupération de la la seanceFilmSalle
    const seanceId = reservations[0].seanceId || '';
    logger.info("seance = " + seanceId);
    const seances = await SeanceDAO.findById(seanceId);
    if (!seances || seances.length === 0) {
      
      throw new Error(`Aucune seance trouvée pour ${reservationId}`)
    }
    
    // Génération du text du QRCode
    let textQRCode = reservations[0].displayname + ",";
    textQRCode += seances[0].nameCinema + ",";
    textQRCode += seances[0].nameSalle + ",";
    textQRCode += reservations[0].titleFilm + ",";
    textQRCode += formatDateLocalYYYYMMDD(reservations[0].dateJour!) + ",";
    textQRCode += seances[0].hourBeginHHSMM + ",";
    textQRCode += reservations[0].totalSeats + " siège(s),";
    textQRCode += reservations[0].numberPMR + " placePMR";
    logger.info("Génération du QRCode " + textQRCode)

    // Calcul de la date d'exoiration qui est 1h après la date de début de séance
    const [hh, mm] = seances[0].hourBeginHHSMM!.split(':').map(Number);
    if (isNaN(hh) || isNaN(mm)) {
      throw new Error("Format d'heure invalide, attendu 'HH:MM'");
    }
    // Création de la date d'expiration
    const dateSeance = reservations[0].dateJour!;
    const dateExpiration = new Date(dateSeance.getFullYear(), dateSeance.getMonth(), dateSeance.getDate(), hh, mm);
    // Ajouter une heure
    dateExpiration.setHours(dateExpiration.getHours() + 1);

    logger.info("Date Seance = " + dateSeance + "heure = " + seances[0].hourBeginHHSMM!);
    logger.info("Date Expiration = " + dateExpiration);

    // Génération du QRCode
    await generateQRCode(textQRCode, reservationId, dateExpiration);
  } catch (error: any) {
    logger.error(`Erreur lors de la creation du QRCode ${error.message}`);
  }
}