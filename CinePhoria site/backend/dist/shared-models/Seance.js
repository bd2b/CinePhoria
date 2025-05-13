"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeanceDisplay = exports.TarifQualite = exports.SeanceReduite = exports.Seance = exports.SeanceB = void 0;
class SeanceB {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.SeanceB = SeanceB;
;
class Seance {
    constructor(data) {
        Object.assign(this, data);
    }
    // Récupération du film associé
    get film() {
        return Seance.allFilms.find(f => f.id === this.filmId);
    }
    // Propriétés calculées (non persistées dans JSON)
    get titleFilm() { return this.film?.titleFilm; } // pbme
    get filmPitch() { return this.film?.filmPitch; }
    get genreArray() { return this.film?.genreArray; }
    get duration() { return this.film?.duration; } // pbme
    get linkBO() { return this.film?.linkBO; }
    get dateSortieCinePhoria() { return this.film?.dateSortieCinePhoria; }
    get categorySeeing() { return this.film?.categorySeeing; }
    get note() { return this.film?.note?.toString(10); }
    get isCoupDeCoeur() { return this.film?.isCoupDeCoeur; }
    get isActiveForNewSeances() { return this.film?.isActiveForNewSeances; }
    get filmDescription() { return this.film?.filmDescription; }
    get filmAuthor() { return this.film?.filmAuthor; }
    get filmDistribution() { return this.film?.filmDistribution; }
    get imageFilm128() { return this.film?.imageFilm128; } // pbme
    get imageFilm1024() { return this.film?.imageFilm1024; }
}
exports.Seance = Seance;
// Référence globale au catalogue de films
Seance.allFilms = [];
class SeanceReduite {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.SeanceReduite = SeanceReduite;
;
class TarifQualite {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.TarifQualite = TarifQualite;
;
class SeanceDisplay {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.SeanceDisplay = SeanceDisplay;
;
