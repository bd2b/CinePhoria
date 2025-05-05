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
import { ComptePersonne } from './shared-models/Utilisateur.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { listCinemasConst, validateEmail, isPasswordValid } from './Helpers.js';
// State flags
let isEditingMode = false;
let isCreatingMode = false;
// Employe selectionne
let employeSelectedList;
// Tableau des employés
let employes = [];
// Valeur de comparaison des mots de passe
let firstPassword = "";
let confirmPassword = "";
// valeur la plus elevée de matricule
let maxMatricule = 0;
/**
 * Entrée principale du module
 */
export function onLoadManageEmployes() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadManageEmployes");
        // Charger menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // Mise à jour de la version
        yield DataControllerIntranet.majVersion();
        // Rafraîchir la liste de tous les employes
        yield rafraichirListeEmployes();
        // Init les 3 boutons (Ajouter, Modifier, Annuler)
        initButtons();
        setFormEditable(false);
    });
}
/* ---------------------------------------------------
   Rafraîchit la liste de tous les employes,
   et affiche le premier ou le employe sélectionné
--------------------------------------------------- */
function rafraichirListeEmployes() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.querySelector('.employes__listEmployes');
        if (!container)
            return;
        container.innerHTML = '';
        // Charger les employes
        employes = yield DataControllerIntranet.getListEmployesAll();
        // Calculer le max de matricule de ce tableau
        maxMatricule = employes.reduce((max, employe) => { var _a; return Math.max(max, (_a = employe.matricule) !== null && _a !== void 0 ? _a : 0); }, 0);
        // Construire les cards
        employes.forEach((employe) => {
            const card = buildEmployeCard(employe);
            container.appendChild(card);
        });
        // Sélection
        if (employes.length > 0) {
            employeSelectedList = employes[0];
            fillFormWithEmploye(employeSelectedList);
        }
        else {
            // plus de employe => effacer detail
            effacerDetailEmploye();
        }
        if (employeSelectedList) {
            const selectedCard = [...container.querySelectorAll('.listEmployes__simpleCard')]
                .find((card) => { var _a, _b; return (_a = card.textContent) === null || _a === void 0 ? void 0 : _a.includes(((_b = employeSelectedList.matricule) === null || _b === void 0 ? void 0 : _b.toString(10)) || ""); });
            if (selectedCard) {
                selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}
/* ---------------------------------------------------
   Construction d'une card
--------------------------------------------------- */
function buildEmployeCard(employe) {
    var _a;
    const divCard = document.createElement('div');
    divCard.classList.add('listEmployes__simpleCard');
    // nomEmploye
    const pnomEmploye = document.createElement('p');
    pnomEmploye.classList.add('simpleCard__detail-titre-p');
    pnomEmploye.textContent = ((_a = employe.lastnameEmploye) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + ' ' + employe.firstnameEmploye + ' (' + employe.matricule + ')';
    divCard.appendChild(pnomEmploye);
    // Mail et administrateur
    const pmail = document.createElement('p');
    pmail.classList.add('simpleCard__detail-titre-p');
    pmail.textContent = employe.email + (employe.isAdministrateur === 1 ? " - administrateur" : "");
    divCard.appendChild(pmail);
    // Nombre de connexion ou bouton supprimer
    if (employe.numConnexions > 0) {
        const pNumConnexion = document.createElement('p');
        pNumConnexion.classList.add('simpleCard__detail-titre-p');
        pNumConnexion.classList.add('numConnexions');
        pNumConnexion.textContent = employe.numConnexions + " connexions";
        divCard.appendChild(pNumConnexion);
    }
    else {
        const btnSuppression = document.createElement('button');
        btnSuppression.classList.add('simpleCard__detail-titre-p');
        btnSuppression.classList.add('supprimer-button');
        btnSuppression.textContent = "Supprimer";
        divCard.appendChild(btnSuppression);
        btnSuppression.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
        btnSuppression.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield DataControllerIntranet.deleteEmploye(employe.matricule);
                yield rafraichirListeEmployes();
            }
            catch (error) {
                alert("Erreur dans la suppression");
            }
        }));
    }
    // Clic -> détail
    divCard.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        console.log("employe = ", employe.matricule);
        effacerDetailEmploye();
        employeSelectedList = employe;
        fillFormWithEmploye(employe);
    }));
    return divCard;
}
function effacerDetailEmploye() {
    const containerDetail = document.querySelector('.employes__detailEmploye');
    if (!containerDetail)
        return;
    isEditingMode = false;
    isCreatingMode = false;
    showButtonsForEdit(false);
    // Revenir en lecture seule
    setFormEditable(false);
}
/* ---------------------------------------------------
   Gestion des boutons (Ajouter, Modifier, Annuler)
--------------------------------------------------- */
function initButtons() {
    const btnAdd = document.getElementById("title__right-button-Ajouter");
    const btnEdit = document.getElementById("title__right-button-Modifier");
    const btnCancel = document.getElementById("title__right-button-Annuler");
    if (!btnAdd || !btnEdit || !btnCancel) {
        console.error("Missing one of the action buttons in .right__actions");
        return;
    }
    // Initially
    btnAdd.style.display = "inline-block";
    btnEdit.style.display = "inline-block";
    btnCancel.style.display = "none";
    btnAdd.removeEventListener('click', () => { });
    btnAdd.addEventListener('click', enterCreateMode);
    btnEdit.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    btnEdit.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield onClickEditOrSave(); }));
    btnCancel.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    btnCancel.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield onClickCancelEdit(); }));
}
/**
 * On clique sur "Ajouter un employe"
 */
function enterCreateMode() {
    isCreatingMode = true;
    isEditingMode = true;
    const newEmploye = new ComptePersonne({ matricule: maxMatricule + 1 });
    employeSelectedList = newEmploye;
    fillFormWithEmploye(newEmploye);
    showButtonsForEdit(true);
    setFormEditable(true); // rendre les champs éditables
    const btnEdit = document.getElementById("title__right-button-Modifier");
    if (btnEdit) {
        btnEdit.textContent = "Enregistrer";
    }
}
/**
 * Montre ou cache les 3 boutons selon si on est en mode edit ou pas
 */
function showButtonsForEdit(isEdit) {
    const btnAdd = document.getElementById("title__right-button-Ajouter");
    const btnEdit = document.getElementById("title__right-button-Modifier");
    const btnCancel = document.getElementById("title__right-button-Annuler");
    if (!btnAdd || !btnEdit || !btnCancel)
        return;
    if (isEdit) {
        btnAdd.style.display = "none";
        btnCancel.style.display = "inline-block";
        btnEdit.textContent = "Enregistrer";
        initListen(true);
        btnEdit.classList.add('inactif');
        btnEdit.disabled = true;
    }
    else {
        btnAdd.style.display = "inline-block";
        btnCancel.style.display = "none";
        btnEdit.textContent = "Modifier";
        initListen(false);
        btnEdit.classList.remove('inactif');
        btnEdit.disabled = false;
    }
}
/**
 * On clique sur "Modifier" ou "Enregistrer"
 */
function onClickEditOrSave() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isEditingMode) {
            // => on démarre l'édition
            isEditingMode = true;
            isCreatingMode = false;
            showButtonsForEdit(true);
            setFormEditable(true); // rendre les champs éditables
            const btnEdit = document.getElementById("title__right-button-Modifier");
            if (btnEdit)
                btnEdit.textContent = "Enregistrer";
        }
        else {
            // // => on est en train d'éditer => on veut enregistrer
            // if (isCreatingMode && employeSelectedList) {
            //     // En mode création les valeurs d'image se déduisent du filmId
            //     employeSelectedList.imageEmploye1024 = employeSelectedList?.id + "1024";
            //     employeSelectedList.imageEmploye128 = employeSelectedList?.id + "128";
            //     // La date de sortie est le prochain mercredi
            //     employeSelectedList.dateSortieCinePhoria = formatDateLocalYYYYMMDD(dateProchainMercredi());
            // }
            yield onSaveEmploye();
        }
    });
}
/**
 * On clique sur "Annuler"
 */
function onClickCancelEdit() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isCreatingMode) {
            employeSelectedList = employes[0];
        }
        //  if (!isEditingMode) return;
        isEditingMode = false;
        isCreatingMode = false;
        showButtonsForEdit(false);
        // Revenir en lecture seule
        setFormEditable(false);
        // revert
        const matricule = employeSelectedList === null || employeSelectedList === void 0 ? void 0 : employeSelectedList.matricule;
        if (matricule) {
            yield DataControllerIntranet.getEmployesByMatricule(matricule)
                .then((f) => fillFormWithEmploye(f))
                .catch((err) => console.error(err));
        }
        else {
            // rien
            effacerDetailEmploye();
        }
    });
}
/**
 * Fonction d'écouteur sur les champs de saisie
 */
function initListen(init) {
    const requiredNamedField = ['firstNameEmploye', 'lastNameEmploye', 'email', 'isAdministrateur', 'matricule',
        'firstPassword', 'confirmPassword'].concat(listCinemasConst);
    requiredNamedField.forEach(id => {
        const el = document.getElementById(id);
        if (el instanceof HTMLInputElement || el instanceof HTMLDivElement) {
            if (init) {
                el.addEventListener('input', updateSaveButtonState);
                el.addEventListener('blur', updateSaveButtonState);
            }
            else {
                el.removeEventListener('input', updateSaveButtonState);
                el.removeEventListener('blur', updateSaveButtonState);
            }
        }
    });
}
/**
 * Enregistrement du employe (création ou mise à jour)
 * Appelle la construction d'un employe à partir du formulaire
 * Fait les modifications/création des affiches
 * Fait la modification/création du employe
 * Finally réinitialise la page
 */
function onSaveEmploye() {
    return __awaiter(this, void 0, void 0, function* () {
        const { employe, password } = buildEmployeFromForm();
        if (!employe)
            return;
        try {
            yield DataControllerIntranet.createOrUpdateEmploye(employe, password);
            if (isCreatingMode) {
                // Creation
                console.log("Employe created => matricule", employe.matricule);
                alert("Employe créé avec succès");
            }
            else {
                // Modification
                console.log("Employe updated => matricule", employe.matricule);
                alert("Employe mis à jour avec succès");
            }
            // On refresh la liste
            yield rafraichirListeEmployes();
        }
        catch (err) {
            let messageErreur = "";
            if (isCreatingMode) {
                messageErreur = "Erreur dans la création du compte ";
            }
            else {
                messageErreur = "Erreur dans la modification du compte ";
            }
            console.error(messageErreur, err);
            const erreurSeule = err.replace(/^Error:\s*Erreur\s*:\s*/, '');
            alert(messageErreur + " => " + erreurSeule);
        }
        finally {
            isEditingMode = false;
            isCreatingMode = false;
            showButtonsForEdit(false);
            // On repasse en lecture seule
            setFormEditable(false);
            // On réinitialise le contenu en se positionnant sur le film qu'on vient de gérer
            employeSelectedList = employe;
            // Rafraîchir la liste de tous les films
            yield rafraichirListeEmployes();
            // fillFormWithEmploye(film);
        }
    });
}
/**
 * Construit un Employe à partir des champs (DOM) dans la div form-detailemploye
 */
function buildEmployeFromForm() {
    var _a, _b, _c, _d;
    if (employeSelectedList === undefined)
        return { employe: undefined, password: "" };
    const employe = employeSelectedList;
    console.log("On sauvegarde = " + employe.matricule);
    const lastNameEmployeEl = document.getElementById('lastNameEmploye');
    if (lastNameEmployeEl)
        employe.lastnameEmploye = ((_a = lastNameEmployeEl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    const firstNameEmployeEl = document.getElementById('firstNameEmploye');
    if (firstNameEmployeEl)
        employe.firstnameEmploye = ((_b = firstNameEmployeEl.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
    const emailEl = document.getElementById('email');
    if (emailEl)
        employe.email = ((_c = emailEl.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
    const matriculeEl = document.getElementById('matricule');
    if (matriculeEl)
        employe.matricule = parseInt(((_d = matriculeEl.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '', 10);
    const isAdministrateurEl = document.getElementById('isAdministrateur');
    if (isAdministrateurEl)
        employe.isAdministrateur = isAdministrateurEl.checked ? 1 : 0;
    const firstPasswordEl = document.getElementById('firstPassword');
    const confirmPasswordEl = document.getElementById('confirmPassword');
    let passwordForm = "";
    if (firstPasswordEl && confirmPasswordEl) {
        const firstPassword = firstPasswordEl.value.trim();
        const confirmPassword = confirmPasswordEl.value.trim();
        if (firstPassword === confirmPassword)
            passwordForm = firstPassword;
    }
    let listCinemas = "";
    listCinemasConst.forEach(c => {
        const villeEl = document.getElementById(c);
        if (villeEl && villeEl.checked) {
            listCinemas += listCinemas.length > 0 ? "," + c : c;
        }
    });
    employe.listCinemas = listCinemas;
    return { employe: employe, password: passwordForm };
}
/**
 * Affiche un employe dans le formulaire
 */
function fillFormWithEmploye(employe) {
    var _a;
    const emailEl = document.getElementById('email');
    if (emailEl)
        emailEl.textContent = employe.email || null;
    const matriculeEl = document.getElementById('matricule');
    if (matriculeEl)
        matriculeEl.textContent = ((_a = employe.matricule) === null || _a === void 0 ? void 0 : _a.toString(10)) || '';
    const lastNameEmployeEl = document.getElementById('lastNameEmploye');
    if (lastNameEmployeEl)
        lastNameEmployeEl.textContent = employe.lastnameEmploye || null;
    const firstNameEmployeEl = document.getElementById('firstNameEmploye');
    if (firstNameEmployeEl)
        firstNameEmployeEl.textContent = employe.firstnameEmploye || null;
    const isAdministrateurEl = document.getElementById('isAdministrateur');
    if (isAdministrateurEl)
        isAdministrateurEl.checked = employe.isAdministrateur === 1 ? true : false;
    const firstPasswordEl = document.getElementById('firstPassword');
    firstPasswordEl.value = "";
    const confirmPasswordEl = document.getElementById('confirmPassword');
    confirmPasswordEl.value = "";
    listCinemasConst.forEach(c => {
        var _a;
        const villeEl = document.getElementById(c);
        if ((_a = employe.listCinemas) === null || _a === void 0 ? void 0 : _a.includes(c)) {
            villeEl.checked = true;
        }
        else {
            villeEl.checked = false;
        }
    });
}
/**
 * Masquer/Afficher les controles de changement de mot de passe
 */
function setPasswordVisible(visible) {
    const passwordEdit = document.querySelector(".passwordEdit");
    passwordEdit.style.display = visible ? 'block' : 'none';
}
;
/**
 * Rend éditable formulaire
 */
function setFormEditable(editable) {
    const fieldIds = [
        'lastNameEmploye',
        'firstNameEmploye',
        'firstPassword',
        'confirmPassword'
    ];
    // Si on est en création on autorise la modification du mail et du matricule
    // Sinon non car les contraintes d'intégrité ne permettent pas de les modifier une fois créés
    if (isCreatingMode) {
        fieldIds.push('email');
        ;
        fieldIds.push('matricule');
    }
    if (!editable) {
        fieldIds.push('email');
        ;
        fieldIds.push('matricule');
    }
    fieldIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            if (el instanceof HTMLInputElement) {
                el.disabled = !editable;
            }
            else {
                el.contentEditable = editable ? "true" : "false";
            }
            el.style.border = editable ? "1px solid #000" : "none";
            el.style.background = editable ? "rgba(255, 215, 0, 0.1)" : "#FFF";
        }
    });
    [...listCinemasConst, ...['isAdministrateur']].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = !editable;
        }
    });
    setPasswordVisible(editable); // Affiche/masque les champ de saisie mot de passe
    const spansPwd = document.getElementsByClassName('span-password');
    if (editable && !isCreatingMode) {
        // La saisie de mot de passe n'est pas obligatoire
        Array.from(spansPwd).forEach((element) => {
            element.style.display = 'none';
        });
    }
    else {
        // La saisie de mot de passe est obligatoire
        Array.from(spansPwd).forEach((element) => {
            element.style.display = 'inline';
        });
    }
}
function isFormValid() {
    function alertMessage(message) {
        const alertEl = document.getElementById("messageErreur");
        alertEl.innerHTML = message;
    }
    alertMessage("");
    let isValid = true;
    let messageAttention = "<h3>Consignes à respecter :</h3> <ul>";
    // 1) Tous les champs doivent etre remplis
    const requiredFields = [
        'lastNameEmploye',
        'firstNameEmploye',
        'email',
        'matricule'
    ];
    let mustFill = false;
    for (const r of requiredFields) {
        const el = document.getElementById(r);
        if (el && (el === null || el === void 0 ? void 0 : el.innerText.trim().length) === 0) {
            mustFill = true;
        }
    }
    if (mustFill) {
        isValid = false;
        messageAttention += "<li>Nom, Prénom, email et matricule sont obligatoires";
    }
    // 2) Un cinema doit etre indique
    let existCinema = false;
    for (const c of listCinemasConst) {
        const isCheckEl = document.getElementById(c);
        if (isCheckEl === null || isCheckEl === void 0 ? void 0 : isCheckEl.checked) {
            existCinema = true;
            break;
        }
    }
    if (!existCinema) {
        isValid = false;
        messageAttention += "<li>Un cinéma au moins doit etre sélectionné";
    }
    // 3) Soit les deux inputs de password sont vides, soit ils sont égaux
    const fP = document.getElementById('firstPassword');
    const cP = document.getElementById('confirmPassword');
    if (fP && cP && fP.value.trim() !== cP.value.trim()) {
        isValid = false;
        messageAttention += "<li>Les deux champs de saisie du mot de passe doivent être identiques";
    }
    // 4) en mode création, on doit avoir un mot de passe
    if (isCreatingMode && fP && cP && (fP.value.trim().length === 0 || cP.value.trim().length === 0)) {
        isValid = false;
        messageAttention += "<li>En mode ajout, vous devez fournir un mot de passe valide";
    }
    // 5) L'email doit être bien formé
    const mailEl = document.getElementById("email");
    if (!validateEmail(mailEl.textContent || '')) {
        isValid = false;
        messageAttention += "<li>L'email doit être valide";
    }
    // 6) Les valeurs de mots de passe doivent être de 8 caracteres avec des caractères spéciaux
    if (fP && fP.value.trim().length > 0 && !isPasswordValid(fP.value.trim())) {
        isValid = false;
        messageAttention += "<li>Le mot de passe doit avoir 8 caractères, une majuscule, un caractère spécial et un nombre";
    }
    if (isValid)
        return true;
    messageAttention += "</ul>";
    alertMessage(messageAttention);
    return false;
}
function isFormModified() {
    var _a;
    if (!employeSelectedList)
        return false;
    const isDifferent = (id, value) => {
        const el = document.getElementById(id);
        return (el === null || el === void 0 ? void 0 : el.innerText.trim()) !== (value || '');
    };
    if (isDifferent('lastNameEmploye', employeSelectedList.lastnameEmploye))
        return true;
    if (isDifferent('firstNameEmploye', employeSelectedList.firstnameEmploye))
        return true;
    if (isDifferent('email', employeSelectedList.email))
        return true;
    if (isDifferent('matricule', (_a = employeSelectedList.matricule) === null || _a === void 0 ? void 0 : _a.toString(10)))
        return true;
    const fP = document.getElementById('firstPassword');
    const cP = document.getElementById('confirmPassword');
    if ((fP === null || fP === void 0 ? void 0 : fP.value.trim()) !== firstPassword)
        return true;
    if ((cP === null || cP === void 0 ? void 0 : cP.value.trim()) !== confirmPassword)
        return true;
    let listValeur = employeSelectedList.listCinemas || '';
    const tableauValeur = listValeur.split(",").map(el => el.trim());
    if (employeSelectedList.isAdministrateur === 1)
        tableauValeur.push('isAdministrateur');
    for (const c of [...listCinemasConst, ...['isAdministrateur']]) {
        const isCheckEl = document.getElementById(c);
        if (isCheckEl) {
            const valEl = isCheckEl.checked ? 1 : 0;
            const valOrigine = tableauValeur.includes(c) ? 1 : 0;
            if (valEl !== valOrigine) {
                return true;
            }
            ;
        }
    }
    return false;
}
function updateSaveButtonState() {
    const btnSave = document.getElementById('title__right-button-Modifier');
    if (!btnSave)
        return;
    btnSave.disabled = !(isFormValid() && isFormModified());
    btnSave.classList.toggle('inactif', btnSave.disabled);
}
