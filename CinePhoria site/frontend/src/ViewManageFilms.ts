import { dataController } from './DataController.js';
import { formatDateLocalYYYYMMDD, setCookie } from './Helpers.js';
import { Film } from './shared-models/Film.js';
import { ReservationState } from './shared-models/Reservation.js';
import { Seance } from './shared-models/Seance.js';
import { TarifQualite } from './shared-models/Seance.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { isUUID } from './Helpers.js';
import { filmsCreateApi , filmsDeleteApi, filmsSelectAllApi, filmsSelectApi, filmsUpdateApi } from './NetworkController.js';
import { createAfficheApi, deleteAfficheApi, getAllAffichesApi, getAfficheApi, updateAfficheApi } from './NetworkController.js';


export async function onLoadManageFilms() {
    console.log("=====> chargement onLoadFilms");


    // On charge menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites() // Footer

    // 3) Rafraîchir la liste
    rafraichirListeFilms();

}



/* -------------------------------------------
   Affichage Liste de Films
------------------------------------------- */
async function rafraichirListeFilms(): Promise<void> {
    const container = document.querySelector('.films__listFilms');
    if (!container) return;
    container.innerHTML = '';

    // Charger les films
    let films = await filmsSelectAllApi();

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
        } else {
            afficherDetailFilm(films[0]);
        }
    } else {
        // Sinon, vider la zone détail
        effacerDetailFilm();
    }
}

/* -------------------------------------------
   Affichage de la card d'un film
------------------------------------------- */
function buildFilmCard(film: Film): HTMLDivElement {
    const divCard = document.createElement('div');
    divCard.classList.add('listFilms__simpleCard');

    const img = document.createElement('img');
    img.src = `assets/static/${film.imageFilm128 ?? ''}`;
    img.alt = 'Affiche';
    img.classList.add('simpleCard__affiche-img');

    const detailDiv = document.createElement('div');
    detailDiv.classList.add('simpleCard__detail');

    // Titre
    const pTitre = document.createElement('p');
    pTitre.classList.add('simpleCard__detail-titre-p');
    pTitre.textContent = film.titleFilm ?? 'Sans Titre';

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
    pNote.textContent = `Avis : ${film.note ?? 0} / 5`;
    noteDiv.appendChild(pNote);
    evaluationDiv.appendChild(noteDiv);

    // Pitch
    const pPitch = document.createElement('p');
    pPitch.classList.add('simpleCard__detail-pitch-p');
    pPitch.textContent = film.filmPitch ?? '';

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
async function afficherDetailFilm(film: Film): Promise<void> {
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail) return;

    // Mise à jour des affiches
    const afficheSmall = document.getElementById('affiche-small') as HTMLImageElement;
    afficheSmall.src = `assets/static/${film.imageFilm128}`;

    const afficheLarge = document.getElementById('affiche-large') as HTMLImageElement;
    afficheLarge.src = `assets/static/${film.imageFilm1024}`;

    // Nom du film
    const nomFilm = document.getElementById('titleFilm');
    if (nomFilm) nomFilm.textContent = film.titleFilm ?? '';

    // Genres
    const genreFilm = document.getElementById('genreArray');
    if (genreFilm) genreFilm.textContent = film.genreArray ?? '';

    // Réalisateur
    const realisateurFilm = document.getElementById('filmAuthor');
    if (realisateurFilm) realisateurFilm.textContent = film.filmAuthor ?? '';

    // Durée
    const dureeFilm = document.getElementById('duration');
    if (dureeFilm) dureeFilm.textContent = film.duration ?? ''

    // Pitch
    const pitchFilm = document.getElementById('filmPitch');
    if (pitchFilm) pitchFilm.textContent = film.filmPitch ?? '';

    // Distribution
    const distributionFilm = document.getElementById('filmDistribution');
    if (distributionFilm) distributionFilm.textContent = film.filmDistribution ?? '';

    // Catégorie de public
    const categoriePublic = containerDetail.querySelector('#title__filter-dropdown-button-genre');
    if (categoriePublic) categoriePublic.innerHTML = `${film.categorySeeing}<span class="chevron">▼</span>`;

    // Coup de cœur
    const coupDeCoeurCheckbox = containerDetail.querySelector('#coupCoeur') as HTMLInputElement;
    if (coupDeCoeurCheckbox) coupDeCoeurCheckbox.checked = film.isCoupDeCoeur ?? false;

    // Description
    const descriptionFilm = document.getElementById('filmDescription');
    if (descriptionFilm) descriptionFilm.textContent = film.filmDescription ?? '';

    console.log("Détail affiché pour " + film.titleFilm);
}

/* -------------------------------------------
   Modal Bande-Annonce
------------------------------------------- */

function initModalBandeAnnonce(linkBO: string): void {
    /* Configuration du bouton d'affichage de la bande annonce */
    /* Bouton dans le corps HTML */
    const openModalBtn = document.getElementById('openModal');
    /* div de la modal dans le HTML */
    const modal = document.getElementById('videoModal') as HTMLDivElement | null;
    const closeModalBtn = modal?.querySelector('.closeyoutube') as HTMLButtonElement | null;
    const youtubeVideo = document.getElementById('youtubeVideo') as HTMLIFrameElement | null;

    // const youtubeUrl = encodeURI(film.linkBO?.trim() ?? '');
    // const youtubeUrlDynamique = `${film.linkBO}?autoplay=1`;;

    const youtubeUrlDynamique = `${linkBO}?autoplay=1`;;
    console.log("URL dynamique = ", youtubeUrlDynamique);


    if (openModalBtn && modal && closeModalBtn && youtubeVideo && youtubeUrlDynamique) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            youtubeVideo.src = youtubeUrlDynamique;
            //  youtubeVideo.src ='https://www.youtube.com/embed/Tkej_ULljR8?autoplay=1';
            console.log("URL utilisée = ", youtubeVideo.src)
        });

        const closeModal = () => {
            modal.style.display = 'none';
            youtubeVideo.src = '';
        };

        closeModalBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (event: MouseEvent) => {
            if (event.target === modal) closeModal();
        });
    } else {
        console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal sont introuvables.');
    }
}

function effacerDetailFilm(): void {
    // Optionnel : Vider la zone
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail) return;
    const imgAffiche = containerDetail.querySelector('.twocolumns__left-img') as HTMLImageElement | null;
    if (imgAffiche) imgAffiche.src = '';
    // etc. ou tout effacer
}