var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD, isUUID } from './Helpers.js';
import { dataController, dataReady } from './DataController.js';
import { ReservationState } from './shared-models/Reservation.js';
import { updateContentPlace } from './ViewReservationPlaces.js';
import { modalConfirmUtilisateur, updateDisplayReservation } from './ViewReservationDisplay.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { imageFilm } from './Helpers.js';
export function onLoadReservation() {
    return __awaiter(this, void 0, void 0, function* () {
        // const page = window.location.pathname.split("/").pop(); // Récupère le nom de la page actuelle
        // if (page != "reservation.html") return;
        // await new Promise(resolve => window.addEventListener('load', resolve)); // ✅ attend fin chargement complet
        yield dataReady; // ✅ Attend que les données soient prêtes
        console.log("Données chargées, traitement de la page reservations...");
        // On charge menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // On se positionne sur le dernier cinema selectionne au cas ou on lance la fenetre avec all
        if (dataController.filterNameCinema === 'all')
            dataController.filterNameCinema = dataController.selectedNameCinema;
        // On se positionne sur le cinema si il a été déjà défini ou on affiche une modale de selection du cinema
        yield updateCinema();
        // On recupere les cas où on est dans un état instable dans la mémorisation de la reservation pendante.
        if (["ReserveCompteToConfirm", "ReserveMailToConfirm",
            "ReserveToConfirm"].includes(dataController.reservationState)) {
            // Si on est sur une reservation pendante, on verifie la conformité des données de reservation
            if (!isUUID(dataController.selectedReservationUUID || '') || !isUUID(dataController.selectedSeanceUUID || '')
            //  || !validateEmail(dataController.selectedUtilisateurMail || '')
            ) {
                // On revient à une selection complete
                dataController.reservationState = ReservationState.PendingChoiceSeance;
            }
        }
        if (["PendingChoiceSeance", "PendingChoiceSeats", "ReserveConfirmed"].includes(dataController.reservationState)) {
            // On est sans reservation pendante
            // Identifier le film par defaut si on n'a pas de film selectionné dans le dataController
            if (dataController.selectedFilmUUID === undefined) {
                dataController.selectedReservationUUID = undefined;
                if (["PendingChoiceSeance", "ReserveConfirmed"].includes(dataController.reservationState)) {
                    dataController.selectedSeanceUUID = undefined;
                }
                const filmSeancesCandidat = trouverFilmSeancesCandidat(dataController);
                if (!filmSeancesCandidat[0].filmId)
                    return;
                // Mettre a jour le film selection dans le dataController
                dataController.selectedFilmUUID = filmSeancesCandidat[0].filmId;
            }
            // Mise a jour de la page
            yield updateContentPage(dataController);
            // Verification dataController
            console.log(`dataController.filteredNameCinema = ${dataController.filterNameCinema} nombre de séances = ${dataController.allSeances.length}`);
        }
        if (["ReserveCompteToConfirm", "ReserveMailToConfirm",
            "ReserveToConfirm"].includes(dataController.reservationState)) {
            // On a une reservation pendante mise à jour de la page pour afficher la reservation
            // Verification sur la reservation en cours est sur le cinema selectionne
            if (dataController.selectedReservationCinema) {
                if (dataController.filterNameCinema !== dataController.selectedReservationCinema) {
                    dataController.filterNameCinema = dataController.selectedReservationCinema;
                }
            }
            yield updateDisplayReservation();
            console.log("Affichage de la reservation à l'état : ", dataController.reservationState);
        }
        document.querySelector("main").style.visibility = "visible";
        const filters = document.querySelector(".title__filters");
        if (filters)
            filters.style.visibility = "visible";
        const progress = document.getElementById("progressIndicator");
        if (progress) {
            progress.style.removeProperty("display");
            progress.style.display = "none";
            progress.classList.add("hidden");
            // progress.style.display = "none"; 
            console.log("Descativation progress");
        }
        else {
            console.error("Pas d'indicateur");
        }
    });
}
;
/**
 * Fonction de gestion de la selection du cinema
 * Si pas de cinema selectionne,
 *    on initialise avec le cinema Paris
 *    on affiche la modale de selection de cinema
 * Sinon
 *    On affiche le cinema selectionne
 *
 * Dans tous les cas on défini l'action de changement de cinema à partir de du dropdown
 */
export function updateCinema() {
    return __awaiter(this, void 0, void 0, function* () {
        const dropdownContents = document.querySelectorAll('.title__filter-button-drowdown-content-complexe');
        // Fonction de mise à jour l'affichage du bouton du dropdown
        function updateDropdownDisplay(textButton) {
            const dropdownButtons = document.querySelectorAll('.titre__filter-dropdown-complexe');
            const mustDisplayButton = ["PendingChoiceSeance", "PendingChoiceSeats"].includes(dataController.reservationState);
            dropdownButtons.forEach((button) => {
                mustDisplayButton ? button.style.display = "block" : button.style.display = "none";
                button.innerHTML = `${textButton} <span class="chevron">▼</span>`;
            });
        }
        // Le cinema est initialisé dans DataController.ts , par défaut paris
        // await dataController.init();
        // Mettre à jour l'affichage initial du dropdown sur le composant titre
        updateDropdownDisplay(dataController.selectedNameCinema);
        // Mise à jour du titre
        const titleLeft = document.getElementById('titleLeft');
        if (titleLeft) {
            if (dataController.filterNameCinema === 'all') {
                // Ne doit pas se produire car le choix all n'est pas permis sur la sélectionde la page
                // A fixer
                titleLeft.innerText = `Réservez au CinePhoria all à gérer`;
            }
            else {
                titleLeft.innerText = `Réservez au CinePhoria de ${dataController.filterNameCinema}`;
            }
        }
        // Définition des interactions dans les dropdowns de selection de cinema (celui de la modale ou celui du titre droit)
        dropdownContents.forEach((content) => {
            const links = content.querySelectorAll('a');
            links.forEach((link) => {
                link.removeEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () { }));
                link.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    event.preventDefault();
                    const cinema = (_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                    if (cinema) {
                        console.log("1 - Nouvelle valeur de cinema = ", cinema);
                        // Mettre à jour l'affichage du bouton
                        updateDropdownDisplay(cinema);
                        // Mettre à jour le titre droit
                        const titleLeft = document.getElementById('titleLeft');
                        if (titleLeft) {
                            titleLeft.innerText = `Réservez au CinePhoria de ${cinema}`;
                        }
                        // Mettre à jour le dataController
                        dataController.filterNameCinema = cinema;
                        // Chargement des données
                        // await dataController.init()
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
                        updateContentPage(dataController);
                        // Fermeture de la modale
                        const modalCinema = document.getElementById('modal-cinema');
                        if (modalCinema) {
                            console.log("2 - Fermeture de la modale ");
                            modalCinema.classList.remove('show'); // Fermer la modale si elle est ouverte
                        }
                        console.log(`3 - Fin du changement de cinéma : ${cinema}`);
                    }
                }));
            });
        });
    });
}
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
        const premierJour = dataController.premierJour(activeSelectedFilmUUID);
        const seancesFilm = dataController.seancesFilmJour(activeSelectedFilmUUID, premierJour);
        console.log("UCP 2 - Film par defaut = ", activeSelectedFilm.titleFilm, " Nombre de séances", dataController.seancesFilmJour(activeSelectedFilm.id, premierJour).length, " Date : ", premierJour);
        // Si on est sans reservation prise, on affiche la liste des films et le film selectionne
        if (["PendingChoiceSeance", "PendingChoiceSeats"].includes(dataController.reservationState)) {
            afficherListeFilms();
            console.log("UCP 5 - Liste des films affichés");
            // Afficher les détails du film selectionné
            afficherDetailsFilm();
            console.log("UCP 6 - Detail du film selectionné affichés");
        }
        if (dataController.reservationState === ReservationState.PendingChoiceSeance) {
            // On affiche le calendrier et les seances de chaque jour
            console.log("ETAT : choix de la séance");
            // Composer la ligne de tabulation du panel de choix des séances
            afficherSemaines(premierJour);
            console.log("UCP 7 - Lignes de tabulation des jours affichées");
            // Afficher les séances du jour pour le film sélectionné
            // afficherSeancesDuJour(new Date(seancesFilm[0].dateJour || ''));
            afficherSeancesDuJour(premierJour);
            console.log(`UCP 8 - Séances affichées pour ${activeSelectedFilm.titleFilm} le ${new Date(seancesFilm[0].dateJour || '')}`);
        }
        else if (dataController.reservationState = ReservationState.PendingChoiceSeats) {
            // on active le panel reserve et initialise le tableau de saisie de la réservation
            console.log("ETAT : choix des places");
            basculerPanelReserve();
            updateContentPlace();
            yield dataController.sauverEtatGlobal();
        }
        else if (dataController.reservationState === ReservationState.ReserveCompteToConfirm) {
            console.log("On doit confirmer le compte");
            // On active le panel reserve, on affiche la réservation en lecture seule et la modal de confirmation d'utilisateur
            basculerPanelReserve();
            updateDisplayReservation();
            modalConfirmUtilisateur();
        }
        else if (dataController.reservationState === ReservationState.ReserveMailToConfirm) {
            // On a confirmé le compte mais abandonne la verification de mail
            console.log("Abandon à la vérification de mail");
        }
        else if (dataController.reservationState === ReservationState.ReserveToConfirm) {
            // On a confirmé le compte, verifier le mail, mais pas confirmer la reservation en se loguant.
            console.log("Abandon au login");
        }
        ;
    });
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
function afficherListeFilms() {
    const container = document.querySelector('.reservation__listFilms');
    if (!container)
        return;
    // Extraire les films uniques
    const filmsUniques = dataController.films;
    const seances = dataController.seancesFutures;
    console.log("Nombre de films dans la liste : ", filmsUniques.length, " nombre de seances =", seances.length);
    container.innerHTML = '';
    container.style.display = 'flex';
    filmsUniques.forEach((film) => {
        var _a;
        const divCard = document.createElement('div');
        divCard.classList.add('listFilms__simpleCard');
        // Créer l'image
        const img = document.createElement('img');
        img.classList.add('listFilms__simpleCard-img');
        if (film.imageFilm1024) {
            img.src = imageFilm(film.imageFilm1024);
        }
        else {
            console.log("Erreur imageFilm");
        }
        img.alt = (_a = film.titleFilm) !== null && _a !== void 0 ? _a : 'Affiche';
        // Titre
        const pTitre = document.createElement('p');
        pTitre.classList.add('listFilms__simpleCard-p');
        pTitre.textContent = film.titleFilm || '';
        // Ajouter au DOM
        divCard.appendChild(img);
        divCard.appendChild(pTitre);
        // Gérer la sélection
        divCard.removeEventListener('click', () => { });
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
            dataController.reservationState = ReservationState.PendingChoiceSeance;
            // Rafraîchir la page ou effectuer des actions supplémentaires
            updateContentPage(dataController);
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
export function afficherDetailsFilm() {
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
        <img src="${imageFilm((_a = film.imageFilm1024) !== null && _a !== void 0 ? _a : '')}" alt="Affiche" class="twocolumns__left-img">
        <button class="twocolumns__left-button-bo" id="openModal">Bande Annonce</button>
        <div class="evaluation__note">
            <p class="evaluation__note-p">Avis : ${film.note} / 5</p>
        </div>
        <div class="evaluation__coupdecoeur"  style="visibility: ${film.isCoupDeCoeur ? 'visible' : 'hidden'}">
            <p class="evaluation__coupdecoeur-p">Coup de coeur</p>
            <img src="assets/heart.svg" alt="Coeur" class="evaluation__coupdecoeur-img">
        </div>
                
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
function afficherSemaines(dateDebut = new Date(), isInitial = true) {
    const panelTabs = document.querySelector('.panel__tabs');
    if (!panelTabs)
        return;
    if (!dataController.selectedFilmUUID)
        return;
    const filmId = dataController.selectedFilmUUID;
    // Vider le contenu
    panelTabs.innerHTML = '';
    // Dates localisées à midi, pour éviter le décalage de fuseau horaire
    // On se positionne par rapport à la date de la premiere projection situé dans le futur
    let dPremierJour = dataController.premierJour(dataController.selectedFilmUUID);
    if (formatDateLocalYYYYMMDD(dPremierJour) < formatDateLocalYYYYMMDD(new Date())) {
        dPremierJour = new Date();
    }
    const dDebut = creerDateLocale(dateDebut);
    // Calcul de la date de fin : 
    //   - Soit jusqu'au mardi suivant (cas initial)
    //   - Soit +6 jours (7 jours) dans les autres cas
    const finAffichage = isInitial ? dateProchainMardi(dateDebut) : ajouterJours(dDebut, 6);
    // Si on n'a pas de seance pour le film dans la semaine, on ne fait rien.
    if (dataController.seancesFilmDureeJour(filmId, dDebut, 6).length === 0)
        return;
    // === Bouton "Avant" ===
    // On ne l’affiche pas pour le cas initial
    // Et seulement si la dateDebut est postérieure à la date de premiere projection
    if (!isInitial && dDebut.getTime() > dPremierJour.getTime()) {
        const avant = document.createElement('p');
        avant.classList.add('tabs__tab-p', 'tabs__tab-nav-p', 'tabs__tab-nav-prec-p');
        avant.textContent = 'Avant';
        avant.addEventListener('click', () => {
            const dateAvant = ajouterJours(dDebut, -7);
            // Si on revient sur ou avant la date de premiere projection, on repasse en mode initial
            // On affiche la semaine ou le debut de semaine dans tab
            // On se positionne sur le premier jour de la semaine
            if (dateAvant.getTime() <= dPremierJour.getTime()) {
                afficherSemaines(dPremierJour, true);
                afficherSeancesDuJour(dPremierJour);
            }
            else {
                afficherSemaines(dateAvant, false);
                afficherSeancesDuJour(dateAvant);
            }
        });
        panelTabs.appendChild(avant);
    }
    // === Boucle d’affichage des jours ===
    let current = new Date(dDebut.getTime());
    let nJourAvecSeance = 0;
    while (current.getTime() <= finAffichage.getTime()) {
        // On n’affiche jamais avant aujourd’hui
        if (current.getTime() >= dPremierJour.getTime()) {
            if (dataController.seancesFilmJour(dataController.selectedFilmUUID, current).length > 0) {
                // Il y a au moins une séance pour ce film ce jour
                nJourAvecSeance += 1;
                const jourItem = document.createElement('p');
                jourItem.classList.add('tabs__tab-p', 'tabs__tab-day-p');
                jourItem.textContent = formatDateJJMM(current);
                // Capturer la date dans une closure pour éviter le décalage
                const dateForHandler = new Date(current.getTime());
                jourItem.addEventListener('click', () => {
                    afficherSeancesDuJour(dateForHandler);
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
            afficherSemaines(dateApres, false);
            afficherSeancesDuJour(dateApres);
        });
        panelTabs.appendChild(apres);
    }
}
/**
* Affiche la liste des séances dans la zone .panel__choix .panel__seances
* pour un filmId donné à une date précise.
*/
function afficherSeancesDuJour(dateSelectionnee) {
    return __awaiter(this, void 0, void 0, function* () {
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
        let seancesFilmDuJour = dataController.seancesFilmJour(dataController.selectedFilmUUID, dateSelectionnee);
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
        // On met à jour les séances que l'on va afficher
        const uuids = seancesFilmDuJour.map(seance => seance.seanceId);
        yield dataController.updateSeances(uuids);
        // On reconstruit les séance du jour
        seancesFilmDuJour = dataController.seancesFilmJour(dataController.selectedFilmUUID, dateSelectionnee);
        seancesFilmDuJour.forEach(seance => {
            var _a;
            if (parseInt((_a = seance.numFreeSeats) !== null && _a !== void 0 ? _a : "10", 10) > 0) {
                // Générer la card
                const card = seanceCardView(seance, dateSelectionnee);
                card.classList.remove("seances__cardseance-selected");
                // Au clic sur la séance => exemple : basculer sur panel__reserve
                card.removeEventListener('click', () => { });
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
                    console.log("SeanceId selectionnee = " + dataController.selectedSeanceUUID + ", seance = " + dataController.seanceSelected().dateJour + ","
                        + dataController.seanceSelected().hourBeginHHSMM);
                    // Changement du libelle du bouton 
                    const buttonPanel = document.getElementById("panel__choixseance-button");
                    if (buttonPanel) {
                        // Remplacer l'élément par une copie de lui-même (supprime les écouteurs existants)
                        const newButtonPanel = buttonPanel.cloneNode(true);
                        newButtonPanel.classList.remove("inactif");
                        newButtonPanel.textContent = "Je réserve pour cette séance !";
                        buttonPanel.replaceWith(newButtonPanel);
                        // Configuration du passage à l'étape de choix des places
                        newButtonPanel.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                            if (buttonPanel) {
                                basculerPanelReserve();
                                dataController.reservationState = ReservationState.PendingChoiceSeats;
                                updateContentPlace();
                                yield dataController.sauverEtatGlobal();
                            }
                        }));
                    }
                });
                panelChoix.appendChild(card);
            }
        });
    });
}
/**
 * Fonction de définition d'un card de seance utilisé soit dans le choix d'un seance soit pour rappeler la seance choisi
 * @param seance
 * @returns HTMLDivElement reprenant toute la présentation de la séance
 */
export function seanceCardView(seance, dateSelectionne, id = "", isAlertShowing = true) {
    var _a, _b, _c;
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
    // === Bandeau "Plus que X disponibles" ===
    const numFreeSeats = parseInt((_a = seance.numFreeSeats) !== null && _a !== void 0 ? _a : "10", 10);
    if (isAlertShowing) {
        const bandeau = document.createElement('div');
        bandeau.classList.add('cardseance__bandeau');
        if (numFreeSeats === 0) {
            bandeau.textContent = `______COMPLET_____`;
            card.appendChild(bandeau);
        }
        else if (numFreeSeats <= 10) {
            bandeau.textContent = `Plus que ${seance.numFreeSeats} places disponibles`;
            card.appendChild(bandeau);
        }
    }
    dateInnerDiv.appendChild(pMonth);
    dateInnerDiv.appendChild(pDay);
    const salleP = document.createElement('p');
    salleP.classList.add('datesalle__salle-p');
    salleP.textContent = (_b = seance.nameSalle) !== null && _b !== void 0 ? _b : 'Salle ?';
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
    pBo.textContent = (_c = seance.bo) !== null && _c !== void 0 ? _c : 'VF';
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
export function basculerPanelReserve() {
    const panelChoix = document.querySelector('.panel__choix');
    const panelReservation = document.querySelector('.panel__reserve');
    if ((panelChoix) && (panelReservation)) {
        panelChoix.style.display = 'none';
        panelReservation.style.display = 'flex';
    }
}
/**
 * Bascule vers le panel Choix
 */
export function basculerPanelChoix() {
    const panelChoix = document.querySelector('.panel__choix');
    const panelReservation = document.querySelector('.panel__reserve');
    if ((panelChoix) && (panelReservation)) {
        panelChoix.style.display = 'block';
        panelReservation.style.display = 'none';
    }
}
