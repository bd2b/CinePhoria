import { DataControllerIntranet } from './DataControllerIntranet.js';
import { Salle } from './shared-models/Salle.js';
import { Seance, SeanceDisplay, } from './shared-models/Seance.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { syncTableColumnWidths, imageFilm , formatDateJJMM } from './Helpers.js';




/**
 * Entrée principale du module
 */
export async function onLoadManageSeances() {
    console.log("=====> chargement onLoadManageSeances");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Initialisation filtre Cinema
    await initFiltreCinema();

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

    // Charger les films
    const seances = await DataControllerIntranet.getSeancesDisplayFilter();

    // Construction de la page
    const tableSeances = await updateTableSeances(seances) as HTMLTableElement;
    container.appendChild(tableSeances);

    // Mise à jour dynamique des largeurs de colonnes
    syncTableColumnWidths(tableSeances);

    // Initialisation le code de validation du formulaire d'ajout en ligne 1, les écouteurs et le bouton de définition du plan
    // Le formulaire est identique à celui de modification d'une ligne existante dans la modal
    // initFormulaireSalles('create');


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

            console.log("Choix du filtre Cinema = ", DataControllerIntranet.filterNameCinema);

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
     const cols = ['Affiche', 'Titre', 'Durée', 'Salle', 'Capacité', 'Date', 'H. Début', 'H. Fin', 'Bande', 'Qualité', 'Actions'];
    //const cols = ['A', 'T', 'D', 'S', 'C', 'D', 'H', 'H', 'B', 'Q', 'A'];
    
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

    

    // Pour chaque salle, on affiche une ligne de restitution des champ et un bouton éditer.
    seancesDisplay.forEach((seanceDisplay) => {

        const tr = document.createElement('tr');
        // 1) Affiche
        const tdImg = document.createElement('td');
        const img = document.createElement('img');
        img.src = imageFilm(seanceDisplay.imageFilm128 ?? '');
        img.alt = 'Affiche';
        img.classList.add('content-img-td');
        tdImg.appendChild(img);
        tr.appendChild(tdImg);
        
        // 2) Titre
        const tdTitre = document.createElement('td');
        tdTitre.textContent = seanceDisplay.titleFilm || '';
        tr.appendChild(tdTitre);
        
        // 3) Durée
        const tdDuration = document.createElement('td');
        tdDuration.textContent = seanceDisplay.duration || '';
        tr.appendChild(tdDuration);

        // 4) Salle
        const tdSalle = document.createElement('td');
        tdSalle.textContent = seanceDisplay.nameSalle || '';
        tr.appendChild(tdSalle);

        // 5) Capacité
        const tdCapacite = document.createElement('td');
        tdCapacite.textContent = seanceDisplay.capacity?.toString(10) || '';
        tr.appendChild(tdCapacite);

        // 6) Date
        const tdDateJour = document.createElement('td');
        tdDateJour.textContent = formatDateJJMM(new Date(seanceDisplay.dateJour || '')) || '';
        tr.appendChild(tdDateJour);

        // 7) Heure Debut
        const tdHeurD = document.createElement('td');
        tdHeurD.textContent = seanceDisplay.hourBeginHHSMM || '';
        tr.appendChild(tdHeurD);

        // 8) Heure Fin
        const tdHeurF = document.createElement('td');
        tdHeurF.textContent = seanceDisplay.hourEndHHSMM || '';
        tr.appendChild(tdHeurF);

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
        const divButton = document.createElement('div');
        divButton.classList.add('modal-content-btns');

        const editBtn = document.createElement('button');
        editBtn.classList.add('tab__salles-liste-button');
        editBtn.textContent = "Editer";
        editBtn.addEventListener('click', async () => {
            // Lancement de la modale 
            // await onClickEditSalle(salle);
        });
        divButton.appendChild(editBtn);

        const dupBtn = document.createElement('button');
        dupBtn.classList.add('tab__salles-liste-button');
        dupBtn.textContent = 'Dupliquer';
        dupBtn.addEventListener('click', () => {
            // On supprime la salle 
            // onClickDeleteSalle(salle.id);
        });
        divButton.appendChild(dupBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('tab__salles-liste-button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', () => {
            // On supprime la salle 
            // onClickDeleteSalle(salle.id);
        });
        divButton.appendChild(deleteBtn);

        tdActions.appendChild(divButton);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
    container.appendChild(table);
    return container;
}


/* -------------------------------------------
   Initialisation
------------------------------------------- */