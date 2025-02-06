var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { basculerPanelReserve, afficherDetailsFilm } from './ViewReservation.js';
import { dataController } from './DataController.js';
import { updateTableContent } from "./ViewReservationPlaces.js";
import { getReservationApi } from './NetworkController.js';
export function updateDisplayReservation() {
    return __awaiter(this, void 0, void 0, function* () {
        const reservationUUID = dataController.selectedReservationUUID;
        if (reservationUUID) {
            try {
                const reservation = (yield getReservationApi(reservationUUID))[0];
                dataController.selectedFilmUUID = reservation.filmId || '';
                dataController.selectedSeanceUUID = reservation.seanceId;
                dataController.selectedSeanceDate = reservation.dateJour || new Date();
                // On masque la liste des films
                const listeFilms = document.querySelector(".reservation__listFilms");
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
        }
        ;
    });
}
;
function afficherDetailsReservation(reservation) {
    return __awaiter(this, void 0, void 0, function* () {
        // Afficher la reservation selon la qualite
        const containerTable = document.querySelector('.commande__tabtarif');
        if (!containerTable)
            return;
        containerTable.innerHTML = '';
        const nodeTable = yield updateTableContent("", true);
        containerTable.appendChild(nodeTable);
        // Si pas de PMR on masque l'ensemble , sinon on affiche avec masquage des boutons
        if (reservation.numberPMR === undefined || reservation.numberPMR === 0) {
            const numPMR = document.querySelector(".commande__pmr");
            numPMR.style.display = 'none';
        }
        else {
            const numaddPMR = document.querySelector(".num__add-pmr");
            const numremovePMR = document.querySelector(".num__remove-pmr");
            numaddPMR.style.display = 'none';
            numremovePMR.style.display = 'none';
            const numPmr = document.getElementById('num__pmr');
            if (numPmr)
                numPmr.textContent = String(reservation.numberPMR);
        }
        // Modification de l'invite pour le mail
        const inviteMail = document.getElementById("commande__mail-p");
        if (inviteMail) {
            inviteMail.textContent = `Réservation prise avec le mail : ${reservation.email}`;
            // Masquage du champ input
            const inputMail = document.getElementById('commande__mail-input');
            if (inputMail)
                inputMail.style.display = 'none';
            const spanMail = document.getElementById('commande__mail-span');
            if (spanMail)
                spanMail.style.display = 'none';
        }
    });
}
export function modalConfirmUtilisateur() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
