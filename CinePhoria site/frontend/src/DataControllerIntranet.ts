import { Film } from './shared-models/Film.js';
import { filmsSelectAllApi, filmsUpdateApi, filmsCreateApi } from './NetworkController.js';

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
            let result: { message: string} | undefined = undefined;
            // Forcer la mise à jour si le le tableau est vide
            if (this._filmMustBeFetched) await this.allFilms();

            // On cree ou met a jour selon que l'on trouve le film dans le tableau
            const filmUpdate = this._allFilms.find( f =>  f.id === film.id );
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
    constructor() {
        console.log("DataCIntranet : Initialisation");
    }
}
