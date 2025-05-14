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
// L'url de base est l'url d'appel des fichiers statiques
export const baseUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const page = window.location.pathname.split("/").pop(); // 🔹 Ajout ici
if (window.location.hostname.toUpperCase() !== 'CINEPHORIA.BD2DB.COM')
    document.title = document.title + " - dev";
const pagesPublic = ["visiteur.html", "reservation.html", "films.html"];
const pagesDataController = ["visiteur.html", "reservation.html", "films.html", "mesreservations.html"];
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
                case CinephoriaErrorCode.AUTH_REQUIRED:
                    if (!isHandlingAuthError) {
                        console.warn("🔄 Token expiré ou invalide, redirection vers visiteur.html");
                        isHandlingAuthError = true;
                        localStorage.removeItem('jwtAccessToken');
                        const currentPage = window.location.pathname.split("/").pop();
                        console.log("Current page = ", currentPage);
                        if (currentPage === "visiteur.html") {
                            console.log("Chargement manuel de onLoadVisiteur()");
                            (yield import("./ViewFilmsSortiesSemaine.js")).onLoadVisiteur();
                        }
                        else if (!pagesPublic.includes(currentPage || '')) {
                            console.log("Remplacement par la page visiteur");
                            window.location.replace("visiteur.html");
                        }
                        else if (pagesPublic.includes(currentPage || '')) {
                            // On est sur une page public qui ne demande pas d'ident
                            console.log("Page public");
                        }
                        else {
                            // 🔁 On stoppe ici proprement pour éviter le fallback dynamique
                            console.log("Stop du load");
                            throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Redirection déclenchée");
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
 * la structure pageLoaders
 * cette structure associe à la page la fonction de traitement à lancer
 */
console.log("Chargement de Global");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    if (window._cinephoriaDomContentTriggered)
        return;
    window._cinephoriaDomContentTriggered = true;
    try {
        const ident = userDataController.ident;
        if (ident !== undefined) {
            console.log("Identification chargee = ", ident);
            yield userDataController.init();
            console.log("Compte charge = ", userDataController.compte());
            const profil = userDataController.profil();
            console.log("Profil charge = ", profil);
        }
        else {
            console.log("Pas d'ident");
        }
        if (page && pageLoaders[page]) {
            const runPageLoader = () => __awaiter(void 0, void 0, void 0, function* () {
                console.log("🕐 Exécution du rendu dynamique pour", page);
                yield pageLoaders[page]();
                const isPagePublique = pagesPublic.includes(page);
                if (isPagePublique) {
                    const progress = document.getElementById("progressIndicator");
                    if (progress)
                        progress.style.display = "block";
                }
            });
            if (document.readyState === 'complete') {
                // ✅ Ajout pour éviter exécution après redirection
                if (window.location.pathname.endsWith("visiteur.html") && page !== "visiteur.html") {
                    console.warn("⛔ Redirection active, annulation du runPageLoader()");
                    return;
                }
                console.log("🕐 Le chargement est déjà complet, exécution immédiate de", page);
                yield runPageLoader();
            }
            else {
                console.log("🕐 Initialisation du chargement sur evenement load de", page);
                window.addEventListener('load', runPageLoader);
            }
        }
        else {
            console.warn("⚠️ Aucune fonction associée pour cette page.");
        }
    }
    catch (e) {
        console.warn("⛔ DOMContentLoaded interrompu suite à une erreur critique :", e);
    }
}));
// On lance l'initialisation du dataController si on est sur une page publique
console.log("Current Page = ", page);
if (page && pagesDataController.includes(page)) {
    console.log("Initialisation du DataC");
    dataController.init();
}
