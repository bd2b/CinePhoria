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
import { formatDateLocalYYYYMMDD, imageFilm, dateProchainMercredi } from './Helpers.js';
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
        // Initialiser les inputs de fichier
        initInputFile();
        setFormEditable(false);
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
            fillFormWithFilm(filmSelectedList);
        }
        else {
            // plus de film => effacer detail
            effacerDetailFilm();
        }
        if (filmSelectedList) {
            const selectedCard = [...container.querySelectorAll('.listFilms__simpleCard')]
                .find((card) => { var _a, _b; return (_a = card.textContent) === null || _a === void 0 ? void 0 : _a.includes((_b = filmSelectedList === null || filmSelectedList === void 0 ? void 0 : filmSelectedList.titleFilm) !== null && _b !== void 0 ? _b : ''); });
            if (selectedCard) {
                selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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
    img.src = imageFilm((_a = film.imageFilm1024) !== null && _a !== void 0 ? _a : '');
    // img.src = `assets/static/${film.imageFilm128 ?? ''}`;
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
        fillFormWithFilm(film);
    }));
    if (!film.isActiveForNewSeances) {
        // Le film n'est pas selectionnable, on met la vignette en gris
        img.classList.add('simpleCard__affiche-img--disabled');
        divCard.classList.add('listFilms__simpleCard--disabled');
    }
    else {
        img.classList.remove('simpleCard__affiche-img--disabled');
        divCard.classList.remove('listFilms__simpleCard--disabled');
    }
    return divCard;
}
function effacerDetailFilm() {
    const containerDetail = document.querySelector('.films__detailFilm');
    if (!containerDetail)
        return;
    // ex. vider le contenu
    // ...
}
/* ---------------------------------------------------
   initialisation des controles de gestion des images d'affiche
--------------------------------------------------- */
function initInputFile() {
    // Gestions d’images => on aura deux inputs <input type="file" id="upload128"> etc.
    const file128Input = document.getElementById('upload128');
    if (file128Input)
        file128Input.value = '';
    file128Input === null || file128Input === void 0 ? void 0 : file128Input.removeEventListener('change', (evt) => __awaiter(this, void 0, void 0, function* () { }));
    file128Input === null || file128Input === void 0 ? void 0 : file128Input.addEventListener('change', (evt) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const file = (_a = file128Input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
            alert('Seuls les fichiers JPEG ou PNG sont autorisés.');
            return;
        }
        if (file) {
            selectedFile128 = file;
            // We enter editing mode if not already
            // if (!isEditingMode) await onClickEditOrSave();
            // Affiches
            const afficheSmall = document.getElementById('affiche-small');
            if (afficheSmall) {
                afficheSmall.src = URL.createObjectURL(file);
            }
        }
    }));
    const file1024Input = document.getElementById('upload1024');
    if (file1024Input)
        file1024Input.value = '';
    file1024Input === null || file1024Input === void 0 ? void 0 : file1024Input.removeEventListener('change', (evt) => __awaiter(this, void 0, void 0, function* () { }));
    file1024Input === null || file1024Input === void 0 ? void 0 : file1024Input.addEventListener('change', (evt) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const file = (_a = file1024Input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
            alert('Seuls les fichiers JPEG ou PNG sont autorisés.');
            return;
        }
        if (file) {
            selectedFile1024 = file;
            console.log("Selected file 1024 =>", file.name);
            // if (!isEditingMode) await onClickEditOrSave();
            const afficheLarge = document.getElementById('affiche-large');
            if (afficheLarge) {
                afficheLarge.src = URL.createObjectURL(file);
                ;
            }
        }
    }));
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
    btnAdd.removeEventListener('click', () => { });
    btnAdd.addEventListener('click', enterCreateMode);
    btnEdit.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    btnEdit.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield onClickEditOrSave(); }));
    btnCancel.removeEventListener('click', () => __awaiter(this, void 0, void 0, function* () { }));
    btnCancel.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield onClickCancelEdit(); }));
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
    setFormEditable(true); // rendre les champs éditables
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
        initListen(true);
        btnEdit.classList.add('inactif');
        btnEdit.disabled = true;
    }
    else {
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
            yield onSaveFilm();
        }
    });
}
/**
 * On clique sur "Annuler"
 */
function onClickCancelEdit() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield filmsSelectApi(filmId)
                .then((f) => fillFormWithFilm(f))
                .catch((err) => console.error(err));
        }
        else {
            // rien
            effacerDetailFilm();
        }
    });
}
/**
 * Fonction d'écouteur sur les champs de saisie
 */
function initListen(init) {
    const requiredNamedField = ['titleFilm', 'genreArray', 'duration', 'linkBO', 'note',
        'filmDescription', 'filmAuthor', 'filmDistribution', 'filmPitch'];
    requiredNamedField.forEach(id => {
        const el = document.getElementById(id);
        if (el instanceof HTMLInputElement || el instanceof HTMLDivElement) {
            if (init) {
                el.addEventListener('input', updateSaveButtonState);
                el.addEventListener('blur', updateSaveButtonState);
            }
            else {
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
function onSaveFilm() {
    return __awaiter(this, void 0, void 0, function* () {
        const film = buildFilmFromForm();
        if (!film)
            return;
        try {
            let message = "";
            if (isCreatingMode) {
                // Creation
                console.log("Film created => id=", film.id);
                // La date de sortie est le prochain mercredi
                film.dateSortieCinePhoria = formatDateLocalYYYYMMDD(dateProchainMercredi());
                if (selectedFile128) {
                    film.imageFilm128 = (film === null || film === void 0 ? void 0 : film.id) + "128";
                    yield createAfficheApi(film.imageFilm128, selectedFile128, 128, selectedFile128.type);
                }
                if (selectedFile1024) {
                    film.imageFilm1024 = (film === null || film === void 0 ? void 0 : film.id) + "1024";
                    yield createAfficheApi(film.imageFilm1024, selectedFile1024, 1024, selectedFile1024.type);
                }
                message = "Film créé avec succès";
            }
            else {
                // Modification
                console.log("Film updated => id=", film.id);
                if (selectedFile128) {
                    if (/^\d+-128\.jpg$/.test(film.imageFilm128)) {
                        // On avait un fichier jpg initialisé par le script d'initialisation
                        // donc si on met un nouveau fichier il faut créer une affiche dans mongo
                        film.imageFilm128 = (film === null || film === void 0 ? void 0 : film.id) + "128";
                        yield createAfficheApi(film.imageFilm128, selectedFile128, 128, selectedFile128.type);
                    }
                    else {
                        yield updateAfficheApi(film.imageFilm128, selectedFile128, 128, selectedFile128.type);
                    }
                }
                if (selectedFile1024) {
                    if (/^\d+-1024\.jpg$/.test(film.imageFilm1024)) {
                        // On avait un fichier jpg initialisé par le script d'initialisation
                        // donc si on met un nouveau fichier il faut créer une affiche dans mongo
                        film.imageFilm1024 = (film === null || film === void 0 ? void 0 : film.id) + "1024";
                        yield createAfficheApi(film.imageFilm1024, selectedFile1024, 1024, selectedFile1024.type);
                    }
                    else {
                        yield updateAfficheApi(film.imageFilm1024, selectedFile1024, 1024, selectedFile1024.type);
                    }
                }
                message = "Film mis à jour avec succès";
            }
            const result = yield DataControllerIntranet.createOrUpdateFilm(film);
            if (!result)
                throw new Error("Erreur: dans la création ou mise à jour de film");
            alert(message);
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
            // On réinitialise le contenu en se positionnant sur le film qu'on vient de gérer
            filmSelectedList = film;
            // Rafraîchir la liste de tous les films
            yield rafraichirListeFilms();
            // Initialiser les inputs de fichier
            initInputFile();
            // Afficher le film créé ou modifié en mémorisant qu'il est selectionné
            // fillFormWithFilm(film);
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
    // isActiveForNewSeances
    const afnsCheckbox = document.getElementById('isActiveForNewSeances');
    if (afnsCheckbox)
        film.isActiveForNewSeances = afnsCheckbox.checked;
    return film;
}
/**
 * Affiche un film dans le formulaire
 */
function fillFormWithFilm(film) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // Affiches
    const afficheSmall = document.getElementById('affiche-small');
    if (afficheSmall) {
        // afficheSmall.src = `assets/static/${film.imageFilm128 || 'placeholder128.jpg'}`;
        afficheSmall.src = film.imageFilm128 ? imageFilm(film.imageFilm128) : 'https://dummyimage.com/128x128/DAA520/000';
    }
    const afficheLarge = document.getElementById('affiche-large');
    if (afficheLarge) {
        afficheLarge.src = film.imageFilm1024 ? imageFilm(film.imageFilm1024) : 'https://dummyimage.com/1024x1024/DAA520/000';
    }
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
    // Gestion ouverture/fermeture du dropdown
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    const dropdownContent = document.querySelector('.title__filter-button-drowdown-content');
    if (catBtn && dropdownContent) {
        catBtn.innerHTML = `${(_k = film.categorySeeing) !== null && _k !== void 0 ? _k : 'TP'}<span class="chevron">▼</span>`;
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
            item.removeEventListener('click', (event) => { });
            item.addEventListener('click', (event) => {
                if (catBtn.disabled)
                    return; // ignore si désactivé
                console.log("listener ", event.target.textContent || 'TP');
                event.preventDefault();
                const selection = event.target.textContent || 'TP';
                catBtn.innerHTML = `${selection}<span class="chevron">▼</span>`;
                dropdownContent.classList.remove('show');
                updateSaveButtonState();
            });
        });
    }
    else {
        console.error("Pas de dropdown");
    }
    // isActiveForNewSeances
    const afnsCheckbox = document.getElementById('isActiveForNewSeances');
    if (afnsCheckbox)
        afnsCheckbox.checked = (_l = film.isActiveForNewSeances) !== null && _l !== void 0 ? _l : false;
    // Ajouter des écouteur pour le changement des checkbox
    cdcCheckbox === null || cdcCheckbox === void 0 ? void 0 : cdcCheckbox.addEventListener('change', updateSaveButtonState);
    afnsCheckbox === null || afnsCheckbox === void 0 ? void 0 : afnsCheckbox.addEventListener('change', updateSaveButtonState);
}
/**
 * Rend éditable formulaire
 */
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
            el.style.border = editable ? "1px solid #000" : "none";
            el.style.background = editable ? "rgba(255, 215, 0, 0.1)" : "#FFF";
        }
    });
    document.getElementById('upload128').hidden = !editable; // masquer = editable;
    document.getElementById('upload1024').hidden = !editable; // masquer = editable;
    ['isActiveForNewSeances', 'coupCoeur'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = !editable;
        }
    });
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if (catBtn) {
        if (editable) {
            catBtn.classList.remove('inactif');
            catBtn.disabled = false;
        }
        else {
            catBtn.classList.add('inactif');
            catBtn.disabled = true;
        }
    }
    const divList = document.getElementById("title__filter-listcategorie");
    if (divList) {
    }
}
function isFormValid() {
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
        if (el)
            return (el === null || el === void 0 ? void 0 : el.innerText.trim().length) > 0;
    });
}
function isFormModified() {
    if (!filmSelectedList)
        return false;
    const isDifferent = (id, value) => {
        const el = document.getElementById(id);
        return (el === null || el === void 0 ? void 0 : el.innerText.trim()) !== (value || '');
    };
    if (isDifferent('titleFilm', filmSelectedList.titleFilm))
        return true;
    if (isDifferent('genreArray', filmSelectedList.genreArray))
        return true;
    if (isDifferent('filmAuthor', filmSelectedList.filmAuthor))
        return true;
    if (isDifferent('duration', filmSelectedList.duration))
        return true;
    if (isDifferent('filmDistribution', filmSelectedList.filmDistribution))
        return true;
    if (isDifferent('linkBO', filmSelectedList.linkBO))
        return true;
    if (isDifferent('filmDescription', filmSelectedList.filmDescription))
        return true;
    if (isDifferent('filmPitch', filmSelectedList.filmPitch))
        return true;
    const catBtn = document.getElementById('title__filter-dropdown-button-genre');
    if ((catBtn === null || catBtn === void 0 ? void 0 : catBtn.innerText.trim().split('▼')[0].trim()) !== (filmSelectedList.categorySeeing || 'TP'))
        return true;
    const coupCoeur = document.getElementById('coupCoeur');
    if ((coupCoeur === null || coupCoeur === void 0 ? void 0 : coupCoeur.checked) !== !!filmSelectedList.isCoupDeCoeur)
        return true;
    const actifSeance = document.getElementById('isActiveForNewSeances');
    if ((actifSeance === null || actifSeance === void 0 ? void 0 : actifSeance.checked) !== !!filmSelectedList.isActiveForNewSeances)
        return true;
    return false;
}
function updateSaveButtonState() {
    const btnSave = document.getElementById('title__right-button-Modifier');
    if (!btnSave)
        return;
    btnSave.disabled = !(isFormValid() && isFormModified());
    btnSave.classList.toggle('inactif', btnSave.disabled);
}
