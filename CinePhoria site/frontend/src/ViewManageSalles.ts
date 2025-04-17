
import { DataControllerIntranet } from './DataControllerIntranet.js';
import { Salle } from './shared-models/Salle.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { sallesUpdateApi, sallesCreateApi, sallesDeleteApi } from './NetworkController.js';
import { syncTableColumnWidths } from './Helpers.js';



let isDefinePlan = false;

/**
 * Entrée principale du module
 */
export async function onLoadManageSalles() {
    console.log("=====> chargement onLoadManageSalles");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Rafraîchir le tableau des salles
    await rafraichirTableauSalles();
}

/* ---------------------------------------------------
   Rafraîchit la liste de toutes les salles
--------------------------------------------------- */
async function rafraichirTableauSalles(): Promise<void> {
    const container = document.getElementById('salles-table-container');
    if (!container) {
        console.error("Pas de container");
        return;
    }
    container.innerHTML = '';

    // Charger les films
    const salles = await DataControllerIntranet.allSalles();
    // Construction de la page
    const tableSalles = await updateTableSalles(salles) as HTMLTableElement;
    container.appendChild(tableSalles);

    // Mise à jour dynamique des largeurs de colonnes
    syncTableColumnWidths(tableSalles);

    // Initialisation le code de validation du formulaire d'ajout en ligne 1, les écouteurs et le bouton de définition du plan
    // Le formulaire est identique à celui de modification d'une ligne existante dans la modal
    initFormulaireSalles('create');

}
/* ---------------------------------------------------
   Fonction de création de la table 
   composée de en-tête, ligne d'ajout et lignes des salles existantes
--------------------------------------------------- */

export async function updateTableSalles(salles: Salle[]): Promise<HTMLDivElement> {
    // Container global
    const container = document.createElement('div');
    container.classList.add('tab__salles-liste');

    // Table
    const table = document.createElement('table');
    table.classList.add('tab__salles-liste-table');

    // THEAD
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const cols = ['Complexe', 'Salle', 'Capacité', '# places PMR', '# rangés', '# fauteuils', 'Plan salle', 'Actions'];
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

    // Ligne du formulaire d'ajout
    const trInput = await fillFormWithSalle('tr', 'td', 'create');
    trInput.classList.add('sticky-row');
    // table.appendChild(trInput);
    tbody.appendChild(trInput);

    // Boutons d'ajout de la salle dans le formulaire de tete
    const tdActionsInput = document.createElement('td');
    const saveBtnInput = document.createElement('button');
    saveBtnInput.textContent = 'Ajouter une salle';
    saveBtnInput.classList.add('tab__salles-liste-button');
    saveBtnInput.addEventListener('click', async () => {

        // Collecte des valeurs sur un nouvel id
        const newSalle = await buildSalleFromForm(crypto.randomUUID(), 'create');

        // Mise à jour distant
        await sallesCreateApi(newSalle);

        // Recharge de la page.
        onLoadManageSalles();

    });

    tdActionsInput.appendChild(saveBtnInput);
    tdActionsInput.appendChild(saveBtnInput);
    trInput.appendChild(tdActionsInput);
    // On ajoute la premiere ligne
    tbody.appendChild(trInput);

    // Pour chaque salle, on affiche une ligne de restitution des champ et un bouton éditer.
    salles.forEach((salle) => {

        const tr = document.createElement('tr');

        // 1) Complexe
        const tdComplexe = document.createElement('td');
        tdComplexe.textContent = salle.nameCinema || '';
        tr.appendChild(tdComplexe);

        // 2) Salle
        const tdSalle = document.createElement('td');
        tdSalle.textContent = salle.nameSalle || '';
        tr.appendChild(tdSalle);

        // 3) Nb Place
        const tdnPlaces = document.createElement('td');
        tdnPlaces.textContent = salle.capacity?.toString(10) || '';
        tr.appendChild(tdnPlaces);

        // 4) Nb Place PMR
        const tdnPlacesPMR = document.createElement('td');
        tdnPlacesPMR.textContent = salle.numPMR?.toString(10) || '';
        tr.appendChild(tdnPlacesPMR);

        // 5) Nb rangées
        const tdrMax = document.createElement('td');
        tdrMax.textContent = salle.rMax?.toString(10) || '';
        tr.appendChild(tdrMax);

        // 6) Nb fauteuils
        const tdfMax = document.createElement('td');
        tdfMax.textContent = salle.fMax?.toString(10) || '';
        tr.appendChild(tdfMax);

        // 7) Sièges absents : on affiche le nombre de sieges absents
        const tdSiegeAbsent = document.createElement('td');
        const nbSeatsAbsent = nbSiege(salle?.seatsAbsents || '');
        tdSiegeAbsent.textContent = nbSeatsAbsent === 0 ? "Plan rectangulaire" : `${nbSeatsAbsent} desactivé(s)`;
        tr.appendChild(tdSiegeAbsent);

        // 8) Boutons d'actions sur la salle
        const tdActions = document.createElement('td');
        const divButton = document.createElement('div');
        divButton.classList.add('modal-content-btns');

        const editBtn = document.createElement('button');
        editBtn.classList.add('tab__salles-liste-button');
        editBtn.textContent = "Editer";
        editBtn.addEventListener('click', async () => {
            // Lancement de la modale 
            await onClickEditSalle(salle);
        });
        divButton.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('tab__salles-liste-button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', () => {
            // On supprime la salle 
            onClickDeleteSalle(salle.id);
        });
        divButton.appendChild(deleteBtn);

        tdActions.appendChild(divButton);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
    container.appendChild(table);
    return container;
}

/**
* Installe le formulaire de validation et le bouton de plan
*/
export function initFormulaireSalles(suffId: string) {


    function validateFormCreate(): void {
        const inputSeatsAbsent = document.getElementById('seatsAbsentInput' + suffId) as HTMLInputElement;
        const nbSeatsAbsentLabel = document.getElementById('nbSeatsAbsentLabel' + suffId);

        const divtnPlaces = document.getElementById('divtnPlaces' + suffId) as HTMLDivElement;

        const nrMax = parseInt(inputnrMax!.value, 10);
        const nfMax = parseInt(inputnfMax.value, 10);
        const str = inputSeatsAbsent.value;
        let nbSeatsAbsent = 0;
        if (!Number.isNaN(nrMax) && !Number.isNaN(nfMax)) {
            // On peut mettre à jour le champ capacité et le display des sièges
            if (str) {
                // const match = str.match((/^(\d+)\s+desactivé\(s\)$/));
                nbSeatsAbsent = nbSiege(str);
            }
            divtnPlaces.textContent = (nrMax * nfMax - nbSeatsAbsent).toString(10)
            if (nbSeatsAbsentLabel) nbSeatsAbsentLabel.textContent = nbSeatsAbsent === 0 ? "Plan rectangulaire" : `${nbSeatsAbsent} desactivé(s)`;
        } else {
            divtnPlaces.textContent = "";
        }
    }
    const inputnrMax = document.getElementById('nrMaxInput' + suffId) as HTMLInputElement;
    const inputnfMax = document.getElementById('nfMaxInput' + suffId) as HTMLInputElement;
    inputnrMax.addEventListener('input', validateFormCreate);
    inputnfMax.addEventListener('input', validateFormCreate);

    // Action d'appel de la définition du plan
    const planBtn = document.getElementById('planBtn' + suffId) as HTMLButtonElement;
    planBtn.addEventListener('click', async () => {
        isDefinePlan = true;
        // On affiche la carte de la salle en masquant les sieges absent
        const nPlacesPMR = parseInt((document.getElementById('nPlacesPMRInput' + suffId) as HTMLInputElement).value, 10);
        const nrMax = parseInt((document.getElementById('nrMaxInput' + suffId) as HTMLInputElement).value, 10);
        const nfMax = parseInt((document.getElementById('nfMaxInput' + suffId) as HTMLInputElement).value, 10);
        const inputSeatsAbsent = document.getElementById('seatsAbsentInput' + suffId) as HTMLInputElement;
        const seatsAbsent = inputSeatsAbsent.value;

        if (Number.isNaN(nrMax) || Number.isNaN(nfMax)) {
            alert("Définissez d'abord le rectangle de la salle.")
        } else {
            const result = await onClickDisplaySiegeAbsent(nrMax, nfMax, seatsAbsent, nPlacesPMR);
            // On met à jour le text du bouton
            const planBtn = document.getElementById('planBtn' + suffId);
            const nbSeatsAbsent = nbSiege(result);
            planBtn!.textContent = nbSeatsAbsent === 0 ? "Plan rectangulaire" : `${nbSeatsAbsent} desactivé(s)`;
            // On stocke le résultat dans le champ masqué
            if (result) {
                inputSeatsAbsent.value = result;
            }
            // J'applique la modification sur le formulaire pour actualiser le contenu
            validateFormCreate();
        }
    });

    const inputSeatsAbsent = document.getElementById('seatsAbsentInput' + suffId) as HTMLInputElement;
    const seatsAbsent = nbSiege(inputSeatsAbsent.value);
    planBtn!.textContent = seatsAbsent === 0 ? "Plan rectangulaire" : `${seatsAbsent} desactivé(s)`;
}

export function createCinemaDropdown(nameCinema: string, suffId: string): HTMLDivElement {
    const container = document.createElement('div');
    container.style.position = 'relative';

    // Bouton principal
    const button = document.createElement('button');
    button.className = 'title__filter-dropdown-button titre__filter-dropdown-complexe';
    button.style.display = 'block';
    button.id = 'titre__filter-dropdown-complexe' + suffId;
    button.innerHTML = `${nameCinema} <span class="chevron">▼</span>`;
    container.appendChild(button);

    // Dropdown content
    const dropdown = document.createElement('div');
    dropdown.className = 'title__filter-button-drowdown-content title__filter-button-drowdown-content-complexe';
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1000';
    dropdown.style.backgroundColor = '#fff';

    const cinemas = ['Paris', 'Bordeaux', 'Nantes', 'Lille', 'Toulouse', 'Charleroi', 'Liège'];
    cinemas.forEach(cinema => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = cinema;
        a.dataset.cinema = cinema;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            button.innerHTML = `${cinema} <span class="chevron">▼</span>`;
            dropdown.style.display = 'none';
        });
        dropdown.appendChild(a);
    });

    container.appendChild(dropdown);

    // Toggle dropdown
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Ferme si clic ailleurs
    document.addEventListener('click', () => dropdown.style.display = 'none');

    return container;
}

/**
 * Affiche le plan de la salle
 * @param rMax
 * @param rMax
 * @param seatsAbsents 
 * @param numPMR
 * @param readOnly // Indique si on peut selectionner des places non disponibles
 * @return null en readonly et la liste des seats Absents sinon
 */


/**
 * Edition d'une ligne sélectionnée dans le tableau
 */
async function onClickEditSalle(salle: Salle) {

    // Sélectionner la modale
    let modal = document.getElementById('modal-editSalle') as HTMLDivElement | null;
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-editSalle';
        modal.classList.add('modal');
        document.body.appendChild(modal);
        modal.innerHTML = '';
    }

    // Paramétrage des éléments
    let titreModel = `${salle.nameSalle} à ${salle.nameCinema}`;

    // HTML de la modale 
    const modaleditSalleLocalHTML = `
    <div class="modal__content-wrapper">
        <div class="modal__title">
            <div class="title__editSalle title-h2">
                <h2>${titreModel}</h2>
            </div>
            <span class="close-modal" id="close-editSalle">×</span>
        </div>
        <div class="modal__content form__group" id="content__editSalle" flex-direction>
        </div>
    </div>`;

    // Injecter la modale
    modal.innerHTML = modaleditSalleLocalHTML;
    modal.style.zIndex = '1000';
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Bouton de fermeture de la modale
    const closeModalBtn = document.getElementById("close-editSalle") as HTMLButtonElement | null;

    // Fonction pour fermer la modale
    const closeModal = () => {
        modal.style.display = 'none';
        modal.remove;
    };

    // Fermer la modale avec le bouton (X)
    closeModalBtn?.addEventListener('click', closeModal);

    // Fermer la modale en cliquant en dehors
    modal.addEventListener('click', (event: MouseEvent) => {
        if (event.target === modal) closeModal();
    });

    const container = document.getElementById('content__editSalle')!;
    // Injecter le formulaire de recueil
    const inputSalle = await fillFormWithSalle('div', 'div', 'table', salle);
    container.appendChild(inputSalle);

    // Initialisation le code de validation du formulaire modal, les écouteurs et le bouton de définition du plan
    initFormulaireSalles('table');

    // Injecter les boutons
    const containerButtons = document.createElement('div');
    containerButtons.classList.add('modal-content-btns');

    const annButton = document.createElement('button');
    annButton.classList.add('button');
    annButton.id = "annBtn";
    annButton.textContent = "Annuler";
    containerButtons.appendChild(annButton);

    annButton?.addEventListener('click', closeModal);

    const saveButton = document.createElement('button');
    saveButton.classList.add('button');
    saveButton.id = "saveButton";
    containerButtons.appendChild(saveButton);
    saveButton.textContent = 'Enregistrer';
    containerButtons.appendChild(saveButton);

    // Gestion du bouton "Enregistrer"
    saveButton.removeEventListener('click', async () => { });
    saveButton.addEventListener('click', async () => {

        // Collecte des valeurs
        const newSalle = await buildSalleFromForm(salle.id, 'table');

        // Recopie des seatsAbsents qui ne sont pas saisis dans le formulaire
        // newSalle.seatsAbsents = salle.seatsAbsents;

        // Mise à jour distant
        await sallesUpdateApi(salle.id, newSalle);

        // Fermeture de la modal
        closeModal();

        // Recharge de la page.
        onLoadManageSalles();

    });

    container.appendChild(containerButtons);

};

/**
 * Suppression ou desactivation de ligne
 */
async function onClickDeleteSalle(salleId: string) {

    try {
        await sallesDeleteApi(salleId)
        // Recharge de la page.
        onLoadManageSalles();
    } catch (error) {
        alert('Suppression impossible ' + error)
    }
}


async function fillFormWithSalle(typeEltParentHTML: string, typeEltChildHTML: string, suffId: string, salle?: Salle): Promise<HTMLElement> {

    // Ligne du masque d'édition
    const eltHTML = document.createElement(typeEltParentHTML);

    // 1) Complexe
    const tdComplexe = document.createElement(typeEltChildHTML);
    // Dropdown avec la liste des cinemas
    tdComplexe.appendChild(createCinemaDropdown(salle?.nameCinema || 'Paris', suffId));
    if (suffId === 'table') {
        tdComplexe.classList.add('form__group');
    }

    eltHTML.appendChild(tdComplexe);

    // 2) Salle
    const tdSalleInput = document.createElement(typeEltChildHTML);

    const inputSalle = document.createElement('input');
    inputSalle.type = 'text';
    inputSalle.id = 'nameSalleInput' + suffId;
    inputSalle.placeholder = 'Nom de la salle';
    if (salle?.nameSalle) {
        inputSalle.value = salle.nameSalle;
    }
    inputSalle.required = true;
    if (suffId === 'table') {
        tdSalleInput.classList.add('form__group');
        const label = document.createElement('label');
        label.htmlFor = 'nameSalleInput' + suffId;
        label.textContent = 'Nom de la salle :';
        tdSalleInput.appendChild(label);
    }
    tdSalleInput.appendChild(inputSalle);
    eltHTML.appendChild(tdSalleInput);

    // 3) Nb Place

    // On affiche la capacity calculee
    const tdnPlacesInput = document.createElement(typeEltChildHTML);
    const divtnPlaces = document.createElement('label');
    divtnPlaces.id = "divtnPlaces" + suffId;


    divtnPlaces.textContent = ((salle?.fMax || 0) * (salle?.rMax || 0) - nbSiege(salle?.seatsAbsents || '')).toString(10);
    if (suffId === 'table') {
        tdSalleInput.classList.add('form__group');
        divtnPlaces.textContent = "Capacité : " + divtnPlaces.textContent;
    }
    tdnPlacesInput.appendChild(divtnPlaces);
    eltHTML.appendChild(tdnPlacesInput)

    // 4) Nb Place PMR

    const tdnPlacesPMRInput = document.createElement(typeEltChildHTML);
    const inputnPlacesPMR = document.createElement('input');
    inputnPlacesPMR.type = 'numeric';
    inputnPlacesPMR.id = 'nPlacesPMRInput' + suffId;
    inputnPlacesPMR.placeholder = 'Places PMR';
    inputnPlacesPMR.required = true;
    inputnPlacesPMR.step = "1";
    inputnPlacesPMR.max = "20";
    inputnPlacesPMR.min = "0";
    salle?.numPMR ? inputnPlacesPMR.value = (salle.numPMR.toString(10)) : 0;
    if (suffId === 'table') {
        tdnPlacesPMRInput.classList.add('form__group');
        const label = document.createElement('label');
        label.htmlFor = 'nPlacesPMRInput' + suffId;
        label.textContent = 'Nombre de places PMR :';
        tdnPlacesPMRInput.appendChild(label);
    }
    tdnPlacesPMRInput.appendChild(inputnPlacesPMR);
    eltHTML.appendChild(tdnPlacesPMRInput);

    // 5) Nb rangées
    const tdnrMaxInput = document.createElement(typeEltChildHTML);
    const inputnrMax = document.createElement('input');
    inputnrMax.type = 'numeric';
    inputnrMax.id = 'nrMaxInput' + suffId;
    inputnrMax.placeholder = 'Nombre rangées';
    inputnrMax.required = true;
    inputnrMax.step = "1";
    inputnrMax.max = "50";
    inputnrMax.min = "5";
    salle?.rMax ? inputnrMax.value = (salle.rMax.toString(10)) : 0;
    if (suffId === 'table') {
        tdnrMaxInput.classList.add('form__group');
        const label = document.createElement('label');
        label.htmlFor = 'nrMaxInput' + suffId;
        label.textContent = 'Nombre de rangées :';
        tdnrMaxInput.appendChild(label);
    }
    tdnrMaxInput.appendChild(inputnrMax);
    eltHTML.appendChild(tdnrMaxInput);

    // 6) Nb fauteuils
    const tdnfMaxInput = document.createElement(typeEltChildHTML);
    const inputnfMax = document.createElement('input');
    inputnfMax.type = 'numeric';
    inputnfMax.id = 'nfMaxInput' + suffId;
    inputnfMax.placeholder = 'Nombre fauteuils par rangée';
    inputnfMax.required = true;
    inputnfMax.step = "1";
    inputnfMax.max = "50";
    inputnfMax.min = "5";
    if (suffId === 'table') {
        tdnfMaxInput.classList.add('form__group');
        const label = document.createElement('label');
        label.htmlFor = 'nfMaxInput' + suffId;
        label.textContent = 'Nombre de fauteuils par rangées :';
        tdnfMaxInput.appendChild(label);
    }
    salle?.fMax ? inputnfMax.value = (salle.fMax.toString(10)) : 0;
    tdnfMaxInput.appendChild(inputnfMax);

    // 7) Sieges absents, deux champs sont utilisés, 
    // un caché pour la saisie par programme que l'on colle à fMax
    // un affiché pour restituer la valeur du nombre de sieges supprimé uniquement pour table
    // On le met dans un div pour éviter d'avoir deux composants (dans la table ou dans la modale)

    const tdSeatsAbsent = document.createElement(typeEltChildHTML);

    // Saisie

    const inputSeatsAbsent = document.createElement('input');
    inputSeatsAbsent.type = 'hidden';
    inputSeatsAbsent.id = 'seatsAbsentInput' + suffId;
    salle?.seatsAbsents ? inputSeatsAbsent.value = salle.seatsAbsents : "";
    tdnfMaxInput.appendChild(inputSeatsAbsent);
    eltHTML.appendChild(tdnfMaxInput);

    // 9) Liste des sièges absents : bouton pour afficher la modal de plan et choisir les sieges absents
    // Uniquement pour le formulaire de création (pour les autres, la modal de plan est appelée depuis la modal de salle)
    // if (suffId === 'create') {
    const tdSiegeAbsentInput = document.createElement('td');
    const planBtn = document.createElement('button');

    planBtn.classList.add('tab__salles-liste-button');
    planBtn.textContent = 'Définir...';
    planBtn.id = 'planBtn' + suffId;

    tdSiegeAbsentInput.appendChild(planBtn);
    eltHTML.appendChild(tdSiegeAbsentInput);
    //}

    return eltHTML;

}

async function buildSalleFromForm(salleId: string, suffId: string): Promise<Salle> {
    const newSalle = new Salle({ id: salleId });

    const complexe = document.getElementById('titre__filter-dropdown-complexe' + suffId) as HTMLButtonElement;
    if (complexe) newSalle.nameCinema = complexe.textContent?.replace('▼', '').trim() || 'Paris';
    console.log("Nom cinema = ", newSalle.nameCinema);

    const nameSalleInput = document.getElementById('nameSalleInput' + suffId) as HTMLInputElement;
    if (nameSalleInput) newSalle.nameSalle = nameSalleInput.value?.trim() || '';

    const nPlacesPMRInput = document.getElementById('nPlacesPMRInput' + suffId) as HTMLInputElement;
    if (nPlacesPMRInput) newSalle.numPMR = parseInt(nPlacesPMRInput.value?.trim() || "0", 10) || 0;

    const inputnrMax = document.getElementById('nrMaxInput' + suffId) as HTMLInputElement;
    if (inputnrMax) newSalle.rMax = parseInt(inputnrMax.value?.trim() || "0", 10) || 0;

    const inputnfMax = document.getElementById('nfMaxInput' + suffId) as HTMLInputElement;
    if (inputnfMax) newSalle.fMax = parseInt(inputnfMax.value?.trim() || "0", 10) || 0;

    const inputSeatsAbsent = document.getElementById('seatsAbsentInput' + suffId) as HTMLInputElement;
    if (inputSeatsAbsent) newSalle.seatsAbsents = inputSeatsAbsent.value?.trim() || "";

    // On calcule le nombre de place
    newSalle.capacity = (newSalle?.fMax || 0) * (newSalle?.rMax || 0) - nbSiege(newSalle?.seatsAbsents || '');

    console.log("Salle du formulaire", JSON.stringify(newSalle));

    return newSalle;

}

/**
 * Sélection des places manquantes via une modale.
 * @param seatsAbsents Liste des emplacements sans sieges (ex: ["R13F0", "R13F1", ...])
 * @param rMax Nombre de rangées totales (0..rMax-1)
 * @param fMax Nombre de fauteuils par rang (0..fMax-1)
 * @param maxPMR Nombre total de places PMR existantes sur la rangée 0
 * @returns Un tableau de places sélectionnées (ex: ["R2F1", "R2F2", ...])
 */
export async function onClickDisplaySiegeAbsent(
    rMax: number,
    fMax: number,
    pseatsAbsents: string,
    maxPMR: number
): Promise<string> {
    const seatsAbsents = pseatsAbsents.length > 0 ? pseatsAbsents.split(',').map(s => s.trim().replace(/^"|"$/g, '')) : [];
    return new Promise<string>((resolve) => {
        const modalHTML = `
      <div class="modal__content-wrapper" id="modal-displayAndSeatsSuppr">
        <div class="modal__title">
          <div class="title__displayAndSeatsSuppr title-h2">
            <h2>Sélectionner les places absentes</h2>
          </div>
          <span class="close-modal" id="close-displayAndSeatsSuppr">×</span>
        </div>
        <div class="modal__content" id="content__displayAndSeatsSuppr"></div>
        <div class="modal__footer" style="margin-top: 10px; display:flex; gap:10px; justify-content: end;">
          <button id="btnAnnulerSeats" class="button">Annuler</button>
          <button id="btnValiderSeats" class="button">Valider</button>
        </div>
      </div>`;

        let modal = document.getElementById('modal-displayAndSeatsSuppr') as HTMLDivElement | null;
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-displayAndSeatsSuppr';
            modal.classList.add('modal');
            modal.style.zIndex = '2000';
            document.body.appendChild(modal);
            modal.innerHTML = '';
        }
        modal.innerHTML = modalHTML;
        modal.style.display = 'flex';

        const closeModalBtn = document.getElementById('close-displayAndSeatsSuppr') as HTMLSpanElement | null;
        const contentDiv = document.getElementById('content__displayAndSeatsSuppr') as HTMLDivElement | null;
        const annulerBtn = document.getElementById('btnAnnulerSeats') as HTMLButtonElement | null;
        const validerBtn = document.getElementById('btnValiderSeats') as HTMLButtonElement | null;

        // Places à supprimer
        const supprSeats: string[] = seatsAbsents;

        // Fermer la modale
        const closeModal = (resolveValue: string[]) => {

            modal.style.display = 'none';

            // Réaffiche la modale 1 si elle existe et si on n'est pas dans la définition pour une nouvelle salle

            if (!isDefinePlan) {
                const modalEdit = document.getElementById('modal-editSalle');
                if (modalEdit && modalEdit.style.display === 'none') modalEdit.style.display = 'flex';
            } else {
                isDefinePlan = false;
            }

            modal.remove;
            if (resolveValue.length === 0) {
                resolve("");
            }
            else {
                resolve(resolveValue.join(","));
            }

        };

        // Fermetures
        closeModalBtn?.addEventListener('click', (evt: MouseEvent) => {
            evt.stopPropagation();
            closeModal([])
        });
        modal.addEventListener('click', (evt: MouseEvent) => {
            evt.stopPropagation();
            if (evt.target === modal) closeModal([]);
        });
        annulerBtn?.addEventListener('click', (evt: MouseEvent) => {
            evt.stopPropagation();
            closeModal([])
        });

        // Bouton Valider => renvoie supprSeats
        validerBtn?.removeEventListener('click', () => { });
        validerBtn?.addEventListener('click', (evt: MouseEvent) => {
            evt.stopPropagation();
            closeModal([...supprSeats]);
        });

        // Construction du plan de salle
        if (contentDiv) {
            for (let r = 0; r < rMax; r++) {
                const rowDiv = document.createElement('div');
                rowDiv.style.display = 'flex';
                rowDiv.style.flexDirection = 'row';
                rowDiv.style.margin = '2px 0';

                // Label “R X”
                const rowLabel = document.createElement('span');
                rowLabel.textContent = `R${r} `;
                rowLabel.style.width = '40px';
                rowLabel.style.textAlign = 'right';
                rowDiv.appendChild(rowLabel);

                for (let f = 0; f < fMax; f++) {
                    const seatId = `R${r}F${f}`;

                    const seatBtn = document.createElement('div');
                    seatBtn.style.width = '30px';
                    seatBtn.style.height = '30px';
                    seatBtn.style.marginRight = '4px';
                    seatBtn.style.display = 'flex';
                    seatBtn.style.alignItems = 'center';
                    seatBtn.style.justifyContent = 'center';
                    seatBtn.style.cursor = 'pointer';
                    seatBtn.style.fontSize = '0.7em';
                    seatBtn.style.borderRadius = '4px';

                    // PMR => si r=0 && f < maxPMR
                    if (r === 0 && f < maxPMR) {
                        seatBtn.textContent = 'PMR';
                    }
                    // Si la place est déjà sans siege
                    if (seatsAbsents && seatsAbsents.includes(seatId)) {
                        seatBtn.style.backgroundColor = 'white';
                    } else {
                        seatBtn.style.backgroundColor = 'lightgray';
                    }
                    // Toggle
                    seatBtn.removeEventListener('click', () => { });
                    seatBtn.addEventListener('click', () => {
                        if (supprSeats.includes(seatId)) {
                            // Désélection ?
                            supprSeats.splice(supprSeats.indexOf(seatId), 1);
                            seatBtn.style.backgroundColor = 'lightgray';
                        } else {
                            // Suppression du siege
                            supprSeats.push(seatId);
                            seatBtn.style.backgroundColor = 'white';
                        }
                    });
                    rowDiv.appendChild(seatBtn);
                }
                contentDiv.appendChild(rowDiv);
            }
        }

    });
}

function nbSiege(seatsAbsents: string): number {
    if (seatsAbsents.length > 0) {
        return (seatsAbsents.match(/,/g) || []).length + 1;
    } else {
        return 0;
    }
}


