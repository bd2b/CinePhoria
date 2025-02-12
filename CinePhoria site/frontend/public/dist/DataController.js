var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * DataController : gestion de la persistence des données
 * On utilise un cache dans le storage qui reçoit l'ensemble des SeancesFilmsSalle du cinema pour tous les cinemas
 * L'initialisation se fait en deux temps car le chargement en asynchrone ne peut se faire dans le constructeur
 * - Le constructeur
 *      positionne le nom du cinema filtré (all est l'ensemble de tous les cinémas)
 *      si le cache existe et est valide (date de moins d'1 heure) charge les données
 *      initialise le tableau des films
 * - Chargement des données déclenché en asynchrone n'importe quelle page utilisatrice
 *      fetch les séances pour le cinema
 *      initialise le tableau des films
 *      sauvegarde dans le storage
 *
 * On dispose des propriétés :
 * - Toutes les séances sur lesquels on a des helpers , séancesFutures, Séances d'un jour pour un film....
 * - Tous les films avec des helpers également
 * Les mêmes données mais filtré selon la valeur de filterNameCinema
 */
import { Seance, TarifQualite } from './shared-models/Seance.js'; // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { Film } from './shared-models/Film.js';
import { ReservationState } from './shared-models/Reservation.js';
import { getCookie, setCookie } from './Helpers.js';
import { ajouterJours, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';
// import { onLoadReservation } from "./ViewReservation.js";
// import { onLoadMesReservations } from "./ViewMesReservations.js";
// import { onLoadVisiteur } from "./ViewFilmsSortiesSemaine.js";
// import { chargerMenu } from './ViewMenu.js';
// import { chargerCinemaSites } from './ViewFooter.js';
export class DataController {
    constructor() {
        this._reservationState = ReservationState.PendingChoiceSeance;
        // Ensemble des données chargées systématiquement
        this._allSeances = [];
        this._tarifQualite = [];
        this._filterGenre = "all"; // Filtre sur tous les genres 
    }
    // 🏆 Variable calculée : retourne les séances filtrées par cinéma
    get seances() {
        if (this.filterNameCinema === 'all') {
            return this._allSeances;
        }
        else {
            return this._allSeances.filter(seance => seance.nameCinema === this._filterNameCinema);
        }
    }
    // 🏆 Variable calculée : retourne les films filtrés par cinéma ayant une séeance dans les 90 jours
    get films() {
        const dateMax = new Date();
        dateMax.setDate((dateMax).getDate() + 90);
        return this.extractFilmsFromSeances(new Date(), dateMax);
    }
    // Variable calculée : retourne tous les genres des films filtrés sur le nom du cinema
    get genreSet() {
        // Pour être dynamique, on va extraire tous les genres dans dataController.allFilms ou allSeances
        // Regrouper dans un set
        const genreSet = new Set();
        dataController.films.forEach((f) => {
            if (f.genreArray) {
                f.genreArray.split(',').forEach((g) => genreSet.add(g.trim()));
            }
        });
        return genreSet;
    }
    // Variable calculee : liste des films filtré sur le cinéma puis sur le genre Genre
    get filmsGenre() {
        let films = this.films;
        if (this._filterGenre !== 'all') {
            films = this.films.filter((f) => {
                if (!f.genreArray)
                    return false;
                const genres = f.genreArray.split(',').map((g) => g.trim().toLowerCase());
                return genres.includes(this._filterGenre.toLowerCase());
            });
        }
        return films;
    }
    // Getter pour reservationState
    get reservationState() {
        return this._reservationState;
    }
    // Setter pour reservationState
    set reservationState(value) {
        console.log("Mise a jour statut reservation = " + value);
        this._reservationState = value;
    }
    // Getter pour toutes les séances de tous les cinemas
    get allSeances() {
        return this._allSeances;
    }
    // Getter pour calculer les séances futures sur le cinema filtre
    get seancesFutures() {
        return this.seances.filter(s => new Date(s.dateJour || '') >= new Date());
    }
    // Getter pour tous les tarifs
    get allTarifQualite() {
        return this._tarifQualite;
    }
    // Getter pour filterNameCinema
    get filterNameCinema() {
        return this._filterNameCinema || "all";
    }
    // Setter pour filterNameCinema
    set filterNameCinema(value) {
        if (value.trim() === '') {
            throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        // On memorise le dernier cinema filté comme cinema selectionné dans la page Reservation
        if (value.trim() !== 'all') {
            this._selectedNameCinema = value.trim();
            console.log("DataC: Cinema selected = ", value);
        }
        else {
            console.log("DataC: Cinema selected = ", this._selectedNameCinema);
        }
        // const isNewCinema = (value !== this._filterNameCinema);
        console.log("DataC: Cinema filter = ", value);
        this._filterNameCinema = value;
        // On sauvegarde le nouvelle configuration
        this.sauverComplet();
    }
    // Getter pour cinema selectionne (non modifiable directement)
    // Getter pour selectedNameCinema
    get selectedNameCinema() {
        return this._selectedNameCinema || "Paris";
    }
    // Getter pour filterGenre
    get filterGenre() {
        return this._filterGenre;
    }
    // Setter pour filterGenre
    set filterGenre(value) {
        this._filterGenre = value;
    }
    // Getter pour selectedFilmUID
    get selectedFilmUUID() {
        return this._selectedFilmUUID || undefined;
    }
    // Setter pour selectedFilmUUID
    set selectedFilmUUID(value) {
        if (!isUUID(value)) {
            throw new Error("L'id du film n'est pas conforme.");
        }
        this._selectedFilmUUID = value;
    }
    // Getter pour selectedFilm
    get selectedFilm() {
        if (this._selectedFilmUUID) {
            return this.filmUUID(this._selectedFilmUUID);
        }
        else {
            console.error("selectedFilm : Film non trouvé, premier film pris");
            return this.films[0]; // ne doit pas se produire
        }
    }
    // Getter pour selectedSeanceDate
    get selectedSeanceDate() {
        return this._selectedSeanceDate || undefined;
    }
    // Setter pour selectedSeanceDate
    set selectedSeanceDate(value) {
        this._selectedSeanceDate = value;
    }
    // Getter pour selectedSeanceUUID
    get selectedSeanceUUID() {
        return this._selectedSeanceUUID || undefined;
    }
    // Setter pour selectedSeanceUUID
    set selectedSeanceUUID(value) {
        this._selectedSeanceUUID = value;
    }
    // Getter pour selectedUtilisateurUUID
    get selectedUtilisateurUUID() {
        return this._selectedUtilisateurUUID || undefined;
    }
    // Setter pour selectedUtilisateurUUID
    set selectedUtilisateurUUID(value) {
        this._selectedUtilisateurUUID = value;
    }
    // Getter pour selectedUtilisateurMail
    get selectedUtilisateurMail() {
        return this._selectedUtilisateurMail || undefined;
    }
    // Setter pour selectedUtilisateurMail
    set selectedUtilisateurMail(value) {
        this._selectedUtilisateurMail = value;
    }
    // Getter pour selectedUtilisateurDisplayName
    get selectedUtilisateurDisplayName() {
        return this._selectedUtilisateurDisplayName || undefined;
    }
    // Setter pour selectedUtilisateurDisplayName
    set selectedUtilisateurDisplayName(value) {
        this._selectedUtilisateurDisplayName = value;
    }
    // Getter pour selectedReservationUUID
    get selectedReservationUUID() {
        return this._selectedReservationUUID || undefined;
    }
    // Setter pour selectedReservationUUID
    set selectedReservationUUID(value) {
        this._selectedReservationUUID = value;
        if (value === undefined) {
            this._selectedReservationCinema = undefined;
        }
    }
    // Getter pour selectedReservationUUID
    get selectedReservationCinema() {
        return this._selectedReservationCinema || undefined;
    }
    // Méthode asynchrone pour initialiser les données depuis l'API
    // On charge l'ensemble des données de tous les cinemas, on filtrera en local
    chargerDepuisAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DataC: ChargerDepuisAPI");
            try {
                //  if (this._nameCinema !== "Selectionnez un cinema") {
                const response = yield fetch(`http://localhost:3500/api/seances/filter?cinemasList="all"`);
                const rawData = yield response.json();
                if (!Array.isArray(rawData)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }
                // Convertir les données brutes en instances de Seance
                this._allSeances = rawData.map((d) => new Seance(d));
                console.log(`Pour l'ensembles des cinemas, chargement depuis l'API : ${this.seances.length} séances, ${this.films.length} films`);
                // On recupere les tarifs
                const responseTarif = yield fetch(`http://localhost:3500/api/seances/tarif`);
                const rawDataTarif = yield responseTarif.json();
                if (!Array.isArray(rawDataTarif)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }
                // Convertir les données brutes en instances de Tarif
                this._tarifQualite = rawDataTarif.map((t) => new TarifQualite(t));
                console.log(`Pour l'ensemble des tarifs : chargement depuis l'API : ${this._tarifQualite.length} tarifs`);
                // Enregistrement de la date de validité
                setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);
                // Sauvegarder dans localStorage
                // this.sauverComplet();
                //  }
            }
            catch (error) {
                console.error('Erreur lors du chargement des données de séances : ', error);
            }
        });
    }
    /**
     * Extraction des films du tableau seance (filtré sur filterNameCinema) ayant une séance entre deux dates,
     * @param dateInf : Date inférieur initialisée par défaut à la date du jour
     * @param dateSup : Date supérieur initialisée par défaut à la date du jour
     * cela donne par défaut les films qui ont une séance à aujourd'hui et possibilité de gérer une plage de date quelconque
     */
    extractFilmsFromSeances(dateInf = new Date(), dateSup = new Date()) {
        // Utiliser une Map pour éviter les duplications (clé : filmId)
        const filmMap = new Map();
        this.seances.forEach((seance) => {
            const filmId = seance.filmId;
            if (!filmId)
                return; // Ignorer si filmId est absent
            //   console.log("iteration 2" , !filmMap.has(filmId), (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) === formatDateLocalYYYYMMDD(date)))
            //   console.log(formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')), " = " , formatDateLocalYYYYMMDD(date)) 
            if (!filmMap.has(filmId) &&
                (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) >= formatDateLocalYYYYMMDD(dateInf)) &&
                (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) <= formatDateLocalYYYYMMDD(dateSup))) {
                filmMap.set(filmId, new Film({
                    id: filmId,
                    titleFilm: seance.titleFilm,
                    filmPitch: seance.filmPitch,
                    genreArray: seance.genreArray,
                    duration: seance.duration,
                    linkBO: seance.linkBO,
                    dateSortieCinePhoria: seance.dateSortieCinePhoria,
                    categorySeeing: seance.categorySeeing,
                    note: seance.note ? parseFloat(seance.note) : undefined, // Convertir en number si présent
                    isCoupDeCoeur: seance.isCoupDeCoeur === '1', // Convertir en boolean
                    filmDescription: seance.filmDescription,
                    filmAuthor: seance.filmAuthor,
                    filmDistribution: seance.filmDistribution,
                    imageFilm128: seance.imageFilm128,
                    imageFilm1024: seance.imageFilm1024,
                }));
            }
        });
        // Convertir la Map en tableau de films et retour
        return Array.from(filmMap.values());
    }
    ;
    // Premier jour de projection du film
    premierJour(filmId) {
        return new Date(this.seancesFilm(filmId)[0].dateJour || '');
    }
    // Les séances d'un film pour un jour donne
    seancesFilmJour(filmId, date = new Date()) {
        return this.seances.filter((s) => s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date));
    }
    // Les séances d'un film sur une periode de jours
    seancesFilmDureeJour(filmId, dateDeb = new Date(), nombreJours) {
        return this.seances.filter((s) => s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) >= formatDateLocalYYYYMMDD(dateDeb) &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) < formatDateLocalYYYYMMDD(ajouterJours(dateDeb, nombreJours)));
    }
    // Toutes les séances d'un jour
    seancesJour(date = new Date()) {
        return this.seances.filter((s) => formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date));
    }
    // Toutes les séances d'un film trier par jour
    seancesFilm(filmId) {
        return this.seances
            .filter((s) => s.filmId === filmId)
            .sort((a, b) => new Date(a.dateJour || '').getTime() - new Date(b.dateJour || '').getTime());
        ;
    }
    // Tous les films pour un jour
    filmsJour(date = new Date()) {
        return this.extractFilmsFromSeances(date, date);
    }
    filmUUID(filmId) {
        const film = this.films.find((film) => {
            return film.id == filmId;
        });
        if (!film) {
            console.error("filmUUID : Film non trouvé, premier film pris");
            return this.films[0]; // ne doit jamais se produire
        }
        return film;
    }
    seanceSelected() {
        return this.seances.filter((s) => s.seanceId === this._selectedSeanceUUID)[0];
    }
    sauverComplet() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("DataC: SauverComplet filternameCinema = ", this._filterNameCinema, " selectedNameCinema = ", this._selectedNameCinema);
            // Construire un objet « snapshot » de tout ce qu’on veut persister
            const snapshot = {
                reservationState: this._reservationState,
                seances: this._allSeances,
                tarifQualite: this._tarifQualite,
                filterNameCinema: this._filterNameCinema,
                selectedNameCinema: this._selectedNameCinema,
                selectedFilmUUID: this._selectedFilmUUID,
                selectedSeanceDate: ((_a = this._selectedSeanceDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                selectedSeanceUUID: this._selectedSeanceUUID,
                selectedUtilisateurUUID: this._selectedUtilisateurUUID,
                selectedUtilisateurMail: this._selectedUtilisateurMail,
                selectedUtilisateurDisplayName: this._selectedUtilisateurDisplayName,
                selectedReservationUUID: this._selectedReservationUUID,
                selectedReservationCinema: this._selectedReservationCinema
            };
            localStorage.setItem(DataController.nomStorage, JSON.stringify(snapshot));
        });
    }
    chargerComplet() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DataC: ChargerComplet");
            const saved = localStorage.getItem(DataController.nomStorage);
            if (!saved) {
                console.warn("Aucune donnée trouvée dans le localStorage.");
                return;
            }
            try {
                const parsed = JSON.parse(saved);
                console.log("Données chargées du localStorage :", parsed); // 🔍 DEBUG
                // Restauration du state
                this._reservationState = parsed.reservationState || ReservationState.PendingChoiceSeance;
                // Restauration des séances
                if (Array.isArray(parsed.seances)) {
                    // Convertir en instances de Seance si besoin
                    this._allSeances = parsed.seances.map((s) => new Seance(s));
                }
                // Restauration des tarifs
                if (Array.isArray(parsed.tarifQualite)) {
                    this._tarifQualite = parsed.tarifQualite.map((t) => new TarifQualite(t));
                }
                // Autres champs
                this._filterNameCinema = parsed.filterNameCinema || undefined;
                this._selectedNameCinema = parsed.selectedNameCinema || undefined;
                this._selectedFilmUUID = parsed.selectedFilmUUID || undefined;
                this._selectedSeanceUUID = parsed.selectedSeanceUUID || undefined;
                this._selectedUtilisateurUUID = parsed.selectedUtilisateurUUID || undefined;
                this._selectedUtilisateurMail = parsed.selectedUtilisateurMail || undefined;
                this._selectedUtilisateurDisplayName = parsed.selectedUtilisateurDisplayName || undefined;
                this._selectedReservationUUID = parsed.selectedReservationUUID || undefined;
                this._selectedReservationCinema = parsed.selectedReservationCinema || undefined;
                // Reconstruire la date
                if (parsed.selectedSeanceDate) {
                    this._selectedSeanceDate = new Date(parsed.selectedSeanceDate);
                    console.log("Rechargement = ", this._selectedSeanceDate);
                }
                console.log("DataC: ChargerComplet filternameCinema = ", this._filterNameCinema, " selectedNameCinema = ", this._selectedNameCinema);
            }
            catch (e) {
                console.error('Erreur de parsing du localStorage : ', e);
            }
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DataC: Init");
            // 1) Charger depuis le localStorage
            yield this.chargerComplet();
            // 2) Vérifier la validité du cache
            let mustReload = true;
            const dateAccessString = getCookie(DataController.nomCookieDateAccess);
            if (dateAccessString) {
                if (!isDifferenceGreaterThanHours(new Date(), new Date(dateAccessString), DataController.validiteCache)) {
                    mustReload = false;
                    console.log("DataC: cookie valide");
                }
                else {
                    console.log("DataC: cookie validite expiré");
                }
            }
            else {
                console.log("DataC: cookie validite absent");
            }
            // 3) Si invalidité du cache ou seances vides, on va recharger
            if (!this.seances.length || mustReload) {
                //           if ( mustReload) {
                console.log('[init] Cache inexistant ou expiré -> rechargement depuis l’API');
                yield this.chargerDepuisAPI();
            }
            else {
                console.log('[init] Données restaurées depuis localStorage');
            }
        });
    }
}
DataController.validiteCache = 1; // Apres validiteCache heure on force le rechargement des données
DataController.nomCookieDateAccess = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
DataController.nomStorage = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema
/* ---------------------------------------
-- Initialisation du dataController
-- partagé entre toutes les pages
-----------------------------------------*/
export let dataController = new DataController();
