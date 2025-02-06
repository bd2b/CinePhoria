import { seanceCardView, basculerPanelChoix, basculerPanelReserve, afficherDetailsFilm } from './ViewReservation.js';
import { ReservationState, dataController } from './DataController.js';
import { updateTableContent } from "./ViewReservationPlaces.js";

import { isUUID, validateEmail } from './Helpers.js';
import { TarifForSeats, ReservationForUtilisateur } from './shared-models/Reservation';
import { setReservationApi, confirmUtilisateurApi, confirmCompteApi, confirmReserveApi, getReservationApi } from './NetworkController.js';
import { userDataController, ProfilUtilisateur } from './DataControllerUser.js';
import { login } from './Login.js';


export async function updateDisplayReservation() {
    const reservationUUID = dataController.selectedReservationUUID;
    if (reservationUUID) {
        try {
            const reservation = (await getReservationApi(reservationUUID))[0];
            dataController.selectedFilmUUID = reservation.filmId || '';
            dataController.selectedSeanceUUID = reservation.seanceId;
            dataController.selectedSeanceDate = reservation.dateJour || new Date();

            // On masque la liste des films
            const listeFilms = document.querySelector(".reservation__listFilms") as HTMLDivElement;
            if (listeFilms) {
                listeFilms.style.display = 'none';
            }
            // On affiche le detail du film reservé
            afficherDetailsFilm();

            // On affiche le détail de la reservation
            basculerPanelReserve();
            afficherDetailsReservation(reservation);


        }
        catch (error) {
            console.log(error);
        }
    };
};

async function afficherDetailsReservation(reservation: ReservationForUtilisateur) {
    // Afficher la reservation selon la qualite
    const containerTable = document.querySelector('.commande__tabtarif');
    if (!containerTable) return;
    containerTable.innerHTML = '';

    const nodeTable = await updateTableContent("", true) as HTMLTableElement;
    containerTable.appendChild(nodeTable as Node);

    // Si pas de PMR on masque l'ensemble , sinon on affiche avec masquage des boutons
    if ( reservation.numberPMR === undefined || reservation.numberPMR === 0 ) {
        const numPMR = document.querySelector(".commande__pmr") as HTMLDivElement;
        numPMR.style.display = 'none';
    } else {
        const numaddPMR = document.querySelector(".num__add-pmr") as HTMLDivElement;
        const numremovePMR = document.querySelector(".num__remove-pmr") as HTMLDivElement;
        numaddPMR.style.display = 'none';
        numremovePMR.style.display = 'none';
        const numPmr = document.getElementById('num__pmr');
        if (numPmr) numPmr.textContent = String(reservation.numberPMR);
    }


    // Modification de l'invite pour le mail
    const inviteMail = document.getElementById("commande__mail-p");
    if (inviteMail) { 
        inviteMail.textContent = `Réservation prise avec le mail : ${reservation.email}`;
        // Masquage du champ input
        const inputMail = document.getElementById('commande__mail-input');
        if (inputMail) inputMail.style.display = 'none';
        const spanMail = document.getElementById('commande__mail-span');
        if (spanMail) spanMail.style.display = 'none';

    }

}

export async function modalConfirmUtilisateur() {

}