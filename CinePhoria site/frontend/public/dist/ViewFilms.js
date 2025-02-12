var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ViewFilm.ts
import { dataController } from './DataController.js';
import { formatDateLocalYYYYMMDD } from './Helpers.js';
import { ReservationState } from './shared-models/Reservation.js';
//let dataController.filterNameCinema = dataController.filterNameCinema;
// let filtreGenre = dataController.filterGenre;
let filtreJour = '';
export function onLoadFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadFilms");
        // On initialise le dataController si il est vide
        if (dataController.allSeances.length === 0)
            yield dataController.init();
        // 2) Init filtres
        yield initFiltreCinema();
        yield initFiltreGenre();
        yield initFiltreJour();
        // 3) Rafraîchir la liste
        rafraichirListeFilms();
    });
}
/* -------------------------------------------
   Filtres
------------------------------------------- */
function initFiltreCinema() {
    return __awaiter(this, void 0, void 0, function* () {
        // Fonction de mise à jour l'affichage du bouton du dropdown
        function updateDropdownDisplay(textButton) {
            const dropdownButtons = document.querySelectorAll('.titre__filter-dropdown-complexe');
            dropdownButtons.forEach((button) => {
                button.style.display = "block";
                button.innerHTML = `${textButton} <span class="chevron">▼</span>`;
            });
        }
        const dropdownCinema = document.querySelector('.titre__filter-dropdown-cinema');
        if (!dropdownCinema)
            return;
        // Trouver la div de dropdown
        const dropdownContent = dropdownCinema.querySelector('.title__filter-button-drowdown-content');
        if (!dropdownContent)
            return;
        console.log("Init dropdown Cinema");
        // Mettre à jour le titre droit
        const titleLeft = document.getElementById('titleLeft');
        if (titleLeft) {
            if (dataController.filterNameCinema === 'all') {
                titleLeft.innerText = 'Les films de CinePhoria';
            }
            else {
                titleLeft.innerText = `Les films de CinePhoria à ${dataController.filterNameCinema}`;
            }
        }
        // Mettre à jour le bouton
        if (dataController.filterNameCinema === 'all') {
            updateDropdownDisplay('Tous les complexes');
        }
        else {
            updateDropdownDisplay(dataController.filterNameCinema);
        }
        // Dans le HTML, on a déjà <a href="#">Tous les complexes</a>, <a href="#">Paris</a> ...
        // On écoute le clic sur chaque <a>
        const links = dropdownContent.querySelectorAll('a');
        links.forEach((link) => {
            link.removeEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () { }));
            link.addEventListener('click', (ev) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                ev.preventDefault();
                const val = ((_a = link.dataset.cinema) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                if (val === 'Tous les complexes') {
                    dataController.filterNameCinema = 'all';
                }
                else {
                    dataController.filterNameCinema = val; // ex: "Paris"
                }
                console.log("Choix du filtre Cinema = ", dataController.filterNameCinema);
                // Mettre à jour l'affichage du bouton
                updateDropdownDisplay(val);
                // Mettre à jour le titre droit
                const titleLeft = document.getElementById('titleLeft');
                if (titleLeft) {
                    if (dataController.filterNameCinema === 'all') {
                        titleLeft.innerText = 'Les films de CinePhoria';
                    }
                    else {
                        titleLeft.innerText = `Les films de CinePhoria à ${val}`;
                    }
                }
                yield dataController.init();
                // Rafraichir le dropdown des genres
                yield initFiltreGenre();
                // Rafraichir la liste des jours
                yield construireListeJours();
                // Rafraichir la liste des films
                yield rafraichirListeFilms();
            }));
        });
    });
}
function initFiltreGenre() {
    return __awaiter(this, void 0, void 0, function* () {
        // Fonction de mise à jour l'affichage du bouton du dropdown
        function updateDropdownDisplay(textButton) {
            const dropdownButton = document.getElementById('title__filter-dropdown-button-genre');
            if (!dropdownButton)
                return;
            dropdownButton.innerHTML = `${textButton} <span class="chevron">▼</span>`;
        }
        const dropdownGenre = document.querySelector('.titre__filter-dropdown-genre');
        if (!dropdownGenre)
            return;
        const dropdownContent = dropdownGenre.querySelector('.title__filter-button-drowdown-content');
        if (!dropdownContent)
            return;
        // Vider le dropdownContent, ajouter un item "Tous"
        dropdownContent.innerHTML = '';
        const aTous = document.createElement('a');
        aTous.href = '#';
        aTous.textContent = 'Tous les genres';
        aTous.addEventListener('click', (ev) => __awaiter(this, void 0, void 0, function* () {
            ev.preventDefault();
            dataController.filterGenre = 'all';
            updateDropdownDisplay('Tous les genres');
            yield construireListeJours();
            yield rafraichirListeFilms();
        }));
        dropdownContent.appendChild(aTous);
        // Créer un <a> par genre
        dataController.genreSet.forEach((genre) => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = genre;
            a.addEventListener('click', (ev) => __awaiter(this, void 0, void 0, function* () {
                ev.preventDefault();
                dataController.filterGenre = genre;
                updateDropdownDisplay(genre);
                yield construireListeJours();
                yield rafraichirListeFilms();
            }));
            dropdownContent.appendChild(a);
        });
    });
}
function initFiltreJour() {
    return __awaiter(this, void 0, void 0, function* () {
        // On met en place un input que l'on ajuste aux jours
        // dans la fourchette couverte par dataController.genre (soit all filtré par le cinema et le filtre genres)
        // 1) On insère un <input type="date"> en plus, ou on le rajoute dans la page
        let containerFilters = document.querySelector('.title__filters-films');
        if (!containerFilters)
            return;
        let inputDate = document.createElement('input');
        inputDate.type = 'date';
        inputDate.classList.add('filter-jour-input');
        containerFilters.prepend(inputDate);
        // 4) On écoute les changements
        inputDate.removeEventListener('change', () => __awaiter(this, void 0, void 0, function* () { }));
        inputDate.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
            filtreJour = inputDate.value; // ex. "2025-03-15"
            yield rafraichirListeFilms();
        }));
        // 5) Construire initialement la liste des jours activables
        yield construireListeJours();
    });
}
function construireListeJours() {
    return __awaiter(this, void 0, void 0, function* () {
        const inputDate = document.querySelector('.filter-jour-input');
        if (!inputDate)
            return;
        // 1) On isole les séances qui correspondent au filtre Cinema et genre
        const filmsGenre = dataController.filmsGenre;
        // Définition d'un Set des IDs des films
        const filmIdsSet = new Set(filmsGenre.map(film => film.id));
        // Filtrer les séances qui ont un filmId présent dans filmsGenre
        const seancesGenre = dataController.seances.filter(s => s.filmId !== undefined && filmIdsSet.has(s.filmId));
        // 3) On calcule les dates min et max et on applique sur le champ date
        const allDates = seancesGenre.map((s) => s.dateJour).filter(Boolean).sort();
        if (allDates.length > 0) {
            const dateMinYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[0]));
            const dateMaxYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[allDates.length - 1]));
            inputDate.min = dateMinYYYYMMDD;
            inputDate.max = dateMaxYYYYMMDD;
        }
        else {
            inputDate.min = '';
            inputDate.max = '';
        }
    });
}
/* -------------------------------------------
   Affichage Liste de Films
------------------------------------------- */
function rafraichirListeFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.querySelector('.films__listFilms');
        if (!container)
            return;
        container.innerHTML = '';
        // Filtrer
        let films = dataController.filmsGenre; // Film filtré par cinema et genre
        // Jour
        if (filtreJour) {
            films = films.filter((f) => {
                const seancesFilm = dataController.seancesFilm(f.id);
                return seancesFilm.some((s) => s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false);
            });
        }
        // Construire les cards
        films.forEach((film) => {
            const card = buildFilmCard(film);
            container.appendChild(card);
        });
        // (3) Afficher le film selectionne ou le premier film de la liste
        if (films.length > 0) {
            const filmselected = dataController.selectedFilmUUID;
            if (filmselected) {
                const filmaAfficher = films.find((f) => f.id === filmselected);
                if (filmaAfficher) {
                    afficherDetailFilm(filmaAfficher);
                }
            }
            else {
                afficherDetailFilm(films[0]);
            }
        }
        else {
            // Sinon, vider la zone détail
            effacerDetailFilm();
        }
    });
}
function buildFilmCard(film) {
    var _a, _b, _c, _d;
    const divCard = document.createElement('div');
    divCard.classList.add('listFilms__simpleCard');
    const img = document.createElement('img');
    img.src = `assets/static/${(_a = film.imageFilm128) !== null && _a !== void 0 ? _a : ''}`;
    img.alt = 'Affiche';
    img.classList.add('simpleCard__affiche-img');
    const detailDiv = document.createElement('div');
    detailDiv.classList.add('simpleCard__detail');
    // Titre
    const pTitre = document.createElement('p');
    pTitre.classList.add('simpleCard__detail-titre-p');
    pTitre.textContent = (_b = film.titleFilm) !== null && _b !== void 0 ? _b : 'Sans Titre';
    // Coup de coeur + note
    const evaluationDiv = document.createElement('div');
    evaluationDiv.classList.add('simpleCard__evaluation');
    if (film.isCoupDeCoeur) {
        const cdcDiv = document.createElement('div');
        cdcDiv.classList.add('evaluation__coupdecoeur');
        const pCdc = document.createElement('p');
        pCdc.classList.add('evaluation__coupdecoeur-p');
        pCdc.textContent = 'Coup de coeur';
        const imgCdc = document.createElement('img');
        imgCdc.src = 'assets/heart.svg';
        imgCdc.alt = 'Coeur';
        imgCdc.classList.add('evaluation__coupdecoeur-img');
        cdcDiv.append(pCdc, imgCdc);
        evaluationDiv.appendChild(cdcDiv);
    }
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('evaluation__note');
    const pNote = document.createElement('p');
    pNote.classList.add('evaluation__note-p');
    pNote.textContent = `Avis : ${(_c = film.note) !== null && _c !== void 0 ? _c : 0} / 5`;
    noteDiv.appendChild(pNote);
    evaluationDiv.appendChild(noteDiv);
    // Pitch
    const pPitch = document.createElement('p');
    pPitch.classList.add('simpleCard__detail-pitch-p');
    pPitch.textContent = (_d = film.filmPitch) !== null && _d !== void 0 ? _d : '';
    detailDiv.append(pTitre, evaluationDiv, pPitch);
    divCard.append(img, detailDiv);
    // Clic -> détail
    divCard.addEventListener('click', () => {
        afficherDetailFilm(film);
    });
    return divCard;
}
/* -------------------------------------------
Affichage Détail Film
------------------------------------------- */
function afficherDetailFilm(film) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const containerDetail = document.querySelector('.films__detailFilm');
        if (!containerDetail)
            return;
        // Image
        const imgAffiche = containerDetail.querySelector('.twocolumns__left-img');
        if (imgAffiche) {
            imgAffiche.src = `assets/static/${(_a = film.imageFilm1024) !== null && _a !== void 0 ? _a : ''}`;
            imgAffiche.alt = (_b = film.titleFilm) !== null && _b !== void 0 ? _b : 'Affiche';
        }
        // Titre
        const titleP = containerDetail.querySelector('.right__title-p');
        if (titleP)
            titleP.textContent = (_c = film.titleFilm) !== null && _c !== void 0 ? _c : '';
        // Genre / Durée / Public
        const genreP = containerDetail.querySelector('.caractFilm__genre-p');
        if (genreP)
            genreP.textContent = (_d = film.genreArray) !== null && _d !== void 0 ? _d : '';
        const dureeP = containerDetail.querySelector('.caractFilm__duree-p');
        if (dureeP)
            dureeP.textContent = (_e = film.duration) !== null && _e !== void 0 ? _e : '';
        const publicP = containerDetail.querySelector('.caractFilm__public-p');
        if (publicP)
            publicP.textContent = (_f = film.categorySeeing) !== null && _f !== void 0 ? _f : '';
        // Description
        const descP = containerDetail.querySelector('.right__description-p');
        if (descP)
            descP.textContent = (_g = film.filmDescription) !== null && _g !== void 0 ? _g : '';
        // Auteur
        const authorP = containerDetail.querySelector('.right__author-p');
        if (authorP)
            authorP.textContent = (_h = film.filmAuthor) !== null && _h !== void 0 ? _h : '';
        // Distribution
        const distrP = containerDetail.querySelector('.right__distribution');
        if (distrP)
            distrP.textContent = (_j = film.filmDistribution) !== null && _j !== void 0 ? _j : '';
        // Bande-Annonce
        const linkBO = film.linkBO;
        if (linkBO)
            initModalBandeAnnonce(linkBO);
        // Tableau des seances
        const rightFilmDiv = containerDetail.querySelector('.right__film');
        if (!rightFilmDiv)
            return;
        // Supprimer .table-scroll (et pas seulement .tabseance__commande-table)
        const oldScrollDiv = rightFilmDiv.querySelector('.table-scroll');
        if (oldScrollDiv) {
            oldScrollDiv.remove();
        }
        // Recréer
        const tableSeances = buildTableSeances(film);
        rightFilmDiv.appendChild(tableSeances);
        // Désactiver le bouton "Je réserve" à chaque fois qu'on change de film
        const reserveBtn = containerDetail.querySelector('.right__jereserve-button');
        if (reserveBtn) {
            reserveBtn.disabled = true;
            reserveBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                if (!lastSelectedSeanceData) {
                    alert('Veuillez sélectionner une séance dans la liste.');
                }
                else {
                    if (["ReserveCompteToConfirm", "ReserveMailToConfirm",
                        "ReserveToConfirm"].includes(dataController.reservationState)) {
                        alert("Une autre réservation est en cours, vous devez la finaliser ou l'annuler avant d'en effectuer une nouvelle");
                    }
                    else {
                        // Afficher un message
                        const { Jour, Cinema, Horaire, Qualite, Tarifs, SeanceId } = lastSelectedSeanceData;
                        const seance = dataController.seances.find((s) => s.seanceId === SeanceId);
                        if (seance) {
                            dataController.filterNameCinema = Cinema;
                            dataController.selectedSeanceUUID = SeanceId;
                            dataController.selectedFilmUUID = seance.filmId || '';
                            dataController.selectedSeanceDate = new Date(seance.dateJour || '');
                            dataController.reservationState = ReservationState.PendingChoiceSeats;
                            yield dataController.sauverComplet();
                            window.location.href = 'reservation.html';
                            alert(`Séance sélectionnée :\nJour : ${Jour}\nCinéma : ${Cinema}\nHoraire : ${Horaire}\nQualité : ${Qualite}\nTarifs : ${Tarifs}`);
                        }
                    }
                }
            }));
        }
    });
}
function effacerDetailFilm() {
    // Optionnel : Vider la zone
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail)
        return;
    const imgAffiche = containerDetail.querySelector('.twocolumns__left-img');
    if (imgAffiche)
        imgAffiche.src = '';
    // etc. ou tout effacer
}
/**
 * Construit un conteneur <div> + tableau pour afficher les séances du film.
 * - Thead doit rester fixe
 * - Tbody défile
 * - Hover sur la ligne
 * - Au clic sur la ligne => stocker la séance, activer le bouton "Je réserve"
 */
let lastSelectedSeanceData = null;
let lastSelectedRow = null;
function buildTableSeances(film) {
    const container = document.createElement('div');
    container.classList.add('table-scroll');
    const table = document.createElement('table');
    table.classList.add('tabseance__commande-table');
    // THEAD
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    ['Jour', 'Cinéma', 'Horaire', 'Qualité', 'Tarifs'].forEach((hdr) => {
        const th = document.createElement('th');
        th.textContent = hdr;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
    // TBODY
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    // Récup seances, tri...
    let seances = dataController.seancesFilm(film.id);
    // Tri
    seances.sort((a, b) => {
        var _a, _b, _c, _d;
        if (a.dateJour === b.dateJour) {
            return ((_a = a.hourBeginHHSMM) !== null && _a !== void 0 ? _a : '').localeCompare((_b = b.hourBeginHHSMM) !== null && _b !== void 0 ? _b : '');
        }
        return ((_c = a.dateJour) !== null && _c !== void 0 ? _c : '').localeCompare((_d = b.dateJour) !== null && _d !== void 0 ? _d : '');
    });
    // Remplir tbody
    seances.forEach((seance) => {
        const row = document.createElement('tr');
        // Calcul dayStr, cinema, horaire, qualite, listTarifs et seanceId
        const dayStr = formatDateLocalYYYYMMDD(new Date(seance.dateJour || ''));
        const cinema = seance.nameCinema || '';
        const horaire = `${seance.hourBeginHHSMM || ''} - ${seance.hourEndHHSMM || ''}`;
        const qualite = seance.qualite || '';
        const listTarifs = dataController.allTarifQualite
            .filter((t) => t.qualite === qualite)
            .map((t) => `${t.nameTarif} (${t.price}€)`).join(', ');
        const seanceId = seance.seanceId;
        // 5 cellules
        const tdDay = document.createElement('td');
        tdDay.textContent = dayStr;
        const tdCinema = document.createElement('td');
        tdCinema.textContent = cinema;
        const tdHoraire = document.createElement('td');
        tdHoraire.textContent = horaire;
        const tdQual = document.createElement('td');
        tdQual.textContent = qualite;
        const tdTarifs = document.createElement('td');
        tdTarifs.textContent = listTarifs;
        row.append(tdDay, tdCinema, tdHoraire, tdQual, tdTarifs);
        // Clic => selection
        row.addEventListener('click', () => {
            // 1) Retirer la classe selected-row de l'ancienne row
            if (lastSelectedRow && lastSelectedRow !== row) {
                lastSelectedRow.classList.remove('selected-row');
            }
            // 2) Ajouter la classe selected-row sur la row
            row.classList.add('selected-row');
            lastSelectedRow = row;
            // 3) Stocker les infos
            lastSelectedSeanceData = {
                Jour: dayStr,
                Cinema: cinema,
                Horaire: horaire,
                Qualite: qualite,
                Tarifs: listTarifs,
                SeanceId: seanceId
            };
            // 4) Activer le bouton
            const reserveBtn = document.querySelector('.right__jereserve-button');
            if (reserveBtn) {
                reserveBtn.disabled = false;
            }
        });
        tbody.appendChild(row);
    });
    container.appendChild(table);
    return container;
}
/* -------------------------------------------
   Modal Bande-Annonce
------------------------------------------- */
function initModalBandeAnnonce(linkBO) {
    /* Configuration du bouton d'affichage de la bande annonce */
    /* Bouton dans le corps HTML */
    const openModalBtn = document.getElementById('openModal');
    /* div de la modal dans le HTML */
    const modal = document.getElementById('videoModal');
    const closeModalBtn = modal === null || modal === void 0 ? void 0 : modal.querySelector('.closeyoutube');
    const youtubeVideo = document.getElementById('youtubeVideo');
    // const youtubeUrl = encodeURI(film.linkBO?.trim() ?? '');
    // const youtubeUrlDynamique = `${film.linkBO}?autoplay=1`;;
    const youtubeUrlDynamique = `${linkBO}?autoplay=1`;
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
function initModalBandeAnnonce2() {
    const modal = document.getElementById('videoModal');
    const spanClose = modal === null || modal === void 0 ? void 0 : modal.querySelector('.close');
    if (spanClose) {
        spanClose.addEventListener('click', () => {
            fermerModalBA();
        });
    }
    const btnOpen = document.getElementById('openModal');
    btnOpen === null || btnOpen === void 0 ? void 0 : btnOpen.addEventListener('click', () => {
        // Juste un test: lien youtube par défaut
        ouvrirModalBA('https://www.youtube.com/embed/XXXXXXXX');
    });
}
function ouvrirModalBA(url) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('youtubeVideo');
    if (!modal || !iframe)
        return;
    iframe.src = url;
    modal.style.display = 'block';
}
function fermerModalBA() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('youtubeVideo');
    if (modal)
        modal.style.display = 'none';
    if (iframe)
        iframe.src = '';
}
