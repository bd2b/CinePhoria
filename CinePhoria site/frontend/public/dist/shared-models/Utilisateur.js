// shared-models/User.ts
// shared-models/User.ts
export class ComptePersonne {
    constructor(data) {
        Object.assign(this, data);
    }
}
export var TypeCompte;
(function (TypeCompte) {
    TypeCompte["None"] = "none";
    TypeCompte["Employe"] = "employe";
    TypeCompte["Utilisateur"] = "utilisateur";
})(TypeCompte || (TypeCompte = {}));
