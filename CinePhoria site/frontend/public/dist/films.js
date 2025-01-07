"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function chargerFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('http://localhost:3000/api/films');
            const films = yield response.json();
            const container = document.getElementById('films-container');
            if (!container)
                return;
            container.innerHTML = '';
            films.forEach((film) => {
                const card = document.createElement('div');
                card.classList.add('filmsreservation__film');
                card.innerHTML = `
          <div class="film__cardreservation"> <!-- Card pour chaque film-->
                        <div class="cardreservation__image">
                            <img src="assets/static/${film.imageFilm1024}" class="cardreservation__image-img"
                                alt="Affiche du film ${film.titleFilm}">
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
        }
        catch (error) {
            console.error('Erreur lors du chargement des films', error);
        }
    });
}
document.addEventListener('DOMContentLoaded', chargerFilms);
