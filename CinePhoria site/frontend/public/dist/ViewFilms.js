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
import { setCookie } from './Helpers.js';
let filtreCinema = dataController.nameCinema;
let filtreGenre = 'all';
let filtreJour = '';
export function onLoadFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadFilms");
        // 1) Charger le dataController
        yield dataController.chargerComplet();
        // 2) Init filtres
        yield initFiltreCinema();
        yield initFiltreGenre();
        yield initFiltreJour();
        // 3) Rafraîchir la liste
        rafraichirListeFilms();
        // 4) Gérer la modal BO
        initModalBandeAnnonce();
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
            const mustDisplayButton = ["PendingChoiceSeance", "PendingChoiceSeats"].includes(dataController.reservationState);
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
            if (filtreCinema === 'all') {
                titleLeft.innerText = 'Les films de CinePhoria';
            }
            else {
                titleLeft.innerText = `Les films de CinePhoria à ${filtreCinema}`;
            }
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
                    filtreCinema = 'all';
                }
                else {
                    filtreCinema = val; // ex: "Paris"
                }
                // Mettre à jour dataController.nameCinema si on veut recharger :
                //    dataController.nameCinema = (filtreCinema === 'all') ? 'all' : filtreCinema;
                //    => ça peut provoquer un rechargement depuis l'API si on a codé nameCinema ainsi
                //    ou on peut simplement filtrer en local
                console.log("Choix du filtre Cinema = ", filtreCinema);
                // Stocker dans le cookie pour 30 jours
                setCookie('selectedCinema', filtreCinema, 30);
                // Mettre à jour l'affichage du bouton
                updateDropdownDisplay(val);
                // Mettre à jour le titre droit
                const titleLeft = document.getElementById('titleLeft');
                if (titleLeft) {
                    if (filtreCinema === 'all') {
                        titleLeft.innerText = 'Les films de CinePhoria';
                    }
                    else {
                        titleLeft.innerText = `Les films de CinePhoria à ${val}`;
                    }
                }
                dataController.nameCinema = filtreCinema;
                yield dataController.init();
                // Rafraichir le dropdown des genres
                initFiltreGenre;
                // Rafraichir la liste des jours
                construireListeJours();
                // Rafraichir la liste des films
                rafraichirListeFilms();
            }));
        });
    });
}
function initFiltreGenre() {
    return __awaiter(this, void 0, void 0, function* () {
        const dropdownGenre = document.querySelector('.titre__filter-dropdown-genre');
        if (!dropdownGenre)
            return;
        const dropdownContent = dropdownGenre.querySelector('.title__filter-button-drowdown-content');
        if (!dropdownContent)
            return;
        // Pour être dynamique, on va extraire tous les genres dans dataController.allFilms ou allSeances
        // Regrouper dans un set
        const genreSet = new Set();
        dataController.allFilms.forEach((f) => {
            if (f.genreArray) {
                f.genreArray.split(',').forEach((g) => genreSet.add(g.trim()));
            }
        });
        // Vider le dropdownContent, ajouter un item "Tous"
        dropdownContent.innerHTML = '';
        const aTous = document.createElement('a');
        aTous.href = '#';
        aTous.textContent = 'Tous les genres';
        aTous.addEventListener('click', (ev) => {
            ev.preventDefault();
            filtreGenre = 'all';
            rafraichirListeFilms();
        });
        dropdownContent.appendChild(aTous);
        // Créer un <a> par genre
        genreSet.forEach((genre) => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = genre;
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                filtreGenre = genre;
                rafraichirListeFilms();
            });
            dropdownContent.appendChild(a);
        });
    });
}
function initFiltreJour() {
    return __awaiter(this, void 0, void 0, function* () {
        // On va imaginer un simple <input type="date"> qu’on injecte, 
        // ou un dropdown -> Pour la démo, on crée un <div class="filter-jour">...
        // On va remplir dynamiquement les <option> (ou <a>) correspondant aux jours
        // dans la fourchette couverte par dataController.allSeances
        // 1) On insère un <input type="date"> en plus, ou on le rajoute dans la page
        let containerFilters = document.querySelector('.title__filters-films');
        if (!containerFilters)
            return;
        let inputDate = document.createElement('input');
        inputDate.type = 'date';
        inputDate.classList.add('filter-jour-input');
        containerFilters.appendChild(inputDate);
        // 2) On limite les min et max
        const allDates = dataController.allSeances.map((s) => s.dateJour).filter(Boolean);
        if (allDates.length > 0) {
            const sortedDates = allDates.sort();
            inputDate.min = sortedDates[0];
            inputDate.max = sortedDates[sortedDates.length - 1];
        }
        // 3) On écoute les changements
        inputDate.addEventListener('change', () => {
            filtreJour = inputDate.value; // ex. "2025-03-15"
            rafraichirListeFilms();
        });
        // 4) Construire initialement la liste des jours activables
        construireListeJours();
    });
}
function construireListeJours() {
    // Si on veut restreindre inputDate aux jours qui ont des séances 
    // correspondant au cinema sélectionné (et potentiellement d’autres filtres),
    // on peut ajuster inputDate.min / inputDate.max ou un <datalist>.
    // Ici, on se contente de recalculer min/max 
    // en fonction du cinema filtré ?
    // Dans la démo, on fait simple : 
    //   - si filtreCinema=all, on prend dataController.allSeances 
    //   - sinon on filtre : .filter(s => s.nameCinema === filtreCinema)
    //   - on trie par date
    //   - on set le min / max
    const inputDate = document.querySelector('.filter-jour-input');
    if (!inputDate)
        return;
    let seances = dataController.allSeances;
    if (filtreCinema !== 'all') {
        seances = seances.filter((s) => s.nameCinema === filtreCinema);
    }
    const datesValides = seances.map((s) => s.dateJour || '').filter(Boolean).sort();
    if (datesValides.length === 0) {
        inputDate.min = '';
        inputDate.max = '';
        return;
    }
    inputDate.min = datesValides[0];
    inputDate.max = datesValides[datesValides.length - 1];
}
/* -------------------------------------------
   Affichage Liste de Films
------------------------------------------- */
function rafraichirListeFilms() {
    const container = document.querySelector('.films__listFilms');
    if (!container)
        return;
    container.innerHTML = '';
    // Filtrer
    let films = dataController.allFilms;
    // Cinéma
    if (filtreCinema !== 'all') {
        films = films.filter((f) => {
            const seancesFilm = dataController.seancesFilm(f.id);
            return seancesFilm.some((s) => s.nameCinema === filtreCinema);
        });
    }
    // Genre
    if (filtreGenre !== 'all') {
        films = films.filter((f) => {
            if (!f.genreArray)
                return false;
            const genres = f.genreArray.split(',').map((g) => g.trim().toLowerCase());
            return genres.includes(filtreGenre.toLowerCase());
        });
    }
    // Jour
    if (filtreJour) {
        films = films.filter((f) => {
            const seancesFilm = dataController.seancesFilm(f.id);
            return seancesFilm.some((s) => s.dateJour === filtreJour);
        });
    }
    // Construire les cards
    films.forEach((film) => {
        const card = buildFilmCard(film);
        container.appendChild(card);
    });
    // (3) Afficher le premier film dans le détail s'il y en a
    if (films.length > 0) {
        afficherDetailFilm(films[0]);
    }
    else {
        // Sinon, vider la zone détail
        effacerDetailFilm();
    }
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
    // (1) Insérer le tableau des séances sous la distribution
    const rightFilmDiv = containerDetail.querySelector('.right__film');
    if (!rightFilmDiv)
        return;
    // Nettoyer un éventuel tableau précédent
    const oldTable = rightFilmDiv.querySelector('.tabseance__commande-table');
    if (oldTable)
        oldTable.remove();
    const tableSeances = buildTableSeances(film);
    rightFilmDiv.appendChild(tableSeances);
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
function buildTableSeances(film) {
    // Au lieu de renvoyer un <table>, on renvoie un <div>
    const container = document.createElement('div');
    container.classList.add('table-scroll');
    // Créer le tableau
    const table = document.createElement('table');
    table.classList.add('tabseance__commande-table');
    // Thead
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    ['Jour', 'Cinéma', 'Horaire', 'Qualité', 'Tarifs'].forEach((hdr) => {
        const th = document.createElement('th');
        th.textContent = hdr;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
    // Tbody
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    // Récupérer toutes les séances du film, trier
    let seances = dataController.seancesFilm(film.id);
    seances.sort((a, b) => {
        var _a, _b, _c, _d;
        if (a.dateJour === b.dateJour) {
            return ((_a = a.hourBeginHHSMM) !== null && _a !== void 0 ? _a : '').localeCompare((_b = b.hourBeginHHSMM) !== null && _b !== void 0 ? _b : '');
        }
        return ((_c = a.dateJour) !== null && _c !== void 0 ? _c : '').localeCompare((_d = b.dateJour) !== null && _d !== void 0 ? _d : '');
    });
    seances.forEach((seance) => {
        const row = document.createElement('tr');
        // Format date
        let dayStr = '';
        if (seance.dateJour) {
            const dateObj = new Date(seance.dateJour);
            if (!isNaN(dateObj.getTime())) {
                const d = String(dateObj.getDate()).padStart(2, '0');
                const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                const y = dateObj.getFullYear();
                dayStr = `${d}/${m}/${y}`;
            }
        }
        const cinema = seance.nameCinema || '';
        const horaire = `${seance.hourBeginHHSMM || ''} - ${seance.hourEndHHSMM || ''}`;
        const qualite = seance.qualite || '';
        // Tarifs
        const listTarifs = dataController.allTarifQualite
            .filter((t) => t.qualite === qualite)
            .map((t) => `${t.nameTarif} (${t.price}€)`)
            .join(', ');
        // 5 cellules
        const tdJour = document.createElement('td');
        tdJour.textContent = dayStr;
        const tdCinema = document.createElement('td');
        tdCinema.textContent = cinema;
        const tdHoraire = document.createElement('td');
        tdHoraire.textContent = horaire;
        const tdQualite = document.createElement('td');
        tdQualite.textContent = qualite;
        const tdTarifs = document.createElement('td');
        tdTarifs.textContent = listTarifs;
        row.append(tdJour, tdCinema, tdHoraire, tdQualite, tdTarifs);
        tbody.appendChild(row);
    });
    // Mettre le tableau dans le conteneur
    container.appendChild(table);
    return container;
}
/* -------------------------------------------
   Modal Bande-Annonce
------------------------------------------- */
function initModalBandeAnnonce() {
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
