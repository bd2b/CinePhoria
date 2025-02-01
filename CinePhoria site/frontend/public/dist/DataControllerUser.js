export var ProfilUtilisateur;
(function (ProfilUtilisateur) {
    ProfilUtilisateur["Utilisateur"] = "Utilisateur";
    ProfilUtilisateur["Administrateur"] = "Administrateur";
    ProfilUtilisateur["Employee"] = "Employe";
})(ProfilUtilisateur || (ProfilUtilisateur = {}));
export class DataControllerUser {
    constructor(email) {
        this._email = email;
        console.log("New avec " + email);
        // Le constructeur ne fait pas d’appel asynchrone
        // On doit appeler manuellement dataController.init() après l’avoir construit
    }
    profilUtilisateurByEmail() {
        return "";
    }
    profilUtilisateurById() {
        return "";
    }
}
