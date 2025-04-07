var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { filmsSelectAllApi, filmsUpdateApi, filmsCreateApi } from './NetworkController.js';
export class DataControllerIntranet {
    static allFilms() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const films = yield filmsSelectAllApi();
                if (films.length > 0) {
                    this._filmMustBeFetched = false;
                    this._allFilms = films;
                    return films;
                }
                return films;
            }
            catch (error) {
                this._filmMustBeFetched = true;
                console.error(error);
                this._allFilms = [];
                return [];
            }
        });
    }
    static createOrUpdateFilm(film) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = undefined;
                // Forcer la mise à jour si le le tableau est vide
                if (this._filmMustBeFetched)
                    yield this.allFilms();
                // On cree ou met a jour selon que l'on trouve le film dans le tableau
                const filmUpdate = this._allFilms.find(f => f.id === film.id);
                if (filmUpdate) {
                    result = yield filmsUpdateApi(film.id, film);
                }
                else {
                    result = yield filmsCreateApi(film);
                }
                if (result.message === 'OK') {
                    // On obligera à mettre à jour le cache
                    this._filmMustBeFetched = true;
                    return true;
                }
                console.error(result.message);
                return false;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    constructor() {
        console.log("DataCIntranet : Initialisation");
    }
}
DataControllerIntranet._filmMustBeFetched = true;
DataControllerIntranet._allFilms = [];
