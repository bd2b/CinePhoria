import { userDataController } from "./DataControllerUser";
import { dataController } from "./DataController.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';


export async function onLoadMesReservations() {
    console.log("=====> chargement onLoadMesReservations")

    // On initialise le dataController si il est vide
      if (dataController.allSeances.length === 0) await dataController.init()

    // On charge menu et footer
      chargerMenu(); // Header
      chargerCinemaSites() // Footer
}

