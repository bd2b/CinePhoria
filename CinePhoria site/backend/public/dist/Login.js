var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validateEmail } from "./Helpers.js";
import { dataController } from "./DataController.js";
import { userDataController } from "./DataControllerUser.js";
import { loginApi, askResetPwdApi, resetPwdApi } from "./NetworkController.js";
import { confirmReserve } from "./ViewReservationPlaces.js";
import { ReservationState } from "./shared-models/Reservation.js";
// HTML pour la modal de connexion
const modalLoginLocalHTML = `
  <!-- Modale loginWithEmail -->  
  <div id="modal-loginEmail" class="modal">
    <div class="modal__content-wrapper">
      <div class="modal__title">
        <div class="title__loginEmail title-h2">
          <h2>Connexion</h2>
        </div>
        <span class="close-modal" id="close-loginEmail">×</span>
      </div>
      <div class="modal__content">
        <div class="title-p" id="invite-p">
            <p>Veuillez vous connecter pour valider la réservation.</p>
        </div>
        <div class="form__group">
            <label for="loginEmail-email">Email :</label>
            <input type="email" id="loginEmail-email" class="input__mail" disabled />
            <span id="email-error" class="error-message"></span>
        </div>
        <div class="form__group">
            <label for="loginEmail-password">Mot de passe :</label>
            <input type="password" id="loginEmail-password" />
        </div>
        <span id="login-error" class="error-message" hidden="true">-</span>
  
        <div class="form__group" style="margin-top: 15px; display: flex; flex-direction: row; gap: 10px;">
            <button id="loginCreateAccount" class="button button-secondary">Créer votre compte</button>
            <button id="loginForgotPassword" class="button button-secondary">Mot de passe oublié</button>
            <button id="loginCloseModal" class="button">Fermer</button>
            <button id="loginEmail-submit" class="button button-primary inactif" disabled>Valider</button>
        </div>
      </div>
    </div>
  </div>
  `;
/**
 * Affiche la modal de connexion, si non déjà présente, et configure les événements
 */
export function login() {
    return __awaiter(this, arguments, void 0, function* (invite = "Veuillez vous connecter...", enableEmail = false) {
        // Crée / re-trouve la modal
        let modalConfirm = document.getElementById('modal-loginEmail');
        if (!modalConfirm) {
            const modalLoginLocal = document.createElement('div');
            modalLoginLocal.innerHTML = modalLoginLocalHTML;
            document.body.appendChild(modalLoginLocal);
            modalConfirm = document.getElementById('modal-loginEmail');
        }
        if (!modalConfirm) {
            console.error("Impossible de créer / trouver #modal-loginEmail");
            return;
        }
        modalConfirm.style.display = 'flex';
        // Fonction de fermeture
        const closeModal = () => {
            modalConfirm.style.display = 'none';
        };
        const closeModalBtn = document.getElementById("close-loginEmail");
        const submitButton = document.getElementById('loginEmail-submit');
        // 4 boutons
        const createAccountBtn = document.getElementById("loginCreateAccount");
        const forgotBtn = document.getElementById("loginForgotPassword");
        const closeLoginBtn = document.getElementById("loginCloseModal");
        // X
        closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener('click', closeModal);
        // clic hors modal
        modalConfirm.addEventListener('click', (event) => {
            if (event.target === modalConfirm)
                closeModal();
        });
        // Bouton "Fermer"
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', closeModal);
        }
        // "Créer votre compte"
        if (createAccountBtn) {
            createAccountBtn.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
            createAccountBtn.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                evt.preventDefault();
                evt.stopPropagation();
                alert("La création de compte sera réalisée lors de votre première réservation.");
            }));
        }
        // "Mot de passe oublié"
        if (forgotBtn) {
            forgotBtn.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
            forgotBtn.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                evt.preventDefault();
                evt.stopPropagation();
                const emailInput = document.getElementById('loginEmail-email');
                if (!emailInput || !validateEmail(emailInput.value.trim())) {
                    alert("Email invalide (exemple: utilisateur@domaine.com)");
                    return;
                }
                // Sinon => afficher la modale reinitModal
                showReinitModal(emailInput.value.trim());
                closeModal();
            }));
        }
        // Sélection des éléments de la modal avec un typage strict
        const inviteP = document.getElementById('invite-p');
        const emailInput = document.getElementById('loginEmail-email');
        const passwordInput = document.getElementById('loginEmail-password');
        const emailError = document.getElementById('email-error');
        const loginError = document.getElementById('login-error');
        // Affichage de l'invite
        if (inviteP) {
            inviteP.innerHTML = '<p>' + invite + '</p>';
        }
        else
            console.log("Pas d'invite dans la modale");
        // Permettre ou pas la saisie d'email, par defaut, non.
        emailInput.disabled = !enableEmail;
        /**
         * Vérifie si tous les champs sont remplis.
         * @returns boolean - True si tous les champs sont remplis, sinon False.
         */
        function areAllFieldsFilled() {
            return (emailInput.value.trim() !== "" &&
                passwordInput.value.trim() !== "");
        }
        /**
         * Valide l'ensemble du formulaire et active/désactive le bouton de soumission.
         */
        function validateForm() {
            const emailValid = validateEmail(emailInput.value);
            const fieldsFilled = areAllFieldsFilled();
            if (forgotBtn && createAccountBtn) {
                // La modal de connexion dispose des boutons Oubli de mot de passe et Creation Compte
                if (emailValid) {
                    forgotBtn.classList.remove("inactif");
                    forgotBtn.disabled = false;
                    createAccountBtn.classList.add("inactif");
                    createAccountBtn.disabled = true;
                }
                else {
                    forgotBtn.classList.add("inactif");
                    forgotBtn.disabled = true;
                    createAccountBtn.classList.remove("inactif");
                    createAccountBtn.disabled = false;
                }
            }
            // Activation/désactivation du bouton de soumission
            if (!(emailValid && fieldsFilled)) {
                submitButton.classList.add("inactif");
                submitButton.disabled = true;
            }
            else {
                submitButton.classList.remove("inactif");
                submitButton.disabled = false;
                loginError.hidden = true;
            }
        }
        // Ajout de la valeur d'email saisi dans le formulaire de réservation
        if (!enableEmail)
            emailInput.value = dataController.selectedUtilisateurMail || ''; // Définir une valeur par défaut
        // Le bouton de validation est inactif au chargement
        submitButton.classList.add("inactif");
        // Pas de message d'erreur de login
        emailError.textContent = "";
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
        // Ajout d'écouteurs d'événements pour la validation en temps réeldisplayNameInput.addEventListener('input', validateForm);
        emailInput.addEventListener('input', validateForm);
        passwordInput.addEventListener('input', validateForm);
        // "Valider" (Connexion)
        if (submitButton) {
            submitButton.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
            submitButton.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                evt.preventDefault();
                evt.stopPropagation();
                // Logique de connexion (placeholder)
                if (dataController.reservationState === ReservationState.ReserveToConfirm) {
                    // On est dans le workflow de reservation
                    try {
                        yield loginApi(emailInput.value.trim(), passwordInput.value.trim());
                        console.log("Connexion workflow reservation réussie");
                        if (modalConfirm)
                            modalConfirm.style.display = 'none';
                        // On memorise l'utilisateur et on charge ses données de compte
                        userDataController.ident = emailInput.value.trim();
                        yield userDataController.init();
                        yield confirmReserve();
                        const pageToGo = userDataController.profil();
                        window.location.href = pageToGo;
                    }
                    catch (error) {
                        console.log(error);
                        loginError.hidden = false;
                        loginError.textContent = error;
                        loginError.style.color = "red";
                    }
                }
                else {
                    // On se logue simplement depuis n'importe quelle page publique
                    try {
                        yield loginApi(emailInput.value.trim(), passwordInput.value.trim());
                        console.log("Connexion simple réussie");
                        if (modalConfirm)
                            modalConfirm.style.display = 'none';
                        // On memorise l'utilisateur et on charge ses données de compte
                        console.log("email logué = ", emailInput.value.trim());
                        userDataController.ident = emailInput.value.trim();
                        console.log("ident stockée = ", userDataController.ident);
                        yield userDataController.init();
                        console.log("Compte charge = ", userDataController.compte());
                        const pageToGo = userDataController.profil();
                        console.log("Page redirigée", pageToGo);
                        window.location.href = pageToGo;
                    }
                    catch (error) {
                        console.log(error);
                        loginError.hidden = false;
                        loginError.textContent = error;
                        loginError.style.color = "red";
                    }
                }
            }));
        }
        // On positionne les boutons en fonction des valeurs par défaut
        validateForm();
    });
}
/** Montre la modale de réinitialisation */
function showReinitModal(email) {
    const reinitHTML = `
    <div id="modal-reinitPass" class="modal">
        <div class="modal__content-wrapper">
            <div class="modal__title">
                <h2>Réinitialisation de votre mot de passe</h2>
                <span class="close-modal" id="close-reinitPass">×</span>
            </div>
            <div class="modal__content">
                <p>Si l'email que vous avez fourni (${email}) est valide, vous allez recevoir un code pour changer votre mot de passe.</p>
                <button id="reinit-continue" class="button button-primary">Continuer</button>
            </div>
        </div>
    </div>
    `;
    const divNode = document.createElement('div');
    divNode.innerHTML = reinitHTML;
    document.body.appendChild(divNode);
    const reinitModal = document.getElementById('modal-reinitPass');
    if (reinitModal)
        reinitModal.style.display = 'flex';
    const closeReinit = document.getElementById('close-reinitPass');
    const continueBtn = document.getElementById('reinit-continue');
    const closeFunc = () => {
        if (reinitModal)
            reinitModal.style.display = 'none';
    };
    closeReinit === null || closeReinit === void 0 ? void 0 : closeReinit.addEventListener('click', closeFunc);
    reinitModal === null || reinitModal === void 0 ? void 0 : reinitModal.addEventListener('click', (evt) => {
        if (evt.target === reinitModal)
            closeFunc();
    });
    continueBtn === null || continueBtn === void 0 ? void 0 : continueBtn.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    continueBtn === null || continueBtn === void 0 ? void 0 : continueBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        // On génére l'envoi d'un code
        askResetPwdApi(email);
        // On ferme reinitModal
        closeFunc();
        showNewPasswordModal(email);
    }));
}
/** Montre la modale de saisie du code + nouveau mot de passe */
function showNewPasswordModal(email) {
    const newPassHTML = `
    <div id="modal-newPass" class="modal">
        <div class="modal__content-wrapper">
            <div class="modal__title">
                <h2>Changer votre mot de passe</h2>
                <span class="close-modal" id="close-newPass">×</span>
            </div>
            <div class="modal__content">
                <p>Veuillez renseigner le code reçu par email, ainsi que votre nouveau mot de passe.</p>
                <div class="form__group">
                    <label for="newPass-code">Code à 6 chiffres :</label>
                    <input type="text" id="newPass-code" placeholder="123456" />
                </div>
                <div class="form__group">
                    <label for="newPass-p1">Nouveau mot de passe :</label>
                    <input type="password" id="newPass-p1" />
                </div>
                <div class="form__group">
                    <label for="newPass-p2">Confirmez le mot de passe :</label>
                    <input type="password" id="newPass-p2" />
                </div>
                <small>8 caractères minimum, incluant majuscules, minuscules, un caractère spécial et un chiffre.</small>
                <div class="form__group" style="margin-top:10px; display:flex; gap:10px;">
                    <button id="btnResendCode" class="button">Renvoyer un code</button>
                    <button id="btnValidateNewPass" class="button inactif" disabled>Valider</button>
                </div>
            </div>
        </div>
    </div>
    `;
    const divNode = document.createElement('div');
    divNode.innerHTML = newPassHTML;
    document.body.appendChild(divNode);
    const newPassModal = document.getElementById('modal-newPass');
    if (newPassModal)
        newPassModal.style.display = 'flex';
    const closeNewPass = document.getElementById('close-newPass');
    const codeInput = document.getElementById('newPass-code');
    const pass1Input = document.getElementById('newPass-p1');
    const pass2Input = document.getElementById('newPass-p2');
    const resendBtn = document.getElementById('btnResendCode');
    const validateBtn = document.getElementById('btnValidateNewPass');
    const closeFunc = () => {
        if (newPassModal)
            newPassModal.style.display = 'none';
    };
    closeNewPass === null || closeNewPass === void 0 ? void 0 : closeNewPass.addEventListener('click', closeFunc);
    newPassModal === null || newPassModal === void 0 ? void 0 : newPassModal.addEventListener('click', (evt) => {
        if (evt.target === newPassModal)
            closeFunc();
    });
    // Vérification du formulaire
    function checkForm() {
        if (!codeInput || !pass1Input || !pass2Input || !validateBtn)
            return;
        const codeVal = codeInput.value.trim();
        const p1 = pass1Input.value.trim();
        const p2 = pass2Input.value.trim();
        // code => 6 chiffres
        const codeOk = /^[0-9]{6}$/.test(codeVal);
        // MDP => 8 char mini + maj + min + special + digit
        const passOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p1);
        const same = (p1 === p2);
        if (codeOk && passOk && same) {
            validateBtn.disabled = false;
            validateBtn.classList.remove('inactif');
        }
        else {
            validateBtn.disabled = true;
            validateBtn.classList.add('inactif');
        }
    }
    codeInput === null || codeInput === void 0 ? void 0 : codeInput.addEventListener('input', checkForm);
    pass1Input === null || pass1Input === void 0 ? void 0 : pass1Input.addEventListener('input', checkForm);
    pass2Input === null || pass2Input === void 0 ? void 0 : pass2Input.addEventListener('input', checkForm);
    resendBtn.disabled = false;
    resendBtn.classList.remove('inactif');
    resendBtn === null || resendBtn === void 0 ? void 0 : resendBtn.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    resendBtn === null || resendBtn === void 0 ? void 0 : resendBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        askResetPwdApi(email);
        alert("Nous vous avons renvoyé un code.");
        resendBtn.disabled = true;
        resendBtn.classList.add('inactif');
    }));
    validateBtn === null || validateBtn === void 0 ? void 0 : validateBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        if (!codeInput || !pass1Input)
            return;
        const codeVal = codeInput.value.trim();
        const passVal = pass1Input.value.trim();
        // On appelle la fonction de validation => placeholder
        const result = yield validateChange(email, codeVal, passVal);
        if (result === "OK") {
            alert("Changement de mot de passe réussi, vous pouvez vous connecter.");
            closeFunc();
        }
        else {
            alert("Erreur : " + result + " \nRecommencez");
        }
    }));
}
/**
 * Placeholder : Valide le changement de mot de passe
 */
function validateChange(email, code, newpass) {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetPwdApi(email, code, newpass);
        return "OK";
    });
}
export function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // A reprendre quand on sera en mode hébergé
            // await logoutApi();
            localStorage.removeItem('jwtAccessToken');
            userDataController.invalidate();
            window.location.href = 'visiteur.html';
        }
        catch (error) {
            console.error(error);
        }
    });
}
