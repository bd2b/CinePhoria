export class Seance {
    seanceId!: string; 
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

 constructor(data: Partial<Seance>) {
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
