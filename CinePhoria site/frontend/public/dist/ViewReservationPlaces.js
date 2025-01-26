var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dataController, seanceCardView, basculerPanelChoix } from './ViewReservation.js';
import { ReservationState } from './DataController.js';
import { reservationApi, confirmUtilisateurApi } from './NetworkController.js';
/**
 * Fonction de niveau supérieur d'affichage du panel de choix des places
 * @returns
 */
export function updateContentPlace() {
    try {
        // 1) Mettre à jour le bloc .seances__cardseance seances__cardseance-selected pour afficher la séance choisie
        const containerSelectedSeance = document.getElementById('seances__cardseance-selected');
        if (!containerSelectedSeance) {
            console.log("Pas de carte selectionnée");
            return;
        }
        const selectedSeance = seanceCardView(dataController.seanceSelected(), dataController.selectedSeanceDate, "seances__cardseance-selected");
        containerSelectedSeance.replaceWith(selectedSeance);
        // 2) Gestion du bouton "Changer de séance" -> basculerPanelChoix()
        const btnChanger = document.querySelector('.panel__changer-button');
        if (btnChanger) {
            btnChanger.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                basculerPanelChoix();
            });
        }
        // 3) Gestion de la table des tarifs, de la saisie du nombre PMR, de la saisie de l'email et du bouton "Je reserve pour cette seance"
        setReservation();
    }
    catch (error) {
        console.error("Erreur lors de l'affichage du content de selection des places : ", error);
    }
}
function setReservation() {
    const qualiteFilm = dataController.seanceSelected().qualite;
    // Afficher le tableau de tarifs selon la qualite
    const containerTable = document.querySelector('.commande__tabtarif');
    if (!containerTable)
        return;
    containerTable.innerHTML = '';
    if (qualiteFilm)
        containerTable.appendChild(updateTableContent(qualiteFilm));
    // Gere les boutons + et - du champ PMR
    const containerPMR = document.querySelector('.commande__pmr');
    const contentPMR = updateInputPMR();
    if (!containerPMR)
        throw new Error("updateInputPMT");
    containerPMR.innerHTML = '';
    containerPMR.appendChild(contentPMR);
    // Gere la complétude de l'email avec un message d'erreur associ
    const emailInput = document.getElementById('commande__mail-input');
    const emailError = document.getElementById('commande__mail-error');
    if (!emailInput || !emailError)
        return;
    emailInput.addEventListener('blur', () => {
        if (!validateEmail(emailInput.value)) {
            emailError.textContent = "Email invalide (exemple: utilisateur@domaine.com)";
            emailError.style.color = "red";
        }
        else {
            emailError.textContent = "";
        }
    });
    // Gestion du bouton de reservation
    const btnReserve = document.querySelector('.panel__jereserve-button');
    // Le bouton estr initialement desactivé
    btnReserve.classList.add("inactif");
    btnReserve.disabled = true;
    btnReserve.textContent = "Je choisis ces places";
    if (!btnReserve)
        return;
    // Recuperer le nombre total de place
    const totalPlaces = document.getElementById('content-totalprice');
    if (!totalPlaces)
        return;
    /**
    * Valide l'ensemble du formulaire et active/désactive le bouton de reservation de places.
    */
    function validateForm() {
        // Verification que l'email est conforme
        const emailValid = validateEmail(emailInput.value);
        // Verification que l'on commande au moins une pkace
        const commandeMinValid = parseInt((totalPlaces === null || totalPlaces === void 0 ? void 0 : totalPlaces.textContent) || '0', 10) > 0;
        // Activation/désactivation du bouton de soumission
        if (!(emailValid && commandeMinValid)) {
            btnReserve.classList.add("inactif");
            btnReserve.disabled = true;
        }
        else {
            btnReserve.classList.remove("inactif");
            btnReserve.disabled = false;
        }
    }
    // Ajout d'écouteurs d'événements pour la validation en temps réel
    // email
    emailInput.addEventListener('input', validateForm);
    // Comme la modification du nombre total de place est faite par programme, l'écouteur est basé sur un changement du DOM
    const observer = new MutationObserver(() => { console.log("Changement...."); validateForm(); });
    // Configurer l'observation pour surveiller les modifications de contenu
    observer.observe(totalPlaces, {
        characterData: true, // Surveille les modifications du texte
        childList: true, // Surveille les modifications des enfants (ajout/suppression)
        subtree: true // Surveille aussi dans les sous-éléments
    });
    // Gestion de la reservation
    btnReserve.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
        evt.preventDefault();
        evt.stopPropagation();
        // a) Récupérer le nombre total de places et la répartition par tarif
        const { totalPlaces, tarifSeatsMap } = collectTarifSeatsAndTotal('.tabtarif__commande-table');
        console.log(`Nombre de places total = ${totalPlaces}, Répartition = ${tarifSeatsMap}`);
        // b) Récupérer la valeur PMR
        const pmrSeats = collectPMR('.commande__pmr');
        console.log(`Nombre de PMR = ${pmrSeats}`);
        // c) Récupérer l'email
        const email = collectEmail('.commande__mail-input');
        console.log(`email = ${email}`);
        // d) Appel à l’API /api/reservation
        try {
            const seanceId = dataController.seanceSelected().seanceId;
            const { statut, utilisateurId, reservationId } = yield reservationApi(email, seanceId, tarifSeatsMap, pmrSeats);
            dataController.selectedUtilisateurUUID = utilisateurId;
            dataController.selectedReservationUUID = reservationId;
            switch (statut) {
                case 'Compte Provisoire':
                    // L'email est inconnu -> compte créé en provisoire
                    console.log("Compte provisoire , " + utilisateurId + " , " + reservationId);
                    dataController.reservationState = ReservationState.ReserveCompteToConfirm;
                    confirmMail(email);
                    break;
                case 'Compte Confirme':
                    // L'email correspond à un compte valide
                    console.log("Compte Confirme , " + utilisateurId + " , " + reservationId);
                    dataController.reservationState = ReservationState.ReserveToConfirm;
                    //  loginWithEmail(dataController, email);
                    break;
                default:
                    // Cas imprévu
                    alert(`Une erreur s'est produite : statut inconnu -> ${statut} , ${utilisateurId} , ${reservationId}`);
                    break;
            }
        }
        catch (error) {
            console.error('Erreur lors de la création de la réservation', error);
            alert(`Une erreur s'est produite : ${(error === null || error === void 0 ? void 0 : error.message) || 'inconnue'}`);
        }
    }));
}
/**
 * Récupère le total de places et la répartition par tarif
 * @param tableSelector Sélecteur de la table (.tabtarif__commande-table)
 * @return { totalPlaces, tarifSeatsMap }
 *    - totalPlaces : somme des places
 *    - tarifSeatsMap : objet { [tarifId]: numberOfSeats }
 */
function collectTarifSeatsAndTotal(tableSelector) {
    const table = document.querySelector(tableSelector);
    let totalPlaces = 0;
    const tarifSeatsMap = {};
    if (!table)
        return { totalPlaces: 0, tarifSeatsMap };
    // Hypothèse : on stocke l'ID du tarifQualite dans un data-attribute 
    // => <tr data-tarifid="xxx"> ...
    const rows = table.querySelectorAll('tr.body__content-tr');
    rows.forEach((row) => {
        var _a;
        const tarifId = row.dataset['tarifid'] || '';
        console.log("TarifId = ", tarifId);
        const spanPlace = row.querySelector('.num__num-span#num__place');
        const quantity = spanPlace ? parseInt((_a = spanPlace.textContent) !== null && _a !== void 0 ? _a : '0', 10) : 0;
        if (quantity > 0 && tarifId) {
            tarifSeatsMap[tarifId] = quantity;
        }
        totalPlaces += quantity;
    });
    return { totalPlaces, tarifSeatsMap };
}
/**
 * Récupère le nombre PMR dans .commande__pmr
 */
function collectPMR(selector) {
    var _a;
    const pmrContainer = document.querySelector(selector);
    if (!pmrContainer)
        return 0;
    const spanPmr = pmrContainer.querySelector('.num__num-span#num__pmr');
    return spanPmr ? parseInt((_a = spanPmr.textContent) !== null && _a !== void 0 ? _a : '0', 10) : 0;
}
/**
 * Récupère l'email
 */
function collectEmail(selector) {
    const input = document.querySelector(selector);
    if (!input)
        return '';
    return input.value.trim();
}
/**
* Génère le contenu d'un tableau des tarifs en fonction d'une qualité spécifiée.
* Les tarifs sont pris dans le dataController
* @param qualite La valeur de qualite à filtrer (ex: "3D", "4DX", etc.)
* @returns Un élément <table>
*/
function updateTableContent(qualite) {
    // 1) Créer l'élément <table> et sa structure de base
    const table = document.createElement('table');
    table.classList.add('tabtarif__commande-table');
    // === THEAD ===
    const thead = document.createElement('thead');
    thead.classList.add('commande__entete-thead');
    thead.innerHTML = `
      <tr class="entete__content-tr">
        <th class="content-th content-id-th">#</th>
        <th class="content-th content-tarif-th">Tarif</th>
        <th class="content-th content-places-th">Places</th>
        <th class="content-th content-total-th">Total</th>
      </tr>
    `;
    table.appendChild(thead);
    // === TBODY ===
    const tbody = document.createElement('tbody');
    tbody.classList.add('commande__body-tbody');
    table.appendChild(tbody);
    // === TFOOT ===
    const tfoot = document.createElement('tfoot');
    tfoot.classList.add('commande__foot-tfoot');
    tfoot.innerHTML = `
      <tr class="foot__content-tr">
        <td colspan="3"></td>
        <td class="content-td content-totalprice-td" id = "content-totalprice">0 €</td>
      </tr>
    `;
    table.appendChild(tfoot);
    const totalPriceTd = tfoot.querySelector('.content-totalprice-td');
    // 2) Filtrer les tarifs correspondant à la qualité demandée
    const filteredTarifs = dataController.allTarifQualite.filter(t => t.qualite === qualite);
    // 3) Générer une ligne par tarif
    let lineIndex = 1;
    filteredTarifs.forEach((tarif) => {
        var _a;
        const tr = document.createElement('tr');
        tr.setAttribute('data-tarifid', tarif.id);
        tr.classList.add('body__content-tr');
        // Colonne #
        const tdId = document.createElement('td');
        tdId.classList.add('content-td', 'content-id-td');
        tdId.textContent = String(lineIndex);
        // Colonne Tarif : ex. "Plein tarif (10€)"
        const tdTarif = document.createElement('td');
        tdTarif.classList.add('content-td', 'content-tarif-td');
        const priceNum = tarif.price ? parseFloat(tarif.price) : 0;
        tdTarif.textContent = `${(_a = tarif.nameTarif) !== null && _a !== void 0 ? _a : ''} (${priceNum}€)`;
        // Colonne Places (boutons + -)
        const tdNum = document.createElement('td');
        tdNum.classList.add('content-td', 'content-num-td');
        const btnAdd = document.createElement('button');
        btnAdd.classList.add('num__add-button');
        btnAdd.textContent = '+';
        const spanPlaces = document.createElement('span');
        spanPlaces.classList.add('num__num-span');
        spanPlaces.id = 'num__place';
        spanPlaces.textContent = '0'; // Au départ, 0
        const btnRemove = document.createElement('button');
        btnRemove.classList.add('num__remove-button');
        btnRemove.textContent = '-';
        tdNum.appendChild(btnAdd);
        tdNum.appendChild(spanPlaces);
        tdNum.appendChild(btnRemove);
        // Colonne Total
        const tdPrice = document.createElement('td');
        tdPrice.classList.add('content-td', 'content-price-td');
        tdPrice.textContent = '0 €'; // Au départ, 0
        // Assembler la ligne
        tr.appendChild(tdId);
        tr.appendChild(tdTarif);
        tr.appendChild(tdNum);
        tr.appendChild(tdPrice);
        tbody.appendChild(tr);
        // 4) Gérer l'événement + et -
        function updateRowTotal() {
            var _a;
            // Récupérer la quantité
            const quantity = parseInt((_a = spanPlaces.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
            // Mettre à jour le total de la ligne
            const lineTotal = priceNum * quantity;
            tdPrice.textContent = `${lineTotal} €`;
            // Recalculer le total global
            updateTableTotal();
        }
        // Incrémente la quantité (max 4)
        btnAdd.addEventListener('click', (event) => {
            var _a;
            event.preventDefault();
            event.stopPropagation();
            let currentVal = parseInt((_a = spanPlaces.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
            if (currentVal < 4) {
                currentVal++;
                spanPlaces.textContent = String(currentVal);
                updateRowTotal();
            }
        });
        // Décrémente la quantité (min 0)
        btnRemove.addEventListener('click', (event) => {
            var _a;
            event.preventDefault();
            event.stopPropagation();
            let currentVal = parseInt((_a = spanPlaces.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
            if (currentVal > 0) {
                currentVal--;
                spanPlaces.textContent = String(currentVal);
                updateRowTotal();
            }
        });
        lineIndex++;
    });
    // 5) Fonction pour mettre à jour le total global (tfoot)
    function updateTableTotal() {
        let grandTotal = 0;
        // Parcourir chaque ligne du tbody pour sommer
        tbody.querySelectorAll('tr.body__content-tr').forEach((row) => {
            var _a, _b;
            const priceCell = row.querySelector('.content-price-td');
            if (priceCell) {
                const text = (_b = (_a = priceCell.textContent) === null || _a === void 0 ? void 0 : _a.replace(' €', '')) !== null && _b !== void 0 ? _b : '0';
                const value = parseFloat(text) || 0;
                grandTotal += value;
            }
        });
        totalPriceTd.textContent = `${grandTotal} €`;
    }
    return table;
}
;
/**
* Génere les controls associés au nombre de place PMR
*/
function updateInputPMR() {
    // const btnAddPMR = document.querySelector('.num__add-pmr') as HTMLButtonElement;
    // const btnRemovePMR = document.querySelector('.num__remove-pmr') as HTMLButtonElement;
    // const spanPMR = document.getElementById('num__pmr');
    // 1) Créer l'élément PMR et sa structure de base
    const pmrContent = document.createElement('div');
    pmrContent.classList.add('pmr__content');
    //     pmrContent.innerHTML = `
    //     <p class="content__libelle-p">Personne à mobilité réduite :</p>
    //     <div class="content__num-pmr">
    //         <button class="num__add-button num__add-pmr">+</button>
    //         <span class="num__num-span num__numpmr-span" id="num__pmr">0</span>
    //         <button class="num__remove-button num__remove-pmr">-</button>
    //     </div>
    //   `;
    const contentLibelle = document.createElement('p');
    contentLibelle.classList.add('content__libelle-p');
    contentLibelle.textContent = 'Personne à mobilité réduite :';
    const contentNumPMR = document.createElement('div');
    contentNumPMR.classList.add('content__num-pmr');
    const btnAddPMR = document.createElement('button');
    btnAddPMR.classList.add('num__add-button', 'num__add-pmr');
    btnAddPMR.textContent = '+';
    const spanPMR = document.createElement('span');
    spanPMR.classList.add('num__num-span', 'num__numpmr-span');
    spanPMR.id = 'num__pmr';
    spanPMR.textContent = '0';
    const btnRemovePMR = document.createElement('button');
    btnRemovePMR.classList.add('num__remove-button', 'num__remove-pmr');
    btnRemovePMR.textContent = '-';
    if (!btnAddPMR || !btnRemovePMR || !spanPMR)
        throw new Error('Erreur updateInputPMR');
    ;
    btnAddPMR.removeEventListener('click', (event) => { });
    btnRemovePMR.removeEventListener('click', (event) => { });
    spanPMR.textContent = '0';
    // Incrémente la quantité (max 4)
    btnAddPMR.addEventListener('click', (event) => {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        let currentVal = parseInt((_a = spanPMR.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
        if (currentVal < 4) {
            currentVal++;
            spanPMR.textContent = String(currentVal);
        }
    });
    // Décrémente la quantité (min 0)
    btnRemovePMR.addEventListener('click', (event) => {
        var _a;
        event.preventDefault();
        event.stopPropagation();
        let currentVal = parseInt((_a = spanPMR.textContent) !== null && _a !== void 0 ? _a : '0', 10) || 0;
        if (currentVal > 0) {
            currentVal--;
            spanPMR.textContent = String(currentVal);
        }
    });
    contentNumPMR.appendChild(btnAddPMR);
    contentNumPMR.appendChild(spanPMR);
    contentNumPMR.appendChild(btnRemovePMR);
    pmrContent.appendChild(contentLibelle);
    pmrContent.appendChild(contentNumPMR);
    console.log(JSON.stringify(pmrContent));
    return pmrContent;
}
;
/**
     * Vérifie la validité d'un email.
     * @param email - L'email à valider.
     * @returns boolean - True si l'email est valide, sinon False.
     */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
;
/**
 * Quand on reçoit "Compte Provisoire" => on exécute confirmMail
 * - On met dataController.reservationState = ReservationState.PendingMailVerification
 * - On affiche une modale demandant la saisie du mail et deux champs mot de passe
 */
function confirmMail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        // Afficher la modale
        // Execution de la fonction interne gestionFormulaire (valeur de l'email saisie)
        //  Reprise de la valeur de l'email du formulaire précédent
        //  Verification des champs email/password/displayname, si OK activation du bouton
        //  Bouton submit qui enclenche la confirmation de la création du compte confirmCreationCompte
        //    Appel de l'API Rest
        //    Si Ok lancement de la fonction de login
        console.log('===> confirmMail action, email =', email);
        const modalConfirm = document.getElementById('modal-confirmMail');
        const closeModalBtn = document.getElementById("close-confirmMail");
        const confirmModalBtn = document.getElementById("confirmMail-submit");
        if (modalConfirm && closeModalBtn && confirmModalBtn) {
            modalConfirm.style.display = 'flex';
            const closeModal = () => {
                modalConfirm.style.display = 'none';
            };
            closeModalBtn.addEventListener('click', closeModal);
            modalConfirm.addEventListener('click', (event) => {
                if (event.target === modalConfirm)
                    closeModal();
            });
            // Appel de la fonction de gestion du formulaire et récupération des données -> on est sur d'avoir ces données car la vérification
            // des valeurs du formulaire conditionne le submit qui exécute cette fonction
            yield gestionFormulaireModal(email);
        }
        else {
            console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal modal-confirmMail sont introuvables.');
        }
        /**
         * Met en place toute la gestion de la modal
         *
         * @param emailInitial sert a in itialiser l'input du mail
         *
         */
        function gestionFormulaireModal(emailInitial) {
            return __awaiter(this, void 0, void 0, function* () {
                // Sélection des éléments de la modal avec un typage strict
                const displayNameInput = document.getElementById('confirmMail-displayName');
                const emailInput = document.getElementById('confirmMail-email');
                const password1Input = document.getElementById('confirmMail-password1');
                const password2Input = document.getElementById('confirmMail-password2');
                const submitButton = document.getElementById('confirmMail-submit');
                const emailError = document.getElementById('email-error');
                const passwordError = document.getElementById('password-error');
                /**
                 * Vérifie si les mots de passe sont identiques.
                 * @returns boolean - True si les mots de passe correspondent, sinon False.
                 */
                function passwordsMatch() {
                    return password1Input.value === password2Input.value && password1Input.value.length > 0;
                }
                /**
                 * Vérifie si tous les champs sont remplis.
                 * @returns boolean - True si tous les champs sont remplis, sinon False.
                 */
                function areAllFieldsFilled() {
                    return (displayNameInput.value.trim() !== "" &&
                        emailInput.value.trim() !== "" &&
                        password1Input.value.trim() !== "" &&
                        password2Input.value.trim() !== "");
                }
                /**
                 * Valide l'ensemble du formulaire et active/désactive le bouton de soumission.
                 */
                function validateForm() {
                    const emailValid = validateEmail(emailInput.value);
                    const passwordsAreValid = passwordsMatch();
                    const fieldsFilled = areAllFieldsFilled();
                    // Activation/désactivation du bouton de soumission
                    if (!(emailValid && passwordsAreValid && fieldsFilled)) {
                        submitButton.classList.add("inactif");
                        submitButton.disabled = true;
                    }
                    else {
                        submitButton.classList.remove("inactif");
                        submitButton.disabled = false;
                    }
                }
                // Ajout de la valeur d'email saisi dans le formulaire de réservation
                emailInput.value = emailInitial; // Définir une valeur par défaut
                // Le bouton de validation est inactif au chargement
                submitButton.classList.add("inactif");
                // Gestion du message d'erreur pour l'email lors du blur (perte de focus)
                emailInput.addEventListener('blur', () => {
                    if (!validateEmail(emailInput.value)) {
                        emailError.textContent = "Email invalide (exemple: utilisateur@domaine.com)";
                        emailError.style.color = "red";
                    }
                    else {
                        emailError.textContent = "";
                    }
                });
                // Gestion du message d'erreur pour les mots de passe lors du blur
                password2Input.addEventListener('blur', () => {
                    if (!passwordsMatch()) {
                        passwordError.textContent = "Les mots de passe ne correspondent pas.";
                        passwordError.style.color = "red";
                    }
                    else {
                        passwordError.textContent = "";
                    }
                });
                // Ajout d'écouteurs d'événements pour la validation en temps réel
                displayNameInput.addEventListener('input', validateForm);
                emailInput.addEventListener('input', validateForm);
                password1Input.addEventListener('input', validateForm);
                password2Input.addEventListener('input', validateForm);
                // Gestion de la soumission de la modale
                submitButton.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                    evt.preventDefault();
                    evt.stopPropagation();
                    if (!dataController.selectedUtilisateurUUID)
                        return;
                    confirmCreationCompte(dataController.selectedUtilisateurUUID, password1Input.value.trim(), displayNameInput.value.trim());
                }));
            });
        }
        function confirmCreationCompte(id, password, displayName) {
            return __awaiter(this, void 0, void 0, function* () {
                const resultat = yield confirmUtilisateurApi(id, password, displayName);
                alert("Soumission de confirmationUtilisateur = " + id + " password = " + password + " displayName = " + displayName + " Resultat = " + JSON.stringify(resultat));
            });
        }
    });
}
;
