import { dataController } from './DataController.js';
import { DataControllerIntranet } from './DataControllerIntranet.js';

import { formatDateLocalYYYYMMDD, setCookie, isUUID } from './Helpers.js';
import { Film } from './shared-models/Film.js';
import { ReservationState } from './shared-models/Reservation.js';
import { Seance, TarifQualite } from './shared-models/Seance.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import {
    filmsCreateApi,
    filmsDeleteApi,
    filmsSelectAllApi,
    filmsSelectApi,
    filmsUpdateApi,
    createAfficheApi,
    deleteAfficheApi,
    getAllAffichesApi,
    getAfficheApi,
    updateAfficheApi
} from './NetworkController.js';

// State flags
let isEditingMode = false;
let isCreatingMode = false;

// We'll store references to the selectedFile128 and selectedFile1024
let selectedFile128: File | null = null;
let selectedFile1024: File | null = null;

// Film selectionne
let filmSelectedList: Film | undefined;

/**
 * Entrée principale du module
 */
export async function onLoadManageFilms() {
    console.log("=====> chargement onLoadManageFilms");

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Rafraîchir la liste de tous les films
    await rafraichirListeFilms();

    // Init les 3 boutons (Ajouter, Modifier, Annuler)
    initButtons();
}

/* ---------------------------------------------------
   Rafraîchit la liste de tous les films, 
   et affiche le premier ou le film sélectionné
--------------------------------------------------- */
async function rafraichirListeFilms(): Promise<void> {
    const container = document.querySelector('.films__listFilms');
    if (!container) return;

    container.innerHTML = '';

    // Charger les films
    const films = await DataControllerIntranet.allFilms();

    // Construire les cards
    films.forEach((film) => {
        const card = buildFilmCard(film);
        container.appendChild(card);
    });

    // Sélection
    if (films.length > 0) {
        filmSelectedList = films[0];
        afficherDetailFilm(filmSelectedList);
    } else {
        // plus de film => effacer detail
        effacerDetailFilm();
    }
}

/* ---------------------------------------------------
   Construction d'une card
--------------------------------------------------- */
function buildFilmCard(film: Film): HTMLDivElement {
    const divCard = document.createElement('div');
    divCard.classList.add('listFilms__simpleCard');

    const img = document.createElement('img');
    img.src = `assets/static/${film.imageFilm128 ?? ''}`;
    img.alt = 'Affiche';
    img.classList.add('simpleCard__affiche-img');

    const detailDiv = document.createElement('div');
    detailDiv.classList.add('simpleCard__detail');

    // Titre
    const pTitre = document.createElement('p');
    pTitre.classList.add('simpleCard__detail-titre-p');
    pTitre.textContent = film.titleFilm ?? 'Sans Titre';

    // Coup de coeur + note
    const evaluationDiv = document.createElement('div');
    evaluationDiv.classList.add('simpleCard__evaluation');
    if (film.isCoupDeCoeur) {
        const cdcDiv = document.createElement('div');
        cdcDiv.classList.add('evaluation__coupdecoeur');
        const pCdc = document.createElement('p');
        pCdc.classList.add('evaluation__coupdecoeur-p');
        pCdc.textContent = 'Coup de coeur';
        const imgCdc = document.createElement('img');
        imgCdc.src = 'assets/heart.svg';
        imgCdc.alt = 'Coeur';
        imgCdc.classList.add('evaluation__coupdecoeur-img');
        cdcDiv.append(pCdc, imgCdc);
        evaluationDiv.appendChild(cdcDiv);
    }
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('evaluation__note');
    const pNote = document.createElement('p');
    pNote.classList.add('evaluation__note-p');
    pNote.textContent = `Avis : ${film.note ?? 0} / 5`;
    noteDiv.appendChild(pNote);
    evaluationDiv.appendChild(noteDiv);

    // Pitch
    const pPitch = document.createElement('p');
    pPitch.classList.add('simpleCard__detail-pitch-p');
    pPitch.textContent = film.filmPitch ?? '';

    detailDiv.append(pTitre, evaluationDiv, pPitch);
    divCard.append(img, detailDiv);

    // Clic -> détail
    divCard.addEventListener('click', async () => {
        console.log("filmId selectionne = ", film.id)
        filmSelectedList = film;
        await afficherDetailFilm(film);
    });

    return divCard;
}

/* ---------------------------------------------------
   Affichage du détail d'un film dans la partie droite
--------------------------------------------------- */
async function afficherDetailFilm(film: Film) {
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail) return;

    // Affiches
    const afficheSmall = document.getElementById('affiche-small') as HTMLImageElement | null;
    if (afficheSmall) {
        afficheSmall.src = `assets/static/${film.imageFilm128 || 'placeholder128.jpg'}`;
    }

    const afficheLarge = document.getElementById('affiche-large') as HTMLImageElement | null;
    if (afficheLarge) {
        afficheLarge.src = `assets/static/${film.imageFilm1024 || 'placeholder1024.jpg'}`;
    }

    // Titre
    const nomFilm = document.getElementById('titleFilm');
    if (nomFilm) nomFilm.textContent = film.titleFilm ?? '';

    // Genres
    const genreFilm = document.getElementById('genreArray');
    if (genreFilm) genreFilm.textContent = film.genreArray ?? '';

    // Réalisateur
    const realisateurFilm = document.getElementById('filmAuthor');
    if (realisateurFilm) realisateurFilm.textContent = film.filmAuthor ?? '';

    // Durée
    const dureeFilm = document.getElementById('duration');
    if (dureeFilm) dureeFilm.textContent = film.duration ?? '';

    // Pitch
    const pitchFilm = document.getElementById('filmPitch');
    if (pitchFilm) pitchFilm.textContent = film.filmPitch ?? '';

    // Distribution
    const distributionFilm = document.getElementById('filmDistribution');
    if (distributionFilm) distributionFilm.textContent = film.filmDistribution ?? '';

    // Lien BO
    const linkBOFilm = document.getElementById('linkBO');
    if (linkBOFilm) linkBOFilm.textContent = film.linkBO ?? '';

    // Catégorie
    const categoriePublic = containerDetail.querySelector('#title__filter-dropdown-button-genre');
    if (categoriePublic) {
        categoriePublic.innerHTML = `${film.categorySeeing ?? 'TP'}<span class="chevron">▼</span>`;
    }

    // Coup de coeur
    const coupDeCoeurCheckbox = containerDetail.querySelector('#coupCoeur') as HTMLInputElement | null;
    if (coupDeCoeurCheckbox) {
        coupDeCoeurCheckbox.checked = film.isCoupDeCoeur ?? false;
    }

    // Description
    const descriptionFilm = document.getElementById('filmDescription');
    if (descriptionFilm) descriptionFilm.textContent = film.filmDescription ?? '';

    console.log("Détail affiché pour " + (film.titleFilm ?? ''));
}

function effacerDetailFilm() {
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail) return;
    // ex. vider le contenu
    // ...
}

/* ---------------------------------------------------
   Gestion des boutons (Ajouter, Modifier, Annuler)
--------------------------------------------------- */
function initButtons() {
    const btnAdd = document.getElementById("title__right-button-Ajouter") as HTMLButtonElement | null;
    const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
    const btnCancel = document.getElementById("title__right-button-Annuler") as HTMLButtonElement | null;
    if (!btnAdd || !btnEdit || !btnCancel) {
        console.error("Missing one of the action buttons in .right__actions");
        return;
    }

    // Initially
    btnAdd.style.display = "inline-block";
    btnEdit.style.display = "inline-block";
    btnCancel.style.display = "none";

    btnAdd.addEventListener('click', enterCreateMode);
    btnEdit.addEventListener('click', async () => await onClickEditOrSave());
    btnCancel.addEventListener('click', onClickCancelEdit);
}

/**
 * On clique sur "Ajouter un film"
 */
function enterCreateMode() {
    isCreatingMode = true;
    isEditingMode = true;
    selectedFile128 = null;
    selectedFile1024 = null;

    fillFormWithFilm(new Film({}));

    showButtonsForEdit(true);

    const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
    if (btnEdit) {
        btnEdit.textContent = "Enregistrer";
    }
}

/**
 * Montre ou cache les 3 boutons selon si on est en mode edit ou pas
 */
function showButtonsForEdit(isEdit: boolean) {
    const btnAdd = document.getElementById("title__right-button-Ajouter") as HTMLButtonElement | null;
    const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
    const btnCancel = document.getElementById("title__right-button-Annuler") as HTMLButtonElement | null;
    if (!btnAdd || !btnEdit || !btnCancel) return;

    if (isEdit) {
        btnAdd.style.display = "none";
        btnCancel.style.display = "inline-block";
        btnEdit.textContent = "Enregistrer";
    } else {
        btnAdd.style.display = "inline-block";
        btnCancel.style.display = "none";
        btnEdit.textContent = "Modifier";
    }
}

/**
 * On clique sur "Modifier" ou "Enregistrer"
 */
async function onClickEditOrSave() {
    if (!isEditingMode) {
        // => on démarre l'édition
        isEditingMode = true;
        isCreatingMode = false;
        showButtonsForEdit(true);

        setFormEditable(true);  // rendre les champs éditables

        const btnEdit = document.getElementById("title__right-button-Modifier") as HTMLButtonElement | null;
        if (btnEdit) btnEdit.textContent = "Enregistrer";
    } else {
        // => on est en train d'éditer => on veut enregistrer
        await onSaveFilm();
    }
}

/**
 * On clique sur "Annuler"
 */
function onClickCancelEdit() {
    if (!isEditingMode) return;
    isEditingMode = false;
    isCreatingMode = false;
    selectedFile128 = null;
    selectedFile1024 = null;

    showButtonsForEdit(false);

    // Revenir en lecture seule
    setFormEditable(false);

    // revert
    const filmId = dataController.selectedFilmUUID;
    if (filmId) {
        filmsSelectApi(filmId)
            .then((f) => fillFormWithFilm(f))
            .catch((err) => console.error(err));
    } else {
        // rien
        effacerDetailFilm();
    }
}

/**
 * Enregistrement du film (création ou mise à jour)
 */
async function onSaveFilm() {
    const film = buildFilmFromForm();
    if (!film) return;

    try {
        const result = await DataControllerIntranet.createOrUpdateFilm(film);
        if (result) {
            if (isCreatingMode) {
                // Creation
                console.log("Film created => id=", film.id);

                if (selectedFile128) {
                    await createAfficheApi(film.id, selectedFile128, 128, selectedFile128.type);
                }
                if (selectedFile1024) {
                    await createAfficheApi(film.id, selectedFile1024, 1024, selectedFile1024.type);
                }
                alert("Film créé avec succès");

            } else {
                // Modification
                console.log("Film updated => id=", film.id);

                if (selectedFile128) {
                    await updateAfficheApi(film.id, selectedFile128, 128, selectedFile128.type);
                }
                if (selectedFile1024) {
                    await updateAfficheApi(film.id, selectedFile1024, 1024, selectedFile1024.type);
                }
                alert("Film mis à jour avec succès");
            }
        } else {
            throw new Error("Erreur: dans la création ou mise à jour de film")
        }

        // On refresh la liste
        await rafraichirListeFilms();

    } catch (err) {
        console.error("Erreur save film =>", err);
        alert("Erreur => " + err);

    } finally {
        isEditingMode = false;
        isCreatingMode = false;
        selectedFile128 = null;
        selectedFile1024 = null;
        showButtonsForEdit(false);
        // On repasse en lecture seule
        setFormEditable(false);
    }
}

/**
 * Construit un Film à partir des champs (DOM) dans la div form-detailfilm
 */
function buildFilmFromForm(): Film | undefined {
    if (filmSelectedList === undefined) return undefined
    const film = filmSelectedList;

    console.log("On sauvegarde = " + film.titleFilm);
    const titleEl = document.getElementById('titleFilm');
    if (titleEl) film.titleFilm = titleEl.textContent?.trim() || '';

    const genreEl = document.getElementById('genreArray');
    if (genreEl) film.genreArray = genreEl.textContent?.trim() || '';

    const pitchEl = document.getElementById('filmPitch');
    if (pitchEl) film.filmPitch = pitchEl.textContent?.trim() || '';

    const realEl = document.getElementById('filmAuthor');
    if (realEl) film.filmAuthor = realEl.textContent?.trim() || '';

    const distEl = document.getElementById('filmDistribution');
    if (distEl) film.filmDistribution = distEl.textContent?.trim() || '';

    const descEl = document.getElementById('filmDescription');
    if (descEl) film.filmDescription = descEl.textContent?.trim() || '';

    const linkEl = document.getElementById('linkBO');
    if (linkEl) film.linkBO = linkEl.textContent?.trim() || '';

    const dureeEl = document.getElementById('duration');
    if (dureeEl) film.duration = dureeEl.textContent?.trim() || '';

    // CoupCoeur
    const cdcCheckbox = document.getElementById('coupCoeur') as HTMLInputElement | null;
    if (cdcCheckbox) film.isCoupDeCoeur = cdcCheckbox.checked;

    // Category
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if (catBtn) {
        film.categorySeeing = catBtn.textContent?.replace('▼', '').trim() || 'TP';
    }

    return film;
}

/**
 * Remplit la div form-detailfilm avec les propriétés d’un Film
 */
function fillFormWithFilm(film: Film) {
    const titleEl = document.getElementById('titleFilm');
    if (titleEl) titleEl.textContent = film.titleFilm ?? '';

    const genreEl = document.getElementById('genreArray');
    if (genreEl) genreEl.textContent = film.genreArray ?? '';

    const pitchEl = document.getElementById('filmPitch');
    if (pitchEl) pitchEl.textContent = film.filmPitch ?? '';

    const realEl = document.getElementById('filmAuthor');
    if (realEl) realEl.textContent = film.filmAuthor ?? '';

    const distEl = document.getElementById('filmDistribution');
    if (distEl) distEl.textContent = film.filmDistribution ?? '';

    const descEl = document.getElementById('filmDescription');
    if (descEl) descEl.textContent = film.filmDescription ?? '';

    const linkEl = document.getElementById('linkBO');
    if (linkEl) linkEl.textContent = film.linkBO ?? '';

    const dureeEl = document.getElementById('duration');
    if (dureeEl) dureeEl.textContent = film.duration ?? '';

    // CouCoeur
    const cdcCheckbox = document.getElementById('coupCoeur') as HTMLInputElement | null;
    if (cdcCheckbox) cdcCheckbox.checked = film.isCoupDeCoeur ?? false;

    // Category
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if (catBtn) {
        catBtn.innerHTML = `${film.categorySeeing ?? 'TP'}<span class="chevron">▼</span>`;
    }
}

// Gestions d’images => on aura deux inputs <input type="file" id="upload128"> etc.
const file128Input = document.getElementById('upload128') as HTMLInputElement | null;
file128Input?.addEventListener('change', async (evt) => {
    const file = file128Input.files?.[0];
    if (file) {
        selectedFile128 = file;
        console.log("Selected file 128 =>", file.name);
        // We enter editing mode if not already
        if (!isEditingMode) await onClickEditOrSave();
    }
});

const file1024Input = document.getElementById('upload1024') as HTMLInputElement | null;
file1024Input?.addEventListener('change', async (evt) => {
    const file = file1024Input.files?.[0];
    if (file) {
        selectedFile1024 = file;
        console.log("Selected file 1024 =>", file.name);
        if (!isEditingMode) await onClickEditOrSave();
    }
});

function setFormEditable(editable: boolean) {
    const fieldIds = [
        'titleFilm',
        'genreArray',
        'filmAuthor',
        'duration',
        'filmPitch',
        'filmDistribution',
        'linkBO',
        'filmDescription'
    ];
    fieldIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            (el as HTMLElement).contentEditable = editable ? "true" : "false";
            // Vous pouvez aussi modifier le style si besoin : 
            // el.style.border = editable ? "1px solid #ccc" : "none";
            // etc.
        }
    });
}