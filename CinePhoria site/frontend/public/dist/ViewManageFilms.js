var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dataController } from './DataController.js';
import { DataControllerIntranet } from './DataControllerIntranet.js';
import { Film } from './shared-models/Film.js';
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { filmsSelectApi, createAfficheApi, updateAfficheApi } from './NetworkController.js';
// State flags
let isEditingMode = false;
let isCreatingMode = false;
// We'll store references to the selectedFile128 and selectedFile1024
let selectedFile128 = null;
let selectedFile1024 = null;
// Film selectionne
let filmSelectedList;
/**
 * Entrée principale du module
 */
export function onLoadManageFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadManageFilms");
        // Charger menu et footer
        yield chargerMenu(); // Header
        yield chargerCinemaSites(); // Footer
        // Rafraîchir la liste de tous les films
        yield rafraichirListeFilms();
        // Init les 3 boutons (Ajouter, Modifier, Annuler)
        initButtons();
    });
}
/* ---------------------------------------------------
   Rafraîchit la liste de tous les films,
   et affiche le premier ou le film sélectionné
--------------------------------------------------- */
function rafraichirListeFilms() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.querySelector('.films__listFilms');
        if (!container)
            return;
        container.innerHTML = '';
        // Charger les films
        const films = yield DataControllerIntranet.allFilms();
        // Construire les cards
        films.forEach((film) => {
            const card = buildFilmCard(film);
            container.appendChild(card);
        });
        // Sélection
        if (films.length > 0) {
            filmSelectedList = films[0];
            afficherDetailFilm(filmSelectedList);
        }
        else {
            // plus de film => effacer detail
            effacerDetailFilm();
        }
    });
}
/* ---------------------------------------------------
   Construction d'une card
--------------------------------------------------- */
function buildFilmCard(film) {
    var _a, _b, _c, _d;
    const divCard = document.createElement('div');
    divCard.classList.add('listFilms__simpleCard');
    const img = document.createElement('img');
    img.src = `assets/static/${(_a = film.imageFilm128) !== null && _a !== void 0 ? _a : ''}`;
    img.alt = 'Affiche';
    img.classList.add('simpleCard__affiche-img');
    const detailDiv = document.createElement('div');
    detailDiv.classList.add('simpleCard__detail');
    // Titre
    const pTitre = document.createElement('p');
    pTitre.classList.add('simpleCard__detail-titre-p');
    pTitre.textContent = (_b = film.titleFilm) !== null && _b !== void 0 ? _b : 'Sans Titre';
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
    pNote.textContent = `Avis : ${(_c = film.note) !== null && _c !== void 0 ? _c : 0} / 5`;
    noteDiv.appendChild(pNote);
    evaluationDiv.appendChild(noteDiv);
    // Pitch
    const pPitch = document.createElement('p');
    pPitch.classList.add('simpleCard__detail-pitch-p');
    pPitch.textContent = (_d = film.filmPitch) !== null && _d !== void 0 ? _d : '';
    detailDiv.append(pTitre, evaluationDiv, pPitch);
    divCard.append(img, detailDiv);
    // Clic -> détail
    divCard.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        console.log("filmId selectionne = ", film.id);
        filmSelectedList = film;
        yield afficherDetailFilm(film);
    }));
    return divCard;
}
/* ---------------------------------------------------
   Affichage du détail d'un film dans la partie droite
--------------------------------------------------- */
function afficherDetailFilm(film) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const containerDetail = document.querySelector('.films__detailFilm');
        if (!containerDetail)
            return;
        // Affiches
        const afficheSmall = document.getElementById('affiche-small');
        if (afficheSmall) {
            afficheSmall.src = `assets/static/${film.imageFilm128 || 'placeholder128.jpg'}`;
        }
        const afficheLarge = document.getElementById('affiche-large');
        if (afficheLarge) {
            afficheLarge.src = `assets/static/${film.imageFilm1024 || 'placeholder1024.jpg'}`;
        }
        // Titre
        const nomFilm = document.getElementById('titleFilm');
        if (nomFilm)
            nomFilm.textContent = (_a = film.titleFilm) !== null && _a !== void 0 ? _a : '';
        // Genres
        const genreFilm = document.getElementById('genreArray');
        if (genreFilm)
            genreFilm.textContent = (_b = film.genreArray) !== null && _b !== void 0 ? _b : '';
        // Réalisateur
        const realisateurFilm = document.getElementById('filmAuthor');
        if (realisateurFilm)
            realisateurFilm.textContent = (_c = film.filmAuthor) !== null && _c !== void 0 ? _c : '';
        // Durée
        const dureeFilm = document.getElementById('duration');
        if (dureeFilm)
            dureeFilm.textContent = (_d = film.duration) !== null && _d !== void 0 ? _d : '';
        // Pitch
        const pitchFilm = document.getElementById('filmPitch');
        if (pitchFilm)
            pitchFilm.textContent = (_e = film.filmPitch) !== null && _e !== void 0 ? _e : '';
        // Distribution
        const distributionFilm = document.getElementById('filmDistribution');
        if (distributionFilm)
            distributionFilm.textContent = (_f = film.filmDistribution) !== null && _f !== void 0 ? _f : '';
        // Lien BO
        const linkBOFilm = document.getElementById('linkBO');
        if (linkBOFilm)
            linkBOFilm.textContent = (_g = film.linkBO) !== null && _g !== void 0 ? _g : '';
        // Catégorie
        const categoriePublic = containerDetail.querySelector('#title__filter-dropdown-button-genre');
        if (categoriePublic) {
            categoriePublic.innerHTML = `${(_h = film.categorySeeing) !== null && _h !== void 0 ? _h : 'TP'}<span class="chevron">▼</span>`;
        }
        // Coup de coeur
        const coupDeCoeurCheckbox = containerDetail.querySelector('#coupCoeur');
        if (coupDeCoeurCheckbox) {
            coupDeCoeurCheckbox.checked = (_j = film.isCoupDeCoeur) !== null && _j !== void 0 ? _j : false;
        }
        // Description
        const descriptionFilm = document.getElementById('filmDescription');
        if (descriptionFilm)
            descriptionFilm.textContent = (_k = film.filmDescription) !== null && _k !== void 0 ? _k : '';
        console.log("Détail affiché pour " + ((_l = film.titleFilm) !== null && _l !== void 0 ? _l : ''));
    });
}
function effacerDetailFilm() {
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail)
        return;
    // ex. vider le contenu
    // ...
}
/* ---------------------------------------------------
   Gestion des boutons (Ajouter, Modifier, Annuler)
--------------------------------------------------- */
function initButtons() {
    const btnAdd = document.getElementById("title__right-button-Ajouter");
    const btnEdit = document.getElementById("title__right-button-Modifier");
    const btnCancel = document.getElementById("title__right-button-Annuler");
    if (!btnAdd || !btnEdit || !btnCancel) {
        console.error("Missing one of the action buttons in .right__actions");
        return;
    }
    // Initially
    btnAdd.style.display = "inline-block";
    btnEdit.style.display = "inline-block";
    btnCancel.style.display = "none";
    btnAdd.addEventListener('click', enterCreateMode);
    btnEdit.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield onClickEditOrSave(); }));
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
    const btnEdit = document.getElementById("title__right-button-Modifier");
    if (btnEdit) {
        btnEdit.textContent = "Enregistrer";
    }
}
/**
 * Montre ou cache les 3 boutons selon si on est en mode edit ou pas
 */
function showButtonsForEdit(isEdit) {
    const btnAdd = document.getElementById("title__right-button-Ajouter");
    const btnEdit = document.getElementById("title__right-button-Modifier");
    const btnCancel = document.getElementById("title__right-button-Annuler");
    if (!btnAdd || !btnEdit || !btnCancel)
        return;
    if (isEdit) {
        btnAdd.style.display = "none";
        btnCancel.style.display = "inline-block";
        btnEdit.textContent = "Enregistrer";
    }
    else {
        btnAdd.style.display = "inline-block";
        btnCancel.style.display = "none";
        btnEdit.textContent = "Modifier";
    }
}
/**
 * On clique sur "Modifier" ou "Enregistrer"
 */
function onClickEditOrSave() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isEditingMode) {
            // => on démarre l'édition
            isEditingMode = true;
            isCreatingMode = false;
            showButtonsForEdit(true);
            setFormEditable(true); // rendre les champs éditables
            const btnEdit = document.getElementById("title__right-button-Modifier");
            if (btnEdit)
                btnEdit.textContent = "Enregistrer";
        }
        else {
            // => on est en train d'éditer => on veut enregistrer
            yield onSaveFilm();
        }
    });
}
/**
 * On clique sur "Annuler"
 */
function onClickCancelEdit() {
    if (!isEditingMode)
        return;
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
    }
    else {
        // rien
        effacerDetailFilm();
    }
}
/**
 * Enregistrement du film (création ou mise à jour)
 */
function onSaveFilm() {
    return __awaiter(this, void 0, void 0, function* () {
        const film = buildFilmFromForm();
        if (!film)
            return;
        try {
            const result = yield DataControllerIntranet.createOrUpdateFilm(film);
            if (result) {
                if (isCreatingMode) {
                    // Creation
                    console.log("Film created => id=", film.id);
                    if (selectedFile128) {
                        yield createAfficheApi(film.id, selectedFile128, 128, selectedFile128.type);
                    }
                    if (selectedFile1024) {
                        yield createAfficheApi(film.id, selectedFile1024, 1024, selectedFile1024.type);
                    }
                    alert("Film créé avec succès");
                }
                else {
                    // Modification
                    console.log("Film updated => id=", film.id);
                    if (selectedFile128) {
                        yield updateAfficheApi(film.id, selectedFile128, 128, selectedFile128.type);
                    }
                    if (selectedFile1024) {
                        yield updateAfficheApi(film.id, selectedFile1024, 1024, selectedFile1024.type);
                    }
                    alert("Film mis à jour avec succès");
                }
            }
            else {
                throw new Error("Erreur: dans la création ou mise à jour de film");
            }
            // On refresh la liste
            yield rafraichirListeFilms();
        }
        catch (err) {
            console.error("Erreur save film =>", err);
            alert("Erreur => " + err);
        }
        finally {
            isEditingMode = false;
            isCreatingMode = false;
            selectedFile128 = null;
            selectedFile1024 = null;
            showButtonsForEdit(false);
            // On repasse en lecture seule
            setFormEditable(false);
        }
    });
}
/**
 * Construit un Film à partir des champs (DOM) dans la div form-detailfilm
 */
function buildFilmFromForm() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (filmSelectedList === undefined)
        return undefined;
    const film = filmSelectedList;
    console.log("On sauvegarde = " + film.titleFilm);
    const titleEl = document.getElementById('titleFilm');
    if (titleEl)
        film.titleFilm = ((_a = titleEl.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    const genreEl = document.getElementById('genreArray');
    if (genreEl)
        film.genreArray = ((_b = genreEl.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
    const pitchEl = document.getElementById('filmPitch');
    if (pitchEl)
        film.filmPitch = ((_c = pitchEl.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
    const realEl = document.getElementById('filmAuthor');
    if (realEl)
        film.filmAuthor = ((_d = realEl.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
    const distEl = document.getElementById('filmDistribution');
    if (distEl)
        film.filmDistribution = ((_e = distEl.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
    const descEl = document.getElementById('filmDescription');
    if (descEl)
        film.filmDescription = ((_f = descEl.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
    const linkEl = document.getElementById('linkBO');
    if (linkEl)
        film.linkBO = ((_g = linkEl.textContent) === null || _g === void 0 ? void 0 : _g.trim()) || '';
    const dureeEl = document.getElementById('duration');
    if (dureeEl)
        film.duration = ((_h = dureeEl.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '';
    // CoupCoeur
    const cdcCheckbox = document.getElementById('coupCoeur');
    if (cdcCheckbox)
        film.isCoupDeCoeur = cdcCheckbox.checked;
    // Category
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if (catBtn) {
        film.categorySeeing = ((_j = catBtn.textContent) === null || _j === void 0 ? void 0 : _j.replace('▼', '').trim()) || 'TP';
    }
    return film;
}
/**
 * Remplit la div form-detailfilm avec les propriétés d’un Film
 */
function fillFormWithFilm(film) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const titleEl = document.getElementById('titleFilm');
    if (titleEl)
        titleEl.textContent = (_a = film.titleFilm) !== null && _a !== void 0 ? _a : '';
    const genreEl = document.getElementById('genreArray');
    if (genreEl)
        genreEl.textContent = (_b = film.genreArray) !== null && _b !== void 0 ? _b : '';
    const pitchEl = document.getElementById('filmPitch');
    if (pitchEl)
        pitchEl.textContent = (_c = film.filmPitch) !== null && _c !== void 0 ? _c : '';
    const realEl = document.getElementById('filmAuthor');
    if (realEl)
        realEl.textContent = (_d = film.filmAuthor) !== null && _d !== void 0 ? _d : '';
    const distEl = document.getElementById('filmDistribution');
    if (distEl)
        distEl.textContent = (_e = film.filmDistribution) !== null && _e !== void 0 ? _e : '';
    const descEl = document.getElementById('filmDescription');
    if (descEl)
        descEl.textContent = (_f = film.filmDescription) !== null && _f !== void 0 ? _f : '';
    const linkEl = document.getElementById('linkBO');
    if (linkEl)
        linkEl.textContent = (_g = film.linkBO) !== null && _g !== void 0 ? _g : '';
    const dureeEl = document.getElementById('duration');
    if (dureeEl)
        dureeEl.textContent = (_h = film.duration) !== null && _h !== void 0 ? _h : '';
    // CouCoeur
    const cdcCheckbox = document.getElementById('coupCoeur');
    if (cdcCheckbox)
        cdcCheckbox.checked = (_j = film.isCoupDeCoeur) !== null && _j !== void 0 ? _j : false;
    // Category
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if (catBtn) {
        catBtn.innerHTML = `${(_k = film.categorySeeing) !== null && _k !== void 0 ? _k : 'TP'}<span class="chevron">▼</span>`;
    }
}
// Gestions d’images => on aura deux inputs <input type="file" id="upload128"> etc.
const file128Input = document.getElementById('upload128');
file128Input === null || file128Input === void 0 ? void 0 : file128Input.addEventListener('change', (evt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = (_a = file128Input.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
        selectedFile128 = file;
        console.log("Selected file 128 =>", file.name);
        // We enter editing mode if not already
        if (!isEditingMode)
            yield onClickEditOrSave();
    }
}));
const file1024Input = document.getElementById('upload1024');
file1024Input === null || file1024Input === void 0 ? void 0 : file1024Input.addEventListener('change', (evt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const file = (_a = file1024Input.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
        selectedFile1024 = file;
        console.log("Selected file 1024 =>", file.name);
        if (!isEditingMode)
            yield onClickEditOrSave();
    }
}));
function setFormEditable(editable) {
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
            el.contentEditable = editable ? "true" : "false";
            // Vous pouvez aussi modifier le style si besoin : 
            // el.style.border = editable ? "1px solid #ccc" : "none";
            // etc.
        }
    });
}
