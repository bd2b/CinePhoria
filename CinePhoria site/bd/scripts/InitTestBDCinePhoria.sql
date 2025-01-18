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
DECLARE UUIDFilm13 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm14 VARCHAR(100) DEFAULT UUID();
DECLARE UUIDFilm15 VARCHAR(100) DEFAULT UUID();
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

/***********************************************************************
   *  D) Déclarations nécessaires pour sp_generate_seances
   ***********************************************************************/
  DECLARE v_start DATE;
  DECLARE v_end DATE;
  DECLARE v_day DATE;

  DECLARE v_day_offset INT;     
  DECLARE v_week_index INT;     
  DECLARE v_film_idx INT;       
  DECLARE v_time_set INT;       

  DECLARE v_cinema_counter INT; 
  DECLARE v_cinema_code VARCHAR(1);

  DECLARE v_bo VARCHAR(2);      
  DECLARE v_qualite VARCHAR(4); 

  DECLARE v_salle_counter INT;  
  DECLARE v_salle_varName VARCHAR(50);  -- ex: "UUIDSalle1P"
  DECLARE v_salle_realId VARCHAR(100);  -- ex: <valeur de la variable>

  DECLARE v_numFreeSeats INT;   
  DECLARE v_numFreePMR INT;

  DECLARE v_film_varName VARCHAR(50);   -- ex: "UUIDFilm3"
  DECLARE v_film_realId VARCHAR(100);   -- ex: <valeur>

INSERT INTO Cinema
  (nameCinema, 
  adresse, 
  ville, 
  postalcode, 
  emailCinema, 
  telCinema,
  ligne1,
  ligne2) 
VALUES 
  ("Paris", "10 rue de la Paix", "Paris", "F-75000", "cinephoriaParis@mail.fr", "+33 1 45 25 70 00","Première séance : 13h","7j sur 7"),
  ("Toulouse", "10 rue Matabiau", "Toulouse", "F-31000", "cinephoriaToulous@email.fr", "+33 5 40 23 10 12","Première séance : 13h","7j sur 7"),
  ("Nantes", "1, avenue des déportés", "Nantes", "F-44000", "cinephoriaNantes@mail.fr", "+33 4 40 23 10 12","Première séance : 13h","7j sur 7"),
  ("Lille", "10 boulevard du Général de Gaulle", "Lille", "F-59000", "cinephoriaLille@mail.fr", "+33 5 40 23 10 12","Première séance : 13h","7j sur 7"),
  ("Bordeaux", "99 rue Sainte-Catherine", "Bordeaux", "F-33000", "cinephoriaBordeaux@mail.fr", "+33 5 40 23 10 12","Première séance : 13h","7j sur 7"),
  ("Liege", "10 rue de Charleroi", "Liege", "B-0100", "cinephoriaLiege@mail.fr", "+33 5 40 23 10 12","Première séance : 13h","7j sur 7"),
  ("Charleroi", "70 rue de Liege", "Charleroi", "B-0200", "cinephoriaCharleroi@mail.fr", "+33 5 40 23 10 12","Première séance : 13h","7j sur 7")
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
  "https://www.youtube.com/embed/Q0EiAfDmqx0",
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
  "https://www.youtube.com/embed/OoTx1cYC5u8",
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
  "-18", 
  "https://www.youtube.com/embed/8xx91zoASLY",
  "3-128.jpg",
  "3-1024.jpg"),
  (UUIDFilm4,
  "La mort au trousses",
  "Grosses chocottes",
"2h16",
"Aventure, Policier, Espionnage, Thriller",
"Le publiciste Roger Tornhill se retrouve par erreur dans la peau d'un espion. Pris entre une mystérieuse organisation qui cherche à le supprimer et la police qui le poursuit, Tornhill est dans une situation bien inconfortable. Il fuit à travers les Etats-Unis et part à la recherche d'une vérité qui se révèlera très surprenante.",
"De Alfred Hitchcock",
"Avec Cary Grant, Eva Marie Saint, James Mason",
"2025-01-01",
 3.5, 
  "0", 
  "TP", 
  "https://www.youtube.com/embed/BC9uXuXf3o8",
  "4-128.jpg",
  "4-1024.jpg"),
  (UUIDFilm5,
  "Pulp Fiction",
  "Culte",
"2h29",
"Policier, Drame",
"L'odyssée sanglante et burlesque de petits malfrats dans la jungle de Hollywood à travers trois histoires qui s'entremêlent.",
"De Quentin Tarantino",
"Avec John Travolta, Samuel L. Jackson, Uma Thurman",
"2025-01-01",
 5.0, 
  "0", 
  "-16", 
  "https://www.youtube.com/embed/h9041zYF5ZA",
  "5-128.jpg",
  "5-1024.jpg"),
  (UUIDFilm6,
  "Bons baisers de Russie",
  "Sean Connery ❤️❤️",
"1h58",
"Action, Policier, Espionnage, Thriller",
"En pleine guerre froide, James Bond se voit confier la mission de faire passer à l'Ouest une jeune femme russe nommée Tatiana Romanova ainsi qu'un lecteur de déchiffrement conçu par les Soviétiques. Cependant, cela s'avère être un piège tendu par l'organisation criminelle du SPECTRE, qui entend venger la mort du Dr. No et s'emparer du lecteur…",
"De Terence Young",
"Avec Sean Connery, Daniela Bianchi, Pedro Armendariz",
"2025-01-02",
 5.0, 
  "0", 
  "-12", 
  "https://www.youtube.com/embed/JELm6NkF7yY",
  "6-128.jpg",
  "6-1024.jpg"),
  (UUIDFilm7,
  "Battleship",
  "De l'action, que d'action ...",
"2h10",
"Action, Science Fiction, Thriller",
"Océan Pacifique… Au large d’Hawaï, l’US Navy déploie toute sa puissance. Mais bientôt, une forme étrange et menaçante émerge à la surface des eaux, suivie par des dizaines d’autres dotées d’une puissance de destruction inimaginable. Qui sont-ils ? Que faisaient-ils, cachés depuis si longtemps au fond de l’océan ? À bord de l’USS John Paul Jones, le jeune officier Hopper, l’Amiral Shane, le sous-officier Raikes vont découvrir que l’océan n’est pas toujours aussi pacifique qu’il y paraît. La bataille pour sauver notre planète débute en mer.",
"De Peter Berg",
"Avec Taylor Kitsch, Rihanna, Liam Neeson",
"2025-01-02",
 3.5, 
  "0", 
  "-12", 
  "https://www.youtube.com/embed/Tkej_ULljR8",
  "7-128.jpg",
  "7-1024.jpg"),
  (UUIDFilm8,
  "Niagara",
  "Éternelle Marylin",
"1h50",
"Drame, Thriller",
"Ray et Polly Cutler sont en séjour à Niagara Falls. Ils font la connaissance de George et Rose Loomis, un couple au bord de la rupture. Rose annonce la disparition de son mari aux Cutler et a la désagréable surprise de reconnaître à la morgue le cadavre de son amant...",
"De Henry Hathaway",
"Avec Marilyn Monroe, Joseph Cotten, Jean Peters",
"2024-12-25",
 4.5, 
  "0", 
  "TP", 
  "https://www.youtube.com/embed/Te3YDaOcPqk",
  "8-128.jpg",
  "8-1024.jpg"),
  (UUIDFilm9,
  "Jaws (les dents de la mer)",
  "Miam miam",
"2h04",
"Action, Thriller",
"À quelques jours du début de la saison estivale, les habitants de la petite station balnéaire d'Amity sont mis en émoi par la découverte sur le littoral du corps atrocement mutilé d'une jeune vacancière. Pour Martin Brody, le chef de la police, il ne fait aucun doute que la jeune fille a été victime d'un requin. Il décide alors d'interdire l'accès des plages mais se heurte à l'hostilité du maire uniquement intéressé par l'afflux des touristes. Pendant ce temps, le requin continue à semer la terreur le long des côtes et à dévorer les baigneurs...",
"De Steven Spielberg",
"Avec Roy Scheider, Robert Shaw, Richard Dreyfuss",
"2024-12-25",
 5.0, 
  "1", 
  "-12", 
  "https://www.youtube.com/embed/PZDO1hrV16I",
  "9-128.jpg",
  "9-1024.jpg"),
  (UUIDFilm10,
  "Avatar : la voie de l'eau",
  "Un enchantement",
"3h12",
"Action, Aventure, Fantastique, Science Fiction",
"Se déroulant plus d’une décennie après les événements relatés dans le premier film, AVATAR : LA VOIE DE L’EAU raconte l'histoire des membres de la famille Sully (Jake, Neytiri et leurs enfants), les épreuves auxquelles ils sont confrontés, les chemins qu’ils doivent emprunter pour se protéger les uns les autres, les batailles qu’ils doivent mener pour rester en vie et les tragédies qu'ils endurent.",
"De James Cameron",
"Avec Sam Worthington, Zoe Saldana, Sigourney Weaver",
"2024-12-25",
 5.0, 
  "1", 
  "TP", 
  "https://www.youtube.com/embed/60ArLSCgjSU",
  "10-128.jpg",
  "10-1024.jpg"),
  (UUIDFilm11,
  "Dune",
  "Version culte",
"2h17",
"Action, Aventure, Science-fiction",
"Dans un futur lointain, l'univers connu est gouverné par l'empereur Padishah Shaddam IV. La substance la plus précieuse de l'empire est l'épice, une drogue qui prolonge la vie et élargit la conscience. L'épice permet également à la Guilde spatiale de plier l'espace-temps à l'aide de ses navigateurs ayant muté sous l’effet d’une exposition constante à l’épice, rendant possible un voyage interstellaire sûr et instantané.",
"De David Lynch",
"Avec Kyle MacLachlan, Sean Young, Francesca Annis, Sting, Max von Sydow",
"2025-01-02",
 5.0, 
  "1", 
  "-16", 
  "https://www.youtube.com/embed/04aw2ymZedw",
  "11-128.jpg",
  "11-1024.jpg"),
  (UUIDFilm12,
  "Les choses simples",
  "Matière à réfléchir",
"1h36",
"Comédie",
"Vincent est un célèbre entrepreneur à qui tout réussit. Un jour, une panne de voiture sur une route de montagne interrompt provisoirement sa course effrénée. Pierre, qui vit à l’écart du monde moderne au milieu d’une nature sublime, lui vient en aide et lui offre l’hospitalité. La rencontre entre ces deux hommes que tout oppose va bouleverser leurs certitudes respectives. Et ils vont se surprendre à rire. Au fond, vivent-ils vraiment chacun les vies qu’ils ont envie de vivre ?",
"De Eric Besnard",
"Avec Lambert Wilson, Grégory Gadebois, Marie Gillain",
"2025-01-01",
 4.5, 
  "0", 
  "TP", 
  "https://www.youtube.com/embed/yBdxN_dN6F0",
  "12-128.jpg",
  "12-1024.jpg"),
  (UUIDFilm13,
  "Les Petites victoires",
  "Touchant",
"1h30",
"Comédie",
"Entre ses obligations de maire et son rôle d'institutrice au sein du petit village de Kerguen, les journées d’Alice sont déjà bien remplies. L’arrivée dans sa classe d’Emile, un sexagénaire au caractère explosif, enfin décidé à apprendre à lire et à écrire, va rendre son quotidien ingérable. Surtout qu’Alice, qui n'avait rien vu venir, va devoir aussi sauver son village et son école…",
"De Mélanie Auffret",
"Avec Michel Blanc, Julia Piaton, Lionel Abelanski",
"2024-12-31",
 4.0, 
  "0", 
  "TP", 
  "https://www.youtube.com/embed/bVaetxYZrCk",
  "13-128.jpg",
  "13-1024.jpg"),
  (UUIDFilm14,
  "Le Dernier métro",
  "Un film aux multiples prix",
"2h13",
"Drame, Romance, Guerre",
"Paris, septembre 1942. Lucas Steiner, le directeur du théâtre Montmartre a dû fuir parce qu’il est juif. Sa femme Marion Steiner dirige le théâtre et engage Bernard Granger, transfuge du Grand Guignol, pour jouer à ses côtés dans « la Disparue », que met en scène Jean-Louis Cottins. Jusqu’au soir de la générale, la troupe subit les menaces du virulent critique de « Je suis partout », Daxiat, dont l’ambition est de diriger la Comédie-Française. Et si, par amour pour sa femme, Lucas Steiner avait fait semblant de fuir la France et était resté caché dans la cave de son théâtre pendant toute la guerre…",
"De François Truffaut",
"Avec Catherine Deneuve, Gérard Depardieu, Jean Poiret",
"2024-12-31",
 5.0, 
  "1", 
  "-16", 
  "https://www.youtube.com/embed/hXCUifFwGzc",
  "14-128.jpg",
  "14-1024.jpg"),
  (UUIDFilm15,
  "À fond",
  "Décoiffant",
"1h31",
"Action, Comédie",
"Une famille embarque dans son monospace flambant neuf, au petit matin, afin d'éviter les embouteillages pour les vacances d’été. Tom, le père, enclenche son régulateur de vitesse électronique sur 130 km/h. Au moment où une dernière bourde de Ben, le beau-père, pousse Julia, excédée, à demander qu'on fasse demi-tour, Tom s'aperçoit qu'il ne contrôle plus son véhicule. L'électronique de bord ne répond plus, la vitesse est bloquée à 130 km/h. Toutes les manœuvres pour ralentir la voiture emballée restent sans effet. Une voiture folle, six passagers au bord de la crise de nerfs et un embouteillage monstre qui les attend à moins de deux cents kilomètres de là...",
"De Nicolas Benamou",
"Avec José Garcia, André Dussollier, Caroline Vigneaux",
"2025-01-04",
 4.0, 
  "0", 
  "TP", 
  "https://www.youtube.com/embed/NDslM1QXcQg",
  "15-128.jpg",
  "15-1024.jpg")
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

  
  /***********************************************************************
   *  C) Création d'une table temporaire de mapping pour évaluer les
   *     variables de salle et de film (ex. "UUIDSalle1P" => contenu).
   ***********************************************************************/
   
  DROP TABLE IF EXISTS tmp_mapping;
  CREATE TEMPORARY TABLE tmp_mapping (
    varName VARCHAR(50) PRIMARY KEY,
    varValue VARCHAR(100)
  );
  
  /* Insérez ici toutes vos paires (varName, varValue).
     Par exemple, pour 2 films et 2 salles seulement :
     A vous d'enchainer pour les 15 films, 28 salles, etc.
  */
  INSERT INTO tmp_mapping (varName, varValue) VALUES
('UUIDFilm1', UUIDFilm1),
('UUIDFilm2', UUIDFilm2),
('UUIDFilm3', UUIDFilm3),
('UUIDFilm4', UUIDFilm4),
('UUIDFilm5', UUIDFilm5),
('UUIDFilm6', UUIDFilm6),
('UUIDFilm7', UUIDFilm7),
('UUIDFilm8', UUIDFilm8),
('UUIDFilm9', UUIDFilm9),
('UUIDFilm10', UUIDFilm10),
('UUIDFilm11', UUIDFilm11),
('UUIDFilm12', UUIDFilm12),
('UUIDFilm13', UUIDFilm13),
('UUIDFilm14', UUIDFilm14),
('UUIDFilm15', UUIDFilm15),
('UUIDSalle1P', UUIDSalle1P ),
('UUIDSalle2P', UUIDSalle2P ),
('UUIDSalle3P', UUIDSalle3P ),
('UUIDSalle4P', UUIDSalle4P ),
('UUIDSalle1T', UUIDSalle1T ),
('UUIDSalle2T', UUIDSalle2T ),
('UUIDSalle3T', UUIDSalle3T ),
('UUIDSalle4T', UUIDSalle4T ),
('UUIDSalle1N', UUIDSalle1N ),
('UUIDSalle2N', UUIDSalle2N ),
('UUIDSalle3N', UUIDSalle3N ),
('UUIDSalle4N', UUIDSalle4N ),
('UUIDSalle1B', UUIDSalle1B ),
('UUIDSalle2B', UUIDSalle2B ),
('UUIDSalle3B', UUIDSalle3B ),
('UUIDSalle4B', UUIDSalle4B ),
('UUIDSalle1L', UUIDSalle1L ),
('UUIDSalle2L', UUIDSalle2L ),
('UUIDSalle3L', UUIDSalle3L ),
('UUIDSalle4L', UUIDSalle4L ),
('UUIDSalle1C', UUIDSalle1C ),
('UUIDSalle2C', UUIDSalle2C ),
('UUIDSalle3C', UUIDSalle3C ),
('UUIDSalle4C', UUIDSalle4C ),
('UUIDSalle1G', UUIDSalle1G ),
('UUIDSalle2G', UUIDSalle2G ),
('UUIDSalle3G', UUIDSalle3G ),
('UUIDSalle4G', UUIDSalle4G )
  ;
  
  
   /***********************************************************************
   *  Génération de séances : sur les 7 cinemas, 4 salles, 4 séances par jour par salle, un film différent dans chaque salle, de la veille à 21 jours
   ***********************************************************************/
  sp_generate_seances : BEGIN
  
    -- 1) Détermination des bornes
    SET v_start = DATE_SUB(CURDATE(), INTERVAL 1 DAY);
    SET v_end   = DATE_ADD(CURDATE(), INTERVAL 21 DAY);

    WHILE DAYOFWEEK(v_end) <> 3 DO
        SET v_end = DATE_ADD(v_end, INTERVAL 1 DAY);
    END WHILE;

    -- 2) Boucle de v_day = v_start à v_end
    SET v_day = v_start;
    WHILE v_day <= v_end DO

      SET v_day_offset  = DATEDIFF(v_day, v_start);
      SET v_week_index  = FLOOR(v_day_offset / 7);
-- 	  SET v_film_idx    = (v_week_index MOD 15) + 1;
	  SET v_film_idx    = 1 ;
      SET v_time_set    = (v_day_offset MOD 2);

      -- 3) Boucle sur 7 cinémas
      SET v_cinema_counter = 1;
      WHILE v_cinema_counter <= 7 DO

        CASE v_cinema_counter
          WHEN 1 THEN SET v_cinema_code = 'P';
          WHEN 2 THEN SET v_cinema_code = 'T';
          WHEN 3 THEN SET v_cinema_code = 'B';
          WHEN 4 THEN SET v_cinema_code = 'L';
          WHEN 5 THEN SET v_cinema_code = 'N';
          WHEN 6 THEN SET v_cinema_code = 'C';
          WHEN 7 THEN SET v_cinema_code = 'G';
        END CASE;

        IF ((v_film_idx + v_cinema_counter) MOD 2 = 0) THEN
          SET v_bo = 'VF';
        ELSE
          SET v_bo = 'VO';
        END IF;

        CASE ((v_film_idx + v_cinema_counter) MOD 4)
          WHEN 0 THEN SET v_qualite = '3D';
          WHEN 1 THEN SET v_qualite = '4K';
          WHEN 2 THEN SET v_qualite = '4DX';
          WHEN 3 THEN SET v_qualite = '';
        END CASE;

        -- 4) Boucle sur les 4 salles
        SET v_salle_counter = 1;
        WHILE v_salle_counter <= 4 DO

          -- (a) Construire le nom "UUIDSalle1P", etc.
          SET v_salle_varName = CONCAT('UUIDSalle', v_salle_counter, v_cinema_code);

          -- (b) Récupérer la VRAIE valeur depuis tmp_mapping
          SELECT varValue INTO v_salle_realId
            FROM tmp_mapping
           WHERE varName = v_salle_varName
           LIMIT 1; -- devrais renvoyer 1 row

          CASE v_salle_counter
            WHEN 1 THEN
              SET v_numFreeSeats = 200;
              SET v_numFreePMR   = 5;
            WHEN 2 THEN
              SET v_numFreeSeats = 150;
              SET v_numFreePMR   = 3;
            WHEN 3 THEN
              SET v_numFreeSeats = 150;
              SET v_numFreePMR   = 3;
            WHEN 4 THEN
              SET v_numFreeSeats = 50;
              SET v_numFreePMR   = 1;
          END CASE;

		 -- (c) Récupérer la valeur pour le film
         -- Calculer un v_film_idx dépendant de (v_week_index, v_cinema_counter, v_salle_counter)
		  SET v_film_idx = ((v_week_index + v_cinema_counter + v_salle_counter - 1) MOD 15) + 1;
          call logTrace(CONCAT("Valeur de l'index",v_film_idx));
          SET v_film_varName = CONCAT('UUIDFilm', v_film_idx);
         
          SELECT varValue INTO v_film_realId
            FROM tmp_mapping
           WHERE varName = v_film_varName
           LIMIT 1;
		 
         IF v_film_realId IS NULL THEN
				-- Attribuer une valeur par défaut, ici 'UUIDFilm1'
				SET v_film_realId = UUIDFilm1;
		 END IF;
         
          -- (d) Insertion selon le set horaire
          IF v_time_set = 0 THEN
            -- SET 1
            INSERT INTO Seance
            (id, Filmid, Salleid, dateJour, hourBeginHHSMM, hourEndHHSMM,
             qualite, bo, numFreeSeats, numFreePMR, alertAvailibility)
            VALUES
            (UUID(), v_film_realId, v_salle_realId, v_day, '14:00', '17:00', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL),
            (UUID(), v_film_realId, v_salle_realId, v_day, '17:30', '19:00', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL),
            (UUID(), v_film_realId, v_salle_realId, v_day, '19:30', '22:00', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL),
            (UUID(), v_film_realId, v_salle_realId, v_day, '22:15', '00:30', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL);

          ELSE
            -- SET 2
            INSERT INTO Seance
            (id, Filmid, Salleid, dateJour, hourBeginHHSMM, hourEndHHSMM,
             qualite, bo, numFreeSeats, numFreePMR, alertAvailibility)
            VALUES
            (UUID(), v_film_realId, v_salle_realId, v_day, '13:30', '16:30', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL),
            (UUID(), v_film_realId, v_salle_realId, v_day, '17:00', '18:30', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL),
            (UUID(), v_film_realId, v_salle_realId, v_day, '19:00', '21:30', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL),
            (UUID(), v_film_realId, v_salle_realId, v_day, '21:45', '00:00', v_qualite, v_bo, v_numFreeSeats, v_numFreePMR, NULL);
          END IF;

          SET v_salle_counter = v_salle_counter + 1;
          SET v_film_idx = (v_film_idx MOD 15) + 1;
        END WHILE;

        SET v_cinema_counter = v_cinema_counter + 1;
      END WHILE;

      SET v_day = DATE_ADD(v_day, INTERVAL 1 DAY);
    END WHILE;
  
  END sp_generate_seances;
  

-- INSERT INTO Reservation
--   (Id, 
--   Utilisateurid, 
--   seanceid, 
--   stateReservation, 
--   numberPMR, 
--   evaluation, 
--   isEvaluationMustBeReview, 
--   note, 
--   isPromoFriandise, 
--   numberSeatsRestingBeforPromoFriandise,
--   imageQRCode )             
-- VALUES 
 --  (UUIDReservation1, UUIDUtilisateur1 , UUIDSeance1, "future", 0, null, 0, null, 0, 5,"imageQRCode.jpg"),
--  (UUIDReservation2, UUIDUtilisateur1 , UUIDSeance2, "doneUnevaluated", 0, null, 0, null, 0, 5, null),
--   (UUIDReservation3, UUIDUtilisateur1 , UUIDSeance3, "doneEvaluated", 1, "Film très bon. A voir absolument", 1, 4.5, 0, 2, null),
  
--   (UUIDReservation4, UUIDUtilisateur2 , UUIDSeance1, "future", 0, null, 0, null, 0, 5, "imageQRCode.jpg"),
--   (UUIDReservation5, UUIDUtilisateur2 , UUIDSeance2, "doneUnevaluated", 0, null, 0, null, 0, 5, null),
--   (UUIDReservation6, UUIDUtilisateur2 , UUIDSeance3, "doneEvaluated", 1, "Film très bon. A voir absolument", 1, 4.5, 0, 2, null),
  
--   (UUIDReservation7, UUIDUtilisateur3 , UUIDSeance1, "future", 0, null, 0, null, 1, 0, "imageQRCode.jpg"),
--   (UUIDReservation8, UUIDUtilisateur3 , UUIDSeance2, "doneUnevaluated", 0, null, 0, null, 0, 5, null),
--  (UUIDReservation9, UUIDUtilisateur3 , UUIDSeance3, "doneEvaluated", 0, "Bof Bof", 1, 3.5, 0, 2, null)
--  ;



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

-- INSERT INTO SeatsForTarif
--   (TarifQualiteid, 
--   ReservationId, 
--   numberSeats,
--   Price) 
-- VALUES 
--  (UUIDTarifQualite1, UUIDReservation1, 1,40.0),
--  (UUIDTarifQualite2, UUIDReservation1, 1,40.0),
--  (UUIDTarifQualite3, UUIDReservation2, 2,40.0),
--  (UUIDTarifQualite7, UUIDReservation3, 3,40.0),
--  (UUIDTarifQualite8, UUIDReservation3, 3,40.0)
--   ;
  
  END $$
DELIMITER ;

call InitBaseTest();
