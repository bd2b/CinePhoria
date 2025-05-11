import { baseUrl } from './Global.js';
export const listCinemasConst = ["Paris","Bordeaux","Nantes","Lille","Toulouse","Charleroi","Liège"];
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
export function formatDateJJMM(date: Date): string {
    // console.log("Date en entrée : ", date)
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
    // console.log("Date en sortie = ", `${day}/${month}`);
    return `${day}/${month}`;
}

export function parseLocalDate(rawDateStr: string): Date {
    const dateStr = rawDateStr.slice(0, 10); // garde seulement YYYY-MM-DD
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function formatDateJJMMStr(dateStr: string): string {
    const cleanStr = dateStr.slice(0, 10); // extrait "YYYY-MM-DD"
    const [y, m, d] = cleanStr.split('-');
    return `${d}/${m}`;
}

export const formatterJJMM = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit"
});

// Avec compensation du format universel en GTC + 2
// export function formatDateJJMM(date: Date): string {
//     console.log("Date en entrée : ", date)
//     const local = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
//     const day = local.getDate() < 10 ? '0' + local.getDate() : local.getDate().toString();
//     const month = (local.getMonth() + 1) < 10 ? '0' + (local.getMonth() + 1) : (local.getMonth() + 1).toString();
//     console.log("Date en sortie = ", `${day}/${month}`);
//     return `${day}/${month}`;
// }

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

/**
 * Fonction de calcul de l'url d'une image de film en fonction de la valeur du champ imageFilm128 ou imageFilm1024
 * Cela doit permettre de récupérer l'url selon les cas :
 * Si la valeur est un uuid suivi de la résolution, on redonne http://localhost:3500/api/films/affichefile/valeur
 * Sinon on donne http://127.0.0.1:3000/frontend/public/assets/static/
 * 
 * 813d32eb-7df7-4338-9976-bb4471a966d81024
 */

export function imageFilm (value: string): string {
    const prefixAPI = `${baseUrl}/api/films/affichefile/`;
    const prefixDist = `${baseUrl}/assets/static/`;
    const uuidPossible = value.slice(0,36);
    return (isUUID(uuidPossible) ? prefixAPI : prefixDist) + value;
}

export function syncTableColumnWidths(table: HTMLTableElement): void {
    const theadCols = table.querySelectorAll('thead tr th');
    const tbodyRow = table.querySelector('tbody tr');

    if (!theadCols.length || !tbodyRow) return;

    const tbodyCols = tbodyRow.querySelectorAll('td');
    if (theadCols.length !== tbodyCols.length) 
    {   console.error("Nombre de colonnes de l'entete et du tableau différent")
        return;
    } else {
        console.log("Calcul de la largeur des colonnes");
    }
    tbodyCols.forEach((td, i) => {
        const width = td.getBoundingClientRect().width;
        (theadCols[i] as HTMLElement).style.width = `${width}px`;
    });
}

export function isPasswordValid(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
}

type ExpectedType = 'string' | 'number' | 'boolean' | 'nullable-string' | 'nullable-number';

export function validateObjectShape(obj: any, shape: Record<string, ExpectedType>): boolean {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const key in shape) {
        const expected = shape[key];
        const value = obj[key];

        if (value === undefined || value === null) {
            if (!expected.startsWith('nullable')) {
                console.log(`⛔ ${key} est null/undefined mais ${expected} requis`);
                return false;
            }
            continue;
        }

        const baseType = expected.replace('nullable-', '');
        if (typeof value !== baseType) {
            console.log(`⛔ ${key} a la valeur ${value}, mais type ${baseType} attendu`);
            return false;
        }
    }

    return true;
}

import { Film } from "./shared-models/Film.js";
/**
 * Vérifie si un objet est un Film valide (shape des propriétés typées)
 */
export function sanitizeFilm(obj: any): obj is Film {
    const result = validateObjectShape(obj, {
        id: 'string',
        titleFilm: 'string',
        filmPitch: 'string',
        genreArray: 'string',
        duration: 'string',
        linkBO: 'string',
        dateSortieCinePhoria: 'string',
        categorySeeing: 'string',
        note: 'number',
        isCoupDeCoeur: 'number',
        isActiveForNewSeances: 'number',
        filmDescription: 'string',
        filmAuthor: 'string',
        filmDistribution: 'string',
        imageFilm128: 'string',
        imageFilm1024: 'string',
    });
    if (!result) console.error("Anomalie sanitize Film");
    return result;
}

import { Seance } from "./shared-models/Seance.js";
/**
 * Vérifie si un objet est une Seance valide (shape des propriétés typées)
 */
export function sanitizeSeance(obj: any): obj is Seance {
    const result = validateObjectShape(obj, {
        seanceId: 'string',
        filmId: 'string',
        salleId: 'string',
        dateJour: 'string',
        hourBeginHHSMM: 'string',
        hourEndHHSMM: 'string',
        qualite: 'string',
        bo: 'string',
        numFreeSeats: 'number',
        numFreePMR: 'number',
        alertAvailibility: 'nullable-string',
        nameSalle: 'string',
        nameCinema: 'string',
        capacity: 'number',
        numPMR: 'number',
        rMax: 'number',
        fMax: 'number',
        seatsAbsents: 'string',
        adresse: 'string',
        ville: 'string',
        postalcode: 'string',
        emailCinema: 'string',
        telCinema: 'string'
    });
    if (!result) console.error("Anomalie sanitize Seance");
    return result;
}

import { Cinema } from "./shared-models/Cinema.js";
/**
 * Vérifie si un objet est un Cinema valide (shape des propriétés typées)
 */
export function sanitizeCinema(obj: any): obj is Cinema {
    const result = validateObjectShape(obj, {
        nameCinema: 'string',
        adresse: 'string',
        ville: 'string',
        postalcode: 'string',
        emailCinema: 'string',
        telCinema: 'string',
        ligne1: 'string',
        ligne2: 'string'
    });
    if (!result) console.error("Anomalie sanitize Cinema");
    return result;
}

import { TarifQualite } from "./shared-models/Seance.js";
/**
 * Vérifie si un objet est un TarifQualite valide (shape des propriétés typées)
 */
export function sanitizeTarifQualite(obj: any): obj is TarifQualite {
    const result = validateObjectShape(obj, {
        id: 'string',
        qualite: 'string',
        nameTarif: 'string',
        price: 'number'
    });
    if (!result) console.error("Anomalie sanitize TarifQualite");
    return result;
}

export async function showCustomAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'custom-alert-overlay';
  
      const modal = document.createElement('div');
      modal.className = 'custom-alert-modal';
      modal.innerHTML = `<p>${message}</p>`;
  
      const btn = document.createElement('button');
      btn.textContent = 'OK';
      btn.addEventListener('click', () => {
        overlay.remove();
        resolve(); // ⏹ débloque le await
      });
  
      modal.appendChild(btn);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    });
  }
