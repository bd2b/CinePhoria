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
import { loginApi } from "./NetworkController.js";
import { confirmReserve } from "./ViewReservationPlaces.js";
import { ReservationState } from "./shared-models/Reservation.js";
const modalLoginLocalHTML = `
<!-- Modale loginWithEmail -->  
    <div id="modal-loginEmail" class="modal">
        <div class="modal__content-wrapper">
            <div class="modal__title">
                <div class="title__loginEmail title-h2">
                    <h2>Connexion</h2>
                </div>
                <!-- Bouton (X) ou autre mécanisme pour fermer la modale si besoin -->
                <span class="close-modal" id="close-loginEmail">×</span>
            </div>
            <div class="modal__content">
                <div class="title-p" id="invite-p">
                    <p>Veuillez vous connecter pour valider la réservation.</p>
                </div>
                <!-- Email -->
                <div class="form__group">
                    <label for="loginEmail-email">Email :</label>
                    <input type="email" id="loginEmail-email" class="input__mail" disabled />
                    <span id="email-error" class="error-message"></span>
                </div>
                <!-- Mot de passe -->
                <div class="form__group">
                    <label for="loginEmail-password">Mot de passe :</label>
                    <input type="password" id="loginEmail-password" />
                </div>
                <!-- Bouton de validation -->
                <button id="loginEmail-submit" class="button button-primary" disabled>
                    Connexion
                </button>
                <span id="login-error" class="error-message" hidden="true">-</span>
            </div>
        </div>
    </div>`;
/**
 * Quand on reçoit "Compte Provisoire" => on exécute loginWithEmail
 * - On affiche la modale de connexion
 */
export function login2() {
    return __awaiter(this, arguments, void 0, function* (invite = "", enableEmail = false) {
        // Afficher la modale de login
        // Param : 
        // - invite par defaut vide, présente un message d'invitation
        // - enableEmail par defaut faux, indique qu'on interdit la saisie du compte (workflow de reservation)
        // Execution de la fonction interne gestionFormulaire (valeur de l'email saisie)
        //  Reprise de la valeur de l'email du formulaire précédent
        //  Verification des champs email/password, si OK activation du bouton
        //  Bouton submit qui enclenche la le login
        console.log('===> login action');
        // On installe la modale dans la page HTML
        const modalLoginLocal = document.createElement('div');
        modalLoginLocal.innerHTML = modalLoginLocalHTML;
        document.body.appendChild(modalLoginLocal);
        const modalConfirm = document.getElementById('modal-loginEmail');
        const closeModalBtn = document.getElementById("close-loginEmail");
        const confirmModalBtn = document.getElementById("loginEmail-submit");
        if (modalConfirm && closeModalBtn && confirmModalBtn) {
            modalConfirm.style.display = 'flex';
            const closeModal = () => {
                modalConfirm.style.display = 'none';
                window.location.reload();
            };
            closeModalBtn.addEventListener('click', closeModal);
            modalConfirm.addEventListener('click', (event) => {
                if (event.target === modalConfirm)
                    closeModal();
            });
            // Appel de la fonction de login -> on est sur d'avoir ces données car la vérification
            // des valeurs du formulaire conditionne le submit qui exécute cette fonction
            yield gestionFormulaireModal();
        }
        else {
            console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal modal-loginEmail sont introuvables.');
        }
        /**
         * Met en place toute la gestion de la modal login
         * @param emailInitial sert a initialiser l'input du mail
         *
         */
        function gestionFormulaireModal() {
            return __awaiter(this, void 0, void 0, function* () {
                // Sélection des éléments de la modal avec un typage strict
                const inviteP = document.getElementById('invite-p');
                const emailInput = document.getElementById('loginEmail-email');
                const passwordInput = document.getElementById('loginEmail-password');
                const emailError = document.getElementById('email-error');
                const loginError = document.getElementById('login-error');
                const submitButton = document.getElementById('loginEmail-submit');
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
                // Gestion de la soumission de la modale
                submitButton.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
                submitButton.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                    evt.preventDefault();
                    evt.stopPropagation();
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
            });
        }
    });
}
export function logout2() {
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
