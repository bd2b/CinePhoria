import { userDataController } from "./DataControllerUser.js";
import { dataController } from "./DataController.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { ReservationForUtilisateur, ReservationState } from "./shared-models/Reservation.js";
import { getReservationForUtilisateur , isLogged } from "./NetworkController.js";


export async function onLoadMesReservations() {
    console.log("=====> chargement onLoadMesReservations")

    // On verifie que l'on est connecté sinon on retourne sur la page visiteur
    // try {
    // const ident = await isLogged();
    // if (ident.trim() !== userDataController.ident?.trim()) throw new Error("Jeton non confirme");
    // } catch {
    //     // On reachemine vars la page visiteur.html
    //     window.location.href = "visiteur.html"
    // }

    // On initialise le dataController si il est vide
    if (dataController.allSeances.length === 0) await dataController.init()

    // On charge menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites() // Footer

    // On verifie qu'on est bien connecté avec un utilisateur
    let utilisateurId: string;
    if (!userDataController.compte()?.utilisateurid) {
        console.error("Pas d'utilisateur connu");
        return;
    } else {
        utilisateurId = userDataController.compte()?.utilisateurid || '';
    }
    // On recupere les reservations de l'utilisateur
    try {
        // On charge les reservations de cet utilisateur
        const reservations = await getReservationForUtilisateur(utilisateurId);

        // On rend le tableau dans la page HTML
        const container = document.getElementById('mesreservations-table-container');
        if (container) {
            const tableDiv = updateTableMesReservations(reservations);
            container.appendChild(tableDiv);
        }

    } catch (error) {
        console.log("Erreur recupération des reservations = ", error)
    }

}

export function updateTableMesReservations(reservations: ReservationForUtilisateur[]): HTMLDivElement {
    // Container global
    const container = document.createElement('div');
    container.classList.add('tab__mesreservations-liste');

    // Table
    const table = document.createElement('table');
    table.classList.add('tab__mesreservations-liste-table');

    // THEAD
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const cols = ['Date', 'Film', 'Complexe', 'Note', 'Vos Commentaires', 'Places', 'Montant', ''];
    cols.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // TBODY
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Pour chaque reservation
    reservations.forEach((resa) => {
        const tr = document.createElement('tr');

        // 1) Date => bouton pour modal détail
        const tdDate = document.createElement('td');
        const dateBtn = document.createElement('button');
        dateBtn.classList.add('tab__mesreservations-liste-button');
        dateBtn.textContent = formatDateDDMMYYYY(new Date(resa.dateJour || ''));
        dateBtn.addEventListener('click', () => {
            onClickDetailReservation(resa);
        });
        tdDate.appendChild(dateBtn);
        tr.appendChild(tdDate);

        // 2) Film
        const tdFilm = document.createElement('td');
        tdFilm.textContent = resa.titleFilm || '';
        tr.appendChild(tdFilm);

        // 3) Complexe
        const tdComplexe = document.createElement('td');
        tdComplexe.textContent = resa.nameCinema || '';
        tr.appendChild(tdComplexe);

        // 4) & 5) => Selon l’état
        if (resa.statereservation === ReservationState.ReserveConfirmed) {
            // Fusion de 2 colonnes
            const tdFused = document.createElement('td');
            tdFused.setAttribute('colspan', '2');
            tdFused.style.backgroundColor = '#fff7dc'; // léger jaune
            tdFused.textContent = 'Vous pourrez apporter une note et un avis après avoir vu le film';
            tr.appendChild(tdFused);
        } else if (resa.statereservation === ReservationState.DoneUnevaluated) {
            // Fused => bouton "Donnez nous votre avis"
            const tdFused = document.createElement('td');
            tdFused.setAttribute('colspan', '2');
            const btnAvis = document.createElement('button');
            btnAvis.textContent = 'Donnez nous votre avis sur ce film ✎'; // icone Unicode
            btnAvis.addEventListener('click', () => {
                onClickEvaluationReservation(resa);
            });
            tdFused.appendChild(btnAvis);
            tr.appendChild(tdFused);
        } else if (resa.statereservation === ReservationState.DoneEvaluated) {
            // Col note
            const tdNote = document.createElement('td');
            tdNote.textContent = resa.note?.toString() || '0';
            // Clic => modifEvaluation
            tdNote.style.cursor = 'pointer';
            tdNote.addEventListener('click', () => {
                onClickModifEvaluationReservation(resa);
            });
            tr.appendChild(tdNote);

            // Col commentaire
            const tdComment = document.createElement('td');
            tdComment.textContent = resa.evaluation || '';
            tdComment.style.cursor = 'pointer';
            // Si isEvalReview => grisé + survol
            if (resa.isevaluationmustbereview) {
                tdComment.style.backgroundColor = '#f0f0f0';
                tdComment.title = 'Votre commentaire sera publié après relecture';
            }
            tdComment.addEventListener('click', () => {
                onClickModifEvaluationReservation(resa);
            });
            tr.appendChild(tdComment);
        } else {
            // Éventuellement, autres états => un <td colSpan="2"> vide
            const tdFused = document.createElement('td');
            tdFused.setAttribute('colspan', '2');
            tdFused.textContent = ''; // ou "Réservation annulée ?" etc.
            tr.appendChild(tdFused);
        }

        // 6) Places
        const tdPlaces = document.createElement('td');
        tdPlaces.textContent = resa.totalSeats?.toString() || '0';
        tr.appendChild(tdPlaces);

        // 7) Montant
        const tdPrice = document.createElement('td');
        const price = resa.totalPrice?.toFixed(2) || '0.00';
        tdPrice.textContent = `${price} €`;
        tr.appendChild(tdPrice);

        // 8) Col suppression
        const tdSuppr = document.createElement('td');
        const btnSuppr = document.createElement('button');
        btnSuppr.textContent = '🗑️'; // icone poubelle
        btnSuppr.addEventListener('click', () => {
            onClickSuppressionReservation(resa);
        });
        tdSuppr.appendChild(btnSuppr);
        tr.appendChild(tdSuppr);

        tbody.appendChild(tr);
    });

    container.appendChild(table);
    return container;
}

/** format date dd/mm/yyyy */
function formatDateDDMMYYYY(date?: Date): string {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

// ---------- Fonctions d'action isolées ---------- //

function onClickDetailReservation(resa: ReservationForUtilisateur) {
    // Ouvrir modal-detailReservation
    const modal = document.getElementById('modal-detailReservation');
    if (!modal) return;
    // Remplir le contenu
    const detailP = document.getElementById('detailReservationContent');
    if (detailP) {
        detailP.textContent = `Reservation ID: ${resa.reservationId}
Film: ${resa.titleFilm}
Cinéma: ${resa.nameCinema}
Places: ${resa.totalSeats}
Prix: ${resa.totalPrice} €`;
    }
    modal.style.display = 'block';
}

function onClickEvaluationReservation(resa: ReservationForUtilisateur) {
    // Ouvrir modal-evaluationReservation
    const modal = document.getElementById('modal-evaluationReservation');
    if (!modal) return;
    // reset inputs
    (document.getElementById('eval-note') as HTMLInputElement).value = '';
    (document.getElementById('eval-text') as HTMLTextAreaElement).value = '';
    modal.style.display = 'block';
}

function onClickModifEvaluationReservation(resa: ReservationForUtilisateur) {
    // Ouvrir modal-modifEvaluationReservation
    const modal = document.getElementById('modal-modifEvaluationReservation');
    if (!modal) return;
    (document.getElementById('modif-note') as HTMLInputElement).value = resa.note?.toString() || '';
    (document.getElementById('modif-text') as HTMLTextAreaElement).value = resa.evaluation || '';
    modal.style.display = 'block';
}

function onClickSuppressionReservation(resa: ReservationForUtilisateur) {
    // Ouvrir modal-suppressionReservation
    const modal = document.getElementById('modal-suppressionReservation');
    if (!modal) return;
    // Gérer le "Je confirme la suppression"
    const confirmerBtn = document.getElementById('supConfirmerBtn');
    if (confirmerBtn) {
        confirmerBtn.onclick = () => {
            alert('Suppression demandée');
            // Fermer la modal
            modal.style.display = 'none';
        };
    }
    modal.style.display = 'block';
}

