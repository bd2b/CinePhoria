var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { isUUID } from './Helpers.js';
export function reservationApi(email, seanceId, tarifSeats, // { tarifId: numberOfSeats, ... }
pmrSeats) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { email, seanceId, tarifSeats, pmrSeats };
        const response = yield fetch('http://localhost:3500/api/reservation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // Réponse OK -> { statut, utilisateurId, reservationId }
        const responseJSON = yield response.json();
        const { statut, utilisateurId, reservationId } = responseJSON;
        // f) Contrôles de cohérence
        //   - Vérifier seanceId identique
        //   - Vérifier si utilisateurId est un UUID
        //   - Gérer statut
        let messageError = "";
        if (!isUUID(reservationId)) {
            messageError += `ReservationID invalide.`;
        }
        if (!isUUID(utilisateurId)) {
            messageError += `UtilisateurId invalide.`;
        }
        if (statut == 'NA') {
            messageError = `Une erreur s'est produite côté serveur (NA).`;
        }
        if (utilisateurId.startsWith('Erreur')) {
            messageError += " Erreur utilisateur : " + utilisateurId;
        }
        if (reservationId.startsWith('Erreur')) {
            messageError += " Erreur reservation : " + reservationId;
        }
        if (messageError !== "") {
            throw new Error(messageError);
        }
        return responseJSON;
    });
}
export function confirmUtilisateurApi(id, password, displayName) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { id, password, displayName };
        const response = yield fetch('http://localhost:3500/api/utilisateur/confirmUtilisateur', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // Examen de la reponse
        const responseJSON = yield response.json();
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function confirmCompteApi(email, codeConfirm) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { email, codeConfirm };
        const response = yield fetch('http://localhost:3500/api/utilisateur/confirmCompte', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // Examen de la reponse
        const responseJSON = yield response.json();
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function loginApi(compte, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { compte, password };
        const response = yield fetch('http://localhost:3500/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // Examen de la reponse
        const responseJSON = yield response.json();
        console.log("Message retour", responseJSON);
        localStorage.setItem('jwtToken', responseJSON.token); // Stocker le token
    });
}
export function confirmReserveApi(reservationId, utilisateurId, seanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { reservationId, utilisateurId, seanceId };
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            alert('Vous devez être connecté');
            return;
        }
        const response = yield fetch(`http://localhost:3500/api/reservation/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // Examen de la reponse
        const responseJSON = yield response.json();
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
