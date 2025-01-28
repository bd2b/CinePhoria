import { TarifForSeats } from './shared-models/Reservation';
import { isUUID } from './Helpers.js';

export async function reservationApi (
    email: string,
    seanceId: string,
    tarifSeats: TarifForSeats, // { tarifId: numberOfSeats, ... }
    pmrSeats: number
    ) : Promise<{ statut: string; utilisateurId: string; reservationId: string } >   {
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
        throw new Error(messageError) ;
    }
    return responseJSON;
}

export async function confirmUtilisateurApi ( id: string, password: string, displayName: string): Promise<{ statut: string } > {
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
    console.log("Message retour",responseJSON);
    return responseJSON;

}

export async function confirmCompteApi(email: string, codeConfirm: string) {
    const body = { email , codeConfirm };
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
    console.log("Message retour",responseJSON);
    return responseJSON;
}

export async function loginApi(compte: string, password: string) {
    const body = { compte , password };
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
    console.log("Message retour",responseJSON);
    return responseJSON;
}