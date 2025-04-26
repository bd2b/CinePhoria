export class Cinema {
    nameCinema! : string;
    adresse?    : string;
    ville?      : string;
    postalcode? : string;
    emailCinema?: string;
    telCinema?  : string;
    ligne1?     : string;
    ligne2?     : string;
  
    constructor(data: Partial<Cinema>) {
       Object.assign(this, data);
     }
  };

// export interface Cinema {
//   nameCinema : string;
//   adresse    : string;
//   ville      : string;
//   postalcode : string;
//   emailCinema : string;
//   telCinema  : string;
//   ligne1     : string;
//   ligne2     : string;
// }
