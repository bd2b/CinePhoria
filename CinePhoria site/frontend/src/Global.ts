import { onLoadReservation } from "./ViewReservation.js";
import { onLoadMesReservations } from "./ViewMesReservations.js";
import { onLoadVisiteur } from "./ViewFilmsSortiesSemaine.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
const pageHandlers: Record<string, () => void> = {
    "visiteur.html" : onLoadVisiteur,
    "reservation.html": onLoadReservation,
    "mesreservations.html": onLoadMesReservations
};
/**
 * Mise en place du chargement de page basé sur l'évenment DOMContentLoaded qui exploite 
 * la structure pageHandlers
 * cette structure associe à la page la fonction de traitement à lancer
 */
document.removeEventListener("DOMContentLoaded", async () => {});
document.addEventListener("DOMContentLoaded", async () => {
    
    const page = window.location.pathname.split("/").pop(); // Récupère le nom de la page actuelle
    console.log("Chargement dynamique de ", page , " ", )
    if (page && pageHandlers[page]) {
        pageHandlers[page](); // Exécute la fonction associée à la page
         chargerMenu(); // Header
         chargerCinemaSites() // Footer
    } else {
        console.warn("⚠️ Aucune fonction associée pour cette page.");
    }
});