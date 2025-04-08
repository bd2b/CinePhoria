import { ReservationState, TarifForSeats } from './shared-models/Reservation';
import { isUUID, validateEmail } from './Helpers.js';
import { ComptePersonne } from './shared-models/Utilisateur.js';
import { ReservationForUtilisateur, SeatsForReservation } from './shared-models/Reservation.js';
import { userDataController } from './DataControllerUser.js';
import { handleApiError } from './Global.js';
import { CinephoriaErrorCode, CinephoriaError } from "./shared-models/Error.js";
import { Mail } from './shared-models/Mail.js';
import { Seance } from './shared-models/Seance.js';
import { Film } from './shared-models/Film.js';


/**
 * Fonction générique de gestion de l'API qui gère
 * - L’authentification avec JWT
 * - La gestion automatique du refresh token en cas d’expiration
 */
async function apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    requiresAuth: boolean = true
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
        }

        if (requiresAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let response = await fetch(endpoint, {
            method,
            headers,
            body: finalBody,
            credentials: requiresAuth ? 'include' : 'same-origin'
        });

        if (requiresAuth && (response.status === 401 || response.status === 403)) {
            console.warn("🔄 Token expiré, tentative de refresh...");

            try {
                await refreshAccessToken();
                token = localStorage.getItem('jwtAccessToken');

                if (!token) {
                    console.error("🔴 Refresh échoué, suppression du token local.");
                    throw new CinephoriaError(CinephoriaErrorCode.TOKEN_REFRESH_FAIL, "Echec du refresh, token expiré ou invalidé");
                }

                // 🔄 Re-tenter la requête avec le nouveau token
                response = await fetch(endpoint, {
                    method,
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${token}`
                    },
                    body: finalBody,
                    credentials: 'include'
                });

            } catch (err) {
                console.error("🔴 Echec du refreshToken :", err);
                throw err;
            }
        }

        if (!response.ok) {
            const errData = await response.json();
            throw new CinephoriaError(CinephoriaErrorCode.API_ERROR, errData.message || 'Erreur inconnue');
        }

        return response.json();

    } catch (error) {
        return handleApiError(error);  // ✅ Capture et redirige via handleApiError
    }
}


async function refreshAccessToken() {
    try {
        console.log("🔄 Tentative de refresh du token...");
        const response = await fetch('http://localhost:3500/api/refresh', {
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

    const response = await fetch('http://localhost:3500/api/login', {
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
    const response = await fetch('http://localhost:3500/api/login/logout', {
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
    const endpoint = 'http://localhost:3500/api/reservation';

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

export async function setReservationApi2(
    email: string,
    seanceId: string,
    tarifSeats: TarifForSeats, // { tarifId: numberOfSeats, ... }
    pmrSeats: number
): Promise<{ statut: string; utilisateurId: string; reservationId: string }> {
    const body = { email, seanceId, tarifSeats, pmrSeats };
    const response = await fetch('http://localhost:3500/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }

    // Réponse OK -> { statut, utilisateurId, reservationId }
    const responseJSON = await response.json();
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
    const endpoint = 'http://localhost:3500/api/utilisateur/confirmUtilisateur';

    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );

    console.log("Message retour", responseJSON);
    return responseJSON;
}


export async function confirmUtilisateurApi2(id: string, password: string, displayName: string): Promise<{ statut: string }> {
    const body = { id, password, displayName };
    const response = await fetch('http://localhost:3500/api/utilisateur/confirmUtilisateur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }

    // Examen de la reponse
    const responseJSON = await response.json();
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
    const endpoint = 'http://localhost:3500/api/utilisateur/confirmCompte';

    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );

    console.log("Message retour", responseJSON);
    return responseJSON;
}

export async function confirmCompteApi2(email: string, codeConfirm: string) {
    const body = { email, codeConfirm };
    const response = await fetch('http://localhost:3500/api/utilisateur/confirmCompte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }

    // Examen de la reponse
    const responseJSON = await response.json();
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
    return apiRequest('http://localhost:3500/api/reservation/confirm', 'POST', {
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
    return apiRequest<boolean>('http://localhost:3500/api/reservation/setstate', 'POST', {
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
    return apiRequest<boolean>('http://localhost:3500/api/reservation/setevaluation', 'POST', {
        reservationId,
        note,
        evaluation,
        isEvaluationMustBeReview
    });
}


// TODO: mettre en place les deux jetons (nécessite SSL)
export async function confirmReserveApi2(reservationId: string, utilisateurId: string, seanceId: string) {
    const body = { reservationId, utilisateurId, seanceId };
    let token = localStorage.getItem('jwtAccessToken');
    if (!token) {
        throw new Error('Vous devez être connecté');
    }

    // Tenter la requête
    let response = await fetch('http://localhost:3500/api/reservation/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
        credentials: 'include' // inclure les cookies => envoie le refreshToken
    });

    if (response.ok) {
        const data = await response.json();
        return data; // OK direct
    }

    // Sinon, si 401 ou 403 => peut-être token expiré => tenter refresh
    if (response.status === 401 || response.status === 403) {
        try {
            await refreshAccessToken();
            // Récupérer le nouveau token
            token = localStorage.getItem('jwtAccessToken');
            if (!token) {
                throw new Error('refreshAccessToken a échoué');
            }

            // Re-tenter la requête
            response = await fetch('http://localhost:3500/api/reservation/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
                credentials: 'include'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Erreur inconnue après refresh');
            }

            const data2 = await response.json();
            return data2;

        } catch (err) {
            throw new Error(`Echec du refresh token : ${err}`);
        }
    } else {
        // Autre erreur
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }
}


/**
 * Annulation de la reservation
 * @param reservationId 
 * @returns OK ou message d'erreur
 */
export async function cancelReserveApi(reservationId: string): Promise<{ statut: string }> {
    const body = { reservationId };
    const endpoint = 'http://localhost:3500/api/reservation/cancel';

    const responseJSON = await apiRequest<{ statut: string }>(
        endpoint,
        'POST',
        body,
        false // Pas d'authentification requise
    );

    console.log("Message retour", responseJSON);
    return responseJSON;
}

export async function cancelReserveApi2(reservationId: string) {
    const body = { reservationId };

    const response = await fetch(`http://localhost:3500/api/reservation/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }

    // Examen de la reponse
    const responseJSON = await response.json();
    console.log("Message retour", responseJSON);
    return responseJSON;
}
/**
 * Récupération du profil de l'utilisateur
 * @param identUtilisateur 
 * @returns ComptePersonne
 */
export async function profilApi(identUtilisateur: string): Promise<ComptePersonne[]> {
    const endpoint = `http://localhost:3500/api/utilisateur/${identUtilisateur}`;

    // Appel de apiRequest pour gérer l'authentification et les erreurs
    const rawData = await apiRequest<any[]>(endpoint, 'GET', null);

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de ComptePersonne
    return rawData.map((d) => new ComptePersonne(d));
}

export async function profilApi2(identUtilisateur: string): Promise<ComptePersonne[]> {
    const token = localStorage.getItem('jwtAccessToken');
    const response = await fetch(`http://localhost:3500/api/utilisateur/${identUtilisateur}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }
    // Convertir les données brutes en instances de Compte Personne
    const comptesUtilisateur = rawData.map((d: any) => new ComptePersonne(d));
    console.log("compte = ", comptesUtilisateur)
    return comptesUtilisateur;
}


/**
 * Récupération des données d'une reservation
 * @param reservationId 
 * @returns 
 */
export async function getReservationApi(reservationId: string): Promise<ReservationForUtilisateur[]> {
    const endpoint = `http://localhost:3500/api/reservation/id/${reservationId}`;

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
    const endpoint = `http://localhost:3500/api/seances/seats/${seanceId}`;

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

    const endpoint = `http://localhost:3500/api/seances/seances?ids=${uuids}`;

    const seances = await apiRequest<Seance[]>(endpoint, 'GET', undefined, false); // Pas d'authentification requise
    console.log("Liste des séances = ", seances);

    return seances;
}

export async function getReservationApi2(reservationId: string): Promise<ReservationForUtilisateur[]> {

    const response = await fetch(`http://localhost:3500/api/reservation/id/${reservationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }
    // Convertir les données brutes en instances de Seance
    const reservations = rawData.map((d: any) => new ReservationForUtilisateur(d));
    console.log("reservations = ", reservations)
    return reservations;
}

/**
 * Récupérer les places d'une reservation provisoire, api publique
 * @param reservationId 
 * @returns 
 */
export async function getPlacesReservationApi(reservationId: string): Promise<SeatsForReservation[]> {
    const endpoint = `http://localhost:3500/api/reservation/seats/id/${reservationId}`;

    const rawData = await apiRequest<any[]>(endpoint, 'GET', undefined, false); // Pas d'authentification requise

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de SeatsForReservation
    const places = rawData.map((d) => new SeatsForReservation(d));
    console.log("places = ", places);

    return places;
}

export async function getPlacesReservationApi2(reservationId: string): Promise<SeatsForReservation[]> {

    const response = await fetch(`http://localhost:3500/api/reservation/seats/id/${reservationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }
    // Convertir les données brutes en instances de Seance
    const places = rawData.map((d: any) => new SeatsForReservation(d));
    console.log("places = ", places)
    return places;
}

export async function isLogged(): Promise<string> {
    const endpoint = `http://localhost:3500/api/login/isLogged`;

    // Utilisation de apiRequest pour gérer l'authentification et les erreurs
    return await apiRequest<string>(endpoint, 'GET', undefined);
}

export async function isLogged2(): Promise<string> {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(`http://localhost:3500/api/login/isLogged`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }
    // La réponse est le compte
    return (response as unknown) as string;
}

export async function getReservationForUtilisateur(utilisateurId: string): Promise<ReservationForUtilisateur[]> {
    const endpoint = `http://localhost:3500/api/reservation/${utilisateurId}`;

    // Utilisation de apiRequest pour gérer l'authentification et les erreurs
    const rawData = await apiRequest<any[]>(endpoint, 'GET', null);

    if (!Array.isArray(rawData)) {
        throw new Error('La réponse de l’API n’est pas un tableau.');
    }

    // Convertir les données brutes en instances de ReservationForUtilisateur
    return rawData.map((r) => new ReservationForUtilisateur(r));
}



export async function sendMailApi(mail: Mail): Promise<{ statut: string }> {
    const body = JSON.stringify({ mailInput: mail });
    console.log(body);
    const endpoint = 'http://localhost:3500/api/mail/sendmailcontact';
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
    const endpoint = `http://localhost:3500/api/reservation/qrcodeimage/${reservationId}`;

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
    const endpoint = `http://localhost:3500/api/utilisateur/askresetpwd`;
    const body = JSON.stringify({ email: email });
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

export async function resetPwdApi(email: string, codeConfirm: string, newPassword: string): Promise<void> {
    const endpoint = `http://localhost:3500/api/utilisateur/resetpwd`;
    const body = JSON.stringify({ email: email, codeConfirm: codeConfirm, newPassword: newPassword });
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
    const endpoint = 'http://localhost:3500/api/films';
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
    const endpoint = `http://localhost:3500/api/films/${filmId}`;
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
    const endpoint = `http://localhost:3500/api/films/${filmId}`;
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
    const endpoint = `http://localhost:3500/api/films/${filmId}`;
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
    const endpoint = 'http://localhost:3500/api/films';
    // Requête authentifiée
    const responseJSON = await apiRequest<Film[]>(
        endpoint,
        'GET',
        undefined,
        true
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
        'http://localhost:3500/api/films/affiche',
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
        `http://localhost:3500/api/films/affiche/${filmId}`,
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
        'http://localhost:3500/api/films/affiche',
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
        `http://localhost:3500/api/films/affiche/${filmId}`,
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
        `http://localhost:3500/api/films/affiche/${filmId}`,
        'DELETE',
        undefined,
        false // Pas d'authentification requise
    );
}