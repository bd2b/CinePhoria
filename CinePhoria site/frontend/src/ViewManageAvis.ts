import { DataControllerIntranet } from './DataControllerIntranet.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { syncTableColumnWidths,formatterJJMM, formatDateLocalYYYYMMDD } from './Helpers.js';
import { ReservationForUtilisateur, ReservationAvis, ReservationState } from './shared-models/Reservation.js';

// Filtre du jour
let filtreJour = '';

/**
 * Entrée principale du module
 */
export async function onLoadManageAvis(vfiltreJour: string = "", filtreCinema: string = "all") {
    console.log("=====> chargement onLoadManageAvis");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Initialisation filtres
    await initFiltreCinema();
    await initFiltreJour();

    // On reporte les valeurs de filtre précédentes
    filtreJour = vfiltreJour;
    DataControllerIntranet.filterNameCinema = filtreCinema;

    // Rafraîchir le tableau des avis
    await rafraichirTableauAvis();
}

/* ---------------------------------------------------
   Rafraîchit la liste de touts les Avis
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

    avis = avis.filter((a) => (a.statereservation === ReservationState.DoneEvaluated && a.isEvaluationMustBeReview ));

    if (filtreJour) {
        avis = avis.filter((s) =>
            s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false)
    }

    // Construction de la page
    const tableAvis = await updateTableAvis(avis) as HTMLTableElement;
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

    let inputDate = document.querySelector('.filter-jour-input') as HTMLInputElement;
    if (!inputDate) { 
        inputDate = document.createElement('input');
        inputDate.classList.add('filter-jour-input');
        inputDate.type = 'date';
    }
    inputDate.value = filtreJour;
    
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
    const allDates = (await DataControllerIntranet.getReservationForUtilisateurFilter()).map((s) => s.dateJour).filter(Boolean).sort() as string[];

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
export async function updateTableAvis(reservationsForUtilisateur: ReservationForUtilisateur[]): Promise<HTMLDivElement> {
    // Container global
    const container = document.createElement('div');
    container.classList.add('tab__avis-liste');

    // Table
    const table = document.createElement('table');
    table.classList.add('tab__avis-liste-table');
    table.id="tab__avis-liste-table";

    // THEAD
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const cols = ['Date', 'Film', 'Utilisateur', 'Note', 'Commentaire', 'Modéré', 'A Supprimer'];

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
        inputAvisRevu.checked = true;
        if (reservationUtilisateur.isEvaluationMustBeReview) {
            inputAvisRevu.checked = false;
        }
        // inputAvisRevu.checked = reservationUtilisateur.isEvaluationMustBeReview ?? false;
        tdAvisRevu.dataset.ischecked = inputAvisRevu.checked ? "true" : "false";
        tdAvisRevu.appendChild(inputAvisRevu);
        tr.appendChild(tdAvisRevu);

        // 5) A supprimer
        const tdASupprimer = document.createElement('td');
        const inputASupprimer = document.createElement('input') as HTMLInputElement;
        inputASupprimer.type = 'checkbox';
        inputASupprimer.checked = false;
        tdASupprimer.appendChild(inputASupprimer);
        tr.appendChild(tdASupprimer);
        tr.dataset.reservationId = reservationUtilisateur.reservationId

        tbody.appendChild(tr);

    });
    // Logique de désactivation mutuelle à l'interaction (pas à la construction)
    tbody.querySelectorAll('tr').forEach(tr => {
        const inputASupprimer = tr.querySelector('td:nth-child(7) input[type="checkbox"]') as HTMLInputElement;
        const inputAvisRevu = tr.querySelector('td:nth-child(6) input[type="checkbox"]') as HTMLInputElement;
        inputASupprimer.addEventListener('change', () => {
            if (inputASupprimer.checked) {
                inputAvisRevu.disabled = true;
            } else {
                inputAvisRevu.disabled = false;
            }
        });
        inputAvisRevu.addEventListener('change', () => {
            if (inputAvisRevu.checked) {
                inputASupprimer.disabled = true;
            } else {
                inputASupprimer.disabled = false;
            }
        });
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
    divButton.appendChild(editBtn);

    const annuleBtn = document.createElement('button');
    annuleBtn.classList.add('tab__salles-liste-button');
    annuleBtn.textContent = "Remise à zéro";
    annuleBtn.addEventListener('click', async () => {
            await onClickAnnuleUpdate();
        });
    divButton.appendChild(annuleBtn);
    return divButton;
   
}

/* -------------------------------------------
   Fonction d'application des modifications
------------------------------------------- */
async function onClickAppliquerUpdate() {

    const table = document.getElementById('tab__avis-liste-table') as HTMLTableElement | null;
    if (!table) return;
 
    const lignes = table.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>;
    const reservationsToUpdate: ReservationAvis[] = [];

    let countUpdate = 0;
    let countDelete = 0;
 
    lignes.forEach((tr) => {
        const reservationId = tr.dataset.reservationId;
        if (!reservationId) return;
 
        const inputAvisRevu = tr.querySelector('td:nth-child(6) input[type="checkbox"]') as HTMLInputElement | null;
        const tdAvisRevu = inputAvisRevu?.parentElement;
        const isCheckedAvis = inputAvisRevu?.checked ?? false;
        const wasCheckedAvis = tdAvisRevu?.dataset.ischecked === 'true';
 
        const inputASupprimer = tr.querySelector('td:nth-child(7) input[type="checkbox"]') as HTMLInputElement | null;
        const isToDelete = inputASupprimer?.checked ?? false;
 
        const tdNote = tr.querySelector('td:nth-child(4)');
        const tdEvaluation = tr.querySelector('td:nth-child(5)');

        
 
        if (isToDelete) {
            reservationsToUpdate.push({
                id: reservationId,
                evaluation: "Evaluation supprimée car non conforme aux usages",
                isEvaluationMustBeReview: false,
                note: undefined
            });
            countDelete ++;
        } else if (isCheckedAvis && !wasCheckedAvis) {
            reservationsToUpdate.push({
                id: reservationId,
                evaluation: tdEvaluation?.textContent?.trim() || "",
                isEvaluationMustBeReview: false,
                note: tdNote?.textContent?.trim() ? parseFloat(tdNote.textContent.trim()) : undefined
            });
            countUpdate ++ ;
        }
    });

    

    for (const reservationAvis of reservationsToUpdate) {
        await DataControllerIntranet.updateReservationAvis(reservationAvis);
    }

    alert(`${countUpdate} validation(s) réalisée(s) et ${countDelete} avis supprimé(s)`);
    onLoadManageAvis(filtreJour,DataControllerIntranet.filterNameCinema);
    
}

/* -------------------------------------------
   retour aux cases decochées
------------------------------------------- */
async function onClickAnnuleUpdate() {
    const table = document.getElementById('tab__avis-liste-table') as HTMLTableElement | null;
    if (!table) return;

    const lignes = table.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>;

    lignes.forEach((tr) => {
        const inputAvisRevu = tr.querySelector('td:nth-child(6) input[type="checkbox"]') as HTMLInputElement | null;
        const inputASupprimer = tr.querySelector('td:nth-child(7) input[type="checkbox"]') as HTMLInputElement | null;
        const tdAvisRevu = inputAvisRevu?.parentElement;

        if (inputASupprimer) inputASupprimer.checked = false;

        if (inputAvisRevu && tdAvisRevu) {
            inputAvisRevu.checked = tdAvisRevu.dataset.ischecked === 'true';
        }

        // Réactiver les deux checkboxes
        if (inputASupprimer) inputASupprimer.disabled = false;
        if (inputAvisRevu) inputAvisRevu.disabled = false;
    });
}
