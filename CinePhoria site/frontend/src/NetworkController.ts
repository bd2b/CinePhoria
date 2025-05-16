import { ReservationState, TarifForSeats } from './shared-models/Reservation.js';
import { isUUID, validateEmail } from './Helpers.js';
import { ComptePersonne } from './shared-models/Utilisateur.js';
import { ReservationForUtilisateur, SeatsForReservation, ReservationAvis, ReservationStats } from './shared-models/Reservation.js';
import { userDataController } from './DataControllerUser.js';
import { handleApiError, baseUrl } from './Global.js';
import { CinephoriaErrorCode, CinephoriaError } from './shared-models/Error.js';
import { Mail } from './shared-models/Mail.js';
import { Seance, SeanceDisplay } from './shared-models/Seance.js';
import { Film } from './shared-models/Film.js';
import { Salle } from './shared-models/Salle.js';
import { SeanceSeule } from './shared-models/SeanceSeule.js';
import { MajSite } from './shared-models/MajSite.js';



/**
 * Fonction générique de gestion de l'API qui gère
 * - L’authentification avec JWT
 * - La gestion automatique du refresh token en cas d’expiration
 */
async function apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    requiresAuth: boolean = true,
    isSilentError: boolean = false
): Promise<T> {
    try {
        let token = localStorage.getItem('jwtAccessToken');

        if (requiresAuth && !token) {
            console.warn("⛔ Aucun token disponible, redirection immédiate.");
            throw new CinephoriaError(CinephoriaErrorCode.AUTH_REQUIRED, "Authentification requise et pas de token.");
        }

        const headers: HeadersInit = {};
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

        let finalBody: BodyInit | undefined;
        if (body instanceof FormData) {
            finalBody = body;
            // pas de headers['Content-Type']
        } else {
            finalBody = body ? JSON.stringify(body) : undefined;
            headers['Content-Type'] = 'application/json';
            headers['Accept-Encoding'] = 'gzip, deflate, br';
        }

        if (requiresAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const reqInit1: RequestInit = {
            method,
            headers,
            body: finalBody,
            credentials: requiresAuth ? 'include' : 'same-origin'
        }
        console.debug("ReqInit de tentative 1", reqInit1);

        let response = await fetch(endpoint, reqInit1);

        if (requiresAuth && (response.status === 401 || response.status === 403)) {
            console.warn("🔄 Token expiré, tentative de refresh...");

            try {
                await refreshAccessToken();
                token = localStorage.getItem('jwtAccessToken');
                console.debug("Nouveau Token = ", token);

                if (!token) {
                    console.error("🔴 Refresh échoué, suppression du token local.");
                    throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Echec du refresh, token expiré ou invalidé");
                }

                const retryHeaders: HeadersInit = {
                    'Authorization': `Bearer ${token}`
                };
                if (!(finalBody instanceof FormData)) {
                    retryHeaders['Content-Type'] = 'application/json';
                    retryHeaders['Accept-Encoding'] = 'gzip, deflate, br';
                }

                const reqInit2: RequestInit = {
                    method,
                    headers: retryHeaders,
                    body: finalBody,
                    credentials: 'include'
                };
                console.debug("ReqInit de tentative 2", reqInit2)
                response = await fetch(endpoint, reqInit2);

            } catch (err) {
                console.error("🔴 Echec du refreshToken :", err);
                throw err;
            }
        }

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 400) {
                if (isSilentError) {
                    throw new CinephoriaError(CinephoriaErrorCode.API_ERROR_SILENT, data.message || 'Erreur inconnue');
                } else {
                    throw new CinephoriaError(CinephoriaErrorCode.API_ERROR, data.message || 'Erreur inconnue');
                }
            }
            // Gestion d'autres statuts non-OK si besoin ici
        }

        return data;
    } catch (error) {
        console.log("L'erreur passe par là");
        return handleApiError(error);  // ✅ Capture et redirige via handleApiError
    }
}


async function refreshAccessToken() {
    try {
        console.log("🔄 Tentative de refresh du token...");
        const response = await fetch(`${baseUrl}/api/login/refresh`, {
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
        const json = await response.json();
        const { accessToken } = json;
        localStorage.setItem('jwtAccessToken', accessToken);
        console.debug("Token reçu de refresh = ", accessToken)
        console.log("Nouveau accessToken obtenu via /api/refresh");
    } catch (err) {
        console.error("🔴 Erreur dans refreshAccessToken :", err);
        localStorage.removeItem('jwtAccessToken');
        throw err; // Propage l'erreur pour que apiRequest la capture
    }
}

/**
 * Login de l'utilisateur
 * @param compte 
 * @param password 
 */
export async function loginApi(compte: string, password: string) {
    const body = { compte, password };

    const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include' // IMPORTANT pour recevoir le cookie (refreshToken)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }

    // Récupérer l'accessToken
    const responseJSON = await response.json();
    const accessToken = responseJSON.accessToken;

    // Stocker l'accessToken (pas le refresh)
    localStorage.setItem('jwtAccessToken', accessToken);

    console.log("Login OK, accessToken stocké, refreshToken dans cookie HttpOnly");
}

export async function logoutApi() {
    const response = await fetch(`${baseUrl}/api/login/logout`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }
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
export async function setReservationApi(
    email: string,
    seanceId: string,
    tarifSeats: TarifForSeats, // { tarifId: numberOfSeats, ... }
    pmrSeats: number,
    seatsReserved: string
): Promise<{ statut: string; utilisateurId: string; reservationId: string }> {
    const body = { email, seanceId, tarifSeats, pmrSeats, seatsReserved };
    const endpoint = `${baseUrl}/api/reservation`;

    const responseJSON = await apiRequest<{ statut: string; utilisateurId: string; reservationId: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
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
}



/**
 * Confirmation de la création de l'utilisateur
 * @param id 
 * @param password 
 * @param displayName 
 * @returns Message de reussite ou d'erreur
 */
export async function confirmUtilisateurApi(
    id: string,
    password: string,
    displayName: string
): Promise<{ statut: string }> {
    const body = { id, password, displayName };
    const endpoint = `${baseUrl}/api/utilisateur/confirmUtilisateur`;

    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );

    console.log("Message retour", responseJSON);
    return responseJSON;
}


/**
 * Validation de l'email
 * @param email 
 * @param codeConfirm 
 * @returns 
 */
export async function confirmCompteApi(email: string, codeConfirm: string): Promise<{ statut: string }> {
    const body = { email, codeConfirm };
    const endpoint = `${baseUrl}/api/utilisateur/confirmCompte`;

    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );

    console.log("Message retour", responseJSON);
    return responseJSON;
}

/**
 * Fonction de confirmation de la reservation
 * api securisée
 * @param reservationId 
 * @param utilisateurId 
 * @param seanceId 
 * @returns 
 */
export async function confirmReserveApi(
    reservationId: string,
    utilisateurId: string,
    seanceId: string
) {
    return apiRequest(`${baseUrl}/api/reservation/confirm`, 'POST', {
        reservationId,
        utilisateurId,
        seanceId,
    });
}

/**
 * Fonction de modification de l'état de la reservation
 * api securisée
 * @param reservationId 
 * @param stateReservation
 * @returns 
 */
export async function setStateReservationApi(
    reservationId: string,
    stateReservation: ReservationState
): Promise<boolean> {
    return apiRequest<boolean>(`${baseUrl}/api/reservation/setstate`, 'POST', {
        reservationId,
        stateReservation
    });
}

/**
 * Fonction de modification de l'évaluation de la reservation
 * api securisée
 * @param reservationId 
 * @param stateReservation
 * @returns 
 */
export async function setEvaluationReservationApi(
    reservationId: string,
    note: number,
    evaluation: string,
    p_isEvaluationMustBeReview: boolean
): Promise<boolean> {
    const isEvaluationMustBeReview = p_isEvaluationMustBeReview ? "true" : "false";
    return apiRequest<boolean>(`${baseUrl}/api/reservation/setevaluation`, 'POST', {
        reservationId,
        note,
        evaluation,
        isEvaluationMustBeReview
    });
}


/**
 * Annulation de la reservation
 * @param reservationId 
 * @returns OK ou message d'erreur
 */
export async function cancelReserveApi(reservationId: string): Promise<{ statut: string }> {
    const body = { reservationId };
    const endpoint = `${baseUrl}/api/reservation/cancel`;

    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );

    console.log("Message retour", responseJSON);
    return responseJSON;
}


/**
 * Récupération du profil de l'utilisateur
 * @param identUtilisateur 
 * @returns ComptePersonne
 */
export async function profilApi(identUtilisateur: string): Promise<ComptePersonne[]> {
    const endpoint = `${baseUrl}/api/utilisateur/${identUtilisateur}`;

    // Appel de apiRequest pour gérer l'authentification et les erreurs
    const rawData = await apiRequest<ComptePersonne[]>(endpoint, 'GET', null, false);

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de ComptePersonne
    return rawData.map((d) => new ComptePersonne(d));
}




/**
 * Récupération des données d'une reservation
 * @param reservationId 
 * @returns 
 */
export async function getReservationApi(reservationId: string): Promise<ReservationForUtilisateur[]> {
    const endpoint = `${baseUrl}/api/reservation/id/${reservationId}`;

    const rawData = await apiRequest<any[]>(endpoint, 'GET', undefined, false); // Pas d'authentification requise

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de ReservationForUtilisateur
    const reservations = rawData.map((d) => new ReservationForUtilisateur(d));
    console.log("reservations = ", reservations);

    return reservations;
}

/**
 * Récupération des places réservées pour une séance
 * @param seanceID 
 * @returns Liste des sieges reservé constitué dans une chaine avec numero de siege separe par une ","
 */
export async function getSeatsBookedApi(seanceId: string): Promise<{ siegesReserves: string }> {
    const endpoint = `${baseUrl}/api/seances/seats/${seanceId}`;

    const seatsBooked = await apiRequest<{ siegesReserves: string }>(endpoint, 'GET', undefined, false); // Pas d'authentification requise
    console.log("Liste des sieges = ", seatsBooked);

    return seatsBooked;
}

/**
 * Récupération d'une seance
 * @param seanceID 
 * @returns unn tableau de seances avec une seule séance
 */

export async function getSeancesByIdApi(uuids: string[]): Promise<Seance[]> {

    const endpoint = `${baseUrl}/api/seances/seances?ids=${uuids}`;

    const seances = await apiRequest<Seance[]>(endpoint, 'GET', undefined, false); // Pas d'authentification requise
    console.log("Liste des séances = ", seances);

    return seances;
}



/**
 * Récupérer les places d'une reservation provisoire, api publique
 * @param reservationId 
 * @returns 
 */
export async function getPlacesReservationApi(reservationId: string): Promise<SeatsForReservation[]> {
    const endpoint = `${baseUrl}/api/reservation/seats/id/${reservationId}`;

    const rawData = await apiRequest<any[]>(endpoint, 'GET', undefined, false); // Pas d'authentification requise

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de SeatsForReservation
    const places = rawData.map((d) => new SeatsForReservation(d));
    console.log("places = ", places);

    return places;
}


export async function isLogged(): Promise<string> {
    const endpoint = `${baseUrl}/api/login/isLogged`;

    // Utilisation de apiRequest pour gérer l'authentification et les erreurs
    return await apiRequest<string>(endpoint, 'GET', undefined);
}



export async function getReservationForUtilisateur(utilisateurId: string): Promise<ReservationForUtilisateur[]> {
    const endpoint = `${baseUrl}/api/reservation/${utilisateurId}`;

    // Utilisation de apiRequest pour gérer l'authentification et les erreurs
    const rawData = await apiRequest<any[]>(endpoint, 'GET', null);

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de ReservationForUtilisateur
    return rawData.map((r) => new ReservationForUtilisateur(r));
}



export async function sendMailApi(mail: Mail): Promise<{ statut: string }> {
    const body = { mailInput: mail };
    console.log(body);
    const endpoint = `${baseUrl}/api/mail/sendmailcontact`;
    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );
    console.log("Message retour", responseJSON);
    return responseJSON;

}

export async function getReservationQRCodeApi(reservationId: string): Promise<HTMLImageElement> {
    const endpoint = `${baseUrl}/api/reservation/qrcodeimage/${reservationId}`;

    type QRCodeResponse = {
        qrCodeFile: number[];
        contentType: string;
    };

    const response = await apiRequest<QRCodeResponse>(endpoint, 'GET', undefined, true);

    const byteArray = new Uint8Array(response.qrCodeFile);
    const base64String = btoa(String.fromCharCode(...byteArray));

    const imgElement = document.createElement('img');
    imgElement.src = `data:${response.contentType};base64,${base64String}`;
    imgElement.alt = 'QR Code';

    document.body.appendChild(imgElement);

    return imgElement;
}


export async function askResetPwdApi(email: string): Promise<void> {
    const endpoint = `${baseUrl}/api/utilisateur/askresetpwd`;
    const body = { email: email };
    console.log(body);
    const responseJSON = await apiRequest<void>(
        endpoint,
        'POST',
        body,
        false, // Pas d'authentification requise
        true   // Erreur silencieuse
    );
    console.log("Message retour", responseJSON);
    return responseJSON;
}

export async function resetPwdApi(email: string, codeConfirm: string, newPassword: string): Promise<void> {
    const endpoint = `${baseUrl}/api/utilisateur/resetpwd`;
    const body = { email: email, codeConfirm: codeConfirm, newPassword: newPassword };
    console.log(body);
    const responseJSON = await apiRequest<void>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );
    console.log("Message retour", responseJSON);
    return responseJSON;
}

/**
 * Création d’un nouveau film (POST /api/films)
 * @param film Les informations du film à créer
 * @returns { message, id } où 'id' est l'identifiant du film créé
 */
export async function filmsCreateApi(film: Film): Promise<{ message: string; id: string }> {
    const endpoint = `${baseUrl}/api/films`;
    // Requête authentifiée
    const responseJSON = await apiRequest<{ message: string; id: string }>(
        endpoint,
        'POST',
        film,
        true
    );
    return responseJSON;
}

/**
 * Récupération d’un film par son ID (GET /api/films/:id)
 * @param filmId L'identifiant du film
 * @returns L’objet Film correspondant
 */
export async function filmsSelectApi(filmId: string): Promise<Film> {
    const endpoint = `${baseUrl}/api/films/${filmId}`;
    const responseJSON = await apiRequest<Film>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Mise à jour d’un film (PUT /api/films/:id)
 * @param filmId L'identifiant du film à mettre à jour
 * @param film Les nouvelles informations du film
 * @returns { message } si la mise à jour est réussie
 */
export async function filmsUpdateApi(filmId: string, film: Film): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/films/${filmId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'PUT',
        film,
        true
    );
    return responseJSON;
}

/**
 * Suppression d’un film (DELETE /api/films/:id)
 * @param filmId L'identifiant du film à supprimer
 * @returns { message } si la suppression est réussie
 */
export async function filmsDeleteApi(filmId: string): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/films/${filmId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'DELETE',
        undefined,
        true
    );
    return responseJSON;
}

/**
* Récupération de tous les films (GET /api/films)
* @returns Un tableau de Film
*/
export async function filmsSelectAllApi(): Promise<Film[]> {
    const endpoint = `${baseUrl}/api/films`;
    // Requête authentifiée
    const responseJSON = await apiRequest<Film[]>(
        endpoint,
        'GET',
        undefined,
        false
    );
    return responseJSON;
}

/**
 * Création d'une affiche (CREATE)
 */
export async function createAfficheApi(
    filmId: string,
    imageFile: File,
    resolution: number,
    contentType: string
) {
    const formData = new FormData();
    formData.append('filmId', filmId);
    formData.append('imageFile', imageFile);
    formData.append('resolution', resolution.toString());
    formData.append('contentType', contentType);

    return apiRequest(
        `${baseUrl}/api/films/affiche`,
        'POST',
        formData,
        false // Pas d'authentification requise
    );
}

/**
 * Récupération d'une affiche par filmId (READ)
 */
export async function getAfficheApi(filmId: string) {
    return apiRequest(
        `${baseUrl}/api/films/affiche/${filmId}`,
        'GET',
        undefined,
        false // Pas d'authentification requise
    );
}

/**
 * Récupération de toutes les affiches (READ)
 */
export async function getAllAffichesApi() {
    return apiRequest(
        `${baseUrl}/api/films/affiche`,
        'GET',
        undefined,
        false // Pas d'authentification requise
    );
}

/**
 * Mise à jour d'une affiche (UPDATE)
 */
export async function updateAfficheApi(
    filmId: string,
    imageFile?: File,
    resolution?: number,
    contentType?: string
) {
    const formData = new FormData();
    if (imageFile) formData.append('imageFile', imageFile);
    if (resolution) formData.append('resolution', resolution.toString());
    if (contentType) formData.append('contentType', contentType);

    return apiRequest(
        `${baseUrl}/api/films/affiche/${filmId}`,
        'PUT',
        formData,
        false // Pas d'authentification requise
    );
}

/**
 * Suppression d'une affiche (DELETE)
 */
export async function deleteAfficheApi(filmId: string) {
    return apiRequest(
        `${baseUrl}/api/films/affiche/${filmId}`,
        'DELETE',
        undefined,
        false // Pas d'authentification requise
    );
}



/**
 * Création d’un nouveau salle (POST /api/salles)
 * @param salle Les informations du salle à créer
 * @returns { message, id } où 'id' est l'identifiant du salle créé
 */
export async function sallesCreateApi(salle: Salle): Promise<{ message: string; id: string }> {
    const endpoint = `${baseUrl}/api/salles`;
    // Requête authentifiée
    const responseJSON = await apiRequest<{ message: string; id: string }>(
        endpoint,
        'POST',
        salle,
        true
    );
    return responseJSON;
}

/**
 * Récupération d’un salle par son ID (GET /api/salles/:id)
 * @param salleId L'identifiant du salle
 * @returns L’objet Salle correspondant
 */
export async function sallesSelectApi(salleId: string): Promise<Salle> {
    const endpoint = `${baseUrl}/api/salles/${salleId}`;
    const responseJSON = await apiRequest<Salle>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Récupération des salles d'un cinema (GET /api/salles/cinema/:cinema)
 * @param cinema Le nom du cinema
 * @returns un tableau de salles
 */
export async function sallesSelectCinemaApi(nameCinema: string): Promise<Salle[]> {
    const endpoint = `${baseUrl}/api/salles/cinema/${nameCinema}`;
    const responseJSON = await apiRequest<Salle[]>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Mise à jour d’un salle (PUT /api/salles/:id)
 * @param salleId L'identifiant du salle à mettre à jour
 * @param salle Les nouvelles informations du salle
 * @returns { message } si la mise à jour est réussie
 */
export async function sallesUpdateApi(salleId: string, salle: Salle): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/salles/${salleId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'PUT',
        salle,
        true
    );
    return responseJSON;
}

/**
 * Suppression d’un salle (DELETE /api/salles/:id)
 * @param salleId L'identifiant du salle à supprimer
 * @returns { message } si la suppression est réussie
 */
export async function sallesDeleteApi(salleId: string): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/salles/${salleId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'DELETE',
        undefined,
        true
    );
    return responseJSON;
}

/**
* Récupération de tous les salles (GET /api/salles)
* @returns Un tableau de Salle
*/
export async function sallesSelectAllApi(): Promise<Salle[]> {
    const endpoint = `${baseUrl}/api/salles`;
    // Requête authentifiée
    const responseJSON = await apiRequest<Salle[]>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Création d’un nouveau seanceseule (POST /api/seancesseules)
 * @param seanceseule Les informations du seanceseule à créer
 * @returns { message, id } où 'id' est l'identifiant du seanceseule créé
 */
export async function seancesseulesCreateApi(seanceseule: SeanceSeule): Promise<{ message: string; id: string }> {
    const endpoint = `${baseUrl}/api/seancesseules`;
    // Requête authentifiée
    const responseJSON = await apiRequest<{ message: string; id: string }>(
        endpoint,
        'POST',
        seanceseule,
        true
    );
    return responseJSON;
}

/**
 * Récupération d’un seanceseule par son ID (GET /api/seancesseules/:id)
 * @param seanceseuleId L'identifiant du seanceseule
 * @returns L’objet SeanceSeule correspondant
 */
export async function seancesseulesSelectApi(seanceseuleId: string): Promise<SeanceSeule> {
    const endpoint = `${baseUrl}/api/seancesseules/${seanceseuleId}`;
    const responseJSON = await apiRequest<SeanceSeule>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Mise à jour d’un seanceseule (PUT /api/seancesseules/:id)
 * @param seanceseuleId L'identifiant du seanceseule à mettre à jour
 * @param seanceseule Les nouvelles informations du seanceseule
 * @returns { message } si la mise à jour est réussie
 */
export async function seancesseulesUpdateApi(seanceseuleId: string, seanceseule: SeanceSeule): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/seancesseules/${seanceseuleId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'PUT',
        seanceseule,
        true
    );
    return responseJSON;
}

/**
 * Suppression d’un seanceseule (DELETE /api/seancesseules/:id)
 * @param seanceseuleId L'identifiant du seanceseule à supprimer
 * @returns { message } si la suppression est réussie
 */
export async function seancesseulesDeleteApi(seanceseuleId: string): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/seancesseules/${seanceseuleId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'DELETE',
        undefined,
        true
    );
    return responseJSON;
}

/**
* Récupération de tous les seancesseules (GET /api/seancesseules)
* @returns Un tableau de SeanceSeule
*/
export async function seancesseulesSelectAllApi(): Promise<SeanceSeule[]> {
    const endpoint = `${baseUrl}/api/seancesseules`;
    // Requête authentifiée
    const responseJSON = await apiRequest<SeanceSeule[]>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
* Récupération de tous les seancesdisplay en fonction d'une liste de cinema 
* (GET /api/seances/display/filter?)
* ${baseUrl}/api/seances/display/filter?cinemasList="Paris"
* @returns Un tableau de SeanceSeule
*/
export async function seancesDisplayByCinemaApi(cinemas: string[]): Promise<SeanceDisplay[]> {
    const filter = cinemas.map(s => `"${s}"`).join(',');
    const endpoint = `${baseUrl}/api/seances/display/filter?cinemasList=${filter}`;
    // Requête authentifiée
    const responseJSON = await apiRequest<SeanceDisplay[]>(
        endpoint,
        'GET',
        undefined,
        false
    );
    return responseJSON;
}

/**
* Récupération de toutes les reservations en fonction d'une liste de cinema 
* (GET /api/reservation/cinema/filter?)
* ${baseUrl}/api/reservation/cinema/filter?cinemasList="Paris"
* @returns Un tableau de ReservationForUtilisateur
*/
export async function reservationsByCinemaApi(cinemas: string[]): Promise<ReservationForUtilisateur[]> {
    const filter = cinemas.map(s => `"${s}"`).join(',');
    const endpoint = `${baseUrl}/api/reservation/cinema/filter?cinemasList=${filter}`;
    // Requête authentifiée
    const responseJSON = await apiRequest<ReservationForUtilisateur[]>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}


/**
 * Mise à jour d’un avis (PUT /api/reservation/avis/:reservationid)
 * @param reservationid L'identifiant de la reservetion à mettre à jour
 * @param reservationAvis Les nouvelles informations de la reservation
 * @returns { message } si la mise à jour est réussie
 */
export async function reservationAvisUpdateApi(reservationId: string, reservationAvis: ReservationAvis): Promise<{ message: string }> {
    console.log(JSON.stringify(reservationAvis));
    const endpoint = `${baseUrl}/api/reservation/avis/${reservationId}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'PUT',
        reservationAvis,
        true
    );
    return responseJSON;
}

/**
* Récupération de tous les employes (GET api/utilisateur/getemployes)
* @returns Un tableau d'employes
*/
export async function employesSelectAllApi(): Promise<ComptePersonne[]> {
    const endpoint = `${baseUrl}/api/utilisateur/getemployes`;
    // Requête authentifiée
    const responseJSON = await apiRequest<ComptePersonne[]>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Récupération d’un employe par son ID (GET /api/utilisateur/employe/:matricule)
 * @param matricule le matricule de l'agent
 * @returns L’objet ComptePersonne correspondant
 */
export async function getEmployeByMatriculeApi(matricule: number): Promise<ComptePersonne> {
    const endpoint = `${baseUrl}/api/utilisateur/getemploye/${matricule}`;
    const responseJSON = await apiRequest<ComptePersonne>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
 * Création d’un nouvel employe (POST /api/utilisateur/createEmploye)
 * @param seanceseule Les informations du seanceseule à créer
 * @returns { message, id } où 'id' est l'identifiant du seanceseule créé
 */
export async function employeCreateApi(employe: ComptePersonne, password: string = ""): Promise<{ message: string; id: string }> {
    const endpoint = `${baseUrl}/api/utilisateur/createEmploye`;
    const formData = new FormData();
    formData.append('email', employe.email);
    formData.append('password', password);

    if (employe.isAdministrateur && employe.isAdministrateur === 1) {
        formData.append('isAdministrateur', "true");
    } else {
        formData.append('isAdministrateur', "false");
    }
    formData.append('firstnameEmploye', employe.firstnameEmploye || '');
    formData.append('lastnameEmploye', employe.lastnameEmploye || '');
    formData.append('matricule', employe.matricule?.toString(10) || '');
    formData.append('listCinemas', employe.listCinemas || '');


    // Requête authentifiée
    const responseJSON = await apiRequest<{ message: string; id: string }>(
        endpoint,
        'POST',
        formData,
        true
    );
    return responseJSON;
}

/**
 * Mise à jour d’un employe (PUT /api/utilisateur/updateemploye/:matricule)
 * @param employe Les nouvelles informations employe
 * @returns { message } si la mise à jour est réussie
 */
export async function employeUpdateApi(employe: ComptePersonne, password: string): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/utilisateur/updateemploye`;

    const formData = new FormData();
    formData.append('email', employe.email);
    formData.append('password', password);

    if (employe.isAdministrateur && employe.isAdministrateur === 1) {
        formData.append('isAdministrateur', "true");
    } else {
        formData.append('isAdministrateur', "false");
    }
    formData.append('firstnameEmploye', employe.firstnameEmploye || '');
    formData.append('lastnameEmploye', employe.lastnameEmploye || '');
    formData.append('matricule', employe.matricule?.toString(10) || '');
    formData.append('listCinemas', employe.listCinemas || '');

    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'PUT',
        formData,
        true
    );
    return responseJSON;
}

employeDeleteApi

/**
 * Suppression d’un employe qui ne s'est jamais connecte (DELETE /api/utilisateur/deleteemploye/:matricule)
 * @param matricule L'identifiant du salle à supprimer
 * @returns { message } si la suppression est réussie
 */
export async function employeDeleteApi(matricule: number): Promise<{ message: string }> {
    const endpoint = `${baseUrl}/api/utilisateur/deleteemploye/${matricule}`;
    const responseJSON = await apiRequest<{ message: string }>(
        endpoint,
        'DELETE',
        undefined,
        true
    );
    return responseJSON;
}

/**
* Récupération de toutes les stats de réservation (GET api/reservation/getreservationstats)
* @returns Un tableau d'employes
*/
export async function getReservationStatsApi(): Promise<ReservationStats[]> {
    const endpoint = `${baseUrl}/api/reservation/getreservationstats`;
    // Requête authentifiée
    const responseJSON = await apiRequest<ReservationStats[]>(
        endpoint,
        'GET',
        undefined,
        true
    );
    return responseJSON;
}

/**
* Récupération de du numero de version
* @returns un ( { majeure: number, mineure: number, build: number } )
*/
export async function getVersionApi(): Promise<MajSite> {
    const endpoint = `${baseUrl}/api/login/version`;
    // Requête authentifiée
    const responseJSON = await apiRequest<MajSite>(
        endpoint,
        'GET',
        undefined,
        false
    );
    return responseJSON;
}