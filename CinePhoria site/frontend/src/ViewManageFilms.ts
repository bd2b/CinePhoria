import { dataController } from './DataController.js';
import { DataControllerIntranet } from './DataControllerIntranet.js';

import { formatDateLocalYYYYMMDD, imageFilm, dateProchainMercredi } from './Helpers.js';
import { Film } from './shared-models/Film.js';

import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { filmsSelectApi, createAfficheApi, updateAfficheApi } from './NetworkController.js';


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

    // Initialiser les inputs de fichier
    initInputFile();

    setFormEditable(false);
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
        fillFormWithFilm(filmSelectedList);
    } else {
        // plus de film => effacer detail
        effacerDetailFilm();
    }
    if (filmSelectedList) {
        const selectedCard = [...container.querySelectorAll('.listFilms__simpleCard')]
            .find((card) => card.textContent?.includes(filmSelectedList?.titleFilm ?? ''));

        if (selectedCard) {
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

/* ---------------------------------------------------
   Construction d'une card
--------------------------------------------------- */
function buildFilmCard(film: Film): HTMLDivElement {
    const divCard = document.createElement('div');
    divCard.classList.add('listFilms__simpleCard');

    const img = document.createElement('img');
    img.src = imageFilm(film.imageFilm1024 ?? '');
    // img.src = `assets/static/${film.imageFilm128 ?? ''}`;
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
        fillFormWithFilm(film);
    });

    if (!film.isActiveForNewSeances) {
        // Le film n'est pas selectionnable, on met la vignette en gris
        img.classList.add('simpleCard__affiche-img--disabled');
        divCard.classList.add('listFilms__simpleCard--disabled');
    } else {
        img.classList.remove('simpleCard__affiche-img--disabled');
        divCard.classList.remove('listFilms__simpleCard--disabled');
    }

    return divCard;
}



function effacerDetailFilm() {
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail) return;
    // ex. vider le contenu
    // ...
}

/* ---------------------------------------------------
   initialisation des controles de gestion des images d'affiche
--------------------------------------------------- */
function initInputFile() {
    // Gestions d’images => on aura deux inputs <input type="file" id="upload128"> etc.
    const file128Input = document.getElementById('upload128') as HTMLInputElement | null;
    if (file128Input) file128Input.value = '';
    file128Input?.removeEventListener('change', async (evt) => { });
    file128Input?.addEventListener('change', async (evt) => {
        const file = file128Input.files?.[0];
        if (!file!.type.startsWith('image/jpeg') && !file!.type.startsWith('image/png')) {
            alert('Seuls les fichiers JPEG ou PNG sont autorisés.');
            return;
        }
        if (file) {
            selectedFile128 = file;
            // We enter editing mode if not already
            // if (!isEditingMode) await onClickEditOrSave();

            // Affiches
            const afficheSmall = document.getElementById('affiche-small') as HTMLImageElement | null;
            if (afficheSmall) {
                afficheSmall.src = URL.createObjectURL(file);
            }
        }

    });

    const file1024Input = document.getElementById('upload1024') as HTMLInputElement | null;
    if (file1024Input) file1024Input.value = '';
    file1024Input?.removeEventListener('change', async (evt) => { });
    file1024Input?.addEventListener('change', async (evt) => {
        const file = file1024Input.files?.[0];
        if (!file!.type.startsWith('image/jpeg') && !file!.type.startsWith('image/png')) {
            alert('Seuls les fichiers JPEG ou PNG sont autorisés.');
            return;
        }
        if (file) {
            selectedFile1024 = file;
            console.log("Selected file 1024 =>", file.name);
            // if (!isEditingMode) await onClickEditOrSave();

            const afficheLarge = document.getElementById('affiche-large') as HTMLImageElement | null;
            if (afficheLarge) {
                afficheLarge.src = URL.createObjectURL(file);;
            }
        }
    });
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

    btnAdd.removeEventListener('click', () => { });
    btnAdd.addEventListener('click', enterCreateMode);

    btnEdit.removeEventListener('click', async () => { });
    btnEdit.addEventListener('click', async () => await onClickEditOrSave());

    btnCancel.removeEventListener('click', async () => { });
    btnCancel.addEventListener('click', async () => await onClickCancelEdit());
}

/**
 * On clique sur "Ajouter un film"
 */
function enterCreateMode() {
    isCreatingMode = true;
    isEditingMode = true;
    selectedFile128 = null;
    selectedFile1024 = null;

    const newFilm = new Film({ id: crypto.randomUUID() });
    filmSelectedList = newFilm;
    fillFormWithFilm(newFilm);

    showButtonsForEdit(true);
    setFormEditable(true);  // rendre les champs éditables

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
        initListen(true);
        btnEdit.classList.add('inactif');
        btnEdit.disabled = true;
    } else {
        btnAdd.style.display = "inline-block";
        btnCancel.style.display = "none";
        btnEdit.textContent = "Modifier";
        initListen(false);
        btnEdit.classList.remove('inactif');
        btnEdit.disabled = false;
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
        if (isCreatingMode && filmSelectedList) {
            // En mode création les valeurs d'image se déduisent du filmId
            filmSelectedList.imageFilm1024 = filmSelectedList?.id + "1024";
            filmSelectedList.imageFilm128 = filmSelectedList?.id + "128";
            // La date de sortie est le prochain mercredi
            filmSelectedList.dateSortieCinePhoria = formatDateLocalYYYYMMDD(dateProchainMercredi());


        }
        await onSaveFilm();
    }
}

/**
 * On clique sur "Annuler"
 */
async function onClickCancelEdit() {
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
        await filmsSelectApi(filmId)
            .then((f) => fillFormWithFilm(f))
            .catch((err) => console.error(err));
    } else {
        // rien
        effacerDetailFilm();
    }
}


/**
 * Fonction d'écouteur sur les champs de saisie
 */
function initListen(init: boolean) {
    const requiredNamedField = ['titleFilm', 'genreArray', 'duration', 'linkBO', 'note',
        'filmDescription', 'filmAuthor', 'filmDistribution', 'filmPitch'];
    requiredNamedField.forEach(id => {
        const el = document.getElementById(id);
        if (el instanceof HTMLInputElement || el instanceof HTMLDivElement) {
            if (init) {
                el.addEventListener('input', updateSaveButtonState);
                el.addEventListener('blur', updateSaveButtonState);
            } else {
                el.removeEventListener('input', updateSaveButtonState);
                el.removeEventListener('blur', updateSaveButtonState);
            }
        }
    });
}

/**
 * Enregistrement du film (création ou mise à jour)
 * Appelle la construction d'un film à partir du formulaire
 * Fait les modifications/création des affiches
 * Fait la modification/création du film
 * Finally réinitialise la page
 */
async function onSaveFilm() {
    const film = buildFilmFromForm();
    if (!film) return;

    try {
        if (isCreatingMode) {
            // Creation
            console.log("Film created => id=", film.id);

            if (selectedFile128) {
                await createAfficheApi(film.imageFilm128!, selectedFile128, 128, selectedFile128.type);
            }
            if (selectedFile1024) {
                await createAfficheApi(film.imageFilm1024!, selectedFile1024, 1024, selectedFile1024.type);
            }
            alert("Film créé avec succès");

        } else {
            // Modification
            console.log("Film updated => id=", film.id);

            if (selectedFile128) {
                await updateAfficheApi(film.imageFilm128!, selectedFile128, 128, selectedFile128.type);
            }
            if (selectedFile1024) {
                await updateAfficheApi(film.imageFilm1024!, selectedFile1024, 1024, selectedFile1024.type);
            }
            alert("Film mis à jour avec succès");
        }
        const result = await DataControllerIntranet.createOrUpdateFilm(film);
        if (!result) throw new Error("Erreur: dans la création ou mise à jour de film")

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
        // On réinitialise le contenu en se positionnant sur le film qu'on vient de gérer
        filmSelectedList = film;

        // Rafraîchir la liste de tous les films
        await rafraichirListeFilms();

        // Initialiser les inputs de fichier
        initInputFile();

        // Afficher le film créé ou modifié en mémorisant qu'il est selectionné
        // fillFormWithFilm(film);

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

    // isActiveForNewSeances
    const afnsCheckbox = document.getElementById('isActiveForNewSeances') as HTMLInputElement | null;
    if (afnsCheckbox) film.isActiveForNewSeances = afnsCheckbox.checked;


    return film;
}

/**
 * Affiche un film dans le formulaire
 */
function fillFormWithFilm(film: Film) {

    // Affiches
    const afficheSmall = document.getElementById('affiche-small') as HTMLImageElement | null;
    if (afficheSmall) {
        // afficheSmall.src = `assets/static/${film.imageFilm128 || 'placeholder128.jpg'}`;
        afficheSmall.src = film.imageFilm128 ? imageFilm(film.imageFilm128) : 'https://dummyimage.com/128x128/DAA520/000'
    }

    const afficheLarge = document.getElementById('affiche-large') as HTMLImageElement | null;
    if (afficheLarge) {
        afficheLarge.src = film.imageFilm1024 ? imageFilm(film.imageFilm1024) : 'https://dummyimage.com/1024x1024/DAA520/000'
    }

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

    // Gestion ouverture/fermeture du dropdown
    const catBtn = document.getElementById('title__filter-dropdown-button-genre') as HTMLButtonElement;
    const dropdownContent = document.querySelector('.title__filter-button-drowdown-content');

    if (catBtn && dropdownContent) {

        catBtn.innerHTML = `${film.categorySeeing ?? 'TP'}<span class="chevron">▼</span>`;

        catBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // Fermeture quand on clique ailleurs sur la page
        document.addEventListener('click', () => {
            dropdownContent.classList.remove('show');
        });

        // Sélection d’un élément
        dropdownContent.querySelectorAll('.categorie-item').forEach((item) => {
            item.removeEventListener('click', (event) => { })
            item.addEventListener('click', (event) => {
                if (catBtn.disabled) return; // ignore si désactivé
                console.log("listener ", (event.target as HTMLElement).textContent || 'TP');
                event.preventDefault();
                const selection = (event.target as HTMLElement).textContent || 'TP';
                catBtn.innerHTML = `${selection}<span class="chevron">▼</span>`;
                dropdownContent.classList.remove('show');
                updateSaveButtonState();
            });
        });
    } else {
        console.error("Pas de dropdown");
    }

    // isActiveForNewSeances
    const afnsCheckbox = document.getElementById('isActiveForNewSeances') as HTMLInputElement | null;
    if (afnsCheckbox) afnsCheckbox.checked = film.isActiveForNewSeances ?? false;

    // Ajouter des écouteur pour le changement des checkbox
    cdcCheckbox?.addEventListener('change', updateSaveButtonState);
    afnsCheckbox?.addEventListener('change', updateSaveButtonState);

}

/**
 * Rend éditable formulaire
 */
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

            el.style.border = editable ? "1px solid #000" : "none";
            el.style.background = editable ? "rgba(255, 215, 0, 0.1)" : "#FFF";
        }
    });

    document.getElementById('upload128')!.hidden = !editable; // masquer = editable;
    document.getElementById('upload1024')!.hidden = !editable; // masquer = editable;

    ['isActiveForNewSeances', 'coupCoeur'].forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) {
            el.disabled = !editable;
        }

    })

    const catBtn = document.getElementById('title__filter-dropdown-button-genre') as HTMLButtonElement;
    if (catBtn) {
        if (editable) {
            catBtn.classList.remove('inactif');
            catBtn.disabled = false;
        } else {
            catBtn.classList.add('inactif');
            catBtn.disabled = true;
        }
    }
    const divList = document.getElementById("title__filter-listcategorie") as HTMLDivElement;
    if (divList) {

    }


}

function isFormValid(): boolean {
    const requiredFields = [
        'titleFilm',
        'genreArray',
        'filmAuthor',
        'duration',
        'filmDistribution',
        'linkBO',
        'filmDescription'
    ];

    return requiredFields.every(id => {
        const el = document.getElementById(id);
        if (el) return el?.innerText.trim().length > 0;
    });
}

function isFormModified(): boolean {
    if (!filmSelectedList) return false;

    const isDifferent = (id: string, value: string | undefined) => {
        const el = document.getElementById(id);
        return el?.innerText.trim() !== (value || '');
    };

    if (isDifferent('titleFilm', filmSelectedList.titleFilm)) return true;
    if (isDifferent('genreArray', filmSelectedList.genreArray)) return true;
    if (isDifferent('filmAuthor', filmSelectedList.filmAuthor)) return true;
    if (isDifferent('duration', filmSelectedList.duration)) return true;
    if (isDifferent('filmDistribution', filmSelectedList.filmDistribution)) return true;
    if (isDifferent('linkBO', filmSelectedList.linkBO)) return true;
    if (isDifferent('filmDescription', filmSelectedList.filmDescription)) return true;
    if (isDifferent('filmPitch', filmSelectedList.filmPitch)) return true;

    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if (catBtn?.innerText.trim().split('▼')[0].trim() !== (filmSelectedList.categorySeeing || 'TP')) return true;

    const coupCoeur = document.getElementById('coupCoeur') as HTMLInputElement;
    if (coupCoeur?.checked !== !!filmSelectedList.isCoupDeCoeur) return true;

    const actifSeance = document.getElementById('isActiveForNewSeances') as HTMLInputElement;
    if (actifSeance?.checked !== !!filmSelectedList.isActiveForNewSeances) return true;

    return false;
}

function updateSaveButtonState() {
    const btnSave = document.getElementById('title__right-button-Modifier') as HTMLButtonElement;
    if (!btnSave) return;
    btnSave.disabled = !(isFormValid() && isFormModified());
    btnSave.classList.toggle('inactif', btnSave.disabled);
}