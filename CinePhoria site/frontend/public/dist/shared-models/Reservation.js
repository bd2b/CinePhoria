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
    ReservationState["ReserveCanceled"] = "ReserveCanceled"; // La reservation est annulée par l'utilisateur, les places et nombre de PMR ne sont pas comptés dans la séance
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
