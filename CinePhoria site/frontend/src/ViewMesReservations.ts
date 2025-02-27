import { userDataController } from "./DataControllerUser.js";
import { dataController } from "./DataController.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { ReservationForUtilisateur, ReservationState } from "./shared-models/Reservation.js";
import { getReservationForUtilisateur, setStateReservationApi, setEvaluationReservationApi,  isLogged } from "./NetworkController.js";

import { seanceCardView } from "./ViewReservation.js";
import { Seance } from "./shared-models/Seance.js";
import { updateTableContent } from "./ViewReservationPlaces.js";
import { logout } from "./Login.js";


export async function onLoadMesReservations() {
    console.log("=====> chargement onLoadMesReservations")

    // On verifie que l'on est connecté sinon on retourne sur la page visiteur
    try {
        // const ident = await isLogged();
        // if (ident.trim() !== userDataController.ident?.trim()) throw new Error("Jeton non confirme");
        // } catch {
        //     // On provoque un logout
        //     logout();
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
                container.innerHTML = '';
                const tableDiv = updateTableMesReservations(reservations);
                container.appendChild(tableDiv);
            }

        } catch (error) {
            console.log("Erreur recupération des reservations = ", error)
        }

    }
    catch (error) {
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
        // Acces à la seance
        const seance = dataController.allSeances.find((s) => { return s.seanceId === resa.seanceId });
        if (!seance) return;

        const tr = document.createElement('tr');

        // 1) Date => bouton pour modal détail
        const tdDate = document.createElement('td');
        const dateBtn = document.createElement('button');
        dateBtn.classList.add('tab__mesreservations-liste-button');
        dateBtn.textContent = formatDateDDMMYYYY(new Date(resa.dateJour || ''));
        dateBtn.addEventListener('click', () => {
            onClickDetailReservation(resa, seance);
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

        console.log("-------" + resa.dateJour + "-" + seance.hourBeginHHSMM);
        // Statut dynamique
        let statutResa = resa.statereservation;
        if (statutResa === ReservationState.ReserveConfirmed) {
            // ACtualisation du statut de la réservation si l'heure de la reservation est dans le passé

            const dateVar = new Date(resa.dateJour!);
            if (!dateVar) return;


            // Variable heure : "HH:MM"
            // const heureVar = seance.hourBeginHHSMM || "00:00";
            const heureVar = "08:00";

            // Convertir heureVar en nombre
            const [hh, mm] = heureVar.split(':').map(Number);


            // Créer une date en combinant dateVar (année/mois/jour) avec l'heureVar (HH:MM)
            const dateHeureLimite = new Date(dateVar.getFullYear(), dateVar.getMonth(), dateVar.getDate(), hh, mm);
            // console.log(resa.reservationId + "-" + seance.seanceId);
            // console.log("Date jour " + dateVar + " HeureMn " + seance.hourBeginHHSMM)
            // console.log("Date Heure de la seance = " + dateHeureLimite);
            // console.log("Date maintenat = " + new Date());

            // Vérifier si la date actuelle est avant ou après la date et heure de la séance
            if ((new Date()) > dateHeureLimite) {
                // La reservation est passée
                statutResa = ReservationState.DoneUnevaluated;
                // Mise a jour en asynchrone
                setStateReservationApi(resa.reservationId, ReservationState.DoneUnevaluated );

            }
        }
        // 4) & 5) => Selon l’état
        if (statutResa === ReservationState.ReserveConfirmed) {

            // Fusion de 2 colonnes
            const tdFused = document.createElement('td');
            tdFused.setAttribute('colspan', '2');
            tdFused.style.backgroundColor = '#fff7dc'; // léger jaune
            tdFused.textContent = 'Vous pourrez apporter une note et un avis après avoir vu le film';
            tr.appendChild(tdFused);
        } else if (statutResa === ReservationState.DoneUnevaluated) {
            // Fused => bouton "Donnez nous votre avis"
            const tdFused = document.createElement('td');
            tdFused.setAttribute('colspan', '2');
            const btnAvis = document.createElement('button');
            btnAvis.textContent = 'Donnez nous votre avis sur ce film ✎'; // icone Unicode
            btnAvis.classList.add('tab__mesreservations-liste-button');
            btnAvis.addEventListener('click', () => {
                onClickEvaluationReservation(resa);
            });
            tdFused.appendChild(btnAvis);
            tr.appendChild(tdFused);
        } else if (statutResa === ReservationState.DoneEvaluated) {
            // Col note
            const tdNote = document.createElement('td');
            tdNote.textContent = resa.note?.toString() || '0';
            // Clic => modifEvaluation
            tdNote.style.cursor = 'pointer';
            tdNote.addEventListener('click', () => {
                onClickEvaluationReservation(resa,true);
            });
            tr.appendChild(tdNote);

            // Col commentaire
            const tdComment = document.createElement('td');
            tdComment.textContent = resa.evaluation || '';
            tdComment.style.cursor = 'pointer';
            // Si isEvalReview => grisé + survol
            console.log("Eval = " + resa.isEvaluationMustBeReview);
            if (resa.isEvaluationMustBeReview) {
                tdComment.style.backgroundColor = '#f0f0f0';
                tdComment.title = 'Votre commentaire sera publié après relecture';
            }
            tdComment.addEventListener('click', () => {
                onClickEvaluationReservation(resa,true);
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
        btnSuppr.classList.add("button");
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

async function onClickDetailReservation(resa: ReservationForUtilisateur, seance: Seance) {
    const modalDetailLocalHTML = `
    
        <div class="modal__content-wrapper">
            <div class="modal__title">
                <div class="title__detailReservation title-h2">
                    <h2>Détail de la réservation</h2>
                </div>
                <!-- Bouton (X) ou autre mécanisme pour fermer la modale si besoin -->
                <span class="close-modal" id="close-detailReservation">×</span>
            </div>
            <div class="modal__content" id="content__DetailReservation" >
                
            </div>
        </div>`;
    // On installe la modale dans la page HTML
    const modalDetailLocal = document.getElementById('modal-detailReservation') as HTMLDivElement | null;
    if (!modalDetailLocal) return
    modalDetailLocal.innerHTML = modalDetailLocalHTML
    document.body.appendChild(modalDetailLocal);

    const closeModalBtn = document.getElementById("close-detailReservation") as HTMLButtonElement | null;
    const modalContent = document.getElementById('content__DetailReservation') as HTMLDivElement | null;

    if (modalDetailLocal && closeModalBtn && modalContent) {

        const closeModal = () => {
            modalDetailLocal.style.display = 'none';
            window.location.reload();
        };

        closeModalBtn.addEventListener('click', closeModal);
        modalDetailLocal.addEventListener('click', (event: MouseEvent) => {
            if (event.target === modalDetailLocal) closeModal();
        });


        dataController.selectedReservationUUID = resa.reservationId;
        const selectedSeance = seanceCardView(seance, new Date(resa.dateJour || ''));
        modalContent.appendChild(selectedSeance);

        const tableauPlaces = await updateTableContent(seance.qualite || '', true);
        modalContent.appendChild(tableauPlaces);

        if (resa.numberPMR && resa.numberPMR > 0) {
            const nombrePMR = document.createElement('p')
            nombrePMR.textContent = resa.numberPMR + " place" + (resa.numberPMR > 1 ? "s P.M.R." : " P.M.R.");
            modalContent.appendChild(nombrePMR);
        }

        modalDetailLocal.style.display = 'flex';

    } else {
        console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal modal-detailReservation sont introuvables.');
    }

}

function onClickEvaluationReservation(resa: ReservationForUtilisateur, isModif: boolean = false) {
    // Sélectionner la modale
    const modal = document.getElementById('modal-evaluationReservation') as HTMLDivElement | null;

    // Si c'est une modification report des valeurs précédentes
    let titreModel = "Comment avez-vous trouvé le film ?";
    let noteLabel = "Votre note : ";
    let noteValue = "Choisissez ";
    let commentaireDepart = "";
    let selectedNote: string | null = null;
    if (isModif) {
        titreModel = "Modifiez votre évaluation";
        noteLabel = "Changer la note (" + resa.note!.toString() + ") : ";
        noteValue = resa.note!.toString();
        selectedNote = resa.note!.toString();
        commentaireDepart = resa.evaluation!;
    }
    if (!modal) return;

    // HTML de la modale avec dropdown pour la note
    const modalEvaluationLocalHTML = `
    <div class="modal__content-wrapper">
        <div class="modal__title">
            <div class="title__evaluationReservation title-h2">
                <h2>${titreModel}</h2>
            </div>
            <span class="close-modal" id="close-evaluationReservation">×</span>
        </div>
        <div class="modal__content" id="content__EvaluationReservation">
            <div>
                <label for="eval-note">${noteLabel}<span style="color: red;">*</span></label>
                <div class="title__filter-dropdown">
                    <button class="title__filter-dropdown-button" id="eval-note-button">${noteValue}<span class="chevron">▼</span>
                    </button>
                    <div class="title__filter-button-drowdown-content" id="eval-note-dropdown">
                        ${[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
                            .map(n => `<a href="#" data-value="${n}">${n}</a>`)
                            .join('')}
                    </div>
                </div>
                <span id="eval-error" style="color: red; font-size: 0.8em; display: none;">Note obligatoire</span>
            </div>
            <label for="eval-text">Commentaire :</label>
            <textarea id="eval-text" rows="4" cols="40">${commentaireDepart}</textarea>
            <div class="modal__btns">
                <button id="evalAnnulerBtn" class="button">Annuler</button>
                <button id="evalEnregistrerBtn" class="button inactif" disabled>Enregistrer</button>
            </div>
        </div>
    </div>`;

    // Injecter la modale
    modal.innerHTML = modalEvaluationLocalHTML;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Sélection des éléments
    const closeModalBtn = document.getElementById("close-evaluationReservation") as HTMLButtonElement | null;
    const noteButton = document.getElementById("eval-note-button") as HTMLButtonElement | null;
    const noteDropdown = document.getElementById("eval-note-dropdown") as HTMLDivElement | null;
    const textInput = document.getElementById('eval-text') as HTMLTextAreaElement | null;
    const errorMessage = document.getElementById('eval-error') as HTMLSpanElement | null;
    const enregistrerBtn = document.getElementById('evalEnregistrerBtn') as HTMLButtonElement | null;
    const annulerBtn = document.getElementById('evalAnnulerBtn') as HTMLButtonElement | null;

    // Fonction pour fermer la modale
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Ouvrir/fermer le dropdown
    noteButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        noteDropdown!.classList.toggle('show');
    });

    // Activation du bouton "Enregistrer"
    if (isModif) {
        errorMessage!.style.display = 'none';
        enregistrerBtn!.classList.remove('inactif');
        enregistrerBtn!.disabled = false;
    }

    // Sélectionner une note dans le dropdown
    noteDropdown?.querySelectorAll('a').forEach((option) => {
        option.addEventListener('click', (event) => {
            event.preventDefault();
            selectedNote = option.getAttribute('data-value');
            noteButton!.innerHTML = `${selectedNote} <span class="chevron">▼</span>`;
            noteDropdown!.classList.remove('show');

            // Activation du bouton "Enregistrer"
            if (selectedNote) {
                errorMessage!.style.display = 'none';
                enregistrerBtn!.classList.remove('inactif');
                enregistrerBtn!.disabled = false;
            }
        });
    });

    // Fermer le dropdown en cliquant ailleurs
    document.addEventListener('click', (event) => {
        if (!noteButton!.contains(event.target as Node)) {
            noteDropdown!.classList.remove('show');
        }
    });

    // Fermer la modale avec le bouton (X)
    closeModalBtn?.addEventListener('click', closeModal);

    // Fermer la modale en cliquant en dehors
    modal.addEventListener('click', (event: MouseEvent) => {
        if (event.target === modal) closeModal();
    });

    // Gestion du bouton "Annuler"
    annulerBtn?.addEventListener('click', closeModal);

    // Gestion du bouton "Enregistrer"
    enregistrerBtn?.addEventListener('click', async () => {
        if (!selectedNote) {
            errorMessage!.style.display = 'inline';
            return;
        }

        const commentaire = textInput!.value.trim();
        console.log("Note enregistrée :", selectedNote);
        console.log("Commentaire :", commentaire);
        await setEvaluationReservationApi(resa.reservationId, parseFloat(selectedNote), commentaire, true);
        await setStateReservationApi(resa.reservationId, ReservationState.DoneEvaluated);
        closeModal();
        // On recharge.
        onLoadMesReservations();
        
    });
}

// function onClickModifEvaluationReservation(resa: ReservationForUtilisateur) {
//     // Ouvrir modal-modifEvaluationReservation
//     const modal = document.getElementById('modal-modifEvaluationReservation');
//     if (!modal) return;
//     (document.getElementById('modif-note') as HTMLInputElement).value = resa.note?.toString() || '';
//     (document.getElementById('modif-text') as HTMLTextAreaElement).value = resa.evaluation || '';
//     modal.style.display = 'block';
// }

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

