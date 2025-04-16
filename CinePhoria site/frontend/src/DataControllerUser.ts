import { ComptePersonne } from './shared-models/Utilisateur.js';
import { profilApi } from './NetworkController.js';
import { deleteCookie, getCookie, setCookie } from './Helpers.js';

export enum ProfilUtilisateur {
    Utilisateur = "mesreservations.html",
    Administrateur = "manageEmploye.html",
    Employee = "manageAvis.html",
    Visiteur = "visiteur.html"
}

export class DataControllerUser {
    private _comptes?: ComptePersonne[];
    private _ident?: string;
    

    // Getter pour ident
    public get ident(): string | undefined {
        const ident = getCookie('ident');
        this._ident = ident;
        return getCookie('ident')
        
    }

    // Setter pour ident
    public set ident(value: string) {
        if (value !== '') {
        console.log("Mise a jour ident = " + value)
        setCookie("ident", value, 1);
        this._ident = value;
        } else {
            console.log("logout de ",this._ident,)
            this._ident = undefined;
            
        }
    }

    // Getter pour comptes
    public get comptes(): ComptePersonne[] {
        return this._comptes || [];
    }

    // Acces au premier compte
    // Pour éviter d'alourdir tous les cas ou on n'a pas besoin de gérer le multi-site d'un employé
    public compte(): ComptePersonne | undefined {
        if (this._comptes) {
            return this._comptes[0];
        } else 
        return undefined;
    }

    // Calcul au profil
    public profil() : ProfilUtilisateur {
        if (this.compte() === undefined) {
            return ProfilUtilisateur.Visiteur
        } else if (this.compte()?.matricule) {
            if (this.compte()?.isAdministrateur &&  this.compte()?.isAdministrateur === 1) {
                return ProfilUtilisateur.Administrateur;
            } else {
                return ProfilUtilisateur.Employee;
            }
        } else {
            return ProfilUtilisateur.Utilisateur;
        }
    }

    // Invalider le compte
    public invalidate() {
        deleteCookie('ident');
        this._ident = undefined;
        this._comptes = undefined;
    }
    
    

    /** Initialisation du dataController
     * 
     */
    public async init() {
        try {
        if (this._ident !== undefined) {
            const comptesCharge = await profilApi(this._ident);
            if (comptesCharge) {
                console.log("Compte chargé pour ", this._ident);
                this._comptes = comptesCharge
            } 
        }
    } catch {
        this._ident = undefined;
    }
    }

}

export let userDataController = new DataControllerUser();

