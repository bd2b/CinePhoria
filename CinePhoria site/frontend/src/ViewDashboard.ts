import { DataControllerIntranet } from './DataControllerIntranet.js';
import { ReservationStats } from './shared-models/Reservation.js';

import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
import { formatDateLocalYYYYMMDD } from './Helpers.js';

declare const Chart: any;

let selectedTitles: Set<string> = new Set();
/* ---------------------------------------------
   Palette simple (autant de couleurs que nécessaire)
----------------------------------------------*/
const COLORS = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
    '#59a14f', '#edc949', '#af7aa1', '#ff9da7'
];


/**
 * Entrée principale du module
 */
export async function onLoadDashboard() {
    console.log("=====> chargement onLoadDashboard");

     

    // Charger menu et footer
    await chargerMenu(); // Header
    await chargerCinemaSites(); // Footer

    // Mise à jour de la version
    await DataControllerIntranet.majVersion();

    // Rafraîchir la liste de tous les reservationStats
    await rafraichirDashboard();
}

/* ---------------------------------------------------
   Rafraîchit le dashboard
--------------------------------------------------- */
async function rafraichirDashboard(): Promise<void> {

    // chart
    let chart: Chart | null = null;

    // Charger les stats
    let fullStats = await DataControllerIntranet.getReservationStatsAll();
    console.log(fullStats);
    if (fullStats.length) {
        console.log('Clés du premier objet :', Object.keys(fullStats[0]));
        console.log('Valeur filmTitre =', (fullStats[0] as any).filmTitre);
    }

    // Charger les films dans un set (en filtrant les titres non vides)
    selectedTitles.clear();
    fullStats
        .filter(stat => stat.filmTitre)
        .forEach(stat => selectedTitles.add(stat.filmTitre));

    // Liste des titres de film
    const filmList = document.getElementById("dashboard__listFilms") as HTMLElement;
    filmList.innerHTML = ""; // reset

    const uniqueTitles = Array.from(
        new Set(
            fullStats
                .map((s) => s.filmTitre)
                .filter((titre): titre is string => !!titre)
        )
    ).sort((a, b) => a.localeCompare(b, "fr"));

    uniqueTitles.forEach((title) => {
        const btn = document.createElement("button");
        btn.className = "listFilms__simpleCard";
        btn.textContent = title;
        btn.classList.add("selected");
        btn.removeEventListener("click", () => { });
        btn.addEventListener("click", () => {
            toggleTitleSelection(title, btn);
            console.log("clic =", title)
            console.log(selectedTitles);
        });
        filmList.appendChild(btn);
    });

    function toggleTitleSelection(title: string, btn: HTMLButtonElement): void {
        if (selectedTitles.has(title)) {
            selectedTitles.delete(title);
            btn.classList.remove("selected");
        } else {
            selectedTitles.add(title);
            btn.classList.add("selected");
        }
        updateChart();
    }

    // Initialisation date
    const dateDiv = document.querySelector(".graph__date") as HTMLDivElement;
    if (dateDiv) dateDiv.innerHTML = "";
    let dateInput = document.createElement("input") as HTMLInputElement;
    dateDiv.classList.add('filter-jour-input');
    const todayStr = new Date().toISOString().substring(0, 10);
    dateInput.type = 'date'
    dateInput.value = todayStr;
    dateInput.removeEventListener('change', () => { });
    dateInput.addEventListener("change", () => {
        updateChart();
        construireListeJours();
    });
    dateDiv.appendChild(dateInput);

    // Affichage des jours sur lesquels il y a une donnée
    function construireListeJours(): void {

        // On calcule les dates min et max et on applique sur le champ date
        const allDates = fullStats.map((s) => s.jour).filter(Boolean).sort() as string[];

        if (allDates.length > 0) {
            const dateMinYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[0]));
            const dateMaxYYYYMMDD = formatDateLocalYYYYMMDD(new Date(allDates[allDates.length - 1]));
            dateInput.min = dateMinYYYYMMDD;
            dateInput.max = dateMaxYYYYMMDD;
        } else {
            dateInput.min = '';
            dateInput.max = '';
        }
    }

    // Initialisation du chart
    const chartContainer = document.querySelector(".graph__chart") as HTMLDivElement;
    chartContainer.innerHTML = '';            // vide l'éventuel contenu précédent
    const canvas = document.createElement('canvas');
    canvas.id = 'reservationChart';
    chartContainer.appendChild(canvas);

    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Réservations",
                    data: [],
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    /* ---------------------------------------------
    UpdateChart – reconstruction complète des jeux de données
    ----------------------------------------------*/
    function updateChart(): void {
        if (!chart) return;

        const startDate = new Date(dateInput.value);
        if (isNaN(startDate.getTime())) return;

        /* ------------------------------------------------
           1. Générer la liste continue des 7 jours
        --------------------------------------------------*/
        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            days.push(d.toISOString().substring(0, 10));      // « YYYY-MM-DD »
        }

        /* ------------------------------------------------
           2. Préparer le mapping film → [7 valeurs]
        --------------------------------------------------*/
        // Si aucun film n’est explicitement coché, on les prend tous
        const activeTitles =
            selectedTitles.size ? Array.from(selectedTitles) :
                Array.from(new Set(fullStats.map(s => s.filmTitre)));

        const datasets = activeTitles.map((title, idx) => {
            const dailyCounts = days.map(dayIso => {
                return fullStats
                    .filter(s =>
                        s.filmTitre === title &&
                        new Date(s.jour).toISOString().substring(0, 10) === dayIso
                    )
                    .reduce((sum, s) => sum + Number(s.totalPlaces), 0);
            });

            return {
                label: title,
                data: dailyCounts,
                backgroundColor: COLORS[idx % COLORS.length],
                stack: 'total'
            };
        });

        /* ------------------------------------------------
           3. Injecter dans Chart.js
        --------------------------------------------------*/
        chart.data = {
            labels: days.map(d => formatLabel(new Date(d))),
            datasets
        };

        (chart.options!.scales! as any).x = { stacked: true };
        (chart.options!.scales! as any).y = { stacked: true, beginAtZero: true };

        chart.update();
    }

    function formatLabel(d: Date): string {
        return d.toLocaleDateString("fr-FR", { weekday: "short" }); // ex: "lun."
    }

    updateChart();
    construireListeJours();
}
