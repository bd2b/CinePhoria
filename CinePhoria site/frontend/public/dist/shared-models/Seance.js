export class SeanceB {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
export class Seance {
    constructor(data) {
        Object.assign(this, data);
    }
    // Récupération du film associé
    get film() {
        return Seance.allFilms.find(f => f.id === this.filmId);
    }
    // Propriétés calculées (non persistées dans JSON)
    get titleFilm() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.titleFilm; }
    get filmPitch() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.filmPitch; }
    get genreArray() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.genreArray; }
    get duration() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.duration; }
    get linkBO() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.linkBO; }
    get dateSortieCinePhoria() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.dateSortieCinePhoria; }
    get categorySeeing() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.categorySeeing; }
    get note() { var _a, _b; return (_b = (_a = this.film) === null || _a === void 0 ? void 0 : _a.note) === null || _b === void 0 ? void 0 : _b.toString(10); }
    get isCoupDeCoeur() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.isCoupDeCoeur; }
    get isActiveForNewSeances() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.isActiveForNewSeances; }
    get filmDescription() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.filmDescription; }
    get filmAuthor() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.filmAuthor; }
    get filmDistribution() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.filmDistribution; }
    get imageFilm128() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.imageFilm128; }
    get imageFilm1024() { var _a; return (_a = this.film) === null || _a === void 0 ? void 0 : _a.imageFilm1024; }
}
// Référence globale au catalogue de films
Seance.allFilms = [];
export class SeanceReduite {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
export class TarifQualite {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
export class SeanceDisplay {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
