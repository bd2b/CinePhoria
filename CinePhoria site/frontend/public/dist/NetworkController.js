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
import { ComptePersonne } from './shared-models/Utilisateur.js';
import { ReservationForUtilisateur, SeatsForReservation } from './shared-models/Reservation.js';
import { handleApiError } from './Global.js';
import { CinephoriaErrorCode, CinephoriaError } from "./shared-models/Error.js";
/**
 * Fonction générique de gestion de l'API qui gère
 * - L’authentification avec JWT
 * - La gestion automatique du refresh token en cas d’expiration
 */
function apiRequest(endpoint_1, method_1, body_1) {
    return __awaiter(this, arguments, void 0, function* (endpoint, method, body, requiresAuth = true) {
        try {
            let token = localStorage.getItem('jwtAccessToken');
            if (requiresAuth && !token) {
                console.warn("⛔ Aucun token disponible, redirection immédiate.");
                throw new CinephoriaError(CinephoriaErrorCode.AUTH_REQUIRED, "Authentification requise et pas de token.");
            }
            const headers = {};
            /** Probleme pour l'envoie de fichier
             * Le problème vient du fait que le serveur ne reçoit pas tes données en form-data
             * (du coup req.body.resolution et req.files sont vides).
             * Avec express-fileupload, si on envoie bien du multipart/form-data,
             * on devrait retrouver quelque chose dans req.files.imageFile et
             * req.body.resolution.
             *
             * La cause la plus fréquente :
             * tu forces Content-Type: application/json quelque part ou
             * tu n’envoies pas correctement le formData.
             * Assure-toi que dans ta fonction apiRequest (ou équivalent),
             * tu n’ajoutes pas de header Content-Type quand tu envoies un FormData.
             * Il faut laisser le navigateur définir tout seul le boundary du multipart.
             */
            let finalBody;
            if (body instanceof FormData) {
                finalBody = body;
                // pas de headers['Content-Type']
            }
            else {
                finalBody = body ? JSON.stringify(body) : undefined;
                headers['Content-Type'] = 'application/json';
            }
            if (requiresAuth) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            let response = yield fetch(endpoint, {
                method,
                headers,
                body: finalBody,
                credentials: requiresAuth ? 'include' : 'same-origin'
            });
            if (requiresAuth && (response.status === 401 || response.status === 403)) {
                console.warn("🔄 Token expiré, tentative de refresh...");
                try {
                    yield refreshAccessToken();
                    token = localStorage.getItem('jwtAccessToken');
                    if (!token) {
                        console.error("🔴 Refresh échoué, suppression du token local.");
                        throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Echec du refresh, token expiré ou invalidé");
                    }
                    // 🔄 Re-tenter la requête avec le nouveau token
                    response = yield fetch(endpoint, {
                        method,
                        headers: Object.assign(Object.assign({}, headers), { 'Authorization': `Bearer ${token}` }),
                        body: finalBody,
                        credentials: 'include'
                    });
                }
                catch (err) {
                    console.error("🔴 Echec du refreshToken :", err);
                    throw err;
                }
            }
            if (!response.ok) {
                const errData = yield response.json();
                throw new CinephoriaError(CinephoriaErrorCode.API_ERROR, errData.message || 'Erreur inconnue');
            }
            return response.json();
        }
        catch (error) {
            return handleApiError(error); // ✅ Capture et redirige via handleApiError
        }
    });
}
function refreshAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 Tentative de refresh du token...");
            const response = yield fetch('http://localhost:3500/api/refresh', {
                method: 'POST',
                // on peut mettre credentials: 'include' si le refresh nécessite le cookie
                credentials: 'include'
            });
            if (!response.ok) {
                console.error("🔴 Echec du refresh, suppression du token local");
                localStorage.removeItem('jwtAccessToken');
                // throw new Error('Echec du refresh, token expiré ou invalidé');
                throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Echec du refresh, token expiré ou invalidé");
            }
            const json = yield response.json();
            const { accessToken } = json;
            localStorage.setItem('jwtAccessToken', accessToken);
            console.log("Nouveau accessToken obtenu via /api/refresh");
        }
        catch (err) {
            console.error("🔴 Erreur dans refreshAccessToken :", err);
            localStorage.removeItem('jwtAccessToken');
            throw err; // Propage l'erreur pour que apiRequest la capture
        }
    });
}
/**
 * Login de l'utilisateur
 * @param compte
 * @param password
 */
export function loginApi(compte, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { compte, password };
        const response = yield fetch('http://localhost:3500/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include' // IMPORTANT pour recevoir le cookie (refreshToken)
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // Récupérer l'accessToken
        const responseJSON = yield response.json();
        const accessToken = responseJSON.accessToken;
        // Stocker l'accessToken (pas le refresh)
        localStorage.setItem('jwtAccessToken', accessToken);
        console.log("Login OK, accessToken stocké, refreshToken dans cookie HttpOnly");
    });
}
export function logoutApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('http://localhost:3500/api/login/logout', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
    });
}
/**
 * Création d'une réservation
 * @param email
 * @param seanceId
 * @param tarifSeats
 * @param pmrSeats
 * @returns JSON avec { statut, utilisateurId, reservationId }
 * @throws Erreur avec message
 */
export function setReservationApi(email, seanceId, tarifSeats, // { tarifId: numberOfSeats, ... }
pmrSeats, seatsReserved) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { email, seanceId, tarifSeats, pmrSeats, seatsReserved };
        const endpoint = 'http://localhost:3500/api/reservation';
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        // Vérifications et gestion des erreurs
        let messageError = "";
        if (!isUUID(responseJSON.reservationId)) {
            messageError += `ReservationID invalide.`;
        }
        if (!isUUID(responseJSON.utilisateurId)) {
            messageError += `UtilisateurId invalide.`;
        }
        if (responseJSON.statut === 'NA') {
            messageError = `Une erreur s'est produite côté serveur (NA).`;
        }
        if (responseJSON.utilisateurId.startsWith('Erreur')) {
            messageError += " Erreur utilisateur : " + responseJSON.utilisateurId;
        }
        if (responseJSON.reservationId.startsWith('Erreur')) {
            messageError += " Erreur reservation : " + responseJSON.reservationId;
        }
        if (messageError !== "") {
            throw new Error(messageError);
        }
        return responseJSON;
    });
}
export function setReservationApi2(email, seanceId, tarifSeats, // { tarifId: numberOfSeats, ... }
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
/**
 * Confirmation de la création de l'utilisateur
 * @param id
 * @param password
 * @param displayName
 * @returns Message de reussite ou d'erreur
 */
export function confirmUtilisateurApi(id, password, displayName) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { id, password, displayName };
        const endpoint = 'http://localhost:3500/api/utilisateur/confirmUtilisateur';
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function confirmUtilisateurApi2(id, password, displayName) {
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
/**
 * Validation de l'email
 * @param email
 * @param codeConfirm
 * @returns
 */
export function confirmCompteApi(email, codeConfirm) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { email, codeConfirm };
        const endpoint = 'http://localhost:3500/api/utilisateur/confirmCompte';
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function confirmCompteApi2(email, codeConfirm) {
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
/**
 * Fonction de confirmation de la reservation
 * api securisée
 * @param reservationId
 * @param utilisateurId
 * @param seanceId
 * @returns
 */
export function confirmReserveApi(reservationId, utilisateurId, seanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('http://localhost:3500/api/reservation/confirm', 'POST', {
            reservationId,
            utilisateurId,
            seanceId,
        });
    });
}
/**
 * Fonction de modification de l'état de la reservation
 * api securisée
 * @param reservationId
 * @param stateReservation
 * @returns
 */
export function setStateReservationApi(reservationId, stateReservation) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('http://localhost:3500/api/reservation/setstate', 'POST', {
            reservationId,
            stateReservation
        });
    });
}
/**
 * Fonction de modification de l'évaluation de la reservation
 * api securisée
 * @param reservationId
 * @param stateReservation
 * @returns
 */
export function setEvaluationReservationApi(reservationId, note, evaluation, p_isEvaluationMustBeReview) {
    return __awaiter(this, void 0, void 0, function* () {
        const isEvaluationMustBeReview = p_isEvaluationMustBeReview ? "true" : "false";
        return apiRequest('http://localhost:3500/api/reservation/setevaluation', 'POST', {
            reservationId,
            note,
            evaluation,
            isEvaluationMustBeReview
        });
    });
}
// TODO: mettre en place les deux jetons (nécessite SSL)
export function confirmReserveApi2(reservationId, utilisateurId, seanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { reservationId, utilisateurId, seanceId };
        let token = localStorage.getItem('jwtAccessToken');
        if (!token) {
            throw new Error('Vous devez être connecté');
        }
        // Tenter la requête
        let response = yield fetch('http://localhost:3500/api/reservation/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
            credentials: 'include' // inclure les cookies => envoie le refreshToken
        });
        if (response.ok) {
            const data = yield response.json();
            return data; // OK direct
        }
        // Sinon, si 401 ou 403 => peut-être token expiré => tenter refresh
        if (response.status === 401 || response.status === 403) {
            try {
                yield refreshAccessToken();
                // Récupérer le nouveau token
                token = localStorage.getItem('jwtAccessToken');
                if (!token) {
                    throw new Error('refreshAccessToken a échoué');
                }
                // Re-tenter la requête
                response = yield fetch('http://localhost:3500/api/reservation/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(body),
                    credentials: 'include'
                });
                if (!response.ok) {
                    const errData = yield response.json();
                    throw new Error(errData.message || 'Erreur inconnue après refresh');
                }
                const data2 = yield response.json();
                return data2;
            }
            catch (err) {
                throw new Error(`Echec du refresh token : ${err}`);
            }
        }
        else {
            // Autre erreur
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
    });
}
/**
 * Annulation de la reservation
 * @param reservationId
 * @returns OK ou message d'erreur
 */
export function cancelReserveApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { reservationId };
        const endpoint = 'http://localhost:3500/api/reservation/cancel';
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function cancelReserveApi2(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { reservationId };
        const response = yield fetch(`http://localhost:3500/api/reservation/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
/**
 * Récupération du profil de l'utilisateur
 * @param identUtilisateur
 * @returns ComptePersonne
 */
export function profilApi(identUtilisateur) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/utilisateur/${identUtilisateur}`;
        // Appel de apiRequest pour gérer l'authentification et les erreurs
        const rawData = yield apiRequest(endpoint, 'GET', null);
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de ComptePersonne
        return rawData.map((d) => new ComptePersonne(d));
    });
}
export function profilApi2(identUtilisateur) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = localStorage.getItem('jwtAccessToken');
        const response = yield fetch(`http://localhost:3500/api/utilisateur/${identUtilisateur}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const rawData = yield response.json();
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de Compte Personne
        const comptesUtilisateur = rawData.map((d) => new ComptePersonne(d));
        console.log("compte = ", comptesUtilisateur);
        return comptesUtilisateur;
    });
}
/**
 * Récupération des données d'une reservation
 * @param reservationId
 * @returns
 */
export function getReservationApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/reservation/id/${reservationId}`;
        const rawData = yield apiRequest(endpoint, 'GET', undefined, false); // Pas d'authentification requise
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de ReservationForUtilisateur
        const reservations = rawData.map((d) => new ReservationForUtilisateur(d));
        console.log("reservations = ", reservations);
        return reservations;
    });
}
/**
 * Récupération des places réservées pour une séance
 * @param seanceID
 * @returns Liste des sieges reservé constitué dans une chaine avec numero de siege separe par une ","
 */
export function getSeatsBookedApi(seanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/seances/seats/${seanceId}`;
        const seatsBooked = yield apiRequest(endpoint, 'GET', undefined, false); // Pas d'authentification requise
        console.log("Liste des sieges = ", seatsBooked);
        return seatsBooked;
    });
}
/**
 * Récupération d'une seance
 * @param seanceID
 * @returns unn tableau de seances avec une seule séance
 */
export function getSeancesByIdApi(uuids) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/seances/seances?ids=${uuids}`;
        const seances = yield apiRequest(endpoint, 'GET', undefined, false); // Pas d'authentification requise
        console.log("Liste des séances = ", seances);
        return seances;
    });
}
export function getReservationApi2(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`http://localhost:3500/api/reservation/id/${reservationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const rawData = yield response.json();
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de Seance
        const reservations = rawData.map((d) => new ReservationForUtilisateur(d));
        console.log("reservations = ", reservations);
        return reservations;
    });
}
/**
 * Récupérer les places d'une reservation provisoire, api publique
 * @param reservationId
 * @returns
 */
export function getPlacesReservationApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/reservation/seats/id/${reservationId}`;
        const rawData = yield apiRequest(endpoint, 'GET', undefined, false); // Pas d'authentification requise
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de SeatsForReservation
        const places = rawData.map((d) => new SeatsForReservation(d));
        console.log("places = ", places);
        return places;
    });
}
export function getPlacesReservationApi2(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`http://localhost:3500/api/reservation/seats/id/${reservationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const rawData = yield response.json();
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de Seance
        const places = rawData.map((d) => new SeatsForReservation(d));
        console.log("places = ", places);
        return places;
    });
}
export function isLogged() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/login/isLogged`;
        // Utilisation de apiRequest pour gérer l'authentification et les erreurs
        return yield apiRequest(endpoint, 'GET', undefined);
    });
}
export function isLogged2() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = localStorage.getItem('jwtToken');
        const response = yield fetch(`http://localhost:3500/api/login/isLogged`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errData = yield response.json();
            throw new Error(errData.message || 'Erreur inconnue');
        }
        // La réponse est le compte
        return response;
    });
}
export function getReservationForUtilisateur(utilisateurId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/reservation/${utilisateurId}`;
        // Utilisation de apiRequest pour gérer l'authentification et les erreurs
        const rawData = yield apiRequest(endpoint, 'GET', null);
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de ReservationForUtilisateur
        return rawData.map((r) => new ReservationForUtilisateur(r));
    });
}
export function sendMailApi(mail) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ mailInput: mail });
        console.log(body);
        const endpoint = 'http://localhost:3500/api/mail/sendmailcontact';
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function getReservationQRCodeApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/reservation/qrcodeimage/${reservationId}`;
        const response = yield apiRequest(endpoint, 'GET', undefined, true);
        const byteArray = new Uint8Array(response.qrCodeFile);
        const base64String = btoa(String.fromCharCode(...byteArray));
        const imgElement = document.createElement('img');
        imgElement.src = `data:${response.contentType};base64,${base64String}`;
        imgElement.alt = 'QR Code';
        document.body.appendChild(imgElement);
        return imgElement;
    });
}
export function askResetPwdApi(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/utilisateur/askresetpwd`;
        const body = JSON.stringify({ email: email });
        console.log(body);
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function resetPwdApi(email, codeConfirm, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/utilisateur/resetpwd`;
        const body = JSON.stringify({ email: email, codeConfirm: codeConfirm, newPassword: newPassword });
        console.log(body);
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
/**
 * Création d’un nouveau film (POST /api/films)
 * @param film Les informations du film à créer
 * @returns { message, id } où 'id' est l'identifiant du film créé
 */
export function filmsCreateApi(film) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'http://localhost:3500/api/films';
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'POST', film, true);
        return responseJSON;
    });
}
/**
 * Récupération d’un film par son ID (GET /api/films/:id)
 * @param filmId L'identifiant du film
 * @returns L’objet Film correspondant
 */
export function filmsSelectApi(filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/films/${filmId}`;
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Mise à jour d’un film (PUT /api/films/:id)
 * @param filmId L'identifiant du film à mettre à jour
 * @param film Les nouvelles informations du film
 * @returns { message } si la mise à jour est réussie
 */
export function filmsUpdateApi(filmId, film) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/films/${filmId}`;
        const responseJSON = yield apiRequest(endpoint, 'PUT', film, true);
        return responseJSON;
    });
}
/**
 * Suppression d’un film (DELETE /api/films/:id)
 * @param filmId L'identifiant du film à supprimer
 * @returns { message } si la suppression est réussie
 */
export function filmsDeleteApi(filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `http://localhost:3500/api/films/${filmId}`;
        const responseJSON = yield apiRequest(endpoint, 'DELETE', undefined, true);
        return responseJSON;
    });
}
/**
* Récupération de tous les films (GET /api/films)
* @returns Un tableau de Film
*/
export function filmsSelectAllApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'http://localhost:3500/api/films';
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Création d'une affiche (CREATE)
 */
export function createAfficheApi(filmId, imageFile, resolution, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append('filmId', filmId);
        formData.append('imageFile', imageFile);
        formData.append('resolution', resolution.toString());
        formData.append('contentType', contentType);
        return apiRequest('http://localhost:3500/api/films/affiche', 'POST', formData, false // Pas d'authentification requise
        );
    });
}
/**
 * Récupération d'une affiche par filmId (READ)
 */
export function getAfficheApi(filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`http://localhost:3500/api/films/affiche/${filmId}`, 'GET', undefined, false // Pas d'authentification requise
        );
    });
}
/**
 * Récupération de toutes les affiches (READ)
 */
export function getAllAffichesApi() {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('http://localhost:3500/api/films/affiche', 'GET', undefined, false // Pas d'authentification requise
        );
    });
}
/**
 * Mise à jour d'une affiche (UPDATE)
 */
export function updateAfficheApi(filmId, imageFile, resolution, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        if (imageFile)
            formData.append('imageFile', imageFile);
        if (resolution)
            formData.append('resolution', resolution.toString());
        if (contentType)
            formData.append('contentType', contentType);
        return apiRequest(`http://localhost:3500/api/films/affiche/${filmId}`, 'PUT', formData, false // Pas d'authentification requise
        );
    });
}
/**
 * Suppression d'une affiche (DELETE)
 */
export function deleteAfficheApi(filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`http://localhost:3500/api/films/affiche/${filmId}`, 'DELETE', undefined, false // Pas d'authentification requise
        );
    });
}
