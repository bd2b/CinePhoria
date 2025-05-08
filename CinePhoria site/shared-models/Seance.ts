export class SeanceB {
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

import { Film } from './Film';

export class Seance {
  // Référence globale au catalogue de films
  static allFilms: Film[] = [];

  // Données propres à la séance
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

  // Récupération du film associé
  private get film(): Film | undefined {
    return Seance.allFilms.find(f => f.id === this.filmId);
  }

  // Propriétés calculées (non persistées dans JSON)
  get titleFilm(): string | undefined { return this.film?.titleFilm; }
  get filmPitch(): string | undefined { return this.film?.filmPitch; }
  get genreArray(): string | undefined { return this.film?.genreArray; }
  get duration(): string | undefined { return this.film?.duration; }
  get linkBO(): string | undefined { return this.film?.linkBO; }
  get dateSortieCinePhoria(): string | undefined { return this.film?.dateSortieCinePhoria; }
  get categorySeeing(): string | undefined { return this.film?.categorySeeing; }
  get note(): string | undefined { return this.film?.note?.toString(10); }
  get isCoupDeCoeur(): boolean | undefined { return this.film?.isCoupDeCoeur; }
  get isActiveForNewSeances(): boolean | undefined { return this.film?.isActiveForNewSeances; }
  get filmDescription(): string | undefined { return this.film?.filmDescription; }
  get filmAuthor(): string | undefined { return this.film?.filmAuthor; }
  get filmDistribution(): string | undefined { return this.film?.filmDistribution; }
  get imageFilm128(): string | undefined { return this.film?.imageFilm128; }
  get imageFilm1024(): string | undefined { return this.film?.imageFilm1024; }
}



export class SeanceReduite {
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
