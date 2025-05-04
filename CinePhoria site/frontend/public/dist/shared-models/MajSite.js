// CREATE TABLE MajSite (
//     idInt      INT AUTO_INCREMENT NOT NULL, 
//     MAJEURE Int,
//     MINEURE Int,
//     BUILD Int,
//     dateMaj timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
//     message    text NOT NULL, 
//     PRIMARY KEY (idInt));
export class MajSite {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
