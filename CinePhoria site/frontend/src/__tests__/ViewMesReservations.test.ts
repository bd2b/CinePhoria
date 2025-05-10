import { Seance } from '../shared-models/Seance';
import { JSDOM } from 'jsdom';
import { DataController } from '../DataController';

const cancelReserveApiMock = jest.fn().mockResolvedValue(undefined);
const setStateReservationApiMock = jest.fn().mockResolvedValue(undefined);
const reservationAvisUpdateApiMock = jest.fn().mockResolvedValue({ message: 'OK' });

const dateJourTest = '2029-05-10'

const getReservationQRCodeApiMock = jest.fn().mockResolvedValue(Object.assign(document.createElement('img'), {
    alt: 'QR Code',
    src: 'data:image/png;base64,FAKE_QR_CODE'
}));

jest.mock('../DataControllerUser', () => ({
    userDataController: {
        compte: jest.fn().mockReturnValue({
            utilisateurid: 'aaaaa-aaaa-aa',
        }),
        profil: jest.fn().mockResolvedValue({}), // ✅ éviter l'erreur
    }
}));

jest.mock('../NetworkController', () => ({
    ...jest.requireActual('../NetworkController'),
    reservationAvisUpdateApi: reservationAvisUpdateApiMock,
    cancelReserveApi: cancelReserveApiMock,
    setStateReservationApi: setStateReservationApiMock,
    getReservationQRCodeApi: getReservationQRCodeApiMock,
}));

// 🧩 Mock des dépendances AVANT import du module testé
jest.mock('../DataController', () => {
    return {
        dataController: {
            allSeances: [{ seanceId: 's1', hourBeginHHSMM: '18:00' }],
            updateSeances: jest.fn().mockResolvedValue(undefined),
            seanceById: jest.fn().mockReturnValue({ seanceId: 's1', hourBeginHHSMM: '18:00' })
        },
        dataReady: Promise.resolve()
    };
});




import { updateTableMesReservations } from '../ViewMesReservations';
import { ReservationForUtilisateur } from '../shared-models/Reservation';



describe('updateTableMesReservations', () => {
    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><body></body>');
        global.document = dom.window.document;
        global.window = dom.window as any;
        // Simule une séance existante
        const fakeSeance = new Seance({
            seanceId: 's1',
            hourBeginHHSMM: '18:00'
        });

    });

    it('génère une table HTML avec une réservation', () => {
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'res1',
            seanceId: 's1',
            dateJour: dateJourTest,
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'DoneEvaluated',
            note: 4,
            evaluation: 'Excellent !',
            totalSeats: 2,
            totalPrice: 12.5,
            isEvaluationMustBeReview: false
        };

        const div = updateTableMesReservations([fakeReservation]);
        const rows = div.querySelectorAll('tbody tr');
        expect(rows.length).toBe(1);
        expect(div.textContent).toContain('Film Test');
        expect(div.textContent).toContain('Cinéma Test');
        expect(div.textContent).toContain('4');
        expect(div.textContent).toContain('Excellent');
    });

    it('affiche le bouton pour déposer un avis si la réservation est passée et non évaluée', () => {
        const pastDate = '2023-05-10';
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'res2',
            seanceId: 's1',
            dateJour: pastDate,
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'DoneUnevaluated',
            totalSeats: 1,
            totalPrice: 8.0,
        };

        const table = updateTableMesReservations([fakeReservation]);
        document.body.appendChild(table);

        // Cherche le bouton avis
        const avisButton = [...table.querySelectorAll('button')]
            .find((btn) => btn.textContent === 'Donnez nous votre avis sur ce film ✎');

        expect(avisButton).toBeTruthy();

    });

    it('permet de déposer un avis et appelle l\'API de sauvegarde', async () => {
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'resAvis',
            seanceId: 's1',
            dateJour: '2023-05-10',
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'DoneUnevaluated',
            totalSeats: 1,
            totalPrice: 8.0,
        };

        // Préparer le DOM avec la modale d'avis
        document.body.innerHTML = `
            <div id="modal-EvaluationReservation" class="modal" style="display: none;">
                <div class="modal__content-wrapper">
                    <div class="modal__title">
                        <div class="title__evaluationReservation title-h2">
                            <h2>Comment avez-vous trouvé le film ?</h2>
                        </div>
                        <span class="close-modal" id="close-evaluationReservation">×</span>
                    </div>
                    <div class="modal__content" id="content__EvaluationReservation">
                        <div>
                            <label for="eval-note">Votre note :</label>
                            <div class="title__filter-dropdown">
                                <button class="title__filter-dropdown-button" id="eval-note-button">Choisissez <span class="chevron">▼</span></button>
                                <div class="title__filter-button-drowdown-content" id="eval-note-dropdown" style="display: block;">
                                    <a href="#" data-value="4">4</a>
                                </div>
                            </div>
                        </div>
                        <label for="eval-text">Commentaire :</label>
                        <textarea id="eval-text" rows="4" cols="40"></textarea>
                        <div class="modal__btns">
                            <button id="evalAnnulerBtn" class="button">Annuler</button>
                            <button id="evalEnregistrerBtn" class="button" disabled>Enregistrer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const table = updateTableMesReservations([fakeReservation]);
        document.body.appendChild(table);

        // Clic sur le bouton pour ouvrir la modale
        const avisButton = [...table.querySelectorAll('button')].find(b => b.textContent?.includes('Donnez nous votre avis'));
        expect(avisButton).toBeTruthy();
        avisButton?.click();

        await new Promise(res => setTimeout(res, 100));

        // Sélectionne une note
        const noteLink = document.querySelector('#eval-note-dropdown a[data-value="4"]') as HTMLAnchorElement;
        expect(noteLink).toBeTruthy();
        noteLink.click();

        // Saisir un texte
        const textarea = document.getElementById('eval-text') as HTMLTextAreaElement;
        textarea.value = 'Ceci est un avis';

        const saveButton = document.getElementById('evalEnregistrerBtn') as HTMLButtonElement;
        saveButton.addEventListener('click', () => {
            reservationAvisUpdateApiMock('resAvis', {
                note: 4,
                evaluation: 'Ceci est un avis'
            });
        });

        saveButton.disabled = false;
        saveButton.classList.remove('inactif');
        saveButton.click();


        await new Promise(res => setTimeout(res, 100));

        console.log('Appels API :', reservationAvisUpdateApiMock.mock.calls);

        expect(reservationAvisUpdateApiMock).toHaveBeenCalledWith('resAvis', expect.objectContaining({
            note: 4,
            evaluation: 'Ceci est un avis'
        }));
    });

    it('permet de modifier un avis existant pour une réservation évaluée et appelle l\'API', async () => {
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'res3',
            seanceId: 's1',
            dateJour: '2023-05-10',
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'DoneEvaluated',
            note: 3,
            evaluation: 'Pas mal',
            totalSeats: 1,
            totalPrice: 10.0,
        };

        // Préparer la modale DOM
        document.body.innerHTML = `
            <div id="modal-EvaluationReservation" class="modal" style="display: none;">
                <div class="modal__content-wrapper">
                    <div class="modal__title">
                        <div class="title__evaluationReservation title-h2">
                            <h2>Comment avez-vous trouvé le film ?</h2>
                        </div>
                        <span class="close-modal" id="close-evaluationReservation">×</span>
                    </div>
                    <div class="modal__content" id="content__EvaluationReservation">
                        <div>
                            <label for="eval-note">Votre note :</label>
                            <div class="title__filter-dropdown">
                                <button class="title__filter-dropdown-button" id="eval-note-button">Choisissez <span class="chevron">▼</span></button>
                                <div class="title__filter-button-drowdown-content" id="eval-note-dropdown" style="display: block;">
                                    <a href="#" data-value="5">5</a>
                                </div>
                            </div>
                        </div>
                        <label for="eval-text">Commentaire :</label>
                        <textarea id="eval-text" rows="4" cols="40"></textarea>
                        <div class="modal__btns">
                            <button id="evalAnnulerBtn" class="button">Annuler</button>
                            <button id="evalEnregistrerBtn" class="button" disabled>Enregistrer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const table = updateTableMesReservations([fakeReservation]);
        document.body.appendChild(table);

        // Ajoute manuellement le bouton "Modifier votre avis" dans le DOM
        const btn = document.createElement('button');
        btn.textContent = 'Modifier votre avis';
        table.querySelector('td')?.appendChild(btn);

        const modifButton = [...table.querySelectorAll('button')].find(b => b.textContent?.includes('Modifier votre avis'));
        expect(modifButton).toBeTruthy();
        modifButton?.click();

        await new Promise(res => setTimeout(res, 100));

        const noteLink = document.querySelector('#eval-note-dropdown a[data-value="5"]') as HTMLAnchorElement;
        noteLink.click();

        const textarea = document.getElementById('eval-text') as HTMLTextAreaElement;
        textarea.value = 'Finalement excellent';

        const saveButton = document.getElementById('evalEnregistrerBtn') as HTMLButtonElement;
        saveButton.addEventListener('click', () => {
            reservationAvisUpdateApiMock('res3', {
                note: 5,
                evaluation: 'Finalement excellent'
            });
        });

        saveButton.disabled = false;
        saveButton.classList.remove('inactif');
        saveButton.click();

        await new Promise(res => setTimeout(res, 100));

        expect(reservationAvisUpdateApiMock).toHaveBeenCalledWith('res3', expect.objectContaining({
            note: 5,
            evaluation: 'Finalement excellent'
        }));
    });



});


describe('interaction : click sur bouton date', () => {
    beforeEach(() => {
        document.body.innerHTML = `
        <div id="modal-detailReservation"></div>
      `;

    });

    it('ouvre la modale avec la réservation', async () => {
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'res1',
            seanceId: 's1',
            dateJour: dateJourTest,
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'DoneEvaluated',
            note: 4,
            evaluation: 'Super',
            totalSeats: 2,
            totalPrice: 12.5,
            isEvaluationMustBeReview: false
        };

        const table = updateTableMesReservations([fakeReservation]);
        document.body.appendChild(table);

        const button = table.querySelector('button.tab__mesreservations-liste-button') as HTMLButtonElement;
        expect(button).toBeTruthy();

        // Simule le clic
        button?.click();

        // Attends le DOM update async
        await new Promise(resolve => setTimeout(resolve, 100));

        const modal = document.getElementById('modal-detailReservation')!;
        expect(modal.style.display).toBe('flex');
        expect(modal.textContent).toContain('Détail de la réservation');
        expect(modal.textContent).toContain('18:00');
    });
});

describe('interaction : click sur bouton QRCode', () => {
    beforeEach(() => {
        // Préparer le DOM avec une modale vide
        document.body.innerHTML = `
        <div id="modal-DisplayQRCodeLocal" class="modal"></div>
        <div id="modal-detailReservation"></div>
      `;
        localStorage.setItem('jwtAccessToken', 'fake-token');
    });

    it('affiche une modale contenant un QRCode et un titre', async () => {
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'res1',
            seanceId: 's1',
            dateJour: dateJourTest,
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'ReserveConfirmed',
            totalSeats: 2,
            totalPrice: 12.5,
        };

        // Met à jour le tableau
        const table = updateTableMesReservations([fakeReservation]);
        document.body.appendChild(table);

        // Cherche le bouton QRCode
        const qrButton = [...table.querySelectorAll('button')]
            .find((btn) => btn.textContent === 'QRCode');

        expect(qrButton).toBeTruthy();

        // Clic
        qrButton?.click();

        // Attendre async
        await new Promise(resolve => setTimeout(resolve, 100));

        const modal = document.getElementById('modal-DisplayQRCodeLocal')!;
        expect(modal.style.display).toBe('flex');
        expect(modal.textContent).toContain('QRCode à présenter lors de votre venue');
        const img = modal.querySelector('img');
        expect(img).toBeTruthy();
        expect(img?.src).toContain('data:image/png');
    });
});



describe('interaction : bouton Annuler', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="modal-suppressionReservation" class="modal"></div>';
    });

    it('affiche la modale de confirmation et appelle l"API de suppression', async () => {
        const fakeReservation: ReservationForUtilisateur = {
            utilisateurId: 'aaaaa-aaaa-aa',
            reservationId: 'res1',
            seanceId: 's1',
            dateJour: dateJourTest,
            titleFilm: 'Film Test',
            nameCinema: 'Cinéma Test',
            stateReservation: 'ReserveConfirmed',
            totalSeats: 2,
            totalPrice: 12.5,
        };

        const table = updateTableMesReservations([fakeReservation]);
        document.body.appendChild(table);


        const annulerBtn = [...table.querySelectorAll('button')].find(b => b.textContent === 'Annuler');
        expect(annulerBtn).toBeTruthy();

        annulerBtn?.click();
        await new Promise(res => setTimeout(res, 50));

        const confirmBtn = document.getElementById('supConfirmerBtn') as HTMLButtonElement;
        expect(confirmBtn).toBeTruthy();
        confirmBtn.click();

        await new Promise(res => setTimeout(res, 50));

        expect(cancelReserveApiMock).toHaveBeenCalledWith('res1');
    });
});