interface Cinema {
    nameCinema : string;
    adresse    : string;
    ville      : string;
    postalcode : string;
    emailCinema : string;
    telCinema  : string;
    ligne1     : string;
    ligne2     : string;
}

async function chargerCinemaSites() {
  
  const footerElement = document.getElementById('footer');
  if (!footerElement) return;
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
      const response = await fetch('http://localhost:3000/api/cinemas');
      const cinemas: Cinema[] = await response.json();
  
      const container = document.getElementById('container__sites');
      if (!container) { 
        console.log("pas de container__sites")
        return 

      };
  
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
  } catch (error) {
    console.error('Erreur lors du chargement des cinemas', error);
  }
}




document.addEventListener('DOMContentLoaded', chargerCinemaSites);