import { getCookie, setCookie } from "./Helpers.js";
import { dataController } from "./DataController.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { imageFilm } from "./Helpers.js";

interface Film {
  id: string;
  titleFilm: string;
  filmPitch: string;

  genreArray?: string;
  duration?: string;
  linkBO?: string;
  categorySeeing?: string;

  note: number;
  isCoupDeCoeur: boolean;
  isActiveForNewSeances: boolean;
  filmDescription: string;
  filmAuthor?: string;
  filmDistribution?: string;

  imageFilm128?: string;
  imageFilm1024: string;

}

export async function onLoadVisiteur() {
  console.log(" ===>  onLoadVisiteur");

  // On initialise le dataController si il est vide
  if (dataController.allSeances.length === 0) await dataController.init()

  // On charge menu et footer
  await chargerMenu(); // Header
  await chargerCinemaSites() // Footer

  const container = document.getElementById('films-container');
  if (!container) return;
  container.innerHTML = '';
  try {
    let { films, message } = dataController.filmsSortiesRecentes;
    const titleVisiteur = document.querySelector('.title__left-h1');
    if (titleVisiteur) titleVisiteur.textContent = message;


    films.forEach((film) => {
      const card = document.createElement('div');
      card.classList.add('filmsreservation__film');
      card.innerHTML = '';

      card.innerHTML = `
          <div class="film__cardreservation"> <!-- Card pour chaque film-->
            <div class="cardreservation__image">
              <img src="${imageFilm(film.imageFilm1024!)}" class="cardreservation__image-img" alt="Affiche du film ${film.titleFilm}">
            </div>
            <div class="cardreservation__description">
                <h2 class="cardreservation__description-title">${film.titleFilm}</h2>
                <div class="description__evaluation">
                ${film.isCoupDeCoeur ? '<div class="evaluation__coupdecoeur"><p class="evaluation__coupdecoeur-p">Coup de coeur</p><img src="assets/heart.svg" alt="Coeur" class="evaluation__coupdecoeur-img"></div>' : ''}
                    <div class="evaluation__note">
                        <p class="evaluation__note-p">Avis : ${film.note} / 5</p>
                    </div>
                </div>
                <div class="description__pitch">
                    <p class="description__pitch-p">${film.filmPitch}</p>
                </div>
            </div>
            <div class="cardreservation__reserver">
                <button class="cardreservation__reserver-button">Réservez maintenant</button>
            </div>
          </div>
        `;
      container.appendChild(card);

      // Bouton detail du film
      const detailBtn = card.querySelector('.cardreservation__reserver-button') as HTMLButtonElement | null;
      if (detailBtn) {
        detailBtn.removeEventListener('click', async (evt) => { });
        detailBtn.addEventListener('click', async (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          // On positionne les données pour afficher le film dans la page film
          dataController.selectedFilmUUID = film.id || '';
          console.log("Visiteur ", film.id)
          dataController.filterNameCinema = 'all';
          await dataController.sauverEtatGlobal();

          window.location.href = 'films.html';
        });

      };
      // Modale sur affiche de film
      const imageEl = card.querySelector('.cardreservation__image-img') as HTMLImageElement | null;
      if (imageEl) {
        imageEl.style.cursor = 'pointer';
        imageEl.addEventListener('click', async (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          const modalId = `modalyoutube-${film.id}`;
          let modal = document.getElementById(modalId) as HTMLDivElement | null;
          if (!modal) {
              modal = document.createElement('div');
              modal.id = modalId;
              modal.className = 'modalyoutube';
              document.body.appendChild(modal);
          }
          if (film.linkBO) initModalBandeAnnonce(film.linkBO, modal);
        });
      }
    });
  } catch (error) {
    console.error('Erreur lors du chargement des films', error);

  }
}

/* -------------------------------------------
   Modal Bande-Annonce
------------------------------------------- */

function initModalBandeAnnonce(linkBO: string, divModal: HTMLDivElement): void {

  const modalLocalHTML = `
        <div class="modalyoutube-content">
            <span class="closeyoutube">&times;</span>
            <!-- Vidéo YouTube -->
            <iframe id="youtubeVideo" width="560" height="315" src="${linkBO}?autoplay=1" title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
            </iframe>
        </div>
  `
  
  divModal.innerHTML = '';
  divModal.innerHTML = modalLocalHTML;
  
  /* Mise en place Activation de la modal */
  const closeModalBtn = divModal?.querySelector('.closeyoutube') as HTMLButtonElement | null;

  if (divModal && closeModalBtn) {
    
    const closeModal = () => {
      divModal.style.display = 'none';
      const iframe = divModal.querySelector('iframe');
      if (iframe) iframe.src = '';
    };

    closeModalBtn.removeEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);

    divModal.addEventListener('click', (event: MouseEvent) => {
      if (event.target === divModal) closeModal();
    });

    divModal.style.display = 'flex';
  }
}


//**Version avec bouton
// <div class="cardreservation__reserver">
//                 <button class="cardreservation__reserver-button">Réservez maintenant</button>
//             </div>
//             <div class="cardreservation__reserver cardreservation__reserver-modal">
//                 <button class="cardreservation__bo-button">Bande Annonce</button>
//             </div>
// // Bouton modal du film
// const boBtn = card.querySelector('.cardreservation__bo-button') as HTMLButtonElement | null;
// if (boBtn) {
//   boBtn.removeEventListener('click', async (evt) => { });
//   boBtn.addEventListener('click', async (evt) => {
//     evt.preventDefault();
//     evt.stopPropagation();
//     const modalId = `modalyoutube-${film.id}`;
//     let modal = document.getElementById(modalId) as HTMLDivElement | null;
//     if (!modal) {
//         modal = document.createElement('div');
//         modal.id = modalId;
//         modal.className = 'modalyoutube';
//         document.body.appendChild(modal);
//     }
//     if (film.linkBO) initModalBandeAnnonce(film.linkBO, modal)
//   }); */