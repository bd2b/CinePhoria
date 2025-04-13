import { Film } from './shared-models/Film.js';
import { filmsSelectAllApi, filmsUpdateApi, filmsCreateApi } from './NetworkController.js';
import { Salle } from './shared-models/Salle.js';
import {
    sallesSelectAllApi, sallesUpdateApi, sallesCreateApi, seancesDisplayByCinemaApi,
    seancesseulesDeleteApi, seancesseulesCreateApi, seancesseulesUpdateApi, seancesseulesSelectApi
} from './NetworkController.js';
import { Seance, SeanceDisplay } from './shared-models/Seance.js';
import { SeanceSeule } from './shared-models/SeanceSeule.js';

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

    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    public static async getSeancesDisplayByCinema(cinemas: string[]): Promise<SeanceDisplay[]> {
        try {
            return await seancesDisplayByCinemaApi(cinemas)
        } catch (error) {
            console.error(`Erreur dans recherche des seanceDisplay : ${error}`)
            return [];
        }
    }
    // Création ou mise à jour. Optimisation possible au niveau des API rest 
    // mais le temps tourne et je veux rester standard....
    public static async createOrUpdateSeance(seanceSeule: SeanceSeule): Promise<boolean> {
        let result: { message: string } = { message: "" };
        try {
            // On cree ou met a jour selon que l'on trouve la seance sur le serveur
            try {
                const seanceSeuleUpdate = seancesseulesSelectApi(seanceSeule.id);
                result.message = "update";
            } catch (error) {
                result.message = "create"
            }
            if (result.message = "create") {
                await seancesseulesCreateApi(seanceSeule);
            } else {
                await seancesseulesUpdateApi(seanceSeule.id, seanceSeule);
            }
            return true;
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
              return false;
        }
}
constructor() {
    console.log("DataCIntranet : Initialisation");
}
}
