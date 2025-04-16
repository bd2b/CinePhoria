import { Film, ListFilms } from './shared-models/Film.js';
import { filmsSelectAllApi, filmsUpdateApi, filmsCreateApi } from './NetworkController.js';
import { Salle, ListSalles } from './shared-models/Salle.js';
import {
    sallesSelectAllApi, sallesUpdateApi, sallesCreateApi, seancesDisplayByCinemaApi,
    seancesseulesDeleteApi, seancesseulesCreateApi, seancesseulesUpdateApi, seancesseulesSelectApi, sallesSelectCinemaApi,
    reservationsByCinemaApi, reservationAvisUpdateApi
} from './NetworkController.js';
import { Seance, SeanceDisplay } from './shared-models/Seance.js';
import { SeanceSeule } from './shared-models/SeanceSeule.js';
import { ReservationForUtilisateur, Reservation, ReservationAvis } from './shared-models/Reservation.js';

export class DataControllerIntranet {

    private static _filmMustBeFetched: boolean = true;
    private static _allFilms: Film[] = [];

    public static async allFilms(): Promise<Film[]> {
        try {
            const films = await filmsSelectAllApi();
            if (films.length > 0) {
                this._filmMustBeFetched = false;
                this._allFilms = films;
                return films;
            }
            return films;
        } catch (error) {
            this._filmMustBeFetched = true;
            console.error(error);
            this._allFilms = [];
            return [];
        }
    }
    public static async createOrUpdateFilm(film: Film): Promise<boolean> {
        try {
            let result: { message: string } | undefined = undefined;
            // Forcer la mise à jour si le le tableau est vide
            if (this._filmMustBeFetched) await this.allFilms();

            // On cree ou met a jour selon que l'on trouve le film dans le tableau
            const filmUpdate = this._allFilms.find(f => f.id === film.id);
            if (filmUpdate) {
                result = await filmsUpdateApi(film.id, film);
            } else {
                result = await filmsCreateApi(film);
            }

            if (result.message === 'OK') {
                // On obligera à mettre à jour le cache
                this._filmMustBeFetched = true;
                return true
            }
            console.error(result.message)
            return false;
        } catch (error) {
            console.error(error)
            return false;
        }
    }

    // Gestion des salles
    private static _salleMustBeFetched: boolean = true;
    private static _allSalles: Salle[] = [];

    private static salleSort(s: Salle[]): Salle[] {
        return s.sort((a, b) => {
            const nomCinemaA = a.nameCinema?.toLowerCase() || '';
            const nomCinemaB = b.nameCinema?.toLowerCase() || '';
            const nomSalleA = a.nameSalle?.toLowerCase() || '';
            const nomSalleB = b.nameSalle?.toLowerCase() || '';

            if (nomCinemaA < nomCinemaB) return -1;
            if (nomCinemaA > nomCinemaB) return 1;

            // Sinon on compare nameSalle
            if (nomSalleA < nomSalleB) return -1;
            if (nomSalleA > nomSalleB) return 1;

            return 0;
        });
    }
    // Gestion des séances pour manageSalle
    public static async allSalles(): Promise<Salle[]> {
        try {
            const salles = this.salleSort(await sallesSelectAllApi());
            if (salles.length > 0) {
                this._salleMustBeFetched = false;
                this._allSalles = salles;
                return salles;
            }
            return salles;
        } catch (error) {
            this._salleMustBeFetched = true;
            console.error(error);
            this._allSalles = [];
            return [];
        }
    }
    public static async createOrUpdateSalle(salle: Salle): Promise<boolean> {
        try {
            let result: { message: string } | undefined = undefined;
            // Forcer la mise à jour si le le tableau est vide
            if (this._salleMustBeFetched) await this.allSalles();

            // On cree ou met a jour selon que l'on trouve le salle dans le tableau
            const salleUpdate = this._allSalles.find(f => f.id === salle.id);
            if (salleUpdate) {
                result = await sallesUpdateApi(salle.id, salle);
            } else {
                result = await sallesCreateApi(salle);
            }

            if (result.message === 'OK') {
                // On obligera à mettre à jour le cache
                this._salleMustBeFetched = true;
                return true
            }
            console.error(result.message)
            return false;
        } catch (error) {
            console.error(error)
            return false;
        }
    }

    // Gestion des séances pour manageSeance
    // Les requetes sont en temps reel sans cache local, néanmoins pour éviter de surcharger le réseau
    // On met en place le filtrage par cinema pour l'affichage et la mise à jour de la seule entité seance

    protected static _filterNameCinema?: string // Filtre de cinema

    // Getter pour filterNameCinema
    public static get filterNameCinema(): string {
        return DataControllerIntranet._filterNameCinema || "all";
    }

    // Setter pour filterNameCinema
    public static set filterNameCinema(value: string) {
        if (value.trim() === '') {
            throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        DataControllerIntranet._filterNameCinema = value.trim();

    }

    private static seanceSort(s: SeanceDisplay[]): SeanceDisplay[] {
        return s.sort((a, b) => {
            const nomFilmA = a.titleFilm?.toLowerCase() || '';
            const nomFilmB = b.titleFilm?.toLowerCase() || '';
            const nomSalleA = a.nameSalle?.toLowerCase() || '';
            const nomSalleB = b.nameSalle?.toLowerCase() || '';
            const dateSeanceA = a.dateJour?.toLowerCase() || '';
            const dateSeanceB = b.dateJour?.toLowerCase() || '';
            const heureSeanceA = a.hourBeginHHSMM?.toLowerCase() || '';
            const heureSeanceB = b.hourBeginHHSMM?.toLowerCase() || '';

            if (dateSeanceA < dateSeanceB) return -1;
            if (dateSeanceA > dateSeanceB) return 1;

            // if (nomFilmA < nomFilmB) return -1;
            // if (nomFilmA > nomFilmB) return 1;

            // Sinon on compare nameSalle
            if (nomSalleA < nomSalleB) return -1;
            if (nomSalleA > nomSalleB) return 1;

            if (heureSeanceA < heureSeanceB) return -1;
            if (heureSeanceA > heureSeanceB) return 1;

            return 0;
        });
    }
    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    public static async getSeancesDisplayFilter(): Promise<SeanceDisplay[]> {
        try {
            return DataControllerIntranet.seanceSort(await seancesDisplayByCinemaApi([DataControllerIntranet._filterNameCinema || 'all']));
        } catch (error) {
            console.error(`Erreur dans recherche des seanceDisplay : ${error}`)
            return [];
        }
    }

    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    public static async getSeancesDisplayByCinema(cinemas: string[]): Promise<SeanceDisplay[]> {
        try {
            return DataControllerIntranet.seanceSort(await seancesDisplayByCinemaApi(cinemas));
        } catch (error) {
            console.error(`Erreur dans recherche des seanceDisplay : ${error}`)
            return [];
        }
    }
    // Création ou mise à jour. Optimisation possible au niveau des API rest 
    // mais le temps tourne et je veux rester standard....
    public static async createOrUpdateSeance(seanceSeule: SeanceSeule): Promise<{ message: string }> {
        let result: { message: string } = { message: "" };
        try {
            // On cree ou met a jour selon que l'on trouve la seance sur le serveur
            try {
                const seanceSeuleUpdate = await seancesseulesSelectApi(seanceSeule.id);
                if (seanceSeuleUpdate) {
                    result.message = "update";
                } else {
                    result.message = "create"
                }
            } catch (error) {
                result.message = "create"
            }
            if (result.message === "create") {
                result = await seancesseulesCreateApi(seanceSeule);
            } else {
                result = await seancesseulesUpdateApi(seanceSeule.id, seanceSeule);
            }
            return result;
        }
        catch (error) {
            switch (result.message) {
                case "":
                    console.error(`Erreur dans la recherche de seance : ${error} , id = ${seanceSeule.id}`);
                    break;
                case "update":
                    console.error(`Erreur dans l'update de seance : ${error}, seance = ${JSON.stringify(seanceSeule)}`);
                    break;
                case "create":
                    console.error(`Erreur dans le create de seance : ${error}, seance = ${JSON.stringify(seanceSeule)}`);
                    break;
                default:
                    console.error(`Erreur inconue dans le create/update de seance : ${error}, seance = ${JSON.stringify(seanceSeule)}`);
                    break;
            }
            return result;
        }
    }

    public static async getListFilmsAll(): Promise<ListFilms[]> {
        try {
            const filmsAll = await filmsSelectAllApi();

            const listFilms = Array.from(
                new Map(
                    filmsAll
                        .filter(f => f.id && f.titleFilm && f.isActiveForNewSeances)
                        .map(f => [f.id, {
                            id: f.id!,
                            titre: f.titleFilm!,
                            duration: f.duration,
                            affiche: f.imageFilm128
                        }])
                ).values()
            );

            return listFilms;

        } catch (error) {
            console.error(`Erreur recupération ListFilmsAll : ${error}`);
            return []
        }
    }
    // Recupération des salles du cinema selectionne dans le filtre
    public static async getSallesByFilter(): Promise<ListSalles[]> {
        try {
            let cinemaName = "";
            if (!DataControllerIntranet._filterNameCinema) {
                cinemaName = 'all'
            } else {
                cinemaName = DataControllerIntranet._filterNameCinema;
            }

            let salles: Salle[] = [];

            if (cinemaName === 'all') {
                salles = await sallesSelectAllApi();
            } else {
                salles = await sallesSelectCinemaApi(cinemaName)
            }
            let listSalles: ListSalles[];
            if (cinemaName === 'all') {
                listSalles = Array.from(
                    new Map(
                        salles
                            .filter(s => s.id && s.nameSalle)
                            .map(s => [s.id, {
                                id: s.id,
                                // Si on est sur tous les cinemas, on ajoute le com du cinema dans l'intitulé de la salle
                                nomSalle: s.nameCinema! + "-" + s.nameSalle!,
                                capacite: s.capacity!,
                                numPMR: s.numPMR!
                            }])
                    ).values()
                );
            }
            else {
                listSalles = Array.from(
                    new Map(
                        salles
                            .filter(s => s.id && s.nameSalle)
                            .map(s => [s.id, {
                                id: s.id,
                                nomSalle: s.nameSalle!,
                                capacite: s.capacity!,
                                numPMR: s.numPMR!
                            }])
                    ).values()
                );
            }

            return listSalles;

        } catch (error) {
            console.error(`Erreur recupération ListFilmsAll : ${error}`);
            return []
        }
    }

    // Gestion des reservation pour manageavis
    // Les requetes sont en temps reel sans cache local, néanmoins pour éviter de surcharger le réseau
    // On met en place le filtrage par cinema pour l'affichage et la mise à jour de la seule entité seance

    // On utilise filterNameCinema commun à séance pour la gestion du filtre

    private static reservationSort(s: ReservationForUtilisateur[]): ReservationForUtilisateur[] {
        return s.sort((a, b) => {
            const nomFilmA = a.titleFilm?.toLowerCase() || '';
            const nomFilmB = b.titleFilm?.toLowerCase() || '';
            const displaynameA = a.displayname?.toLowerCase() || '';
            const displaynameB = b.displayname?.toLowerCase() || '';
            const dateSeanceA = a.dateJour?.toLowerCase() || '';
            const dateSeanceB = b.dateJour?.toLowerCase() || '';

            if (dateSeanceA < dateSeanceB) return -1;
            if (dateSeanceA > dateSeanceB) return 1;

            if (nomFilmA < nomFilmB) return -1;
            if (nomFilmA > nomFilmB) return 1;

            // Sinon on compare nameSalle
            if (displaynameA < displaynameB) return -1;
            if (displaynameA > displaynameB) return 1;

            return 0;
        });
    }

    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    public static async getReservationForUtilisateurFilter(): Promise<ReservationForUtilisateur[]> {
        try {
            return DataControllerIntranet.reservationSort(await reservationsByCinemaApi([DataControllerIntranet._filterNameCinema || 'all']));
        } catch (error) {
            console.error(`Erreur dans recherche des reservations : ${error}`)
            return [];
        }
    }

    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    public static async getReservationForUtilisateurByCinema(cinemas: string[]): Promise<ReservationForUtilisateur[]> {
        try {
            return DataControllerIntranet.reservationSort(await reservationsByCinemaApi(cinemas));
        } catch (error) {
            console.error(`Erreur dans recherche des reservations : ${error}`)
            return [];
        }
    }
    // Mise à jour de l'avis d'une réservation
    public static async updateReservationAvis(reservationAvis: ReservationAvis): Promise<{ message: string }> {
        let result: { message: string } = { message: "" };

        // On cree ou met a jour selon que l'on trouve la seance sur le serveur
        try {
            result = await reservationAvisUpdateApi(reservationAvis.id, reservationAvis);
            return result;
        }
        catch (error) {
            console.error(`Erreur inconue dans la mise à jour de l'avis : ${error}, Avis = ${JSON.stringify(reservationAvis)}`);
            return result;
        }
    }

    constructor() {
        console.log("DataCIntranet : Initialisation");
    }
}
