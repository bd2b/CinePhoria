export class Seance {
  seanceId!: string; 
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
  titleFilm?: string;
  filmPitch?: string;
  duration?: string; 
  genreArray?: string;
  filmDescription?: string; 
  filmAuthor?: string; 
  filmDistribution?: string;
  dateSortieCinePhoria?: string;
  note?: string; 
  isCoupDeCoeur?: boolean;
  isActiveForNewSeances?: boolean;
  categorySeeing?: string;    
  linkBO?: string; 
  imageFilm128?: string;
  imageFilm1024?: string;
  nameSalle?: string; 
  nameCinema?: string; 
  capacity?: string; 
  numPMR?: string;
  rMax?: string;
  fMax?: string;
  seatsAbsents?: string;
  adresse?: string; 
  ville?: string; 
  postalcode?: string; 
  emailCinema?: string; 
  telCinema?: string;  

 constructor(data: Partial<Seance>) {
    Object.assign(this, data);
  }
};

export class TarifQualite {
  id!: string;  
  qualite?: string;
  nameTarif?: string;
  price?: string

  constructor(data: Partial<TarifQualite>) {
    Object.assign(this, data);
  }
};

export interface SeanceInterface {
 seanceId: string; 
 filmId?: string;
 salleId?: string; 
 seancedateJour?: string; 
 seancehourBeginHHSMM?: string; 
 seancehourEndHHSMM?: string; 
 seancequalite?: string; 
 seancebo?: string;
 seancenumFreeSeats?: string;
 seancenumFreePMR?: string;
 seancealertAvailibility?: string;
 filmtitleFilm?: string;
 filmfilmPitch?: string;
 filmduration?: string; 
 filmgenreArray?: string;
 filmfilmDescription?: string; 
 filmfilmAuthor?: string; 
 filmfilmDistribution?: string;
 filmdateSortieCinePhoria?: string;
 filmnote?: string; 
 filmisCoupDeCoeur?: string;
 filmisActiveForNewSeances?: string;
 filmcategorySeeing?: string;    
 filmlinkBO?: string; 
 filmimageFilm128?: string;
 filmimageFilm1024?: string;
 sallenameSalle?: string; 
 sallenameCinema?: string; 
 sallecapacity?: string; 
 sallenumPMR?: string;
 cinemaadresse?: string; 
 cinemaville?: string; 
 cinemapostalcode?: string; 
 cinemaemailCinema?: string; 
 cinematelCinema?: string;
}

export class SeanceDisplay {
  seanceId!: string; 
  titleFilm?: string;
  nameSalle?: string; 
  nameCinema?: string; 

  capacity?: number;
  
  dateJour?: string; 
  hourBeginHHSMM?: string; 
  hourEndHHSMM?: string; 

  bo?: string;
  duration?: string;
  qualite?: string;
  imageFilm128?: string;

  salleId?: string;
  filmId?: string;

 constructor(data: Partial<SeanceDisplay>) {
    Object.assign(this, data);
  }
};
