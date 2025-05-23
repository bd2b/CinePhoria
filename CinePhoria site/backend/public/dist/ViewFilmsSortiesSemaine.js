var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dataController } from "./DataController.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { imageFilm } from "./Helpers.js";
export function onLoadVisiteur() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(" ===>  onLoadVisiteur");
        // On initialise le dataController si il est vide
        if (dataController.allSeances.length === 0)
            yield dataController.init();
        // On charge menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        const container = document.getElementById('films-container');
        if (!container)
            return;
        container.innerHTML = '';
        try {
            let films = dataController.filmsSortiesRecentes;
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
                films = dataController.films;
            }
            films.forEach((film) => {
                const card = document.createElement('div');
                card.classList.add('filmsreservation__film');
                card.innerHTML = '';
                card.innerHTML = `
          <div class="film__cardreservation"> <!-- Card pour chaque film-->
            <div class="cardreservation__image">
              <img src="${imageFilm(film.imageFilm1024)}" class="cardreservation__image-img" alt="Affiche du film ${film.titleFilm}">
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
                const detailBtn = card.querySelector('.cardreservation__reserver-button');
                if (detailBtn) {
                    detailBtn.removeEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () { }));
                    detailBtn.addEventListener('click', (evt) => __awaiter(this, void 0, void 0, function* () {
                        evt.preventDefault();
                        evt.stopPropagation();
                        // On positionne les données pour afficher le film dans la page film
                        dataController.selectedFilmUUID = film.id || '';
                        console.log("Visiteur ", film.id);
                        dataController.filterNameCinema = 'all';
                        yield dataController.sauverEtatGlobal();
                        window.location.href = 'films.html';
                    }));
                }
                ;
            });
        }
        catch (error) {
            console.error('Erreur lors du chargement des films', error);
        }
    });
}
