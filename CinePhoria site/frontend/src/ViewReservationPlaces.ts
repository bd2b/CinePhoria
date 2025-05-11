import { seanceCardView, basculerPanelChoix, updateContentPage } from './ViewReservation.js';
import { dataController } from './DataController.js';

import { isUUID, validateEmail , showCustomAlert } from './Helpers.js';
import { SeatsForReservation, TarifForSeats, ReservationState } from './shared-models/Reservation.js';
import { setReservationApi, confirmUtilisateurApi, confirmCompteApi, confirmReserveApi, getPlacesReservationApi, getSeatsBookedApi } from './NetworkController.js';
import { userDataController, ProfilUtilisateur } from './DataControllerUser.js';
import { login } from './Login.js';

/**
 * Fonction de niveau supérieur d'affichage du panel de choix des places
 * @returns 
 */
export async function updateContentPlace() {
    try {
        // 1) Mettre à jour le bloc .seances__cardseance seances__cardseance-selected pour afficher la séance choisie
        const containerSelectedSeance = document.getElementById('seances__cardseance-selected');
        if (!containerSelectedSeance) {
            console.log("Pas de carte selectionnée")
            return;
        }
        // On rafraichit la séance selectionne
        await dataController.updateSeances([dataController.selectedSeanceUUID!]);
        const selectedSeance = seanceCardView(dataController.seanceSelected(), dataController.selectedSeanceDate!, "seances__cardseance-selected")
        containerSelectedSeance.replaceWith(selectedSeance);
        if (dataController.reservationState === ReservationState.PendingChoiceSeance ||
            dataController.reservationState === ReservationState.PendingChoiceSeats) {
            // On n'a pas créé de reservation
            // 2) Gestion du bouton "Changer de séance" -> basculerPanelChoix()
            const btnChanger = document.querySelector('.panel__changer-button') as HTMLButtonElement;
            if (btnChanger) {
                btnChanger.removeEventListener('click', async () => { });
                btnChanger.addEventListener('click', async (evt: MouseEvent) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    dataController.reservationState = ReservationState.PendingChoiceSeance;
                    dataController.selectedSeanceUUID = undefined;

                    await dataController.sauverEtatGlobal();
                    basculerPanelChoix();
                    // On reconstruit la page pour se caler sur les dates du calendrier pour ce film
                    updateContentPage(dataController);
                });
            }
            // 3) Gestion de la table des tarifs, de la saisie du nombre PMR, de la saisie de l'email et du bouton "Je reserve pour cette seance"
            await setReservation();
        };


    } catch (error) {
        console.error("Erreur lors de l'affichage du content de selection des places : ", error);
    }

}
/**
 * Affiche le bloc de choix de places, et de renseignement de l'adresse mail
 * @returns 
 */
async function setReservation() {
    // Fonction d'affichage des sieges reserve appeler soit à la construction soit après le choix de sieges
    function displaySeatsBooked() {

        const seatsBooked = dataController.selectedListSeats || '';
        const seatsBookedDiv = document.querySelector(".commande__seats") as HTMLDivElement;
        seatsBookedDiv.style.display = 'flex';

        const listSeatsLibelle = document.getElementById("libelle__seats")
        const listSeatsSpan = document.getElementById("text__seats") as HTMLSpanElement;
        if (!listSeatsLibelle || !listSeatsSpan) return;

        if (seatsBooked === '') {
            listSeatsLibelle.textContent = "Pas de sieges précisés";
            listSeatsSpan.textContent = "";
        } else {
            const pluriel = seatsBooked.includes(",") ? "s" : "";
            listSeatsLibelle.textContent = `Siège${pluriel} réservé${pluriel} : `;
            listSeatsSpan.textContent = seatsBooked;
        }
    }


    console.log("Affichage de la reservation de place");
    dataController.reservationState = ReservationState.PendingChoiceSeats;
    const qualiteFilm = dataController.seanceSelected().qualite;
    const numMaxSeats = Math.min(parseInt(dataController.seanceSelected().capacity ?? "10", 10), 8);
    const numMaxPMR = Math.min(parseInt(dataController.seanceSelected().numPMR ?? "0", 10), 8);
    

    // Afficher le tableau de tarifs selon la qualite
    const containerTable = document.querySelector('.commande__tabtarif');
    if (!containerTable) return;
    containerTable.innerHTML = '';

    if (qualiteFilm) {
        const nodeTable = await updateTableContent(qualiteFilm, undefined , undefined, numMaxSeats ) as HTMLTableElement;
        containerTable.appendChild(nodeTable as Node);
    }

    // Afficher le champ de renseignement du nombre de place PMR et gestion des boutons + et -
    const containerPMR = document.querySelector('.commande__pmr')
    const contentPMR = updateInputPMR(numMaxPMR);

    if (!containerPMR) throw new Error("updateInputPMT");
    containerPMR.innerHTML = '';
    containerPMR.appendChild(contentPMR);


    // Gere la complétude de l'email avec un message d'erreur associé
    const emailInput = document.getElementById('commande__mail-input') as HTMLInputElement;
    const emailError = document.getElementById('commande__mail-error');
    if (!emailInput || !emailError) return;

    if (userDataController.profil() === ProfilUtilisateur.Utilisateur) {
        // Il faut utiliser l'email de l'utilisateur et desactiver le changement.
        const emailUtilisateur = userDataController.compte()?.email
        if (emailUtilisateur) {
            emailInput.value = emailUtilisateur;
            emailInput.disabled = true;
        }
        const emailInvite = document.getElementById("commande__mail-p") as HTMLParagraphElement;
        emailInvite.innerHTML = "Votre email ";
        const emailspan = document.getElementById("commande__mail-span") as HTMLSpanElement;
        emailspan.hidden = true;


    } else {
        emailInput.value = "";

        emailInput.removeEventListener('blur', () => { });
        emailInput.addEventListener('blur', () => {
            if (!validateEmail(emailInput.value)) {
                emailError.textContent = "Email invalide (exemple: utilisateur@domaine.com)";
                emailError.style.color = "red";
            } else {
                emailError.textContent = "";
            }
        });
    }



    // Gestion du bouton de choix des fauteuils
    const btnFauteuils = document.querySelector('.panel__choisirSeats-button') as HTMLButtonElement;
    // Le bouton est initialement desactivé
    btnFauteuils.classList.add("inactif");
    btnFauteuils.disabled = true;
    if (!btnFauteuils) return;
    dataController.selectedListSeats = undefined;


    // Gestion du bouton de reservation
    const btnReserve = document.querySelector('.panel__jereserve-button') as HTMLButtonElement;
    // Le bouton est initialement desactivé
    btnReserve.classList.add("inactif");
    btnReserve.disabled = true;
    btnReserve.textContent = "Je choisis ces places";
    if (!btnReserve) return;

    // Recuperer le nombre total de place
    const totalPlaces = document.getElementById('content-totalprice');
    if (!totalPlaces) return


    /**
    * Valide l'ensemble du formulaire et active/désactive le bouton de reservation de places.
    */
    function validateForm(): void {
        // Verification que l'email est conforme
        const emailValid = validateEmail(emailInput.value);

        // Verification que l'on commande au moins une place
        const commandeMinValid = parseInt(totalPlaces?.textContent || '0', 10) > 0;

        // Activation/désactivation du bouton de choix des sièges
        if (commandeMinValid) {
            btnFauteuils.classList.remove("inactif");
            btnFauteuils.disabled = false;
        } else {
            btnFauteuils.classList.add("inactif");
            btnFauteuils.disabled = true;
        }

        // Activation/désactivation du bouton de soumission
        if (!(emailValid && commandeMinValid &&
            ["PendingChoiceSeance", "PendingChoiceSeats", "ReserveConfirmed"].includes(dataController.reservationState))) {
            btnReserve.classList.add("inactif");
            btnReserve.disabled = true;

        } else {
            btnReserve.classList.remove("inactif");
            btnReserve.disabled = false;
        }


    }

    // Ajout d'écouteurs d'événements pour la validation en temps réel
    // Sur l'email
    emailInput.addEventListener('input', validateForm);

    // Sur le nombre total de place est faite par programme, l'écouteur est basé sur un changement du DOM
    const observer = new MutationObserver(() => {
        console.log("Changement....");
        validateForm();
        // on dévalide le choix des sièges des qu'on change quelque chose
        const btnFauteuils = document.querySelector('.panel__choisirSeats-button') as HTMLButtonElement;
        btnFauteuils.textContent = "Choisir les fauteuils";
        dataController.selectedListSeats = "";
        displaySeatsBooked();


    });
    // Configurer l'observation pour surveiller les modifications de contenu
    observer.observe(totalPlaces, {
        characterData: true,  // Surveille les modifications du texte
        childList: true,      // Surveille les modifications des enfants (ajout/suppression)
        subtree: true         // Surveille aussi dans les sous-éléments
    });


    // Gestion du choix des sieges
    btnFauteuils.removeEventListener('click', async (evt: MouseEvent) => { });
    btnFauteuils.addEventListener('click', async (evt: MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        console.log("Choix des sièges");

        const { totalPlaces, tarifSeatsMap } = collectTarifSeatsAndTotal('.tabtarif__commande-table');

        const pmrSeats = collectPMR('.commande__pmr');
        console.log(`Nombre de PMR = ${pmrSeats}`);
        // On recupere les sieges absents sur la séance
        const listSeatsAbsents = dataController.seanceSelected().seatsAbsents!;
        const listSeatsAbsentsArray = listSeatsAbsents.split(',').map(s => s.trim().replace(/^"|"$/g, ''));

        // On recupere les sièges déjà réservé sur la séance
        const { siegesReserves } = await getSeatsBookedApi(dataController.seanceSelected().seanceId);
        console.log("Liste des sieges 1 = ", siegesReserves);


        const listSeatsBookedArray = siegesReserves
            ? siegesReserves.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
            : [];

        console.log("Liste des sièges réservés en tableau =", listSeatsBookedArray);
        console.log("MaxPMR = ", parseInt(dataController.seanceSelected().numPMR!, 10))
        console.log("Seance = ",JSON.stringify(dataController.seanceSelected()))
        onClickdisplayAndSeatsReserve(
            totalPlaces,
            pmrSeats,
            listSeatsBookedArray,
            listSeatsAbsentsArray,
            parseInt(dataController.seanceSelected().rMax!, 10),
            parseInt(dataController.seanceSelected().fMax!, 10),
            parseInt(dataController.seanceSelected().numPMR!, 10)
        ).then((listPlaces) => {
            if (listPlaces.length > 0) {
                dataController.selectedListSeats = listPlaces.join(",");
                // On met à jour le libelle du bouton
                const btnFauteuils = document.querySelector('.panel__choisirSeats-button') as HTMLButtonElement;
                if (btnFauteuils) {
                    let pluriel = "";
                    if (listPlaces.length > 1) pluriel = "s";
                    btnFauteuils.textContent = `${listPlaces.length} siège${pluriel} choisi${pluriel}`
                }
                // On met à jour l'affichage des sieges
                displaySeatsBooked();

                console.log("Liste des places = ", listPlaces);
            }
        }).catch(error => {
            console.error("Erreur lors de la sélection des places :", error);
        });
    })


    // Gestion de la reservation
    // La validation des saisies est faites par la fonction de validation validateForm
    btnReserve.removeEventListener('click', async (evt: MouseEvent) => { });
    btnReserve.addEventListener('click', async (evt: MouseEvent) => {
        btnReserve.disabled = true;
        btnReserve.classList.add("inactif");
        btnReserve.classList.add('loading');

        evt.preventDefault();
        evt.stopPropagation();
        

        console.log("Statut Reservation " + dataController.reservationState);

        // a) Récupérer le nombre total de places et la répartition par tarif
        const { totalPlaces, tarifSeatsMap } = collectTarifSeatsAndTotal('.tabtarif__commande-table');
        console.log(`Nombre de places total = ${totalPlaces}, Répartition = ${tarifSeatsMap}`);

        // b) Récupérer la valeur PMR
        const pmrSeats = collectPMR('.commande__pmr');
        console.log(`Nombre de PMR = ${pmrSeats}`);

        // c) Récupérer l'email
        const email = await collectEmail('.commande__mail-input');
        console.log(`email = ${email}`);

        // d) Appel à l’API /api/reservation et traitement des résultats
        try {
            const seanceId = dataController.seanceSelected().seanceId;
            const listSeats = dataController.selectedListSeats || '';

            const { statut, utilisateurId, reservationId } = await setReservationApi(email, seanceId, tarifSeatsMap, pmrSeats, listSeats);

            dataController.selectedUtilisateurUUID = utilisateurId;
            dataController.selectedReservationUUID = reservationId;
            dataController.selectedUtilisateurMail = email;



            switch (statut) {
                case 'Compte Provisoire':
                    // L'email est inconnu -> compte créé en provisoire : il faudra confirmer l'utilisateur puis le mail et se logguer
                    console.log("Compte provisoire , " + utilisateurId + " , " + reservationId);

                    dataController.reservationState = ReservationState.ReserveCompteToConfirm;
                    await dataController.sauverEtatGlobal();
                    await confirmUtilisateur();
                    break;

                case 'Compte Confirme':
                    // L'email correspond à un compte valide
                    if (userDataController.profil() === ProfilUtilisateur.Utilisateur) {
                        // On est logue, on peut valider la reservation directement
                        // On memorise l'utilisateur et on charge ses données de compte dans le cadre ou 
                        userDataController.ident = emailInput.value.trim();
                        await userDataController.init();
                        await confirmReserve();
                        // Au cas ou on n'est plus connecté on recalcule le profil
                        await userDataController.init();
                        const pageToGo = userDataController.profil();
                        window.location.href = pageToGo;


                        // await confirmReserve();
                        // dataController.reservationState = ReservationState.PendingChoiceSeance;

                    }
                    console.log("Compte Confirme , " + utilisateurId + " , " + reservationId);
                    dataController.reservationState = ReservationState.ReserveToConfirm;
                    await dataController.sauverEtatGlobal();
                    await login("Veuillez vous connecter pour valider la réservation");

                    break;

                default:
                    // Cas imprévu
                    await showCustomAlert(`Une erreur s'est produite : statut inconnu -> ${statut} , ${utilisateurId} , ${reservationId}`);
                    break;
            }

        } catch (error: any) {
            console.error('Erreur lors de la création de la réservation', error);
            await showCustomAlert(`Une erreur s'est produite : ${error?.message || 'inconnue'}`);
        }
        finally {
            btnReserve.classList.remove('loading');
            
        }
    });

}
/** 
 * Récupère le total de places et la répartition par tarif 
 * @param tableSelector Sélecteur de la table (.tabtarif__commande-table)
 * @return { totalPlaces, tarifSeatsMap } 
 *    - totalPlaces : somme des places
 *    - tarifSeatsMap : objet { [tarifId]: numberOfSeats }
 */
function collectTarifSeatsAndTotal(tableSelector: string) {
    const table = document.querySelector(tableSelector) as HTMLTableElement | null;
    let totalPlaces = 0;
    const tarifSeatsMap: TarifForSeats = {};

    if (!table) return { totalPlaces: 0, tarifSeatsMap };

    // Hypothèse : on stocke l'ID du tarifQualite dans un data-attribute 
    // => <tr data-tarifid="xxx"> ...
    const rows = table.querySelectorAll('tr.body__content-tr');
    rows.forEach((row) => {
        const tarifId = (row as HTMLElement).dataset['tarifid'] || '';
        console.log("TarifId = ", tarifId);
        const spanPlace = row.querySelector('.num__num-span#num__place') as HTMLSpanElement | null;
        const quantity = spanPlace ? parseInt(spanPlace.textContent ?? '0', 10) : 0;
        if (quantity > 0 && tarifId) {
            tarifSeatsMap[tarifId] = quantity;
        }
        totalPlaces += quantity;
    });
    return { totalPlaces, tarifSeatsMap };
}

/**
 * Récupère le nombre PMR dans .commande__pmr
 */
function collectPMR(selector: string): number {
    const pmrContainer = document.querySelector(selector);
    if (!pmrContainer) return 0;
    const spanPmr = pmrContainer.querySelector('.num__num-span#num__pmr') as HTMLSpanElement | null;
    return spanPmr ? parseInt(spanPmr.textContent ?? '0', 10) : 0;
}

/**
 * Récupère l'email
 */
async function collectEmail(selector: string): Promise<string> {
    const input = document.querySelector(selector) as HTMLInputElement | null;
    if (!input) return '';
    return input.value.trim();
}

/**
* Génère le contenu d'un tableau des tarifs en fonction d'une qualité spécifiée.
* Les tarifs sont pris dans le dataController
* @param qualite La valeur de qualite à filtrer (ex: "3D", "4DX", etc.)
* @param isReadOnly indique si la table est afficher en lecture seule
* @returns Un élément <table> 
*/
export async function updateTableContent(qualite: string, isReadOnly: boolean = false, reservationId: string = "" , numMaxSeats: number = 8): Promise<HTMLTableElement> {

    // 1) Créer l'élément <table> et sa structure de base
    const table = document.createElement('table');
    table.classList.add('tabtarif__commande-table');

    // === THEAD ===
    const thead = document.createElement('thead');
    thead.classList.add('commande__entete-thead');
    thead.innerHTML = `
      <tr class="entete__content-tr">
        <th class="content-th content-id-th">#</th>
        <th class="content-th content-tarif-th">Tarif</th>
        <th class="content-th content-places-th">Places</th>
        <th class="content-th content-total-th">Total</th>
      </tr>
    `;
    table.appendChild(thead);

    // === TBODY ===
    const tbody = document.createElement('tbody');
    tbody.classList.add('commande__body-tbody');
    table.appendChild(tbody);

    // === TFOOT ===
    const tfoot = document.createElement('tfoot');
    tfoot.classList.add('commande__foot-tfoot');
    //   <td colspan="3"></td>
    tfoot.innerHTML = `
      <tr class="foot__content-tr">
      
        <td></td> <td></td> <td></td>
        <td class="content-td content-totalprice-td" id = "content-totalprice">0 €</td>
      </tr>
    `;
    table.appendChild(tfoot);

    const totalPriceTd = tfoot.querySelector('.content-totalprice-td') as HTMLTableCellElement;
    if (isReadOnly) {
        // Si on est en readOnly, on va chercher les données des places à partir de la réservation communiquée
        let places: SeatsForReservation[] = []

        if (reservationId !== "") {
            places = await getPlacesReservationApi(reservationId);
        }
        else {
            console.error("updateTableContent : Pas de reservation communiquee pour un affichage de reservation");
        }

        // 2) on affiche une ligne par place prise
        let lineIndex = 1;
        places.forEach((place) => {
            const tr = document.createElement('tr');
            tr.classList.add('body__content-tr');

            // Colonne #
            const tdId = document.createElement('td');
            tdId.classList.add('content-td', 'content-id-td');
            tdId.textContent = String(lineIndex);

            // Colonne Tarif : ex. "Plein tarif (10€)"
            const tdTarif = document.createElement('td');
            tdTarif.classList.add('content-td', 'content-tarif-td');
            tdTarif.textContent = `${place.nameTarif} (${place.numberSeats}€)`;

            // Colonne Places 
            const tdNum = document.createElement('td');
            tdNum.classList.add('content-td', 'content-num-td');

            // Colonne Places
            const spanPlaces = document.createElement('span');
            spanPlaces.classList.add('num__num-span');
            spanPlaces.id = 'num__place';
            spanPlaces.textContent = String(place.numberSeats) || '';
            tdNum.appendChild(spanPlaces);

            // Colonne Total
            const tdPrice = document.createElement('td');
            tdPrice.classList.add('content-td', 'content-price-td');
            tdPrice.textContent = `${String(place.numberSeats! * place.price!)} €`; // Au départ, 0

            // Assembler la ligne
            tr.appendChild(tdId);
            tr.appendChild(tdTarif);
            tr.appendChild(tdNum);
            tr.appendChild(tdPrice);

            tbody.appendChild(tr);

            lineIndex++;

        });

        // Somme totale

        const somme = places.reduce((total, place) =>
            total + ((place.numberSeats || 1) * (place.price || 1)), 0);
        totalPriceTd.textContent = `${String(somme)} €`;

    } else {
        // 2) Filtrer les tarifs correspondant à la qualité demandée
        const filteredTarifs = dataController.allTarifQualite.filter(t => t.qualite === qualite);

        // 3) Générer une ligne par tarif
        let lineIndex = 1;
        filteredTarifs.forEach((tarif) => {
            const tr = document.createElement('tr');

            tr.setAttribute('data-tarifid', tarif.id);
            tr.classList.add('body__content-tr');

            // Colonne #
            const tdId = document.createElement('td');
            tdId.classList.add('content-td', 'content-id-td');
            tdId.textContent = String(lineIndex);

            // Colonne Tarif : ex. "Plein tarif (10€)"
            const tdTarif = document.createElement('td');
            tdTarif.classList.add('content-td', 'content-tarif-td');
            const priceNum = tarif.price ? parseFloat(tarif.price) : 0;
            tdTarif.textContent = `${tarif.nameTarif ?? ''} (${priceNum}€)`;

            // Colonne Places (boutons + -)
            const tdNum = document.createElement('td');
            tdNum.classList.add('content-td', 'content-num-td');

            const btnRemove = document.createElement('button');
            btnRemove.classList.add('num__remove-button');
            btnRemove.textContent = '-';

            const spanPlaces = document.createElement('span');
            spanPlaces.classList.add('num__num-span');
            spanPlaces.id = 'num__place';
            spanPlaces.textContent = '0'; // Au départ, 0

            const btnAdd = document.createElement('button');
            btnAdd.classList.add('num__add-button');
            btnAdd.textContent = '+';

            tdNum.appendChild(btnRemove);
            tdNum.appendChild(spanPlaces);
            tdNum.appendChild(btnAdd);

            // Colonne Total
            const tdPrice = document.createElement('td');
            tdPrice.classList.add('content-td', 'content-price-td');
            tdPrice.textContent = '0 €'; // Au départ, 0

            // Assembler la ligne
            tr.appendChild(tdId);
            tr.appendChild(tdTarif);
            tr.appendChild(tdNum);
            tr.appendChild(tdPrice);

            tbody.appendChild(tr);

            // 4) Gérer l'événement + et -
            function updateRowTotal() {
                // Récupérer la quantité
                const quantity = parseInt(spanPlaces.textContent ?? '0', 10) || 0;
                // Mettre à jour le total de la ligne
                const lineTotal = priceNum * quantity;
                tdPrice.textContent = `${lineTotal} €`;

                // Recalculer le total global
                updateTableTotal();
            }

            // Incrémente la quantité (max 4) ou le nombre de places disponibles
            btnAdd.addEventListener('click', async (event: MouseEvent) =>  {
                event.preventDefault();
                event.stopPropagation();
                let currentVal = parseInt(spanPlaces.textContent ?? '0', 10) || 0;
                // Calcul du total actuel de places sélectionnées
                let totalPlaces = 0;
                tbody.querySelectorAll('span#num__place').forEach((span) => {
                    const val = parseInt(span.textContent ?? '0', 10) || 0;
                    totalPlaces += val;
                });

                // Limite globale à 8 places
                if (totalPlaces < numMaxSeats) {
                    currentVal++;
                    spanPlaces.textContent = String(currentVal);
                    updateRowTotal();
                } else {
                    await showCustomAlert(`Vous ne pouvez pas réserver plus de ${numMaxSeats} places au total.`);
                }
            });

            // Décrémente la quantité (min 0)
            btnRemove.addEventListener('click', (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                let currentVal = parseInt(spanPlaces.textContent ?? '0', 10) || 0;
                if (currentVal > 0) {
                    currentVal--;
                    spanPlaces.textContent = String(currentVal);
                    updateRowTotal();
                }
            });

            lineIndex++;
        });


        // 5) Fonction pour mettre à jour le total global (tfoot)
        function updateTableTotal() {
            let grandTotal = 0;
            // Parcourir chaque ligne du tbody pour sommer
            tbody.querySelectorAll('tr.body__content-tr').forEach((row) => {
                const priceCell = row.querySelector('.content-price-td') as HTMLTableCellElement;
                if (priceCell) {
                    const text = priceCell.textContent?.replace(' €', '') ?? '0';
                    const value = parseFloat(text) || 0;
                    grandTotal += value;
                }
            });
            totalPriceTd.textContent = `${grandTotal} €`;
        }
    }

    return table;
};

/**
* Génere les controls associés au nombre de place PMR
*/
function updateInputPMR(numMaxPMR: number): HTMLDivElement {

    // const btnAddPMR = document.querySelector('.num__add-pmr') as HTMLButtonElement;
    // const btnRemovePMR = document.querySelector('.num__remove-pmr') as HTMLButtonElement;
    // const spanPMR = document.getElementById('num__pmr');

    // 1) Créer l'élément PMR et sa structure de base
    const pmrContent = document.createElement('div');
    pmrContent.classList.add('pmr__content');
    if (numMaxPMR === 0) return pmrContent;

    //     pmrContent.innerHTML = `
    //     <p class="content__libelle-p">Personne à mobilité réduite :</p>
    //     <div class="content__num-pmr">
    //         <button class="num__add-button num__add-pmr">+</button>
    //         <span class="num__num-span num__numpmr-span" id="num__pmr">0</span>
    //         <button class="num__remove-button num__remove-pmr">-</button>
    //     </div>
    //   `;
    const contentLibelle = document.createElement('p');
    contentLibelle.classList.add('content__libelle-p');
    contentLibelle.textContent = 'Personne à mobilité réduite :';


    const contentNumPMR = document.createElement('div');
    contentNumPMR.classList.add('content__num-pmr');

    

    const btnRemovePMR = document.createElement('button');
    btnRemovePMR.classList.add('num__remove-button', 'num__remove-pmr');
    btnRemovePMR.textContent = '-';

    const spanPMR = document.createElement('span');
    spanPMR.classList.add('num__num-span', 'num__numpmr-span');
    spanPMR.id = 'num__pmr';
    spanPMR.textContent = '0';

    const btnAddPMR = document.createElement('button');
    btnAddPMR.classList.add('num__add-button', 'num__add-pmr');
    btnAddPMR.textContent = '+';

    if (!btnAddPMR || !btnRemovePMR || !spanPMR) throw new Error('Erreur updateInputPMR');;
    btnAddPMR.removeEventListener('click', (event: MouseEvent) => { });
    btnRemovePMR.removeEventListener('click', (event: MouseEvent) => { });
    spanPMR.textContent = '0';

    // Incrémente la quantité (max 4)


    btnAddPMR.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        let currentVal = parseInt(spanPMR.textContent ?? '0', 10) || 0;
        if (currentVal < numMaxPMR) {
            currentVal++;
            spanPMR.textContent = String(currentVal);
        } else {
            alert(`Vous ne pouvez pas réservez plus de ${numMaxPMR} places PMR`)
        }
    });

    // Décrémente la quantité (min 0)
    btnRemovePMR.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        let currentVal = parseInt(spanPMR.textContent ?? '0', 10) || 0;
        if (currentVal > 0) {
            currentVal--;
            spanPMR.textContent = String(currentVal);
        }
    });

    contentNumPMR.appendChild(btnRemovePMR);
    contentNumPMR.appendChild(spanPMR);
    contentNumPMR.appendChild(btnAddPMR);

    pmrContent.appendChild(contentLibelle);
    pmrContent.appendChild(contentNumPMR);

    return pmrContent;

};


/**
 * Quand on reçoit "Compte Provisoire" => on exécute confirmUtilisateur
 * - On affiche une modale demandant la saisie du mail et deux champs mot de passe
 */
export async function confirmUtilisateur() {
    // Afficher la modale
    // Execution de la fonction interne gestionFormulaire (valeur de l'email saisie)
    //  Reprise de la valeur de l'email du formulaire précédent
    //  Verification des champs email/password/displayname, si OK activation du bouton
    //  Bouton submit qui enclenche la confirmation de la création du compte confirmCreationCompte
    //    Appel de l'API Rest
    //    Si Ok lancement de la fonction de login

    const modalConfirmHTML = `
    <!-- Modale confirmUtilisateur -->
    <div id="modal-confirmUtilisateur" class="modal">
        <div class="modal__content-wrapper">
            <div class="modal__title">
                <div class="title-h2">
                    <h2>Création du compte</h2>
                </div>
                <!-- Bouton (X) ou autre mécanisme pour fermer la modale si besoin -->
                <span class="close-modal" id="close-confirmUtilisateur">×</span>
            </div>
            <div class="modal__content">
                <div class="title-p">
                    <p>Pour récupérer le QRCode de votre réservation, vous devez créer un compte CinePhoria en
                        enregistrant
                        les
                        informations suivantes :</p>
                </div>
                <!-- Saisie de l'email -->
                <div class="form__group">
                    <label for="confirmUtilisateur-email">Email :</label>
                    <input type="email" id="confirmUtilisateur-email" class="input__mail" disabled>
                    <span id="email-error" class="error-message"></span>
                </div>

                <!-- Saisie du displayName -->
                <div class="form__group">
                    <label for="confirmUtilisateur-displayName">Nom ou pseudo :</label>
                    <input type="text" id="confirmUtilisateur-displayName" class="input__text" required />
                </div>


                <!-- Mot de passe 1 -->
                <div class="form__group">
                    <label for="confirmUtilisateur-password1">Mot de passe :</label>
                    <input type="password" id="confirmUtilisateur-password1" required />
                </div>

                <!-- Mot de passe 2 -->
                <div class="form__group">
                    <label for="confirmUtilisateur-password2">Confirmer le mot de passe :</label>
                    <input type="password" id="confirmUtilisateur-password2" required />
                    <span id="password-error" class="error-message"></span>
                </div>

                <!-- Bouton de validation -->
                <button id="confirmUtilisateur-submit" class="button button-primary" disabled>
                    Valider
                </button>
            </div>
        </div>
    </div>
    `

    // On installe la modale dans la page HTML
    const modalConfirmLocal = document.createElement('div');
    modalConfirmLocal.innerHTML = modalConfirmHTML;
    document.body.appendChild(modalConfirmLocal);

    const email = dataController.selectedUtilisateurMail || '';
    console.log('===> confirmUtilisateur action, email =', email);
    const modalConfirm = document.getElementById('modal-confirmUtilisateur') as HTMLDivElement | null;
    const closeModalBtn = document.getElementById("close-confirmUtilisateur") as HTMLButtonElement | null;
    const confirmModalBtn = document.getElementById("confirmUtilisateur-submit") as HTMLButtonElement | null;

    if (modalConfirm && closeModalBtn && confirmModalBtn) {
        modalConfirm.style.display = 'flex';

        const closeModal = () => {
            modalConfirm.style.display = 'none';
            window.location.reload();
        };

        closeModalBtn.addEventListener('click', closeModal);

        modalConfirm.addEventListener('click', (event: MouseEvent) => {
            if (event.target === modalConfirm) closeModal();
        });
        // Appel de la fonction de gestion du formulaire et récupération des données -> on est sur d'avoir ces données car la vérification
        // des valeurs du formulaire conditionne le submit qui exécute cette fonction
        await gestionFormulaireModal();

    } else {
        console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal modal-confirmUtilisateur sont introuvables.');
    }

    /**
     * Met en place toute la gestion de la modal
     * 
     * @param emailInitial sert a in itialiser l'input du mail
     * 
     */
    async function gestionFormulaireModal() {

        const email = dataController.selectedUtilisateurMail || '';
        // Sélection des éléments de la modal avec un typage strict

        const displayNameInput = document.getElementById('confirmUtilisateur-displayName') as HTMLInputElement;
        const emailInput = document.getElementById('confirmUtilisateur-email') as HTMLInputElement;
        const password1Input = document.getElementById('confirmUtilisateur-password1') as HTMLInputElement;
        const password2Input = document.getElementById('confirmUtilisateur-password2') as HTMLInputElement;
        const submitButton = document.getElementById('confirmUtilisateur-submit') as HTMLButtonElement;
        const emailError = document.getElementById('email-error') as HTMLSpanElement;
        const passwordError = document.getElementById('password-error') as HTMLSpanElement;

        displayNameInput.value = "";


        /**
         * Vérifie si les mots de passe sont identiques.
         * @returns boolean - True si les mots de passe correspondent, sinon False.
         */
        function passwordsMatch(): boolean {
            return password1Input.value === password2Input.value && password1Input.value.length > 0;
        }

        /**
         * Vérifie si tous les champs sont remplis.
         * @returns boolean - True si tous les champs sont remplis, sinon False.
         */
        function areAllFieldsFilled(): boolean {
            return (
                displayNameInput.value.trim() !== "" &&
                emailInput.value.trim() !== "" &&
                password1Input.value.trim() !== "" &&
                password2Input.value.trim() !== ""
            );
        }

        /**
         * Valide l'ensemble du formulaire et active/désactive le bouton de soumission.
         */
        function validateForm(): void {
            const emailValid = validateEmail(emailInput.value);
            const passwordsAreValid = passwordsMatch();
            const fieldsFilled = areAllFieldsFilled();
            // Activation/désactivation du bouton de soumission
            if (!(emailValid && passwordsAreValid && fieldsFilled)) {
                submitButton.classList.add("inactif");
                submitButton.disabled = true;
            } else {
                submitButton.classList.remove("inactif");
                submitButton.disabled = false;
            }
        }

        // Ajout de la valeur d'email saisi dans le formulaire de réservation
        // Cette valeur n'est pas modifiable car la reservation a été faite avec elle
        emailInput.value = email;

        // Le bouton de validation est inactif au chargement
        submitButton.classList.add("inactif");

        // Gestion du message d'erreur pour l'email lors du blur (perte de focus)
        emailInput.addEventListener('blur', () => {
            if (!validateEmail(emailInput.value)) {
                emailError.textContent = "Email invalide (exemple: utilisateur@domaine.com)";
                emailError.style.color = "red";
            } else {
                emailError.textContent = "";
            }
        });

        // Gestion du message d'erreur pour les mots de passe lors du blur
        password2Input.addEventListener('blur', () => {
            if (!passwordsMatch()) {
                passwordError.textContent = "Les mots de passe ne correspondent pas.";
                passwordError.style.color = "red";
            } else {
                passwordError.textContent = "";
            }
        });

        // Ajout d'écouteurs d'événements pour la validation en temps réel
        displayNameInput.addEventListener('input', validateForm);
        password1Input.addEventListener('input', validateForm);
        password2Input.addEventListener('input', validateForm);


        // Gestion de la soumission de la modale de confirmation de compte
        submitButton.removeEventListener('click', async (evt: MouseEvent) => { });
        submitButton.addEventListener('click', async (evt: MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (!dataController.selectedUtilisateurUUID) return;
            // On soumet la confirmation du compte
            if (await confirmCreationCompte(dataController.selectedUtilisateurUUID,
                emailInput.value.trim(),
                password1Input.value.trim(),
                displayNameInput.value.trim())) {
                // On ferme la modal de confirmation
                const modalConfirm = document.getElementById('modal-confirmUtilisateur') as HTMLDivElement | null;
                if (modalConfirm) {
                    modalConfirm.style.display = 'none';
                }
                dataController.reservationState = ReservationState.ReserveMailToConfirm;
                // On lance la modal de confirmation d'email
                await confirmMail();
                await dataController.sauverEtatGlobal();
            };
        });
    }
    async function confirmCreationCompte(id: string, email: string, password: string, displayName: string): Promise<boolean> {

        const resultat = await confirmUtilisateurApi(id, password, displayName);
        if (resultat.statut === 'OK') {
            dataController.reservationState = ReservationState.ReserveMailToConfirm;
            dataController.selectedUtilisateurDisplayName = displayName;
            dataController.selectedUtilisateurMail = email;
            return true;
        } else {
            return false;
        }
    }
};

/**
 * On vient de confirmer un compte, il faut confirmerl'email de ce compte
 * Un email est envoyé par le backend avec un code
 * Ce code doit etre saisi dans la modal de confirmation de mail
 */
export async function confirmMail() {
    // Afficher la modale de confirmation d'email
    //  Bouton submit qui enclenche la confirmation de la création du compte confirmValidationMail
    //    Appel de l'API Rest
    //    Si Ok lancement de la fonction de login

    const modalVerifEmailHTML = `
    <!-- Modale confirmMail -->
    <div id="modal-confirmMail" class="modal">
        <div class="modal__content-wrapper">
            <div class="modal__title">
                <div class="title-h2">
                    <h2>Verification adresse email</h2>
                </div>
                <!-- Bouton (X) ou autre mécanisme pour fermer la modale si besoin -->
                <span class="close-modal" id="close-confirmMail">×</span>
            </div>
            <div class="modal__content">
                <div class="confirmMail-title title-p" id="confirmMail-title">
                    <p>Vous avez du recevoir un email contenant un code de confirmation à six chiffres.</p>
                </div>
                <!-- Saisie du code de confirmation -->
                <div class="form__group">
                    <label for="confirmMail-code">Code de confirmation :</label>
                    <input type="text" id="confirmMail-code" class="input__code">
                    <span id="code-error" class="error-message"></span>
                </div>

                <!-- Bouton de validation -->
                <button id="confirmMail-submit" class="button button-primary" disabled>
                    Valider
                </button>
            </div>
        </div>
    </div>
    `;

    // On installe la modale dans la page HTML
    const modalVerifEmailLocal = document.createElement('div');
    modalVerifEmailLocal.innerHTML = modalVerifEmailHTML;
    document.body.appendChild(modalVerifEmailLocal);


    const email = dataController.selectedUtilisateurMail || '';
    console.log('===> confirmMail action, email =', email);
    const modalConfirm = document.getElementById('modal-confirmMail') as HTMLDivElement | null;
    const closeModalBtn = document.getElementById("close-confirmMail") as HTMLButtonElement | null;
    const confirmModalBtn = document.getElementById("confirmMail-submit") as HTMLButtonElement | null;


    if (modalConfirm && closeModalBtn && confirmModalBtn) {
        modalConfirm.style.display = 'flex';

        const closeModal = () => {
            modalConfirm.style.display = 'none';
            window.location.reload();
        };

        closeModalBtn.addEventListener('click', closeModal);

        modalConfirm.addEventListener('click', (event: MouseEvent) => {
            if (event.target === modalConfirm) closeModal();
        });
        // Appel de la fonction de gestion du formulaire et récupération des données -> on est sur d'avoir ces données car la vérification
        // des valeurs du formulaire conditionne le submit qui exécute cette fonction
        await gestionFormulaireModal();

    } else {
        console.error('Un ou plusieurs éléments requis pour le fonctionnement de la modal modal-confirmMail sont introuvables.');
    }

    /**
     * Met en place toute la gestion de la modal
     * 
     * @param emailInitial sert a in itialiser l'input du mail
     * 
     */
    async function gestionFormulaireModal() {

        // Sélection des éléments de la modal avec un typage strict

        const codeInput = document.getElementById('confirmMail-code') as HTMLInputElement;
        const submitButton = document.getElementById('confirmMail-submit') as HTMLButtonElement;
        const codeError = document.getElementById('code-error') as HTMLSpanElement;
        const inviteP = document.getElementById('confirmMail-title');
        if (inviteP) {

            codeInput.value = "";

            inviteP.textContent = `
Nous avons envoyé à l'adresse (${dataController.selectedUtilisateurMail || ''}) 
un code à renseigner ci-dessous.
`;

            /**
             * Vérifie si tous les champs sont remplis.
             * @returns boolean - True si tous les champs sont remplis, sinon False.
             */
            function areAllFieldsFilled(): boolean {
                return (

                    codeInput.value.trim() !== ""
                );
            }

            /**
             * Valide l'ensemble du formulaire et active/désactive le bouton de soumission.
             */
            function validateForm(): void {

                const fieldsFilled = areAllFieldsFilled();
                // Activation/désactivation du bouton de soumission
                if (!(fieldsFilled)) {
                    submitButton.classList.add("inactif");
                    submitButton.disabled = true;
                } else {
                    submitButton.classList.remove("inactif");
                    submitButton.disabled = false;
                }
            }


            // Le bouton de validation est inactif au chargement
            submitButton.classList.add("inactif");

            // Gestion du message d'erreur pour l'email lors du blur (perte de focus)
            codeInput.addEventListener('blur', () => {
                if (!validateCode(codeInput.value)) {
                    codeError.textContent = "Le code se compose de 6 chiffres (exemple : 123456)";
                    codeError.style.color = "red";
                } else {
                    codeError.textContent = "";
                }
            });

            // Vérification du code de confirmation
            function validateCode(code: string): boolean {
                // Expression régulière pour vérifier si le code est composé exactement de 6 chiffres
                const regex = /^[0-9]{6}$/;
                return regex.test(code);
            }


            // Ajout d'écouteurs d'événements pour la validation en temps réel
            codeInput.addEventListener('input', validateForm);

            // Gestion de la soumission de la modale de confirmation de compte
            submitButton.removeEventListener('click', async (evt: MouseEvent) => { });
            submitButton.addEventListener('click', async (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopPropagation();
                if (!dataController.selectedUtilisateurUUID) return;
                try {
                    if (await confirmCreationCompte(dataController.selectedUtilisateurMail || '', codeInput.value.trim())) {
                        // On ferme la modal de confirmation
                        const modalConfirm = document.getElementById('modal-confirmMail') as HTMLDivElement | null;
                        if (modalConfirm) {
                            modalConfirm.style.display = 'none';
                        }
                        dataController.reservationState = ReservationState.ReserveToConfirm;
                        // On lance la modal de connexion
                        await login("Veuillez vous connecter pour valider la réservation");
                        await dataController.sauverEtatGlobal();
                    };
                } catch (error) {
                    console.log("Erreur = ", error)
                    const messageT = error as string;
                    if (messageT) {
                        codeError.textContent = messageT;
                    }
                }
            });
        }
        async function confirmCreationCompte(email: string, codeConfirm: string): Promise<boolean> {

            const resultat = await confirmCompteApi(email, codeConfirm);
            if (resultat.statut === 'OK') {
                dataController.reservationState = ReservationState.ReserveToConfirm;
                return true;
            } else {
                throw new Error(resultat.statut);
            }
        }
    }
};



/**
 * Confirmation de la reservation
 */
export async function confirmReserve() {
    const reservationId = dataController.selectedReservationUUID;
    const utilisateurId = dataController.selectedUtilisateurUUID;
    const seanceId = dataController.selectedSeanceUUID;
    if (reservationId && utilisateurId && seanceId) {
        try {
            console.log("Appel sur R U S", reservationId, " ", utilisateurId, " ", seanceId)
            await confirmReserveApi(reservationId, utilisateurId, seanceId);
            await showCustomAlert("votre reservation est confirmée");
            // On efface la reservation pending et on autorise de nouvelle reservation
            dataController.reservationState = ReservationState.PendingChoiceSeance;
            dataController.selectedReservationUUID = undefined;
            dataController.selectedSeanceUUID = undefined;
            dataController.selectedUtilisateurUUID = undefined;
            dataController.selectedListSeats = undefined;
            await dataController.sauverEtatGlobal();

        } catch (error) {
            alert("Erreur dans la confirmation de la réservation = " + error as string)

        }
    }
}

// Exemple d'imports si nécessaire
// import { validateEmail } from '../Helpers'; // Par exemple

/**
 * Sélection de places via une modale.
 * @param nSeats Nombre de places "classiques" à réserver
 * @param nPMR Nombre de places PMR à réserver
 * @param placesReserves Liste des places déjà réservées (ex: ["R0F0", "R1F3", ...])
 * @param seatsAbsents Liste des emplacements sans sieges (ex: ["R13F0", "R13F1", ...])
 * @param rMax Nombre de rangées totales (0..rMax-1)
 * @param fMax Nombre de fauteuils par rang (0..fMax-1)
 * @param maxPMR Nombre total de places PMR existantes sur la rangée 0
 * @returns Un tableau de places sélectionnées (ex: ["R2F1", "R2F2", ...])
 */
export async function onClickdisplayAndSeatsReserve(
    nSeats: number,
    nPMR: number,
    placesReserves: string[],
    seatsAbsents: string[] = [],
    rMax: number = 20,
    fMax: number = 10,
    maxPMR: number = 2
): Promise<string[]> {
    return new Promise<string[]>((resolve) => {
        console.log("Nombre total de siege = " + nSeats + " dont nombre de PMR = " + nPMR);
        const modalHTML = `
      <div class="modal__content-wrapper">
        <div class="modal__title">
          <div class="title__displayAndSeatsReserve title-h2">
            <h2>Sélectionner les places</h2>
          </div>
          <span class="close-modal" id="close-displayAndSeatsReserve">×</span>
        </div>
        <div class="modal__content" id="content__displayAndSeatsReserve"></div>
        <div class="modal__footer" style="margin-top: 10px; display:flex; gap:10px; justify-content: end;">
          <button id="btnAnnulerSeats" class="button">Annuler</button>
          <button id="btnValiderSeats" class="button inactif" disabled>Valider</button>
        </div>
      </div>`;

        let modal = document.getElementById('modal-displayAndSeatsReserve') as HTMLDivElement | null;
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-displayAndSeatsReserve';
            modal.classList.add('modal');
            document.body.appendChild(modal);
        }
        modal.innerHTML = modalHTML;
        modal.style.display = 'flex';

        const closeModalBtn = document.getElementById('close-displayAndSeatsReserve') as HTMLSpanElement | null;
        const contentDiv = document.getElementById('content__displayAndSeatsReserve') as HTMLDivElement | null;
        const annulerBtn = document.getElementById('btnAnnulerSeats') as HTMLButtonElement | null;
        const validerBtn = document.getElementById('btnValiderSeats') as HTMLButtonElement | null;

        // Places sélectionnées
        const chosenSeats: string[] = [];

        // Fermer la modale
        const closeModal = (resolveValue: string[]) => {
            modal!.style.display = 'none';
            resolve(resolveValue);
        };

        // Fermetures
        closeModalBtn?.addEventListener('click', () => closeModal([]));
        modal.addEventListener('click', (evt: MouseEvent) => {
            if (evt.target === modal) closeModal([]);
        });
        annulerBtn?.addEventListener('click', () => closeModal([]));

        // Bouton Valider => renvoie chosenSeats
        validerBtn?.removeEventListener('click', () => { });
        validerBtn?.addEventListener('click', () => {
            closeModal([...chosenSeats]);
        });

        // Met à jour l’état du bouton “Valider”
        function updateValiderButton() {
            // Compter le nombre de PMR sélectionnées
            const chosenPMR = chosenSeats.filter(s => s.startsWith("R0F"))
                .filter(seat => {
                    const colIndex = parseInt(seat.split("F")[1], 10);
                    return colIndex < maxPMR;
                }).length;
            const chosenClassic = chosenSeats.length - chosenPMR;

            if (chosenPMR === nPMR && chosenClassic + nPMR === nSeats) {
                validerBtn?.classList.remove('inactif');
                if (validerBtn) validerBtn.disabled = false;
            } else {
                validerBtn?.classList.add('inactif');
                if (validerBtn) validerBtn.disabled = true;
            }
        }

        // Construction du plan de salle
        if (contentDiv) {
            for (let r = 0; r < rMax; r++) {
                const rowDiv = document.createElement('div');
                rowDiv.style.display = 'flex';
                rowDiv.style.flexDirection = 'row';
                rowDiv.style.margin = '2px 0';

                // Label “R X”
                const rowLabel = document.createElement('span');
                rowLabel.textContent = `R${r} `;
                rowLabel.style.width = '40px';
                rowLabel.style.textAlign = 'right';
                rowDiv.appendChild(rowLabel);

                for (let f = 0; f < fMax; f++) {
                    const seatId = `R${r}F${f}`;

                    // Vérifier si c’est un emplacement sans siège
                    if (seatsAbsents && seatsAbsents.includes(seatId)) {
                        // On crée un div "vide" pour conserver l’alignement
                        const emptyDiv = document.createElement('div');
                        emptyDiv.style.width = '30px';
                        emptyDiv.style.height = '30px';
                        emptyDiv.style.marginRight = '4px';
                        emptyDiv.style.border = '1px solid transparent'; // pour conserver la place
                        emptyDiv.style.cursor = 'default';
                        rowDiv.appendChild(emptyDiv);
                        continue; // Passer au fauteuil suivant
                    }

                    const seatBtn = document.createElement('div');
                    seatBtn.style.width = '30px';
                    seatBtn.style.height = '30px';
                    seatBtn.style.marginRight = '4px';
                    seatBtn.style.display = 'flex';
                    seatBtn.style.alignItems = 'center';
                    seatBtn.style.justifyContent = 'center';
                    seatBtn.style.cursor = 'pointer';
                    seatBtn.style.fontSize = '0.7em';
                    seatBtn.style.borderRadius = '4px';

                    // PMR => si r=0 && f < maxPMR
                    if (r === 0 && f < maxPMR) {
                        seatBtn.textContent = 'PMR';
                    }

                    // Si la place est déjà réservée
                    if (placesReserves && placesReserves.includes(seatId)) {
                        seatBtn.style.backgroundColor = 'red';
                        seatBtn.style.cursor = 'not-allowed';
                    } else {
                        seatBtn.style.backgroundColor = 'lightgray';
                        // Toggle + Vérif du quota PMR / classique
                        seatBtn.removeEventListener( 'click', async ()  => {});
                        seatBtn.addEventListener('click', async () => {
                            const isPMRSeat = (r === 0 && f < maxPMR);

                            // Désélection ?
                            if (chosenSeats.includes(seatId)) {
                                chosenSeats.splice(chosenSeats.indexOf(seatId), 1);
                                seatBtn.style.backgroundColor = 'lightgray';

                            } else {
                                // 1) Vérifier la limite totale
                                if (chosenSeats.length >= (nSeats)) {
                                    await showCustomAlert(`Vous ne pouvez pas dépasser un total de ${nSeats} places.`);
                                    return;
                                }


                                // 2) Compter combien de PMR déjà sélectionnées
                                const chosenPMR = chosenSeats.filter(s => s.startsWith("R0F"))
                                    .filter(seat => {
                                        const colIndex = parseInt(seat.split("F")[1], 10);
                                        return colIndex < maxPMR;
                                    }).length;
                                // 3) Combien de siege non PMR déjà sélectionnés
                                const chosenClassic = chosenSeats.length - chosenPMR;

                                // 4) Si c’est un siège PMR
                                if (isPMRSeat) {
                                    if (chosenPMR >= nPMR) {
                                        alert(`Vous ne devez sélectionner que ${nPMR} place(s) PMR maximum.`);
                                        return;
                                    }
                                } else {
                                    if (chosenClassic >= (nSeats - nPMR)) {
                                        alert(`Vous ne pouvez sélectionner que ${nSeats - nPMR} place(s) classiques maximum.`);
                                        return;
                                    }
                                    
                                }

                                // 6) Ajout effectif de la place
                                chosenSeats.push(seatId);
                                seatBtn.style.backgroundColor = 'green';
                            }

                            updateValiderButton();
                        });
                    }

                    rowDiv.appendChild(seatBtn);
                }
                contentDiv.appendChild(rowDiv);
            }
        }

        // Initial
        updateValiderButton();
    });
}
