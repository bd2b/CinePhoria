import { DataControllerIntranet } from './DataControllerIntranet.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import {
    syncTableColumnWidths, imageFilm, formatDateJJMM, parseLocalDate,
    formatDateJJMMStr, formatterJJMM, formatDateLocalYYYYMMDD
} from './Helpers.js';
import { ReservationForUtilisateur, ReservationAvis } from './shared-models/Reservation.js';


let filtreJour = '';

/**
 * Entrée principale du module
 */
export async function onLoadManageAvis() {
    console.log("=====> chargement onLoadManageAvis");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Initialisation filtres
    await initFiltreCinema();
    await initFiltreJour();


    // Rafraîchir le tableau des avis
    await rafraichirTableauAvis();
}

/* ---------------------------------------------------
   Rafraîchit la liste de toutes les seances
--------------------------------------------------- */
async function rafraichirTableauAvis(): Promise<void> {
    const container = document.getElementById('avis-table-container');
    if (!container) {
        console.error("Pas de container");
        return;
    }
    container.innerHTML = '';

    // Charger les avis
    let avis = await DataControllerIntranet.getReservationForUtilisateurFilter();

    if (filtreJour) {
        avis = avis.filter((s) =>
            s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false)
    }

    // Construction de la page
    const tableAvis = await updateTableSeances(avis) as HTMLTableElement;
    tableAvis.classList.add('tab__avis-liste');
    container.appendChild(tableAvis);

    // Mise à jour dynamique des largeurs de colonnes
    syncTableColumnWidths(tableAvis);

    // Ajout des boutons d'actions
    const divButtons = actionsButtons();
    container.appendChild(divButtons)

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
        if (DataControllerIntranet.filterNameCinema === 'all') {
            titleLeft.innerText = 'Modérer tous les avis';
        } else {
            titleLeft.innerText = `Modérer les avis pour le cinéma de ${DataControllerIntranet.filterNameCinema}`;
        }
    }
    // Mettre à jour le bouton
    if (DataControllerIntranet.filterNameCinema === 'all') {
        updateDropdownDisplay('Tous les complexes');
    } else {
        updateDropdownDisplay(DataControllerIntranet.filterNameCinema);
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
                DataControllerIntranet.filterNameCinema = 'all';
            } else {
                DataControllerIntranet.filterNameCinema = val; // ex: "Paris"
            }

            console.log("Choix du filtre Cinema = ", DataControllerIntranet.filterNameCinema);

            // Mettre à jour l'affichage du bouton
            updateDropdownDisplay(val);
            // Mettre à jour le titre droit
            const titleLeft = document.getElementById('titleLeft') as HTMLDivElement | null;
            if (titleLeft) {
                if (DataControllerIntranet.filterNameCinema === 'all') {
                    titleLeft.innerText = 'Modérer tous les avis';
                } else {
                    titleLeft.innerText = `Modérer les avis pour le cinéma de ${val}`;
                }
            }
            await rafraichirTableauAvis();
        });
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
        await rafraichirTableauAvis();
    });

    // 5) Construire initialement la liste des jours activables
    await construireListeJours();
}

async function construireListeJours(): Promise<void> {

    const inputDate = document.querySelector('.filter-jour-input') as HTMLInputElement | null;
    if (!inputDate) return;

    // On calcule les dates min et max et on applique sur le champ date
    const allDates = (await DataControllerIntranet.getSeancesDisplayFilter()).map((s) => s.dateJour).filter(Boolean).sort() as string[];

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
   Construction de la table des avis
------------------------------------------- */
export async function updateTableSeances(reservationsForUtilisateur: ReservationForUtilisateur[]): Promise<HTMLDivElement> {
    // Container global
    const container = document.createElement('div');
    container.classList.add('avis-liste');

    // Table
    const table = document.createElement('table');
    table.classList.add('avis-liste-table');

    // THEAD
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const cols = ['Date', 'Film', 'Utilisateur', 'Note', 'Commentaire', 'Validé', 'A Supprimer'];

    cols.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // TBODY
    const tbody = document.createElement('tbody');
    tbody.classList.add('liste-table__body');
    table.appendChild(tbody);



    // Pour chaque avis, on affiche une ligne de restitution des champ et un bouton éditer.
    reservationsForUtilisateur.forEach((reservationUtilisateur) => {

        const tr = document.createElement('tr');

        // 1) Date
        const tdDateJour = document.createElement('td');
        tdDateJour.textContent = formatterJJMM.format(new Date(reservationUtilisateur.dateJour || ''));
        tr.appendChild(tdDateJour);


        // 2) Titre
        const tdTitre = document.createElement('td');
        tdTitre.textContent = reservationUtilisateur.titleFilm || '';
        tr.appendChild(tdTitre);

        // 3) Utilisateur
        const tdUtilisateur = document.createElement('td');
        tdUtilisateur.textContent = reservationUtilisateur.displayname || '';
        tr.appendChild(tdUtilisateur);

        // 4) Note
        const tdNote = document.createElement('td');
        tdNote.textContent = reservationUtilisateur.note?.toString(10) || '';
        tr.appendChild(tdNote);

        // 4) Commentaire
        const tdCommentaire = document.createElement('td');
        tdCommentaire.textContent = reservationUtilisateur.evaluation || '';
        tr.appendChild(tdCommentaire);

        // 5) Avis
        const tdAvisRevu = document.createElement('td');
        const inputAvisRevu = document.createElement('input') as HTMLInputElement;
        inputAvisRevu.type = 'checkbox';
        inputAvisRevu.checked = reservationUtilisateur.isEvaluationMustBeReview ?? false;
        tdAvisRevu.appendChild(inputAvisRevu);
        tr.appendChild(tdAvisRevu);

        // 5) A supprimer
        const tdASupprimer = document.createElement('td');
        const inputASupprimer = document.createElement('input') as HTMLInputElement;
        inputASupprimer.type = 'checkbox';
        inputASupprimer.checked = false;
        tdASupprimer.appendChild(inputASupprimer);
        tr.appendChild(tdASupprimer);

        tbody.appendChild(tr);

    });
    container.appendChild(table);
    return container;
}

/* -------------------------------------------
   Fonction pour construire les boutons d'action
------------------------------------------- */
function actionsButtons(): HTMLDivElement {
    const divButton = document.createElement('div');
    divButton.classList.add('table-content-btns');

    const editBtn = document.createElement('button');
    editBtn.classList.add('tab__salles-liste-button');
    editBtn.textContent = "Appliquer";
    editBtn.addEventListener('click', async () => {
        await onClickAppliquerUpdate();
    });

    const annuleBtn = document.createElement('button');
    annuleBtn.classList.add('tab__salles-liste-button');
    annuleBtn.textContent = "Appliquer";
    annuleBtn.addEventListener('click', async () => {
            await onClickAnnuleUpdate();
        });

    return divButton;
   
}

async function onClickAppliquerUpdate() {
    
}

async function onClickAnnuleUpdate() {
    
}


//     if (mode === 'edit') {
//         divButton.classList.add('table-content-btns');

//         const editBtn = document.createElement('button');
//         editBtn.classList.add('tab__salles-liste-button');
//         editBtn.textContent = "Editer";
//         editBtn.addEventListener('click', async () => {
//             // Figer les tailles des colonnes de la ligne éditée
//             const cells = tr.querySelectorAll('td');
//             const tdWidths: number[] = [];
//             cells.forEach((cell) => {
//                 tdWidths.push(cell.offsetWidth - 30);
//             });
//             await activerEditionLigne(tr, seanceDisplay, tdWidths);

//         });

//         divButton.appendChild(editBtn);



//         const deleteBtn = document.createElement('button');
//         deleteBtn.classList.add('tab__salles-liste-button');
//         deleteBtn.textContent = 'Supprimer';
//         deleteBtn.addEventListener('click', () => {
//             // On supprime la salle si on peut
//             onClickDeleteSalle(tr);
//         });
//         divButton.appendChild(deleteBtn);
//     }
//     if (mode === 'save') {
//         divButton.classList.add('table-content-btns');

//         // Bouton "Annuler"
//         const cancelBtn = document.createElement('button');
//         cancelBtn.classList.add('tab__salles-liste-button');
//         cancelBtn.textContent = 'Annuler';
//         cancelBtn.addEventListener('click', () => {
//             annulerEditionLigne(tr, seanceDisplay);
//         });

//         // Bouton "Dupliquer"
//         const dupBtn = document.createElement('button');
//         dupBtn.classList.add('tab__salles-liste-button');
//         dupBtn.textContent = 'Dupliquer';
//         dupBtn.addEventListener('click', async () => {
//             // On duplique la ligne courante 
//             await sauvegarderEditionLigne(tr, seanceDisplay, true);
//         });
//         divButton.appendChild(dupBtn);

//         // Bouton "Enregistrer"
//         const saveBtn = document.createElement('button');
//         saveBtn.classList.add('tab__salles-liste-button');
//         saveBtn.textContent = 'Modifier';
//         saveBtn.addEventListener('click', async () => {
//             await sauvegarderEditionLigne(tr, seanceDisplay);
//         });

//         divButton.appendChild(saveBtn);
//         divButton.appendChild(cancelBtn);
//     }

//     return divButton;
// }


/* -------------------------------------------
   Fonction pour activer l'édition d'une ligne
------------------------------------------- */
// Activer le mode édition sur une ligne spécifique
// async function activerEditionLigne(tr: HTMLTableRowElement, seanceDisplay: SeanceDisplay, tdWidths: number[]) {

//     const cells = tr.querySelectorAll('td');

//     // 1) Date
//     console.log("Date Entrée = ", seanceDisplay.dateJour)
//     const tdDate = cells[0];
//     const inputDate = document.createElement('input');
//     inputDate.type = 'date';
//     inputDate.valueAsDate = new Date(seanceDisplay.dateJour || '');
//     inputDate.style.width = `${tdWidths[0]}px`;
//     inputDate.style.boxSizing = 'border-box';
//     inputDate.style.textAlign = 'center';

//     tdDate.textContent = '';
//     tdDate.appendChild(inputDate);

//     // 2) Salle 
//     const tdSalle = cells[1];
//     const selectSalle = document.createElement('select');
//     listSalles.forEach(salle => {
//         const option = document.createElement('option');
//         option.value = salle.nomSalle;
//         option.textContent = salle.nomSalle;
//         if (salle.id === seanceDisplay.salleId) option.selected = true;
//         selectSalle.appendChild(option);
//     });
//     selectSalle.style.width = `${tdWidths[1]}px`;
//     selectSalle.style.boxSizing = 'border-box';
//     selectSalle.style.textAlign = 'center';

//     selectSalle.addEventListener('change', () => {
//         const selectedSalle = listSalles.find(s => s.nomSalle === selectSalle.value);
//         if (selectedSalle) {
//             cells[7].textContent = selectedSalle.capacite!.toString();
//         }
//     });
//     tdSalle.textContent = '';
//     tdSalle.appendChild(selectSalle);

//     // Helper pour générer les options toutes les 5 minutes
//     function generateTimeOptions(startHour: number, endHour: number): string[] {
//         const options: string[] = [];
//         let totalMinutes = startHour * 60;
//         const endMinutes = endHour * 60;
//         while (totalMinutes <= endMinutes) {
//             const h = Math.floor(totalMinutes / 60) % 24;
//             const m = totalMinutes % 60;
//             const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
//             options.push(label);
//             totalMinutes += 5;
//         }
//         return options;
//     }

//     // 3) Heure Début (10:00 → 00:00)
//     const tdHeureDebut = cells[2];
//     const selectHeureDebut = document.createElement('select');
//     generateTimeOptions(10, 24).forEach(time => {
//         const option = document.createElement('option');
//         option.value = time;
//         option.textContent = time;
//         if (time === seanceDisplay.hourBeginHHSMM) option.selected = true;
//         selectHeureDebut.appendChild(option);
//     });
//     selectHeureDebut.style.width = `${tdWidths[2]}px`;
//     selectHeureDebut.style.boxSizing = 'border-box';
//     selectHeureDebut.style.textAlign = 'center';
//     tdHeureDebut.textContent = '';
//     tdHeureDebut.appendChild(selectHeureDebut);

//     // 4) Heure Fin (11:00 → 02:00)
//     const tdHeureFin = cells[3];
//     const selectHeureFin = document.createElement('select');
//     generateTimeOptions(11, 26).forEach(time => {
//         const option = document.createElement('option');
//         option.value = time;
//         option.textContent = time;
//         if (time === seanceDisplay.hourEndHHSMM) option.selected = true;
//         selectHeureFin.appendChild(option);
//     });
//     selectHeureFin.style.width = `${tdWidths[3]}px`;
//     selectHeureFin.style.boxSizing = 'border-box';
//     selectHeureFin.style.textAlign = 'center';
//     tdHeureFin.textContent = '';
//     tdHeureFin.appendChild(selectHeureFin);

//     // 5) Affiche

//     const tdAffiche = cells[4];
//     tdAffiche.style.width = `${tdWidths[4]}px`;
//     tdAffiche.style.boxSizing = 'border-box';

//     // 6) Titre
//     const tdTitre = cells[5];
//     const selectTitre = document.createElement('select');
//     listFilms.forEach(film => {
//         const option = document.createElement('option');
//         option.value = film.titre;
//         option.textContent = film.titre;
//         if (film.id === seanceDisplay.filmId) option.selected = true;
//         selectTitre.appendChild(option);
//     });
//     selectTitre.style.width = `${tdWidths[5]}px`;
//     selectTitre.style.boxSizing = 'border-box';
//     selectTitre.style.textAlign = 'center';

//     // 7) Duree
//     const tdDuration = cells[6];
//     tdDuration.style.width = `${tdWidths[6]}px`;
//     tdDuration.style.boxSizing = 'border-box';

//     selectTitre.addEventListener('change', () => {
//         const selectedFilm = listFilms.find(f => f.titre === selectTitre.value);
//         if (selectedFilm) {
//             cells[4].querySelector('img')!.src = imageFilm(selectedFilm.affiche!);
//             cells[6].textContent = selectedFilm.duration!;
//         }
//     });
//     tdTitre.textContent = '';
//     tdTitre.appendChild(selectTitre);


//     // 8) Capacité
//     const tdCapacite = cells[7];
//     tdCapacite.style.width = `${tdWidths[7]}px`;
//     tdCapacite.style.boxSizing = 'border-box';

//     // 9) BO
//     const tdBO = cells[8];
//     const selectBO = document.createElement('select');
//     ['VF', 'VOST'].forEach(bo => {
//         const option = document.createElement('option');
//         option.value = bo;
//         option.textContent = bo;
//         if (bo === seanceDisplay.bo) option.selected = true;
//         selectBO.appendChild(option);
//     });
//     selectBO.style.width = `${tdWidths[8]}px`;
//     selectBO.style.boxSizing = 'border-box';
//     selectBO.style.textAlign = 'center';
//     tdBO.textContent = '';
//     tdBO.appendChild(selectBO);

//     // 10) Qualité
//     const tdQualite = cells[9];
//     const selectQualite = document.createElement('select');
//     ['4DX', '3D', '4K'].forEach(qualite => {
//         const option = document.createElement('option');
//         option.value = qualite;
//         option.textContent = qualite;
//         if (qualite === seanceDisplay.qualite) option.selected = true;
//         selectQualite.appendChild(option);
//     });
//     selectQualite.style.width = `${tdWidths[9]}px`;
//     selectQualite.style.boxSizing = 'border-box';
//     selectQualite.style.textAlign = 'center';
//     tdQualite.textContent = '';
//     tdQualite.appendChild(selectQualite);

//     // Remplacement des boutons d'action par Annuler et Enregistrer
//     const tdActions = cells[10]; // La cellule Actions
//     tdActions.textContent = ''; // Nettoyage des boutons existants
//     const divButton = actionsButtons('save', tr, seanceDisplay);
//     tdActions.appendChild(divButton);

//     tr.appendChild(tdActions);

// }

// Annuler le mode édition sur une ligne spécifique et restaurer les valeurs initiales
// function annulerEditionLigne(tr: HTMLTableRowElement, seanceDisplay: SeanceDisplay) {
//     const cells = tr.querySelectorAll('td');

//     cells[0].textContent = formatDateJJMM(parseLocalDate(seanceDisplay.dateJour || '')) || '';
//     if (!DataControllerIntranet.filterNameCinema || DataControllerIntranet.filterNameCinema === 'all') {
//         cells[1].textContent = seanceDisplay.nameCinema + "-" + seanceDisplay.nameSalle || '';
//     } else {
//         cells[1].textContent = seanceDisplay.nameSalle || '';
//     }
//     cells[2].textContent = seanceDisplay.hourBeginHHSMM || '';
//     cells[3].textContent = seanceDisplay.hourEndHHSMM || '';
//     cells[4].querySelector('img')!.src = imageFilm(seanceDisplay.imageFilm128 ?? '');
//     cells[5].textContent = seanceDisplay.titleFilm || '';
//     cells[6].textContent = seanceDisplay.duration || '';
//     cells[7].textContent = seanceDisplay.capacity?.toString(10) || '';
//     cells[8].textContent = seanceDisplay.bo || '';
//     cells[9].textContent = seanceDisplay.qualite || '';

//     // Réaffichage des boutons standards
//     const tdButtons = cells[10];
//     tdButtons.textContent = "";
//     const divButton = actionsButtons('edit', tr, seanceDisplay);
//     tdButtons.appendChild(divButton);
// }


/* -------------------------------------------
   Fonction pour sauvegarder l'édition d'une ligne
------------------------------------------- */
// async function sauvegarderEditionLigne(tr: HTMLTableRowElement, seance: SeanceDisplay, isDuplicate: boolean = false): Promise<void> {
//     // Collecter les nouvelles valeurs depuis les inputs
//     const cells = tr.querySelectorAll('td');
//     const id = tr.dataset.seanceId;
//     const newSeance = new SeanceSeule({ id: id });

//     // Date
//     const inputDate = cells[0].querySelector('input') as HTMLInputElement;
//     newSeance.dateJour = inputDate?.value || '';

//     // Salle
//     const selectSalle = cells[1].querySelector('select') as HTMLSelectElement;
//     const salleId = listSalles.find(s => s.nomSalle === selectSalle?.value)?.id || '';
//     newSeance.salleId = salleId;

//     const numPMR = listSalles.find(s => s.nomSalle === selectSalle?.value)?.numPMR || '0';
//     newSeance.numFreePMR = numPMR!.toString(10);

//     // Heures
//     const selectHeureDebut = cells[2].querySelector('select') as HTMLSelectElement;
//     const selectHeureFin = cells[3].querySelector('select') as HTMLSelectElement;
//     newSeance.hourBeginHHSMM = selectHeureDebut?.value || '';
//     newSeance.hourEndHHSMM = selectHeureFin?.value || '';

//     // filmId
//     const nomFilm = (cells[5].querySelector('select') as HTMLSelectElement).value;
//     const filmId = listFilms.find(f => f.titre === nomFilm)?.id || ''
//     newSeance.filmId = filmId;

//     // Capacité (texte)
//     newSeance.numFreeSeats = cells[7].textContent?.trim() || '0';

//     // BO
//     const selectBO = cells[8].querySelector('select') as HTMLSelectElement;
//     newSeance.bo = selectBO?.value || '';

//     // Qualité
//     const selectQualite = cells[9].querySelector('select') as HTMLSelectElement;
//     newSeance.qualite = selectQualite?.value || '';

//     newSeance.alertAvailibility = "";

//     if (isDuplicate) {
//         // On cree une nouvelle séance à partir de la ligne
//         newSeance.id = crypto.randomUUID();
//     }

//     // console.log(newSeance);
//     try {
//         const result = await DataControllerIntranet.createOrUpdateSeance(newSeance);
//         if (result.message === 'create') {
//             alert("Séance dupliquée");
//         } else {
//             alert("Séance modifiée");
//         }
//         await rafraichirTableauSeances();
//     } catch (error) {
//         alert("Une erreur est survenue : " + error)
//     }

// }

/* -------------------------------------------
   Fonction pour supprimer une ligne
------------------------------------------- */
// async function onClickDeleteSalle(tr: HTMLTableRowElement): Promise<void> {
//     const seanceId = tr.dataset.seanceId!;
//     try {
//         const result = await seancesseulesDeleteApi(seanceId)
//         alert("Suppression réussie :" + result.message)
//         await rafraichirTableauSeances();
//     } catch (error) {
//         console.error("Erreur dans la suppression " + error);
//         alert("Suppression impossible : " + error);
//     }

// }