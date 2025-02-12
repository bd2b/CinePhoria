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
import { Seance, TarifQualite } from './shared-models/Seance.js';  // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { Film } from './shared-models/Film.js';
import { ReservationState } from './shared-models/Reservation.js';
import { getCookie, setCookie , datePrecedentMercredi } from './Helpers.js';
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';
// import { onLoadReservation } from "./ViewReservation.js";
// import { onLoadMesReservations } from "./ViewMesReservations.js";
// import { onLoadVisiteur } from "./ViewFilmsSortiesSemaine.js";
// import { chargerMenu } from './ViewMenu.js';
// import { chargerCinemaSites } from './ViewFooter.js';



export class DataController {

    private _reservationState: ReservationState = ReservationState.PendingChoiceSeance;

    // Ensemble des données chargées systématiquement
    private _allSeances: Seance[] = [];

    // 🏆 Variable calculée : retourne les séances filtrées par cinéma
    get seances(): Seance[] {
        if (this.filterNameCinema === 'all') {
            return this._allSeances;
        } else {
            return this._allSeances.filter(seance => seance.nameCinema === this._filterNameCinema);
        }
    }

    // 🏆 Variable calculée : retourne les films filtrés par cinéma ayant une séeance dans les 90 jours
    get films(): Film[] {
        const dateMax = new Date();
        dateMax.setDate((dateMax).getDate() + 90);
        return this.extractFilmsFromSeances(new Date(), dateMax);
    }

    get filmsSortiesRecentes(): Film[] {
        const precedentMercredi = datePrecedentMercredi();
        return this.films.filter((f) => {
            if (!f.dateSortieCinePhoria) return false;
            const sortieDate = new Date(f.dateSortieCinePhoria);
            return formatDateLocalYYYYMMDD(sortieDate) === formatDateLocalYYYYMMDD(precedentMercredi);
        });
    }

    // Variable calculée : retourne tous les genres des films filtrés sur le nom du cinema
    get genreSet(): Set<string> {
        // Pour être dynamique, on va extraire tous les genres dans dataController.allFilms ou allSeances
        // Regrouper dans un set
        const genreSet = new Set<string>();
        dataController.films.forEach((f) => {
            if (f.genreArray) {
                f.genreArray.split(',').forEach((g) => genreSet.add(g.trim()));
            }
        });
        return genreSet;
    }
    // Variable calculee : liste des films filtré sur le cinéma puis sur le genre Genre
    get filmsGenre(): Film[] {
        let films = this.films;
        if (this._filterGenre !== 'all') {
            films = this.films.filter((f) => {
                if (!f.genreArray) return false;
                const genres = f.genreArray.split(',').map((g) => g.trim().toLowerCase());
                return genres.includes(this._filterGenre.toLowerCase());
            });
        }
        return films;
    }

    

    private _tarifQualite: TarifQualite[] = [];

    private _filterNameCinema?: string // = "all"; // On filtre sur tous les cinémas par défaut
    private _selectedNameCinema?: string // = "Paris" // Par defaut le cinema selectionne dans la page Reservation
    private _filterGenre: string = "all"; // Filtre sur tous les genres 

    private _selectedFilmUUID?: string; // UUID du film actuellement selectionne
    private _selectedSeanceDate?: Date; // date du jour actuellement selectionnee
    private _selectedSeanceUUID?: string | undefined // UUID de la séance selectionnée

    private _selectedUtilisateurUUID?: string | undefined // UUID de l'utilisateur
    private _selectedUtilisateurMail?: string | undefined // Mail de l'utilisateur
    private _selectedUtilisateurDisplayName?: string | undefined // displayName de l'utilisateur

    private _selectedReservationUUID?: string | undefined // UUID de la reservation
    private _selectedReservationCinema?: string | undefined // Cinema de localisation de la reservation

    private static validiteCache: number = 1; // Apres validiteCache heure on force le rechargement des données
    private static nomCookieDateAccess: string = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
    private static nomStorage: string = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema


    // Getter pour reservationState
    public get reservationState(): ReservationState {
        return this._reservationState;
    }

    // Setter pour reservationState
    public set reservationState(value: ReservationState) {
        console.log("Mise a jour statut reservation = " + value)
        this._reservationState = value;
    }

    // Getter pour toutes les séances de tous les cinemas
    get allSeances(): Seance[] {
        return this._allSeances;
    }

    // Getter pour calculer les séances futures sur le cinema filtre
    get seancesFutures(): Seance[] {
        return this.seances.filter(s =>
            new Date(s.dateJour || '') >= new Date()
        );
    }

    // Getter pour tous les tarifs
    get allTarifQualite(): TarifQualite[] {
        return this._tarifQualite;
    }

    // Getter pour filterNameCinema
    public get filterNameCinema(): string {
        return this._filterNameCinema || "all";
    }

    // Setter pour filterNameCinema
    public set filterNameCinema(value: string) {
        if (value.trim() === '') {
            throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        // On memorise le dernier cinema filté comme cinema selectionné dans la page Reservation
        if (value.trim() !== 'all') {
            this._selectedNameCinema = value.trim();
            console.log("DataC: Cinema selected = ", value);
        } else {
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
    public get selectedNameCinema(): string {
        return this._selectedNameCinema || "Paris";
    }

    // Getter pour filterGenre
    public get filterGenre(): string {
        return this._filterGenre;
    }

    // Setter pour filterGenre
    public set filterGenre(value: string) {
        this._filterGenre = value;
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
    }

    // Getter pour selectedFilm
    public get selectedFilm(): Film {
        if (this._selectedFilmUUID) {
            return this.filmUUID(this._selectedFilmUUID);
        } else {
            console.error("selectedFilm : Film non trouvé, premier film pris");
            return this.films[0] // ne doit pas se produire
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

    // Getter pour selectedUtilisateurUUID
    public get selectedUtilisateurUUID(): string | undefined {
        return this._selectedUtilisateurUUID || undefined;
    }

    // Setter pour selectedUtilisateurUUID
    public set selectedUtilisateurUUID(value: string | undefined) {
        this._selectedUtilisateurUUID = value;
    }

    // Getter pour selectedUtilisateurMail
    public get selectedUtilisateurMail(): string | undefined {
        return this._selectedUtilisateurMail || undefined;
    }

    // Setter pour selectedUtilisateurMail
    public set selectedUtilisateurMail(value: string | undefined) {
        this._selectedUtilisateurMail = value;
    }

    // Getter pour selectedUtilisateurDisplayName
    public get selectedUtilisateurDisplayName(): string | undefined {
        return this._selectedUtilisateurDisplayName || undefined;
    }

    // Setter pour selectedUtilisateurDisplayName
    public set selectedUtilisateurDisplayName(value: string | undefined) {
        this._selectedUtilisateurDisplayName = value;
    }

    // Getter pour selectedReservationUUID
    public get selectedReservationUUID(): string | undefined {
        return this._selectedReservationUUID || undefined;
    }

    // Setter pour selectedReservationUUID
    public set selectedReservationUUID(value: string | undefined) {
        this._selectedReservationUUID = value;
        if (value === undefined) {
            this._selectedReservationCinema = undefined;
        }
    }

    // Getter pour selectedReservationUUID
    public get selectedReservationCinema(): string | undefined {
        return this._selectedReservationCinema || undefined;
    }

    // Méthode asynchrone pour initialiser les données depuis l'API
    // On charge l'ensemble des données de tous les cinemas, on filtrera en local
    public async chargerDepuisAPI(): Promise<void> {
        console.log("DataC: ChargerDepuisAPI")
        try {

            //  if (this._nameCinema !== "Selectionnez un cinema") {
            const response = await fetch(`http://localhost:3500/api/seances/filter?cinemasList="all"`);
            const rawData = await response.json();

            if (!Array.isArray(rawData)) {
                throw new Error('La réponse de l’API n’est pas un tableau.');
            }

            // Convertir les données brutes en instances de Seance
            this._allSeances = rawData.map((d: any) => new Seance(d));
            console.log(`Pour l'ensembles des cinemas, chargement depuis l'API : ${this.seances.length} séances, ${this.films.length} films`);

            // On recupere les tarifs
            const responseTarif = await fetch(`http://localhost:3500/api/seances/tarif`);
            const rawDataTarif = await responseTarif.json();

            if (!Array.isArray(rawDataTarif)) {
                throw new Error('La réponse de l’API n’est pas un tableau.');
            }

            // Convertir les données brutes en instances de Tarif
            this._tarifQualite = rawDataTarif.map((t: any) => new TarifQualite(t));
            console.log(`Pour l'ensemble des tarifs : chargement depuis l'API : ${this._tarifQualite.length} tarifs`);

            // Enregistrement de la date de validité
            setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);

            // Sauvegarder dans localStorage
            // this.sauverComplet();
            //  }
        } catch (error) {
            console.error('Erreur lors du chargement des données de séances : ', error);
        }
    }
    /**
     * Extraction des films du tableau seance (filtré sur filterNameCinema) ayant une séance entre deux dates,
     * @param dateInf : Date inférieur initialisée par défaut à la date du jour
     * @param dateSup : Date supérieur initialisée par défaut à la date du jour
     * cela donne par défaut les films qui ont une séance à aujourd'hui et possibilité de gérer une plage de date quelconque
     */
    private extractFilmsFromSeances(dateInf: Date = new Date(), dateSup: Date = new Date()): Film[] {
        // Utiliser une Map pour éviter les duplications (clé : filmId)
        const filmMap = new Map<string, Film>();
        this.seances.forEach((seance) => {
            const filmId = seance.filmId;
            if (!filmId) return; // Ignorer si filmId est absent
            //   console.log("iteration 2" , !filmMap.has(filmId), (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) === formatDateLocalYYYYMMDD(date)))
            //   console.log(formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')), " = " , formatDateLocalYYYYMMDD(date)) 
            if (!filmMap.has(filmId) &&
                (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) >= formatDateLocalYYYYMMDD(dateInf)) &&
                (formatDateLocalYYYYMMDD(new Date(seance.dateJour || '')) <= formatDateLocalYYYYMMDD(dateSup))
            ) {
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
    };

    // Premier jour de projection du film
    public premierJour(filmId: string) : Date {
        return new Date (this.seancesFilm(filmId)[0].dateJour || '');
    }
    // Les séances d'un film pour un jour donne
    public seancesFilmJour(filmId: string, date: Date = new Date()): Seance[] {
        return this.seances.filter((s) =>
            s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date)
        );
    }
    // Les séances d'un film sur une periode de jours
    public seancesFilmDureeJour(filmId: string, dateDeb: Date = new Date(), nombreJours: number): Seance[] {
        return this.seances.filter((s) =>
            s.filmId === filmId &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) >= formatDateLocalYYYYMMDD(dateDeb) &&
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) < formatDateLocalYYYYMMDD(ajouterJours(dateDeb, nombreJours))
        );
    }
    // Toutes les séances d'un jour
    public seancesJour(date: Date = new Date()): Seance[] {
        return this.seances.filter((s) =>
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) === formatDateLocalYYYYMMDD(date)
        );
    }

    // Toutes les séances d'un film trier par jour
    public seancesFilm(filmId: string): Seance[] {
        return this.seances
        .filter((s) => s.filmId === filmId)
        .sort((a, b) => new Date(a.dateJour || '').getTime() - new Date(b.dateJour || '').getTime());
        ;
    }
    // Tous les films pour un jour
    public filmsJour(date: Date = new Date()): Film[] {
        return this.extractFilmsFromSeances(date, date);
    }

    public filmUUID(filmId: string): Film {
        const film = this.films.find((film) => {
            return film.id == filmId;
        });


        if (!film) {
            console.error("filmUUID : Film non trouvé, premier film pris");
            return this.films[0]; // ne doit jamais se produire
        }

        return film;

    }

    public seanceSelected(): Seance {
        return this.seances.filter((s) =>
            s.seanceId === this._selectedSeanceUUID
        )[0];
    }

    public async sauverComplet(): Promise<void> {

        console.log("DataC: SauverComplet filternameCinema = ", this._filterNameCinema, " selectedNameCinema = ", this._selectedNameCinema);

        // Construire un objet « snapshot » de tout ce qu’on veut persister
        const snapshot = {
            reservationState: this._reservationState,
            seances: this._allSeances,
            tarifQualite: this._tarifQualite,
            filterNameCinema: this._filterNameCinema,
            selectedNameCinema: this._selectedNameCinema,
            selectedFilmUUID: this._selectedFilmUUID,
            selectedSeanceDate: this._selectedSeanceDate?.toISOString() || null,
            selectedSeanceUUID: this._selectedSeanceUUID,
            selectedUtilisateurUUID: this._selectedUtilisateurUUID,
            selectedUtilisateurMail: this._selectedUtilisateurMail,
            selectedUtilisateurDisplayName: this._selectedUtilisateurDisplayName,
            selectedReservationUUID: this._selectedReservationUUID,
            selectedReservationCinema: this._selectedReservationCinema

        };

        localStorage.setItem(DataController.nomStorage, JSON.stringify(snapshot));
    }

    public async chargerComplet(): Promise<void> {
        console.log("DataC: ChargerComplet")
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
                this._allSeances = parsed.seances.map((s: any) => new Seance(s));
            }

            // Restauration des tarifs
            if (Array.isArray(parsed.tarifQualite)) {
                this._tarifQualite = parsed.tarifQualite.map((t: any) => new TarifQualite(t));
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


        } catch (e) {
            console.error('Erreur de parsing du localStorage : ', e);
        }
    }

    public async init(): Promise<void> {
        console.log("DataC: Init")
        // 1) Charger depuis le localStorage
        await this.chargerComplet();

        // 2) Vérifier la validité du cache
        let mustReload = true;
        const dateAccessString = getCookie(DataController.nomCookieDateAccess);

        if (dateAccessString) {
            if (!isDifferenceGreaterThanHours(new Date(), new Date(dateAccessString), DataController.validiteCache)) {
                mustReload = false;
                console.log("DataC: cookie valide")
            } else {
                console.log("DataC: cookie validite expiré")
            }
        } else {
            console.log("DataC: cookie validite absent")
        }

        // 3) Si invalidité du cache ou seances vides, on va recharger
        if (!this.seances.length || mustReload) {
            //           if ( mustReload) {
            console.log('[init] Cache inexistant ou expiré -> rechargement depuis l’API');
            await this.chargerDepuisAPI();

        } else {
            console.log('[init] Données restaurées depuis localStorage');
        }
    }
}

/* ---------------------------------------
-- Initialisation du dataController 
-- partagé entre toutes les pages
-----------------------------------------*/

export let dataController: DataController = new DataController();