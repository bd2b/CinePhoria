export class Reservation {
  id!: string;
  Utilisateurid?: string;
  Seanceid?: string;
  stateReservation?: string;
  numberPMR?: string;
  evaluation?: string;
  isEvaluationMustBeReview?: boolean;
  note?: number;
  isPromoFriandise?: boolean;
  numberSeatsRestingBeforPromoFriandise?: number;
  imageQRCode?: string;
  timeStampCreate?: Date;
  constructor(data: Partial<Reservation>) {
    Object.assign(this, data);
  }
};

export const tabReservationState = ["PendingChoiceSeance", "PendingChoiceSeats", "ReserveCompteToConfirm", "ReserveMailToConfirm",
  "ReserveToConfirm", "ReserveConfirmed"];


export enum ReservationState {
  PendingChoiceSeance = "PendingChoiceSeance",    // Choix de seance en cours , le panel choix est affiché
  PendingChoiceSeats = "PendingChoiceSeats",      // Choix de tarifs en cours, le panel reserve est affiché
  ReserveCompteToConfirm = "ReserveCompteToConfirm",    // Une reservation a été enregistrée (film, seance, nombre de siege, nombre de prm, email communiqués) 
  // avec un compte provisoire qu'il faut confirmer
  ReserveMailToConfirm = "ReserveMailToConfirm",  // Le compte a été confirmé, il faut maintenant confirmer le mail en saisissant le code reçu dans la modal
  ReserveToConfirm = "ReserveToConfirm",          // Une reservation a été enregistrée (film, seance, nombre de siege, nombre de prm, email communiqués) 
  // avec un email qui est celui d'un compte existant                                     
  ReserveConfirmed = "ReserveConfirmed",           // La reservation est confirmé après login sur un compte existant, il y a assez de place (sieges et PMR), et l'email est enregistré comme compte
  DoneUnevaluated = "DoneUnevaluated",             // la réservation est passée mais il n'y a pas d'évaluation, on doit présenter la saisie d'une évaluation
  DoneEvaluated = "DoneEvaluated",                 // la réservation est passée et il y a une évaluation, on affiche l'évaluation sans action
  ReserveCanceled = "ReserveCanceled"              // La reservation est annulée par l'utilisateur, les places et nombre de PMR ne sont pas comptés dans la séance
}

export class SeatsForTarif {
  ID!: string;             // de type auto increment
  TarifQualiteid?: string;
  ReservationId?: string;
  numberSeats?: number;
  Price?: number;
  constructor(data: Partial<Reservation>) {
    Object.assign(this, data);
  }
};

export type TarifForSeats = Record<string, number>;


export class ReservationForUtilisateur {
  utilisateurId!:string;
  reservationId!:string;
  statereservation?:string;
  timestampcreate?:Date;
  displayname?:string;
  dateJour?:Date;
  titleFilm?:string;
  nameCinema?:string;
  isevaluationmustbereview?:boolean;
  note?:number;
  evaluation?:string;
  totalSeats?:number;
  totalPrice?:number;
  numberPMR?:number;
  filmId?:string;
  seanceId?:string;
  email?:string;
  constructor(data: Partial<ReservationForUtilisateur>) {
    Object.assign(this, data);
  }
};

export class SeatsForReservation {
  
  numberSeats?:number;
  nameTarif?:string;
  price?:number;
  
  constructor(data: Partial<ReservationForUtilisateur>) {
    Object.assign(this, data);
  }
};


