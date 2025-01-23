var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcrypt';
/**
 * Fonction de hachage d'un mot de passe avec bcrypt et une valeur de salage
 * @param password
 * @returns
 */
export function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10; // Plus le nombre est élevé, plus c'est sécurisé mais plus lent
        return yield bcrypt.hash(password, saltRounds);
    });
}
/**
 * Vérification d'un mot de passe
 * @param password en clair
 * @param hashedPassword password hasché
 * @returns boolean
 */
export function isPasswordEqual(password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(password, hashedPassword);
    });
}
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
export function isPasswordValid(password) {
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
