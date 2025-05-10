// ViewFilm.ts
import { dataController, dataReady } from './DataController.js';
import { formatDateLocalYYYYMMDD, setCookie, imageFilm } from './Helpers.js';
import { Film } from './shared-models/Film.js';
import { ReservationState } from './shared-models/Reservation.js';
import { Seance } from './shared-models/Seance.js';
import { TarifQualite } from './shared-models/Seance.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { isUUID } from './Helpers.js';
import { seanceCardView } from './ViewReservation.js';

// Filtre pour les cinema pris dans le dataController : dataController.filterNameCinema
// Filtre pour les grenres pris dans le dataControllerdataController.filterGenre;
// Filtre sur le jour en local car pas utilisé dans d'autres pages
let filtreJour = '';

export async function onLoadFilms() {
    //   await new Promise(resolve => window.addEventListener('load', resolve)); // ✅ attend fin chargement complet
    console.log("=====> chargement onLoadFilms");

    await dataReady; // ✅ Attend que les données soient prêtes
    console.log("Données chargées, traitement de la page Films...");

    // On charge menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites() // Footer


    // 2) Init filtres
    await initFiltreCinema();
    await initFiltreGenre();
    await initFiltreJour();

    // 3) Rafraîchir la liste
    rafraichirListeFilms();

    
    document.querySelector("main")!.style.visibility = "visible";
    const filters = document.querySelector(".title__filters") as HTMLElement | null;
    if (filters) filters.style.visibility = "visible";
    
    const progress = document.getElementById("progressIndicator");
    if (progress) {

        progress.style.removeProperty("display");
        progress.style.display = "none";
        progress.classList.add("hidden");
        console.log("Descativation progress")
    } else {
        console.error("Pas d'indicateur")
    }
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
            await construireListeJours();
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
        await construireListeJours();
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
            await construireListeJours();
            await rafraichirListeFilms();
        });
        dropdownContent.appendChild(a);
    });
}

async function initFiltreJour(): Promise<void> {
    // On met en place un input que l'on ajuste aux jours
    // dans la fourchette couverte par dataController.genre (soit all filtré par le cinema et le filtre genres)

    // 1) On insère un <input type="date"> en plus, ou on le rajoute dans la page
    let containerFilters = document.querySelector('.title__filters-films');
    if (!containerFilters) return;

    let inputDate = document.createElement('input');
    inputDate.type = 'date';
    inputDate.classList.add('filter-jour-input');
    containerFilters.prepend(inputDate);

    // 4) On écoute les changements
    inputDate.removeEventListener('change', async () => { });
    inputDate.addEventListener('change', async () => {
        filtreJour = inputDate.value; // ex. "2025-03-15"
        await rafraichirListeFilms();
    });

    // 5) Construire initialement la liste des jours activables
    await construireListeJours();
}

async function construireListeJours(): Promise<void> {

    const inputDate = document.querySelector('.filter-jour-input') as HTMLInputElement | null;
    if (!inputDate) return;

    // 1) On isole les séances qui correspondent au filtre Cinema et genre
    const filmsGenre = dataController.filmsGenre;
    // Définition d'un Set des IDs des films
    const filmIdsSet = new Set(filmsGenre.map(film => film.id));
    // Filtrer les séances qui ont un filmId présent dans filmsGenre
    const seancesGenre = dataController.seances.filter(s => s.filmId !== undefined && filmIdsSet.has(s.filmId));

    // 3) On calcule les dates min et max et on applique sur le champ date
    const allDates = seancesGenre.map((s) => s.dateJour).filter(Boolean).sort() as string[];

    if (allDates.length > 0) {
        const dateMinYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[0]));
        const dateMaxYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[allDates.length - 1]));
        inputDate.min = dateMinYYYYMMDD;
        inputDate.max = dateMaxYYYYMMDD;
    } else {
        inputDate.min = '';
        inputDate.max = '';
    }


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
    if (filtreJour) {
        films = films.filter((f) => {
            const seancesFilm = dataController.seancesFilm(f.id);
            return seancesFilm.some((s) =>
                s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false
            );
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
    img.src = `${imageFilm(film.imageFilm1024 ?? '')}`;
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
        imgAffiche.src = `${imageFilm(film.imageFilm1024 ?? '')}`;
        imgAffiche.alt = film.titleFilm ?? 'Affiche';
    }

    // const noteP = containerDetail.querySelector('.evaluation__note-p') as HTMLParagraphElement | null;
    // if (noteP) {
    //     noteP.textContent = `Avis : ${film.note} / 5`;
    // }

    // const coupdecoeurD = containerDetail.querySelector('.evaluation__coupdecoeur') as HTMLDivElement | null;
    // if (coupdecoeurD) {
    //     if (film.isCoupDeCoeur) {
    //         coupdecoeurD.style.visibility = 'visible'; // affiche
    //     } else {
    //         coupdecoeurD.style.visibility = 'hidden'; // masque
    //     }

    // }



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
    const tableSeances = buildTableSeances(film);
    rightFilmDiv.appendChild(tableSeances);

    // Désactiver le bouton "Je réserve" à chaque fois qu'on change de film
    const reserveBtn = containerDetail.querySelector('.right__jereserve-button') as HTMLButtonElement | null;
    if (reserveBtn) {
        reserveBtn.disabled = true;
        reserveBtn.addEventListener('click', async () => {




            if (!lastSelectedSeanceData) {
                alert('Veuillez sélectionner une séance dans la liste.');
            } else {
                if (["ReserveCompteToConfirm", "ReserveMailToConfirm",
                    "ReserveToConfirm"].includes(dataController.reservationState) &&
                    isUUID(dataController.selectedReservationUUID || '') &&
                    isUUID(dataController.selectedSeanceUUID || '')) { // Autre reservation en cours
                    alert("Une autre réservation est en cours, vous devez la finaliser ou l'annuler avant d'en effectuer une nouvelle")
                    window.location.href = 'reservation.html';
                } else {
                    // Afficher un message
                    const { Jour, Cinema, Horaire, Qualite, Tarifs, SeanceId } = lastSelectedSeanceData;
                    const seance = dataController.seances.find((s) => s.seanceId === SeanceId);

                    const seanceAJour = await dataController.getSeanceFromDB([SeanceId]);
                    let numFreeSeatsActual = -1;
                    if (seanceAJour[0].numFreeSeats) numFreeSeatsActual = parseInt(seanceAJour[0].numFreeSeats,10);

                    if (seance && numFreeSeatsActual > 0) {
                        dataController.filterNameCinema = Cinema;
                        dataController.selectedSeanceUUID = SeanceId;
                        dataController.selectedFilmUUID = seance.filmId || '';
                        dataController.selectedSeanceDate = new Date(seance.dateJour || '');
                        dataController.reservationState = ReservationState.PendingChoiceSeats;
                        await dataController.sauverEtatGlobal();

                        window.location.href = 'reservation.html';

                        alert(`Séance sélectionnée :\nJour : ${Jour}\nCinéma : ${Cinema}\nHoraire : ${Horaire}\nQualité : ${Qualite}\nTarifs : ${Tarifs}`);
                    } else {
                        alert('La seance est complete');
                    }
                }
            }
        });
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

/**
 * Construit un conteneur <div> + tableau pour afficher les séances du film.
 * - Thead doit rester fixe
 * - Tbody défile
 * - Hover sur la ligne
 * - Au clic sur la ligne => stocker la séance, activer le bouton "Je réserve"
 */
let lastSelectedSeanceData: Record<string, string> | null = null;
let lastSelectedRow: HTMLTableRowElement | null = null;

function buildTableSeances(film: Film): HTMLDivElement {
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
    // Filtrage : exclure séances du jour dont l'heure de début est à moins d'une heure de l'heure actuelle,
    // et séances complètes (numFreeSeats = "0").
    const now = new Date();
    const today = new Date();
    seances = seances.filter((seance) => {
        // Exclure les séances complètes
        if (seance.numFreeSeats === "0") return false;

        // Exclure si aujourd'hui et heure < maintenant + 1h
        if (seance.dateJour) {
            const seanceDate = new Date(seance.dateJour);
            if (
                seanceDate.getFullYear() === today.getFullYear() &&
                seanceDate.getMonth() === today.getMonth() &&
                seanceDate.getDate() === today.getDate()
            ) {
                const [hh, mm] = (seance.hourBeginHHSMM ?? "00:00").split(":").map(Number);
                const seanceTime = new Date(seanceDate);
                seanceTime.setHours(hh, mm, 0, 0);
                const seuil = new Date(now);
                seuil.setHours(seuil.getHours() + 1);
                if (seanceTime < seuil) return false;
            }
        }

        return true;
    });
    // Tri
    seances.sort((a, b) => {
        if (a.dateJour === b.dateJour) {
            return (a.hourBeginHHSMM ?? '').localeCompare(b.hourBeginHHSMM ?? '');
        }
        return (a.dateJour ?? '').localeCompare(b.dateJour ?? '');
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
            const reserveBtn = document.querySelector('.right__jereserve-button') as HTMLButtonElement | null;
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
