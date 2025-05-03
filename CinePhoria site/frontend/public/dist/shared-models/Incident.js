// CREATE TABLE Incident (
//     id          int(10) NOT NULL AUTO_INCREMENT, 
//     Salleid     varchar(100) NOT NULL, 
//     matricule   int(10) NOT NULL, 
//     status      varchar(100) NOT NULL, 
//     title       varchar(100) NOT NULL, 
//     description longtext NOT NULL, 
//     dateOpen    datetime NOT NULL, 
//     dateClose   datetime NULL, 
//     PRIMARY KEY (id));
export class Incident {
    constructor(data) {
        Object.assign(this, data);
    }
}
;
