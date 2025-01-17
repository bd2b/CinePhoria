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
 * On utilise un cache dans le storage qui reçoit l'ensemble des SeancesFilmsSalle du cinema
 * L'initialisation se fait en deux temps car le chargement en asynchrone ne peut se faire dans le constructeur
 * - Le constructeur
 *      positionne le nom du cinema
 *      si le cache existe et est valide (date de moins d'1 heure) charge les données
 *      initialise le tableau des films
 * - Chargement des données déclenché en asynchrone par la ViewReservation
 *      fetch les séances pour le cinema
 *      initialise le tableau des films
 *      sauvegarde dans le storage
 *
 * On dispose des propriétés :
 * - Toutes les séances sur lesquels on a des helpers , séancesFutures, Séances d'un jour pour un film....
 * - Tous les films avec des helpers également
 */
import { Seance, TarifQualite } from './shared-models/Seance.js'; // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { Film } from './shared-models/Film.js';
import { getCookie, setCookie } from './Helpers.js';
import { ajouterJours, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';
import { updateContentPage } from './ViewReservation.js';
export var ReservationState;
(function (ReservationState) {
    ReservationState["PendingChoiceSeance"] = "PendingChoiceSeance";
    ReservationState["PendingChoiceSeats"] = "PendingChoiceSeats";
    ReservationState["Reserved"] = "Reserved";
    ReservationState["Confirmed"] = "Confirmed";
    ReservationState["PendingMailVerification"] = "PendingMailVerification"; // La reservation est enregistree, il y a assez de place (sieges et PMR) mais l'email doit etre enregistre
})(ReservationState || (ReservationState = {}));
export class DataController {
    // Getter pour reservationState
    get reservationState() {
        return this._reservationState;
    }
    // Setter pour selectedSeanceUUID
    set reservationState(value) {
        this._reservationState = value;
    }
    // Getter pour toutes les séances
    get allSeances() {
        return this._seances;
    }
    // Getter pour calculer les séances futures
    get seancesFutures() {
        return this._seances.filter(s => new Date(s.dateJour || '') >= new Date());
    }
    // Getter pour tous les films
    get allTarifQualite() {
        return this._tarifQualite;
    }
    // Getter pour tous les tarifQualite
    get allFilms() {
        return this._films;
    }
    // Getter pour nameCinema
    get nameCinema() {
        return this._nameCinema;
    }
    // Setter pour nameCinema
    set nameCinema(value) {
        const cinemaActuel = this._nameCinema;
        if (value.trim() === '') {
            throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        let isNewCinema = (value !== this._nameCinema);
        this._nameCinema = value;
        if (isNewCinema) {
            // Changement de cinema il faut recharger le cache a la prochaine initialisation, on fait expirer le cookie dateAccess
            console.log(`Seter nameCinema 1 - Changement de cinema : ${cinemaActuel} remplace par ${this._nameCinema}`);
            setCookie(DataController.nomCookieDateAccess, " ", -1);
            console.log(`Seter nameCinema 2 - Expiration du cookie de date de mise à jour`);
        }
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
        // Appeler ici les fonctions de mise à jour
        updateContentPage(this);
    }
    // Getter pour selectedFilm
    get selectedFilm() {
        if (this._selectedFilmUUID) {
            return this.filmUUID(this._selectedFilmUUID);
        }
        else {
            console.error("selectedFilm : Film non trouvé, premier film pris");
            return this._films[0]; // ne doit pas se produire
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
    constructor(nameCinema) {
        this._reservationState = ReservationState.PendingChoiceSeance;
        this._seances = [];
        this._films = [];
        this._tarifQualite = [];
        this._nameCinema = nameCinema;
        // Charger les données depuis localStorage si elles existent
        const saved = localStorage.getItem(DataController.nomStorage);
        // Si les données stockées sont plus vieilles de DataController.validiteCache heures, on force le rechargement
        const dateAccessString = getCookie(DataController.nomCookieDateAccess);
        let mustReload = true;
        if (dateAccessString) {
            if (!isDifferenceGreaterThanHours(new Date(), new Date(dateAccessString), DataController.validiteCache)) {
                mustReload = false;
            }
        }
        if (saved && !mustReload) {
            this.charger();
            this.extractFilmsFromSeances();
            console.log(`Utilisation du stockage local : ${this._seances.length} séances, ${this._films.length} films`);
            console.log(`Utilisation du stockage local : ${this._tarifQualite.length} tarifs`);
        }
    }
    // Méthode asynchrone pour initialiser les données depuis l'API
    chargerDepuisAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this._nameCinema !== "Selectionnez un cinema") {
                    const response = yield fetch(`http://localhost:3000/api/seances/filter?cinemasList="${this.nameCinema}"`);
                    const rawData = yield response.json();
                    if (!Array.isArray(rawData)) {
                        throw new Error('La réponse de l’API n’est pas un tableau.');
                    }
                    // Convertir les données brutes en instances de Seance
                    this._seances = rawData.map((d) => new Seance(d));
                    this.extractFilmsFromSeances();
                    console.log(`Pour ${this.nameCinema} : chargement depuis l'API : ${this._seances.length} séances, ${this._films.length} films`);
                    // On recupere les tarifs
                    const responseTarif = yield fetch(`http://localhost:3000/api/seances/tarif`);
                    const rawDataTarif = yield responseTarif.json();
                    if (!Array.isArray(rawDataTarif)) {
                        throw new Error('La réponse de l’API n’est pas un tableau.');
                    }
                    // Convertir les données brutes en instances de Tarif
                    this._tarifQualite = rawDataTarif.map((t) => new TarifQualite(t));
                    console.log(`Pour ${this.nameCinema} : chargement depuis l'API : ${this._tarifQualite.length} tarifs`);
                    // Enregistrement de la date 
                    setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);
                    // Sauvegarder dans localStorage
                    this.sauver();
                }
            }
            catch (error) {
                console.error('Erreur lors du chargement des données de séances : ', error);
            }
        });
    }
    /**
     * Extraction des films à partir des dates
     * @param date : permet de traiter une selection de séances à partir d'une date, initialisé par défaut à la date du jour
     * cela donne les films qui ont une séance à aujourd'hui ou ultérieurment
     */
    extractFilmsFromSeances(date = new Date()) {
        // Utiliser une Map pour éviter les duplications (clé : filmId)
        const filmMap = new Map();
        this._seances.forEach((seance) => {
            const filmId = seance.filmId;
            if (!filmId)
                return; // Ignorer si filmId est absent
            //   console.log("iteration 2" , !filmMap.has(filmId), (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) === formatDateLocalYYYYMMDD(date)))
            //   console.log(formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')), " = " , formatDateLocalYYYYMMDD(date)) 
            if (!filmMap.has(filmId) &&
                (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) === formatDateLocalYYYYMMDD(date))) {
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
        // Convertir la Map en tableau de films
        this._films = Array.from(filmMap.values());
    }
    ;
    seancesFilmJour(filmId, date = new Date()) {
        return this._seances.filter((s) => s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date));
    }
    seancesFilmDureeJour(filmId, dateDeb = new Date(), nombreJours) {
        return this._seances.filter((s) => s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) >= formatDateLocalYYYYMMDD(dateDeb) &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) < formatDateLocalYYYYMMDD(ajouterJours(dateDeb, nombreJours)));
    }
    seancesJour(date = new Date()) {
        return this._seances.filter((s) => formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date));
    }
    seancesFilm(filmId) {
        return this._seances.filter((s) => s.filmId === filmId);
    }
    filmsJour(date = new Date()) {
        // Utilisation d'une Map pour éviter les doublons
        const filmMap = new Map();
        this.seancesJour(date).forEach((seance) => {
            const filmId = seance.filmId;
            if (filmId && !filmMap.has(filmId)) {
                filmMap.set(filmId, new Film({
                    id: filmId,
                    titleFilm: seance.titleFilm,
                    filmPitch: seance.filmPitch,
                    genreArray: seance.genreArray,
                    duration: seance.duration,
                    linkBO: seance.linkBO,
                    dateSortieCinePhoria: seance.dateSortieCinePhoria,
                    categorySeeing: seance.categorySeeing,
                    note: seance.note ? parseFloat(seance.note) : undefined, // Convertir en number si nécessaire
                    isCoupDeCoeur: seance.isCoupDeCoeur === '1', // Convertir en boolean
                    filmDescription: seance.filmDescription,
                    filmAuthor: seance.filmAuthor,
                    filmDistribution: seance.filmDistribution,
                    imageFilm128: seance.imageFilm128,
                    imageFilm1024: seance.imageFilm1024,
                }));
            }
        });
        // Retourner les films uniques sous forme de tableau
        return Array.from(filmMap.values());
    }
    filmUUID(filmId) {
        const film = this._films.find((film) => {
            return film.id == filmId;
        });
        if (!film) {
            console.error("filmUUID : Film non trouvé, premier film pris");
            return this._films[0]; // ne doit jamais se produire
        }
        return film;
    }
    seanceSelected() {
        return this._seances.filter((s) => s.seanceId === this._selectedSeanceUUID)[0];
    }
    sauver() {
        const dataToSave = {
            seances: this._seances,
            tarifQualite: this._tarifQualite
        };
        localStorage.setItem(DataController.nomStorage, JSON.stringify(dataToSave));
    }
    charger() {
        const saved = localStorage.getItem(DataController.nomStorage);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Restaurer les séances
            this._seances = (parsed.seances || []).map((s) => (Object.assign(Object.assign({}, s), { date: new Date(s.date) // Convertir les dates en objets `Date`
             })));
            // Restaurer les films
            this._tarifQualite = parsed.tarifQualite || [];
        }
        else {
            console.warn("Aucune donnée trouvée dans le localStorage.");
        }
    }
}
DataController.validiteCache = 1; // Apres validiteCache heure on force le rechargement des données
DataController.nomCookieDateAccess = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
DataController.nomStorage = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema
