import { Seance, SeanceInterface } from './shared-models/Seance.js';  // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { getCookie, setCookie } from './Helpers.js';
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD } from './Helpers.js';
import { DataController } from './DataController.js';

// Persistence des données 
let dataController: DataController

/** Chargement ou raffraichissement de la page
 * Au premier chargement une fenetre modale permet de choisir un site, dans ce cas le cookie selectedCinema est positionné avec la valeur choisie
 * Aux chargements on recupère la valeur du cookie
 * On peut changer cette valeur via le dropdown button droit sur le titre
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Traitement de DOMContentLoaded");
  /**
   * Initialisation
   */
  const modal = document.getElementById('modal') as HTMLDivElement | null;
  const dropdownButtons = document.querySelectorAll<HTMLButtonElement>('.titre__filter-dropdown-complexe');
  const dropdownContents = document.querySelectorAll<HTMLDivElement>('.title__filter-button-drowdown-content-complexe');
  const titleLeft = document.getElementById('titleLeft') as HTMLDivElement | null;

  // Fonction de mise à jour l'affichage du bouton du dropdown
  function updateDropdownDisplay(textButton: string): void {
    dropdownButtons.forEach((button) => {
      button.innerHTML = `${textButton} <span class="chevron">▼</span>`;
    });
  }

  // Vérifier si le cookie 'selectedCinema' existe
  let selectedCinema = getCookie('selectedCinema');
  if (!selectedCinema) {
    // Le cookie n'existe pas : on affiche la modale avec l'invite à sélectionner un cinema
    // On construit la page sur le cinema de Paris pour avoir un contenu grisé attrayant
    if (modal) {
      // Mise à jour du titre pour selectionnez un cinema
      updateDropdownDisplay('Selectionnez un cinema');
      modal.classList.add('show'); // Afficher la modale
      // On se positionne sur Paris pour avoir un affichage valide
      dataController = new DataController("Paris");
      await dataController.chargerDepuisAPI();
    }
  } else {
    // Le cookie existe on initialise le dataController
    dataController = new DataController(selectedCinema);
    // Chargement des données via API si la restore du cache ne s'est pas faite dans l'initialisation
    if (dataController.allSeances.length === 0) {
      await dataController.chargerDepuisAPI();
    }
    // Mettre à jour l'affichage initial du dropdown sur le composant titre
    updateDropdownDisplay("Changer de cinema");

    // Mise à jour du titre
    if (titleLeft) {
      titleLeft.innerText = `Réservez au CinePhoria de ${selectedCinema}`;
    }
  }
  // Mise a jour de la page
  updateContentPage(dataController);

  // Verification dataController
  console.log(`dataController.nameCinema = ${dataController.nameCinema} nombre de séances = ${dataController.allSeances.length}`);

  // Définitiion des interactions dans les dropdowns (celui de la modale ou celui du titre droit)
  dropdownContents.forEach((content) => {
    const links = content.querySelectorAll<HTMLAnchorElement>('a');
    links.forEach((link) => {
      link.addEventListener('click', async (event: Event) => {
        event.preventDefault();
        const cinema = link.textContent?.trim();
        if (cinema) {
          console.log("1 - Nouvelle valeur de cinema = ", cinema);
          // Stocker dans le cookie pour 30 jours
          setCookie('selectedCinema', cinema, 30); 
          // Mettre à jour l'affichage du bouton
          updateDropdownDisplay("Changez de cinema"); 
          // Mettre à jour le titre droit
          if (titleLeft) {
            titleLeft.innerText = `Réservez au CinePhoria de ${cinema}`; 
          }
          // Mettre à jour le dataController
          dataController.nameCinema = cinema;

          // Chargement des données
          await dataController.chargerDepuisAPI();
          
          // Mise à jour de la page
          updateContentPage(dataController);

          // Fermeture de la modale
          if (modal) {
            console.log("2 - Fermeture de la modale ");
            modal.classList.remove('show'); // Fermer la modale si elle est ouverte
          }
          console.log(`3 - Fin du changement de cinéma : ${cinema}`);
        }
      });
    });
  });
});

/**
 * Fonction de mise à jour de la page
 * @param dataController 
 * @returns rien
 */
async function updateContentPage(dataController: DataController) {

  console.log("UCP 1 - Update content page");
  // Identifier le film par defaut
  const filmSeancesCandidat = trouverFilmSeancesCandidat(dataController);
  if (!filmSeancesCandidat) return;

  console.log("UCP 2 - Film par defaut = ", filmSeancesCandidat[0].titleFilm, " Nombre de séances", filmSeancesCandidat.length, " Date : ", formatDateLocalYYYYMMDD(new Date(filmSeancesCandidat[0].dateJour || '')));

  const seanceData = filmSeancesCandidat.map(seance => ({
    titre: seance.titleFilm,
    salle: seance.nameSalle,
    date: seance.dateJour,
    heureDebut: seance.hourBeginHHSMM
  }));
  console.log("UCP 3 - Liste des séances du film candidat = ", seanceData);


  // Afficher la liste de tous les films
  afficherListeFilms(dataController, filmSeancesCandidat[0].filmId || '');
  console.log("UCP 4 - Liste des films affichés");
  // Afficher les détails du film selectionné
  afficherDetailsFilm(dataController, filmSeancesCandidat[0].filmId || '');
  console.log("UCP 5 - Detail du film selectionné affichés");
  // Composer la ligne de tabulation du panel de choix des séances
  afficherSemaines(dataController, filmSeancesCandidat[0].filmId || '');
  console.log("UCP 6 - Lignes de tabulation des jours affichées");
  // Afficher les séances du jour pour le film sélectionné
  afficherSeancesDuJour(dataController, filmSeancesCandidat[0].filmId || '', new Date(filmSeancesCandidat[0].dateJour || ''));
  console.log(`UCP 7 - Séances affichées pour ${filmSeancesCandidat[0].titleFilm} le ${new Date(filmSeancesCandidat[0].dateJour || '')}`);
}

/**
* Trouve un film « le plus récent + meilleure note » à partir d'un tableau de séances
* On retourne une séance représentative de ce film
* On se sert de ce film si on n'en a pas selectionné un depuis la page visiteur
*/
function trouverFilmSeancesCandidat(dataController: DataController): Seance[] {

  const filmsDuJour = dataController.filmsJour();
  console.log("Debut affichage de la liste : ", filmsDuJour.length);
  if (filmsDuJour.length === 0) {
    console.error("filmsDuJour est vide");
  }

  // Trouver le film avec dateSortieCinePhoria la plus récente et la meilleure note
  const filmTop = filmsDuJour.reduce((bestFilm, currentFilm) => {
    const bestDate = bestFilm.dateSortieCinePhoria ? new Date(bestFilm.dateSortieCinePhoria) : new Date(0);
    const currentDate = currentFilm.dateSortieCinePhoria ? new Date(currentFilm.dateSortieCinePhoria) : new Date(0);

    if (
      currentDate > bestDate ||
      (currentDate.getTime() === bestDate.getTime() && (currentFilm.note || 0) > (bestFilm.note || 0))
    ) {
      return currentFilm;
    }
    return bestFilm;
  }, filmsDuJour[0]);
  return dataController.seancesFilmJour(filmTop.id)

}


/**
* Affiche la liste des films dans la zone .reservation__listFilms 
*/
function afficherListeFilms(dataController: DataController, filmIdSelected: string): void {
  const container = document.querySelector('.reservation__listFilms');
  if (!container) return;

  // Extraire les films uniques
  const filmsUniques = dataController.allFilms;
  const seances = dataController.seancesFutures;
  console.log("Nombre de films dans la liste : ", filmsUniques.length, " nombre de seances =", seances.length);

  container.innerHTML = '';
  filmsUniques.forEach((film) => {
    const divCard = document.createElement('div');
    divCard.classList.add('listFilms__simpleCard');
    // On met un eventListener pour changer de film sélectionné, etc.
    divCard.addEventListener('click', () => {
      // afficherSeancesDuJour(allSeances, filmSeance);
      // ... afficher détails du film, etc.
    });

    // Créer l'image
    const img = document.createElement('img');
    img.classList.add('listFilms__simpleCard-img');
    img.src = "assets/static/" + film.imageFilm128;
    img.alt = film.titleFilm ?? 'Affiche';

    // Titre
    const pTitre = document.createElement('p');
    pTitre.classList.add('listFilms__simpleCard-p');
    pTitre.textContent = film.titleFilm || '';

    // Ajouter au DOM
    divCard.appendChild(img);
    divCard.appendChild(pTitre);

    // Mettre en surbrillance si c'est le film "cible"
    if (film.id === filmIdSelected) {
      divCard.style.border = '2px solid gray';
    }
    container.appendChild(divCard);
  });
}

/**
 * Affiche les détails d'un film dans la zone .reservation__detailFilm
 * @param dataController L'objet gérant les données (dont la liste des films)
 * @param filmId L'identifiant du film à afficher
 */
function afficherDetailsFilm(
  dataController: DataController,
  filmId: string
): void {
  const container = document.querySelector('.reservation__detailFilm');
  if (!container) return;

  const film = dataController.allFilms.find((f) => f.id === filmId);
  if (!film) {
    container.innerHTML = '<p>Film introuvable.</p>';
    return;
  }

  container.innerHTML = `
    <div class="detailFilm__twocolumns">
      <div class="twocolumns__left">
        <img src="./assets/static/${film.imageFilm1024 ?? ''}" alt="Affiche" class="twocolumns__left-img">
        <button class="twocolumns__left-button-bo" id="openModal">Bande Annonce</button>
      </div>
      <div class="twocolumns__right">
        <p class="right__title-p">${film.titleFilm}</p>
        <div class="right__caractFilm">
          <p class="caractFilm__genre-p">${film.genreArray ?? ''}</p>
          <p class="caractFilm__duree-p">${film.duration ?? ''}</p>
          <p class="caractFilm__public-p">${film.categorySeeing ?? ''}</p>
        </div>
        <p class="right__description-p">${film.filmDescription ?? ''}</p>
        <p class="right__author-p">${film.filmAuthor ?? ''}</p>
        <p class="right__distribution">${film.filmDistribution ?? ''}</p>
      </div>
    </div>
  `;
  /* Configuration du bouton d'affichage de la bande annonce */
  /* Bouton dans le corps HTML */
  const openModalBtn = container.querySelector<HTMLButtonElement>('.twocolumns__left-button-bo');
  /* div de la modal dans le HTML */
  const modal = document.getElementById('videoModal') as HTMLDivElement | null;
  const closeModalBtn = modal?.querySelector('.closeyoutube') as HTMLButtonElement | null;
  const youtubeVideo = document.getElementById('youtubeVideo') as HTMLIFrameElement | null;

  // const youtubeUrl = encodeURI(film.linkBO?.trim() ?? '');
  const youtubeUrlDynamique = `${film.linkBO}?autoplay=1`;;
  console.log("URL dynamique = ", youtubeUrlDynamique);


  if (openModalBtn && modal && closeModalBtn && youtubeVideo && youtubeUrlDynamique) {
    openModalBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      youtubeVideo.src = youtubeUrlDynamique;
      //  youtubeVideo.src ='https://www.youtube.com/embed/Tkej_ULljR8?autoplay=1';
      console.log("URL utilisée = ", youtubeVideo.src)
    });

    const closeModal = () => {
      modal.style.display = 'none';
      youtubeVideo.src = '';
    };

    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event: MouseEvent) => {
      if (event.target === modal) closeModal();
    });
  } else {
    console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal sont introuvables.');
  }
}

/**
* Affiche les onglets de la semaine dans la div .panel__tabs
* @param dateDebut Date de début (par défaut : aujourd'hui)
* @param isInitial Indique si c'est la première fois (affichage jusqu'au mardi)
*/
function afficherSemaines(dataController: DataController, selectedFilmId: string, dateDebut: Date = new Date(), isInitial = true): void {
  const panelTabs = document.querySelector('.panel__tabs');
  if (!panelTabs) return;

  // Vider le contenu
  panelTabs.innerHTML = '';

  // Dates localisées à midi, pour éviter le décalage de fuseau horaire
  const dAujourdhui = creerDateLocale(new Date());
  const dDebut = creerDateLocale(dateDebut);

  // Calcul de la date de fin : 
  //   - Soit jusqu'au mardi suivant (cas initial)
  //   - Soit +6 jours (7 jours) dans les autres cas
  const finAffichage = isInitial
    ? dateProchainMardi(dAujourdhui)
    : ajouterJours(dDebut, 6);

  // === Bouton "Avant" ===
  // On ne l’affiche pas pour le cas initial
  // Et seulement si la dateDebut est postérieure à aujourd’hui
  if (!isInitial && dDebut.getTime() > dAujourdhui.getTime()) {
    const avant = document.createElement('p');
    avant.classList.add('tabs__tab-p', 'tabs__tab-nav-p', 'tabs__tab-nav-prec-p');
    avant.textContent = 'Avant';
    avant.addEventListener('click', () => {
      const dateAvant = ajouterJours(dDebut, -7);
      // Si on revient sur ou avant aujourd’hui, on repasse en mode initial
      if (dateAvant.getTime() <= dAujourdhui.getTime()) {
        afficherSemaines(dataController, selectedFilmId, dAujourdhui, true);
      } else {
        afficherSemaines(dataController, selectedFilmId, dateAvant, false);
      }
    });
    panelTabs.appendChild(avant);
  }

  // === Boucle d’affichage des jours ===
  let current = new Date(dDebut.getTime()); // copie
  while (current.getTime() <= finAffichage.getTime()) {
    // On n’affiche jamais avant aujourd’hui
    if (current.getTime() >= dAujourdhui.getTime()) {
      const jourItem = document.createElement('p');
      jourItem.classList.add('tabs__tab-p', 'tabs__tab-day-p', 'tabs__tab-day-unselected-p');

      jourItem.textContent = formatDateJJMM(current);

      // Capturer la date dans une closure pour éviter le décalage
      const dateForHandler = new Date(current.getTime());
      jourItem.addEventListener('click', () => {
        afficherSeancesDuJour(dataController, selectedFilmId, dateForHandler);
      });

      panelTabs.appendChild(jourItem);
    }
    // Passer au jour suivant, toujours en local
    current = ajouterJours(current, 1);
  }

  // === Bouton "Après" ===
  const apres = document.createElement('p');
  apres.classList.add('tabs__tab-p', 'tabs__tab-nav-p', 'tabs__tab-nav-suiv-p');
  apres.textContent = 'Après';
  apres.addEventListener('click', () => {
    // Début de la semaine suivante = finAffichage + 1
    const dateApres = ajouterJours(finAffichage, 1);
    afficherSemaines(dataController, selectedFilmId, dateApres, false);
  });
  panelTabs.appendChild(apres);
}



/**
* Affiche la liste des séances dans la zone .panel__choix .panel__seances
* pour un filmId donné à une date précise.
*/
function afficherSeancesDuJour(
  dataController: DataController,
  filmId: string,
  dateSelectionnee: Date
): void {
  // Conteneur dans lequel on va injecter les cartes
  const panelChoix = document.querySelector('.panel__seances');
  if (!panelChoix) return;

  // Vider le contenu de la div
  panelChoix.innerHTML = '';

  // Filtrer les séances du film sélectionné pour la date choisie
  const seancesFilmDuJour = dataController.seancesFilmJour(filmId, dateSelectionnee);

  // Si aucune séance n'est trouvée, afficher le message d'absence
  if (seancesFilmDuJour.length === 0) {
    // Récupérer au moins une séance du film pour accéder au titre / nom du cinéma (sinon valeur par défaut)
    const filmSeance = dataController.allSeances.find(s => s.filmId === filmId);
    const filmTitle = filmSeance?.titleFilm ?? 'Film inconnu';
    const nameCinema = filmSeance?.nameCinema ?? 'Cinéma inconnu';

    const noSeanceMsg = document.createElement('p');
    noSeanceMsg.textContent = `Pas de séance pour ${filmTitle} au cinéma ${nameCinema} ce jour.`;
    panelChoix.appendChild(noSeanceMsg);
    return;
  }

  // Générer les cartes de séances
  console.log("Film = ", seancesFilmDuJour[0].titleFilm, " / nombre de seances = ", seancesFilmDuJour.length, " / date = ", formatDateLocalYYYYMMDD(dateSelectionnee));
  seancesFilmDuJour.forEach(seance => {
    const card = document.createElement('div');
    card.classList.add('seances__cardseance');

    // === Horaire ===
    const horaireDiv = document.createElement('div');
    horaireDiv.classList.add('cardseance__horaire');
    const pHourBegin = document.createElement('p');
    pHourBegin.classList.add('horaire__hour', 'horaire__hour-begin-p');
    pHourBegin.textContent = seance.hourBeginHHSMM || '';
    const pHourEnd = document.createElement('p');
    pHourEnd.classList.add('horaire__hour', 'horaire__hour-end-p');
    pHourEnd.textContent = seance.hourEndHHSMM || '';
    horaireDiv.appendChild(pHourBegin);
    horaireDiv.appendChild(pHourEnd);

    // === Salle + date ===
    const dateSalleDiv = document.createElement('div');
    dateSalleDiv.classList.add('cardseance__datesalle');

    const dateInnerDiv = document.createElement('div');
    dateInnerDiv.classList.add('datesalle__date');
    const pMonth = document.createElement('p');
    pMonth.classList.add('date__month-p');
    pMonth.textContent = extraireMoisLettre(dateSelectionnee); // "JAN", "FEV"...
    const pDay = document.createElement('p');
    pDay.classList.add('date__day-p');
    pDay.textContent = String(dateSelectionnee.getDate());

    dateInnerDiv.appendChild(pMonth);
    dateInnerDiv.appendChild(pDay);

    const salleP = document.createElement('p');
    salleP.classList.add('datesalle__salle-p');
    salleP.textContent = seance.nameSalle ?? 'Salle ?';

    dateSalleDiv.appendChild(dateInnerDiv);
    dateSalleDiv.appendChild(salleP);

    // === Qualité/VO/VF ===
    const qualiteDiv = document.createElement('div');
    qualiteDiv.classList.add('cardseance__qualitebo');
    const imgQualite = document.createElement('img');
    imgQualite.classList.add('qualitebo-qualite-img');
    imgQualite.src = `assets/${seance.qualite}.png`;
    const pBo = document.createElement('p');
    pBo.classList.add('qualitebo-bo-p');
    pBo.textContent = seance.bo ?? 'VF';

    qualiteDiv.appendChild(imgQualite);
    qualiteDiv.appendChild(pBo);

    // === Assemblage final de la carte ===
    card.appendChild(horaireDiv);
    card.appendChild(dateSalleDiv);
    card.appendChild(qualiteDiv);

    // Au clic sur la séance => exemple : basculer sur panel__reserve
    card.addEventListener('click', () => {
      console.log(`Séance cliquée : ${seance.seanceId}`);
      // basculerPanelReserve(seance);
    });

    panelChoix.appendChild(card);
  });
}


