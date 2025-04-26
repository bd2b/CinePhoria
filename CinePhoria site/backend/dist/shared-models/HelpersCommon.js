"use strict";
// import * as bcrypt from 'bcrypt';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordValid = isPasswordValid;
exports.formatDateLocalYYYYMMDD = formatDateLocalYYYYMMDD;
// /**
//  * Fonction de hachage d'un mot de passe avec bcrypt et une valeur de salage
//  * @param password 
//  * @returns 
//  */
// export async function hashPassword(password: string): Promise<string> {
//     const saltRounds = 10; // Plus le nombre est élevé, plus c'est sécurisé mais plus lent
//     return await bcrypt.hash(password, saltRounds);
// }
// /**
//  * Vérification d'un mot de passe
//  * @param password en clair
//  * @param hashedPassword password hasché
//  * @returns boolean
//  */
// export async function isPasswordEqual (password: string, hashedPassword: string): Promise<boolean> {
//     return await bcrypt.compare(password, hashedPassword);
// }
// Exemple d'utilisation
// (async () => {
//     const plainPassword = 'P@ssw0rd!';
//     // Hachage
//     const hashed = await hashPassword(plainPassword);
//     console.log('Mot de passe haché :', hashed);
//     // Vérification
//     const isMatch = await verifyPassword(plainPassword, hashed);
//     console.log('Le mot de passe est valide ?', isMatch);
// })();
/**
 * Verification de la dureté du mot de passe
 * Au moins 8-12 caractères.
 * Au moins 1 lettre majuscule.
 * Au moins 1 lettre minuscule.
 * Au moins 1 chiffre.
 * Au moins 1 caractère spécial (!@#$%^&*).
 * @param password
 * @returns boolean
 */
function isPasswordValid(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return (password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar);
}
/**
 * Formate la date (locale) au format yyyy-mm-dd, sans dépendre d’UTC.
 * toISOString() génère souvent un décalage si la zone horaire est négative/positive.
 */
function formatDateLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const rawMonth = date.getMonth() + 1;
    const rawDay = date.getDate();
    const m = rawMonth < 10 ? '0' + rawMonth : String(rawMonth);
    const d = rawDay < 10 ? '0' + rawDay : String(rawDay);
    return `${y}-${m}-${d}`;
}
