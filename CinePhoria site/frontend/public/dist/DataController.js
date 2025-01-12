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
import { Seance } from './shared-models/Seance.js'; // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { Film } from './shared-models/Film.js';
import { getCookie, setCookie } from './Helpers.js';
import { formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';
export class DataController {
    // Getter pour toutes les séances
    get allSeances() {
        return this._seances;
    }
    // Getter pour calculer les séances futures
    get seancesFutures() {
        return this._seances.filter(s => new Date(s.dateJour || '') >= new Date());
    }
    // Getter pour tous les films
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
            // this.chargerDepuisAPI();
        }
    }
    // Getter pour selectedFilm
    get selectedFilmUUID() {
        return this._selectedFilmUUID || undefined;
    }
    // Setter pour selectedFilm
    set selectedFilmUUID(value) {
        if (isUUID(value)) {
            throw new Error("L'id du film n'est pas conforme.");
        }
        this._selectedFilmUUID = value;
    }
    constructor(nameCinema) {
        this._seances = [];
        this._films = [];
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
            this._seances = JSON.parse(saved).map((s) => (Object.assign(Object.assign({}, s), { date: new Date(s.date) })));
            this.extractFilmsFromSeances();
            console.log(`Utilisation du stockage local : ${this._seances.length} séances, ${this._films.length} films`);
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
    seancesJour(date = new Date()) {
        return this._seances.filter((s) => formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date));
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
    sauver() {
        localStorage.setItem(DataController.nomStorage, JSON.stringify(this._seances));
    }
}
DataController.validiteCache = 1; // Apres validiteCache heure on force le rechargement des données
DataController.nomCookieDateAccess = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
DataController.nomStorage = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema
