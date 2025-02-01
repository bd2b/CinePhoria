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
import { Seance, TarifQualite } from './shared-models/Seance.js';  // extension en .js car le compilateur ne fait pas l'ajout de l'extension
import { Film } from './shared-models/Film.js';
import { getCookie, setCookie } from './Helpers.js';
import { extraireMoisLettre, creerDateLocale, ajouterJours, dateProchainMardi, formatDateJJMM, formatDateLocalYYYYMMDD, isDifferenceGreaterThanHours, isUUID } from './Helpers.js';

export enum ReservationState {
    PendingChoiceSeance = "PendingChoiceSeance",    // Choix de seance en cours , le panel choix est affiché
    PendingChoiceSeats = "PendingChoiceSeats",      // Choix de tarifs en cours, le panel reserve est affiché
    ReserveCompteToConfirm = "ReserveCompteToConfirm",    // Une reservation a été enregistrée (film, seance, nombre de siege, nombre de prm, email communiqués) 
    // avec un compte provisoire qu'il faut confirmer
    ReserveMailToConfirm = "ReserveMailToConfirm",  // Le compte a été confirmé, il faut maintenant confirmer le mail en saisissant le code reçu dans la modal
    ReserveToConfirm = "ReserveToConfirm",          // Une reservation a été enregistrée (film, seance, nombre de siege, nombre de prm, email communiqués) 
    // avec un email qui est celui d'un compte existant                                     
    ReserveConfirmed = "ReserveConfirmed"           // La reservation est confirmé après login sur un compte existant, il y a assez de place (sieges et PMR), et l'email est enregistré comme compte
}

export class DataController {

    private _reservationState: ReservationState = ReservationState.PendingChoiceSeance;
    private _seances: Seance[] = [];
    private _films: Film[] = [];
    private _tarifQualite: TarifQualite[] = [];
    private _nameCinema: string;
    private _selectedFilmUUID?: string; // UUID du film actuellement selectionne
    private _selectedSeanceDate?: Date; // date du jour actuellement selectionnee
    private _selectedSeanceUUID?: string | undefined // UUID de la séance selectionnée
    private _selectedUtilisateurUUID?: string | undefined // UUID de l'utilisateur
    private _selectedUtilisateurMail?: string | undefined // Mail de l'utilisateur
    private _selectedUtilisateurDisplayName?: string | undefined // displayName de l'utilisateur
    private _selectedReservationUUID?: string | undefined // UUID de la reservation
    private _selectedReservationStatut?: string | undefined // Statut de la reservation _selectedReservationUUID , si définie elle est confirme



    private static validiteCache: number = 1; // Apres validiteCache heure on force le rechargement des données
    private static nomCookieDateAccess: string = 'dateAccess'; // Nom du cookie pour stocker la date de mise à jour
    private static nomStorage: string = 'storage'; // Nom du storage pour stocker toutes les SeancesFilmsSalle du cinema


    // Getter pour reservationState
    public get reservationState(): ReservationState {
        return this._reservationState;
    }

    // Setter pour selectedSeanceUUID
    public set reservationState(value: ReservationState) {
        console.log("Mise a jour statut reservation = " + value)
        this._reservationState = value;
    }

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
    get allTarifQualite(): TarifQualite[] {
        return this._tarifQualite;
    }

    // Getter pour tous les tarifQualite
    get allFilms(): Film[] {
        return this._films;
    }

    // Getter pour nameCinema
    public get nameCinema(): string {
        return this._nameCinema;
    }


    public set nameCinema(value: string) {
        if (value.trim() === '') {
          throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        const isNewCinema = (value !== this._nameCinema);
        this._nameCinema = value;
      
        if (isNewCinema) {
          // 1) Expiration du cookie dateAccess (pour forcer le rechargement)
          setCookie(DataController.nomCookieDateAccess, ' ', -1);
          // 2) Vider ou invalider le localStorage
          localStorage.removeItem(DataController.nomStorage); 
          // 3) Vider les tableaux internes
          this._seances = [];
          this._films = [];
          this._tarifQualite = [];
          // 4) Re-lancement de la logique de chargement
          this.init();
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
    }

    // Getter pour _selectedReservationStatut
    public get selectedReservationStatut(): string | undefined {
        return this._selectedReservationStatut || undefined;
    }

    // Setter pour selectedReservationStatut
    public set selectedReservationStatut(value: string | undefined) {
        this._selectedReservationStatut = value;
    }

    constructor(nameCinema: string) {
        this._nameCinema = nameCinema;
        console.log("New avec " + nameCinema);
        // Le constructeur ne fait pas d’appel asynchrone
        // On doit appeler manuellement dataController.init() après l’avoir construit
      }

    // Méthode asynchrone pour initialiser les données depuis l'API
    public async chargerDepuisAPI(): Promise<void> {
        try {

            if (this._nameCinema !== "Selectionnez un cinema") {
                const response = await fetch(`http://localhost:3500/api/seances/filter?cinemasList="${this.nameCinema}"`);
                const rawData = await response.json();

                if (!Array.isArray(rawData)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }

                // Convertir les données brutes en instances de Seance
                this._seances = rawData.map((d: any) => new Seance(d));
                this.extractFilmsFromSeances();
                console.log(`Pour ${this.nameCinema} : chargement depuis l'API : ${this._seances.length} séances, ${this._films.length} films`);

                // On recupere les tarifs
                const responseTarif = await fetch(`http://localhost:3500/api/seances/tarif`);
                const rawDataTarif = await responseTarif.json();

                if (!Array.isArray(rawDataTarif)) {
                    throw new Error('La réponse de l’API n’est pas un tableau.');
                }

                // Convertir les données brutes en instances de Tarif
                this._tarifQualite = rawDataTarif.map((t: any) => new TarifQualite(t));
                console.log(`Pour ${this.nameCinema} : chargement depuis l'API : ${this._tarifQualite.length} tarifs`);

                // Enregistrement de la date 
                setCookie(DataController.nomCookieDateAccess, (new Date()).toISOString(), 1);

                // Sauvegarder dans localStorage
                // this.sauver();
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
            formatDateLocalYYYYMMDD(new Date(s.dateJour || '')) < formatDateLocalYYYYMMDD(ajouterJours(dateDeb, nombreJours))
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

    public seanceSelected(): Seance {
        return this._seances.filter((s) =>
            s.seanceId === this._selectedSeanceUUID
        )[0];
    }


    public sauver(): void {
        const dataToSave = {
            seances: this._seances,
            tarifQualite: this._tarifQualite
        };
        localStorage.setItem(DataController.nomStorage, JSON.stringify(dataToSave));
    }

    public charger(): void {
        const saved = localStorage.getItem(DataController.nomStorage);

        if (saved) {
            const parsed = JSON.parse(saved);

            // Restaurer les séances
            this._seances = (parsed.seances || []).map((s: any) => ({
                ...s,
                date: new Date(s.date) // Convertir les dates en objets `Date`
            }));

            // Restaurer les films
            this._tarifQualite = parsed.tarifQualite || [];
        } else {
            console.warn("Aucune donnée trouvée dans le localStorage.");
        }
    }

    public sauverComplet(): void {
        // Construire un objet « snapshot » de tout ce qu’on veut persister
        const snapshot = {
            reservationState: this._reservationState,
            seances: this._seances,
            films: this._films,
            tarifQualite: this._tarifQualite,
            nameCinema: this._nameCinema,
            selectedFilmUUID: this._selectedFilmUUID,
            selectedSeanceDate: this._selectedSeanceDate?.toISOString() || null,
            selectedSeanceUUID: this._selectedSeanceUUID,
            selectedUtilisateurUUID: this._selectedUtilisateurUUID,
            selectedUtilisateurMail: this._selectedUtilisateurMail,
            selectedUtilisateurDisplayName: this._selectedUtilisateurDisplayName,
            selectedReservationUUID: this._selectedReservationUUID,
            selectedReservationStatut: this._selectedReservationStatut
            
        };

        localStorage.setItem(DataController.nomStorage, JSON.stringify(snapshot));
    }

    public async chargerComplet(): Promise<void> {
        const saved = localStorage.getItem(DataController.nomStorage);

        if (!saved) {
            console.warn("Aucune donnée trouvée dans le localStorage.");
            return;
        }
        try {
            const parsed = JSON.parse(saved);

            // Restauration du state
            this._reservationState = parsed.reservationState || ReservationState.PendingChoiceSeance;

            // Restauration des séances
            if (Array.isArray(parsed.seances)) {
                // Convertir en instances de Seance si besoin
                this._seances = parsed.seances.map((s: any) => new Seance(s));
            }

            // Restauration des films (si vous les enregistrez, attention à leur typage)
            if (Array.isArray(parsed.films)) {
                this._films = parsed.films.map((f: any) => new Film(f));
            }

            // Restauration des tarifs
            if (Array.isArray(parsed.tarifQualite)) {
                this._tarifQualite = parsed.tarifQualite.map((t: any) => new TarifQualite(t));
            }

            // Autres champs
            this._nameCinema = parsed.nameCinema ?? 'Selectionnez un cinema';
            this._selectedFilmUUID = parsed.selectedFilmUUID || undefined;
            this._selectedSeanceUUID = parsed.selectedSeanceUUID || undefined;
            this._selectedUtilisateurUUID = parsed.selectedUtilisateurUUID || undefined;
            this._selectedUtilisateurMail = parsed.selectedUtilisateurMail || undefined;
            this._selectedUtilisateurDisplayName = parsed.selectedUtilisateurDisplayName || undefined;
            this._selectedReservationUUID = parsed.selectedReservationUUID || undefined;
            this._selectedReservationStatut = parsed.selectedReservationStatut || undefined;

            // Reconstruire la date
            if (parsed.selectedSeanceDate) {
                this._selectedSeanceDate = new Date(parsed.selectedSeanceDate);
            }

        } catch (e) {
            console.error('Erreur de parsing du localStorage : ', e);
        }
    }

    public async init(): Promise<void> {
        // // 1) Charger depuis le localStorage
        // console.log("init 1");
        // await this.chargerComplet(); // ou this.charger()
    
        // 2) Vérifier la validité du cache
        let mustReload = true;
        const dateAccessString = getCookie(DataController.nomCookieDateAccess);
        
        if (dateAccessString) {
          if (!isDifferenceGreaterThanHours(new Date(), new Date(dateAccessString), DataController.validiteCache)) {
            mustReload = false;
          }
        }
    
        // 3) Si invalidité du cache, on va recharger
        if (!this._seances.length || mustReload) {
          console.log('[init] Cache inexistant ou expiré -> rechargement depuis l’API');
          await this.chargerDepuisAPI();
        
        } else {
          console.log('[init] Données restaurées depuis localStorage');
        }
      }
}
