import { TarifForSeats } from './shared-models/Reservation';
import { isUUID, validateEmail } from './Helpers.js';
import { ComptePersonne } from './shared-models/Utilisateur.js'; 
import { ReservationForUtilisateur , SeatsForReservation } from './shared-models/Reservation.js';

export async function setReservationApi(
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

export async function confirmUtilisateurApi(id: string, password: string, displayName: string): Promise<{ statut: string }> {
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

export async function confirmCompteApi(email: string, codeConfirm: string) {
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

export async function loginApi(compte: string, password: string) {
    const body = { compte, password };
    const response = await fetch('http://localhost:3500/api/login', {
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
    localStorage.setItem('jwtToken', responseJSON.token); // Stocker le token

}

export async function confirmReserveApi(reservationId: string, utilisateurId: string, seanceId: string) {
    const body = { reservationId, utilisateurId, seanceId };
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Vous devez être connecté');
        return;
    }
    const response = await fetch(`http://localhost:3500/api/reservation/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

export async function profilApi(identUtilisateur: string) : Promise <ComptePersonne[]> {
    const token = localStorage.getItem('jwtToken');
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
    // Convertir les données brutes en instances de Seance
    const comptesUtilisateur = rawData.map((d: any) => new ComptePersonne(d));
    console.log("compte = ",comptesUtilisateur)
    return comptesUtilisateur;
}

//  Récupérer une reservation provisoire, api publique
export async function getReservationApi(reservationId: string) : Promise <ReservationForUtilisateur[]> {
    
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
    console.log("reservations = ",reservations)
    return reservations;
}

//  Récupérer les places d'une reservation provisoire, api publique
export async function getPlacesReservationApi(reservationId: string) : Promise <SeatsForReservation[]> {
    
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
    console.log("places = ",places)
    return places;
}

export async function isLogged () : Promise<void> {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(`http://localhost:3500/api/login/isLogged`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
}

