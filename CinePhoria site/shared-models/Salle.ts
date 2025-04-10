

export class Salle {
    id!: string;
    nameCinema?: string;
    nameSalle?: string;
    capacity?: number;
    numPMR?: number;
    rMax?: number;
    fMax?: number;
    seatsAbsents?: string;

    constructor(data: Partial<Salle>) {
       Object.assign(this, data);
     }
  };