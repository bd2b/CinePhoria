import { DataControllerIntranet } from './DataControllerIntranet.js';
import { Salle, ListSalles } from './shared-models/Salle.js';
import { Seance, SeanceDisplay, } from './shared-models/Seance.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import {
    syncTableColumnWidths, imageFilm, formatDateJJMM, parseLocalDate,
    formatDateJJMMStr, formatterJJMM, formatDateLocalYYYYMMDD
} from './Helpers.js';
import { ListFilms } from './shared-models/Film.js';
import { SeanceSeule } from './shared-models/SeanceSeule.js';
import { seancesseulesDeleteApi } from './NetworkController.js';
import { userDataController } from './DataControllerUser.js';
import { ComptePersonne } from './shared-models/Utilisateur.js';



// Données utilisées pour les select de saisie
let listFilms: ListFilms[];
let listSalles: ListSalles[];

let filtreJour = '';

// Récupération des cinemas autorisés pour les employés non administrateurs
let listCinemaAuthTab: string[] = []
let listCinemaAuth: string = "";

/**
 * Entrée principale du module
 */
export async function onLoadManageSeances() {
    console.log("=====> chargement onLoadManageSeances");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Mise à jour de la version
    await DataControllerIntranet.majVersion();

    // Charger la liste des cinemas autorisés
    let compteEmploye: ComptePersonne | undefined;
    if (userDataController) {
        compteEmploye = userDataController.compte();
        if (compteEmploye && compteEmploye.listCinemas && !compteEmploye.isAdministrateur) {
            listCinemaAuthTab = compteEmploye.listCinemas?.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            listCinemaAuth = compteEmploye.listCinemas;
        }
    }
    console.log("List Cinemas autorisés = ", listCinemaAuth, listCinemaAuthTab)

    // Appliquer cette liste à la mise à jour du dropdown de Cinema
    const dropdownCinema = document.querySelector('.titre__filter-dropdown-cinema');
    if (dropdownCinema) {
        const dropdownContent = dropdownCinema.querySelector('.title__filter-button-drowdown-content');
        if (dropdownContent) {
            dropdownContent.innerHTML = ''; // Vider l'existant

            const aAll = document.createElement('a');
            aAll.href = '#';
            aAll.dataset.cinema = 'Tous les complexes';
            aAll.textContent = 'Tous les complexes';
            dropdownContent.appendChild(aAll);

            listCinemaAuthTab.forEach(nomCinema => {
                const a = document.createElement('a');
                a.href = '#';
                a.dataset.cinema = nomCinema;
                a.textContent = nomCinema;
                dropdownContent.appendChild(a);
            });
        }
    }
    

    // Initialisation filtres
    await initFiltreCinema();
    await initFiltreJour();


    // Rafraîchir le tableau des seances
    await rafraichirTableauSeances();
}

/* ---------------------------------------------------
   Rafraîchit la liste de toutes les seances
--------------------------------------------------- */
async function rafraichirTableauSeances(): Promise<void> {
    const container = document.getElementById('seances-table-container');
    if (!container) {
        console.error("Pas de container");
        return;
    }
    container.innerHTML = '';

    // Charger les séances
    //let seances = await DataControllerIntranet.getSeancesDisplayFilter();

    // Charger les séances pour les cinemas autorisés
    let seances = (await DataControllerIntranet.getSeancesDisplayFilter()).filter(seance => listCinemaAuthTab.includes(seance.nameCinema!));
    if (filtreJour) {
        seances = seances.filter((s) =>
            s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false)
    }
    // Construction de la page
    const tableSeances = await updateTableSeances(seances) as HTMLTableElement;
    container.appendChild(tableSeances);

    // Mise à jour dynamique des largeurs de colonnes
    syncTableColumnWidths(tableSeances);

    // Mise à jour de la list des films et de salle
    listFilms = await DataControllerIntranet.getListFilmsAll();
    listSalles = (await DataControllerIntranet.getSallesByFilter()).filter(salle => listCinemaAuthTab.includes(salle.nameCinema!));



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

    // Mettre à jour le titre droit
    const titleLeft = document.getElementById('titleLeft') as HTMLDivElement | null;
    if (titleLeft) {
        if (DataControllerIntranet.filterNameCinema === 'all') {
            titleLeft.innerText = 'Les séances de CinePhoria';
        } else {
            titleLeft.innerText = `Les séances de CinePhoria à ${DataControllerIntranet.filterNameCinema}`;
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
            listSalles = await DataControllerIntranet.getSallesByFilter();

            // Mettre à jour l'affichage du bouton
            updateDropdownDisplay(val);
            // Mettre à jour le titre droit
            const titleLeft = document.getElementById('titleLeft') as HTMLDivElement | null;
            if (titleLeft) {
                if (DataControllerIntranet.filterNameCinema === 'all') {
                    titleLeft.innerText = 'Les séances de CinePhoria';
                } else {
                    titleLeft.innerText = `Les séances de CinePhoria à ${val}`;
                }
            }
            await rafraichirTableauSeances();
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
        await rafraichirTableauSeances();
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
   Construction de la table des seances
------------------------------------------- */
export async function updateTableSeances(seancesDisplay: SeanceDisplay[]): Promise<HTMLDivElement> {
    // Container global
    const container = document.createElement('div');
    container.classList.add('tab__seances-liste');

    // Table
    const table = document.createElement('table');
    table.classList.add('tab__seances-liste-table');

    // THEAD
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const cols = ['Date', 'Salle', 'H. Début', 'H. Fin', 'Affiche', 'Titre', 'Durée', 'Capacité', 'Bande', 'Qualité', 'Actions'];

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



    // Pour chaque séance, on affiche une ligne de restitution des champ et un bouton éditer.
    
    seancesDisplay.forEach((seanceDisplay) => {

        const tr = document.createElement('tr');

        // 1) Date
        const tdDateJour = document.createElement('td');
        tdDateJour.textContent = formatterJJMM.format(new Date(seanceDisplay.dateJour || ''));
        tr.appendChild(tdDateJour);

        // 2) Salle
        const tdSalle = document.createElement('td');
        if (!DataControllerIntranet.filterNameCinema || DataControllerIntranet.filterNameCinema === 'all') {
            tdSalle.textContent = seanceDisplay.nameCinema + "-" + seanceDisplay.nameSalle || '';
        } else {
            tdSalle.textContent = seanceDisplay.nameSalle || '';
        }
        tr.appendChild(tdSalle);

        // 3) Heure Debut
        const tdHeurD = document.createElement('td');
        tdHeurD.textContent = seanceDisplay.hourBeginHHSMM || '';
        tr.appendChild(tdHeurD);

        // 4) Heure Fin
        const tdHeurF = document.createElement('td');
        tdHeurF.textContent = seanceDisplay.hourEndHHSMM || '';
        tr.appendChild(tdHeurF);

        // 5) Affiche
        const tdImg = document.createElement('td');
        const img = document.createElement('img');
        img.src = imageFilm(seanceDisplay.imageFilm128 ?? '');
        img.alt = 'Affiche';
        img.classList.add('content-img-td');
        tdImg.appendChild(img);
        tr.appendChild(tdImg);

        // 6) Titre
        const tdTitre = document.createElement('td');
        tdTitre.textContent = seanceDisplay.titleFilm || '';
        tr.appendChild(tdTitre);

        // 7) Durée
        const tdDuration = document.createElement('td');
        tdDuration.textContent = seanceDisplay.duration || '';
        tr.appendChild(tdDuration);

        // 8) Capacité
        const tdCapacite = document.createElement('td');
        tdCapacite.textContent = seanceDisplay.capacity?.toString(10) || '';
        tr.appendChild(tdCapacite);

        // 9) Bande
        const tdBande = document.createElement('td');
        tdBande.textContent = seanceDisplay.bo || '';
        tr.appendChild(tdBande);

        // 10) Qualite
        const tdQualite = document.createElement('td');
        tdQualite.textContent = seanceDisplay.qualite || '';
        tr.appendChild(tdQualite);

        // 11) Boutons d'actions sur la salle
        const tdActions = document.createElement('td');
        const divButton = actionsButtons('edit', tr, seanceDisplay);
        tdActions.appendChild(divButton);
        tr.appendChild(tdActions);

        // Stockage de l'id de seance
        tr.dataset.seanceId = seanceDisplay.seanceId;


        tbody.appendChild(tr);
    });
    container.appendChild(table);
    return container;
}

/* -------------------------------------------
   Fonction pour construire les boutons d'action
------------------------------------------- */
function actionsButtons(mode: string, tr: HTMLTableRowElement, seanceDisplay: SeanceDisplay): HTMLDivElement {
    const divButton = document.createElement('div');
    if (mode === 'edit') {
        divButton.classList.add('table-content-btns');

        const editBtn = document.createElement('button');
        editBtn.classList.add('tab__salles-liste-button');
        editBtn.textContent = "Editer";
        editBtn.addEventListener('click', async () => {
            // Figer les tailles des colonnes de la ligne éditée
            const cells = tr.querySelectorAll('td');
            const tdWidths: number[] = [];
            cells.forEach((cell) => {
                tdWidths.push(cell.offsetWidth - 30);
            });
            await activerEditionLigne(tr, seanceDisplay, tdWidths);

        });

        divButton.appendChild(editBtn);



        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('tab__salles-liste-button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', () => {
            // On supprime la salle si on peut
            onClickDeleteSalle(tr);
        });
        divButton.appendChild(deleteBtn);
    }
    if (mode === 'save') {
        divButton.classList.add('table-content-btns');

        // Bouton "Annuler"
        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('tab__salles-liste-button');
        cancelBtn.textContent = 'Annuler';
        cancelBtn.addEventListener('click', () => {
            annulerEditionLigne(tr, seanceDisplay);
        });

        // Bouton "Dupliquer"
        const dupBtn = document.createElement('button');
        dupBtn.classList.add('tab__salles-liste-button');
        dupBtn.textContent = 'Dupliquer';
        dupBtn.addEventListener('click', async () => {
            // On duplique la ligne courante 
            await sauvegarderEditionLigne(tr, seanceDisplay, true);
        });
        divButton.appendChild(dupBtn);

        // Bouton "Enregistrer"
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('tab__salles-liste-button');
        saveBtn.textContent = 'Modifier';
        saveBtn.addEventListener('click', async () => {
            await sauvegarderEditionLigne(tr, seanceDisplay);
        });

        divButton.appendChild(saveBtn);
        divButton.appendChild(cancelBtn);
    }

    return divButton;
}


/* -------------------------------------------
   Fonction pour activer l'édition d'une ligne
------------------------------------------- */
// Activer le mode édition sur une ligne spécifique
async function activerEditionLigne(tr: HTMLTableRowElement, seanceDisplay: SeanceDisplay, tdWidths: number[]) {

    const cells = tr.querySelectorAll('td');

    // 1) Date
    console.log("Date Entrée = ", seanceDisplay.dateJour)
    const tdDate = cells[0];
    const inputDate = document.createElement('input');
    inputDate.type = 'date';
    inputDate.valueAsDate = new Date(seanceDisplay.dateJour || '');
    inputDate.style.width = `${tdWidths[0]}px`;
    inputDate.style.boxSizing = 'border-box';
    inputDate.style.textAlign = 'center';

    tdDate.textContent = '';
    tdDate.appendChild(inputDate);

    // 2) Salle 
    const tdSalle = cells[1];
    const selectSalle = document.createElement('select');
    listSalles.forEach(salle => {
        const option = document.createElement('option');
        option.value = salle.nomSalle;
        option.textContent = salle.nomSalle;
        if (salle.id === seanceDisplay.salleId) option.selected = true;
        selectSalle.appendChild(option);
    });
    selectSalle.style.width = `${tdWidths[1]}px`;
    selectSalle.style.boxSizing = 'border-box';
    selectSalle.style.textAlign = 'center';

    selectSalle.addEventListener('change', () => {
        const selectedSalle = listSalles.find(s => s.nomSalle === selectSalle.value);
        if (selectedSalle) {
            cells[7].textContent = selectedSalle.capacite!.toString();
        }
    });
    tdSalle.textContent = '';
    tdSalle.appendChild(selectSalle);

    // Helper pour générer les options toutes les 5 minutes
    function generateTimeOptions(startHour: number, endHour: number): string[] {
        const options: string[] = [];
        let totalMinutes = startHour * 60;
        const endMinutes = endHour * 60;
        while (totalMinutes <= endMinutes) {
            const h = Math.floor(totalMinutes / 60) % 24;
            const m = totalMinutes % 60;
            const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            options.push(label);
            totalMinutes += 5;
        }
        return options;
    }

    // 3) Heure Début (10:00 → 00:00)
    const tdHeureDebut = cells[2];
    const selectHeureDebut = document.createElement('select');
    generateTimeOptions(10, 24).forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        if (time === seanceDisplay.hourBeginHHSMM) option.selected = true;
        selectHeureDebut.appendChild(option);
    });
    selectHeureDebut.style.width = `${tdWidths[2]}px`;
    selectHeureDebut.style.boxSizing = 'border-box';
    selectHeureDebut.style.textAlign = 'center';
    tdHeureDebut.textContent = '';
    tdHeureDebut.appendChild(selectHeureDebut);

    // 4) Heure Fin (11:00 → 02:00)
    const tdHeureFin = cells[3];
    const selectHeureFin = document.createElement('select');
    generateTimeOptions(11, 26).forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        if (time === seanceDisplay.hourEndHHSMM) option.selected = true;
        selectHeureFin.appendChild(option);
    });
    selectHeureFin.style.width = `${tdWidths[3]}px`;
    selectHeureFin.style.boxSizing = 'border-box';
    selectHeureFin.style.textAlign = 'center';
    tdHeureFin.textContent = '';
    tdHeureFin.appendChild(selectHeureFin);

    // 5) Affiche

    const tdAffiche = cells[4];
    tdAffiche.style.width = `${tdWidths[4]}px`;
    tdAffiche.style.boxSizing = 'border-box';

    // 6) Titre
    const tdTitre = cells[5];
    const selectTitre = document.createElement('select');
    listFilms.forEach(film => {
        const option = document.createElement('option');
        option.value = film.titre;
        option.textContent = film.titre;
        if (film.id === seanceDisplay.filmId) option.selected = true;
        selectTitre.appendChild(option);
    });
    selectTitre.style.width = `${tdWidths[5]}px`;
    selectTitre.style.boxSizing = 'border-box';
    selectTitre.style.textAlign = 'center';

    // 7) Duree
    const tdDuration = cells[6];
    tdDuration.style.width = `${tdWidths[6]}px`;
    tdDuration.style.boxSizing = 'border-box';

    selectTitre.addEventListener('change', () => {
        const selectedFilm = listFilms.find(f => f.titre === selectTitre.value);
        if (selectedFilm) {
            cells[4].querySelector('img')!.src = imageFilm(selectedFilm.affiche!);
            cells[6].textContent = selectedFilm.duration!;
        }
    });
    tdTitre.textContent = '';
    tdTitre.appendChild(selectTitre);


    // 8) Capacité
    const tdCapacite = cells[7];
    tdCapacite.style.width = `${tdWidths[7]}px`;
    tdCapacite.style.boxSizing = 'border-box';

    // 9) BO
    const tdBO = cells[8];
    const selectBO = document.createElement('select');
    ['VF', 'VOST'].forEach(bo => {
        const option = document.createElement('option');
        option.value = bo;
        option.textContent = bo;
        if (bo === seanceDisplay.bo) option.selected = true;
        selectBO.appendChild(option);
    });
    selectBO.style.width = `${tdWidths[8]}px`;
    selectBO.style.boxSizing = 'border-box';
    selectBO.style.textAlign = 'center';
    tdBO.textContent = '';
    tdBO.appendChild(selectBO);

    // 10) Qualité
    const tdQualite = cells[9];
    const selectQualite = document.createElement('select');
    ['4DX', '3D', '4K'].forEach(qualite => {
        const option = document.createElement('option');
        option.value = qualite;
        option.textContent = qualite;
        if (qualite === seanceDisplay.qualite) option.selected = true;
        selectQualite.appendChild(option);
    });
    selectQualite.style.width = `${tdWidths[9]}px`;
    selectQualite.style.boxSizing = 'border-box';
    selectQualite.style.textAlign = 'center';
    tdQualite.textContent = '';
    tdQualite.appendChild(selectQualite);

    // Remplacement des boutons d'action par Annuler et Enregistrer
    const tdActions = cells[10]; // La cellule Actions
    tdActions.textContent = ''; // Nettoyage des boutons existants
    const divButton = actionsButtons('save', tr, seanceDisplay);
    tdActions.appendChild(divButton);

    tr.appendChild(tdActions);

}

// Annuler le mode édition sur une ligne spécifique et restaurer les valeurs initiales
function annulerEditionLigne(tr: HTMLTableRowElement, seanceDisplay: SeanceDisplay) {
    const cells = tr.querySelectorAll('td');

    cells[0].textContent = formatDateJJMM(parseLocalDate(seanceDisplay.dateJour || '')) || '';
    if (!DataControllerIntranet.filterNameCinema || DataControllerIntranet.filterNameCinema === 'all') {
        cells[1].textContent = seanceDisplay.nameCinema + "-" + seanceDisplay.nameSalle || '';
    } else {
        cells[1].textContent = seanceDisplay.nameSalle || '';
    }
    cells[2].textContent = seanceDisplay.hourBeginHHSMM || '';
    cells[3].textContent = seanceDisplay.hourEndHHSMM || '';
    cells[4].querySelector('img')!.src = imageFilm(seanceDisplay.imageFilm128 ?? '');
    cells[5].textContent = seanceDisplay.titleFilm || '';
    cells[6].textContent = seanceDisplay.duration || '';
    cells[7].textContent = seanceDisplay.capacity?.toString(10) || '';
    cells[8].textContent = seanceDisplay.bo || '';
    cells[9].textContent = seanceDisplay.qualite || '';

    // Réaffichage des boutons standards
    const tdButtons = cells[10];
    tdButtons.textContent = "";
    const divButton = actionsButtons('edit', tr, seanceDisplay);
    tdButtons.appendChild(divButton);
}


/* -------------------------------------------
   Fonction pour sauvegarder l'édition d'une ligne
------------------------------------------- */
async function sauvegarderEditionLigne(tr: HTMLTableRowElement, seance: SeanceDisplay, isDuplicate: boolean = false): Promise<void> {
    // Collecter les nouvelles valeurs depuis les inputs
    const cells = tr.querySelectorAll('td');
    const id = tr.dataset.seanceId;
    const newSeance = new SeanceSeule({ id: id });

    // Date
    const inputDate = cells[0].querySelector('input') as HTMLInputElement;
    newSeance.dateJour = inputDate?.value || '';

    // Salle
    const selectSalle = cells[1].querySelector('select') as HTMLSelectElement;
    const salleId = listSalles.find(s => s.nomSalle === selectSalle?.value)?.id || '';
    newSeance.salleId = salleId;

    const numPMR = listSalles.find(s => s.nomSalle === selectSalle?.value)?.numPMR || '0';
    newSeance.numFreePMR = numPMR!.toString(10);

    // Heures
    const selectHeureDebut = cells[2].querySelector('select') as HTMLSelectElement;
    const selectHeureFin = cells[3].querySelector('select') as HTMLSelectElement;
    newSeance.hourBeginHHSMM = selectHeureDebut?.value || '';
    newSeance.hourEndHHSMM = selectHeureFin?.value || '';

    // filmId
    const nomFilm = (cells[5].querySelector('select') as HTMLSelectElement).value;
    const filmId = listFilms.find(f => f.titre === nomFilm)?.id || ''
    newSeance.filmId = filmId;

    // Capacité (texte)
    newSeance.numFreeSeats = cells[7].textContent?.trim() || '0';

    // BO
    const selectBO = cells[8].querySelector('select') as HTMLSelectElement;
    newSeance.bo = selectBO?.value || '';

    // Qualité
    const selectQualite = cells[9].querySelector('select') as HTMLSelectElement;
    newSeance.qualite = selectQualite?.value || '';

    newSeance.alertAvailibility = "";

    if (isDuplicate) {
        // On cree une nouvelle séance à partir de la ligne
        newSeance.id = crypto.randomUUID();
    }

    // console.log(newSeance);
    try {
        const result = await DataControllerIntranet.createOrUpdateSeance(newSeance);
        if (result.message === 'create') {
            alert("Séance dupliquée");
        } else {
            alert("Séance modifiée");
        }
        await rafraichirTableauSeances();
    } catch (error) {
        alert("Une erreur est survenue : " + error)
    }

}

/* -------------------------------------------
   Fonction pour supprimer une ligne
------------------------------------------- */
async function onClickDeleteSalle(tr: HTMLTableRowElement): Promise<void> {
    const seanceId = tr.dataset.seanceId!;
    try {
        const result = await seancesseulesDeleteApi(seanceId)
        alert("Suppression réussie :" + result.message)
        await rafraichirTableauSeances();
    } catch (error) {
        console.error("Erreur dans la suppression " + error);
        alert("Suppression impossible : " + error);
    }

}