var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCookie, setCookie } from './Helpers.js';
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD, isUUID } from './Helpers.js';
import { DataController, ReservationState } from './DataController.js';
// Persistence des données 
let dataController;
/** Chargement ou raffraichissement de la page
 * Au premier chargement une fenetre modale permet de choisir un site, dans ce cas le cookie selectedCinema est positionné avec la valeur choisie
 * Aux chargements on recupère la valeur du cookie
 * On peut changer cette valeur via le dropdown button droit sur le titre
 */
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Traitement de DOMContentLoaded");
    /**
     * Initialisation
     */
    const modal = document.getElementById('modal');
    const dropdownButtons = document.querySelectorAll('.titre__filter-dropdown-complexe');
    const dropdownContents = document.querySelectorAll('.title__filter-button-drowdown-content-complexe');
    const titleLeft = document.getElementById('titleLeft');
    // Fonction de mise à jour l'affichage du bouton du dropdown
    function updateDropdownDisplay(textButton) {
        dropdownButtons.forEach((button) => {
            button.innerHTML = `${textButton} <span class="chevron">▼</span>`;
        });
    }
    // Vérifier si le cookie 'selectedCinema' existe
    let selectedCinema = getCookie('selectedCinema');
    if (!selectedCinema) {
        // Le cookie n'existe pas : on affiche la modale avec l'invite à sélectionner un cinema
        // On construit la page sur le cinema de Paris pour avoir un contenu grisé attrayant
        if (modal) {
            // Mise à jour du titre pour selectionnez un cinema
            updateDropdownDisplay('Selectionnez un cinema');
            modal.classList.add('show'); // Afficher la modale
            // On se positionne sur Paris pour avoir un affichage valide
            dataController = new DataController("Paris");
            yield dataController.chargerDepuisAPI();
        }
    }
    else {
        // Le cookie existe on initialise le dataController
        dataController = new DataController(selectedCinema);
        // Chargement des données via API si la restore du cache ne s'est pas faite dans l'initialisation
        if (dataController.allSeances.length === 0) {
            yield dataController.chargerDepuisAPI();
        }
        // Mettre à jour l'affichage initial du dropdown sur le composant titre
        updateDropdownDisplay("Changer de cinema");
        // Mise à jour du titre
        if (titleLeft) {
            titleLeft.innerText = `Réservez au CinePhoria de ${selectedCinema}`;
        }
    }
    // Identifier le film par defaut dans le cas où on n'affiche pour la première fois le contenu de la page
    const filmSeancesCandidat = trouverFilmSeancesCandidat(dataController);
    if (!filmSeancesCandidat[0].filmId)
        return;
    // Mettre a jour le film selection dans le dataController
    dataController.selectedFilmUUID = filmSeancesCandidat[0].filmId;
    // Mise a jour de la page
    yield updateContentPage(dataController);
    // Verification dataController
    console.log(`dataController.nameCinema = ${dataController.nameCinema} nombre de séances = ${dataController.allSeances.length}`);
    // Définitiion des interactions dans les dropdowns de selection de cinema (celui de la modale ou celui du titre droit)
    dropdownContents.forEach((content) => {
        const links = content.querySelectorAll('a');
        links.forEach((link) => {
            link.addEventListener('click', (event) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                event.preventDefault();
                const cinema = (_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                if (cinema) {
                    console.log("1 - Nouvelle valeur de cinema = ", cinema);
                    // Stocker dans le cookie pour 30 jours
                    setCookie('selectedCinema', cinema, 30);
                    // Mettre à jour l'affichage du bouton
                    updateDropdownDisplay("Changez de cinema");
                    // Mettre à jour le titre droit
                    if (titleLeft) {
                        titleLeft.innerText = `Réservez au CinePhoria de ${cinema}`;
                    }
                    // Mettre à jour le dataController
                    dataController.nameCinema = cinema;
                    // Chargement des données
                    yield dataController.chargerDepuisAPI();
                    // Identifier le film par defaut
                    const filmSeancesCandidat = trouverFilmSeancesCandidat(dataController);
                    if (!filmSeancesCandidat[0].filmId)
                        return;
                    // Mettre a jour le film selection dans le dataController
                    dataController.selectedFilmUUID = filmSeancesCandidat[0].filmId;
                    // Bascule vers le panel choix
                    basculerPanelChoix();
                    // Mise à jour de l'état
                    dataController.reservationState = ReservationState.PendingChoiceSeance;
                    // Mise à jour de la page
                    updateContentPage(dataController);
                    // Fermeture de la modale
                    if (modal) {
                        console.log("2 - Fermeture de la modale ");
                        modal.classList.remove('show'); // Fermer la modale si elle est ouverte
                    }
                    console.log(`3 - Fin du changement de cinéma : ${cinema}`);
                }
            }));
        });
    });
}));
/**
 * Fonction de mise à jour de la page
 * @param dataController
 * @param selectedFilmUUID // film selectionné
 * @returns rien
 */
export function updateContentPage(dataController) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("UCP 1 - Update content page");
        const activeSelectedFilmUUID = dataController.selectedFilmUUID;
        if (!activeSelectedFilmUUID)
            return;
        const activeSelectedFilm = dataController.selectedFilm;
        const seancesFilm = dataController.seancesFilmJour(activeSelectedFilmUUID);
        console.log("UCP 2 - Film par defaut = ", activeSelectedFilm.titleFilm, " Nombre de séances", dataController.seancesFilmJour(activeSelectedFilm.id).length, " Date : ", formatDateLocalYYYYMMDD(new Date(seancesFilm[0].dateJour || '')));
        const seanceData = seancesFilm.map(seance => ({
            titre: seance.titleFilm,
            salle: seance.nameSalle,
            date: seance.dateJour,
            heureDebut: seance.hourBeginHHSMM
        }));
        console.log("UCP 3 - Liste des séances du film candidat = ", seanceData);
        // Afficher la liste de tous les films
        afficherListeFilms(dataController);
        console.log("UCP 5 - Liste des films affichés");
        // Afficher les détails du film selectionné
        afficherDetailsFilm(dataController);
        console.log("UCP 6 - Detail du film selectionné affichés");
        if (dataController.reservationState === ReservationState.PendingChoiceSeance) {
            console.log("ETAT : choix de la séance");
            // Composer la ligne de tabulation du panel de choix des séances
            afficherSemaines(dataController);
            console.log("UCP 7 - Lignes de tabulation des jours affichées");
            // Afficher les séances du jour pour le film sélectionné
            afficherSeancesDuJour(dataController, new Date(seancesFilm[0].dateJour || ''));
            console.log(`UCP 8 - Séances affichées pour ${activeSelectedFilm.titleFilm} le ${new Date(seancesFilm[0].dateJour || '')}`);
        }
        else if (dataController.reservationState = ReservationState.PendingChoiceSeats) {
            console.log("ETAT : choix des places");
            // 1) Mettre à jour le bloc .seances__cardseance seances__cardseance-selected
            //    pour afficher la séance choisie
            const containerSelectedSeance = document.getElementById('seances__cardseance-selected');
            // const containerSelectedSeance = document.querySelector('.seances__cardseance-selected');
            if (!containerSelectedSeance) {
                console.log("Pas de carte selectionnée");
                return;
            }
            const selectedSeance = seanceCardView(dataController.seanceSelected(), dataController.selectedSeanceDate, "seances__cardseance-selected");
            containerSelectedSeance.replaceWith(selectedSeance);
            // 2) Afficher le tableau de tarifs selon la qualite
            const containerTable = document.querySelector('.commande__tabtarif');
            if (!containerTable)
                return;
            containerTable.innerHTML = '';
            const qualiteFilm = dataController.seanceSelected().qualite;
            if (qualiteFilm)
                containerTable.appendChild(updateTableContent(qualiteFilm));
            // 3) Gestion du bouton "Changer de séance" -> basculerPanelChoix()
            const btnChanger = document.querySelector('.panel__changer-button');
            if (btnChanger) {
                btnChanger.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    basculerPanelChoix();
                });
            }
            // 4) Gestion du bouton "Je réserve"
            setReservation();
        }
        function setReservation() {
            const btnReserve = document.querySelector('.panel__jereserve-button');
            btnReserve.textContent = "Je choisis ces places";
            if (btnReserve) {
                btnReserve.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                    evt.preventDefault();
                    evt.stopPropagation();
                    // a) Récupérer le nombre total de places et la répartition par tarif
                    const { totalPlaces, tarifSeatsMap } = collectTarifSeatsAndTotal('.tabtarif__commande-table');
                    console.log(`Nombre de places total = ${totalPlaces}, Répartition = ${tarifSeatsMap}`);
                    // b) Récupérer la valeur PMR
                    const pmrSeats = collectPMR('.commande__pmr');
                    console.log(`Nombre de PMR = ${pmrSeats}`);
                    // c) Récupérer l'email
                    const email = collectEmail('.commande__mail-input');
                    console.log(`email = ${email}`);
                    // d) Vérifications
                    if (totalPlaces < 1) {
                        alert('Vous devez sélectionner au moins une place.');
                        return;
                    }
                    if (!email) {
                        alert('Veuillez renseigner un email valide.');
                        return;
                    }
                    // e) Appel à l’API /api/reservation
                    try {
                        const seanceId = dataController.seanceSelected().seanceId;
                        // Construction du body
                        const body = {
                            email,
                            seanceId,
                            tarifSeats: tarifSeatsMap, // { tarifId: numberOfSeats, ... }
                            pmrSeats
                        };
                        const response = yield fetch('http://localhost:3500/api/reservation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });
                        if (!response.ok) {
                            const errData = yield response.json();
                            alert(`Une erreur s'est produite : ${errData.message || 'inconnue'}`);
                            return;
                        }
                        // Réponse OK -> { statut, utilisateurId, reservationId }
                        const { statut, utilisateurId, reservationId } = yield response.json();
                        // f) Contrôles de cohérence
                        //   - Vérifier seanceId identique
                        //   - Vérifier si utilisateurId est un UUID
                        //   - Gérer statut
                        let messageError = "";
                        if (!isUUID(reservationId)) {
                            messageError += `ReservationID invalide.`;
                        }
                        if (!isUUID(utilisateurId)) {
                            messageError += `UtilisateurId invalide.`;
                        }
                        if (statut == 'NA') {
                            messageError = `Une erreur s'est produite côté serveur (NA).`;
                        }
                        if (utilisateurId.startsWith('Erreur')) {
                            messageError += " Erreur utilisateur : " + utilisateurId;
                        }
                        if (reservationId.startsWith('Erreur')) {
                            messageError += " Erreur reservation : " + reservationId;
                        }
                        if (messageError !== "") {
                            alert(`Une erreur s'est produite : ${messageError}`);
                            return;
                        }
                        dataController.selectedUtilisateurUUID = utilisateurId;
                        dataController.selectedReservationUUID = reservationId;
                        switch (statut) {
                            case 'Compte Provisoire':
                                // L'email est inconnu -> compte créé en provisoire
                                console.log("Compte provisoire , " + utilisateurId + " , " + reservationId);
                                confirmMail(dataController, email);
                                break;
                            case 'Compte Confirme':
                                // L'email correspond à un compte valide
                                console.log("Compte Confirme , " + utilisateurId + " , " + reservationId);
                                //  loginWithEmail(dataController, email);
                                break;
                            default:
                                // Cas imprévu
                                alert(`Une erreur s'est produite : statut inconnu -> ${statut} , ${utilisateurId} , ${reservationId}`);
                                break;
                        }
                    }
                    catch (error) {
                        console.error('Erreur lors de la création de la réservation', error);
                        alert(`Une erreur s'est produite : ${(error === null || error === void 0 ? void 0 : error.message) || 'inconnue'}`);
                    }
                }));
            }
        }
    });
}
/**
 * Récupère le total de places et la répartition par tarif
 * @param tableSelector Sélecteur de la table (.tabtarif__commande-table)
 * @return { totalPlaces, tarifSeatsMap }
 *    - totalPlaces : somme des places
 *    - tarifSeatsMap : objet { [tarifId]: numberOfSeats }
 */
function collectTarifSeatsAndTotal(tableSelector) {
    const table = document.querySelector(tableSelector);
    let totalPlaces = 0;
    const tarifSeatsMap = {};
    if (!table)
        return { totalPlaces: 0, tarifSeatsMap };
    // Hypothèse : on stocke l'ID du tarifQualite dans un data-attribute 
    // => <tr data-tarifid="xxx"> ...
    const rows = table.querySelectorAll('tr.body__content-tr');
    rows.forEach((row) => {
        var _a;
        const tarifId = row.dataset['tarifid'] || '';
        console.log("TarifId = ", tarifId);
        const spanPlace = row.querySelector('.num__num-span#num__place');
        const quantity = spanPlace ? parseInt((_a = spanPlace.textContent) !== null && _a !== void 0 ? _a : '0', 10) : 0;
        if (quantity > 0 && tarifId) {
            tarifSeatsMap[tarifId] = quantity;
        }
        totalPlaces += quantity;
    });
    return { totalPlaces, tarifSeatsMap };
}
/**
 * Récupère le nombre PMR dans .commande__pmr
 */
function collectPMR(selector) {
    var _a;
    const pmrContainer = document.querySelector(selector);
    if (!pmrContainer)
        return 0;
    const spanPmr = pmrContainer.querySelector('.num__num-span#num__pmr');
    return spanPmr ? parseInt((_a = spanPmr.textContent) !== null && _a !== void 0 ? _a : '0', 10) : 0;
}
/**
 * Récupère l'email
 */
function collectEmail(selector) {
    const input = document.querySelector(selector);
    if (!input)
        return '';
    return input.value.trim();
}
/**
 * Récupère une chaine de caractère
 */
function collectString(selector) {
    const input = document.querySelector(selector);
    if (!input)
        return '';
    return input.value.trim();
}
/**
 * Quand on reçoit "Compte Provisoire" => on exécute confirmMail
 * - On met dataController.reservationState = ReservationState.PendingMailVerification
 * - On affiche une modale demandant la saisie du mail et deux champs mot de passe
 */
function confirmMail(dataController, email) {
    dataController.reservationState = ReservationState.PendingMailVerification;
    // TODO : Afficher une modale "confirmMail"
    //        avec :
    //   - un texte "Pour récupérer le QRCode..."
    //   - la resaisie de l'email
    //   - deux champs de saisie du mot de passe
    //   - un bouton valider "Création du compte"
    console.log('===> confirmMail action, email =', email);
    const modalConfirm = document.getElementById('modal-confirmMail');
    const closeModalBtn = document.getElementById("close-confirmMail");
    const confirmModalBtn = document.getElementById("confirmMail-submit");
    if (modalConfirm && closeModalBtn && confirmModalBtn) {
        modalConfirm.style.display = 'flex';
        const closeModal = () => {
            modalConfirm.style.display = 'none';
        };
        closeModalBtn.addEventListener('click', closeModal);
        modalConfirm.addEventListener('click', (event) => {
            if (event.target === modalConfirm)
                closeModal();
        });
        confirmModalBtn.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
            evt.preventDefault();
            evt.stopPropagation();
            confirmCreationCompte();
        }));
    }
    else {
        console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal modal-confirmMail sont introuvables.');
    }
    function confirmCreationCompte() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Recupération de la modal");
            return;
            // a) Recupérer le displayName
            const displayName = collectString('confirmMail-displayName');
            // a) Récupérer le nombre total de places et la répartition par tarif
            const { totalPlaces, tarifSeatsMap } = collectTarifSeatsAndTotal('.tabtarif__commande-table');
            console.log(`Nombre de places total = ${totalPlaces}, Répartition = ${tarifSeatsMap}`);
            // b) Récupérer la valeur PMR
            const pmrSeats = collectPMR('.commande__pmr');
            console.log(`Nombre de PMR = ${pmrSeats}`);
            // c) Récupérer l'email
            const email = collectEmail('.commande__mail-input');
            console.log(`email = ${email}`);
            // d) Vérifications
            if (totalPlaces < 1) {
                alert('Vous devez sélectionner au moins une place.');
                return;
            }
            if (!email) {
                alert('Veuillez renseigner un email valide.');
                return;
            }
            // e) Appel à l’API /api/reservation
            try {
                const seanceId = dataController.seanceSelected().seanceId;
                // Construction du body
                const body = {
                    email,
                    seanceId,
                    tarifSeats: tarifSeatsMap, // { tarifId: numberOfSeats, ... }
                    pmrSeats
                };
                const response = yield fetch('http://localhost:3500/api/reservation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!response.ok) {
                    const errData = yield response.json();
                    alert(`Une erreur s'est produite : ${errData.message || 'inconnue'}`);
                    return;
                }
                // Réponse OK -> { statut, utilisateurId, reservationId }
                const { statut, utilisateurId, reservationId } = yield response.json();
                // f) Contrôles de cohérence
                //   - Vérifier seanceId identique
                //   - Vérifier si utilisateurId est un UUID
                //   - Gérer statut
                let messageError = "";
                if (!isUUID(reservationId)) {
                    messageError += `ReservationID invalide.`;
                }
                if (!isUUID(utilisateurId)) {
                    messageError += `UtilisateurId invalide.`;
                }
                if (statut == 'NA') {
                    messageError = `Une erreur s'est produite côté serveur (NA).`;
                }
                if (utilisateurId.startsWith('Erreur')) {
                    messageError += " Erreur utilisateur : " + utilisateurId;
                }
                if (reservationId.startsWith('Erreur')) {
                    messageError += " Erreur reservation : " + reservationId;
                }
                if (messageError !== "") {
                    alert(`Une erreur s'est produite : ${messageError}`);
                    return;
                }
                dataController.selectedUtilisateurUUID = utilisateurId;
                dataController.selectedReservationUUID = reservationId;
                switch (statut) {
                    case 'Compte Provisoire':
                        // L'email est inconnu -> compte créé en provisoire
                        console.log("Compte provisoire , " + utilisateurId + " , " + reservationId);
                        confirmMail(dataController, email);
                        break;
                    case 'Compte Confirme':
                        // L'email correspond à un compte valide
                        console.log("Compte Confirme , " + utilisateurId + " , " + reservationId);
                        //  loginWithEmail(dataController, email);
                        break;
                    default:
                        // Cas imprévu
                        alert(`Une erreur s'est produite : statut inconnu -> ${statut} , ${utilisateurId} , ${reservationId}`);
                        break;
                }
            }
            catch (error) {
                console.error('Erreur lors de la création de la réservation', error);
                alert(`Une erreur s'est produite : ${(error === null || error === void 0 ? void 0 : error.message) || 'inconnue'}`);
            }
        });
    }
}
/**
* Trouve un film « le plus récent + meilleure note » à partir d'un tableau de séances
* On retourne une séance représentative de ce film
* On se sert de ce film si on n'en a pas selectionné un depuis la page visiteur
*/
function trouverFilmSeancesCandidat(dataController) {
    const filmsDuJour = dataController.filmsJour();
    console.log("Debut affichage de la liste : ", filmsDuJour.length);
    if (filmsDuJour.length === 0) {
        console.error("filmsDuJour est vide");
    }
    // Trouver le film avec dateSortieCinePhoria la plus récente et la meilleure note
    const filmTop = filmsDuJour.reduce((bestFilm, currentFilm) => {
        const bestDate = bestFilm.dateSortieCinePhoria ? new Date(bestFilm.dateSortieCinePhoria) : new Date(0);
        const currentDate = currentFilm.dateSortieCinePhoria ? new Date(currentFilm.dateSortieCinePhoria) : new Date(0);
        if (currentDate > bestDate ||
            (currentDate.getTime() === bestDate.getTime() && (currentFilm.note || 0) > (bestFilm.note || 0))) {
            return currentFilm;
            //
        }
        return bestFilm;
    }, filmsDuJour[0]);
    return dataController.seancesFilmJour(filmTop.id);
}
/**
* Affiche la liste des films dans la zone .reservation__listFilms
*/
function afficherListeFilms(dataController) {
    const container = document.querySelector('.reservation__listFilms');
    if (!container)
        return;
    // Extraire les films uniques
    const filmsUniques = dataController.allFilms;
    const seances = dataController.seancesFutures;
    console.log("Nombre de films dans la liste : ", filmsUniques.length, " nombre de seances =", seances.length);
    container.innerHTML = '';
    filmsUniques.forEach((film) => {
        var _a;
        const divCard = document.createElement('div');
        divCard.classList.add('listFilms__simpleCard');
        // Créer l'image
        const img = document.createElement('img');
        img.classList.add('listFilms__simpleCard-img');
        img.src = "assets/static/" + film.imageFilm128;
        img.alt = (_a = film.titleFilm) !== null && _a !== void 0 ? _a : 'Affiche';
        // Titre
        const pTitre = document.createElement('p');
        pTitre.classList.add('listFilms__simpleCard-p');
        pTitre.textContent = film.titleFilm || '';
        // Ajouter au DOM
        divCard.appendChild(img);
        divCard.appendChild(pTitre);
        // Gérer la sélection
        divCard.addEventListener('click', () => {
            // Désélectionner la carte précédemment sélectionnée
            const previouslySelected = container.querySelector('.listFilms__simpleCard.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }
            // Sélectionner la nouvelle carte
            divCard.classList.add('selected');
            // Mettre à jour le film sélectionné dans le dataController
            dataController.selectedFilmUUID = film.id;
            // Rafraîchir la page ou effectuer des actions supplémentaires
            // updateContentPage(dataController);
            // Basculer vers le panel choix
            basculerPanelChoix();
        });
        // Mettre en surbrillance si c'est le film actuellement sélectionné
        if (film.id === dataController.selectedFilmUUID) {
            divCard.classList.add('selected');
        }
        container.appendChild(divCard);
    });
}
/**
 * Affiche les détails d'un film dans la zone .reservation__detailFilm
 * @param dataController L'objet gérant les données (dont la liste des films)
 * @param filmId L'identifiant du film à afficher
 */
function afficherDetailsFilm(dataController) {
    var _a, _b, _c, _d, _e, _f, _g;
    const container = document.querySelector('.reservation__detailFilm');
    if (!container)
        return;
    const film = dataController.selectedFilm;
    if (!film) {
        container.innerHTML = '<p>Film introuvable.</p>';
        return;
    }
    container.innerHTML = `
    <div class="detailFilm__twocolumns">
      <div class="twocolumns__left">
        <img src="./assets/static/${(_a = film.imageFilm1024) !== null && _a !== void 0 ? _a : ''}" alt="Affiche" class="twocolumns__left-img">
        <button class="twocolumns__left-button-bo" id="openModal">Bande Annonce</button>
      </div>
      <div class="twocolumns__right">
        <p class="right__title-p">${film.titleFilm}</p>
        <div class="right__caractFilm">
          <p class="caractFilm__genre-p">${(_b = film.genreArray) !== null && _b !== void 0 ? _b : ''}</p>
          <p class="caractFilm__duree-p">${(_c = film.duration) !== null && _c !== void 0 ? _c : ''}</p>
          <p class="caractFilm__public-p">${(_d = film.categorySeeing) !== null && _d !== void 0 ? _d : ''}</p>
        </div>
        <p class="right__description-p">${(_e = film.filmDescription) !== null && _e !== void 0 ? _e : ''}</p>
        <p class="right__author-p">${(_f = film.filmAuthor) !== null && _f !== void 0 ? _f : ''}</p>
        <p class="right__distribution">${(_g = film.filmDistribution) !== null && _g !== void 0 ? _g : ''}</p>
      </div>
    </div>
  `;
    /* Configuration du bouton d'affichage de la bande annonce */
    /* Bouton dans le corps HTML */
    const openModalBtn = container.querySelector('.twocolumns__left-button-bo');
    /* div de la modal dans le HTML */
    const modal = document.getElementById('videoModal');
    const closeModalBtn = modal === null || modal === void 0 ? void 0 : modal.querySelector('.closeyoutube');
    const youtubeVideo = document.getElementById('youtubeVideo');
    // const youtubeUrl = encodeURI(film.linkBO?.trim() ?? '');
    const youtubeUrlDynamique = `${film.linkBO}?autoplay=1`;
    ;
    console.log("URL dynamique = ", youtubeUrlDynamique);
    if (openModalBtn && modal && closeModalBtn && youtubeVideo && youtubeUrlDynamique) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            youtubeVideo.src = youtubeUrlDynamique;
            //  youtubeVideo.src ='https://www.youtube.com/embed/Tkej_ULljR8?autoplay=1';
            console.log("URL utilisée = ", youtubeVideo.src);
        });
        const closeModal = () => {
            modal.style.display = 'none';
            youtubeVideo.src = '';
        };
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal)
                closeModal();
        });
    }
    else {
        console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal sont introuvables.');
    }
}
/**
* Affiche les onglets de la semaine dans la div .panel__tabs
* @param dateDebut de la plage Date de début (par défaut : aujourd'hui) ou un mercredi
* @param isInitial Indique si c'est la première fois (affichage jusqu'au mardi)
*/
function afficherSemaines(dataController, dateDebut = new Date(), isInitial = true) {
    const panelTabs = document.querySelector('.panel__tabs');
    if (!panelTabs)
        return;
    if (!dataController.selectedFilmUUID)
        return;
    const filmId = dataController.selectedFilmUUID;
    // Vider le contenu
    panelTabs.innerHTML = '';
    // Dates localisées à midi, pour éviter le décalage de fuseau horaire
    const dAujourdhui = creerDateLocale(new Date());
    const dDebut = creerDateLocale(dateDebut);
    // Calcul de la date de fin : 
    //   - Soit jusqu'au mardi suivant (cas initial)
    //   - Soit +6 jours (7 jours) dans les autres cas
    const finAffichage = isInitial ? dateProchainMardi(dAujourdhui) : ajouterJours(dDebut, 6);
    // Si on n'a pas de seance pour le film dans la semaine, on ne fait rien.
    if (dataController.seancesFilmDureeJour(filmId, dDebut, 6).length === 0)
        return;
    // === Bouton "Avant" ===
    // On ne l’affiche pas pour le cas initial
    // Et seulement si la dateDebut est postérieure à aujourd’hui
    if (!isInitial && dDebut.getTime() > dAujourdhui.getTime()) {
        const avant = document.createElement('p');
        avant.classList.add('tabs__tab-p', 'tabs__tab-nav-p', 'tabs__tab-nav-prec-p');
        avant.textContent = 'Avant';
        avant.addEventListener('click', () => {
            const dateAvant = ajouterJours(dDebut, -7);
            // Si on revient sur ou avant aujourd’hui, on repasse en mode initial
            // On affiche la semaine ou le debut de semaine dans tab
            // On se positionne sur le premier jour de la semaine
            if (dateAvant.getTime() <= dAujourdhui.getTime()) {
                afficherSemaines(dataController, dAujourdhui, true);
                afficherSeancesDuJour(dataController, dAujourdhui);
            }
            else {
                afficherSemaines(dataController, dateAvant, false);
                afficherSeancesDuJour(dataController, dateAvant);
            }
        });
        panelTabs.appendChild(avant);
    }
    // === Boucle d’affichage des jours ===
    let current = new Date(dDebut.getTime());
    let nJourAvecSeance = 0;
    while (current.getTime() <= finAffichage.getTime()) {
        // On n’affiche jamais avant aujourd’hui
        if (current.getTime() >= dAujourdhui.getTime()) {
            if (dataController.seancesFilmJour(dataController.selectedFilmUUID, current).length > 0) {
                // Il y a au moins une séance pour ce film ce jour
                nJourAvecSeance += 1;
                const jourItem = document.createElement('p');
                jourItem.classList.add('tabs__tab-p', 'tabs__tab-day-p');
                jourItem.textContent = formatDateJJMM(current);
                // Capturer la date dans une closure pour éviter le décalage
                const dateForHandler = new Date(current.getTime());
                jourItem.addEventListener('click', () => {
                    afficherSeancesDuJour(dataController, dateForHandler);
                });
                panelTabs.appendChild(jourItem);
            }
        }
        // Passer au jour suivant, toujours en local
        current = ajouterJours(current, 1);
    }
    // === Bouton "Après" ===
    // On passe à la semaine d'après si on a au moins unséance prévue
    if (dataController.seancesFilmDureeJour(filmId, ajouterJours(finAffichage, 1), 7).length > 0) {
        const apres = document.createElement('p');
        apres.classList.add('tabs__tab-p', 'tabs__tab-nav-p', 'tabs__tab-nav-suiv-p');
        apres.textContent = 'Après';
        apres.addEventListener('click', () => {
            // Début de la semaine suivante = finAffichage + 1
            const dateApres = ajouterJours(finAffichage, 1);
            console.log("Apres = ", dateApres);
            dataController.selectedSeanceDate = dateApres;
            afficherSemaines(dataController, dateApres, false);
            afficherSeancesDuJour(dataController, dateApres);
        });
        panelTabs.appendChild(apres);
    }
}
/**
* Affiche la liste des séances dans la zone .panel__choix .panel__seances
* pour un filmId donné à une date précise.
*/
function afficherSeancesDuJour(dataController, dateSelectionnee) {
    var _a, _b;
    // Moment le plus pratique pour capter la mise à jour de la date selectionnee dans le panel de tabs de jour
    // et effacer la mémorisation d'une éventuelle sélection
    dataController.selectedSeanceDate = dateSelectionnee;
    dataController.selectedSeanceUUID = undefined;
    // Changement du libelle du bouton
    const buttonPanel = document.getElementById("panel__choixseance-button");
    if (buttonPanel) {
        buttonPanel.textContent = "Choisissez votre séance";
        buttonPanel.classList.add("inactif");
    }
    // Indication de selection de la date dans le panel tabs
    const panelTabs = document.querySelector('.panel__tabs');
    if (panelTabs) {
        const tabs = panelTabs.querySelectorAll(".tabs__tab-day-p");
        tabs.forEach(tab => {
            if (tab.textContent) {
                if (tab.textContent.trim() === formatDateJJMM(dateSelectionnee).trim()) {
                    // Ajouter la classe "selected" à l'élément correspondant
                    tab.classList.add('selected');
                }
                else {
                    // Optionnel : retirer la classe "selected" des autres éléments
                    tab.classList.remove('selected');
                }
            }
        });
    }
    // Conteneur dans lequel on va injecter les cartes
    const panelChoix = document.querySelector('.panel__seances');
    if (!panelChoix)
        return;
    // Vider le contenu de la div
    panelChoix.innerHTML = '';
    // Filtrer les séances du film sélectionné pour la date choisie
    if (!dataController.selectedFilmUUID)
        return;
    const filmId = dataController.selectedFilmUUID;
    const seancesFilmDuJour = dataController.seancesFilmJour(dataController.selectedFilmUUID, dateSelectionnee);
    // Si aucune séance n'est trouvée, afficher le message d'absence
    if (seancesFilmDuJour.length === 0) {
        // Récupérer au moins une séance du film pour accéder au titre / nom du cinéma (sinon valeur par défaut)
        const filmSeance = dataController.allSeances.find(s => s.filmId === filmId);
        const filmTitle = (_a = filmSeance === null || filmSeance === void 0 ? void 0 : filmSeance.titleFilm) !== null && _a !== void 0 ? _a : 'Film inconnu';
        const nameCinema = (_b = filmSeance === null || filmSeance === void 0 ? void 0 : filmSeance.nameCinema) !== null && _b !== void 0 ? _b : 'Cinéma inconnu';
        const noSeanceMsg = document.createElement('p');
        noSeanceMsg.textContent = `Pas de séance pour ${filmTitle} au cinéma ${nameCinema} ce jour.`;
        panelChoix.appendChild(noSeanceMsg);
        return;
    }
    // Générer les cartes de séances
    console.log("Film = ", seancesFilmDuJour[0].titleFilm, " / nombre de seances = ", seancesFilmDuJour.length, " / date = ", formatDateLocalYYYYMMDD(dateSelectionnee));
    seancesFilmDuJour.forEach(seance => {
        // Générer la card
        const card = seanceCardView(seance, dateSelectionnee);
        card.classList.remove("seances__cardseance-selected");
        // Au clic sur la séance => exemple : basculer sur panel__reserve
        card.addEventListener('click', () => {
            console.log(`Séance cliquée : ${seance.seanceId}`);
            // Suppression de la selection dans les séances
            const panelSeances = document.querySelector('.panel__seances');
            if (panelSeances) {
                const seances = panelSeances.querySelectorAll(".seances__cardseance-selected");
                seances.forEach(seanceItem => {
                    console.log(`Suppression la class selected `);
                    seanceItem.classList.remove("seances__cardseance-selected");
                });
            }
            // Ajout de la selection sur la seancecourante
            card.classList.add('seances__cardseance-selected');
            // Memorisation de la seance
            dataController.selectedSeanceUUID = seance.seanceId;
            console.log("SeanceId selectionnee = " + dataController.selectedSeanceUUID + ", seance = " + JSON.stringify(dataController.seanceSelected()));
            // Changement du libelle du bouton 
            const buttonPanel = document.getElementById("panel__choixseance-button");
            if (buttonPanel) {
                // Remplacer l'élément par une copie de lui-même (supprime les écouteurs existants)
                const newButtonPanel = buttonPanel.cloneNode(true);
                newButtonPanel.classList.remove("inactif");
                newButtonPanel.textContent = "Je réserve pour cette séance !";
                buttonPanel.replaceWith(newButtonPanel);
                // Configuration du passage à l'étape de choix des places
                newButtonPanel.addEventListener('click', () => {
                    if (buttonPanel) {
                        basculerPanelReserve();
                    }
                });
            }
        });
        panelChoix.appendChild(card);
    });
}
/**
 * Fonction de définition d'un card de seance utilisé soit dans le choix d'un seance soit pour rappeler la seance choisi
 * @param seance
 * @returns HTMLDivElement reprenant toute la présentation de la séance
 */
function seanceCardView(seance, dateSelectionne, id = "") {
    var _a, _b;
    const card = document.createElement('div');
    card.classList.add('seances__cardseance');
    card.classList.add('seances__cardseance-selected');
    // Ajout d'un id si fournit en parametre
    if (id !== "") {
        card.id = id;
    }
    // === Horaire ===
    const horaireDiv = document.createElement('div');
    horaireDiv.classList.add('cardseance__horaire');
    const pHourBegin = document.createElement('p');
    pHourBegin.classList.add('horaire__hour', 'horaire__hour-begin-p');
    pHourBegin.textContent = seance.hourBeginHHSMM || '';
    const pHourEnd = document.createElement('p');
    pHourEnd.classList.add('horaire__hour', 'horaire__hour-end-p');
    pHourEnd.textContent = seance.hourEndHHSMM || '';
    horaireDiv.appendChild(pHourBegin);
    horaireDiv.appendChild(pHourEnd);
    // === Salle + date ===
    const dateSalleDiv = document.createElement('div');
    dateSalleDiv.classList.add('cardseance__datesalle');
    const dateInnerDiv = document.createElement('div');
    dateInnerDiv.classList.add('datesalle__date');
    const pMonth = document.createElement('p');
    pMonth.classList.add('date__month-p');
    pMonth.textContent = extraireMoisLettre(dateSelectionne); // "JAN", "FEV"...
    const pDay = document.createElement('p');
    pDay.classList.add('date__day-p');
    pDay.textContent = String(dateSelectionne.getDate());
    dateInnerDiv.appendChild(pMonth);
    dateInnerDiv.appendChild(pDay);
    const salleP = document.createElement('p');
    salleP.classList.add('datesalle__salle-p');
    salleP.textContent = (_a = seance.nameSalle) !== null && _a !== void 0 ? _a : 'Salle ?';
    dateSalleDiv.appendChild(dateInnerDiv);
    dateSalleDiv.appendChild(salleP);
    // === Qualité/VO/VF ===
    const qualiteDiv = document.createElement('div');
    qualiteDiv.classList.add('cardseance__qualitebo');
    const imgQualite = document.createElement('img');
    imgQualite.classList.add('qualitebo-qualite-img');
    imgQualite.src = `assets/${seance.qualite}.png`;
    const pBo = document.createElement('p');
    pBo.classList.add('qualitebo-bo-p');
    pBo.textContent = (_b = seance.bo) !== null && _b !== void 0 ? _b : 'VF';
    qualiteDiv.appendChild(imgQualite);
    qualiteDiv.appendChild(pBo);
    // === Assemblage final de la carte ===
    card.appendChild(horaireDiv);
    card.appendChild(dateSalleDiv);
    card.appendChild(qualiteDiv);
    return card;
}
/**
 * Bascule du panel choix vers le panel reserve
 */
function basculerPanelReserve() {
    const panelChoix = document.querySelector('.panel__choix');
    const panelReservation = document.querySelector('.panel__reserve');
    if ((panelChoix) && (panelReservation)) {
        panelChoix.style.display = 'none';
        panelReservation.style.display = 'flex';
        dataController.reservationState = ReservationState.PendingChoiceSeats;
        updateContentPage(dataController);
    }
}
/**
 * Bascule vers le panel Choix
 */
function basculerPanelChoix() {
    const panelChoix = document.querySelector('.panel__choix');
    const panelReservation = document.querySelector('.panel__reserve');
    if ((panelChoix) && (panelReservation)) {
        panelChoix.style.display = 'block';
        panelReservation.style.display = 'none';
        dataController.reservationState = ReservationState.PendingChoiceSeance;
        updateContentPage(dataController);
    }
}
/**
 * Génère le contenu d'un tableau des tarifs en fonction d'une qualité spécifiée.
 * Les tarifs sont pris dans le dataController
 * @param qualite La valeur de qualite à filtrer (ex: "3D", "4DX", etc.)
 * @returns Un élément <table>
 */
function updateTableContent(qualite) {
    // 1) Créer l'élément <table> et sa structure de base
    const table = document.createElement('table');
    table.classList.add('tabtarif__commande-table');
    // === THEAD ===
    const thead = document.createElement('thead');
    thead.classList.add('commande__entete-thead');
    thead.innerHTML = `
    <tr class="entete__content-tr">
      <th class="content-th content-id-th">#</th>
      <th class="content-th content-tarif-th">Tarif</th>
      <th class="content-th content-places-th">Places</th>
      <th class="content-th content-total-th">Total</th>
    </tr>
  `;
    table.appendChild(thead);
    // === TBODY ===
    const tbody = document.createElement('tbody');
    tbody.classList.add('commande__body-tbody');
    table.appendChild(tbody);
    // === TFOOT ===
    const tfoot = document.createElement('tfoot');
    tfoot.classList.add('commande__foot-tfoot');
    tfoot.innerHTML = `
    <tr class="foot__content-tr">
      <td colspan="3"></td>
      <td class="content-td content-totalprice-td">0 €</td>
    </tr>
  `;
    table.appendChild(tfoot);
    const totalPriceTd = tfoot.querySelector('.content-totalprice-td');
    // 2) Filtrer les tarifs correspondant à la qualité demandée
    const filteredTarifs = dataController.allTarifQualite.filter(t => t.qualite === qualite);
    // 3) Générer une ligne par tarif
    let lineIndex = 1;
    filteredTarifs.forEach((tarif) => {
        var _a;
        const tr = document.createElement('tr');
        tr.setAttribute('data-tarifid', tarif.id);
        tr.classList.add('body__content-tr');
        // Colonne #
        const tdId = document.createElement('td');
        tdId.classList.add('content-td', 'content-id-td');
        tdId.textContent = String(lineIndex);
        // Colonne Tarif : ex. "Plein tarif (10€)"
        const tdTarif = document.createElement('td');
        tdTarif.classList.add('content-td', 'content-tarif-td');
        const priceNum = tarif.price ? parseFloat(tarif.price) : 0;
        tdTarif.textContent = `${(_a = tarif.nameTarif) !== null && _a !== void 0 ? _a : ''} (${priceNum}€)`;
        // Colonne Places (boutons + -)
        const tdNum = document.createElement('td');
        tdNum.classList.add('content-td', 'content-num-td');
        const btnAdd = document.createElement('button');
        btnAdd.classList.add('num__add-button');
        btnAdd.textContent = '+';
        const spanPlaces = document.createElement('span');
        spanPlaces.classList.add('num__num-span');
        spanPlaces.id = 'num__place';
        spanPlaces.textContent = '0'; // Au départ, 0
        const btnRemove = document.createElement('button');
        btnRemove.classList.add('num__remove-button');
        btnRemove.textContent = '-';
        tdNum.appendChild(btnAdd);
        tdNum.appendChild(spanPlaces);
        tdNum.appendChild(btnRemove);
        // Colonne Total
        const tdPrice = document.createElement('td');
        tdPrice.classList.add('content-td', 'content-price-td');
        tdPrice.textContent = '0 €'; // Au départ, 0
        // Assembler la ligne
        tr.appendChild(tdId);
        tr.appendChild(tdTarif);
        tr.appendChild(tdNum);
        tr.appendChild(tdPrice);
        tbody.appendChild(tr);
        // 4) Gérer l'événement + et -
        function updateRowTotal() {
            var _a;
            // Récupérer la quantité
            const quantity = parseInt((_a = spanPlaces.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
            // Mettre à jour le total de la ligne
            const lineTotal = priceNum * quantity;
            tdPrice.textContent = `${lineTotal} €`;
            // Recalculer le total global
            updateTableTotal();
        }
        // Incrémente la quantité (max 4)
        btnAdd.addEventListener('click', (event) => {
            var _a;
            event.preventDefault();
            event.stopPropagation();
            let currentVal = parseInt((_a = spanPlaces.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
            if (currentVal < 4) {
                currentVal++;
                spanPlaces.textContent = String(currentVal);
                updateRowTotal();
            }
        });
        // Décrémente la quantité (min 0)
        btnRemove.addEventListener('click', (event) => {
            var _a;
            event.preventDefault();
            event.stopPropagation();
            let currentVal = parseInt((_a = spanPlaces.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
            if (currentVal > 0) {
                currentVal--;
                spanPlaces.textContent = String(currentVal);
                updateRowTotal();
            }
        });
        lineIndex++;
    });
    // 5) Fonction pour mettre à jour le total global (tfoot)
    function updateTableTotal() {
        let grandTotal = 0;
        // Parcourir chaque ligne du tbody pour sommer
        tbody.querySelectorAll('tr.body__content-tr').forEach((row) => {
            var _a, _b;
            const priceCell = row.querySelector('.content-price-td');
            if (priceCell) {
                const text = (_b = (_a = priceCell.textContent) === null || _a === void 0 ? void 0 : _a.replace(' €', '')) !== null && _b !== void 0 ? _b : '0';
                const value = parseFloat(text) || 0;
                grandTotal += value;
            }
        });
        totalPriceTd.textContent = `${grandTotal} €`;
    }
    return table;
}
