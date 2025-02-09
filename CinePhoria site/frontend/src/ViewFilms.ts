// ViewFilm.ts
import { dataController } from './DataController.js';
import { formatDateLocalYYYYMMDD, setCookie } from './Helpers.js';
import { Film } from './shared-models/Film.js';
import { Seance } from './shared-models/Seance.js';
import { TarifQualite } from './shared-models/Seance.js';

//let dataController.filterNameCinema = dataController.filterNameCinema;
// let filtreGenre = dataController.filterGenre;
let filtreJour = '';

export async function onLoadFilms() {
    console.log("=====> chargement onLoadFilms");

    // On initialise le dataController si il est vide
  if (dataController.allSeances.length === 0 ) await dataController.init()
  

    // 2) Init filtres
    await initFiltreCinema();
    await initFiltreGenre();
    await initFiltreJour();

    // 3) Rafraîchir la liste
    rafraichirListeFilms();

    // 4) Gérer la modal BO
    initModalBandeAnnonce();
}

/* -------------------------------------------
   Filtres
------------------------------------------- */
async function initFiltreCinema(): Promise<void> {

    // Fonction de mise à jour l'affichage du bouton du dropdown
    function updateDropdownDisplay(textButton: string): void {
        const dropdownButtons = document.querySelectorAll<HTMLButtonElement>('.titre__filter-dropdown-complexe');
        const mustDisplayButton = ["PendingChoiceSeance", "PendingChoiceSeats"].includes(dataController.reservationState);
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
            initFiltreGenre
            // Rafraichir la liste des jours
            construireListeJours();
            // Rafraichir la liste des films
            rafraichirListeFilms();
        });
    });
}

async function initFiltreGenre(): Promise<void> {
    const dropdownGenre = document.querySelector('.titre__filter-dropdown-genre');
    if (!dropdownGenre) return;
    const dropdownContent = dropdownGenre.querySelector('.title__filter-button-drowdown-content');
    if (!dropdownContent) return;

    
    // Vider le dropdownContent, ajouter un item "Tous"
    dropdownContent.innerHTML = '';
    const aTous = document.createElement('a');
    aTous.href = '#';
    aTous.textContent = 'Tous les genres';
    aTous.addEventListener('click', (ev) => {
        ev.preventDefault();
        dataController.filterGenre = 'all';
        rafraichirListeFilms();
    });
    dropdownContent.appendChild(aTous);

    // Créer un <a> par genre
    dataController.genreSet.forEach((genre) => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = genre;
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            dataController.filterGenre = genre;
            rafraichirListeFilms();
        });
        dropdownContent.appendChild(a);
    });
}

async function initFiltreJour(): Promise<void> {
    // On va imaginer un simple <input type="date"> qu’on injecte, 
    // ou un dropdown -> Pour la démo, on crée un <div class="filter-jour">...
    // On va remplir dynamiquement les <option> (ou <a>) correspondant aux jours
    // dans la fourchette couverte par dataController.allSeances

    // 1) On insère un <input type="date"> en plus, ou on le rajoute dans la page
    let containerFilters = document.querySelector('.title__filters-films');
    if (!containerFilters) return;

    let inputDate = document.createElement('input');
    inputDate.type = 'date';
    inputDate.classList.add('filter-jour-input');
    containerFilters.appendChild(inputDate);

    // 2) On limite les min et max
    const allDates = dataController.allSeances.map((s) => s.dateJour).filter(Boolean) as string[];
    if (allDates.length > 0) {
        const sortedDates = allDates.sort();
        inputDate.min = sortedDates[0]!;
        inputDate.max = sortedDates[sortedDates.length - 1]!;
    }

    // 3) On écoute les changements
    inputDate.addEventListener('change', () => {
        filtreJour = inputDate.value; // ex. "2025-03-15"
        rafraichirListeFilms();
    });

    // 4) Construire initialement la liste des jours activables
    construireListeJours();
}

function construireListeJours(): void {
    // Si on veut restreindre inputDate aux jours qui ont des séances 
    // correspondant au cinema sélectionné (et potentiellement d’autres filtres),
    // on peut ajuster inputDate.min / inputDate.max ou un <datalist>.
    // Ici, on se contente de recalculer min/max 
    // en fonction du cinema filtré ?

    // Dans la démo, on fait simple : 
    //   - on trie par date
    //   - on set le min / max
    const inputDate = document.querySelector('.filter-jour-input') as HTMLInputElement | null;
    if (!inputDate) return;

    const datesValides: string[] = dataController.seances.map((s) => s.dateJour || '').filter(Boolean).sort();
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
function rafraichirListeFilms(): void {
    const container = document.querySelector('.films__listFilms');
    if (!container) return;
    container.innerHTML = '';

    // Filtrer
    let films = dataController.filmsGenre; // Film filtré par cinema et genre

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
function afficherDetailFilm(film: Film): void {
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

    // (1) Insérer le tableau des séances sous la distribution
    const rightFilmDiv = containerDetail.querySelector('.right__film') as HTMLElement | null;
    if (!rightFilmDiv) return;

    // Nettoyer un éventuel tableau précédent
    const oldTable = rightFilmDiv.querySelector('.tabseance__commande-table');
    if (oldTable) oldTable.remove();

    const tableSeances = buildTableSeances(film);
    rightFilmDiv.appendChild(tableSeances);
}

function effacerDetailFilm(): void {
    // Optionnel : Vider la zone
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail) return;
    const imgAffiche = containerDetail.querySelector('.twocolumns__left-img') as HTMLImageElement | null;
    if (imgAffiche) imgAffiche.src = '';
    // etc. ou tout effacer
}

function buildTableSeances(film: Film): HTMLDivElement {
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
        if (a.dateJour === b.dateJour) {
            return (a.hourBeginHHSMM ?? '').localeCompare(b.hourBeginHHSMM ?? '');
        }
        return (a.dateJour ?? '').localeCompare(b.dateJour ?? '');
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
function initModalBandeAnnonce(): void {
    const modal = document.getElementById('videoModal');
    const spanClose = modal?.querySelector('.close') as HTMLElement | null;
    if (spanClose) {
        spanClose.addEventListener('click', () => {
            fermerModalBA();
        });
    }

    const btnOpen = document.getElementById('openModal');
    btnOpen?.addEventListener('click', () => {
        // Juste un test: lien youtube par défaut
        ouvrirModalBA('https://www.youtube.com/embed/XXXXXXXX');
    });
}

function ouvrirModalBA(url: string): void {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('youtubeVideo') as HTMLIFrameElement | null;
    if (!modal || !iframe) return;
    iframe.src = url;
    modal.style.display = 'block';
}

function fermerModalBA(): void {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('youtubeVideo') as HTMLIFrameElement | null;
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
}