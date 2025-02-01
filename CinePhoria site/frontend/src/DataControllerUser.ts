export enum ProfilUtilisateur {
Utilisateur = "Utilisateur",
Administrateur = "Administrateur",
Employee = "Employe" 
}

export class DataControllerUser {
    private _email: string;

    
    constructor(email: string) {
        this._email = email;
        console.log("New avec " + email);
        // Le constructeur ne fait pas d’appel asynchrone
        // On doit appeler manuellement dataController.init() après l’avoir construit
    }

    public profilUtilisateurByEmail () : string {
        return "";
    }

    public profilUtilisateurById () : string {
        return "";
    }

}