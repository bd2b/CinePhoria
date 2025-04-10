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
import { sallesSelectAllApi, sallesUpdateApi, sallesCreateApi } from './NetworkController.js';
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
    static salleSort(s) {
        return s.sort((a, b) => {
            var _a, _b, _c, _d;
            const nomCinemaA = ((_a = a.nameCinema) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            const nomCinemaB = ((_b = b.nameCinema) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
            const nomSalleA = ((_c = a.nameSalle) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
            const nomSalleB = ((_d = b.nameSalle) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
            if (nomCinemaA < nomCinemaB)
                return -1;
            if (nomCinemaA > nomCinemaB)
                return 1;
            // Sinon on compare nameSalle
            if (nomSalleA < nomSalleB)
                return -1;
            if (nomSalleA > nomSalleB)
                return 1;
            return 0;
        });
    }
    static allSalles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salles = this.salleSort(yield sallesSelectAllApi());
                if (salles.length > 0) {
                    this._salleMustBeFetched = false;
                    this._allSalles = salles;
                    return salles;
                }
                return salles;
            }
            catch (error) {
                this._salleMustBeFetched = true;
                console.error(error);
                this._allSalles = [];
                return [];
            }
        });
    }
    static createOrUpdateSalle(salle) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = undefined;
                // Forcer la mise à jour si le le tableau est vide
                if (this._salleMustBeFetched)
                    yield this.allSalles();
                // On cree ou met a jour selon que l'on trouve le salle dans le tableau
                const salleUpdate = this._allSalles.find(f => f.id === salle.id);
                if (salleUpdate) {
                    result = yield sallesUpdateApi(salle.id, salle);
                }
                else {
                    result = yield sallesCreateApi(salle);
                }
                if (result.message === 'OK') {
                    // On obligera à mettre à jour le cache
                    this._salleMustBeFetched = true;
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
// Gestion des salles
DataControllerIntranet._salleMustBeFetched = true;
DataControllerIntranet._allSalles = [];
