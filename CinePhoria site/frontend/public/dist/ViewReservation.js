"use strict";
/** Fonction de selection du cinema
 * Au premier chargement une fenetre modale permet de choisir un site, dans ce cas le cookie selectedCinema est positionné avec la valeur choisie
 * Aux chargements on recupère la valeur du cookie
 * On peut changer cette valeur via le dropdown button droit sur le titre
 */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const dropdownButtons = document.querySelectorAll('.titre__filter-dropdown-complexe');
    const dropdownContents = document.querySelectorAll('.title__filter-button-drowdown-content-complexe');
    // Fonction pour obtenir la valeur d'un cookie
    function getCookie(name) {
        var _a;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2)
            return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
    }
    // Fonction pour définir un cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()}`;
    }
    // Mettre à jour l'affichage du bouton du dropdown
    function updateDropdownDisplay(selectedCinema) {
        dropdownButtons.forEach((button) => {
            button.innerHTML = `${selectedCinema} <span class="chevron">▼</span>`;
        });
    }
    // Vérifier si le cookie 'selectedCinema' existe
    let selectedCinema = getCookie('selectedCinema');
    if (!selectedCinema) {
        selectedCinema = 'Non sélectionné'; // Valeur par défaut si aucun cinéma n'est sélectionné
        if (modal) {
            modal.classList.add('show'); // Afficher la modale si aucun cinéma n'est sélectionné
        }
    }
    // Mettre à jour l'affichage initial du dropdown
    if (selectedCinema) {
        updateDropdownDisplay(selectedCinema);
    }
    // Gestion des interactions dans tous les dropdowns
    dropdownContents.forEach((content) => {
        const links = content.querySelectorAll('a');
        links.forEach((link) => {
            link.addEventListener('click', (event) => {
                var _a;
                event.preventDefault();
                const cinema = (_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                if (cinema) {
                    setCookie('selectedCinema', cinema, 30); // Stocker dans le cookie pour 30 jours
                    selectedCinema = cinema;
                    updateDropdownDisplay(cinema); // Mettre à jour l'affichage
                    if (modal) {
                        modal.classList.remove('show'); // Fermer la modale si elle est ouverte
                    }
                    console.log(`Cinéma sélectionné : ${cinema}`);
                }
            });
        });
    });
});
