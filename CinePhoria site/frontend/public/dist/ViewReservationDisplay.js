var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { seanceCardView, basculerPanelReserve, afficherDetailsFilm } from './ViewReservation.js';
import { dataController } from './DataController.js';
import { updateTableContent, confirmUtilisateur, confirmMail } from './ViewReservationPlaces.js';
import { ReservationState } from './shared-models/Reservation.js';
import { cancelReserveApi, getReservationApi } from './NetworkController.js';
import { login } from './Login.js';
// import { DatasetController } from 'chart';
export function updateDisplayReservation() {
    return __awaiter(this, void 0, void 0, function* () {
        const reservationUUID = dataController.selectedReservationUUID;
        if (reservationUUID) {
            try {
                const reservation = (yield getReservationApi(reservationUUID))[0];
                dataController.selectedFilmUUID = reservation.filmId || '';
                dataController.selectedSeanceUUID = reservation.seanceId;
                console.log("Date reservation = ", reservation.dateJour);
                const datePure = reservation.dateJour ? new Date(reservation.dateJour) : new Date();
                dataController.selectedSeanceDate = datePure;
                // 1) Mettre à jour le bloc .seances__cardseance seances__cardseance-selected pour afficher la séance choisie
                const containerSelectedSeance = document.getElementById('seances__cardseance-selected');
                if (!containerSelectedSeance) {
                    console.log("Pas de carte selectionnée");
                    return;
                }
                yield dataController.updateSeances([dataController.selectedSeanceUUID]);
                const selectedSeance = seanceCardView(dataController.seanceSelected(), dataController.selectedSeanceDate, "seances__cardseance-selected");
                containerSelectedSeance.replaceWith(selectedSeance);
                // 2) On masque la liste des films
                const listeFilms = document.querySelector(".reservation__listFilms");
                if (listeFilms) {
                    listeFilms.style.display = 'none';
                }
                // 3) On affiche le detail du film reservé
                afficherDetailsFilm();
                // On affiche le détail de la reservation dans le panel reserve
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
export function afficherDetailsReservation(reservation) {
    return __awaiter(this, void 0, void 0, function* () {
        const containerTable = document.querySelector('.commande__tabtarif');
        if (!containerTable)
            return;
        containerTable.innerHTML = '';
        // Affichage du tableau de la reservation
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
        // Si pas de siege reservé on masque l'ensemble , sinon on affiche les sieges
        const seatsBooked = reservation.seatsReserved || dataController.selectedListSeats || '';
        const seatsBookedDiv = document.querySelector(".commande__seats");
        console.log("+++++++++++//////////");
        if (seatsBooked == '') {
            seatsBookedDiv.style.display = 'none';
        }
        else {
            const listSeatsSpan = document.getElementById("text__seats");
            listSeatsSpan.textContent = seatsBooked;
            seatsBookedDiv.style.display = 'flex';
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
        // Récupération du message de statut sur la reservation
        const messageStatut = document.getElementById("statutMessage");
        // Le bouton "Changer de séance" est pour annuler la reservation
        const btnChanger = document.querySelector('.panel__changer-button');
        if (btnChanger) {
            btnChanger.textContent = "Annuler la reservation";
            btnChanger.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
            btnChanger.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                evt.preventDefault();
                evt.stopPropagation();
                // Annulation
                const result = yield cancelReserveApi(dataController.selectedReservationUUID || '');
                if (result.result === 'OK') {
                    dataController.reservationState = ReservationState.PendingChoiceSeance;
                    dataController.sauverComplet();
                    // On recharge la page
                    window.location.reload();
                    alert("La reservation est annulée");
                }
                else {
                    console.log("Resultat de l'annulation : ", result.message);
                }
            }));
        }
        if (messageStatut) {
            messageStatut.style.display = 'flex';
            if (dataController.reservationState === ReservationState.ReserveCompteToConfirm) {
                messageStatut.innerHTML = '<p>Vous devez finaliser la creation de votre compte</p>';
                // Le bouton action est confirmer la creation du compte
                // Gestion du bouton de reservation
                const btnConfirm = document.querySelector('.panel__jereserve-button');
                if (!btnConfirm)
                    return;
                // Le bouton est initialement actif
                btnConfirm.classList.remove("inactif");
                btnConfirm.disabled = false;
                btnConfirm.textContent = "Finaliser le compte";
                btnConfirm.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
                btnConfirm.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                    evt.preventDefault();
                    evt.stopPropagation();
                    yield dataController.sauverEtatGlobal();
                    yield confirmUtilisateur();
                }));
            }
            else if (dataController.reservationState === ReservationState.ReserveMailToConfirm) {
                messageStatut.innerHTML = '<p>Vous devez proceder à la vérification de votre email</p>';
                // Le bouton action est confirmer la creation du compte
                // Gestion du bouton de reservation
                const btnConfirm = document.querySelector('.panel__jereserve-button');
                if (!btnConfirm)
                    return;
                // Le bouton est initialement actif
                btnConfirm.classList.remove("inactif");
                btnConfirm.disabled = false;
                btnConfirm.textContent = "Vérifier votre email";
                btnConfirm.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
                btnConfirm.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                    evt.preventDefault();
                    evt.stopPropagation();
                    dataController.sauverComplet();
                    yield confirmMail();
                }));
            }
            else if (dataController.reservationState === ReservationState.ReserveToConfirm) {
                messageStatut.innerHTML = '<p>Vous devez vous connecter pour confirmer la reservation</p>';
                // Le bouton action est confirmer la creation du compte
                // Gestion du bouton de reservation
                const btnConfirm = document.querySelector('.panel__jereserve-button');
                if (!btnConfirm)
                    return;
                // Le bouton est initialement actif
                btnConfirm.classList.remove("inactif");
                btnConfirm.disabled = false;
                btnConfirm.textContent = "Connexion";
                btnConfirm.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
                btnConfirm.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                    evt.preventDefault();
                    evt.stopPropagation();
                    dataController.sauverComplet();
                    yield login("Veuillez vous connecter pour valider la réservation");
                }));
            }
        }
    });
}
export function modalConfirmUtilisateur() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
