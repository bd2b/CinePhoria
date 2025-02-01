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
  note?:number;
  evaluation?:string;
  totalSeats?:number;
  totalPrice?:number;
  numberPMR?:number;
  constructor(data: Partial<Reservation>) {
    Object.assign(this, data);
  }
};
