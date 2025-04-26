export class SeanceSeule {
    id!: string; 
    filmId?: string;
    salleId?: string; 
    dateJour?: string; 
    hourBeginHHSMM?: string; 
    hourEndHHSMM?: string; 
    qualite?: string; 
    bo?: string;
    numFreeSeats?: string;
    numFreePMR?: string;
    alertAvailibility?: string;
    
  
   constructor(data: Partial<SeanceSeule>) {
      Object.assign(this, data);
    }
  };
  
  