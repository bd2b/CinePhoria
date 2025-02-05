var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function chargerCinemaSites() {
    return __awaiter(this, void 0, void 0, function* () {
        const footerElement = document.getElementById('footer');
        if (!footerElement)
            return;
        footerElement.innerHTML = `
  <div class="footer__container">
      <div class="container__legal">
          <a href="#" class="container__legal-a">Mentions légales</a>
              <a href="#" class="container__legal-a">Politique de confidentialité</a>
              <a href="#" class="container__legal-a">&copy; 2024 - Tous droits réservés</a>
      </div>
      
      <div class="container__sites" id="container__sites">  
      </div>
  </div>
  `;
        footerElement.offsetHeight; // Force un reflow
        try {
            const response = yield fetch('http://localhost:3500/api/cinemas');
            const cinemas = yield response.json();
            const container = document.getElementById('container__sites');
            if (!container) {
                console.log("pas de container__sites");
                return;
            }
            ;
            container.innerHTML = '';
            cinemas.forEach((cinema) => {
                const cinemaElement = document.createElement('div');
                cinemaElement.classList.add('container__site');
                cinemaElement.innerHTML = `
            <div class="site__title">
                <img src="assets/camera-150-inverse.png" alt="Logo" class="site__title-img">
                <h1 class="site__title-h1">${cinema.nameCinema}</h1>
            </div>
            <div class="site__adresse">
                <p class="site_adresse-p">${cinema.adresse}<br>${cinema.postalcode} ${cinema.ville}</p>
            </div>
            <div class="site__telephone">
                <img src="assets/tel.svg" class="site__telephone-img">
                <p class="site__telephone-p">${cinema.telCinema}</p>
            </div>
            <div class="site__seance">
                <p class="site__seance-p">${cinema.ligne1}</p>
                <p class="site__seance-p">${cinema.ligne2}</p>
            </div>
        </div>
        `;
                container.appendChild(cinemaElement);
            });
        }
        catch (error) {
            console.error('Erreur lors du chargement des cinemas', error);
        }
    });
}
document.addEventListener('DOMContentLoaded', chargerCinemaSites);
