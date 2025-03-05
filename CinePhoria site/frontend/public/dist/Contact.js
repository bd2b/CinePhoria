import { validateEmail } from './Helpers.js';
export function onClickContact() {
    // 1) Sélectionner ou créer la modale
    const modal = document.getElementById('modal-contact');
    if (!modal)
        return;
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
      <p>Votre nom ou une adresse mail pour vous répondre (facultatif)</p>
      <input type="text" id="contact-mail" placeholder="Nom ou adresse mail" />
      <small style="color: #888;">Indiquez votre mail si vous souhaitez avoir une réponse</small>
      
      <label for="contact-titre">Titre</label>
      <input type="text" id="contact-titre" placeholder="Quel est le sujet de votre contact ?" />
      
      <label for="contact-desc">Description</label>
      <textarea id="contact-desc" rows="4" cols="40" placeholder="Écrivez votre demande"></textarea>
      
      <div class="modal__btns">
        <button id="contactAnnulerBtn" class="button">Annuler</button>
        <button id="contactEnvoyerBtn" class="button inactif" disabled>Envoyer votre demande</button>
      </div>
      <span id="contact-error" style="color: red; font-size: 0.9em; display: none;"></span>
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
            showError("Veuillez préciser le sujet de votre demande (un mot de 5 caractères minimum).");
            setButtonDisabled(true);
            return;
        }
        // c) Vérifier la description => “au moins 3 mots de 5 caractères”
        const descVal = (descInput === null || descInput === void 0 ? void 0 : descInput.value.trim()) || '';
        const descWords = descVal.split(/\s+/).filter(Boolean);
        // Compter combien ont au moins 5 caractères
        const count5Chars = descWords.filter((w) => w.length >= 5).length;
        if (count5Chars < 3) {
            showError("Veuillez décrire plus précisément votre demande (au moins 3 mots de 5 caractères).");
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
    envoyerBtn === null || envoyerBtn === void 0 ? void 0 : envoyerBtn.addEventListener('click', () => {
        // Tout est déjà validé dans checkFormValidity
        // => On affiche une alert ou on appelle un code d’envoi
        const mailVal = (mailInput === null || mailInput === void 0 ? void 0 : mailInput.value.trim()) || '';
        const titreVal = (titreInput === null || titreInput === void 0 ? void 0 : titreInput.value.trim()) || '';
        const descVal = (descInput === null || descInput === void 0 ? void 0 : descInput.value.trim()) || '';
        alert(`Demande envoyée !
Mail : ${mailVal || 'Pas de mail'}
Titre : ${titreVal}
Description : ${descVal}`);
        // Fermer
        closeModal();
    });
    // 12) Initial check
    checkFormValidity();
}
