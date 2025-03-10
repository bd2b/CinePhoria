import { dataController } from './DataController.js';
import { validateEmail } from './Helpers.js';
import { userDataController } from './DataControllerUser.js';
import { Mail } from './shared-models/Mail.js';
import { sendMailApi } from './NetworkController.js';

export function onClickContact() {
  // 1) Vérifier si un div#modal-contact existe déjà
  let modal = document.getElementById('modal-contact') as HTMLDivElement | null;
  if (!modal) {
    // Le créer s’il n’existe pas
    modal = document.createElement('div');
    modal.id = 'modal-contact';
    modal.classList.add('modal');
    document.body.appendChild(modal);
  }


  if (!modal) return;

  const mailCourant = userDataController.compte()?.email;
  let mailValue = '';

  if (mailCourant && validateEmail(mailCourant)) {
    mailValue = mailCourant;  // On l’utilise si c’est défini ET valide
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
  modal.style.display = 'flex';  // ou 'block' selon vos styles

  // 6) Sélection des éléments
  const closeModalBtn = document.getElementById('close-contact') as HTMLButtonElement | null;
  const mailInput = document.getElementById('contact-mail') as HTMLInputElement | null;
  const titreInput = document.getElementById('contact-titre') as HTMLInputElement | null;
  const descInput = document.getElementById('contact-desc') as HTMLTextAreaElement | null;
  const annulerBtn = document.getElementById('contactAnnulerBtn') as HTMLButtonElement | null;
  const envoyerBtn = document.getElementById('contactEnvoyerBtn') as HTMLButtonElement | null;
  const errorSpan = document.getElementById('contact-error') as HTMLSpanElement | null;

  // Fonction pour fermer la modale
  const closeModal = () => {
    modal.style.display = 'none';
  };

  // 7) Vérifier l’état du formulaire et activer/désactiver le bouton
  function checkFormValidity() {
    // a) Vérifier le mail (facultatif). S’il y a un contenu => validateEmail
    const mailVal = mailInput?.value.trim() || '';
    if (mailVal && !validateEmail(mailVal)) {
      // Erreur possible, mais la consigne : “mail est facultatif”.
      // On peut juste avertir si mal formé => le bouton n’est pas activé si c’est incorrect.
      showError("Veuillez indiquer un email valide si vous souhaitez un retour.");
      setButtonDisabled(true);
      return;
    }

    // b) Vérifier le titre
    const titreVal = titreInput?.value.trim() || '';
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
    const descVal = descInput?.value.trim() || '';
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

  function showError(msg: string) {
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
  function setButtonDisabled(dis: boolean) {
    if (!envoyerBtn) return;
    if (dis) {
      envoyerBtn.classList.add('inactif');
      envoyerBtn.disabled = true;
    } else {
      envoyerBtn.classList.remove('inactif');
      envoyerBtn.disabled = false;
    }
  }

  // 8) Brancher la vérification sur les events input
  mailInput?.addEventListener('input', checkFormValidity);
  titreInput?.addEventListener('input', checkFormValidity);
  descInput?.addEventListener('input', checkFormValidity);

  // 9) Fermer la modale avec (X)
  closeModalBtn?.addEventListener('click', closeModal);

  // Fermer la modale en cliquant en dehors
  modal.addEventListener('click', (event: MouseEvent) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // 10) Bouton Annuler
  annulerBtn?.addEventListener('click', closeModal);

  // 11) Bouton Envoyer la demande
  envoyerBtn?.addEventListener('click', async () => {
    // Tout est déjà validé dans checkFormValidity
    // => On affiche une alert ou on appelle un code d’envoi

    const mailVal = mailInput?.value.trim() || '';
    const titreVal = titreInput?.value.trim() || '';
    const descVal = descInput?.value.trim() || '';

    const mail = new Mail(mailVal, titreVal, descVal, "false");
    const resultat = await sendMailApi(mail);
    console.log("Resultat envoi mail = " + resultat);

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