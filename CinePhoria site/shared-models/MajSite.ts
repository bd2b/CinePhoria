// CREATE TABLE MajSite (
//     idInt      INT AUTO_INCREMENT NOT NULL, 
//     MAJEURE Int,
//     MINEURE Int,
//     BUILD Int,
//     dateMaj timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
//     message    text NOT NULL, 
//     PRIMARY KEY (idInt));

export class MajSite {
    idInt! : number;
    MAJEURE?: number;
    MINEURE?: number;
    BUILD?: number;
    dateMaj?: Date;
    message?  : string;
    
    constructor(data: Partial<MajSite>) {
       Object.assign(this, data);
     }
  };