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
import { Seance, SeanceInterface } from './shared-models/Seance.js';  // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { Film } from './shared-models/Film.js';
import { getCookie, setCookie } from './Helpers.js';
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';

import { updateContentPage } from './ViewReservation.js'

export class DataController {
    private _seances: Seance[] = [];
    private _films: Film[] = [];
    private _nameCinema: string;
    private _selectedFilmUUID?: string; // UUID du film actuellement selectionne
    private _selectedSeanceDate?: Date; // date du jour actuellement selectionnee
    private _selectedSeanceUUID?: string | undefined // UUID de la séance selectionnée

    private static validiteCache: number = 1; // Apres validiteCache heure on force le rechargement des données
    private static nomCookieDateAccess: string = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
    private static nomStorage: string = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema


    // Getter pour toutes les séances
    get allSeances(): Seance[] {
        return this._seances;
    }

    // Getter pour calculer les séances futures
    get seancesFutures(): Seance[] {
        return this._seances.filter(s =>
            new Date(s.dateJour || '') >= new Date()
        );
    }

    // Getter pour tous les films
    get allFilms(): Film[] {
        return this._films;
    }

    // Getter pour nameCinema
    public get nameCinema(): string {
        return this._nameCinema;
    }

    // Setter pour nameCinema
    public set nameCinema(value: string) {
        const cinemaActuel = this._nameCinema;
        if (value.trim() === '') {
            throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        let isNewCinema: boolean = (value !== this._nameCinema);
        this._nameCinema = value;

        if (isNewCinema) {
            // Changement de cinema il faut recharger le cache a la prochaine initialisation, on fait expirer le cookie dateAccess
            console.log(`Seter nameCinema 1 - Changement de cinema : ${cinemaActuel} remplace par ${this._nameCinema}`)
            setCookie(DataController.nomCookieDateAccess, " ", -1);
            console.log(`Seter nameCinema 2 - Expiration du cookie de date de mise à jour`)
        }

    }

    // Getter pour selectedFilmUID
    public get selectedFilmUUID(): string | undefined {
        return this._selectedFilmUUID || undefined;
    }

    // Setter pour selectedFilmUUID
    public set selectedFilmUUID(value: string) {
        if (!isUUID(value)) {
            throw new Error("L'id du film n'est pas conforme.");
        }
        this._selectedFilmUUID = value;
        // Appeler ici les fonctions de mise à jour
        updateContentPage(this);
    }

    // Getter pour selectedFilm
    public get selectedFilm(): Film {
        if (this._selectedFilmUUID) {
            return this.filmUUID(this._selectedFilmUUID);
        } else {
            console.error("selectedFilm : Film non trouvé, premier film pris");
            return this._films[0] // ne doit pas se produire
        }
    }

    // Getter pour selectedSeanceDate
    public get selectedSeanceDate(): Date | undefined {
        return this._selectedSeanceDate || undefined;
    }

    // Setter pour selectedSeanceDate
    public set selectedSeanceDate(value: Date) {
        this._selectedSeanceDate = value;
    }

    // Getter pour selectedSeanceUUID
    public get selectedSeanceUUID(): string | undefined {
        return this._selectedSeanceUUID || undefined;
    }

    // Setter pour selectedSeanceUUID
    public set selectedSeanceUUID(value: string | undefined) {
        this._selectedSeanceUUID = value;
    }


    constructor(nameCinema: string) {
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
            this._seances = JSON.parse(saved).map((s: any) => ({
                ...s,
                date: new Date(s.date),
            }));
            this.extractFilmsFromSeances();
            console.log(`Utilisation du stockage local : ${this._seances.length} séances, ${this._films.length} films`);

        }
    }

    // Méthode asynchrone pour initialiser les données depuis l'API
    public async chargerDepuisAPI(): Promise<void> {
        try {

            if (this._nameCinema !== "Selectionnez un cinema") {
                const response = await fetch(`http://localhost:3000/api/seances/filter?cinemasList="${this.nameCinema}"`);
                const rawData = await response.json();

                if (!Array.isArray(rawData)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }

                // Convertir les données brutes en instances de Seance
                this._seances = rawData.map((d: any) => new Seance(d));
                this.extractFilmsFromSeances();
                console.log(`Pour ${this.nameCinema} : chargement depuis l'API : ${this._seances.length} séances, ${this._films.length} films`);

                // Enregistrement de la date 
                setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);

                // Sauvegarder dans localStorage
                this.sauver();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données de séances : ', error);
        }
    }
    /**
     * Extraction des films à partir des dates
     * @param date : permet de traiter une selection de séances à partir d'une date, initialisé par défaut à la date du jour
     * cela donne les films qui ont une séance à aujourd'hui ou ultérieurment  
     */
    private extractFilmsFromSeances(date: Date = new Date()) {
        // Utiliser une Map pour éviter les duplications (clé : filmId)
        const filmMap = new Map<string, Film>();
        this._seances.forEach((seance) => {
            const filmId = seance.filmId;
            if (!filmId) return; // Ignorer si filmId est absent
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
    };

    public seancesFilmJour(filmId: string, date: Date = new Date()): Seance[] {
        return this._seances.filter((s) =>
            s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date)
        );
    }

    public seancesFilmDureeJour(filmId: string, dateDeb: Date = new Date(), nombreJours: number): Seance[] {
        return this._seances.filter((s) =>
            s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) >= formatDateLocalYYYYMMDD(dateDeb) &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) < formatDateLocalYYYYMMDD(ajouterJours(dateDeb,nombreJours))
        );
    }

    public seancesJour(date: Date = new Date()): Seance[] {
        return this._seances.filter((s) =>
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date)
        );
    }
    public seancesFilm(filmId: string): Seance[] {
        return this._seances.filter((s) =>
            s.filmId === filmId
        );
    }

    public filmsJour(date: Date = new Date()): Film[] {

        // Utilisation d'une Map pour éviter les doublons
        const filmMap = new Map<string, Film>();

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

    public filmUUID(filmId: string): Film {
        const film = this._films.find((film) => {
            return film.id == filmId;
        });
        

        if (!film) {
            console.error("filmUUID : Film non trouvé, premier film pris");
            return this._films[0]; // ne doit jamais se produire
        }

        return film;

    }


    public sauver(): void {
        localStorage.setItem(DataController.nomStorage, JSON.stringify(this._seances));
    }
}
