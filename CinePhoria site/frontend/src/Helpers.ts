// Fonction pour obtenir la valeur d'un cookie
export function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Fonction pour définir un cookie
export function setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()}`;
}

// Suppression d'un cookie
export function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/** 
 * Petite fonction pour un mois en texte 
 */
export function extraireMoisLettre(date: Date): string {
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
export function creerDateLocale(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

/**
 * Ajoute (ou retire) `nbJours` jours à la date `d` en restant en local (heure fixe à midi).
 */
export function ajouterJours(d: Date, nbJours: number): Date {
    const tmp = creerDateLocale(d);
    tmp.setDate(tmp.getDate() + nbJours);
    return creerDateLocale(tmp);
}

/**
 * Calcule la date du prochain mardi (y compris s’il s’agit d’aujourd’hui) à partir de `dateRef`.
 */
export function dateProchainMardi(dateRef: Date): Date {
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
 * Formate la date (locale) au format jj/mm (ex : 09/01)
 */
export function formatDateJJMM(date: Date): string {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
    return `${day}/${month}`;
}

/**
 * Formate la date (locale) au format yyyy-mm-dd, sans dépendre d’UTC.
 * toISOString() génère souvent un décalage si la zone horaire est négative/positive.
 */
export function formatDateLocalYYYYMMDD(date: Date): string {
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
export function isDifferenceGreaterThanHours(date1: Date, date2: Date, hours: number): boolean {
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
export function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str.trim());
}

/**
     * Vérifie la validité d'un email.
     * @param email - L'email à valider.
     * @returns boolean - True si l'email est valide, sinon False.
     */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
