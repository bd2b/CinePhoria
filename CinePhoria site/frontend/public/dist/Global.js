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
import { onLoadMesReservations } from "./ViewMesReservations.js";
import { onLoadVisiteur } from "./ViewFilmsSortiesSemaine.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
const pageHandlers = {
    "visiteur.html": onLoadVisiteur,
    "reservation.html": onLoadReservation,
    "mesreservations.html": onLoadMesReservations
};
/**
 * Mise en place du chargement de page basé sur l'évenment DOMContentLoaded qui exploite
 * la structure pageHandlers
 * cette structure associe à la page la fonction de traitement à lancer
 */
document.removeEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () { }));
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const page = window.location.pathname.split("/").pop(); // Récupère le nom de la page actuelle
    console.log("Chargement dynamique de ", page, " ");
    if (page && pageHandlers[page]) {
        pageHandlers[page](); // Exécute la fonction associée à la page
        chargerMenu(); // Header
        chargerCinemaSites(); // Footer
    }
    else {
        console.warn("⚠️ Aucune fonction associée pour cette page.");
    }
}));
