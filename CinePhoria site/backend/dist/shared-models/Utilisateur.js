"use strict";
// shared-models/User.ts
// shared-models/User.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCompte = exports.ComptePersonne = void 0;
class ComptePersonne {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.ComptePersonne = ComptePersonne;
var TypeCompte;
(function (TypeCompte) {
    TypeCompte["None"] = "none";
    TypeCompte["Employe"] = "employe";
    TypeCompte["Utilisateur"] = "utilisateur";
})(TypeCompte || (exports.TypeCompte = TypeCompte = {}));
