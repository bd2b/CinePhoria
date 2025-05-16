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

import { QRCodeDAO } from '../dao/QRCodeDAO';

import { urlString } from '../config/config'


const writeFileAsync = promisify(fs.writeFile);

async function generateQRCode(textQRCode: string, reservationId: string, dateExpiration: Date) {
  // Stockage du QRCode dans Mongo, fonction interne au controller

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
  // Creation dans un fichier
  // const fileName = `qrcode-${Date.now()}.png`;
  // const filePath = path.join(__dirname, '../../public/qrcodes', fileName);

  // await writeFileAsync(filePath, qrCodeBuffer);

}

export async function createQRCode(reservationId: string): Promise<void> {
  // Création du QRCode avec les informations récupérées à partir de la reservation
  // Appel à la sauvegarde dans MongoDB
  try {
    // Récupération des réservations
    
    const reservations = await ReservationDAO.getReservationById(reservationId);
    if (!reservations || reservations.length === 0) {
      throw new Error(`Aucune réservation trouvée pour ${reservationId}`)
    }
    
    // Récupération de la la seanceFilmSalle
    const seanceId = reservations[0].seanceId || '';
    logger.info("seance = " + seanceId);
    const seances = await SeanceDAO.findByIds('"'+seanceId+'"');
    
    if (!seances || seances.length === 0) {

      throw new Error(`Aucune seance trouvée pour ${reservationId}`)
    }

    // Génération du text du QRCode
    let textQRCode = urlString + "/viewqrcode.html?displayName=" + reservations[0].displayName + "&";
    textQRCode += "nameCinema=" + seances[0].nameCinema + "&";
    textQRCode += "nameSalle=" + seances[0].nameSalle + "&";
    textQRCode += "titleFilm=" + reservations[0].titleFilm + "&";
    textQRCode += "dateJour=" + reservations[0].dateJour! + "&";
    textQRCode += "qualite=" + seances[0].qualite + "&";
    textQRCode += "bo=" + seances[0].bo + "&";
    // textQRCode += formatDateLocalYYYYMMDD(reservations[0].dateJour!) + ",";
    textQRCode += "hourBeginHHSMM=" + seances[0].hourBeginHHSMM + "&";
    textQRCode += "totalSeats=" + reservations[0].totalSeats + "&";
    if (reservations[0].seatsReserved && reservations[0].seatsReserved !== '') {
      textQRCode += "seatsReserved=" + reservations[0].seatsReserved + "&";
    }
    textQRCode += "numberPMR=" + reservations[0].numberPMR;
    logger.info("Génération du QRCode " + textQRCode)

    // Calcul de la date d'exoiration qui est 1h après la date de début de séance
    const [hh, mm] = seances[0].hourBeginHHSMM!.split(':').map(Number);
    if (isNaN(hh) || isNaN(mm)) {
      throw new Error("Format d'heure invalide, attendu 'HH:MM'");
    }
    // Création de la date d'expiration
    // Modif à tester
    const dateSeance = new Date(reservations[0].dateJour!);
    const dateExpiration = new Date(dateSeance.getFullYear(), dateSeance.getMonth(), dateSeance.getDate(), hh, mm);
    // Ajouter une heure
    dateExpiration.setHours(dateExpiration.getHours() + 1);

    logger.info("Date Seance = " + dateSeance + "heure = " + seances[0].hourBeginHHSMM!);
    logger.info("Date Expiration = " + dateExpiration);

    // Génération du QRCode
    logger.info("QRCode = " + textQRCode + reservationId + dateExpiration)
    await generateQRCode(textQRCode, reservationId, dateExpiration);
  } catch (error: any) {
    logger.error(`Erreur lors de la creation du QRCode ${error.message}`);
  }
}


export async function deleteQRCode(reservationId: string): Promise<boolean | undefined> {
  // Suppression du document QRCode
  try {
    return await new QRCodeDAO().delete(reservationId);
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression du QRCode ${error.message}`);
  }
}

export async function getQRCodeImage(reservationId: string): Promise<QRCodeDocument | undefined> {
  // Suppression du document QRCode
  try {
    return await new QRCodeDAO().getById(reservationId) || undefined;
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression du QRCode ${error.message}`);
  }
}

