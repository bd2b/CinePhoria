var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Seance } from './shared-models/Seance.js'; // extension en .js car le compilateur ne fait pas l'ajout de l'extension
/** Fonction de selection du cinema
 * Au premier chargement une fenetre modale permet de choisir un site, dans ce cas le cookie selectedCinema est positionné avec la valeur choisie
 * Aux chargements on recupère la valeur du cookie
 * On peut changer cette valeur via le dropdown button droit sur le titre
 */
// Fonction pour obtenir la valeur d'un cookie
function getCookie(name) {
    var _a;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
}
// Fonction pour définir un cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()}`;
}
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const dropdownButtons = document.querySelectorAll('.titre__filter-dropdown-complexe');
    const dropdownContents = document.querySelectorAll('.title__filter-button-drowdown-content-complexe');
    // Mettre à jour l'affichage du bouton du dropdown
    function updateDropdownDisplay(selectedCinema) {
        dropdownButtons.forEach((button) => {
            button.innerHTML = `${selectedCinema} <span class="chevron">▼</span>`;
        });
    }
    // Vérifier si le cookie 'selectedCinema' existe
    let selectedCinema = getCookie('selectedCinema');
    if (!selectedCinema) {
        selectedCinema = 'Non sélectionné'; // Valeur par défaut si aucun cinéma n'est sélectionné
        if (modal) {
            modal.classList.add('show'); // Afficher la modale si aucun cinéma n'est sélectionné
        }
    }
    // Mettre à jour l'affichage initial du dropdown
    if (selectedCinema) {
        updateDropdownDisplay(selectedCinema);
    }
    // Gestion des interactions dans tous les dropdowns
    dropdownContents.forEach((content) => {
        const links = content.querySelectorAll('a');
        links.forEach((link) => {
            link.addEventListener('click', (event) => {
                var _a;
                event.preventDefault();
                const cinema = (_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                if (cinema) {
                    setCookie('selectedCinema', cinema, 30); // Stocker dans le cookie pour 30 jours
                    selectedCinema = cinema;
                    updateDropdownDisplay(cinema); // Mettre à jour l'affichage
                    if (modal) {
                        modal.classList.remove('show'); // Fermer la modale si elle est ouverte
                    }
                    console.log(`Cinéma sélectionné : ${cinema}`);
                }
            });
        });
    });
});
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const selectedCinema = (_a = getCookie('selectedCinema')) !== null && _a !== void 0 ? _a : 'Paris';
    try {
        console.log("Appel = ", `http://localhost:3000/api/seances/filter?cinemasList="${selectedCinema}"`);
        const response = yield fetch(`http://localhost:3000/api/seances/filter?cinemasList="${selectedCinema}"`);
        const rawData = yield response.json();
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir en instances de Seance
        const allSeances = rawData.map(d => new Seance(d));
        console.log("Nombre total de seance sur le cinema = ", allSeances.length);
        // Filtre pour ne prendre que les séances qui ont lieu à la date du jour
        const allSeancesFutures = allSeances.filter(s => new Date(s.dateJour || '') >= new Date());
        console.log("Nombre total de seance dans le futur = ", allSeancesFutures.length);
        // Trouver le film candidat
        const filmSeanceCandidat = trouverFilmSeanceCandidat(allSeancesFutures);
        if (!filmSeanceCandidat)
            return;
        console.log("Film candidat = ", filmSeanceCandidat.titleFilm);
        const seancesDuFilm = allSeancesFutures.filter(s => s.filmId === filmSeanceCandidat.filmId && formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(new Date()));
        console.log("Seance du film candidat aujourd'hui", seancesDuFilm.length, formatDateLocalYYYYMMDD(new Date()), formatDateLocalYYYYMMDD(new Date(filmSeanceCandidat.dateJour || '')));
        const seanceData = seancesDuFilm.map(seance => ({
            titre: seance.titleFilm,
            salle: seance.nameSalle,
            date: seance.dateJour,
            heureDebut: seance.hourBeginHHSMM
        }));
        console.log(seanceData);
        // Afficher la liste de tous les films
        afficherListeFilms(allSeances, filmSeanceCandidat);
        // Composer la ligne de tabulation
        afficherSemaines(allSeances, filmSeanceCandidat.filmId || '');
        // Afficher les séances du jour pour le film sélectionné
        //  afficherSeancesDuJour(allSeances, filmCandidat);
    }
    catch (error) {
        console.error('Erreur lors du chargement des données : ', error);
    }
}));
/**
* Trouve un film « le plus récent + meilleure note » à partir d'un tableau de séances
* On retourne une séance représentative de ce film
* On se sert de ce film si on n'en a pas selectionné un depuis la page visiteur
*/
function trouverFilmSeanceCandidat(allSeances) {
    // On filtre les séances du jour pour les proposer à la date du jour 
    const seancesDuJour = allSeances.filter(s => formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(new Date()));
    console.log("Nombre de séances examinées pour trouver le film = ", seancesDuJour.length);
    // On construit une Map regroupant les séance par filmId
    const filmsMap = new Map();
    seancesDuJour.forEach(seance => {
        var _a;
        if (!filmsMap.has(seance.filmId)) {
            filmsMap.set(seance.filmId, []);
        }
        (_a = filmsMap.get(seance.filmId)) === null || _a === void 0 ? void 0 : _a.push(seance);
    });
    // Trouver le film avec dateSortieCinePhoria la plus récente et la meilleure note
    let meilleurFilmSeance;
    filmsMap.forEach((seancesFilm, filmId) => {
        var _a, _b, _c, _d;
        // On suppose toutes les séances du même film ont la même note et la même date de sortie
        const ref = seancesFilm[0];
        const note = parseFloat((_a = ref.note) !== null && _a !== void 0 ? _a : '0');
        const sortie = new Date((_b = ref.dateSortieCinePhoria) !== null && _b !== void 0 ? _b : '1970-01-01').getTime();
        if (!meilleurFilmSeance) {
            meilleurFilmSeance = ref;
            return;
        }
        const noteBest = parseFloat((_c = meilleurFilmSeance.note) !== null && _c !== void 0 ? _c : '0');
        const sortieBest = new Date((_d = meilleurFilmSeance.dateSortieCinePhoria) !== null && _d !== void 0 ? _d : '1970-01-01').getTime();
        // Comparaison : d’abord la date (plus récente), puis la note
        if (sortie > sortieBest) {
            meilleurFilmSeance = ref;
        }
        else if (sortie === sortieBest && note > noteBest) {
            meilleurFilmSeance = ref;
        }
    });
    return meilleurFilmSeance;
}
/**
* Affiche la liste des films dans la zone .reservation__listFilms
* (Ici, on se base sur un simple container, à adapter au besoin)
*/
function afficherListeFilms(allSeances, seanceCible) {
    const container = document.querySelector('.reservation__listFilms');
    if (!container)
        return;
    // Extraire les films uniques
    const filmsUniques = new Map();
    allSeances.forEach(s => {
        if (!filmsUniques.has(s.filmId)) {
            filmsUniques.set(s.filmId, s);
        }
    });
    container.innerHTML = '';
    filmsUniques.forEach((filmSeance) => {
        var _a;
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
        img.src = "assets/static/" + filmSeance.imageFilm128;
        img.alt = (_a = filmSeance.titleFilm) !== null && _a !== void 0 ? _a : 'Affiche';
        // Titre
        const pTitre = document.createElement('p');
        pTitre.classList.add('listFilms__simpleCard-p');
        pTitre.textContent = filmSeance.titleFilm || '';
        // Ajouter au DOM
        divCard.appendChild(img);
        divCard.appendChild(pTitre);
        // Mettre en surbrillance si c'est le film "cible"
        if (filmSeance.filmId === seanceCible.filmId) {
            divCard.style.border = '2px solid gray';
        }
        container.appendChild(divCard);
    });
}
/**
* Affiche la liste des séances dans la zone .panel__choix .panel__seances
* pour un filmId donné à une date précise.
*/
function afficherSeancesDuJour(allSeances, filmId, dateSelectionnee) {
    var _a, _b;
    // Conteneur dans lequel on va injecter les cartes
    const panelChoix = document.querySelector('.panel__seances');
    if (!panelChoix)
        return;
    // Vider le contenu de la div
    panelChoix.innerHTML = '';
    // Convertir la date cliquée au format 'yyyy-mm-dd'
    const dayStr = formatDateLocalYYYYMMDD(dateSelectionnee);
    // Filtrer les séances du film sélectionné pour la date choisie
    // const seancesDuJour = allSeances.filter(s =>
    //   s.filmId === filmId && s.dateJour === dayStr
    // );
    const seancesDuJour = allSeances;
    // Si aucune séance n'est trouvée, afficher le message d'absence
    if (seancesDuJour.length === 0) {
        // Récupérer au moins une séance du film pour accéder au titre / nom du cinéma (sinon valeur par défaut)
        const filmSeance = allSeances.find(s => s.filmId === filmId);
        const filmTitle = (_a = filmSeance === null || filmSeance === void 0 ? void 0 : filmSeance.titleFilm) !== null && _a !== void 0 ? _a : 'Film inconnu';
        const nameCinema = (_b = filmSeance === null || filmSeance === void 0 ? void 0 : filmSeance.nameCinema) !== null && _b !== void 0 ? _b : 'Cinéma inconnu';
        const noSeanceMsg = document.createElement('p');
        noSeanceMsg.textContent = `Pas de séance pour ${filmTitle} au cinéma ${nameCinema} ce jour.`;
        panelChoix.appendChild(noSeanceMsg);
        return;
    }
    // Générer les cartes de séances
    seancesDuJour.forEach(seance => {
        var _a, _b;
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
        salleP.textContent = (_a = seance.nameSalle) !== null && _a !== void 0 ? _a : 'Salle ?';
        dateSalleDiv.appendChild(dateInnerDiv);
        dateSalleDiv.appendChild(salleP);
        // === Qualité/VO/VF ===
        const qualiteDiv = document.createElement('div');
        qualiteDiv.classList.add('cardseance__qualitebo');
        const imgQualite = document.createElement('img');
        imgQualite.classList.add('qualitebo-qualite-img');
        // Choisissez l’icône en fonction de seance.qualite (3D/4K…)
        // Ex: if (seance.qualite === '3D') { imgQualite.src = 'assets/3D.png'; }
        const pBo = document.createElement('p');
        pBo.classList.add('qualitebo-bo-p');
        pBo.textContent = (_b = seance.bo) !== null && _b !== void 0 ? _b : 'VF';
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
/**
 * Petite fonction pour un mois en texte
 */
function extraireMoisLettre(date) {
    // Soit un code "JAN", "FEV", etc. 
    // Soit vous mettez directement le mois numérique "01"
    const monthIndex = date.getMonth(); // 0 = janvier
    const listeMois = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN',
        'JUI', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];
    return listeMois[monthIndex] || '??';
}
/**
* Affiche les onglets de la semaine dans la div .panel__tabs
* @param dateDebut Date de début (par défaut : aujourd'hui)
* @param isInitial Indique si c'est la première fois (affichage jusqu'au mardi)
*/
function afficherSemaines(allSeances, selectedFilmId, dateDebut = new Date(), isInitial = true) {
    const panelTabs = document.querySelector('.panel__tabs');
    if (!panelTabs)
        return;
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
                afficherSemaines(allSeances, selectedFilmId, dAujourdhui, true);
            }
            else {
                afficherSemaines(allSeances, selectedFilmId, dateAvant, false);
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
                console.log(`Jour sélectionné : ${formatDateLocalYYYYMMDD(dateForHandler)}`);
                afficherSeancesDuJour(allSeances, selectedFilmId, dateForHandler);
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
        afficherSemaines(allSeances, selectedFilmId, dateApres, false);
    });
    panelTabs.appendChild(apres);
}
/**
 * Crée une date locale fixée à midi (12h00) pour éviter les décalages de fuseau.
 */
function creerDateLocale(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}
/**
 * Ajoute (ou retire) `nbJours` jours à la date `d` en restant en local (heure fixe à midi).
 */
function ajouterJours(d, nbJours) {
    const tmp = creerDateLocale(d);
    tmp.setDate(tmp.getDate() + nbJours);
    return creerDateLocale(tmp);
}
/**
 * Calcule la date du prochain mardi (y compris s’il s’agit d’aujourd’hui) à partir de `dateRef`.
 */
function dateProchainMardi(dateRef) {
    const d = creerDateLocale(dateRef);
    // Jour de la semaine : 0=dimanche, 1=lundi, 2=mardi, ...
    const day = d.getDay();
    const offset = (2 - day + 7) % 7;
    d.setDate(d.getDate() + offset);
    return creerDateLocale(d);
}
/**
 * Formate la date (locale) au format jj/mm (ex : 09/01)
 */
function formatDateJJMM(date) {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
    return `${day}/${month}`;
}
/**
 * Formate la date (locale) au format yyyy-mm-dd, sans dépendre d’UTC.
 * toISOString() génère souvent un décalage si la zone horaire est négative/positive.
 */
function formatDateLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const rawMonth = date.getMonth() + 1;
    const rawDay = date.getDate();
    const m = rawMonth < 10 ? '0' + rawMonth : String(rawMonth);
    const d = rawDay < 10 ? '0' + rawDay : String(rawDay);
    return `${y}-${m}-${d}`;
}
