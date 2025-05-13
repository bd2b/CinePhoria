import { DataControllerIntranet } from './DataControllerIntranet.js';

import { ComptePersonne } from './shared-models/Utilisateur.js';

import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { listCinemasConst, validateEmail, isPasswordValid, showCustomAlert } from './Helpers.js';
import { profilApi } from './NetworkController.js'


// State flags
let isEditingMode = false;
let isCreatingMode = false;

// Employe selectionne
let employeSelectedList: ComptePersonne | undefined;

// Tableau des employés
let employes: ComptePersonne[] = []

// Valeur de comparaison des mots de passe
let firstPassword = "";
let confirmPassword = "";

// valeur la plus elevée de matricule
let maxMatricule = 0;

/**
 * Entrée principale du module
 */
export async function onLoadManageEmployes() {
    console.log("=====> chargement onLoadManageEmployes");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Mise à jour de la version
    await DataControllerIntranet.majVersion();

    // Rafraîchir la liste de tous les employes
    await rafraichirListeEmployes();

    // Init les 3 boutons (Ajouter, Modifier, Annuler)
    initButtons();

    setFormEditable(false);

    document.querySelector("main")!.style.visibility = "visible";
}

/* ---------------------------------------------------
   Rafraîchit la liste de tous les employes, 
   et affiche le premier ou le employe sélectionné
--------------------------------------------------- */
async function rafraichirListeEmployes(): Promise<void> {
    const container = document.querySelector('.employes__listEmployes');
    if (!container) return;

    container.innerHTML = '';

    // Charger les employes
    employes = await DataControllerIntranet.getListEmployesAll();

    // Calculer le max de matricule de ce tableau
    maxMatricule = employes.reduce(
        (max, employe) => Math.max(max, employe.matricule ?? 0),
        0
    );

    // Construire les cards
    employes.forEach((employe) => {
        const card = buildEmployeCard(employe);
        container.appendChild(card);
    });

    // Sélection
    if (employes.length > 0) {
        employeSelectedList = employes[0];
        fillFormWithEmploye(employeSelectedList);
    } else {
        // plus de employe => effacer detail
        effacerDetailEmploye();
    }
    if (employeSelectedList) {
        const selectedCard = [...container.querySelectorAll('.listEmployes__simpleCard')]
            .find((card) => card.textContent?.includes(employeSelectedList!.matricule?.toString(10) || ""));

        if (selectedCard) {
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

/* ---------------------------------------------------
   Construction d'une card
--------------------------------------------------- */
function buildEmployeCard(employe: ComptePersonne): HTMLDivElement {
    const divCard = document.createElement('div');
    divCard.classList.add('listEmployes__simpleCard');

    // nomEmploye
    const pnomEmploye = document.createElement('p');
    pnomEmploye.classList.add('simpleCard__detail-titre-p');

    pnomEmploye.textContent = employe.lastnameEmploye?.toUpperCase() + ' ' + employe.firstnameEmploye + ' (' + employe.matricule + ')';
    divCard.appendChild(pnomEmploye);

    // Mail et administrateur
    const pmail = document.createElement('p');
    pmail.classList.add('simpleCard__detail-titre-p');
    pmail.textContent = employe.email + (employe.isAdministrateur === 1 ? " - administrateur" : "");
    divCard.appendChild(pmail);

    // Nombre de connexion ou bouton supprimer

    if (employe.numConnexions! > 0) {
        const pNumConnexion = document.createElement('p');
        pNumConnexion.classList.add('simpleCard__detail-titre-p');
        pNumConnexion.classList.add('numConnexions');
        pNumConnexion.textContent = employe.numConnexions + " connexions";
        divCard.appendChild(pNumConnexion);
    } else {
        const btnSuppression = document.createElement('button') as HTMLButtonElement;
        btnSuppression.classList.add('simpleCard__detail-titre-p');
        btnSuppression.classList.add('supprimer-button');
        btnSuppression.textContent = "Supprimer";
        divCard.appendChild(btnSuppression);

        btnSuppression.removeEventListener('click', async () => { });
        btnSuppression.addEventListener('click', async () => {
            try {
                await DataControllerIntranet.deleteEmploye(employe.matricule!);
                await rafraichirListeEmployes();
            } catch (error) {
                alert("Erreur dans la suppression")
            }
        });

    }

    // Clic -> détail
    divCard.addEventListener('click', async () => {
        console.log("employe = ", employe.matricule)
        effacerDetailEmploye();
        employeSelectedList = employe;
        fillFormWithEmploye(employe);
    });

    return divCard;
}



function effacerDetailEmploye() {
    const containerDetail = document.querySelector('.employes__detailEmploye');
    if (!containerDetail) return;
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
    const btnAdd = document.getElementById("title__right-button-Ajouter") as HTMLButtonElement | null;
    const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
    const btnCancel = document.getElementById("title__right-button-Annuler") as HTMLButtonElement | null;
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

    btnEdit.removeEventListener('click', async () => { });
    btnEdit.addEventListener('click', async () => await onClickEditOrSave());

    btnCancel.removeEventListener('click', async () => { });
    btnCancel.addEventListener('click', async () => await onClickCancelEdit());
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
    setFormEditable(true);  // rendre les champs éditables

    const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
    if (btnEdit) {
        btnEdit.textContent = "Enregistrer";
    }
}

/**
 * Montre ou cache les 3 boutons selon si on est en mode edit ou pas
 */
function showButtonsForEdit(isEdit: boolean) {
    const btnAdd = document.getElementById("title__right-button-Ajouter") as HTMLButtonElement | null;
    const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
    const btnCancel = document.getElementById("title__right-button-Annuler") as HTMLButtonElement | null;
    if (!btnAdd || !btnEdit || !btnCancel) return;

    if (isEdit) {
        btnAdd.style.display = "none";
        btnCancel.style.display = "inline-block";
        btnEdit.textContent = "Enregistrer";
        initListen(true);
        btnEdit.classList.add('inactif');
        btnEdit.disabled = true;
    } else {
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
async function onClickEditOrSave() {
    if (!isEditingMode) {
        // => on démarre l'édition
        isEditingMode = true;
        isCreatingMode = false;
        showButtonsForEdit(true);

        setFormEditable(true);  // rendre les champs éditables

        const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
        if (btnEdit) btnEdit.textContent = "Enregistrer";
    } else {
        // // => on est en train d'éditer => on veut enregistrer
        // if (isCreatingMode && employeSelectedList) {
        //     // En mode création les valeurs d'image se déduisent du filmId
        //     employeSelectedList.imageEmploye1024 = employeSelectedList?.id + "1024";
        //     employeSelectedList.imageEmploye128 = employeSelectedList?.id + "128";
        //     // La date de sortie est le prochain mercredi
        //     employeSelectedList.dateSortieCinePhoria = formatDateLocalYYYYMMDD(dateProchainMercredi());


        // }
        await onSaveEmploye();
    }
}

/**
 * On clique sur "Annuler"
 */
async function onClickCancelEdit() {

    if (isCreatingMode) {
        employeSelectedList = employes[0]
    }

    //  if (!isEditingMode) return;
    isEditingMode = false;
    isCreatingMode = false;

    showButtonsForEdit(false);

    // Revenir en lecture seule
    setFormEditable(false);

    // revert
    const matricule = employeSelectedList?.matricule;
    if (matricule) {
        await DataControllerIntranet.getEmployesByMatricule(matricule)
            .then((f) => fillFormWithEmploye(f!))
            .catch((err) => console.error(err));
    } else {
        // rien
        effacerDetailEmploye();
    }
}


/**
 * Fonction d'écouteur sur les champs de saisie
 */
function initListen(init: boolean) {
    const requiredNamedField = ['firstNameEmploye', 'lastNameEmploye', 'email', 'isAdministrateur', 'matricule',
        'firstPassword', 'confirmPassword'].concat(listCinemasConst);
    requiredNamedField.forEach(id => {
        const el = document.getElementById(id);
        if (el instanceof HTMLInputElement || el instanceof HTMLDivElement) {
            if (init) {
                el.addEventListener('input', updateSaveButtonState);
                el.addEventListener('blur', updateSaveButtonState);
            } else {
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
async function onSaveEmploye() {
    const { employe, password } = buildEmployeFromForm();
    if (!employe) return;
    if (!employe.matricule) return;

    try {

        const comptePersonnes = await profilApi(employe.email);
        let isUtilisateur = false;
        if (comptePersonnes && comptePersonnes.length > 0) {
            if (comptePersonnes[0].utilisateurid) isUtilisateur = true;
        }
        if (isUtilisateur) {
            // L'email utilisé est celui d'un employe, on renvoi un message d'erreur
            await showCustomAlert("Vous ne pouvez pas utiliser un email d'utilisateur comme email d'employe");

        } else {
            await DataControllerIntranet.createOrUpdateEmploye(employe, password);
            if (isCreatingMode) {
                // Creation
                console.log("Employe created => matricule", employe.matricule);
                await showCustomAlert("Employe créé avec succès");

            } else {
                // Modification
                console.log("Employe updated => matricule", employe.matricule);
                await showCustomAlert("Employe mis à jour avec succès");
            }
            // On refresh la liste
            await rafraichirListeEmployes();
        }

    } catch (err) {
        let messageErreur = ""
        if (isCreatingMode) {
            messageErreur = "Erreur dans la création du compte "

        } else {
            messageErreur = "Erreur dans la modification du compte "
        }
        console.error(messageErreur, err);
        const erreurSeule = (err as string).replace(/^Error:\s*Erreur\s*:\s*/, '');
        await showCustomAlert(messageErreur + " => " + erreurSeule);

    } finally {
        isEditingMode = false;
        isCreatingMode = false;
        showButtonsForEdit(false);
        // On repasse en lecture seule
        setFormEditable(false);
        // On réinitialise le contenu en se positionnant sur le film qu'on vient de gérer
        employeSelectedList = employe;

        // Rafraîchir la liste de tous les films
        await rafraichirListeEmployes();


        // fillFormWithEmploye(film);

    }
}

/**
 * Construit un Employe à partir des champs (DOM) dans la div form-detailemploye
 */
function buildEmployeFromForm(): { employe: ComptePersonne | undefined, password: string } {

    if (employeSelectedList === undefined) return { employe: undefined, password: "" }
    const employe = employeSelectedList;

    console.log("On sauvegarde = " + employe.matricule);

    const lastNameEmployeEl = document.getElementById('lastNameEmploye');
    if (lastNameEmployeEl) employe.lastnameEmploye = lastNameEmployeEl.textContent?.trim() || '';

    const firstNameEmployeEl = document.getElementById('firstNameEmploye');
    if (firstNameEmployeEl) employe.firstnameEmploye = firstNameEmployeEl.textContent?.trim() || '';

    const emailEl = document.getElementById('email');
    if (emailEl) employe.email = emailEl.textContent?.trim() || '';

    const matriculeEl = document.getElementById('matricule');
    if (matriculeEl) employe.matricule = parseInt(matriculeEl.textContent?.trim() || '', 10);

    const isAdministrateurEl = document.getElementById('isAdministrateur') as HTMLInputElement;
    if (isAdministrateurEl) employe.isAdministrateur = isAdministrateurEl.checked ? 1 : 0;

    const firstPasswordEl = document.getElementById('firstPassword');

    const confirmPasswordEl = document.getElementById('confirmPassword');

    let passwordForm = "";
    if (firstPasswordEl && confirmPasswordEl) {
        const firstPassword = (firstPasswordEl as HTMLInputElement).value.trim();
        const confirmPassword = (confirmPasswordEl as HTMLInputElement).value.trim();
        if (firstPassword === confirmPassword) passwordForm = firstPassword

    }

    let listCinemas = "";
    listCinemasConst.forEach(c => {
        const villeEl = document.getElementById(c) as HTMLInputElement;
        if (villeEl && villeEl.checked) {
            listCinemas += listCinemas.length > 0 ? "," + c : c;
        }
    })
    employe.listCinemas = listCinemas;

    return { employe: employe, password: passwordForm };
}

/**
 * Affiche un employe dans le formulaire
 */
function fillFormWithEmploye(employe: ComptePersonne) {


    const emailEl = document.getElementById('email');
    if (emailEl) emailEl.textContent = employe.email || null;

    const matriculeEl = document.getElementById('matricule');
    if (matriculeEl) matriculeEl.textContent = employe.matricule?.toString(10) || '';


    const lastNameEmployeEl = document.getElementById('lastNameEmploye');
    if (lastNameEmployeEl) lastNameEmployeEl.textContent = employe.lastnameEmploye || null;

    const firstNameEmployeEl = document.getElementById('firstNameEmploye');
    if (firstNameEmployeEl) firstNameEmployeEl.textContent = employe.firstnameEmploye || null;


    const isAdministrateurEl = document.getElementById('isAdministrateur') as HTMLInputElement;
    if (isAdministrateurEl) isAdministrateurEl.checked = employe.isAdministrateur === 1 ? true : false;

    const firstPasswordEl = document.getElementById('firstPassword');
    (firstPasswordEl as HTMLInputElement).value = "";


    const confirmPasswordEl = document.getElementById('confirmPassword');
    (confirmPasswordEl as HTMLInputElement).value = "";

    listCinemasConst.forEach(c => {
        const villeEl = document.getElementById(c) as HTMLInputElement;
        if (employe.listCinemas?.includes(c)) {
            villeEl.checked = true;
        } else {
            villeEl.checked = false;
        }
    });


}

/**
 * Masquer/Afficher les controles de changement de mot de passe
 */
function setPasswordVisible(visible: boolean) {
    const passwordEdit = document.querySelector(".passwordEdit") as HTMLDivElement;
    passwordEdit.style.display = visible ? 'block' : 'none';
};




/**
 * Rend éditable formulaire
 */
function setFormEditable(editable: boolean) {
    const fieldIds = [
        'lastNameEmploye',
        'firstNameEmploye',
        'firstPassword',
        'confirmPassword'
    ];

    // Si on est en création on autorise la modification du mail et du matricule
    // Sinon non car les contraintes d'intégrité ne permettent pas de les modifier une fois créés
    if (isCreatingMode) {
        fieldIds.push('email');;
        fieldIds.push('matricule');
    }

    if (!editable) {
        fieldIds.push('email');;
        fieldIds.push('matricule');
    }
    fieldIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            if (el instanceof HTMLInputElement) {
                el.disabled = !editable;
            } else {
                (el as HTMLElement).contentEditable = editable ? "true" : "false";
            }

            el.style.border = editable ? "1px solid #000" : "none";
            el.style.background = editable ? "rgba(255, 215, 0, 0.1)" : "#FFF";
        }
    });

    [...listCinemasConst, ...['isAdministrateur']].forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) {
            el.disabled = !editable;
        }

    })

    setPasswordVisible(editable); // Affiche/masque les champ de saisie mot de passe

    const spansPwd = document.getElementsByClassName('span-password');
    if (editable && !isCreatingMode) {
        // La saisie de mot de passe n'est pas obligatoire
        Array.from(spansPwd).forEach((element) => {
            (element as HTMLDivElement).style.display = 'none';
        });
    } else {
        // La saisie de mot de passe est obligatoire
        Array.from(spansPwd).forEach((element) => {
            (element as HTMLDivElement).style.display = 'inline';
        });
    }



}

function isFormValid(): boolean {

    function alertMessage(message: string) {
        const alertEl = document.getElementById("messageErreur");
        alertEl!.innerHTML = message;
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
        if (el && el?.innerText.trim().length === 0) {
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
        const isCheckEl = document.getElementById(c) as HTMLInputElement;
        if (isCheckEl?.checked) {
            existCinema = true;
            break;
        }
    }
    if (!existCinema) {
        isValid = false;
        messageAttention += "<li>Un cinéma au moins doit etre sélectionné";
    }

    // 3) Soit les deux inputs de password sont vides, soit ils sont égaux
    const fP = document.getElementById('firstPassword') as HTMLInputElement;
    const cP = document.getElementById('confirmPassword') as HTMLInputElement;
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
    const mailEl = document.getElementById("email") as HTMLDivElement;
    if (!validateEmail(mailEl.textContent || '')) {
        isValid = false;
        messageAttention += "<li>L'email doit être valide";
    }

    // 6) Les valeurs de mots de passe doivent être de 8 caracteres avec des caractères spéciaux
    if (fP && fP.value.trim().length > 0 && !isPasswordValid(fP.value.trim())) {
        isValid = false;
        messageAttention += "<li>Le mot de passe doit avoir 8 caractères, une majuscule, un caractère spécial et un nombre";
    }

    if (isValid) return true;
    messageAttention += "</ul>"
    alertMessage(messageAttention);
    return false;
}


function isFormModified(): boolean {
    if (!employeSelectedList) return false;

    const isDifferent = (id: string, value: string | undefined) => {
        const el = document.getElementById(id);
        return el?.innerText.trim() !== (value || '');
    };

    if (isDifferent('lastNameEmploye', employeSelectedList.lastnameEmploye)) return true;
    if (isDifferent('firstNameEmploye', employeSelectedList.firstnameEmploye)) return true;
    if (isDifferent('email', employeSelectedList.email)) return true;
    if (isDifferent('matricule', employeSelectedList.matricule?.toString(10))) return true;

    const fP = document.getElementById('firstPassword') as HTMLInputElement;
    const cP = document.getElementById('confirmPassword') as HTMLInputElement;
    if (fP?.value.trim() !== firstPassword) return true;
    if (cP?.value.trim() !== confirmPassword) return true;


    let listValeur = employeSelectedList.listCinemas || '';
    const tableauValeur = listValeur.split(",").map(el => el.trim());

    if (employeSelectedList.isAdministrateur === 1) tableauValeur.push('isAdministrateur');

    for (const c of [...listCinemasConst, ...['isAdministrateur']]) {
        const isCheckEl = document.getElementById(c) as HTMLInputElement;
        if (isCheckEl) {
            const valEl = isCheckEl.checked ? 1 : 0;
            const valOrigine = tableauValeur.includes(c) ? 1 : 0;
            if (valEl !== valOrigine) {
                return true;
            };
        }

    }
    return false;
}

function updateSaveButtonState() {
    const btnSave = document.getElementById('title__right-button-Modifier') as HTMLButtonElement;
    if (!btnSave) return;
    btnSave.disabled = !(isFormValid() && isFormModified());
    btnSave.classList.toggle('inactif', btnSave.disabled);
}