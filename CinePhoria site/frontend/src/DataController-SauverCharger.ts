import { DataController } from "./DataController.js";
import { ReservationState } from "./shared-models/Reservation.js";
import { TarifQualite } from "./shared-models/Seance.js";
import { Seance } from "./shared-models/Seance.js";
import { Cinema } from "./shared-models/Cinema.js";
import { getCookie, isDifferenceGreaterThanHours } from "./Helpers.js";

export class DataControllerSauveCharge extends DataController {


    protected static KEY_GLOBAL = 'myAppState';             // Pour l’état global (reservationState, selectedFilm, etc.)
    protected static KEY_TARIFS = 'myAppTarifs';            // Pour le tarifQualite
    protected static KEY_CINEMAS = 'myAppCinemas';          // Pour la liste des Cinema
    // Pour les seances, on fera KEY_SEANCES + "_" + cinemaName => "myAppSeances_Paris", etc.
    protected static KEY_SEANCES = 'myAppSeances';


    public async sauverEtatGlobal(): Promise<void> {
        const snapshotGlobal = {
            reservationState: this._reservationState,
            filterNameCinema: this._filterNameCinema,
            selectedNameCinema: this._selectedNameCinema,
            selectedFilmUUID: this._selectedFilmUUID,
            selectedSeanceDate: this._selectedSeanceDate?.toISOString() || null,
            selectedSeanceUUID: this._selectedSeanceUUID,
            selectedUtilisateurUUID: this._selectedUtilisateurUUID,
            selectedUtilisateurMail: this._selectedUtilisateurMail,
            selectedUtilisateurDisplayName: this._selectedUtilisateurDisplayName,
            selectedReservationUUID: this._selectedReservationUUID,
            selectedReservationCinema: this._selectedReservationCinema,

        };

        const strGlobal = JSON.stringify(snapshotGlobal);
        console.log(`DataC: Taille du snapshotGlobal = ${strGlobal.length} caractères`);
        localStorage.setItem(DataControllerSauveCharge.KEY_GLOBAL, strGlobal);
    }

    public async sauverTarifs(): Promise<void> {
        if (!this._tarifQualite) return;

        const arr = this._tarifQualite; // tableau de TarifQualite
        const str = JSON.stringify(arr);
        console.log(`DataC: Sauvegarde des tarifs => taille = ${str.length}`);
        localStorage.setItem(DataControllerSauveCharge.KEY_TARIFS, str);
    }

    public async sauverCinemas(): Promise<void> {
        if (!this._Cinemas) return;

        const arr = this._Cinemas; // tableau de Cinema
        const str = JSON.stringify(arr);
        console.log(`DataC: Sauvegarde des Cinemas => taille = ${str.length}`);
        localStorage.setItem(DataControllerSauveCharge.KEY_CINEMAS, str);
    }
    public async sauverSeancesParCinema(): Promise<void> {
        // On suppose que this._allSeances contient toutes les séances de tous les cinémas
        if (!this._allSeances) return;

        // Regrouper par cinema
        const mapCinemaToSeances = new Map<string, Seance[]>();

        this._allSeances.forEach((s) => {
            const cName = s.nameCinema?.trim() || 'unknown';
            if (!mapCinemaToSeances.has(cName)) {
                mapCinemaToSeances.set(cName, []);
            }
            mapCinemaToSeances.get(cName)?.push(s);
        });

        // Pour chaque cinéma, on sauvegarde
        mapCinemaToSeances.forEach((seances, cName) => {
            const str = JSON.stringify(seances);
            const key = `${DataControllerSauveCharge.KEY_SEANCES}_${cName}`;
            console.log(`DataC: Sauvegarde seances pour '${cName}' => taille ${str.length} chars`);
            localStorage.setItem(key, str);
        });
    }

    public async sauverComplet(): Promise<void> {
        await this.sauverEtatGlobal();
        await this.sauverTarifs();
        await this.sauverCinemas();
        await this.sauverSeancesParCinema();
    }

    public async chargerEtatGlobal(): Promise<void> {
        const saved = localStorage.getItem(DataControllerSauveCharge.KEY_GLOBAL);
        if (!saved) {
            console.warn("DataC: Aucune donnée globale trouvée");
            return;
        }
        try {
            const parsed = JSON.parse(saved);
            this._reservationState = parsed.reservationState || ReservationState.PendingChoiceSeance;
            this._filterNameCinema = parsed.filterNameCinema || undefined;
            this._selectedNameCinema = parsed.selectedNameCinema || undefined;
            this._selectedFilmUUID = parsed.selectedFilmUUID || undefined;
            this._selectedSeanceUUID = parsed.selectedSeanceUUID || undefined;
            this._selectedUtilisateurUUID = parsed.selectedUtilisateurUUID || undefined;
            this._selectedUtilisateurMail = parsed.selectedUtilisateurMail || undefined;
            this._selectedUtilisateurDisplayName = parsed.selectedUtilisateurDisplayName || undefined;
            this._selectedReservationUUID = parsed.selectedReservationUUID || undefined;
            this._selectedReservationCinema = parsed.selectedReservationCinema || undefined;

            if (parsed.selectedSeanceDate) {
                this._selectedSeanceDate = new Date(parsed.selectedSeanceDate);
            }
        } catch (e) {
            console.error('DataC: Erreur parsing état global', e);
        }
    }

    public async chargerTarifs(): Promise<void> {
        const saved = localStorage.getItem(DataControllerSauveCharge.KEY_TARIFS);
        if (!saved) return;
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                this._tarifQualite = arr.map((t: any) => new TarifQualite(t));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing tarifs', e);
        }
    }

    public async chargerCinemas(): Promise<void> {
        const saved = localStorage.getItem(DataControllerSauveCharge.KEY_CINEMAS);
        if (!saved) return;
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                this._Cinemas = arr.map((c: any) => new Cinema(c));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing cinemas', e);
        }
    }

    public async chargerSeancesPourCinema(cinemaName: string): Promise<Seance[]> {
        const key = `${DataControllerSauveCharge.KEY_SEANCES}_${cinemaName}`;
        const saved = localStorage.getItem(key);
        if (!saved) return [];
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                return arr.map((s: any) => new Seance(s));
            }
        } catch (e) {
            console.error('DataC: Erreur parsing seances pour', cinemaName, e);
        }
        return [];
    }

    public async chargerSeancesTousCinemas(): Promise<void> {
        // S’assurer qu’on a la liste des cinémas
        if (!this._Cinemas || this._Cinemas.length === 0) {
            console.warn("DataC: Aucun cinéma n’est chargé, impossible de charger les séances tous cinémas.");
            return;
        }

        // Vider ou reconstituer _allSeances
        this._allSeances = [];

        for (const cinemaObj of this._Cinemas) {
            const cName = cinemaObj.nameCinema?.trim() || 'unknown';
            const partialSeances = await this.chargerSeancesPourCinema(cName);
            // Ajouter au grand tableau
            this._allSeances.push(...partialSeances);
        }

        console.log(`DataC: Toutes les séances de ${this._Cinemas.length} cinémas chargées. Nombre total de séances : ${this._allSeances.length}.`);
    }

    public async chargerComplet(): Promise<void> {
        console.log("DataC: ChargerComplet multi storage");

        // 1) Charger l’état global
        await this.chargerEtatGlobal();

        // 2) Charger les tarifs
        await this.chargerTarifs();

        // 3) Charger la liste des cinémas
        await this.chargerCinemas();

        // 4) Charger toutes les séances pour tous les cinémas
        await this.chargerSeancesTousCinemas();

        // => À la fin, this._allSeances contient l’ensemble des séances
    }

    public async init(): Promise<void> {
        console.log("DataC: Init");

        // 1) Charger depuis localStorage
        await this.chargerComplet();

        // 2) Vérifier la validité du cache via cookie
        let mustReload = true;
        const dateAccessString = getCookie(DataController.nomCookieDateAccess);

        if (dateAccessString) {
            if (!isDifferenceGreaterThanHours(new Date(), new Date(dateAccessString), DataController.validiteCache)) {
                mustReload = false;
                console.log("DataC: cookie valide");
            } else {
                console.log("DataC: cookie validite expiré");
            }
        } else {
            console.log("DataC: cookie validite absent");
        }

        // 3) Si invalidité du cache ou pas de séances, on recharge depuis API
        if (!this._allSeances.length || mustReload) {
            console.log('[init] Cache inexistant/vide ou expiré -> rechargement depuis l’API');
            await this.chargerDepuisAPI();
        } else {
            console.log('[init] Données restaurées depuis localStorage');
        }
    }
}
