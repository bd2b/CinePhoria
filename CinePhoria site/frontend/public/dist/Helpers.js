// Fonction pour obtenir la valeur d'un cookie
export function getCookie(name) {
    var _a;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
}
// Fonction pour définir un cookie
export function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()}`;
}
// Suppression d'un cookie
export function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
/**
 * Petite fonction pour un mois en texte
 */
export function extraireMoisLettre(date) {
    // Soit un code "JAN", "FEV", etc. 
    // Soit vous mettez directement le mois numérique "01"
    const monthIndex = date.getMonth(); // 0 = janvier
    const listeMois = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN',
        'JUI', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];
    return listeMois[monthIndex] || '??';
}
/**
* Crée une date locale fixée à midi (12h00) pour éviter les décalages de fuseau.
*/
export function creerDateLocale(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}
/**
 * Ajoute (ou retire) `nbJours` jours à la date `d` en restant en local (heure fixe à midi).
 */
export function ajouterJours(d, nbJours) {
    const tmp = creerDateLocale(d);
    tmp.setDate(tmp.getDate() + nbJours);
    return creerDateLocale(tmp);
}
/**
 * Calcule la date du prochain mardi (y compris s’il s’agit d’aujourd’hui) à partir de `dateRef`.
 */
export function dateProchainMardi(dateRef) {
    const d = creerDateLocale(dateRef);
    // Jour de la semaine : 0=dimanche, 1=lundi, 2=mardi, ...
    const day = d.getDay();
    const offset = (2 - day + 7) % 7;
    d.setDate(d.getDate() + offset);
    return creerDateLocale(d);
}
/**
 * date du précedent mercredi
 * @param date par defaut la date du jour
 * @returns la date du précédent mercredi
 */
export function datePrecedentMercredi(date = new Date()) {
    const previousDate = new Date(date); // Copie de la date donnée
    const dayOfWeek = previousDate.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 3 = Mercredi, ..., 6 = Samedi
    const daysToSubtract = (dayOfWeek >= 3) ? dayOfWeek - 3 : 7 - (3 - dayOfWeek);
    previousDate.setDate(previousDate.getDate() - daysToSubtract);
    return previousDate;
}
/**
 * Date du prochain mercredi
 * @param date Par défaut la date du jour
 * @returns La date du prochain mercredi
 */
export function dateProchainMercredi(date = new Date()) {
    const nextDate = new Date(date); // Copie de la date donnée
    const dayOfWeek = nextDate.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 3 = Mercredi
    const daysToAdd = (dayOfWeek <= 3) ? (3 - dayOfWeek) : (7 - dayOfWeek + 3);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
}
/**
 * Formate la date (locale) au format jj/mm (ex : 09/01)
 */
export function formatDateJJMM(date) {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
    return `${day}/${month}`;
}
/**
 * Formate la date (locale) au format yyyy-mm-dd, sans dépendre d’UTC.
 * toISOString() génère souvent un décalage si la zone horaire est négative/positive.
 */
export function formatDateLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const rawMonth = date.getMonth() + 1;
    const rawDay = date.getDate();
    const m = rawMonth < 10 ? '0' + rawMonth : String(rawMonth);
    const d = rawDay < 10 ? '0' + rawDay : String(rawDay);
    return `${y}-${m}-${d}`;
}
/**
 * Retourner un booleen indiquant si la valeur absolue de la différence entre la date1 et la date 2 est supérieures à hours heure
 * @param date1 (date récente)
 * @param date2
 * @param hours
 * @returns un booleen
 */
export function isDifferenceGreaterThanHours(date1, date2, hours) {
    // Obtenir les timestamps des dates
    const time1 = date1.getTime();
    const time2 = date2.getTime();
    // Calculer la différence en millisecondes
    const differenceInMilliseconds = Math.abs(time1 - time2);
    // Convertir en heures
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    // Comparer avec le seuil
    return differenceInHours > hours;
}
/**
 * Fonction de vérification d'UUID
 */
export function isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str.trim());
}
/**
     * Vérifie la validité d'un email.
     * @param email - L'email à valider.
     * @returns boolean - True si l'email est valide, sinon False.
     */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
;
/**
 * Fonction de calcul de l'url d'une image de film en fonction de la valeur du champ imageFilm128 ou imageFilm1024
 * Cela doit permettre de récupérer l'url selon les cas :
 * Si la valeur est un uuid suivi de la résolution, on redonne http://localhost:3500/api/films/affichefile/valeur
 * Sinon on donne http://127.0.0.1:3000/frontend/public/assets/static/
 *
 * 813d32eb-7df7-4338-9976-bb4471a966d81024
 */
export function imageFilm(value) {
    const prefixAPI = 'http://localhost:3500/api/films/affichefile/';
    const prefixDist = 'http://127.0.0.1:3000/frontend/public/assets/static/';
    const uuidPossible = value.slice(0, 36);
    return (isUUID(uuidPossible) ? prefixAPI : prefixDist) + value;
}
export function syncTableColumnWidths(table) {
    const theadCols = table.querySelectorAll('thead tr th');
    const tbodyRow = table.querySelector('tbody tr');
    if (!theadCols.length || !tbodyRow)
        return;
    const tbodyCols = tbodyRow.querySelectorAll('td');
    if (theadCols.length !== tbodyCols.length) {
        console.error("Nombre de colonnes de l'entete et du tableau différent");
        return;
    }
    else {
        console.log("Calcul de la largeur des colonnes");
    }
    tbodyCols.forEach((td, i) => {
        const width = td.getBoundingClientRect().width;
        theadCols[i].style.width = `${width}px`;
    });
}
