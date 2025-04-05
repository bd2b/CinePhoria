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
import { filmsSelectAllApi } from './NetworkController.js';
export function onLoadManageFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadFilms");
        // On charge menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // 3) Rafraîchir la liste
        rafraichirListeFilms();
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
        // Charger les films
        let films = yield filmsSelectAllApi();
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
/* -------------------------------------------
   Affichage de la card d'un film
------------------------------------------- */
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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const containerDetail = document.querySelector('.films__detailFilm');
        if (!containerDetail)
            return;
        // Mise à jour des affiches
        const afficheSmall = document.getElementById('affiche-small');
        afficheSmall.src = `assets/static/${film.imageFilm128}`;
        const afficheLarge = document.getElementById('affiche-large');
        afficheLarge.src = `assets/static/${film.imageFilm1024}`;
        // Nom du film
        const nomFilm = document.getElementById('titleFilm');
        if (nomFilm)
            nomFilm.textContent = (_a = film.titleFilm) !== null && _a !== void 0 ? _a : '';
        // Genres
        const genreFilm = document.getElementById('genreArray');
        if (genreFilm)
            genreFilm.textContent = (_b = film.genreArray) !== null && _b !== void 0 ? _b : '';
        // Réalisateur
        const realisateurFilm = document.getElementById('filmAuthor');
        if (realisateurFilm)
            realisateurFilm.textContent = (_c = film.filmAuthor) !== null && _c !== void 0 ? _c : '';
        // Durée
        const dureeFilm = document.getElementById('duration');
        if (dureeFilm)
            dureeFilm.textContent = (_d = film.duration) !== null && _d !== void 0 ? _d : '';
        // Pitch
        const pitchFilm = document.getElementById('filmPitch');
        if (pitchFilm)
            pitchFilm.textContent = (_e = film.filmPitch) !== null && _e !== void 0 ? _e : '';
        // Distribution
        const distributionFilm = document.getElementById('filmDistribution');
        if (distributionFilm)
            distributionFilm.textContent = (_f = film.filmDistribution) !== null && _f !== void 0 ? _f : '';
        // Catégorie de public
        const categoriePublic = containerDetail.querySelector('#title__filter-dropdown-button-genre');
        if (categoriePublic)
            categoriePublic.innerHTML = `${film.categorySeeing}<span class="chevron">▼</span>`;
        // Coup de cœur
        const coupDeCoeurCheckbox = containerDetail.querySelector('#coupCoeur');
        if (coupDeCoeurCheckbox)
            coupDeCoeurCheckbox.checked = (_g = film.isCoupDeCoeur) !== null && _g !== void 0 ? _g : false;
        // Description
        const descriptionFilm = document.getElementById('filmDescription');
        if (descriptionFilm)
            descriptionFilm.textContent = (_h = film.filmDescription) !== null && _h !== void 0 ? _h : '';
        console.log("Détail affiché pour " + film.titleFilm);
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
