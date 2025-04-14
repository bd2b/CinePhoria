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
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { syncTableColumnWidths, imageFilm, formatDateJJMM } from './Helpers.js';
// Données utilisées pour les select de saisie
let listFilms;
let listSalles;
/**
 * Entrée principale du module
 */
export function onLoadManageSeances() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadManageSeances");
        // Charger menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // Initialisation filtre Cinema
        yield initFiltreCinema();
        // Rafraîchir le tableau des seances
        yield rafraichirTableauSeances();
    });
}
/* ---------------------------------------------------
   Rafraîchit la liste de toutes les seances
--------------------------------------------------- */
function rafraichirTableauSeances() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('seances-table-container');
        if (!container) {
            console.error("Pas de container");
            return;
        }
        container.innerHTML = '';
        // Charger les séances
        const seances = yield DataControllerIntranet.getSeancesDisplayFilter();
        // Construction de la page
        const tableSeances = yield updateTableSeances(seances);
        container.appendChild(tableSeances);
        // Mise à jour dynamique des largeurs de colonnes
        syncTableColumnWidths(tableSeances);
        // Mise à jour de la list des films et de salle
        listFilms = yield DataControllerIntranet.getListFilmsAll();
        listSalles = yield DataControllerIntranet.getSallesByFilter();
    });
}
/* -------------------------------------------
   Filtres
------------------------------------------- */
function initFiltreCinema() {
    return __awaiter(this, void 0, void 0, function* () {
        // Fonction de mise à jour l'affichage du bouton du dropdown
        function updateDropdownDisplay(textButton) {
            const dropdownButtons = document.querySelectorAll('.titre__filter-dropdown-complexe');
            dropdownButtons.forEach((button) => {
                button.style.display = "block";
                button.innerHTML = `${textButton} <span class="chevron">▼</span>`;
            });
        }
        const dropdownCinema = document.querySelector('.titre__filter-dropdown-cinema');
        if (!dropdownCinema)
            return;
        // Trouver la div de dropdown
        const dropdownContent = dropdownCinema.querySelector('.title__filter-button-drowdown-content');
        if (!dropdownContent)
            return;
        console.log("Init dropdown Cinema");
        // Mettre à jour le titre droit
        const titleLeft = document.getElementById('titleLeft');
        if (titleLeft) {
            if (DataControllerIntranet.filterNameCinema === 'all') {
                titleLeft.innerText = 'Les séances de CinePhoria';
            }
            else {
                titleLeft.innerText = `Les séances de CinePhoria à ${DataControllerIntranet.filterNameCinema}`;
            }
        }
        // Mettre à jour le bouton
        if (DataControllerIntranet.filterNameCinema === 'all') {
            updateDropdownDisplay('Tous les complexes');
        }
        else {
            updateDropdownDisplay(DataControllerIntranet.filterNameCinema);
        }
        // Dans le HTML, on a déjà <a href="#">Tous les complexes</a>, <a href="#">Paris</a> ...
        // On écoute le clic sur chaque <a>
        const links = dropdownContent.querySelectorAll('a');
        links.forEach((link) => {
            link.removeEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () { }));
            link.addEventListener('click', (ev) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                ev.preventDefault();
                const val = ((_a = link.dataset.cinema) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                if (val === 'Tous les complexes') {
                    DataControllerIntranet.filterNameCinema = 'all';
                }
                else {
                    DataControllerIntranet.filterNameCinema = val; // ex: "Paris"
                }
                listSalles = yield DataControllerIntranet.getSallesByFilter();
                console.log("Choix du filtre Cinema = ", DataControllerIntranet.filterNameCinema);
                // Mettre à jour l'affichage du bouton
                updateDropdownDisplay(val);
                // Mettre à jour le titre droit
                const titleLeft = document.getElementById('titleLeft');
                if (titleLeft) {
                    if (DataControllerIntranet.filterNameCinema === 'all') {
                        titleLeft.innerText = 'Les séances de CinePhoria';
                    }
                    else {
                        titleLeft.innerText = `Les séances de CinePhoria à ${val}`;
                    }
                }
                yield rafraichirTableauSeances();
            }));
        });
    });
}
/* -------------------------------------------
   Construction de la table des seances
------------------------------------------- */
export function updateTableSeances(seancesDisplay) {
    return __awaiter(this, void 0, void 0, function* () {
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
        // Pour chaque salle, on affiche une ligne de restitution des champ et un bouton éditer.
        seancesDisplay.forEach((seanceDisplay) => {
            var _a, _b;
            const tr = document.createElement('tr');
            // 1) Date
            const tdDateJour = document.createElement('td');
            tdDateJour.textContent = formatDateJJMM(new Date(seanceDisplay.dateJour || '')) || '';
            tr.appendChild(tdDateJour);
            // 2) Salle
            const tdSalle = document.createElement('td');
            if (!DataControllerIntranet.filterNameCinema || DataControllerIntranet.filterNameCinema === 'all') {
                tdSalle.textContent = seanceDisplay.nameCinema + "-" + seanceDisplay.nameSalle || '';
            }
            else {
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
            img.src = imageFilm((_a = seanceDisplay.imageFilm128) !== null && _a !== void 0 ? _a : '');
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
            tdCapacite.textContent = ((_b = seanceDisplay.capacity) === null || _b === void 0 ? void 0 : _b.toString(10)) || '';
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
            tbody.appendChild(tr);
        });
        container.appendChild(table);
        return container;
    });
}
/* -------------------------------------------
   Fonction pour construire les boutons d'action
------------------------------------------- */
function actionsButtons(mode, tr, seanceDisplay) {
    const divButton = document.createElement('div');
    if (mode === 'edit') {
        divButton.classList.add('table-content-btns');
        const editBtn = document.createElement('button');
        editBtn.classList.add('tab__salles-liste-button');
        editBtn.textContent = "Editer";
        editBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            // Figer les tailles des colonnes de la ligne éditée
            const cells = tr.querySelectorAll('td');
            const tdWidths = [];
            cells.forEach((cell) => {
                tdWidths.push(cell.offsetWidth - 30);
            });
            yield activerEditionLigne(tr, seanceDisplay, tdWidths);
        }));
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
        // Bouton "Enregistrer"
        const saveBtn = document.createElement('button');
        saveBtn.classList.add('tab__salles-liste-button');
        saveBtn.textContent = 'Enregistrer';
        saveBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield sauvegarderEditionLigne(tr, seanceDisplay);
        }));
        divButton.appendChild(saveBtn);
        divButton.appendChild(cancelBtn);
    }
    return divButton;
}
/* -------------------------------------------
   Fonction pour activer l'édition d'une ligne
------------------------------------------- */
// Activer le mode édition sur une ligne spécifique
function activerEditionLigne(tr, seanceDisplay, tdWidths) {
    return __awaiter(this, void 0, void 0, function* () {
        // Exemple statique pour listFilms
        // const listFilms = [
        //     { affiche: "1-128.jpg", titre: "Film A", duration: "1h30" },
        //     { affiche: "2-128.jpg", titre: "Film B", duration: "2h10" },
        //     { affiche: "3-128.jpg", titre: "Film C", duration: "1h45" }
        // ];
        // Exemple statique pour listSalles
        // const listSalles = [
        //     { nomSalle: "Salle Alpha", capacite: 100 },
        //     { nomSalle: "Salle Beta", capacite: 150 },
        //     { nomSalle: "Salle Gamma", capacite: 200 }
        // ];
        // Calculer les tableau de listes
        const cells = tr.querySelectorAll('td');
        // 1) Date
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
            if (salle.id === seanceDisplay.salleId)
                option.selected = true;
            selectSalle.appendChild(option);
        });
        selectSalle.style.width = `${tdWidths[1]}px`;
        selectSalle.style.boxSizing = 'border-box';
        selectSalle.style.textAlign = 'center';
        selectSalle.addEventListener('change', () => {
            const selectedSalle = listSalles.find(s => s.nomSalle === selectSalle.value);
            if (selectedSalle) {
                cells[7].textContent = selectedSalle.capacite.toString();
            }
        });
        tdSalle.textContent = '';
        tdSalle.appendChild(selectSalle);
        // Helper pour générer les options toutes les 5 minutes
        function generateTimeOptions(startHour, endHour) {
            const options = [];
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
            if (time === seanceDisplay.hourBeginHHSMM)
                option.selected = true;
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
            if (time === seanceDisplay.hourEndHHSMM)
                option.selected = true;
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
            if (film.id === seanceDisplay.filmId)
                option.selected = true;
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
                cells[4].querySelector('img').src = imageFilm(selectedFilm.affiche);
                cells[6].textContent = selectedFilm.duration;
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
            if (bo === seanceDisplay.bo)
                option.selected = true;
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
            if (qualite === seanceDisplay.qualite)
                option.selected = true;
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
        // Ajustement après rendu DOM
        // requestAnimationFrame(() => {
        //     const cells = tr.querySelectorAll('td');
        //     cells.forEach((cell) => {
        //         const width = cell.offsetWidth;
        //         const inner = cell.firstElementChild as HTMLElement | null;
        //         if (inner) {
        //             inner.style.width = `${width}px`;
        //             inner.style.boxSizing = 'border-box';
        //         }
        //     });
        // });
    });
}
// Annuler le mode édition sur une ligne spécifique et restaurer les valeurs initiales
function annulerEditionLigne(tr, seanceDisplay) {
    var _a, _b;
    const cells = tr.querySelectorAll('td');
    cells[0].textContent = formatDateJJMM(new Date(seanceDisplay.dateJour || '')) || '';
    if (!DataControllerIntranet.filterNameCinema || DataControllerIntranet.filterNameCinema === 'all') {
        cells[1].textContent = seanceDisplay.nameCinema + "-" + seanceDisplay.nameSalle || '';
    }
    else {
        cells[1].textContent = seanceDisplay.nameSalle || '';
    }
    cells[2].textContent = seanceDisplay.hourBeginHHSMM || '';
    cells[3].textContent = seanceDisplay.hourEndHHSMM || '';
    cells[4].querySelector('img').src = imageFilm((_a = seanceDisplay.imageFilm128) !== null && _a !== void 0 ? _a : '');
    cells[5].textContent = seanceDisplay.titleFilm || '';
    cells[6].textContent = seanceDisplay.duration || '';
    cells[7].textContent = ((_b = seanceDisplay.capacity) === null || _b === void 0 ? void 0 : _b.toString(10)) || '';
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
function sauvegarderEditionLigne(tr, seance) {
    return __awaiter(this, void 0, void 0, function* () {
        // Collecter les nouvelles valeurs depuis les inputs
        // Appel API pour enregistrer les modifications
        // Mettre à jour l'affichage
    });
}
/* ------------------------------------------- */ 
