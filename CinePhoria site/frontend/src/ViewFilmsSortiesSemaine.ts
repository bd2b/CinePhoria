import { getCookie , setCookie } from "./Helpers.js";
import { dataController } from "./DataController.js";

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
  filmDescription: string;
  filmAuthor?: string;
  filmDistribution?: string;

  imageFilm128?: string;
  imageFilm1024: string;

}

export async function onLoadVisiteur() {
  console.log(" ===>  onLoadVisiteur");
  // On initialise le dataController si il est vide
  if (dataController.allSeances.length === 0 ) await dataController.init()
  



  const container = document.getElementById('films-container');
    if (!container) return;
    container.innerHTML = '';
  try {
    const response = await fetch('http://localhost:3500/api/films/sorties');
    let films: Film[] = await response.json();
    if (films.length === 0) {
      const card = document.createElement('div');
      card.classList.add('filmsreservation__film');

      card.innerHTML = `
          <div class="film__cardreservation"> <!-- Card pour chaque film-->
            <div class="cardreservation__description">
                <h2 class="cardreservation__description-title">Pas de film sortie la semaine précédente : affichage de tous les films présent au catalogue</h2>
            </div>
          </div>
        `;
      container.appendChild(card);

      // Chargement de tous les films
      const response = await fetch('http://localhost:3500/api/films');
      films = await response.json();
    }

    films.forEach((film) => {
      const card = document.createElement('div');
      card.classList.add('filmsreservation__film');

      card.innerHTML = `
          <div class="film__cardreservation"> <!-- Card pour chaque film-->
            <div class="cardreservation__image">
              <img src="assets/static/${film.imageFilm1024}" class="cardreservation__image-img" alt="Affiche du film ${film.titleFilm}">
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
    });
  } catch (error) {
    console.error('Erreur lors du chargement des films', error);
  }
}
