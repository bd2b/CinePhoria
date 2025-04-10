var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DataControllerIntranet } from './DataControllerIntranet.js';
import { Salle } from './shared-models/Salle.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { sallesUpdateApi, sallesCreateApi } from './NetworkController.js';
let seatsAbsentsInput = "";
/**
 * Entrée principale du module
 */
export function onLoadManageSalles() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadManageSalles");
        // Charger menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // Rafraîchir le tableau des salles
        yield rafraichirTableauSalles();
    });
}
/* ---------------------------------------------------
   Rafraîchit la liste de tous les films,
   et affiche le premier ou le film sélectionné
--------------------------------------------------- */
function rafraichirTableauSalles() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('salles-table-container');
        if (!container) {
            console.error("Pas de container");
            return;
        }
        container.innerHTML = '';
        // Charger les films
        const salles = yield DataControllerIntranet.allSalles();
        const tableSalles = yield updateTableSalles(salles);
        container.appendChild(tableSalles);
    });
}
export function updateTableSalles(salles) {
    return __awaiter(this, void 0, void 0, function* () {
        // Container global
        const container = document.createElement('div');
        container.classList.add('tab__salles-liste');
        // Table
        const table = document.createElement('table');
        table.classList.add('tab__salles-liste-table');
        // THEAD
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        const cols = ['Complexe', 'Salle', 'Capacité totale', '# places PMR', '# rangés', '# fauteuils', 'Plan salle', ''];
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
        // Ligne du masque d'édition
        //const tr = document.createElement('tr');
        const trInput = fillFormWithSalle('tr', 'td', 'create');
        table.appendChild(trInput);
        // 7) Liste des sièges absents : bouton pour afficher la modalle de salle et choisir les sieges absents
        const tdSiegeAbsentInput = document.createElement('td');
        const siegeAbsentInputBtn = document.createElement('button');
        siegeAbsentInputBtn.classList.add('tab__salles-liste-button');
        siegeAbsentInputBtn.textContent = 'Définir...';
        siegeAbsentInputBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            // On affiche la carte de la salle en masquant les sieges absent
            const nPlacesPMR = parseInt(document.getElementById('nPlacesPMRInputcreate').value, 10);
            const nrMax = parseInt(document.getElementById('nrMaxInputcreate').value, 10);
            const nfMax = parseInt(document.getElementById('nfMaxInputcreate').value, 10);
            if (Number.isNaN(nrMax) || Number.isNaN(nfMax)) {
                alert("Définissez d'abord le rectangle de la salle.");
            }
            else {
                const result = yield onClickDisplaySiegeAbsent(nrMax, nfMax, seatsAbsentsInput, nPlacesPMR);
                if (result)
                    seatsAbsentsInput = result;
            }
        }));
        tdSiegeAbsentInput.appendChild(siegeAbsentInputBtn);
        trInput.appendChild(tdSiegeAbsentInput);
        // 8) Boutons d'actions sur la salle
        const tdActionsInput = document.createElement('td');
        const saveBtnInput = document.createElement('button');
        saveBtnInput.textContent = 'Ajouter une salle';
        saveBtnInput.classList.add('tab__salles-liste-button');
        saveBtnInput.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            // Collecte des valeurs sur un nouvel id
            const newSalle = yield buildSalleFromForm(crypto.randomUUID(), 'create');
            // On récupère les siège absents qui on pu être défini puis on remet à ''
            newSalle.seatsAbsents = seatsAbsentsInput;
            seatsAbsentsInput = "";
            // Mise à jour distant
            yield sallesCreateApi(newSalle);
            // Fermeture de la modal
            // closeModal();
            // Recharge de la page.
            onLoadManageSalles();
        }));
        tdActionsInput.appendChild(saveBtnInput);
        tdActionsInput.appendChild(saveBtnInput);
        trInput.appendChild(tdActionsInput);
        // On ajoute la premiere ligne
        tbody.appendChild(trInput);
        // Pour chaque salle
        salles.forEach((salle) => {
            var _a, _b, _c, _d;
            const salleId = salle.id;
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
            tdnPlaces.textContent = ((_a = salle.capacity) === null || _a === void 0 ? void 0 : _a.toString(10)) || '';
            tr.appendChild(tdnPlaces);
            // 4) Nb Place PMR
            const tdnPlacesPMR = document.createElement('td');
            tdnPlacesPMR.textContent = ((_b = salle.numPMR) === null || _b === void 0 ? void 0 : _b.toString(10)) || '';
            tr.appendChild(tdnPlacesPMR);
            // 5) Nb rangées
            const tdrMax = document.createElement('td');
            tdrMax.textContent = ((_c = salle.rMax) === null || _c === void 0 ? void 0 : _c.toString(10)) || '';
            tr.appendChild(tdrMax);
            // 6) Nb fauteuils
            const tdfMax = document.createElement('td');
            tdfMax.textContent = ((_d = salle.fMax) === null || _d === void 0 ? void 0 : _d.toString(10)) || '';
            tr.appendChild(tdfMax);
            // 7) Liste des sièges absents : bouton pour afficher la modalle de salle et choisir les sieges absents
            const tdSiegeAbsent = document.createElement('td');
            const siegeAbsentBtn = document.createElement('button');
            siegeAbsentBtn.classList.add('tab__salles-liste-button');
            siegeAbsentBtn.textContent = 'Modifier';
            siegeAbsentBtn.addEventListener('click', () => {
                // On affiche la carte de la salle en masquant les sieges absent 
                onClickDisplaySiegeAbsent(salle.rMax || 0, salle.fMax || 0, salle.seatsAbsents || '', salle.numPMR || 0);
            });
            tdSiegeAbsent.appendChild(siegeAbsentBtn);
            tr.appendChild(tdSiegeAbsent);
            // 8) Boutons d'actions sur la salle
            const tdActions = document.createElement('td');
            const divButton = document.createElement('div');
            const editBtn = document.createElement('button');
            editBtn.classList.add('tab__salles-liste-button');
            editBtn.textContent = "Editer";
            editBtn.addEventListener('click', () => {
                // Lancement de la modale 
                onClickEditSalle(salle, 'table');
            });
            divButton.appendChild(editBtn);
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('tab__salles-liste-button');
            deleteBtn.textContent = 'Desactiver';
            deleteBtn.addEventListener('click', () => {
                // On supprime la salle 
                onClickDeleteSalle();
            });
            divButton.appendChild(deleteBtn);
            tdActions.appendChild(divButton);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
        container.appendChild(table);
        return container;
    });
}
export function createCinemaDropdown(nameCinema, suffId) {
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
 * Passage en édition de ligne
 */
function onClickEditSalle(salle, suffId) {
    // Sélectionner la modale
    const modal = document.getElementById('modal-editSalle');
    // Paramétrage des éléments
    let titreModel = `${salle.nameSalle} à ${salle.nameCinema}`;
    if (!modal)
        return;
    // HTML de la modale 
    const modaleditSalleLocalHTML = `
    <div class="modal__content-wrapper">
        <div class="modal__title">
            <div class="title__editSalle title-h2">
                <h2>${titreModel}</h2>
            </div>
            <span class="close-modal" id="close-editSalle">×</span>
        </div>
        <div class="modal__content" id="content__editSalle">
        </div>
    </div>`;
    // Injecter la modale
    modal.innerHTML = modaleditSalleLocalHTML;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    // Bouton de fermeture de la modale
    const closeModalBtn = document.getElementById("close-editSalle");
    // Fonction pour fermer la modale
    const closeModal = () => {
        modal.style.display = 'none';
    };
    // Fermer la modale avec le bouton (X)
    closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener('click', closeModal);
    // Fermer la modale en cliquant en dehors
    modal.addEventListener('click', (event) => {
        if (event.target === modal)
            closeModal();
    });
    const container = document.getElementById('content__editSalle');
    // Injecter le formulaire de recueil
    const inputSalle = fillFormWithSalle('div', 'div', 'table', salle);
    container.appendChild(inputSalle);
    // Injecter les boutons
    const containerButtons = document.createElement('div');
    containerButtons.classList.add('modal-content-btns');
    const annButton = document.createElement('button');
    annButton.classList.add('button');
    annButton.id = "annBtn";
    annButton.textContent = "Annuler";
    containerButtons.appendChild(annButton);
    annButton === null || annButton === void 0 ? void 0 : annButton.addEventListener('click', closeModal);
    const saveButton = document.createElement('button');
    saveButton.classList.add('button');
    saveButton.id = "saveButton";
    containerButtons.appendChild(saveButton);
    saveButton.textContent = 'Enregistrer';
    containerButtons.appendChild(saveButton);
    // Gestion du bouton "Enregistrer"
    saveButton.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    saveButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        // Collecte des valeurs
        const newSalle = yield buildSalleFromForm(salle.id, 'table');
        // Recopie des seatsAbsents qui ne sont pas saisis dans le formulaire
        newSalle.seatsAbsents = salle.seatsAbsents;
        // Mise à jour distant
        yield sallesUpdateApi(salle.id, newSalle);
        // Fermeture de la modal
        closeModal();
        // Recharge de la page.
        onLoadManageSalles();
    }));
    container.appendChild(containerButtons);
}
;
/**
 * Suppression ou desactivation de ligne
 */
function onClickDeleteSalle() {
}
function fillFormWithSalle(typeEltParentHTML, typeEltChildHTML, suffId = "", salle) {
    var _a;
    // Ligne du masque d'édition
    const eltHTML = document.createElement(typeEltParentHTML);
    // 1) Complexe
    const tdComplexe = document.createElement(typeEltChildHTML);
    // Dropdown avec la liste des cinemas
    tdComplexe.appendChild(createCinemaDropdown((salle === null || salle === void 0 ? void 0 : salle.nameCinema) || 'Paris', suffId));
    eltHTML.appendChild(tdComplexe);
    // 2) Salle
    const tdSalleInput = document.createElement(typeEltChildHTML);
    const inputSalle = document.createElement('input');
    inputSalle.type = 'text';
    inputSalle.id = 'nameSalleInput' + suffId;
    inputSalle.placeholder = 'Nom de la salle';
    if (salle === null || salle === void 0 ? void 0 : salle.nameSalle) {
        inputSalle.value = salle.nameSalle;
    }
    inputSalle.required = true;
    tdSalleInput.appendChild(inputSalle);
    eltHTML.appendChild(tdSalleInput);
    // 3) Nb Place
    // const tdnPlacesInput = document.createElement(typeEltChildHTML);
    // const inputnPlaces = document.createElement('input');
    // inputnPlaces.type = 'numeric';
    // inputnPlaces.id = 'nPlacesInput' + suffId;
    // inputnPlaces.placeholder = 'Capacité totale';
    // inputnPlaces.required = true;
    // inputnPlaces.step = "1";
    // inputnPlaces.max = "2000";
    // inputnPlaces.min = "100";
    // salle?.capacity ? inputnPlaces.value = (salle.capacity.toString(10)) : 0;
    // tdnPlacesInput.appendChild(inputnPlaces);
    // eltHTML.appendChild(tdnPlacesInput)
    // On affiche la capacity calculee
    const tdnPlacesInput = document.createElement(typeEltChildHTML);
    const divtnPlaces = document.createElement('div');
    divtnPlaces.textContent = (((salle === null || salle === void 0 ? void 0 : salle.fMax) || 0) * ((salle === null || salle === void 0 ? void 0 : salle.rMax) || 0) - (((_a = salle === null || salle === void 0 ? void 0 : salle.seatsAbsents) === null || _a === void 0 ? void 0 : _a.match(/,/g)) || []).length).toString(10);
    tdnPlacesInput.appendChild(divtnPlaces);
    eltHTML.appendChild(tdnPlacesInput);
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
    (salle === null || salle === void 0 ? void 0 : salle.numPMR) ? inputnPlacesPMR.value = (salle.numPMR.toString(10)) : 0;
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
    (salle === null || salle === void 0 ? void 0 : salle.rMax) ? inputnrMax.value = (salle.rMax.toString(10)) : 0;
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
    (salle === null || salle === void 0 ? void 0 : salle.fMax) ? inputnfMax.value = (salle.fMax.toString(10)) : 0;
    tdnfMaxInput.appendChild(inputnfMax);
    eltHTML.appendChild(tdnfMaxInput);
    return eltHTML;
}
function buildSalleFromForm(salleId, suffId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const newSalle = new Salle({ id: salleId });
        const complexe = document.getElementById('titre__filter-dropdown-complexe' + suffId);
        if (complexe)
            newSalle.nameCinema = ((_a = complexe.textContent) === null || _a === void 0 ? void 0 : _a.replace('▼', '').trim()) || 'Paris';
        console.log("Nom cinema = ", newSalle.nameCinema);
        const nameSalleInput = document.getElementById('nameSalleInput' + suffId);
        if (nameSalleInput)
            newSalle.nameSalle = ((_b = nameSalleInput.value) === null || _b === void 0 ? void 0 : _b.trim()) || '';
        const nPlacesPMRInput = document.getElementById('nPlacesPMRInput' + suffId);
        if (nPlacesPMRInput)
            newSalle.numPMR = parseInt(((_c = nPlacesPMRInput.value) === null || _c === void 0 ? void 0 : _c.trim()) || "0", 10) || 0;
        const inputnrMax = document.getElementById('nrMaxInput' + suffId);
        if (inputnrMax)
            newSalle.rMax = parseInt(((_d = inputnrMax.value) === null || _d === void 0 ? void 0 : _d.trim()) || "0", 10) || 0;
        const inputnfMax = document.getElementById('nfMaxInput' + suffId);
        if (inputnfMax)
            newSalle.fMax = parseInt(((_e = inputnfMax.value) === null || _e === void 0 ? void 0 : _e.trim()) || "0", 10) || 0;
        // On calcule le nombre de place
        newSalle.capacity = ((newSalle === null || newSalle === void 0 ? void 0 : newSalle.fMax) || 0) * ((newSalle === null || newSalle === void 0 ? void 0 : newSalle.rMax) || 0) - (((_f = newSalle === null || newSalle === void 0 ? void 0 : newSalle.seatsAbsents) === null || _f === void 0 ? void 0 : _f.match(/,/g)) || []).length;
        console.log("Salle du formulaire", JSON.stringify(newSalle));
        return newSalle;
    });
}
// function onClickDisplaySiegeAbsent(
//     rMax: number, 
//     fMax: number, 
//     seatsAbsents: string, 
//     numPMR: number, 
//     readOnly: boolean = true): string | null {
//     return "";
// }
/**
 * Sélection des places manquantes via une modale.
 * @param seatsAbsents Liste des emplacements sans sieges (ex: ["R13F0", "R13F1", ...])
 * @param rMax Nombre de rangées totales (0..rMax-1)
 * @param fMax Nombre de fauteuils par rang (0..fMax-1)
 * @param maxPMR Nombre total de places PMR existantes sur la rangée 0
 * @returns Un tableau de places sélectionnées (ex: ["R2F1", "R2F2", ...])
 */
export function onClickDisplaySiegeAbsent(rMax, fMax, pseatsAbsents, maxPMR) {
    return __awaiter(this, void 0, void 0, function* () {
        const seatsAbsents = pseatsAbsents.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        return new Promise((resolve) => {
            const modalHTML = `
      <div class="modal__content-wrapper">
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
            let modal = document.getElementById('modal-displayAndSeatsSuppr');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modal-displayAndSeatsSuppr';
                modal.classList.add('modal');
                document.body.appendChild(modal);
            }
            modal.innerHTML = modalHTML;
            modal.style.display = 'flex';
            const closeModalBtn = document.getElementById('close-displayAndSeatsSuppr');
            const contentDiv = document.getElementById('content__displayAndSeatsSuppr');
            const annulerBtn = document.getElementById('btnAnnulerSeats');
            const validerBtn = document.getElementById('btnValiderSeats');
            // Places à supprimer
            const supprSeats = [];
            // Fermer la modale
            const closeModal = (resolveValue) => {
                modal.style.display = 'none';
                resolve(resolveValue.join(","));
            };
            // Fermetures
            closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener('click', () => closeModal([]));
            modal.addEventListener('click', (evt) => {
                if (evt.target === modal)
                    closeModal([]);
            });
            annulerBtn === null || annulerBtn === void 0 ? void 0 : annulerBtn.addEventListener('click', () => closeModal([]));
            // Bouton Valider => renvoie supprSeats
            validerBtn === null || validerBtn === void 0 ? void 0 : validerBtn.removeEventListener('click', () => { });
            validerBtn === null || validerBtn === void 0 ? void 0 : validerBtn.addEventListener('click', () => {
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
                        }
                        else {
                            seatBtn.style.backgroundColor = 'lightgray';
                        }
                        // Toggle
                        seatBtn.removeEventListener('click', () => { });
                        seatBtn.addEventListener('click', () => {
                            if (supprSeats.includes(seatId)) {
                                // Désélection ?
                                supprSeats.splice(supprSeats.indexOf(seatId), 1);
                                seatBtn.style.backgroundColor = 'lightgray';
                            }
                            else {
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
    });
}
