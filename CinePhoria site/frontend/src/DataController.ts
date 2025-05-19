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
import { getCookie, setCookie, datePrecedentMercredi,
    sanitizeFilm, sanitizeSeance, sanitizeCinema, sanitizeTarifQualite } from './Helpers.js';
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';
import { Cinema } from './shared-models/Cinema.js';
import { getSeancesByIdApi, getVersionApi, filmsSelectAllApi } from './NetworkController.js';
import { baseUrl } from './Global.js';
import { MajSite } from './shared-models/MajSite.js';
import { majFooterVersion } from './ViewFooter.js';

// Promesse d'attente de la fin du chargement des données par les modules de page
let resolveReady: () => void;
export const dataReady: Promise<void> = new Promise((resolve) => {
    resolveReady = resolve;
});




export class DataController {

    //  protected version: { majeure: number, mineure: number, build: number } = {majeure: 0, mineure: 0, build: 0};

    version: MajSite = { idInt: 0, MAJEURE: 0, MINEURE: 0, BUILD: 0, dateMaj: new Date("01/01/1980") };

    protected _reservationState: ReservationState = ReservationState.PendingChoiceSeance;

    // Ensemble des données chargées systématiquement
    protected _allSeances: Seance[] = [];
    protected _Cinemas: Cinema[] = [];

    // 🏆 Variable calculée : retourne les séances filtrées par cinéma
    get seances(): Seance[] {
        if (this.filterNameCinema === 'all') {
            return this._allSeances;
        } else {
            return this._allSeances.filter(seance => seance.nameCinema === this._filterNameCinema);
        }
    }

    get filmsAll() : Film[] {
        const dateMax = new Date();
        dateMax.setDate((dateMax).getDate() + 90);
        const films = this.extractFilmsFromSeances(new Date(), dateMax , true);
        console.log("Extract",films);
        return films;
    }

    // 🏆 Variable calculée : retourne les films filtrés par cinéma ayant une séeance dans les 90 jours
    get films(): Film[] {
        const dateMax = new Date();
        dateMax.setDate((dateMax).getDate() + 90);
        const films = this.extractFilmsFromSeances(new Date(), dateMax);
        console.log("Extract",films);
        return films;
    }

    // 🏆 Variable calculée : retourne les films qui ont une date de sortie au dernier mercredi 
    // ou les films du catalogue trie par date de sortie pour tous les cinemas
    get filmsSortiesRecentes(): { films: Film[], message: string } {
        const precedentMercredi = datePrecedentMercredi();

        const filmsMercredi = this.filmsAll.filter((f) => {
            if (!f.dateSortieCinePhoria) return false;
            const sortieDate = new Date(f.dateSortieCinePhoria);
            return formatDateLocalYYYYMMDD(sortieDate) === formatDateLocalYYYYMMDD(precedentMercredi);
        });

        const filmsaTrier = filmsMercredi.length > 0 ? filmsMercredi : this.films;
        const messageAssocie = filmsMercredi.length > 0 ? "Nouveaute de la semaine" : "Notre catalogue";

        const filmsListeFinal = filmsaTrier
            .filter(f => f.dateSortieCinePhoria)
            .sort((a, b) => new Date(b.dateSortieCinePhoria!).getTime() - new Date(a.dateSortieCinePhoria!).getTime());
        return { films: filmsListeFinal, message: messageAssocie }
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
    // Variable calculee : liste des films filtrés sur le cinéma puis sur le genre Genre
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

    // getter pour tous les cinema
    public get cinemas(): Cinema[] {
        return this._Cinemas;
    }

    protected _tarifQualite: TarifQualite[] = [];

    protected _filterNameCinema?: string // = "all"; // On filtre sur tous les cinémas par défaut
    protected _selectedNameCinema?: string // = "Paris" // Par defaut le cinema selectionne dans la page Reservation
    protected _filterGenre: string = "all"; // Filtre sur tous les genres 

    protected _selectedFilmUUID?: string; // UUID du film actuellement selectionne
    protected _selectedSeanceDate?: Date; // date du jour actuellement selectionnee
    protected _selectedSeanceUUID?: string | undefined // UUID de la séance selectionnée

    protected _selectedUtilisateurUUID?: string | undefined // UUID de l'utilisateur
    protected _selectedUtilisateurMail?: string | undefined // Mail de l'utilisateur
    protected _selectedUtilisateurDisplayName?: string | undefined // displayName de l'utilisateur

    protected _selectedReservationUUID?: string | undefined // UUID de la reservation
    protected _selectedReservationCinema?: string | undefined // Cinema de localisation de la reservation
    protected _selectedListSeats?: string | undefined // Liste des sièges réservés séparés par une ,

    protected static validiteCache: number = 1; // Apres validiteCache heure on force le rechargement des données
    protected static nomCookieDateAccess: string = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
    protected static nomStorage: string = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema


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
        this.sauverEtatGlobal();

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
        console.log("Set selectedFilmUUID");
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

    // Getter pour selectedListSeats
    public get selectedListSeats(): string | undefined {
        return this._selectedListSeats || undefined;
    }

    // Setter pour selectedListSeats
    public set selectedListSeats(value: string | undefined) {
        this._selectedListSeats = value;
        if (value === undefined) {
            this._selectedListSeats = undefined;
        }
    }

    // Getter pour selectedReservationUUID
    public get selectedReservationCinema(): string | undefined {
        return this._selectedReservationCinema || undefined;
    }


    // Méthode asynchrone pour initialiser les données depuis l'API
    // On charge l'ensemble des données de toutes les séances, on filtrera en local
    public async chargerDepuisAPI(): Promise<void> {
        console.log("DataC: ChargerDepuisAPI")

        try {

            // 0) Chargement de tous les films dans la variables de class allFilms de Seance
            Seance.allFilms = (await filmsSelectAllApi()).filter(sanitizeFilm);

            // 1) Chargement de toutes les séances
            const response = await fetch(`${baseUrl}/api/seances/filter?cinemasList="all"`);
            const rawData = await response.json();

            if (!Array.isArray(rawData)) {
                throw new Error('La réponse de l’API n’est pas un tableau.');
            }

            // Convertir les données brutes en instances de Seance
            this._allSeances = rawData.filter(sanitizeSeance).map((d: any) => new Seance(d));
            console.log(`Pour l'ensembles des cinemas, chargement depuis l'API : ${this.seances.length} séances, ${this.films.length} films`);

            // 2) On recupere les tarifs
            const responseTarif = await fetch(`${baseUrl}/api/seances/tarif`);
            const rawDataTarif = await responseTarif.json();

            if (!Array.isArray(rawDataTarif)) {
                throw new Error('La réponse de l’API n’est pas un tableau.');
            }

            // Convertir les données brutes en instances de Tarif
            this._tarifQualite = rawDataTarif.filter(sanitizeTarifQualite).map((t: any) => new TarifQualite(t));
            console.log(`Pour l'ensemble des tarifs : chargement depuis l'API : ${this._tarifQualite.length} tarifs`);

            // 3) Chargement de tous les cinemas (pour le pied de page)
            const responseCinema = await fetch(`${baseUrl}/api/cinemas`);
            const rawDataCinema = await responseCinema.json();

            if (!Array.isArray(rawDataCinema)) {
                throw new Error('La réponse de l’API n’est pas un tableau.');
            }

            // Convertir les données brutes en instances de Cinema
            this._Cinemas = rawDataCinema.filter(sanitizeCinema).map((c: any) => new Cinema(c));
            console.log(`Pour l'ensemble des cinemas, chargement depuis l'API : ${this._Cinemas.length} cinemas`);

            // Enregistrement de la date de validité
            setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);

        } catch (error) {
            console.error('Erreur lors du chargement des données de séances : ', error);
        } finally {

        }
    }
    /**
   * Extraction des films du tableau seance (filtré sur filterNameCinema) ayant une séance entre deux dates,
   * @param dateInf : Date inférieur initialisée par défaut à la date du jour
   * @param dateSup : Date supérieur initialisée par défaut à la date du jour
   * @param withAllCinema : true force à partir de toutes les séances, false prend les séances qui sont filtrés par 
   * le cinema selectionne dans le traitement Reservation
   * cela donne par défaut les films qui ont une séance à aujourd'hui et possibilité de gérer une plage de date quelconque
   */
    private extractFilmsFromSeances(dateInf: Date = new Date(), dateSup: Date = new Date(), withAllCinema: boolean = false): Film[] {
        console.log("Nombre de seances", this.seances.length)
        let seances: Seance[]
        if (withAllCinema) {
            seances = this._allSeances;
        } else {
            seances = this.seances
        }
        const filmIds = new Set(
            seances
                .filter(seance => {
                    const dateStr = seance.dateJour;
                    if (!dateStr) return false;
                    const date = new Date(dateStr);
                    return formatDateLocalYYYYMMDD(date) >= formatDateLocalYYYYMMDD(dateInf) &&
                        formatDateLocalYYYYMMDD(date) <= formatDateLocalYYYYMMDD(dateSup);
                })
                .map(seance => seance.filmId)
                .filter((id): id is string => !!id)
        );

        return Seance.allFilms.filter(film => film.id && filmIds.has(film.id));
    }

    // Premier jour de projection du film
    public premierJour(filmId: string): Date {
        if (this.seancesFilm(filmId).length > 0) {
            const dateFilm = this.seancesFilm(filmId)[0].dateJour;
            if (dateFilm) {
                return new Date(dateFilm)
            }
        }
        return new Date();
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

    public seanceById(seanceId: string): Seance {
        return this._allSeances.filter((s) =>
            s.seanceId === seanceId
        )[0];
    }



    /* ---------------------------------------
    -- Gestion de la persistence des dpnnées dans le storage 
    -- La limitation de taille à 5Mo nécessite de fractionner les données en plusieurs storage
    -----------------------------------------*/

    protected static KEY_GLOBAL = 'myAppState';             // Pour l’état global (reservationState, selectedFilm, etc.)
    protected static KEY_TARIFS = 'myAppTarifs';            // Pour le tarifQualite
    protected static KEY_CINEMAS = 'myAppCinemas';          // Pour la liste des Cinema
    protected static KEY_FILMS = 'myAppFilms';                 // Pour la liste des Films

    // Pour les seances, on fera KEY_SEANCES + "_" + cinemaName => "myAppSeances_Paris", etc.
    protected static KEY_SEANCES = 'myAppSeances';


    public async sauverEtatGlobal(): Promise<void> {
        const snapshotGlobal = {
            version: this.version,
            reservationState: this._reservationState,
            filterNameCinema: this._filterNameCinema,
            selectedNameCinema: this._selectedNameCinema,
            selectedFilmUUID: this._selectedFilmUUID,
            selectedSeanceDate: this._selectedSeanceDate?.toISOString() || null,
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
    }

    public async sauverTarifs(): Promise<void> {
        if (!this._tarifQualite) return;

        const arr = this._tarifQualite; // tableau de TarifQualite
        const str = JSON.stringify(arr);
        console.log(`DataC: Sauvegarde des tarifs => taille = ${str.length}`);
        localStorage.setItem(DataController.KEY_TARIFS, str);
    }

    public async sauverCinemas(): Promise<void> {
        if (!this._Cinemas) return;

        const arr = this._Cinemas; // tableau de Cinema
        const str = JSON.stringify(arr);
        console.log(`DataC: Sauvegarde des Cinemas => taille = ${str.length}`);
        localStorage.setItem(DataController.KEY_CINEMAS, str);
    }

    public async sauverFilms(): Promise<void> {
        if (!Seance.allFilms) return;

        const arr = Seance.allFilms; // tableau de Cinema
        const str = JSON.stringify(arr);
        console.log(`DataC: Sauvegarde des Films => taille = ${str.length}`);
        localStorage.setItem(DataController.KEY_FILMS, str);
    }


    public async sauverSeancesParCinema(cinema?: string): Promise<void> {
        // On suppose que this._allSeances contient toutes les séances de tous les cinémas
        if (!this._allSeances) return;

        // Regrouper par cinema
        const mapCinemaToSeances = new Map<string, Seance[]>();

        this._allSeances.forEach((s) => {
            const cName = s.nameCinema?.trim() || 'unknown';
            if (!mapCinemaToSeances.has(cName)) {
                mapCinemaToSeances.set(cName, []);
            }
            mapCinemaToSeances.get(cName)?.push(s);
        });

        if (cinema) {
            // Sauvegarder uniquement le cinéma spécifié
            const seancesCinema = mapCinemaToSeances.get(cinema);
            if (seancesCinema) {
                const str = JSON.stringify(seancesCinema);
                const key = `${DataController.KEY_SEANCES}_${cinema}`;
                console.log(`DataC: Sauvegarde séances pour '${cinema}' => taille ${str.length} chars`);
                localStorage.setItem(key, str);
            } else {
                console.warn(`Aucune séance trouvée pour le cinéma '${cinema}'.`);
            }
        } else {
            // Sauvegarder tous les cinémas comme précédemment
            mapCinemaToSeances.forEach((seances, cName) => {
                const str = JSON.stringify(seances);
                const key = `${DataController.KEY_SEANCES}_${cName}`;
                console.log(`DataC: Sauvegarde séances pour '${cName}' => taille ${str.length} chars`);
                localStorage.setItem(key, str);
            });
        }
    }

    public async sauverComplet(): Promise<void> {
        await this.sauverEtatGlobal();
        await this.sauverTarifs();
        await this.sauverCinemas();
        await this.sauverFilms();
        await this.sauverSeancesParCinema();
    }

    public async chargerEtatGlobal(): Promise<void> {
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
        } catch (e) {
            console.error('DataC: Erreur parsing état global', e);
        }
    }

    public async chargerTarifs(): Promise<void> {
        const saved = localStorage.getItem(DataController.KEY_TARIFS);
        if (!saved) return;
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                console.log("arr", arr),
                    this._tarifQualite = arr.filter(sanitizeTarifQualite).map((t: any) => new TarifQualite(t));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing tarifs', e);
        }
    }

    public async chargerCinemas(): Promise<void> {
        const saved = localStorage.getItem(DataController.KEY_CINEMAS);
        if (!saved) return;
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                this._Cinemas = arr.filter(sanitizeCinema).map((c: any) => new Cinema(c));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing cinemas', e);
        }
    }

    public async chargerFilms(): Promise<void> {
        const saved = localStorage.getItem(DataController.KEY_FILMS);
        if (!saved) return;
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                Seance.allFilms = arr.filter(sanitizeFilm).map((f: any) => new Film(f));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing films', e);
        }
    }

    public async chargerSeancesPourCinema(cinemaName: string): Promise<Seance[]> {
        const key = `${DataController.KEY_SEANCES}_${cinemaName}`;
        const saved = localStorage.getItem(key);
        if (!saved) return [];
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                return arr.filter(sanitizeSeance).map((s: any) => new Seance(s));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing seances pour', cinemaName, e);
        }
        return [];
    }

    public async chargerSeancesTousCinemas(): Promise<void> {
        // S’assurer qu’on a la liste des cinémas
        if (!this._Cinemas || this._Cinemas.length === 0) {
            console.warn("DataC: Aucun cinéma n’est chargé, impossible de charger les séances tous cinémas.");
            return;
        }

        // Vider ou reconstituer _allSeances
        this._allSeances = [];

        for (const cinemaObj of this._Cinemas) {
            const cName = cinemaObj.nameCinema?.trim() || 'unknown';
            const partialSeances = await this.chargerSeancesPourCinema(cName);
            // Ajouter au grand tableau
            this._allSeances.push(...partialSeances);
        }

        console.log(`DataC: Toutes les séances de ${this._Cinemas.length} cinémas chargées. Nombre total de séances : ${this._allSeances.length}.`);
    }

    public async chargerComplet(): Promise<void> {
        console.log("DataC: ChargerComplet de tous les storages");

        // 1) Charger l’état global
        await this.chargerEtatGlobal();

        // 2) Charger les tarifs
        await this.chargerTarifs();

        // 3) Charger la liste des cinémas
        await this.chargerCinemas();

        // 3) Charger la liste des films
        await this.chargerFilms();

        // 4) Charger toutes les séances pour tous les cinémas
        await this.chargerSeancesTousCinemas();

        // => À la fin, this._allSeances contient l’ensemble des séances
    }

    public async init(): Promise<void> {
        console.log("DataC: Init");


        // 1) Charger depuis localStorage
        await this.chargerComplet();

        // 1 bis) Vérifier si la dernier mise à jour du serveur a été prise en compte ou si on 
        // a changer de version majeure
        try {
            const newVersion = await getVersionApi();

            console.log("Version du serveur = ", JSON.stringify(newVersion));
            console.log("Version du cache = ", JSON.stringify(this.version))

            const isNouvelleVersionServeur = this.version.dateMaj && newVersion.dateMaj &&
                this.version.dateMaj < newVersion.dateMaj;
            const isNouvelleVersionMajeure = this.version.MAJEURE && newVersion.MAJEURE &&
                this.version.MAJEURE !== newVersion.MAJEURE;

            if (isNouvelleVersionServeur || isNouvelleVersionMajeure) {
                console.log(`DataC: nouvelle version ${isNouvelleVersionServeur ? "serveur" : "majeur"} - rechargement depuis l’API`);
                await this.chargerDepuisAPI();

                resolveReady(); // 🔹 Signale que les données sont prêtes

                this.version = newVersion;
                await this.sauverComplet();

                return;
            } else {
                console.log("Pas de mise à jour de cache");
            }
        } catch (error) {
            console.error("Impossible de versifier la mise à jour su site = ", error)
        }

        // 2) Vérifier la validité du cache via cookie
        let mustReload = true;
        const dateAccessString = getCookie(DataController.nomCookieDateAccess);

        if (dateAccessString) {
            if (!isDifferenceGreaterThanHours(new Date(), new Date(dateAccessString), DataController.validiteCache)) {
                mustReload = false;
                console.log("DataC: cookie valide");
            } else {
                console.log("DataC: cookie validite expiré");
            }
        } else {
            console.log("DataC: cookie validite absent");
        }

        // 3) Si invalidité du cache ou pas de séances, on recharge depuis API
        if (!this._allSeances.length || mustReload) {
            console.log('[init] Cache inexistant/vide ou expiré -> rechargement depuis l’API');
            await this.chargerDepuisAPI();
            await this.sauverComplet();
        } else {
            console.log('[init] Données restaurées depuis localStorage');
        }

        resolveReady(); // 🔹 Signale que les données sont prêtes
    }

    public async getSeanceFromDB (seancesUUID: string[]) : Promise<Seance[]> {
        try {
            const seancesAjour = await getSeancesByIdApi(seancesUUID);
            return seancesAjour;
        } catch (error) {
            console.error("Erreur dans la récupération de seances : " + error);
        }
        return [];
    }

    // Rafraichissement du cache pour une liste quelconque de séances
    public async updateSeances(seancesUUID: string[]): Promise<void> {
        console.log("Update séances UUID =", seancesUUID);
        try {
            const seancesAjour = await getSeancesByIdApi(seancesUUID);

            // Structure pour regrouper les séances par cinéma
            const seancesParCinema = new Map<string, Seance[]>();

            // 1. Mise à jour du DataController et regroupement par cinéma
            seancesAjour.forEach(seanceVar => {
                const indexCible = this._allSeances.findIndex(seance => seance.seanceId === seanceVar.seanceId);
                if (indexCible !== -1) {
                    this._allSeances[indexCible] = seanceVar;
                } else {
                    console.error("Séance non trouvée : ", seanceVar.seanceId);
                }

                const cinemaName = seanceVar.nameCinema || 'unknown';
                if (!seancesParCinema.has(cinemaName)) {
                    seancesParCinema.set(cinemaName, []);
                }
                seancesParCinema.get(cinemaName)?.push(seanceVar);
            });

            // 2. Mise à jour du cache par cinéma
            for (const [cinema, seancesModifiees] of seancesParCinema.entries()) {
                const storageKey = `${DataController.KEY_SEANCES}_${cinema}`;
                const existingSeancesStr = localStorage.getItem(storageKey);
                let existingSeances: Seance[] = [];

                if (existingSeancesStr) {
                    existingSeances = JSON.parse(existingSeancesStr);
                }

                // Mises à jour ciblées des séances modifiées
                seancesModifiees.forEach(updatedSeance => {
                    const index = existingSeances.findIndex(s => s.seanceId === updatedSeance.seanceId);
                    if (index !== -1) {
                        existingSeances[index] = updatedSeance;
                    } else {
                        existingSeances.push(updatedSeance);  // ajoute si inexistant
                    }
                });

                localStorage.setItem(storageKey, JSON.stringify(existingSeances));
                console.log(`DataC: Cache mis à jour pour cinéma '${cinema}', ${seancesModifiees.length} séances modifiées.`);
            }

        } catch (error) {
            console.error("Erreur dans mise à jour des séances : " + error);
        }
    }
}

/* ---------------------------------------
-- Initialisation du dataController 
-- partagé entre toutes les pages
-----------------------------------------*/

export let dataController: DataController = new DataController();