var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { onLoadReservation } from "./ViewReservation.js";
import { onLoadFilms } from "./ViewFilms.js";
import { onLoadMesReservations } from "./ViewMesReservations.js";
import { onLoadVisiteur } from "./ViewFilmsSortiesSemaine.js";
import { userDataController } from "./DataControllerUser.js";
import { CinephoriaErrorCode, CinephoriaError } from "./shared-models/Error.js";
import { onLoadManageFilms } from "./ViewManageFilms.js";
import { onLoadManageSalles } from "./ViewManageSalles.js";
import { onLoadManageSeances } from "./ViewManageSeances.js";
import { onLoadManageAvis } from "./ViewManageAvis.js";
import { onLoadManageEmployes } from "./ViewManageEmploye.js";
import { onLoadDashboard } from "./ViewDashboard.js";
// L'url de base est l'url d'appel des fichiers statiques
export const baseUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
if (window.location.hostname.toUpperCase() !== 'CINEPHORIA.BD2DB.COM')
    document.title = document.title + " - dev";
const pageHandlers = {
    "visiteur.html": onLoadVisiteur,
    "reservation.html": onLoadReservation,
    "mesreservations.html": onLoadMesReservations,
    "films.html": onLoadFilms,
    "manageFilms.html": onLoadManageFilms,
    "manageSalles.html": onLoadManageSalles,
    "manageSeances.html": onLoadManageSeances,
    "manageAvis.html": onLoadManageAvis,
    "manageEmployes.html": onLoadManageEmployes,
    "dashboard.html": onLoadDashboard
};
const pagesPublic = ["visiteur.html", "reservation.html", "films.html",
    "manageFilms.html", "manageSalles.html", "manageSeances.html"]; // TODO manageXXXXX à supprimer
/**
 * Gestion centralisée des erreurs API
 */
let isHandlingAuthError = false;
export function handleApiError(error) {
    console.error("🔴 Erreur API détectée :", error);
    if (error instanceof CinephoriaError) {
        switch (error.code) {
            case CinephoriaErrorCode.TOKEN_EXPIRE:
                console.warn("🔄 Token expiré, redirection vers visiteur.html");
            case CinephoriaErrorCode.TOKEN_REFRESH_FAIL:
                console.warn("🔄 Token refresh expiré, redirection vers visiteur.html");
            case CinephoriaErrorCode.AUTH_REQUIRED:
                if (!isHandlingAuthError) {
                    console.warn("🔄 Token expiré ou invalide, redirection vers visiteur.html");
                    isHandlingAuthError = true;
                    localStorage.removeItem('jwtAccessToken');
                    const currentPage = window.location.pathname.split("/").pop();
                    if (currentPage === "visiteur.html") {
                        // On relance le traitement de visiteur
                        console.log("Chargement manuel de onLoadVisiteur()");
                        onLoadVisiteur();
                    }
                    else if (!pagesPublic.includes(currentPage || '')) {
                        window.location.replace("visiteur.html");
                    }
                }
                break;
            case CinephoriaErrorCode.API_ERROR:
                console.error("❌ Erreur API générale :", error.message);
                alert(`Erreur API : ${error.message}`);
                break;
            default:
                console.error("❓ Erreur inconnue :", error);
        }
    }
    else {
        console.error("🚨 Erreur non gérée :", error);
    }
    throw error.message;
}
/**
 * Mise en place du chargement de page basé sur l'évenment DOMContentLoaded qui exploite
 * la structure pageHandlers
 * cette structure associe à la page la fonction de traitement à lancer
 */
console.log("Chargement de Global");
document.removeEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () { }));
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("DOM Chargement de Global");
    // 0) L'ident est chargé ?
    const ident = userDataController.ident;
    if (ident !== undefined) {
        console.log("Identification chargee = ", ident);
        yield userDataController.init();
        console.log("Compte charge = ", userDataController.compte());
    }
    // 1) Identifier le profil qui a pu changer si lle jwt a expiré
    const profil = userDataController.profil();
    console.log("Profil charge = xxxx", profil);
    // if (profil === ProfilUtilisateur.Visiteur) {
    //     // Chargement de la page d'accueil
    //     console.log("Forçage");
    //     // Vérifier si on est déjà sur la page visiteur.html pour éviter une boucle infinie
    //     const currentPage = window.location.pathname.split("/").pop();
    //     if (currentPage !== "visiteur.html") {
    //         window.location.replace("visiteur.html");
    //     } else {
    //         console.log("Chargement manuel de onLoadVisiteur()");
    //         onLoadVisiteur(); // Appeler directement la fonction si déjà sur la page
    //     }
    // } else {
    // On charge la page
    const page = window.location.pathname.split("/").pop(); // Récupère le nom de la page actuelle
    console.log("Chargement dynamique de xxxx", page, " ");
    if (page && pageHandlers[page]) {
        console.log("Chargement de la fonction ", pageHandlers[page], " ");
        pageHandlers[page](); // Exécute la fonction associée à la page
    }
    else {
        console.warn("⚠️ Aucune fonction associée pour cette page.");
    }
    // }
}));
