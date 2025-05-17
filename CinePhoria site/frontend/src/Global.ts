import { showCustomAlert } from './Helpers.js';
import { userDataController, ProfilUtilisateur } from './DataControllerUser.js';
import { CinephoriaErrorCode, CinephoriaError } from "./shared-models/Error.js";
import { dataController } from './DataController.js';




// L'url de base est l'url d'appel des fichiers statiques
export const baseUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const page = window.location.pathname.split("/").pop(); // 🔹 Ajout ici




if (window.location.hostname.toUpperCase() !== 'CINEPHORIA.BD2DB.COM') document.title = document.title + " - dev";


const pagesPublic = ["visiteur.html", "reservation.html", "films.html"];
const pagesDataController = ["visiteur.html", "reservation.html", "films.html", "mesreservations.html"]
/**
 * Structure de chargement dynamique des modules selon la page active.
 * Chaque fonction est appelée uniquement si la page correspond,
 * ce qui évite de charger tous les modules inutilement au démarrage.
 */
const pageLoaders: Record<string, () => Promise<void>> = {
    "visiteur.html": async () => (await import("./ViewFilmsSortiesSemaine.js")).onLoadVisiteur(),
    "reservation.html": async () => (await import("./ViewReservation.js")).onLoadReservation(),
    "mesreservations.html": async () => (await import("./ViewMesReservations.js")).onLoadMesReservations(),
    "films.html": async () => (await import("./ViewFilms.js")).onLoadFilms(),
    "manageFilms.html": async () => (await import("./ViewManageFilms.js")).onLoadManageFilms(),
    "manageSalles.html": async () => (await import("./ViewManageSalles.js")).onLoadManageSalles(),
    "manageSeances.html": async () => (await import("./ViewManageSeances.js")).onLoadManageSeances(),
    "manageAvis.html": async () => (await import("./ViewManageAvis.js")).onLoadManageAvis(),
    "manageEmployes.html": async () => (await import("./ViewManageEmploye.js")).onLoadManageEmployes(),
    "dashboard.html": async () => (await import("./ViewDashboard.js")).onLoadDashboard(),
};

/**
 * Gestion centralisée des erreurs API
 */
let isHandlingAuthError = false;

export async function handleApiError(error: any): Promise<never> {
    console.debug("🔴 Erreur API détectée :", error);

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
                        (await import("./ViewFilmsSortiesSemaine.js")).onLoadVisiteur();
                    } else if (!pagesPublic.includes(currentPage || '')) {
                        console.log("Remplacement par la page visiteur");
                        window.location.replace("visiteur.html");
                    } 
                    else if (pagesPublic.includes(currentPage || '')) {
                        // On est sur une page public qui ne demande pas d'ident
                        console.log("Page public")

                    } else {
                        // 🔁 On stoppe ici proprement pour éviter le fallback dynamique
                        console.log("Stop du load");
                        throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Redirection déclenchée");
                    }
                }
                break;

            case CinephoriaErrorCode.API_ERROR:
                console.error("❌ Erreur API générale :", error.message);
                await showCustomAlert(`Erreur rencontrée : ${error.message}`);
                break;
            case CinephoriaErrorCode.API_ERROR_SILENT:
                console.error("❌ Erreur API générale silencieuse :", error.message);
                break;

            default:
                console.error("❓ Erreur inconnue :", error);
        }
    } else {
        console.error("🚨 Erreur non gérée :", error);
    }

    throw error.message;
}

/**
 * Mise en place du chargement de page basé sur l'évenment DOMContentLoaded qui exploite 
 * la structure pageLoaders
 * cette structure associe à la page la fonction de traitement à lancer
 */
console.log("Chargement de Global");
document.addEventListener("DOMContentLoaded", async () => {
    if ((window as any)._cinephoriaDomContentTriggered) return;
    (window as any)._cinephoriaDomContentTriggered = true;

    try {
        const ident = userDataController.ident;
        if (ident !== undefined) {
            console.log("Identification chargee = ", ident);
            await userDataController.init();
            // console.log("Compte charge = ", userDataController.compte());
            const profil = userDataController.profil();
            console.log("Profil charge = ", profil);
        } else {
            console.log("Pas d'ident");
        }

        if (page && pageLoaders[page]) {
            const runPageLoader = async () => {
                console.log("🕐 Exécution du rendu dynamique pour", page);
                await pageLoaders[page]();
                const isPagePublique = pagesPublic.includes(page);
                if (isPagePublique) {
                    const progress = document.getElementById("progressIndicator");
                    if (progress) progress.style.display = "block";
                }
            };

            if (document.readyState === 'complete') {
                // ✅ Ajout pour éviter exécution après redirection
                if (window.location.pathname.endsWith("visiteur.html") && page !== "visiteur.html") {
                    console.warn("⛔ Redirection active, annulation du runPageLoader()");
                    return;
                }

                console.log("🕐 Le chargement est déjà complet, exécution immédiate de", page);
                await runPageLoader();
            } else {
                console.log("🕐 Initialisation du chargement sur evenement load de", page);
                window.addEventListener('load', runPageLoader);
            }
        } else {
            console.warn("⚠️ Aucune fonction associée pour cette page.");
        }
    } catch (e) {
        console.warn("⛔ DOMContentLoaded interrompu suite à une erreur critique :", e);
    }
});

// On lance l'initialisation du dataController si on est sur une page publique
console.log("Current Page = ", page)
if (page && pagesDataController.includes(page)) {
    console.log("Initialisation du DataC")
    dataController.init();
}
