var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dataController } from './DataController.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
export function onLoadManageFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadFilms");
        // 1) On initialise le dataController si il est vide
        if (dataController.allSeances.length === 0)
            yield dataController.init();
        // On charge menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // 2) Init filtres
        yield initFiltreCinema();
        yield initFiltreGenre();
        //  await initFiltreJour();
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
                // await construireListeJours();
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
            // await construireListeJours();
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
                // await construireListeJours();
                yield rafraichirListeFilms();
            }));
            dropdownContent.appendChild(a);
        });
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
        // if (filtreJour) {
        //     films = films.filter((f) => {
        //         const seancesFilm = dataController.seancesFilm(f.id);
        //         return seancesFilm.some((s) =>
        //             s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false
        //         );
        //     });
        // }
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
        // const tableSeances = buildTableSeances(film);
        // rightFilmDiv.appendChild(tableSeances);
    });
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
