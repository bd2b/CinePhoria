var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validateEmail } from './Helpers.js';
import { userDataController } from './DataControllerUser.js';
import { Mail } from './shared-models/Mail.js';
import { sendMailApi } from './NetworkController.js';
import { showCustomAlert } from './Helpers.js';
export function onClickContact() {
    var _a;
    // 1) Vérifier si un div#modal-contact existe déjà
    let modal = document.getElementById('modal-contact');
    if (!modal) {
        // Le créer s’il n’existe pas
        modal = document.createElement('div');
        modal.id = 'modal-contact';
        modal.classList.add('modal');
        document.body.appendChild(modal);
    }
    if (!modal)
        return;
    const mailCourant = (_a = userDataController.compte()) === null || _a === void 0 ? void 0 : _a.email;
    let mailValue = '';
    if (mailCourant && validateEmail(mailCourant)) {
        mailValue = mailCourant; // On l’utilise si c’est défini ET valide
    }
    // 2) Construire le HTML interne de la modale
    const modalContactHTML = `
  <div class="modal__content-wrapper">
    <div class="modal__title">
      <div class="title__Contact title-h2">
        <h2>Formulaire de contact</h2>
      </div>
      <span class="close-modal" id="close-contact">×</span>
    </div>
    <div class="modal__content" id="content__Contact">
    <div class="form__group">
      
      <input type="text" id="contact-mail" placeholder="Adresse mail de réponse (facultatif)" value="${mailValue}" />
      <input type="text" id="contact-titre" placeholder="Quel est le sujet de votre demande ?" />
      <div>
      <label for="contact-desc">Dites nous en plus</label>
      <textarea id="contact-desc" rows="4" cols="40" placeholder="Détailler votre demande"></textarea>
      </div>
      <div class="modal__btns">
        <button id="contactAnnulerBtn" class="button">Annuler</button>
        <button id="contactEnvoyerBtn" class="button inactif" disabled>Envoyer votre demande</button>
      </div>
      <div>
      <span id="contact-error" style="color: red; font-size: 0.9em; display: none;"></span>
      </div>
    </div>
    </div>
  </div>
  `;
    // 3) Injecter le contenu HTML dans la modale
    modal.innerHTML = modalContactHTML;
    // 4) Ajouter la modale au document si nécessaire
    // (Si modal est déjà dans le HTML de base, pas besoin de l’appendChild)
    document.body.appendChild(modal);
    // 5) Afficher la modale
    modal.style.display = 'flex'; // ou 'block' selon vos styles
    // 6) Sélection des éléments
    const closeModalBtn = document.getElementById('close-contact');
    const mailInput = document.getElementById('contact-mail');
    const titreInput = document.getElementById('contact-titre');
    const descInput = document.getElementById('contact-desc');
    const annulerBtn = document.getElementById('contactAnnulerBtn');
    const envoyerBtn = document.getElementById('contactEnvoyerBtn');
    const errorSpan = document.getElementById('contact-error');
    // Fonction pour fermer la modale
    const closeModal = () => {
        modal.style.display = 'none';
    };
    // 7) Vérifier l’état du formulaire et activer/désactiver le bouton
    function checkFormValidity() {
        // a) Vérifier le mail (facultatif). S’il y a un contenu => validateEmail
        const mailVal = (mailInput === null || mailInput === void 0 ? void 0 : mailInput.value.trim()) || '';
        if (mailVal && !validateEmail(mailVal)) {
            // Erreur possible, mais la consigne : “mail est facultatif”.
            // On peut juste avertir si mal formé => le bouton n’est pas activé si c’est incorrect.
            showError("Veuillez indiquer un email valide si vous souhaitez un retour.");
            setButtonDisabled(true);
            return;
        }
        // b) Vérifier le titre
        const titreVal = (titreInput === null || titreInput === void 0 ? void 0 : titreInput.value.trim()) || '';
        // “au moins un mot de 5 caractères”
        // On peut faire un petit test avec un split ou un test direct
        const words = titreVal.split(/\s+/);
        const hasLongWord = words.some((w) => w.length >= 5);
        if (!hasLongWord) {
            showError("Veuillez préciser le sujet de votre demande");
            setButtonDisabled(true);
            return;
        }
        // c) Vérifier la description => “au moins 3 mots de 5 caractères”
        const descVal = (descInput === null || descInput === void 0 ? void 0 : descInput.value.trim()) || '';
        const descWords = descVal.split(/\s+/).filter(Boolean);
        // Compter combien ont au moins 5 caractères
        const count5Chars = descWords.filter((w) => w.length >= 5).length;
        if (count5Chars < 3) {
            showError("Veuillez décrire plus précisément votre demande en 3 mots.");
            setButtonDisabled(true);
            return;
        }
        // Si tout est bon, pas d’erreur
        hideError();
        setButtonDisabled(false);
    }
    function showError(msg) {
        if (errorSpan) {
            errorSpan.style.display = 'inline';
            errorSpan.textContent = msg;
        }
    }
    function hideError() {
        if (errorSpan) {
            errorSpan.style.display = 'none';
            errorSpan.textContent = '';
        }
    }
    function setButtonDisabled(dis) {
        if (!envoyerBtn)
            return;
        if (dis) {
            envoyerBtn.classList.add('inactif');
            envoyerBtn.disabled = true;
        }
        else {
            envoyerBtn.classList.remove('inactif');
            envoyerBtn.disabled = false;
        }
    }
    // 8) Brancher la vérification sur les events input
    mailInput === null || mailInput === void 0 ? void 0 : mailInput.addEventListener('input', checkFormValidity);
    titreInput === null || titreInput === void 0 ? void 0 : titreInput.addEventListener('input', checkFormValidity);
    descInput === null || descInput === void 0 ? void 0 : descInput.addEventListener('input', checkFormValidity);
    // 9) Fermer la modale avec (X)
    closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener('click', closeModal);
    // Fermer la modale en cliquant en dehors
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    // 10) Bouton Annuler
    annulerBtn === null || annulerBtn === void 0 ? void 0 : annulerBtn.addEventListener('click', closeModal);
    // 11) Bouton Envoyer la demande
    envoyerBtn === null || envoyerBtn === void 0 ? void 0 : envoyerBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        setButtonDisabled(true);
        envoyerBtn.classList.add('loading');
        const mailVal = (mailInput === null || mailInput === void 0 ? void 0 : mailInput.value.trim()) || '';
        const titreVal = (titreInput === null || titreInput === void 0 ? void 0 : titreInput.value.trim()) || '';
        const descVal = (descInput === null || descInput === void 0 ? void 0 : descInput.value.trim()) || '';
        const mail = new Mail(mailVal, titreVal, descVal, "false");
        try {
            const resultat = yield sendMailApi(mail);
            // await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("Resultat envoi mail = " + resultat.statut);
            if (resultat.statut.startsWith("OK")) {
                yield showCustomAlert(`
        Votre demande a bien été envoyée !

        Mail : ${mailVal || 'Pas de mail'}
        Titre : ${titreVal}
        Description : ${descVal}`);
            }
            else {
                yield showCustomAlert(`
        Nous n'avons pas pu envoyer votre demande.
        Merci de la renouveler ultérieurement.`);
            }
        }
        catch (error) {
            yield showCustomAlert(`Erreur réseau ou serveur, veuillez réessayer.`);
            console.error("Erreur lors de l'envoi du mail", error);
        }
        finally {
            envoyerBtn.classList.remove('loading');
            setButtonDisabled(false);
            closeModal();
        }
    }));
    // 12) Initial check
    checkFormValidity();
}
