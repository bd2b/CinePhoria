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
        const containerDetail = document.querySelector('.films__detailFilm');
        if (!containerDetail)
            return;
        // A compléter
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
