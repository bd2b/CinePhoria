var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { filmsSelectAllApi, filmsUpdateApi, filmsCreateApi, employeUpdateApi } from './NetworkController.js';
import { sallesSelectAllApi, sallesUpdateApi, sallesCreateApi, seancesDisplayByCinemaApi, seancesseulesCreateApi, seancesseulesUpdateApi, seancesseulesSelectApi, sallesSelectCinemaApi, reservationsByCinemaApi, reservationAvisUpdateApi, employesSelectAllApi, getEmployeByMatriculeApi, employeCreateApi, employeDeleteApi, getReservationStatsApi } from './NetworkController.js';
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
    // Gestion des séances pour manageSalle
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
    // Getter pour filterNameCinema
    static get filterNameCinema() {
        return DataControllerIntranet._filterNameCinema || "all";
    }
    // Setter pour filterNameCinema
    static set filterNameCinema(value) {
        if (value.trim() === '') {
            throw new Error('Le nom du cinéma ne peut pas être vide.');
        }
        DataControllerIntranet._filterNameCinema = value.trim();
    }
    static seanceSort(s) {
        return s.sort((a, b) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const nomFilmA = ((_a = a.titleFilm) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            const nomFilmB = ((_b = b.titleFilm) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
            const nomSalleA = ((_c = a.nameSalle) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
            const nomSalleB = ((_d = b.nameSalle) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
            const dateSeanceA = ((_e = a.dateJour) === null || _e === void 0 ? void 0 : _e.toLowerCase()) || '';
            const dateSeanceB = ((_f = b.dateJour) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || '';
            const heureSeanceA = ((_g = a.hourBeginHHSMM) === null || _g === void 0 ? void 0 : _g.toLowerCase()) || '';
            const heureSeanceB = ((_h = b.hourBeginHHSMM) === null || _h === void 0 ? void 0 : _h.toLowerCase()) || '';
            if (dateSeanceA < dateSeanceB)
                return -1;
            if (dateSeanceA > dateSeanceB)
                return 1;
            // if (nomFilmA < nomFilmB) return -1;
            // if (nomFilmA > nomFilmB) return 1;
            // Sinon on compare nameSalle
            if (nomSalleA < nomSalleB)
                return -1;
            if (nomSalleA > nomSalleB)
                return 1;
            if (heureSeanceA < heureSeanceB)
                return -1;
            if (heureSeanceA > heureSeanceB)
                return 1;
            return 0;
        });
    }
    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    static getSeancesDisplayFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return DataControllerIntranet.seanceSort(yield seancesDisplayByCinemaApi([DataControllerIntranet._filterNameCinema || 'all']));
            }
            catch (error) {
                console.error(`Erreur dans recherche des seanceDisplay : ${error}`);
                return [];
            }
        });
    }
    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    static getSeancesDisplayByCinema(cinemas) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return DataControllerIntranet.seanceSort(yield seancesDisplayByCinemaApi(cinemas));
            }
            catch (error) {
                console.error(`Erreur dans recherche des seanceDisplay : ${error}`);
                return [];
            }
        });
    }
    // Création ou mise à jour. Optimisation possible au niveau des API rest 
    // mais le temps tourne et je veux rester standard....
    static createOrUpdateSeance(seanceSeule) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = { message: "" };
            try {
                // On cree ou met a jour selon que l'on trouve la seance sur le serveur
                try {
                    const seanceSeuleUpdate = yield seancesseulesSelectApi(seanceSeule.id);
                    if (seanceSeuleUpdate) {
                        result.message = "update";
                    }
                    else {
                        result.message = "create";
                    }
                }
                catch (error) {
                    result.message = "create";
                }
                if (result.message === "create") {
                    result = yield seancesseulesCreateApi(seanceSeule);
                }
                else {
                    result = yield seancesseulesUpdateApi(seanceSeule.id, seanceSeule);
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
        });
    }
    static getListFilmsAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filmsAll = yield filmsSelectAllApi();
                const listFilms = Array.from(new Map(filmsAll
                    .filter(f => f.id && f.titleFilm && f.isActiveForNewSeances)
                    .map(f => [f.id, {
                        id: f.id,
                        titre: f.titleFilm,
                        duration: f.duration,
                        affiche: f.imageFilm128
                    }])).values());
                return listFilms;
            }
            catch (error) {
                console.error(`Erreur recupération ListFilmsAll : ${error}`);
                return [];
            }
        });
    }
    // Recupération des salles du cinema selectionne dans le filtre
    static getSallesByFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cinemaName = "";
                if (!DataControllerIntranet._filterNameCinema) {
                    cinemaName = 'all';
                }
                else {
                    cinemaName = DataControllerIntranet._filterNameCinema;
                }
                let salles = [];
                if (cinemaName === 'all') {
                    salles = yield sallesSelectAllApi();
                }
                else {
                    salles = yield sallesSelectCinemaApi(cinemaName);
                }
                let listSalles;
                if (cinemaName === 'all') {
                    listSalles = Array.from(new Map(salles
                        .filter(s => s.id && s.nameSalle)
                        .map(s => [s.id, {
                            id: s.id,
                            // Si on est sur tous les cinemas, on ajoute le com du cinema dans l'intitulé de la salle
                            nomSalle: s.nameCinema + "-" + s.nameSalle,
                            capacite: s.capacity,
                            numPMR: s.numPMR
                        }])).values());
                }
                else {
                    listSalles = Array.from(new Map(salles
                        .filter(s => s.id && s.nameSalle)
                        .map(s => [s.id, {
                            id: s.id,
                            nomSalle: s.nameSalle,
                            capacite: s.capacity,
                            numPMR: s.numPMR
                        }])).values());
                }
                return listSalles;
            }
            catch (error) {
                console.error(`Erreur recupération ListFilmsAll : ${error}`);
                return [];
            }
        });
    }
    // Gestion des reservation pour manageavis
    // Les requetes sont en temps reel sans cache local, néanmoins pour éviter de surcharger le réseau
    // On met en place le filtrage par cinema pour l'affichage et la mise à jour de la seule entité seance
    // On utilise filterNameCinema commun à séance pour la gestion du filtre
    static reservationSort(s) {
        return s.sort((a, b) => {
            var _a, _b, _c, _d, _e, _f;
            const nomFilmA = ((_a = a.titleFilm) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            const nomFilmB = ((_b = b.titleFilm) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
            const displaynameA = ((_c = a.displayname) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
            const displaynameB = ((_d = b.displayname) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
            const dateSeanceA = ((_e = a.dateJour) === null || _e === void 0 ? void 0 : _e.toLowerCase()) || '';
            const dateSeanceB = ((_f = b.dateJour) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || '';
            if (dateSeanceA < dateSeanceB)
                return -1;
            if (dateSeanceA > dateSeanceB)
                return 1;
            if (nomFilmA < nomFilmB)
                return -1;
            if (nomFilmA > nomFilmB)
                return 1;
            // Sinon on compare nameSalle
            if (displaynameA < displaynameB)
                return -1;
            if (displaynameA > displaynameB)
                return 1;
            return 0;
        });
    }
    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    static getReservationForUtilisateurFilter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return DataControllerIntranet.reservationSort(yield reservationsByCinemaApi([DataControllerIntranet._filterNameCinema || 'all']));
            }
            catch (error) {
                console.error(`Erreur dans recherche des reservations : ${error}`);
                return [];
            }
        });
    }
    // 🏆 Variable calculée : retourne les séances filtrées par cinéma en mode display
    static getReservationForUtilisateurByCinema(cinemas) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return DataControllerIntranet.reservationSort(yield reservationsByCinemaApi(cinemas));
            }
            catch (error) {
                console.error(`Erreur dans recherche des reservations : ${error}`);
                return [];
            }
        });
    }
    // Mise à jour de l'avis d'une réservation
    static updateReservationAvis(reservationAvis) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = { message: "" };
            // On cree ou met a jour selon que l'on trouve la seance sur le serveur
            try {
                result = yield reservationAvisUpdateApi(reservationAvis.id, reservationAvis);
                return result;
            }
            catch (error) {
                console.error(`Erreur inconue dans la mise à jour de l'avis : ${error}, Avis = ${JSON.stringify(reservationAvis)}`);
                return result;
            }
        });
    }
    // Gestion des employés
    static getListEmployesAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employesAll = yield employesSelectAllApi();
                return employesAll;
            }
            catch (error) {
                console.error(`Erreur recupération ListEmployesAll : ${error}`);
                return [];
            }
        });
    }
    static getEmployesByMatricule(matricule) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employe = yield getEmployeByMatriculeApi(matricule);
                return employe;
            }
            catch (error) {
                console.error(`Erreur recupération ListEmployesAll : ${error}`);
            }
        });
    }
    // Création ou mise à jour. Optimisation possible au niveau des API rest 
    // mais le temps tourne et je veux rester standard....
    static createOrUpdateEmploye(employe, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = { message: "" };
            try {
                // On cree ou met a jour selon que l'on trouve la seance sur le serveur
                try {
                    const employeUpdate = yield getEmployeByMatriculeApi(employe.matricule);
                    if (employeUpdate) {
                        result.message = "update";
                    }
                    else {
                        result.message = "create";
                    }
                }
                catch (error) {
                    result.message = "create";
                }
                if (result.message === "create") {
                    result = yield employeCreateApi(employe, password);
                }
                else {
                    result = yield employeUpdateApi(employe, password);
                }
                return result;
            }
            catch (error) {
                switch (result.message) {
                    case "":
                        console.error(`Erreur dans la recherche de employe : ${error} , matricule = ${employe.matricule}`);
                        break;
                    case "update":
                        console.error(`Erreur dans l'update de employe : ${error}, employe = ${JSON.stringify(employe)}`);
                        break;
                    case "create":
                        console.error(`Erreur dans le create de employe : ${error}, employe = ${JSON.stringify(employe)}`);
                        break;
                    default:
                        console.error(`Erreur inconue dans le create/update de employe : ${error}, employe = ${JSON.stringify(employe)}`);
                        break;
                }
                throw error;
            }
        });
    }
    static deleteEmploye(matricule) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield employeDeleteApi(matricule);
            }
            catch (error) {
                console.log("Erreur delete Employé", error);
            }
        });
    }
    // Gestion des stats
    static getReservationStatsAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reservationStatsAll = yield getReservationStatsApi();
                return reservationStatsAll;
            }
            catch (error) {
                console.error(`Erreur recupération ReservationState : ${error}`);
                return [];
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
