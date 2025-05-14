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
import { getCookie, setCookie, datePrecedentMercredi, sanitizeFilm, sanitizeSeance, sanitizeCinema, sanitizeTarifQualite } from './Helpers.js';
import { ajouterJours, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';
import { Cinema } from './shared-models/Cinema.js';
import { getSeancesByIdApi, getVersionApi, filmsSelectAllApi } from './NetworkController.js';
import { baseUrl } from './Global.js';
// Promesse d'attente de la fin du chargement des données par les modules de page
let resolveReady;
export const dataReady = new Promise((resolve) => {
    resolveReady = resolve;
});
export class DataController {
    constructor() {
        //  protected version: { majeure: number, mineure: number, build: number } = {majeure: 0, mineure: 0, build: 0};
        this.version = { idInt: 0, MAJEURE: 0, MINEURE: 0, BUILD: 0, dateMaj: new Date("01/01/1980") };
        this._reservationState = ReservationState.PendingChoiceSeance;
        // Ensemble des données chargées systématiquement
        this._allSeances = [];
        this._Cinemas = [];
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
    // 🏆 Variable calculée : retourne les films qui ont une date de sortie au dernier mercredi 
    // ou les films du catalogue trie par date de sortie
    get filmsSortiesRecentes() {
        const precedentMercredi = datePrecedentMercredi();
        const filmsMercredi = this.films.filter((f) => {
            if (!f.dateSortieCinePhoria)
                return false;
            const sortieDate = new Date(f.dateSortieCinePhoria);
            return formatDateLocalYYYYMMDD(sortieDate) === formatDateLocalYYYYMMDD(precedentMercredi);
        });
        const filmsaTrier = filmsMercredi.length > 0 ? filmsMercredi : this.films;
        const messageAssocie = filmsMercredi.length > 0 ? "Nouveaute de la semaine" : "Notre catalogue";
        const filmsListeFinal = filmsaTrier
            .filter(f => f.dateSortieCinePhoria)
            .sort((a, b) => new Date(b.dateSortieCinePhoria).getTime() - new Date(a.dateSortieCinePhoria).getTime());
        return { films: filmsListeFinal, message: messageAssocie };
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
    // Variable calculee : liste des films filtrés sur le cinéma puis sur le genre Genre
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
    // getter pour tous les cinema
    get cinemas() {
        return this._Cinemas;
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
        this.sauverEtatGlobal();
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
        console.log("Set selectedFilmUUID");
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
    // Getter pour selectedListSeats
    get selectedListSeats() {
        return this._selectedListSeats || undefined;
    }
    // Setter pour selectedListSeats
    set selectedListSeats(value) {
        this._selectedListSeats = value;
        if (value === undefined) {
            this._selectedListSeats = undefined;
        }
    }
    // Getter pour selectedReservationUUID
    get selectedReservationCinema() {
        return this._selectedReservationCinema || undefined;
    }
    // Méthode asynchrone pour initialiser les données depuis l'API
    // On charge l'ensemble des données de toutes les séances, on filtrera en local
    chargerDepuisAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DataC: ChargerDepuisAPI");
            try {
                // 0) Chargement de tous les films dans la variables de class allFilms de Seance
                Seance.allFilms = (yield filmsSelectAllApi()).filter(sanitizeFilm);
                // 1) Chargement de toutes les séances
                const response = yield fetch(`${baseUrl}/api/seances/filter?cinemasList="all"`);
                const rawData = yield response.json();
                if (!Array.isArray(rawData)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }
                // Convertir les données brutes en instances de Seance
                this._allSeances = rawData.filter(sanitizeSeance).map((d) => new Seance(d));
                console.log(`Pour l'ensembles des cinemas, chargement depuis l'API : ${this.seances.length} séances, ${this.films.length} films`);
                // 2) On recupere les tarifs
                const responseTarif = yield fetch(`${baseUrl}/api/seances/tarif`);
                const rawDataTarif = yield responseTarif.json();
                if (!Array.isArray(rawDataTarif)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }
                // Convertir les données brutes en instances de Tarif
                this._tarifQualite = rawDataTarif.filter(sanitizeTarifQualite).map((t) => new TarifQualite(t));
                console.log(`Pour l'ensemble des tarifs : chargement depuis l'API : ${this._tarifQualite.length} tarifs`);
                // 3) Chargement de tous les cinemas (pour le pied de page)
                const responseCinema = yield fetch(`${baseUrl}/api/cinemas`);
                const rawDataCinema = yield responseCinema.json();
                if (!Array.isArray(rawDataCinema)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }
                // Convertir les données brutes en instances de Cinema
                this._Cinemas = rawDataCinema.filter(sanitizeCinema).map((c) => new Cinema(c));
                console.log(`Pour l'ensemble des cinemas, chargement depuis l'API : ${this._Cinemas.length} cinemas`);
                // Enregistrement de la date de validité
                setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);
            }
            catch (error) {
                console.error('Erreur lors du chargement des données de séances : ', error);
            }
            finally {
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
        const filmIds = new Set(this.seances
            .filter(seance => {
            const dateStr = seance.dateJour;
            if (!dateStr)
                return false;
            const date = new Date(dateStr);
            return formatDateLocalYYYYMMDD(date) >= formatDateLocalYYYYMMDD(dateInf) &&
                formatDateLocalYYYYMMDD(date) <= formatDateLocalYYYYMMDD(dateSup);
        })
            .map(seance => seance.filmId)
            .filter((id) => !!id));
        return Seance.allFilms.filter(film => film.id && filmIds.has(film.id));
    }
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
    seanceById(seanceId) {
        return this._allSeances.filter((s) => s.seanceId === seanceId)[0];
    }
    sauverEtatGlobal() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const snapshotGlobal = {
                version: this.version,
                reservationState: this._reservationState,
                filterNameCinema: this._filterNameCinema,
                selectedNameCinema: this._selectedNameCinema,
                selectedFilmUUID: this._selectedFilmUUID,
                selectedSeanceDate: ((_a = this._selectedSeanceDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                selectedSeanceUUID: this._selectedSeanceUUID,
                selectedUtilisateurUUID: this._selectedUtilisateurUUID,
                selectedUtilisateurMail: this._selectedUtilisateurMail,
                selectedUtilisateurDisplayName: this._selectedUtilisateurDisplayName,
                selectedReservationUUID: this._selectedReservationUUID,
                selectedListSeats: this._selectedListSeats,
                selectedReservationCinema: this._selectedReservationCinema,
            };
            const strGlobal = JSON.stringify(snapshotGlobal);
            console.log(`DataC: Taille du snapshotGlobal = ${strGlobal.length} caractères`);
            localStorage.setItem(DataController.KEY_GLOBAL, strGlobal);
        });
    }
    sauverTarifs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._tarifQualite)
                return;
            const arr = this._tarifQualite; // tableau de TarifQualite
            const str = JSON.stringify(arr);
            console.log(`DataC: Sauvegarde des tarifs => taille = ${str.length}`);
            localStorage.setItem(DataController.KEY_TARIFS, str);
        });
    }
    sauverCinemas() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._Cinemas)
                return;
            const arr = this._Cinemas; // tableau de Cinema
            const str = JSON.stringify(arr);
            console.log(`DataC: Sauvegarde des Cinemas => taille = ${str.length}`);
            localStorage.setItem(DataController.KEY_CINEMAS, str);
        });
    }
    sauverFilms() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Seance.allFilms)
                return;
            const arr = Seance.allFilms; // tableau de Cinema
            const str = JSON.stringify(arr);
            console.log(`DataC: Sauvegarde des Films => taille = ${str.length}`);
            localStorage.setItem(DataController.KEY_FILMS, str);
        });
    }
    sauverSeancesParCinema(cinema) {
        return __awaiter(this, void 0, void 0, function* () {
            // On suppose que this._allSeances contient toutes les séances de tous les cinémas
            if (!this._allSeances)
                return;
            // Regrouper par cinema
            const mapCinemaToSeances = new Map();
            this._allSeances.forEach((s) => {
                var _a, _b;
                const cName = ((_a = s.nameCinema) === null || _a === void 0 ? void 0 : _a.trim()) || 'unknown';
                if (!mapCinemaToSeances.has(cName)) {
                    mapCinemaToSeances.set(cName, []);
                }
                (_b = mapCinemaToSeances.get(cName)) === null || _b === void 0 ? void 0 : _b.push(s);
            });
            if (cinema) {
                // Sauvegarder uniquement le cinéma spécifié
                const seancesCinema = mapCinemaToSeances.get(cinema);
                if (seancesCinema) {
                    const str = JSON.stringify(seancesCinema);
                    const key = `${DataController.KEY_SEANCES}_${cinema}`;
                    console.log(`DataC: Sauvegarde séances pour '${cinema}' => taille ${str.length} chars`);
                    localStorage.setItem(key, str);
                }
                else {
                    console.warn(`Aucune séance trouvée pour le cinéma '${cinema}'.`);
                }
            }
            else {
                // Sauvegarder tous les cinémas comme précédemment
                mapCinemaToSeances.forEach((seances, cName) => {
                    const str = JSON.stringify(seances);
                    const key = `${DataController.KEY_SEANCES}_${cName}`;
                    console.log(`DataC: Sauvegarde séances pour '${cName}' => taille ${str.length} chars`);
                    localStorage.setItem(key, str);
                });
            }
        });
    }
    sauverComplet() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sauverEtatGlobal();
            yield this.sauverTarifs();
            yield this.sauverCinemas();
            yield this.sauverFilms();
            yield this.sauverSeancesParCinema();
        });
    }
    chargerEtatGlobal() {
        return __awaiter(this, void 0, void 0, function* () {
            const saved = localStorage.getItem(DataController.KEY_GLOBAL);
            if (!saved) {
                console.warn("DataC: Aucune donnée globale trouvée");
                return;
            }
            try {
                const parsed = JSON.parse(saved);
                this.version = parsed.version || { majeure: 0, mineure: 0, build: 0 };
                this._reservationState = parsed.reservationState || ReservationState.PendingChoiceSeance;
                this._filterNameCinema = parsed.filterNameCinema || undefined;
                this._selectedNameCinema = parsed.selectedNameCinema || undefined;
                this._selectedFilmUUID = parsed.selectedFilmUUID || undefined;
                this._selectedSeanceUUID = parsed.selectedSeanceUUID || undefined;
                this._selectedUtilisateurUUID = parsed.selectedUtilisateurUUID || undefined;
                this._selectedUtilisateurMail = parsed.selectedUtilisateurMail || undefined;
                this._selectedUtilisateurDisplayName = parsed.selectedUtilisateurDisplayName || undefined;
                this._selectedReservationUUID = parsed.selectedReservationUUID || undefined;
                this._selectedListSeats = parsed.selectedListSeats || undefined;
                this._selectedReservationCinema = parsed.selectedReservationCinema || undefined;
                if (parsed.selectedSeanceDate) {
                    this._selectedSeanceDate = new Date(parsed.selectedSeanceDate);
                }
            }
            catch (e) {
                console.error('DataC: Erreur parsing état global', e);
            }
        });
    }
    chargerTarifs() {
        return __awaiter(this, void 0, void 0, function* () {
            const saved = localStorage.getItem(DataController.KEY_TARIFS);
            if (!saved)
                return;
            try {
                const arr = JSON.parse(saved);
                if (Array.isArray(arr)) {
                    console.log("arr", arr),
                        this._tarifQualite = arr.filter(sanitizeTarifQualite).map((t) => new TarifQualite(t));
                }
            }
            catch (e) {
                console.error('DataC: Erreur parsing tarifs', e);
            }
        });
    }
    chargerCinemas() {
        return __awaiter(this, void 0, void 0, function* () {
            const saved = localStorage.getItem(DataController.KEY_CINEMAS);
            if (!saved)
                return;
            try {
                const arr = JSON.parse(saved);
                if (Array.isArray(arr)) {
                    this._Cinemas = arr.filter(sanitizeCinema).map((c) => new Cinema(c));
                }
            }
            catch (e) {
                console.error('DataC: Erreur parsing cinemas', e);
            }
        });
    }
    chargerFilms() {
        return __awaiter(this, void 0, void 0, function* () {
            const saved = localStorage.getItem(DataController.KEY_FILMS);
            if (!saved)
                return;
            try {
                const arr = JSON.parse(saved);
                if (Array.isArray(arr)) {
                    Seance.allFilms = arr.filter(sanitizeFilm).map((f) => new Film(f));
                }
            }
            catch (e) {
                console.error('DataC: Erreur parsing films', e);
            }
        });
    }
    chargerSeancesPourCinema(cinemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${DataController.KEY_SEANCES}_${cinemaName}`;
            const saved = localStorage.getItem(key);
            if (!saved)
                return [];
            try {
                const arr = JSON.parse(saved);
                if (Array.isArray(arr)) {
                    return arr.filter(sanitizeSeance).map((s) => new Seance(s));
                }
            }
            catch (e) {
                console.error('DataC: Erreur parsing seances pour', cinemaName, e);
            }
            return [];
        });
    }
    chargerSeancesTousCinemas() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // S’assurer qu’on a la liste des cinémas
            if (!this._Cinemas || this._Cinemas.length === 0) {
                console.warn("DataC: Aucun cinéma n’est chargé, impossible de charger les séances tous cinémas.");
                return;
            }
            // Vider ou reconstituer _allSeances
            this._allSeances = [];
            for (const cinemaObj of this._Cinemas) {
                const cName = ((_a = cinemaObj.nameCinema) === null || _a === void 0 ? void 0 : _a.trim()) || 'unknown';
                const partialSeances = yield this.chargerSeancesPourCinema(cName);
                // Ajouter au grand tableau
                this._allSeances.push(...partialSeances);
            }
            console.log(`DataC: Toutes les séances de ${this._Cinemas.length} cinémas chargées. Nombre total de séances : ${this._allSeances.length}.`);
        });
    }
    chargerComplet() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DataC: ChargerComplet de tous les storages");
            // 1) Charger l’état global
            yield this.chargerEtatGlobal();
            // 2) Charger les tarifs
            yield this.chargerTarifs();
            // 3) Charger la liste des cinémas
            yield this.chargerCinemas();
            // 3) Charger la liste des films
            yield this.chargerFilms();
            // 4) Charger toutes les séances pour tous les cinémas
            yield this.chargerSeancesTousCinemas();
            // => À la fin, this._allSeances contient l’ensemble des séances
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DataC: Init");
            // 1) Charger depuis localStorage
            yield this.chargerComplet();
            // 1 bis) Vérifier si la dernier mise à jour du serveur a été prise en compte ou si on 
            // a changer de version majeure
            try {
                const newVersion = yield getVersionApi();
                console.log("Version du serveur = ", JSON.stringify(newVersion));
                console.log("Version du cache = ", JSON.stringify(this.version));
                const isNouvelleVersionServeur = this.version.dateMaj && newVersion.dateMaj &&
                    this.version.dateMaj < newVersion.dateMaj;
                const isNouvelleVersionMajeure = this.version.MAJEURE && newVersion.MAJEURE &&
                    this.version.MAJEURE !== newVersion.MAJEURE;
                if (isNouvelleVersionServeur || isNouvelleVersionMajeure) {
                    console.log(`DataC: nouvelle version ${isNouvelleVersionServeur ? "serveur" : "majeur"} - rechargement depuis l’API`);
                    yield this.chargerDepuisAPI();
                    resolveReady(); // 🔹 Signale que les données sont prêtes
                    this.version = newVersion;
                    yield this.sauverComplet();
                    return;
                }
                else {
                    console.log("Pas de mise à jour de cache");
                }
            }
            catch (error) {
                console.error("Impossible de versifier la mise à jour su site = ", error);
            }
            // 2) Vérifier la validité du cache via cookie
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
            // 3) Si invalidité du cache ou pas de séances, on recharge depuis API
            if (!this._allSeances.length || mustReload) {
                console.log('[init] Cache inexistant/vide ou expiré -> rechargement depuis l’API');
                yield this.chargerDepuisAPI();
                yield this.sauverComplet();
            }
            else {
                console.log('[init] Données restaurées depuis localStorage');
            }
            resolveReady(); // 🔹 Signale que les données sont prêtes
        });
    }
    getSeanceFromDB(seancesUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const seancesAjour = yield getSeancesByIdApi(seancesUUID);
                return seancesAjour;
            }
            catch (error) {
                console.error("Erreur dans la récupération de seances : " + error);
            }
            return [];
        });
    }
    // Rafraichissement du cache pour une liste quelconque de séances
    updateSeances(seancesUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Update séances UUID =", seancesUUID);
            try {
                const seancesAjour = yield getSeancesByIdApi(seancesUUID);
                // Structure pour regrouper les séances par cinéma
                const seancesParCinema = new Map();
                // 1. Mise à jour du DataController et regroupement par cinéma
                seancesAjour.forEach(seanceVar => {
                    var _a;
                    const indexCible = this._allSeances.findIndex(seance => seance.seanceId === seanceVar.seanceId);
                    if (indexCible !== -1) {
                        this._allSeances[indexCible] = seanceVar;
                    }
                    else {
                        console.error("Séance non trouvée : ", seanceVar.seanceId);
                    }
                    const cinemaName = seanceVar.nameCinema || 'unknown';
                    if (!seancesParCinema.has(cinemaName)) {
                        seancesParCinema.set(cinemaName, []);
                    }
                    (_a = seancesParCinema.get(cinemaName)) === null || _a === void 0 ? void 0 : _a.push(seanceVar);
                });
                // 2. Mise à jour du cache par cinéma
                for (const [cinema, seancesModifiees] of seancesParCinema.entries()) {
                    const storageKey = `${DataController.KEY_SEANCES}_${cinema}`;
                    const existingSeancesStr = localStorage.getItem(storageKey);
                    let existingSeances = [];
                    if (existingSeancesStr) {
                        existingSeances = JSON.parse(existingSeancesStr);
                    }
                    // Mises à jour ciblées des séances modifiées
                    seancesModifiees.forEach(updatedSeance => {
                        const index = existingSeances.findIndex(s => s.seanceId === updatedSeance.seanceId);
                        if (index !== -1) {
                            existingSeances[index] = updatedSeance;
                        }
                        else {
                            existingSeances.push(updatedSeance); // ajoute si inexistant
                        }
                    });
                    localStorage.setItem(storageKey, JSON.stringify(existingSeances));
                    console.log(`DataC: Cache mis à jour pour cinéma '${cinema}', ${seancesModifiees.length} séances modifiées.`);
                }
            }
            catch (error) {
                console.error("Erreur dans mise à jour des séances : " + error);
            }
        });
    }
}
DataController.validiteCache = 1; // Apres validiteCache heure on force le rechargement des données
DataController.nomCookieDateAccess = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
DataController.nomStorage = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema
/* ---------------------------------------
-- Gestion de la persistence des dpnnées dans le storage
-- La limitation de taille à 5Mo nécessite de fractionner les données en plusieurs storage
-----------------------------------------*/
DataController.KEY_GLOBAL = 'myAppState'; // Pour l’état global (reservationState, selectedFilm, etc.)
DataController.KEY_TARIFS = 'myAppTarifs'; // Pour le tarifQualite
DataController.KEY_CINEMAS = 'myAppCinemas'; // Pour la liste des Cinema
DataController.KEY_FILMS = 'myAppFilms'; // Pour la liste des Films
// Pour les seances, on fera KEY_SEANCES + "_" + cinemaName => "myAppSeances_Paris", etc.
DataController.KEY_SEANCES = 'myAppSeances';
/* ---------------------------------------
-- Initialisation du dataController
-- partagé entre toutes les pages
-----------------------------------------*/
export let dataController = new DataController();
