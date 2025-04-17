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
import { syncTableColumnWidths, formatterJJMM, formatDateLocalYYYYMMDD } from './Helpers.js';
let filtreJour = '';
/**
 * Entrée principale du module
 */
export function onLoadManageAvis() {
    return __awaiter(this, arguments, void 0, function* (vfiltreJour = "", filtreCinema = "all") {
        console.log("=====> chargement onLoadManageAvis");
        // Charger menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // Initialisation filtres
        yield initFiltreCinema();
        yield initFiltreJour();
        // On reporte les valeurs de filtre précédentes
        filtreJour = vfiltreJour;
        DataControllerIntranet.filterNameCinema = filtreCinema;
        // Rafraîchir le tableau des avis
        yield rafraichirTableauAvis();
    });
}
/* ---------------------------------------------------
   Rafraîchit la liste de touts les Avis
--------------------------------------------------- */
function rafraichirTableauAvis() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('avis-table-container');
        if (!container) {
            console.error("Pas de container");
            return;
        }
        container.innerHTML = '';
        // Charger les avis
        let avis = yield DataControllerIntranet.getReservationForUtilisateurFilter();
        avis = avis.filter((a) => (a.statereservation === 'doneEvaluated' && a.isEvaluationMustBeReview));
        if (filtreJour) {
            avis = avis.filter((s) => s.dateJour ? formatDateLocalYYYYMMDD(new Date(s.dateJour)) === filtreJour : false);
        }
        // Construction de la page
        const tableAvis = yield updateTableAvis(avis);
        container.appendChild(tableAvis);
        // Mise à jour dynamique des largeurs de colonnes
        syncTableColumnWidths(tableAvis);
        // Ajout des boutons d'actions
        const divButtons = actionsButtons();
        container.appendChild(divButtons);
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
                titleLeft.innerText = 'Modérer tous les avis';
            }
            else {
                titleLeft.innerText = `Modérer les avis pour le cinéma de ${DataControllerIntranet.filterNameCinema}`;
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
                        titleLeft.innerText = 'Modérer tous les avis';
                    }
                    else {
                        titleLeft.innerText = `Modérer les avis pour le cinéma de ${val}`;
                    }
                }
                yield rafraichirTableauAvis();
            }));
        });
    });
}
function initFiltreJour() {
    return __awaiter(this, void 0, void 0, function* () {
        // On met en place un input que l'on ajuste aux jours
        // dans la fourchette couverte par dataController.genre (soit all filtré par le cinema et le filtre genres)
        // 1) On insère un <input type="date"> en plus, ou on le rajoute dans la page
        let containerFilters = document.querySelector('.title__filters-films');
        if (!containerFilters)
            return;
        let inputDate = document.querySelector('.filter-jour-input');
        if (!inputDate) {
            inputDate = document.createElement('input');
            inputDate.classList.add('filter-jour-input');
            inputDate.type = 'date';
        }
        inputDate.value = filtreJour;
        containerFilters.prepend(inputDate);
        // 4) On écoute les changements
        inputDate.removeEventListener('change', () => __awaiter(this, void 0, void 0, function* () { }));
        inputDate.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
            filtreJour = inputDate.value; // ex. "2025-03-15"
            yield rafraichirTableauAvis();
        }));
        // 5) Construire initialement la liste des jours activables
        yield construireListeJours();
    });
}
function construireListeJours() {
    return __awaiter(this, void 0, void 0, function* () {
        const inputDate = document.querySelector('.filter-jour-input');
        if (!inputDate)
            return;
        // On calcule les dates min et max et on applique sur le champ date
        const allDates = (yield DataControllerIntranet.getReservationForUtilisateurFilter()).map((s) => s.dateJour).filter(Boolean).sort();
        if (allDates.length > 0) {
            const dateMinYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[0]));
            const dateMaxYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[allDates.length - 1]));
            inputDate.min = dateMinYYYYMMDD;
            inputDate.max = dateMaxYYYYMMDD;
        }
        else {
            inputDate.min = '';
            inputDate.max = '';
        }
    });
}
/* -------------------------------------------
   Construction de la table des avis
------------------------------------------- */
export function updateTableAvis(reservationsForUtilisateur) {
    return __awaiter(this, void 0, void 0, function* () {
        // Container global
        const container = document.createElement('div');
        container.classList.add('tab__avis-liste');
        // Table
        const table = document.createElement('table');
        table.classList.add('tab__avis-liste-table');
        table.id = "tab__avis-liste-table";
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
            var _a;
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
            tdNote.textContent = ((_a = reservationUtilisateur.note) === null || _a === void 0 ? void 0 : _a.toString(10)) || '';
            tr.appendChild(tdNote);
            // 4) Commentaire
            const tdCommentaire = document.createElement('td');
            tdCommentaire.textContent = reservationUtilisateur.evaluation || '';
            tr.appendChild(tdCommentaire);
            // 5) Avis
            const tdAvisRevu = document.createElement('td');
            const inputAvisRevu = document.createElement('input');
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
            const inputASupprimer = document.createElement('input');
            inputASupprimer.type = 'checkbox';
            inputASupprimer.checked = false;
            tdASupprimer.appendChild(inputASupprimer);
            tr.appendChild(tdASupprimer);
            tr.dataset.reservationId = reservationUtilisateur.reservationId;
            tbody.appendChild(tr);
        });
        // Logique de désactivation mutuelle à l'interaction (pas à la construction)
        tbody.querySelectorAll('tr').forEach(tr => {
            const inputASupprimer = tr.querySelector('td:nth-child(7) input[type="checkbox"]');
            const inputAvisRevu = tr.querySelector('td:nth-child(6) input[type="checkbox"]');
            inputASupprimer.addEventListener('change', () => {
                if (inputASupprimer.checked) {
                    inputAvisRevu.disabled = true;
                }
                else {
                    inputAvisRevu.disabled = false;
                }
            });
            inputAvisRevu.addEventListener('change', () => {
                if (inputAvisRevu.checked) {
                    inputASupprimer.disabled = true;
                }
                else {
                    inputASupprimer.disabled = false;
                }
            });
        });
        container.appendChild(table);
        return container;
    });
}
/* -------------------------------------------
   Fonction pour construire les boutons d'action
------------------------------------------- */
function actionsButtons() {
    const divButton = document.createElement('div');
    divButton.classList.add('table-content-btns');
    const editBtn = document.createElement('button');
    editBtn.classList.add('tab__salles-liste-button');
    editBtn.textContent = "Appliquer";
    editBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        yield onClickAppliquerUpdate();
    }));
    divButton.appendChild(editBtn);
    const annuleBtn = document.createElement('button');
    annuleBtn.classList.add('tab__salles-liste-button');
    annuleBtn.textContent = "Remise à zéro";
    annuleBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        yield onClickAnnuleUpdate();
    }));
    divButton.appendChild(annuleBtn);
    return divButton;
}
/* -------------------------------------------
   Fonction d'application des modifications
------------------------------------------- */
function onClickAppliquerUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        const table = document.getElementById('tab__avis-liste-table');
        if (!table)
            return;
        const lignes = table.querySelectorAll('tbody tr');
        const reservationsToUpdate = [];
        let countUpdate = 0;
        let countDelete = 0;
        lignes.forEach((tr) => {
            var _a, _b, _c, _d;
            const reservationId = tr.dataset.reservationId;
            if (!reservationId)
                return;
            const inputAvisRevu = tr.querySelector('td:nth-child(6) input[type="checkbox"]');
            const tdAvisRevu = inputAvisRevu === null || inputAvisRevu === void 0 ? void 0 : inputAvisRevu.parentElement;
            const isCheckedAvis = (_a = inputAvisRevu === null || inputAvisRevu === void 0 ? void 0 : inputAvisRevu.checked) !== null && _a !== void 0 ? _a : false;
            const wasCheckedAvis = (tdAvisRevu === null || tdAvisRevu === void 0 ? void 0 : tdAvisRevu.dataset.ischecked) === 'true';
            const inputASupprimer = tr.querySelector('td:nth-child(7) input[type="checkbox"]');
            const isToDelete = (_b = inputASupprimer === null || inputASupprimer === void 0 ? void 0 : inputASupprimer.checked) !== null && _b !== void 0 ? _b : false;
            const tdNote = tr.querySelector('td:nth-child(4)');
            const tdEvaluation = tr.querySelector('td:nth-child(5)');
            if (isToDelete) {
                reservationsToUpdate.push({
                    id: reservationId,
                    evaluation: "Evaluation supprimée car non conforme aux usages",
                    isEvaluationMustBeReview: false,
                    note: undefined
                });
                countDelete++;
            }
            else if (isCheckedAvis && !wasCheckedAvis) {
                reservationsToUpdate.push({
                    id: reservationId,
                    evaluation: ((_c = tdEvaluation === null || tdEvaluation === void 0 ? void 0 : tdEvaluation.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || "",
                    isEvaluationMustBeReview: false,
                    note: ((_d = tdNote === null || tdNote === void 0 ? void 0 : tdNote.textContent) === null || _d === void 0 ? void 0 : _d.trim()) ? parseFloat(tdNote.textContent.trim()) : undefined
                });
                countUpdate++;
            }
        });
        for (const reservationAvis of reservationsToUpdate) {
            yield DataControllerIntranet.updateReservationAvis(reservationAvis);
        }
        alert(`${countUpdate} validation(s) réalisée(s) et ${countDelete} avis supprimé(s)`);
        onLoadManageAvis(filtreJour, DataControllerIntranet.filterNameCinema);
    });
}
function onClickAnnuleUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        const table = document.getElementById('tab__avis-liste-table');
        if (!table)
            return;
        const lignes = table.querySelectorAll('tbody tr');
        lignes.forEach((tr) => {
            const inputAvisRevu = tr.querySelector('td:nth-child(6) input[type="checkbox"]');
            const inputASupprimer = tr.querySelector('td:nth-child(7) input[type="checkbox"]');
            const tdAvisRevu = inputAvisRevu === null || inputAvisRevu === void 0 ? void 0 : inputAvisRevu.parentElement;
            if (inputASupprimer)
                inputASupprimer.checked = false;
            if (inputAvisRevu && tdAvisRevu) {
                inputAvisRevu.checked = tdAvisRevu.dataset.ischecked === 'true';
            }
            // Réactiver les deux checkboxes
            if (inputASupprimer)
                inputASupprimer.disabled = false;
            if (inputAvisRevu)
                inputAvisRevu.disabled = false;
        });
    });
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
