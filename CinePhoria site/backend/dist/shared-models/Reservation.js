"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationStats = exports.SeatsForReservation = exports.ReservationForUtilisateur = exports.SeatsForTarif = exports.ReservationState = exports.tabReservationState = exports.Reservation = void 0;
class Reservation {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.Reservation = Reservation;
;
exports.tabReservationState = ["PendingChoiceSeance", "PendingChoiceSeats", "ReserveCompteToConfirm", "ReserveMailToConfirm",
    "ReserveToConfirm", "ReserveConfirmed"];
var ReservationState;
(function (ReservationState) {
    ReservationState["PendingChoiceSeance"] = "PendingChoiceSeance";
    ReservationState["PendingChoiceSeats"] = "PendingChoiceSeats";
    ReservationState["ReserveCompteToConfirm"] = "ReserveCompteToConfirm";
    // avec un compte provisoire qu'il faut confirmer
    ReservationState["ReserveMailToConfirm"] = "ReserveMailToConfirm";
    ReservationState["ReserveToConfirm"] = "ReserveToConfirm";
    // avec un email qui est celui d'un compte existant                                     
    ReservationState["ReserveConfirmed"] = "ReserveConfirmed";
    ReservationState["DoneUnevaluated"] = "DoneUnevaluated";
    ReservationState["DoneEvaluated"] = "DoneEvaluated";
    ReservationState["ReserveCanceled"] = "ReserveCanceled";
    ReservationState["ReserveDeleted"] = "ReserveDeleted"; // La reservation est supprimée par l'utilisateur, elle n'apparaitra plus dans son tableau
})(ReservationState || (exports.ReservationState = ReservationState = {}));
class SeatsForTarif {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.SeatsForTarif = SeatsForTarif;
;
class ReservationForUtilisateur {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.ReservationForUtilisateur = ReservationForUtilisateur;
;
class SeatsForReservation {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.SeatsForReservation = SeatsForReservation;
;
;
class ReservationStats {
    constructor(data) {
        Object.assign(this, data);
    }
}
exports.ReservationStats = ReservationStats;
;
