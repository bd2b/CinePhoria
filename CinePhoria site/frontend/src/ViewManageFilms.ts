import { dataController } from './DataController.js';
import { formatDateLocalYYYYMMDD, setCookie } from './Helpers.js';
import { Film } from './shared-models/Film.js';
import { ReservationState } from './shared-models/Reservation.js';
import { Seance } from './shared-models/Seance.js';
import { TarifQualite } from './shared-models/Seance.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { isUUID } from './Helpers.js';


export async function onLoadManageFilms() {
    console.log("=====> chargement onLoadFilms");

    // 1) On initialise le dataController si il est vide
    if (dataController.allSeances.length === 0) await dataController.init()

    // On charge menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites() // Footer


    // 2) Init filtres
    await initFiltreCinema();
    await initFiltreGenre();
  //  await initFiltreJour();

    // 3) Rafraîchir la liste
    rafraichirListeFilms();

}

/* -------------------------------------------
   Filtres
------------------------------------------- */
async function initFiltreCinema(): Promise<void> {

    // Fonction de mise à jour l'affichage du bouton du dropdown
    function updateDropdownDisplay(textButton: string): void {
        const dropdownButtons = document.querySelectorAll<HTMLButtonElement>('.titre__filter-dropdown-complexe');
        dropdownButtons.forEach((button) => {
            button.style.display = "block";
            button.innerHTML = `${textButton} <span class="chevron">▼</span>`;
        });
    }
    const dropdownCinema = document.querySelector('.titre__filter-dropdown-cinema');
    if (!dropdownCinema) return;

    // Trouver la div de dropdown
    const dropdownContent = dropdownCinema.querySelector('.title__filter-button-drowdown-content');
    if (!dropdownContent) return;
    console.log("Init dropdown Cinema")

    // Mettre à jour le titre droit
    const titleLeft = document.getElementById('titleLeft') as HTMLDivElement | null;
    if (titleLeft) {
        if (dataController.filterNameCinema === 'all') {
            titleLeft.innerText = 'Les films de CinePhoria';
        } else {
            titleLeft.innerText = `Les films de CinePhoria à ${dataController.filterNameCinema}`;
        }
    }
    // Mettre à jour le bouton
    if (dataController.filterNameCinema === 'all') {
        updateDropdownDisplay('Tous les complexes');
    } else {
        updateDropdownDisplay(dataController.filterNameCinema);
    }

    // Dans le HTML, on a déjà <a href="#">Tous les complexes</a>, <a href="#">Paris</a> ...
    // On écoute le clic sur chaque <a>
    const links = dropdownContent.querySelectorAll<HTMLAnchorElement>('a');
    links.forEach((link) => {
        link.removeEventListener('click', async (event: Event) => { });
        link.addEventListener('click', async (ev) => {
            ev.preventDefault();
            const val = link.dataset.cinema?.trim() || '';
            if (val === 'Tous les complexes') {
                dataController.filterNameCinema = 'all';
            } else {
                dataController.filterNameCinema = val; // ex: "Paris"
            }

            console.log("Choix du filtre Cinema = ", dataController.filterNameCinema);

            // Mettre à jour l'affichage du bouton
            updateDropdownDisplay(val);
            // Mettre à jour le titre droit
            const titleLeft = document.getElementById('titleLeft') as HTMLDivElement | null;
            if (titleLeft) {
                if (dataController.filterNameCinema === 'all') {
                    titleLeft.innerText = 'Les films de CinePhoria';
                } else {
                    titleLeft.innerText = `Les films de CinePhoria à ${val}`;
                }
            }
            await dataController.init()

            // Rafraichir le dropdown des genres
             await initFiltreGenre();
            // Rafraichir la liste des jours
            // await construireListeJours();
            // Rafraichir la liste des films
            await rafraichirListeFilms();
        });
    });
}

async function initFiltreGenre(): Promise<void> {

    // Fonction de mise à jour l'affichage du bouton du dropdown
    function updateDropdownDisplay(textButton: string): void {
        const dropdownButton = document.getElementById('title__filter-dropdown-button-genre');
        if (!dropdownButton) return;
        dropdownButton.innerHTML = `${textButton} <span class="chevron">▼</span>`;
    }
    const dropdownGenre = document.querySelector('.titre__filter-dropdown-genre');
    if (!dropdownGenre) return;
    const dropdownContent = dropdownGenre.querySelector('.title__filter-button-drowdown-content');
    if (!dropdownContent) return;



    // Vider le dropdownContent, ajouter un item "Tous"
    dropdownContent.innerHTML = '';
    const aTous = document.createElement('a');
    aTous.href = '#';
    aTous.textContent = 'Tous les genres';
    aTous.addEventListener('click', async (ev) => {
        ev.preventDefault();
        dataController.filterGenre = 'all';
        updateDropdownDisplay('Tous les genres');
        // await construireListeJours();
        await rafraichirListeFilms();
    });
    dropdownContent.appendChild(aTous);

    // Créer un <a> par genre
    dataController.genreSet.forEach((genre) => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = genre;
        a.addEventListener('click', async (ev) => {
            ev.preventDefault();
            dataController.filterGenre = genre;
            updateDropdownDisplay(genre);
            // await construireListeJours();
            await rafraichirListeFilms();
        });
        dropdownContent.appendChild(a);
    });
}

/* -------------------------------------------
   Affichage Liste de Films
------------------------------------------- */
async function rafraichirListeFilms(): Promise<void> {
    const container = document.querySelector('.films__listFilms');
    if (!container) return;
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
        } else {
            afficherDetailFilm(films[0]);
        }
    } else {
        // Sinon, vider la zone détail
        effacerDetailFilm();
    }
}

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

    // Image
    const imgAffiche = containerDetail.querySelector('.twocolumns__left-img') as HTMLImageElement | null;
    if (imgAffiche) {
        imgAffiche.src = `assets/static/${film.imageFilm1024 ?? ''}`;
        imgAffiche.alt = film.titleFilm ?? 'Affiche';
    }

    // Titre
    const titleP = containerDetail.querySelector('.right__title-p') as HTMLParagraphElement | null;
    if (titleP) titleP.textContent = film.titleFilm ?? '';

    // Genre / Durée / Public
    const genreP = containerDetail.querySelector('.caractFilm__genre-p') as HTMLParagraphElement | null;
    if (genreP) genreP.textContent = film.genreArray ?? '';

    const dureeP = containerDetail.querySelector('.caractFilm__duree-p') as HTMLParagraphElement | null;
    if (dureeP) dureeP.textContent = film.duration ?? '';

    const publicP = containerDetail.querySelector('.caractFilm__public-p') as HTMLParagraphElement | null;
    if (publicP) publicP.textContent = film.categorySeeing ?? '';

    // Description
    const descP = containerDetail.querySelector('.right__description-p') as HTMLParagraphElement | null;
    if (descP) descP.textContent = film.filmDescription ?? '';

    // Auteur
    const authorP = containerDetail.querySelector('.right__author-p') as HTMLParagraphElement | null;
    if (authorP) authorP.textContent = film.filmAuthor ?? '';

    // Distribution
    const distrP = containerDetail.querySelector('.right__distribution') as HTMLParagraphElement | null;
    if (distrP) distrP.textContent = film.filmDistribution ?? '';

    // Bande-Annonce
    const linkBO = film.linkBO
    if (linkBO) initModalBandeAnnonce(linkBO)

    // Tableau des seances
    const rightFilmDiv = containerDetail.querySelector('.right__film') as HTMLElement | null;
    if (!rightFilmDiv) return;

    // Supprimer .table-scroll (et pas seulement .tabseance__commande-table)
    const oldScrollDiv = rightFilmDiv.querySelector('.table-scroll');
    if (oldScrollDiv) {
        oldScrollDiv.remove();
    }

    // Recréer
    // const tableSeances = buildTableSeances(film);
    // rightFilmDiv.appendChild(tableSeances);

    
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