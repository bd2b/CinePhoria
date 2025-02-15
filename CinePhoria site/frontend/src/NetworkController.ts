import { TarifForSeats } from './shared-models/Reservation';
import { isUUID, validateEmail } from './Helpers.js';
import { ComptePersonne } from './shared-models/Utilisateur.js';
import { ReservationForUtilisateur, SeatsForReservation } from './shared-models/Reservation.js';

/**
 * Fonction générique de gestion de l'API qui gère
 * - L’authentification avec JWT
 * - La gestion automatique du refresh token en cas d’expiration
 */
async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any, requiresAuth: boolean = true): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        const token = localStorage.getItem('jwtAccessToken');
        if (!token) {
            throw new Error('Authentification requise mais aucun token disponible.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: requiresAuth ? 'include' : 'same-origin' // Gère les cookies si nécessaire
    });

    if (!response.ok) {
        if (requiresAuth && (response.status === 401 || response.status === 403)) {
            await refreshAccessToken(); // Rafraîchir le token en cas d'expiration
            return apiRequest<T>(endpoint, method, body, requiresAuth); // Retenter la requête avec le nouveau token
        }
        const errData = await response.json();
        throw new Error(errData.message || 'Erreur inconnue');
    }

    return response.json();
}


async function refreshAccessToken() {
    const response = await fetch('http://localhost:3500/api/refresh', {
        method: 'POST',
        // on peut mettre credentials: 'include' si le refresh nécessite le cookie
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Echec du refresh, token expiré ou invalidé');
    }
    const json = await response.json();
    const { accessToken } = json;
    localStorage.setItem('jwtAccessToken', accessToken);
    console.log("Nouveau accessToken obtenu via /api/refresh");
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
    pmrSeats: number
): Promise<{ statut: string; utilisateurId: string; reservationId: string }> {
    const body = { email, seanceId, tarifSeats, pmrSeats };
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

export async function getReservationForUtilisateur2(utilisateurId: string): Promise<ReservationForUtilisateur[]> {
    const token = localStorage.getItem('jwtAccessToken');
    const response = await fetch(`http://localhost:3500/api/reservation/${utilisateurId}`, {
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
    // Convertir les données brutes en instances de Seance
    const reservationForUtilisateur = rawData.map((r: any) => new ReservationForUtilisateur(r));
    console.log("Reservation pour un utilisateur = ", reservationForUtilisateur)
    return reservationForUtilisateur;
}





