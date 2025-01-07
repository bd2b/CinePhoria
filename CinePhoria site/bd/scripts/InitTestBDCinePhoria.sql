DROP PROCEDURE IF EXISTS InitBaseTest;

DELIMITER $$
CREATE PROCEDURE InitBaseTest()
BEGIN
DECLARE UUIDUtilisateur1 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur2 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur3 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur4 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur5 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur6 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur7 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur8 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur9 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur10 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur11 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDUtilisateur12 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm1 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm2 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm3 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm4 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm5 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm6 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm7 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm8 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm9 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm10 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm11 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm12 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation1 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation2 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation3 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation4 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation5 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation6 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation7 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation8 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation9 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation10 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation11 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDReservation12 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance1 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance2 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance3 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance4 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance5 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance6 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance7 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance8 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance9 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance10 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance11 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSeance12 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1P VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2P VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3P VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4P VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1T VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2T VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3T VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4T VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1N VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2N VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3N VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4N VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1B VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2B VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3B VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4B VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1L VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2L VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3L VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4L VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1C VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2C VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3C VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4C VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle1G VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle2G VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle3G VARCHAR(100) DEFAULT UUID();
DECLARE UUIDSalle4G VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite1 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite2 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite3 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite4 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite5 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite6 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite7 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite8 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite9 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite10 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite11 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDTarifQualite12 VARCHAR(100) DEFAULT UUID();

INSERT INTO Cinema
  (nameCinema, 
  adresse, 
  ville, 
  postalcode, 
  emailCinema, 
  telCinema) 
VALUES 
  ("Paris", "10 rue de la Paix", "Paris", "F-75000", "cinephoriaParis@mail.fr", "+33 1 45 25 70 00"),
  ("Toulouse", "10 rue Matabiau", "Toulouse", "F-31000", "cinephoriaToulous@email.fr", "+33 5 40 23 10 12"),
  ("Nantes", "1, avenue des déportés", "Nantes", "F-44000", "cinephoriaNantes@mail.fr", "+33 4 40 23 10 12"),
  ("Lille", "10 boulevard du Général de Gaulle", "Lille", "F-59000", "cinephoriaLille@mail.fr", "+33 5 40 23 10 12"),
  ("Bordeaux", "99 rue Sainte-Catherine", "Bordeaux", "F-33000", "cinephoriaBordeaux@mail.fr", "+33 5 40 23 10 12"),
  ("Liege", "10 rue de Charleroi", "Liege", "B-0100", "cinephoriaLiege@mail.fr", "+33 5 40 23 10 12"),
  ("Charleroi", "70 rue de Liege", "Charleroi", "B-0200", "cinephoriaCharleroi@mail.fr", "+33 5 40 23 10 12")
  ;
  
  
INSERT INTO Compte
  (email, 
  isValidated, 
  passwordText, 
  datePassword, 
  oldpasswordsArray) 
VALUES 
  ("djamila@mail.fr"		, 1, "password", "2024-12-01 08:00:00", "abcd12345"),
  ("jean@mail.fr"			, 1, "password", "2024-12-02 08:00:00", "abcd12345"),
  ("kevin@mail.fr"			, 1, "password", "2024-12-03 08:00:00", "abcd12345"),
  ("administrateur@mail.fr"	, 1, "password", "2024-12-04 08:00:00", "abcd12345"),
  ("employeParis@mail.fr"	, 1, "password", "2024-12-05 08:00:00", "abcd12345"),
  ("employeToulouse@mail.fr", 1, "password", "2024-12-06 08:00:00", "abcd12345"),
  ("employeBelgique@mail.fr", 1, "password", "2024-12-07 08:00:00", "abcd12345"),
  ("nonvalide@mail.fr"		, 0, "", null , "")
  ;
INSERT INTO Connexions
  ( email, dateConnexion
 ) 	
VALUES 
("djamila@mail.fr"		, "2024-12-01 15:30:00"),
("jean@mail.fr"			, "2024-12-01 15:30:00"),
("kevin@mail.fr"			, "2024-12-01 15:30:00"),
("administrateur@mail.fr"	, "2024-12-01 15:30:00"),
("employeParis@mail.fr"	, "2024-12-01 15:30:00"),
("employeToulouse@mail.fr", "2024-12-01 15:30:00"),
("employeBelgique@mail.fr", "2024-12-01 15:30:00")
;

INSERT INTO Employe
  (matricule, 
  email, 
  isAdministrateur, 
  lastnameEmploye, 
  firstnameEmploye) 
VALUES 
  (202512, "administrateur@mail.fr" , 1 , "Durand" , "Charlotte"),
  (202513, "employeParis@mail.fr" , 0 , "Martin" , "Pauline"),
  (202514, "employeToulouse@mail.fr" , 0 , "Noir" , "Pierre"),
  (202515, "employeBelgique@mail.fr" , 0 , "Blanc" , "André")
  ;
INSERT INTO Employe_Cinema
  (nameCinema, 
  matricule) 
VALUES 
	("Liege", 202515),
	("Charleroi", 202515),
	("Paris", 202513),
    ("Toulouse", 202514)
  ;

INSERT INTO Utilisateur
  (id, 
  email, 
  displayName) 
VALUES 
  (UUIDUtilisateur1, "djamila@mail.fr" , "Djamila"),
  (UUIDUtilisateur2, "jean@mail.fr" , "Cinephile toujours"),
  (UUIDUtilisateur3, "kevin@mail.fr" , "KeChe")
;


INSERT INTO Film
  (id, 
  titleFilm, 
  filmPitch,
  duration, 
  genreArray,
  filmDescription, 
  filmAuthor, 
  filmDistribution,
  dateSortieCinePhoria,
  note, 
  isCoupDeCoeur,
  categorySeeing,    
  linkBO, 
  imageFilm128,
  imageFilm1024) 
VALUES
  (UUIDFilm1,
  "Mourir peut attendre",
  "Un super film",
  "2h43",
  "Action, Espionnage, Thriller",
  "Bond a quitté les services secrets et coule des jours heureux en Jamaïque. Mais sa tranquillité est de courte durée car son vieil ami Felix Leiter de la CIA débarque pour solliciter son aide : il s'agit de sauver un scientifique qui vient d'être kidnappé. Mais la mission se révèle bien plus dangereuse que prévu et Bond se retrouve aux trousses d'un mystérieux ennemi détenant de redoutables armes technologiques…",
  "De Cary Joji Fukunaga",
  "Avec Daniel Craig, Léa Seydoux, Rami Malek",
  "2024-12-25",
   5.0, 
  "1", 
  "TP", 
  "https://www.youtube.com/watch?v=Q0EiAfDmqx0",
  "1-128.jpg",
  "1-1024.jpg"
  ), 
  (UUIDFilm2, 
  "Joker", 
  "Ne pas manquer",
  "2h19" , 
  "Action, Drame, Romance", 
  "A quelques jours de son procès pour les crimes commis sous les traits du Joker, Arthur Fleck rencontre le grand amour et se trouve entraîné dans une folie à deux.", 
  "De Todd Phillips", 
  "Avec Joaquin Phoenix, Lady Gaga, Brendan Gleeson ",
  "2024-12-25", 
   2.5, 
  "0", 
  "TP", 
  "https://www.youtube.com/watch?v=OoTx1cYC5u8",
  "2-128.jpg",
  "2-1024.jpg"
  ),
  (UUIDFilm3,
  "Matrix",
  "La référence !",
"2h15",
"Action, Science Fiction",
"Programmeur anonyme dans un service administratif le jour, Thomas Anderson devient Neo la nuit venue. Sous ce pseudonyme, il est l'un des pirates les plus recherchés du cyber-espace. A cheval entre deux mondes, Neo est assailli par d'étranges songes et des messages cryptés provenant d'un certain Morpheus. Celui-ci l'exhorte à aller au-delà des apparences et à trouver la réponse à la question qui hante constamment ses pensées : qu'est-ce que la Matrice ? Nul ne le sait, et aucun homme n'est encore parvenu à en percer les defenses. Mais Morpheus est persuadé que Neo est l'Elu, le libérateur mythique de l'humanité annoncé selon la prophétie. Ensemble, ils se lancent dans une lutte sans retour contre la Matrice et ses terribles agents...",
"De Lana Wachowski, Lilly Wachowski",
"Avec Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
"2024-12-18",
 3.5, 
  "0", 
  "TP", 
  "https://www.youtube.com/watch?v=8xx91zoASLY",
  "3-128.jpg",
  "3-1024.jpg")
  ;

INSERT INTO Salle
  (id,
  nameSalle, 
  nameCinema, 
  capacity, 
  numPMR) 
VALUES 
  (UUIDSalle1P,"Salle 1", "Paris", 200, 10),
  (UUIDSalle2P,"Salle 2", "Paris", 100, 2),
  (UUIDSalle3P,"Salle 3", "Paris", 100, 2),
  (UUIDSalle4P,"Salle 4", "Paris", 50, 0),

  (UUIDSalle1T,"Salle 1", "Toulouse", 200, 10),
  (UUIDSalle2T,"Salle 2", "Toulouse", 100, 2),
  (UUIDSalle3T,"Salle 3", "Toulouse", 100, 2),
  (UUIDSalle4T,"Salle 4", "Toulouse", 50, 0),

  (UUIDSalle1N,"Salle 1", "Nantes", 200, 10),
  (UUIDSalle2N,"Salle 2", "Nantes", 100, 2),
  (UUIDSalle3N,"Salle 3", "Nantes", 100, 2),
  (UUIDSalle4N,"Salle 4", "Nantes", 50, 0),

  (UUIDSalle1B,"Salle 1", "Bordeaux", 200, 10),
  (UUIDSalle2B,"Salle 2", "Bordeaux", 100, 2),
  (UUIDSalle3B,"Salle 3", "Bordeaux", 100, 2),
  (UUIDSalle4B,"Salle 4", "Bordeaux", 50, 0),

  (UUIDSalle1L,"Salle 1", "Lille", 200, 10),
  (UUIDSalle2L,"Salle 2", "Lille", 100, 2),
  (UUIDSalle3L,"Salle 3", "Lille", 100, 2),
  (UUIDSalle4L,"Salle 4", "Lille", 50, 0),

  (UUIDSalle1C,"Salle 1", "Charleroi", 200, 10),
  (UUIDSalle2C,"Salle 2", "Charleroi", 100, 2),
  (UUIDSalle3C,"Salle 3", "Charleroi", 100, 2),
  (UUIDSalle4C,"Salle 4", "Charleroi", 50, 0),

  (UUIDSalle1G,"Salle 1", "Liege", 200, 10),
  (UUIDSalle2G,"Salle 2", "Liege", 100, 2),
  (UUIDSalle3G,"Salle 3", "Liege", 100, 2),
  (UUIDSalle4G,"Salle 4", "Liege", 50, 0)
 ;
  
INSERT INTO Incident
  (id, 
  Salleid, 
  matricule, 
  status, 
  title, 
  description, 
  dateOpen, 
  dateClose) 
VALUES 
  (1,UUIDSalle1P, 202513, "En attente", "Fauteuil cassé", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-03 10:00:00", null),
  (2,UUIDSalle1P, 202513, "En attente", "Fauteuil cassé", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-03 10:00:00", null),
  (3,UUIDSalle1P, 202513, "En attente","Fauteuil cassé b","Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-03 10:00:00", null),
  (4,UUIDSalle1P, 202513, "En cours", "Fauteuil cassé c", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-04 10:00:00", null),
  (5,UUIDSalle1P, 202513, "En cours", "Fauteuil cassé d", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-04 10:00:00", null),
  (6,UUIDSalle1P, 202513, "En cours", "Fauteuil cassé e", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-05 10:00:00", null),
  
  (7,UUIDSalle1P, 202513, "Résolu", "Fauteuil cassé", "Le fauteil n° 12 est cassé il ne se rabat plus",   "2024-12-03 09:00:14", null),
  (8,UUIDSalle1P, 202513, "Résolu", "Fauteuil cassé b", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-03 09:00:14", "2024-11-25 17:23:00"),
  (9,UUIDSalle1P, 202513, "Résolu", "Fauteuil cassé c", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-04 09:00:14", "2024-11-25 17:23:00"),
  (10,UUIDSalle1P, 202513, "Résolu", "Fauteuil cassé d", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-04 09:00:14", "2024-11-25 17:23:00"),
  (11,UUIDSalle1P, 202513, "Résolu", "Fauteuil cassé e", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-05 09:00:14", "2024-11-25 17:23:00"),


  (12,UUIDSalle1C, 202515, "En cours", "Fauteuil cassé", "Le fauteil n° 18 est cassé il ne se rabat plus",     "2024-12-02 13:12:45", null),
  (13,UUIDSalle2C, 202515, "Resolu", "Fauteuil cassé", "Le fauteil n° 12 est cassé il ne se rabat plus", "2024-12-03 13:12:45", "2024-12-06 12:12:00")
  ;
  
INSERT INTO Seance
  (id, 
  Filmid, 
  Salleid, 
  dateJour, 
  hourBeginHHSMM, 
  hourEndHHSMM, 
  qualite, 
  bo,
  numFreeSeats,
  numFreePMR,
  alertAvailibility
  ) 
VALUES 
  (UUIDSeance1, UUIDFilm1, UUIDSalle1P , "2025-03-01", "14:00", "17:03", "", "VO",200,10,null),
  (UUIDSeance2, UUIDFilm2, UUIDSalle2P , "2024-08-15", "17:00", "20:03", "3D", "VO",200,10,null),
  (UUIDSeance3, UUIDFilm3, UUIDSalle3P , "2024-06-01", "19:00", "21:03", "4DX", "VF",50,4,"Dernieres places")
  ;

INSERT INTO Reservation
  (Id, 
  Utilisateurid, 
  seanceid, 
  stateReservation, 
  numberPMR, 
  evaluation, 
  isEvaluationMustBeReview, 
  note, 
  isPromoFriandise, 
  numberSeatsRestingBeforPromoFriandise,
  imageQRCode )             
VALUES 
  (UUIDReservation1, UUIDUtilisateur1 , UUIDSeance1, "future", 0, null, 0, null, 0, 5,"imageQRCode.jpg"),
  (UUIDReservation2, UUIDUtilisateur1 , UUIDSeance2, "doneUnevaluated", 0, null, 0, null, 0, 5, null),
  (UUIDReservation3, UUIDUtilisateur1 , UUIDSeance3, "doneEvaluated", 1, "Film très bon. A voir absolument", 1, 4.5, 0, 2, null),
  
  (UUIDReservation4, UUIDUtilisateur2 , UUIDSeance1, "future", 0, null, 0, null, 0, 5, "imageQRCode.jpg"),
  (UUIDReservation5, UUIDUtilisateur2 , UUIDSeance2, "doneUnevaluated", 0, null, 0, null, 0, 5, null),
  (UUIDReservation6, UUIDUtilisateur2 , UUIDSeance3, "doneEvaluated", 1, "Film très bon. A voir absolument", 1, 4.5, 0, 2, null),
  
  (UUIDReservation7, UUIDUtilisateur3 , UUIDSeance1, "future", 0, null, 0, null, 1, 0, "imageQRCode.jpg"),
  (UUIDReservation8, UUIDUtilisateur3 , UUIDSeance2, "doneUnevaluated", 0, null, 0, null, 0, 5, null),
  (UUIDReservation9, UUIDUtilisateur3 , UUIDSeance3, "doneEvaluated", 0, "Bof Bof", 1, 3.5, 0, 2, null)
 ;



INSERT INTO TarifQualite (
	id,
	qualite,
	nameTarif,
	price)
VALUES 
  ( UUIDTarifQualite1 , "" , "Plein Tarif" , 10.0) ,
  ( UUIDTarifQualite2 , "" , "Tarif Reduit" , 8.0) ,
  ( UUIDTarifQualite3 , "3D" , "Plein Tarif" , 11.0) ,
  ( UUIDTarifQualite4 , "3D" , "Tarif Reduit" , 9.0) ,
  ( UUIDTarifQualite5 , "4K" , "Plein Tarif" , 11.0) ,
  ( UUIDTarifQualite6 , "4K" , "Tarif Reduit" , 9.0) ,
  ( UUIDTarifQualite7 , "4DX" , "Plein Tarif" , 12.0) ,
  ( UUIDTarifQualite8 , "4DX" , "Tarif Reduit" , 10.0)
  ;

INSERT INTO SeatsForTarif
  (TarifQualiteid, 
  ReservationId, 
  numberSeats,
  Price) 
VALUES 
  (UUIDTarifQualite1, UUIDReservation1, 1,40.0),
  (UUIDTarifQualite2, UUIDReservation1, 1,40.0),
  (UUIDTarifQualite3, UUIDReservation2, 2,40.0),
  (UUIDTarifQualite7, UUIDReservation3, 3,40.0),
  (UUIDTarifQualite8, UUIDReservation3, 3,40.0)
  ;
  
  END $$
DELIMITER ;

call InitBaseTest();
  


  
  
