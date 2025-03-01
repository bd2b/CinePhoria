export class Reservation {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
export const tabReservationState = ["PendingChoiceSeance", "PendingChoiceSeats", "ReserveCompteToConfirm", "ReserveMailToConfirm",
    "ReserveToConfirm", "ReserveConfirmed"];
export var ReservationState;
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
})(ReservationState || (ReservationState = {}));
export class SeatsForTarif {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
export class ReservationForUtilisateur {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
export class SeatsForReservation {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
