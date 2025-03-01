var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { profilApi } from './NetworkController.js';
import { deleteCookie, getCookie, setCookie } from './Helpers.js';
export var ProfilUtilisateur;
(function (ProfilUtilisateur) {
    ProfilUtilisateur["Utilisateur"] = "mesreservations.html";
    ProfilUtilisateur["Administrateur"] = "manageEmploye.html";
    ProfilUtilisateur["Employee"] = "moderer.html";
    ProfilUtilisateur["Visiteur"] = "visiteur.html";
})(ProfilUtilisateur || (ProfilUtilisateur = {}));
export class DataControllerUser {
    // Getter pour ident
    get ident() {
        const ident = getCookie('ident');
        this._ident = ident;
        return getCookie('ident');
    }
    // Setter pour ident
    set ident(value) {
        if (value !== '') {
            console.log("Mise a jour ident = " + value);
            setCookie("ident", value, 1);
            this._ident = value;
        }
        else {
            console.log("logout de ", this._ident);
            this._ident = undefined;
        }
    }
    // Getter pour comptes
    get comptes() {
        return this._comptes || [];
    }
    // Acces au premier compte
    // Pour éviter d'alourdir tous les cas ou on n'a pas besoin de gérer le multi-site d'un employé
    compte() {
        if (this._comptes) {
            return this._comptes[0];
        }
        else
            return undefined;
    }
    // Calcul au profil
    profil() {
        var _a, _b, _c;
        if (this.compte() === undefined) {
            return ProfilUtilisateur.Visiteur;
        }
        else if ((_a = this.compte()) === null || _a === void 0 ? void 0 : _a.matricule) {
            if (((_b = this.compte()) === null || _b === void 0 ? void 0 : _b.isAdministrateur) && ((_c = this.compte()) === null || _c === void 0 ? void 0 : _c.isAdministrateur) === 1) {
                return ProfilUtilisateur.Administrateur;
            }
            else {
                return ProfilUtilisateur.Employee;
            }
        }
        else {
            return ProfilUtilisateur.Utilisateur;
        }
    }
    // Invalider le compte
    invalidate() {
        deleteCookie('ident');
        this._ident = undefined;
        this._comptes = undefined;
    }
    /** Initialisation du dataController
     *
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this._ident !== undefined) {
                    const comptesCharge = yield profilApi(this._ident);
                    if (comptesCharge) {
                        console.log("Compte chargé pour ", this._ident);
                        this._comptes = comptesCharge;
                    }
                }
            }
            catch (_a) {
                this._ident = undefined;
            }
        });
    }
}
export let userDataController = new DataControllerUser();
