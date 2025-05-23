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
import { handleApiError, baseUrl } from './Global.js';
import { CinephoriaErrorCode, CinephoriaError } from './shared-models/Error.js';
/**
 * Fonction générique de gestion de l'API qui gère
 * - L’authentification avec JWT
 * - La gestion automatique du refresh token en cas d’expiration
 */
function apiRequest(endpoint_1, method_1, body_1) {
    return __awaiter(this, arguments, void 0, function* (endpoint, method, body, requiresAuth = true, isSilentError = false) {
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
                headers['Accept-Encoding'] = 'gzip, deflate, br';
            }
            if (requiresAuth) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const reqInit1 = {
                method,
                headers,
                body: finalBody,
                credentials: requiresAuth ? 'include' : 'same-origin'
            };
            // console.debug("ReqInit de tentative 1", reqInit1);
            let response = yield fetch(endpoint, reqInit1);
            if (requiresAuth && (response.status === 401 || response.status === 403)) {
                console.warn("🔄 Token expiré, tentative de refresh...");
                try {
                    yield refreshAccessToken();
                    token = localStorage.getItem('jwtAccessToken');
                    console.debug("Nouveau Token = ", token);
                    if (!token) {
                        console.error("🔴 Refresh échoué, suppression du token local.");
                        throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Echec du refresh, token expiré ou invalidé");
                    }
                    const retryHeaders = {
                        'Authorization': `Bearer ${token}`
                    };
                    if (!(finalBody instanceof FormData)) {
                        retryHeaders['Content-Type'] = 'application/json';
                        retryHeaders['Accept-Encoding'] = 'gzip, deflate, br';
                    }
                    const reqInit2 = {
                        method,
                        headers: retryHeaders,
                        body: finalBody,
                        credentials: 'include'
                    };
                    // console.debug("ReqInit de tentative 2", reqInit2)
                    response = yield fetch(endpoint, reqInit2);
                }
                catch (err) {
                    console.error("🔴 Echec du refreshToken :", err);
                    throw err;
                }
            }
            const data = yield response.json();
            if (!response.ok) {
                if (response.status === 400) {
                    if (isSilentError) {
                        throw new CinephoriaError(CinephoriaErrorCode.API_ERROR_SILENT, data.message || 'Erreur inconnue');
                    }
                    else {
                        throw new CinephoriaError(CinephoriaErrorCode.API_ERROR, data.message || 'Erreur inconnue');
                    }
                }
                // Gestion d'autres statuts non-OK si besoin ici
            }
            return data;
        }
        catch (error) {
            console.log("L'erreur passe par là");
            return handleApiError(error); // ✅ Capture et redirige via handleApiError
        }
    });
}
function refreshAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 Tentative de refresh du token...");
            const response = yield fetch(`${baseUrl}/api/login/refresh`, {
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
            console.debug("Token reçu de refresh = ", accessToken);
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
        const response = yield fetch(`${baseUrl}/api/login`, {
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
        const response = yield fetch(`${baseUrl}/api/login/logout`, {
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
        const endpoint = `${baseUrl}/api/reservation`;
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
        const endpoint = `${baseUrl}/api/utilisateur/confirmUtilisateur`;
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
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
        const endpoint = `${baseUrl}/api/utilisateur/confirmCompte`;
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
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
        return apiRequest(`${baseUrl}/api/reservation/confirm`, 'POST', {
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
        return apiRequest(`${baseUrl}/api/reservation/setstate`, 'POST', {
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
        return apiRequest(`${baseUrl}/api/reservation/setevaluation`, 'POST', {
            reservationId,
            note,
            evaluation,
            isEvaluationMustBeReview
        });
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
        const endpoint = `${baseUrl}/api/reservation/cancel`;
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
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
        const endpoint = `${baseUrl}/api/utilisateur/${identUtilisateur}`;
        // Appel de apiRequest pour gérer l'authentification et les erreurs
        const rawData = yield apiRequest(endpoint, 'GET', null, false);
        if (!Array.isArray(rawData)) {
            throw new Error('La réponse de l’API n’est pas un tableau.');
        }
        // Convertir les données brutes en instances de ComptePersonne
        return rawData.map((d) => new ComptePersonne(d));
    });
}
/**
 * Récupération des données d'une reservation
 * @param reservationId
 * @returns
 */
export function getReservationApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/reservation/id/${reservationId}`;
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
        const endpoint = `${baseUrl}/api/seances/seats/${seanceId}`;
        const seatsBooked = yield apiRequest(endpoint, 'GET', undefined, false); // Pas d'authentification requise
        console.log("Liste des sieges = ", seatsBooked);
        return seatsBooked;
    });
}
/**
 * Récupération d'une seance
 * @param un tableau de seanceID
 * @returns un tableau de seances
 */
export function getSeancesByIdApi(uuids) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seances/seances?ids=${uuids}`;
        const seances = yield apiRequest(endpoint, 'GET', undefined, false); // Pas d'authentification requise
        console.log("Liste des séances = ", seances);
        return seances;
    });
}
/**
 * Récupérer les places d'une reservation provisoire, api publique
 * @param reservationId
 * @returns
 */
export function getPlacesReservationApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/reservation/seats/id/${reservationId}`;
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
export function isLogged() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/login/isLogged`;
        // Utilisation de apiRequest pour gérer l'authentification et les erreurs
        return yield apiRequest(endpoint, 'GET', undefined);
    });
}
export function getReservationForUtilisateur(utilisateurId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/reservation/${utilisateurId}`;
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
        const body = { mailInput: mail };
        console.log(body);
        const endpoint = `${baseUrl}/api/mail/sendmailcontact`;
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false // Pas d'authentification requise
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function getReservationQRCodeApi(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/reservation/qrcodeimage/${reservationId}`;
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
        const endpoint = `${baseUrl}/api/utilisateur/askresetpwd`;
        const body = { email: email };
        console.log(body);
        const responseJSON = yield apiRequest(endpoint, 'POST', body, false, // Pas d'authentification requise
        true // Erreur silencieuse
        );
        console.log("Message retour", responseJSON);
        return responseJSON;
    });
}
export function resetPwdApi(email, codeConfirm, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/utilisateur/resetpwd`;
        const body = { email: email, codeConfirm: codeConfirm, newPassword: newPassword };
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
        const endpoint = `${baseUrl}/api/films`;
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
        const endpoint = `${baseUrl}/api/films/${filmId}`;
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
        const endpoint = `${baseUrl}/api/films/${filmId}`;
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
        const endpoint = `${baseUrl}/api/films/${filmId}`;
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
        const endpoint = `${baseUrl}/api/films`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, false);
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
        return apiRequest(`${baseUrl}/api/films/affiche`, 'POST', formData, false // Pas d'authentification requise
        );
    });
}
/**
 * Récupération d'une affiche par filmId (READ)
 */
export function getAfficheApi(filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`${baseUrl}/api/films/affiche/${filmId}`, 'GET', undefined, false // Pas d'authentification requise
        );
    });
}
/**
 * Récupération de toutes les affiches (READ)
 */
export function getAllAffichesApi() {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`${baseUrl}/api/films/affiche`, 'GET', undefined, false // Pas d'authentification requise
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
        return apiRequest(`${baseUrl}/api/films/affiche/${filmId}`, 'PUT', formData, false // Pas d'authentification requise
        );
    });
}
/**
 * Suppression d'une affiche (DELETE)
 */
export function deleteAfficheApi(filmId) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`${baseUrl}/api/films/affiche/${filmId}`, 'DELETE', undefined, false // Pas d'authentification requise
        );
    });
}
/**
 * Création d’un nouveau salle (POST /api/salles)
 * @param salle Les informations du salle à créer
 * @returns { message, id } où 'id' est l'identifiant du salle créé
 */
export function sallesCreateApi(salle) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/salles`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'POST', salle, true);
        return responseJSON;
    });
}
/**
 * Récupération d’un salle par son ID (GET /api/salles/:id)
 * @param salleId L'identifiant du salle
 * @returns L’objet Salle correspondant
 */
export function sallesSelectApi(salleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/salles/${salleId}`;
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Récupération des salles d'un cinema (GET /api/salles/cinema/:cinema)
 * @param cinema Le nom du cinema
 * @returns un tableau de salles
 */
export function sallesSelectCinemaApi(nameCinema) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/salles/cinema/${nameCinema}`;
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Mise à jour d’un salle (PUT /api/salles/:id)
 * @param salleId L'identifiant du salle à mettre à jour
 * @param salle Les nouvelles informations du salle
 * @returns { message } si la mise à jour est réussie
 */
export function sallesUpdateApi(salleId, salle) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/salles/${salleId}`;
        const responseJSON = yield apiRequest(endpoint, 'PUT', salle, true);
        return responseJSON;
    });
}
/**
 * Suppression d’un salle (DELETE /api/salles/:id)
 * @param salleId L'identifiant du salle à supprimer
 * @returns { message } si la suppression est réussie
 */
export function sallesDeleteApi(salleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/salles/${salleId}`;
        const responseJSON = yield apiRequest(endpoint, 'DELETE', undefined, true);
        return responseJSON;
    });
}
/**
* Récupération de tous les salles (GET /api/salles)
* @returns Un tableau de Salle
*/
export function sallesSelectAllApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/salles`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Création d’un nouveau seanceseule (POST /api/seancesseules)
 * @param seanceseule Les informations du seanceseule à créer
 * @returns { message, id } où 'id' est l'identifiant du seanceseule créé
 */
export function seancesseulesCreateApi(seanceseule) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seancesseules`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'POST', seanceseule, true);
        return responseJSON;
    });
}
/**
 * Récupération d’un seanceseule par son ID (GET /api/seancesseules/:id)
 * @param seanceseuleId L'identifiant du seanceseule
 * @returns L’objet SeanceSeule correspondant
 */
export function seancesseulesSelectApi(seanceseuleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seancesseules/${seanceseuleId}`;
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Mise à jour d’un seanceseule (PUT /api/seancesseules/:id)
 * @param seanceseuleId L'identifiant du seanceseule à mettre à jour
 * @param seanceseule Les nouvelles informations du seanceseule
 * @returns { message } si la mise à jour est réussie
 */
export function seancesseulesUpdateApi(seanceseuleId, seanceseule) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seancesseules/${seanceseuleId}`;
        const responseJSON = yield apiRequest(endpoint, 'PUT', seanceseule, true);
        return responseJSON;
    });
}
/**
 * Suppression d’un seanceseule (DELETE /api/seancesseules/:id)
 * @param seanceseuleId L'identifiant du seanceseule à supprimer
 * @returns { message } si la suppression est réussie
 */
export function seancesseulesDeleteApi(seanceseuleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seancesseules/${seanceseuleId}`;
        const responseJSON = yield apiRequest(endpoint, 'DELETE', undefined, true);
        return responseJSON;
    });
}
/**
* Récupération de tous les seancesseules (GET /api/seancesseules)
* @returns Un tableau de SeanceSeule
*/
export function seancesseulesSelectAllApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seancesseules`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Récupération d'une seance
 * @param un tableau de seanceID
 * @returns un tableau de seances
 */
export function getSeancesSeulesByIdApi(uuids) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/seancesseules/seancesseules?ids=${uuids}`;
        const seancesSeules = yield apiRequest(endpoint, 'GET', undefined);
        console.log("Liste des séances seules= ", seancesSeules);
        return seancesSeules;
    });
}
/**
* Récupération de tous les seancesdisplay en fonction d'une liste de cinema
* (GET /api/seances/display/filter?)
* ${baseUrl}/api/seances/display/filter?cinemasList="Paris"
* @returns Un tableau de SeanceSeule
*/
export function seancesDisplayByCinemaApi(cinemas) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = cinemas.map(s => `"${s}"`).join(',');
        const endpoint = `${baseUrl}/api/seances/display/filter?cinemasList=${filter}`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, false);
        return responseJSON;
    });
}
/**
* Récupération de toutes les reservations en fonction d'une liste de cinema
* (GET /api/reservation/cinema/filter?)
* ${baseUrl}/api/reservation/cinema/filter?cinemasList="Paris"
* @returns Un tableau de ReservationForUtilisateur
*/
export function reservationsByCinemaApi(cinemas) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = cinemas.map(s => `"${s}"`).join(',');
        const endpoint = `${baseUrl}/api/reservation/cinema/filter?cinemasList=${filter}`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Mise à jour d’un avis (PUT /api/reservation/avis/:reservationid)
 * @param reservationid L'identifiant de la reservetion à mettre à jour
 * @param reservationAvis Les nouvelles informations de la reservation
 * @returns { message } si la mise à jour est réussie
 */
export function reservationAvisUpdateApi(reservationId, reservationAvis) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(JSON.stringify(reservationAvis));
        const endpoint = `${baseUrl}/api/reservation/avis/${reservationId}`;
        const responseJSON = yield apiRequest(endpoint, 'PUT', reservationAvis, true);
        return responseJSON;
    });
}
/**
* Récupération de tous les employes (GET api/utilisateur/getemployes)
* @returns Un tableau d'employes
*/
export function employesSelectAllApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/utilisateur/getemployes`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Récupération d’un employe par son ID (GET /api/utilisateur/employe/:matricule)
 * @param matricule le matricule de l'agent
 * @returns L’objet ComptePersonne correspondant
 */
export function getEmployeByMatriculeApi(matricule) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/utilisateur/getemploye/${matricule}`;
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
 * Création d’un nouvel employe (POST /api/utilisateur/createEmploye)
 * @param seanceseule Les informations du seanceseule à créer
 * @returns { message, id } où 'id' est l'identifiant du seanceseule créé
 */
export function employeCreateApi(employe_1) {
    return __awaiter(this, arguments, void 0, function* (employe, password = "") {
        var _a;
        const endpoint = `${baseUrl}/api/utilisateur/createEmploye`;
        const formData = new FormData();
        formData.append('email', employe.email);
        formData.append('password', password);
        if (employe.isAdministrateur && employe.isAdministrateur === 1) {
            formData.append('isAdministrateur', "true");
        }
        else {
            formData.append('isAdministrateur', "false");
        }
        formData.append('firstnameEmploye', employe.firstnameEmploye || '');
        formData.append('lastnameEmploye', employe.lastnameEmploye || '');
        formData.append('matricule', ((_a = employe.matricule) === null || _a === void 0 ? void 0 : _a.toString(10)) || '');
        formData.append('listCinemas', employe.listCinemas || '');
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'POST', formData, true);
        return responseJSON;
    });
}
/**
 * Mise à jour d’un employe (PUT /api/utilisateur/updateemploye/:matricule)
 * @param employe Les nouvelles informations employe
 * @returns { message } si la mise à jour est réussie
 */
export function employeUpdateApi(employe, password) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const endpoint = `${baseUrl}/api/utilisateur/updateemploye`;
        const formData = new FormData();
        formData.append('email', employe.email);
        formData.append('password', password);
        if (employe.isAdministrateur && employe.isAdministrateur === 1) {
            formData.append('isAdministrateur', "true");
        }
        else {
            formData.append('isAdministrateur', "false");
        }
        formData.append('firstnameEmploye', employe.firstnameEmploye || '');
        formData.append('lastnameEmploye', employe.lastnameEmploye || '');
        formData.append('matricule', ((_a = employe.matricule) === null || _a === void 0 ? void 0 : _a.toString(10)) || '');
        formData.append('listCinemas', employe.listCinemas || '');
        const responseJSON = yield apiRequest(endpoint, 'PUT', formData, true);
        return responseJSON;
    });
}
employeDeleteApi;
/**
 * Suppression d’un employe qui ne s'est jamais connecte (DELETE /api/utilisateur/deleteemploye/:matricule)
 * @param matricule L'identifiant du salle à supprimer
 * @returns { message } si la suppression est réussie
 */
export function employeDeleteApi(matricule) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/utilisateur/deleteemploye/${matricule}`;
        const responseJSON = yield apiRequest(endpoint, 'DELETE', undefined, true);
        return responseJSON;
    });
}
/**
* Récupération de toutes les stats de réservation (GET api/reservation/getreservationstats)
* @returns Un tableau d'employes
*/
export function getReservationStatsApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/reservation/getreservationstats`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, true);
        return responseJSON;
    });
}
/**
* Récupération de du numero de version
* @returns un ( { majeure: number, mineure: number, build: number } )
*/
export function getVersionApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `${baseUrl}/api/login/version`;
        // Requête authentifiée
        const responseJSON = yield apiRequest(endpoint, 'GET', undefined, false);
        return responseJSON;
    });
}
