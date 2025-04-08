

export class Film {
    id!: string;
    titleFilm?: string;
    filmPitch?: string;
    genreArray?: string;
    duration?: string;
    linkBO?: string;
    dateSortieCinePhoria?: string;
    categorySeeing?: string;
    note?: number;
    isCoupDeCoeur?: boolean;
    filmDescription?: string;
    filmAuthor?: string;
    filmDistribution?: string;
    imageFilm128?: string;
    imageFilm1024?: string;
  
    constructor(data: Partial<Film>) {
       Object.assign(this, data);
     }
  };

export interface FilmInterface {
       id: string;
       titleFilm: string;
       filmPitch: string;
   
       genreArray?: string;
       duration?: string;
       linkBO?: string;
       dateSortieCinePhoria?: string;
       categorySeeing?: string;
   
       note: number;
       isCoupDeCoeur: boolean;
       filmDescription: string;
       filmAuthor?: string;
       filmDistribution?: string;
   
       imageFilm128?: string;
       imageFilm1024: string;
   
     };