var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dataController } from "./DataController.js";
import { chargerMenu } from './ViewMenu.js';
import { chargerCinemaSites } from './ViewFooter.js';
export function onLoadMesReservations() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=====> chargement onLoadMesReservations");
        // On initialise le dataController si il est vide
        if (dataController.allSeances.length === 0)
            yield dataController.init();
        // On charge menu et footer
        chargerMenu(); // Header
        chargerCinemaSites(); // Footer
    });
}
