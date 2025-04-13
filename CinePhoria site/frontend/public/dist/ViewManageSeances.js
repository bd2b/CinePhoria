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
        // Charger les films
        const seances = yield DataControllerIntranet.getSeancesDisplayFilter();
        // Construction de la page
        const tableSeances = yield updateTableSeances(seances);
        container.appendChild(tableSeances);
        // Mise à jour dynamique des largeurs de colonnes
        syncTableColumnWidths(tableSeances);
        // Initialisation le code de validation du formulaire d'ajout en ligne 1, les écouteurs et le bouton de définition du plan
        // Le formulaire est identique à celui de modification d'une ligne existante dans la modal
        // initFormulaireSalles('create');
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
            var _a, _b;
            const tr = document.createElement('tr');
            // 1) Affiche
            const tdImg = document.createElement('td');
            const img = document.createElement('img');
            img.src = imageFilm((_a = seanceDisplay.imageFilm128) !== null && _a !== void 0 ? _a : '');
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
            tdCapacite.textContent = ((_b = seanceDisplay.capacity) === null || _b === void 0 ? void 0 : _b.toString(10)) || '';
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
            editBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                // Lancement de la modale 
                // await onClickEditSalle(salle);
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
            tdActions.appendChild(divButton);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
        container.appendChild(table);
        return container;
    });
}
/* -------------------------------------------
   Initialisation
------------------------------------------- */ 
