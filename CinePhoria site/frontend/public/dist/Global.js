var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showCustomAlert } from './Helpers.js';
import { userDataController } from './DataControllerUser.js';
import { CinephoriaErrorCode, CinephoriaError } from "./shared-models/Error.js";
import { dataController } from './DataController.js';
// import { onLoadManageFilms } from './ViewManageFilms.js.js';
// import { onLoadManageSalles } from './ViewManageSalles.js.js';
// import { onLoadManageSeances } from './ViewManageSeances.js.js';
// import { onLoadManageAvis } from './ViewManageAvis.js.js';
// import { onLoadManageEmployes } from './ViewManageEmploye.js.js';
// import { onLoadDashboard } from './ViewDashboard.js.js';
// import { onLoadReservation } from './ViewReservation.js.js';
// import { onLoadFilms } from './ViewFilms.js.js';
// import { onLoadMesReservations } from './ViewMesReservations.js.js';
// import { onLoadVisiteur } from './ViewFilmsSortiesSemaine.js.js';
// L'url de base est l'url d'appel des fichiers statiques
export const baseUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const page = window.location.pathname.split("/").pop(); // 🔹 Ajout ici
if (window.location.hostname.toUpperCase() !== 'CINEPHORIA.BD2DB.COM')
    document.title = document.title + " - dev";
// const pageHandlers: Record<string, () => void> = {
//     "visiteur.html": onLoadVisiteur,
//     "reservation.html": onLoadReservation,
//     "mesreservations.html": onLoadMesReservations,
//     "films.html": onLoadFilms,
//     "manageFilms.html" : onLoadManageFilms,
//     "manageSalles.html" : onLoadManageSalles,
//     "manageSeances.html" : onLoadManageSeances,
//     "manageAvis.html" : onLoadManageAvis,
//     "manageEmployes.html" : onLoadManageEmployes,
//     "dashboard.html" : onLoadDashboard
// };
const pagesPublic = ["visiteur.html", "reservation.html", "films.html", "mesreservations.html"]; // TODO manageXXXXX à supprimer
/**
 * Structure de chargement dynamique des modules selon la page active.
 * Chaque fonction est appelée uniquement si la page correspond,
 * ce qui évite de charger tous les modules inutilement au démarrage.
 */
const pageLoaders = {
    "visiteur.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewFilmsSortiesSemaine.js")).onLoadVisiteur(); }),
    "reservation.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewReservation.js")).onLoadReservation(); }),
    "mesreservations.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewMesReservations.js")).onLoadMesReservations(); }),
    "films.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewFilms.js")).onLoadFilms(); }),
    "manageFilms.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewManageFilms.js")).onLoadManageFilms(); }),
    "manageSalles.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewManageSalles.js")).onLoadManageSalles(); }),
    "manageSeances.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewManageSeances.js")).onLoadManageSeances(); }),
    "manageAvis.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewManageAvis.js")).onLoadManageAvis(); }),
    "manageEmployes.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewManageEmploye.js")).onLoadManageEmployes(); }),
    "dashboard.html": () => __awaiter(void 0, void 0, void 0, function* () { return (yield import("./ViewDashboard.js")).onLoadDashboard(); }),
};
/**
 * Gestion centralisée des erreurs API
 */
let isHandlingAuthError = false;
export function handleApiError(error) {
    return __awaiter(this, void 0, void 0, function* () {
        console.error("🔴 Erreur API détectée :", error);
        if (error instanceof CinephoriaError) {
            switch (error.code) {
                case CinephoriaErrorCode.TOKEN_EXPIRE:
                    console.warn("🔄 Token expiré, redirection vers visiteur.html");
                case CinephoriaErrorCode.TOKEN_REFRESH_FAIL:
                    console.warn("🔄 Token refresh expiré, redirection vers visiteur.html");
                // case CinephoriaErrorCode.AUTH_REQUIRED:
                //     if (!isHandlingAuthError) {
                //         console.warn("🔄 Token expiré ou invalide, redirection vers visiteur.html");
                //         isHandlingAuthError = true;
                //         localStorage.removeItem('jwtAccessToken');
                //         const currentPage = window.location.pathname.split("/").pop();
                //         if (currentPage === "visiteur.html") {
                //             // On relance le traitement de visiteur
                //             console.log("Chargement manuel de onLoadVisiteur()");
                //             //      onLoadVisiteur();
                //         } else if (!pagesPublic.includes(currentPage || '')) {
                //             window.location.replace("visiteur.html");
                //         }
                //     }
                //     break;
                case CinephoriaErrorCode.AUTH_REQUIRED:
                    if (!isHandlingAuthError) {
                        console.warn("🔄 Token expiré ou invalide, redirection vers visiteur.html");
                        isHandlingAuthError = true;
                        localStorage.removeItem('jwtAccessToken');
                        const currentPage = window.location.pathname.split("/").pop();
                        if (currentPage === "visiteur.html") {
                            console.log("Chargement manuel de onLoadVisiteur()");
                            (yield import("./ViewFilmsSortiesSemaine.js")).onLoadVisiteur();
                        }
                        else if (!pagesPublic.includes(currentPage || '')) {
                            window.location.replace("visiteur.html");
                        }
                    }
                    break;
                case CinephoriaErrorCode.API_ERROR:
                    console.error("❌ Erreur API générale :", error.message);
                    yield showCustomAlert(`Erreur API : ${error.message}`);
                    break;
                default:
                    console.error("❓ Erreur inconnue :", error);
            }
        }
        else {
            console.error("🚨 Erreur non gérée :", error);
        }
        throw error.message;
    });
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
    // On charge la page
    console.log("Chargement dynamique de xxxx", page, " ");
    if (page && pageLoaders[page]) {
        const runPageLoader = () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("🕐 Exécution du rendu dynamique pour", page);
            yield pageLoaders[page]();
            const isPagePublique = pagesPublic.includes(page);
            if (isPagePublique) {
                // Mise en place de l'indicateur de progression AVANT le rendu
                const progress = document.getElementById("progressIndicator");
                if (progress)
                    progress.style.display = "block";
            }
        });
        if (document.readyState === 'complete') {
            console.log("🕐 Le chargement est déjà complet, exécution immédiate de", page);
            yield runPageLoader();
        }
        else {
            window.addEventListener('load', runPageLoader);
        }
    }
    else {
        console.warn("⚠️ Aucune fonction associée pour cette page.");
    }
    // }
}));
// On lance l'initialisation du dataController si on est sur une page publique
console.log("Current Page = ", page);
if (page && pagesPublic.includes(page)) {
    console.log("Initialisation du DataC");
    dataController.init();
}
