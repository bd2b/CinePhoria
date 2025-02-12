CREATE TABLE Cinema (
  nameCinema  varchar(100) NOT NULL, 
  adresse     varchar(255) NOT NULL, 
  ville       varchar(255) NOT NULL, 
  postalcode  varchar(100) NOT NULL comment 'AU format incluant le pays, ex : F-75010', 
  emailCinema varchar(100) NOT NULL, 
  telCinema   varchar(255) NOT NULL, 
  ligne1      varchar(100) NOT NULL, 
  ligne2      varchar(100) NOT NULL, 
  PRIMARY KEY (nameCinema));
CREATE TABLE Compte (
  email                   varchar(100) NOT NULL, 
  isValidated             int(1) DEFAULT 0 NOT NULL, 
  passwordText            varchar(100), 
  datePassword            datetime NULL comment 'Date de dernier changement du mot de passe', 
  oldpasswordsArray       longtext comment 'Liste des mots de passe deja utilise', 
  dateDerniereConnexion   datetime NULL, 
  numTentativeConnexionKO int(10) DEFAULT 0 NOT NULL, 
  PRIMARY KEY (email), 
  UNIQUE INDEX (email));
CREATE TABLE Connexions (
  ID            int(10) NOT NULL AUTO_INCREMENT, 
  dateConnexion datetime NOT NULL, 
  email         varchar(100) NOT NULL, 
  PRIMARY KEY (ID));
CREATE TABLE Employe (
  matricule        int(10) NOT NULL AUTO_INCREMENT, 
  email            varchar(100) NOT NULL, 
  isAdministrateur int(1) DEFAULT 0 NOT NULL, 
  lastnameEmploye  varchar(100), 
  firstnameEmploye varchar(100), 
  PRIMARY KEY (matricule));
CREATE TABLE Employe_Cinema (
  nameCinema varchar(100) NOT NULL, 
  matricule  int(10) NOT NULL, 
  PRIMARY KEY (nameCinema, 
  matricule));
CREATE TABLE Film (
  id                   varchar(100) NOT NULL comment 'UUID', 
  titleFilm            varchar(255) NOT NULL, 
  filmPitch            varchar(255), 
  genreArray           varchar(255) NOT NULL, 
  duration             varchar(100) NOT NULL, 
  linkBO               varchar(100) NOT NULL, 
  dateSortieCinePhoria date, 
  categorySeeing       varchar(100) NOT NULL, 
  note                 double NOT NULL, 
  isCoupDeCoeur        int(1) NOT NULL, 
  filmDescription      longtext NOT NULL, 
  filmAuthor           varchar(100) NOT NULL, 
  filmDistribution     varchar(255) NOT NULL, 
  imageFilm128         varchar(255) NOT NULL, 
  imageFilm1024        varchar(255) NOT NULL, 
  PRIMARY KEY (id), 
  INDEX (titleFilm));
CREATE TABLE Incident (
  id          int(10) NOT NULL AUTO_INCREMENT, 
  Salleid     varchar(100) NOT NULL, 
  matricule   int(10) NOT NULL, 
  status      varchar(100) NOT NULL, 
  title       varchar(100) NOT NULL, 
  description longtext NOT NULL, 
  dateOpen    datetime NOT NULL, 
  dateClose   datetime NULL, 
  PRIMARY KEY (id));
CREATE TABLE Reservation (
  id                                    varchar(100) NOT NULL, 
  Utilisateurid                         varchar(100) NOT NULL, 
  Seanceid                              varchar(100) NOT NULL, 
  stateReservation                      varchar(100) NOT NULL, 
  numberPMR                             int(1) NOT NULL, 
  evaluation                            varchar(255), 
  isEvaluationMustBeReview              int(1) DEFAULT 0 NOT NULL, 
  note                                  double, 
  isPromoFriandise                      int(1) DEFAULT 0 NOT NULL, 
  numberSeatsRestingBeforPromoFriandise int(3) DEFAULT 1000 NOT NULL, 
  imageQRCode                           varchar(100), 
  timeStampCreate                       timestamp NULL, 
  CONSTRAINT id 
    PRIMARY KEY (id));
CREATE TABLE Salle (
  id         varchar(100) NOT NULL, 
  nameCinema varchar(100) NOT NULL, 
  nameSalle  varchar(100) NOT NULL, 
  capacity   int(7) NOT NULL, 
  numPMR     int(7) NOT NULL, 
  PRIMARY KEY (id));
CREATE TABLE Seance (
  id                varchar(100) NOT NULL, 
  Filmid            varchar(100) NOT NULL, 
  Salleid           varchar(100) NOT NULL, 
  dateJour          date NOT NULL, 
  hourBeginHHSMM    varchar(100), 
  hourEndHHSMM      varchar(100), 
  qualite           varchar(255), 
  bo                varchar(255), 
  numFreeSeats      int(10) NOT NULL, 
  numFreePMR        int(10) NOT NULL, 
  alertAvailibility varchar(100) comment 'Si NULL pas d''alerte sinon dernieres places ou sold out', 
  PRIMARY KEY (id));
CREATE TABLE SeatsForTarif (
  ID             int(10) NOT NULL AUTO_INCREMENT, 
  TarifQualiteid varchar(100) NOT NULL, 
  ReservationId  varchar(100) NOT NULL, 
  numberSeats    int(1) NOT NULL, 
  PRIMARY KEY (ID));
CREATE TABLE TableTrace (
  idInt      INT AUTO_INCREMENT NOT NULL, 
  trace_time timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  message    text NOT NULL, 
  PRIMARY KEY (idInt));
CREATE TABLE TarifQualite (
  id        varchar(100) NOT NULL, 
  qualite   varchar(100) NOT NULL, 
  nameTarif varchar(100) NOT NULL, 
  price     double NOT NULL, 
  PRIMARY KEY (id));
CREATE TABLE Utilisateur (
  id              varchar(100) NOT NULL, 
  email           varchar(100) NOT NULL, 
  displayName     varchar(100) NOT NULL, 
  timeStampCreate timestamp NULL, 
  PRIMARY KEY (id));
CREATE VIEW ViewComptePersonne AS

SELECT 
	compte.email, 
	compte.dateDerniereConnexion,
    compte.isValidated,
    utilisateur.id as utilisateurid,
    utilisateur.displayName as utilisateurDisplayName,
    null as matricule,
    null as isAdministrateur,
    null as lastnameEmploye,
    null as firstnameEmploye,
    null as nameCinema
FROM Compte
JOIN Utilisateur ON compte.email = utilisateur.email

UNION

SELECT 
compte.email, 
	compte.dateDerniereConnexion,
    compte.isValidated,
    Null as utilisateurid,
    Null as utilisateurdisplayName,
    employe.matricule as matricule,
    employe.isAdministrateur as isAdministrateur,
    employe.lastnameEmploye as lastnameEmploye,
    employe.firstnameEmploye as firstnameEmploye,
    employe_cinema.nameCinema as nameCinema
FROM Compte
JOIN Employe ON compte.email = employe.email
JOIN Employe_Cinema ON employe.matricule = employe_cinema.matricule;
CREATE VIEW ViewFilmReservationDate AS
    SELECT filmTitre, jour, SUM(Places) AS totalPlaces
FROM (
    SELECT 
        Film.titleFilm AS FilmTitre, 
        Seance.dateJour AS Jour, 
        SeatsForTarif.numberSeats AS Places
    FROM Reservation
    INNER JOIN SeatsForTarif ON Reservation.id = SeatsForTarif.ReservationId
    INNER JOIN Seance ON Reservation.SeanceId = Seance.id
    INNER JOIN Film ON Seance.FilmId = Film.id
) AS SubQuery
GROUP BY FilmTitre, Jour;
CREATE VIEW ViewFilmsSeancesSalle AS

SELECT
  Seance.id AS seanceId , 
  Seance.Filmid AS filmId,
  Seance.Salleid AS salleId, 
  Seance.dateJour, 
  Seance.hourBeginHHSMM, 
  Seance.hourEndHHSMM, 
  Seance.qualite, 
  Seance.bo,
  Seance.numFreeSeats,
  Seance.numFreePMR,
  Seance.alertAvailibility,
  Film.titleFilm,
  Film.filmPitch,
  Film.duration, 
  Film.genreArray,
  Film.filmDescription, 
  Film.filmAuthor, 
  Film.filmDistribution,
  Film.dateSortieCinePhoria,
  Film.note, 
  Film.isCoupDeCoeur,
  Film.categorySeeing,    
  Film.linkBO, 
  Film.imageFilm128,
  Film.imageFilm1024,
  Salle.nameSalle, 
  Salle.nameCinema, 
  Salle.capacity, 
  Salle.numPMR,
  Cinema.adresse, 
  Cinema.ville, 
  Cinema.postalcode, 
  Cinema.emailCinema, 
  Cinema.telCinema 
  
FROM Seance
INNER JOIN Film ON Seance.Filmid = Film.id
INNER JOIN Salle ON Seance.Salleid = Salle.id
INNER JOIN Cinema ON Salle.nameCinema = Cinema.nameCinema
WHERE
       ( Seance.dateJour  >= CURRENT_DATE)
;
CREATE VIEW ViewFilmsSortiesDeLaSemaine AS
 SELECT 
        film.titleFilm AS titleFilm,
        film.filmPitch AS filmPitch,
        film.duration AS duration,
        film.genreArray AS genreArray,
        film.filmDescription AS filmDescription,
        film.filmAuthor AS filmAuthor,
        film.filmDistribution AS filmDistribution,
        film.dateSortieCinePhoria AS dateSortieCinePhoria,
        film.note AS note,
        film.isCoupDeCoeur AS isCoupDeCoeur,
        film.categorySeeing AS categorySeeing,
        film.linkBO AS linkBO,
        film.imageFilm128 AS imageFilm128,
        film.imageFilm1024 AS imageFilm1024
        
    FROM
        film
    WHERE
        (film.dateSortieCinePhoria = (CURDATE() - INTERVAL (((WEEKDAY(CURDATE()) - 2) + 7) % 7) DAY));
CREATE VIEW ViewFilmsSortiesRecentes AS
SELECT
  Seance.id AS seanceId , 
  Seance.Filmid AS filmId,
  Seance.Salleid AS salleId, 
  Seance.dateJour, 
  Seance.hourBeginHHSMM, 
  Seance.hourEndHHSMM, 
  Seance.qualite, 
  Seance.bo,
  Seance.numFreeSeats,
  Seance.numFreePMR,
  Seance.alertAvailibility,
  Film.titleFilm,
  Film.filmPitch,
  Film.duration, 
  Film.genreArray,
  Film.filmDescription, 
  Film.filmAuthor, 
  Film.filmDistribution,
  Film.dateSortieCinePhoria,
  Film.note, 
  Film.isCoupDeCoeur,
  Film.categorySeeing,    
  Film.linkBO, 
  Film.imageFilm128,
  Film.imageFilm1024,
  Salle.nameSalle, 
  Salle.nameCinema, 
  Salle.capacity, 
  Salle.numPMR,
  Cinema.adresse, 
  Cinema.ville, 
  Cinema.postalcode, 
  Cinema.emailCinema, 
  Cinema.telCinema 
  
FROM Seance
INNER JOIN Film ON Seance.Filmid = Film.id
INNER JOIN Salle ON Seance.Salleid = Salle.id
INNER JOIN Cinema ON Salle.nameCinema = Cinema.nameCinema

WHERE Film.dateSortieCinePhoria = DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) - 2 + 7) % 7 DAY);
CREATE VIEW ViewUtilisateurReservation AS
SELECT 
    utilisateurid AS utilisateurId,
    reservation.id AS reservationId,
    reservation.statereservation AS statereservation,
    reservation.timestampcreate AS timestampcreate,
    utilisateur.displayname AS displayname,
    seance.dateJour AS dateJour,
    film.titleFilm AS titleFilm,
    cinema.nameCinema AS nameCinema,
    reservation.note AS note,
    reservation.evaluation as evaluation,
    SUM(seatsForTarif.numberSeats) AS totalSeats,
    SUM(tarifQualite.price * seatsForTarif.numberSeats) AS totalPrice,
    reservation.numberPmr as numberPMR,
    film.id as filmId,
    seance.id as seanceId,
    utilisateur.email as email
FROM Utilisateur
JOIN Reservation ON Reservation.utilisateurId = Utilisateur.id
JOIN SeatsForTarif ON SeatsForTarif.ReservationId = Reservation.id 
JOIN TarifQualite ON SeatsForTarif.tarifQualiteId = TarifQualite.id
JOIN Seance ON Reservation.Seanceid = Seance.id
JOIN Film ON Seance.Filmid = Film.id
JOIN Salle ON Salle.id = Seance.Salleid
JOIN Cinema ON Salle.nameCinema = Cinema.nameCinema
-- WHERE Utilisateur.email = "claire@mail.fr"
GROUP BY Reservation.id, seance.dateJour, film.titleFilm, cinema.nameCinema, reservation.note, reservation.evaluation;
ALTER TABLE Seance ADD CONSTRAINT FKSeance628062 FOREIGN KEY (Salleid) REFERENCES Salle (id);
ALTER TABLE SeatsForTarif ADD CONSTRAINT comprend FOREIGN KEY (ReservationId) REFERENCES Reservation (id);
ALTER TABLE Incident ADD CONSTRAINT concerne FOREIGN KEY (Salleid) REFERENCES Salle (id);
ALTER TABLE Incident ADD CONSTRAINT déclare FOREIGN KEY (matricule) REFERENCES Employe (matricule);
ALTER TABLE Employe_Cinema ADD CONSTRAINT embauche FOREIGN KEY (nameCinema) REFERENCES Cinema (nameCinema);
ALTER TABLE SeatsForTarif ADD CONSTRAINT `est applique` FOREIGN KEY (TarifQualiteid) REFERENCES TarifQualite (id);
ALTER TABLE Reservation ADD CONSTRAINT `est choisi par` FOREIGN KEY (Seanceid) REFERENCES Seance (id);
ALTER TABLE Employe ADD CONSTRAINT `est detenu par` FOREIGN KEY (email) REFERENCES Compte (email);
ALTER TABLE Seance ADD CONSTRAINT `est projete` FOREIGN KEY (Filmid) REFERENCES Film (id);
ALTER TABLE Utilisateur ADD CONSTRAINT `est relatif  a` FOREIGN KEY (email) REFERENCES Compte (email);
ALTER TABLE Salle ADD CONSTRAINT possede FOREIGN KEY (nameCinema) REFERENCES Cinema (nameCinema);
ALTER TABLE Reservation ADD CONSTRAINT prend FOREIGN KEY (Utilisateurid) REFERENCES Utilisateur (id);
ALTER TABLE Connexions ADD CONSTRAINT `se connecte` FOREIGN KEY (email) REFERENCES Compte (email);
ALTER TABLE Employe_Cinema ADD CONSTRAINT `travail au` FOREIGN KEY (matricule) REFERENCES Employe (matricule);
DROP PROCEDURE IF EXISTS CheckAvailabilityAndReserve;
DELIMITER $$
CREATE PROCEDURE CheckAvailabilityAndReserve(
    IN p_email VARCHAR(100),
    IN p_SeanceId VARCHAR(100),
    IN p_TarifSeats JSON,
    IN p_PMRSeats INT,
    OUT p_Result VARCHAR(255) -- Chaine ("StatutEmail", "StatutReservation")
)
-- Création d'une reservation avec des places sur tarif et un nombre de place PMR
-- La reservation doit etre confirmée en mettant à null timeStampCreate
-- Resultat = chaine de caractere composé de 
-- statut, utilisateurId et de reservationId dans lequel statut= 'Compte Provisoire' ou 'Compte Confirme' 
-- ou d'un chaine de caractère avec Erreur :
-- Suppression du parametre utilisateurID : si le mail n'existe pas dans compte, on cree un utilisateur a la volee

BEGIN
    DECLARE v_utilisateur_exist INT;
    DECLARE v_utilisateurID VARCHAR(100);
    DECLARE v_timeStampCreate TIMESTAMP ;
    DECLARE v_return VARCHAR(100);
    DECLARE v_statut_compte VARCHAR(100);
    DECLARE v_available_seats INT;
    DECLARE v_available_pmr INT;
    DECLARE v_alert_status VARCHAR(100);
    DECLARE v_statut_email VARCHAR(100) DEFAULT "Erreur : email pas evalue";
    DECLARE v_statut_reservation VARCHAR(100);
    DECLARE v_newReservationId VARCHAR(100) DEFAULT UUID();
    
    DECLARE v_message_erreur VARCHAR(255);
    DECLARE v_num INT;

    -- Variables pour JSON_TABLE
    DECLARE v_key_index INT DEFAULT 0;
    DECLARE v_key_count INT DEFAULT 0;
    DECLARE v_current_key VARCHAR(255);
    DECLARE v_current_value INT;
    DECLARE v_total_sum INT;
    
   -- Gestion des erreurs
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
    -- En cas d'erreur SQL, effectuer un rollback
	ROLLBACK;
	SET p_Result =  CONCAT(v_statut_email, ",", "Erreur : erreur interne SQL = ",v_message_erreur);
	END;
    
    -- Calculer le nombre de clés dans le JSON
    SET v_key_count = JSON_LENGTH(JSON_KEYS(p_TarifSeats));
    
    -- Initialiser la somme totale de place
    SET v_total_sum = 0;

    -- Initialiser le résultat de la procedure
    SET p_Result = "Ok";
    
    -- Initialiser le statut du compte utilisateur
    SET v_statut_compte = 'Compte Confirme';
	
    -- Début de la transaction
    START TRANSACTION;
    
    -- Début d'un bloc labellisé
    block_label: BEGIN
    
		-- Vérification des parametres
        SELECT COUNT(*) INTO  v_num from Seance where id = p_SeanceId;
        
        IF  v_num = 0  THEN
            SET v_statut_reservation = "Erreur : Parametre seance_id non valide";
            SET p_Result = CONCAT("NA",",",v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;
        

        -- Récupérer l'alerte de disponibilité et le nombre de places disponibles et verrouillage de la ligne
        SELECT numFreeSeats, numFreePMR, alertAvailibility
        INTO v_available_seats, v_available_pmr, v_alert_status
        FROM Seance
        WHERE id = p_SeanceId
        FOR UPDATE;
        
  --      DO SLEEP(10); -- Simule une attente de 10 secondes

        -- Recherche de l'email et de l'id Utilisateur
        -- Si il n'existe pas on le cree
        -- Si l'utilisateur est provisoire on modifie le statut_compte
        SET v_utilisateur_exist = (
            SELECT COUNT(*)
            FROM Utilisateur
            WHERE Utilisateur.email = p_email
        );

        IF v_utilisateur_exist = 0 THEN
            CALL CreateUtilisateur(p_email, UUID(), "Compte provisoire", v_return);
            IF LEFT(v_return, 6) = "Erreur"  THEN
				-- Procedure en erreur, on remonte l'erreur
				SET v_statut_email = CONCAT('Erreur : createuser ->' , v_return);
                SET p_Result = CONCAT("NA",",",v_statut_email, ",", v_statut_reservation);
				ROLLBACK;
				LEAVE block_label;
			ELSE
				-- Utilisateur provisoire cree
				SET v_statut_email = v_return;
                SET v_utilisateurID = v_return;
                SET v_statut_compte = 'Compte Provisoire';
            END IF;
            
        ELSE
			
            SELECT id, timeStampCreate
			INTO v_utilisateurID, v_timeStampCreate
			FROM Utilisateur
			WHERE Utilisateur.email = p_email;
            
            SET v_statut_email = v_utilisateurID;
	
            
            if v_timeStampCreate is not null THEN
				SET v_statut_compte = 'Compte Provisoire';
             END IF;   
            
        END IF;
        
        

		-- Si on n'a pas de JSON bien forme
        IF v_key_count = 0 THEN
            SET v_statut_reservation = "Erreur : parametre SeatsForTarif invalide";
            SET p_Result = CONCAT(v_statut_compte,',',v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;


        -- Si la séance est "Sold out", renvoyer directement "Pas assez de place"
        IF v_alert_status = 'Sold out' THEN
            SET v_statut_reservation = "Erreur : pas assez de place";
            SET p_Result = CONCAT(v_statut_compte,',',v_statut_compte,',',v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;

        -- Parcourir les clés pour calculer la somme
		WHILE v_key_index < v_key_count DO
       
			-- Extraire la clé actuelle
			SET v_current_key = JSON_UNQUOTE(
            JSON_EXTRACT(JSON_KEYS(p_TarifSeats), CONCAT('$[', v_key_index, ']'))
			);
            
            -- Verification de l'existence du tarif
            SELECT count(*) INTO  v_num from TarifQualite where id = v_current_key;
			IF  v_num = 0  THEN
				SET v_statut_reservation = "Erreur : Parametre TarifQualite non valide";
				SET p_Result = CONCAT(v_statut_compte,",",v_statut_email, ",", v_statut_reservation);
				ROLLBACK;
				LEAVE block_label;
			END IF;

			-- Extraire la valeur associée à cette clé
			SET v_current_value = CAST(
				JSON_UNQUOTE(JSON_EXTRACT(p_TarifSeats, CONCAT('$."', v_current_key, '"')))
				AS UNSIGNED
			);

			-- Ajouter la valeur à la somme totale
			SET v_total_sum = v_total_sum + v_current_value;

			-- Passer à la clé suivante
			SET v_key_index = v_key_index + 1;
		END WHILE;
 
        -- Vérifier la disponibilité des places générales
        IF v_total_sum > v_available_seats THEN
            SET v_statut_reservation = "Erreur : pas assez de place";
            SET p_Result = CONCAT(v_statut_compte,',',v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;

        -- Vérifier la disponibilité des places PMR
        IF p_PMRSeats > v_available_pmr THEN
            SET v_statut_reservation = "Erreur : pas assez de place PMR";
            SET p_Result = CONCAT(v_statut_compte,',',v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;

        -- Si les places sont disponibles, les réserver en mettant à jour la table Seance
        SET v_message_erreur = "Mise a jour Seance : ajout des places";
		UPDATE Seance
			SET 
				numFreeSeats = numFreeSeats - v_total_sum,
				numFreePMR = numFreePMR - p_PMRSeats
			WHERE id = p_SeanceId
            ;

			-- Générer une nouvelle réservation
			SET v_message_erreur = "Mise a jour Reservation : insertion";
			INSERT INTO Reservation
				(Id, Utilisateurid, seanceid, stateReservation, numberPMR,timeStampCreate)
			VALUES
				(v_newReservationId, v_utilisateurID, p_SeanceId, "ReserveToConfirm", p_PMRSeats, CURRENT_TIMESTAMP);
			-- Insérer les données dans SeatsForTarif pour chaque élément du dictionnaire JSON
			SET v_key_index = 0;
			WHILE v_key_index < v_key_count DO
           
				-- Extraire la clé actuelle
				SET v_current_key = JSON_UNQUOTE(
					JSON_EXTRACT(JSON_KEYS(p_TarifSeats), CONCAT('$[', v_key_index, ']'))
				);

				-- Extraire la valeur associée à cette clé
				SET v_current_value = CAST(
					JSON_UNQUOTE(JSON_EXTRACT(p_TarifSeats, CONCAT('$."', v_current_key, '"')))
					AS UNSIGNED
				);
                SET v_message_erreur = "Mise a jour SeatsForTarif : Insertion";
				INSERT INTO SeatsForTarif
					(TarifQualiteid, ReservationId, numberSeats)
				VALUES
					(v_current_key, v_newReservationId, v_current_value);

				-- Passer à la clé suivante
				SET v_key_index = v_key_index + 1;
			END WHILE;
            
			-- Tout s'est bien passé, on valide la transaction
			COMMIT;
            
			-- Retourne l'id de réservation
			SET v_statut_reservation = v_newReservationId;
            
            -- Retourne le resultat complet
			SET p_Result = CONCAT(v_statut_compte,",",v_statut_email, ",", v_statut_reservation);
		
		END block_label;
END $$
DELIMITER ;
-- Select pour gérer le point virgule de fin
SELECT 1 ;
-- Select pour gérer le point virgule de fin
SELECT 1 ;
DROP PROCEDURE IF EXISTS CreateUtilisateur;
DELIMITER $$
CREATE PROCEDURE CreateUtilisateur(
    IN p_email VARCHAR(100),
    IN p_passwordText VARCHAR(100),
    IN p_displayName VARCHAR(100),
    OUT p_Result VARCHAR(255) 
)
-- Création d'un utilisateur qui engendre la creation d'un compte. L'utilisateur est créer à confirmer en mettant le timeStampCreate à null , de meme le compte avec isValidated = 0
-- Retour utilisateurId ou "Erreur : erreur interne procedure." ou "Erreur : email existant." ou "Erreur : utilisateur existant"
BEGIN
	DECLARE v_utilisateur_exist INT;
    DECLARE v_compte_exist INT;
    DECLARE v_utilisateurId VARCHAR(100);
    DECLARE v_codeConfirmMail VARCHAR(100);

 -- Gestion des erreurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- En cas d'erreur SQL, effectuer un rollback
        ROLLBACK;
        SET p_Result =  "Erreur : erreur interne procedure.";
    END;
    
block_label: BEGIN
 -- Recherche de l'email pour test existence
	SET v_utilisateur_exist = (
		SELECT COUNT(*)
		FROM Utilisateur
		WHERE Utilisateur.email = p_email
	);

	IF v_utilisateur_exist > 0 THEN
		SET p_Result = "Erreur : utilisateur existant";
		LEAVE block_label;
	END IF;
    
    -- Recherche du compte pour test existence
	SET v_compte_exist = (
		SELECT COUNT(*)
		FROM Compte
		WHERE Compte.email = p_email
	);

	IF v_compte_exist > 0 THEN
		SET p_Result = "Erreur : email existant";
		LEAVE block_label;
	END IF;
    
    -- Generation du code de confirmation du mail qu'on va stocker dans oldpasswordarray
    SET v_codeConfirmMail = LPAD(FLOOR(RAND() * 1000000), 6, '0');
        
	-- Début de la transaction
    START TRANSACTION;
    
    INSERT INTO Compte
		(email,  isValidated, passwordText, datePassword, oldpasswordsArray) 
	VALUES 
		(p_email, 0, p_passwordText, NOW(), v_codeConfirmMail)
	;
        
	set v_utilisateurId = UUID();
	INSERT INTO Utilisateur 
		(id, email, displayName, timeStampCreate) 
	VALUES 
		(v_utilisateurId, p_email , p_displayName, CURRENT_TIMESTAMP)
	;
	-- Tout s'est bien passé, on valide la transaction
	COMMIT;
            
	-- Retourne l'id de l'utilisateur
	SET p_Result = v_utilisateurId;

END block_label;
END $$
DELIMITER ;
select 1;
DROP PROCEDURE IF EXISTS ConfirmUtilisateur;
DELIMITER $$
CREATE PROCEDURE ConfirmUtilisateur(
    IN p_utilisateurId VARCHAR(100),
    IN p_password VARCHAR(100),  -- doit etre verifié et hashé à la source
    IN p_displayName VARCHAR(100),
     OUT p_Result VARCHAR(255)
     )
     -- L'utilisateur est confirmé en mettant le timeStampCreate a null et le compte est valider en mettant isValidated à 1
     -- On met à jour le displayName de l'utilisateur
     -- On ne met pas a jour la table compte car le mail doit etre confirmé
     -- Retour "OK" ou "Erreur : xxxxxxxxx" ou "Warning : yyyyyyyyy"
	 -- xxx = "erreur interne procedure." , "utilisateurId non valide." 
     -- yyy = "utilisateur deja confirme."
     
     BEGIN
     
     DECLARE v_email VARCHAR(100);
     DECLARE v_timeStampCreate timestamp;
     
     -- Gestion des erreurs
     DECLARE EXIT HANDLER FOR SQLEXCEPTION
     BEGIN
        -- En cas d'erreur SQL, effectuer un rollback
        ROLLBACK;
        SET p_Result =  "Erreur : erreur interne procedure";
	 END;
    
    START transaction;
    
     -- Début d'un bloc labellisé
    block_label: BEGIN
    
     -- Recherche de l'email et de l'id Utilisateur
       
            SELECT email, timeStampCreate
            FROM Utilisateur
            WHERE Utilisateur.id = p_utilisateurId
			INTO v_email, v_timeStampCreate
        ;

        IF v_email is null THEN
            SET p_Result = CONCAT("Erreur : utilisateurId non valide -> ", p_utilisateurId);
            ROLLBACK;
			LEAVE block_label;
        END IF;
        
        IF v_timeStampCreate is null THEN
			SET p_Result = CONCAT("Warning : Utilisateur deja confirme -> ", p_utilisateurId);
            LEAVE block_label;
        END IF;
    
     UPDATE Utilisateur
     SET timeStampCreate = NULL,
			 displayName = p_displayName
     WHERE email = v_email;
     
     UPDATE Compte
     SET passwordText = p_password
     WHERE email = v_email;
     
     Commit;
     SET p_Result = "OK";
      -- Début d'un bloc labellisé
    END block_label ;
END$$
DELIMITER ;
select 1;
DROP PROCEDURE IF EXISTS ConfirmCompte;
DELIMITER $$
CREATE PROCEDURE ConfirmCompte(
    IN p_email VARCHAR(100),
    IN p_codeConfirmMail VARCHAR(100), 
     OUT p_Result VARCHAR(255)
     )
     -- L'utilisateur demande la confirmation de son mail en saisissant un code qu'il reçoit par email
     -- La valeut de ce code est stockée dans oldpasswordarray
     -- La confirmation verifie que le code fournit est egal à la valeur stockée pour le compte de l'email
     -- En cas d'echec on memorise le nombre de tentative dans oldpasswordarray en rajoutant un digit de 1 à 9 apres une ',' 
     -- Si on atteint 9, on bloque en retournant systematiquement l'erreur "nombre maximal de tentative atteint" 
     -- Retour "OK" ou "Erreur : xxxxxxxxx" 
	 -- xxx = "email inconnu." , "code non valide" , "nombre maximal de tentative atteint" , "compte deja valide"
     
     
     BEGIN
     
     DECLARE v_codeConfirmMailStocke VARCHAR(100);
     DECLARE v_codeStocke VARCHAR(100);
     DECLARE v_nombreTentative INT;
     DECLARE v_isValidated INT;
     
     -- Gestion des erreurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- En cas d'erreur SQL, effectuer un rollback
        ROLLBACK;
        SET p_Result =  "Erreur : erreur interne procedure";
	END;
    
    START transaction;
    
     -- Début d'un bloc labellisé
    block_label: BEGIN
    
     -- Recherche du code stocke
       
            SELECT oldpasswordsArray, isValidated
            FROM Compte
            WHERE Compte.email  = p_email
			INTO v_codeStocke, v_isValidated
        ;

		IF v_isValidated = 1 THEN
            SET p_Result = CONCAT("Erreur : compte deja valide -> ", p_email);
            ROLLBACK;
			LEAVE block_label;
        END IF;
        
        IF v_codeStocke is null THEN
            SET p_Result = CONCAT("Erreur : email inconnu -> ", p_email);
            ROLLBACK;
			LEAVE block_label;
        END IF;
        
        -- Extraire les 6 premiers caractères
		SET v_codeConfirmMailStocke = LEFT(v_codeStocke, 6);
        
        -- Extraire la deuxième partie après la virgule si elle existe, sinon assigner 0
		SET v_nombreTentative = IF(LOCATE(',', v_codeStocke) > 0, 
                         CAST(SUBSTRING_INDEX(v_codeStocke, ',', -1) AS UNSIGNED), 
                         0);
        
        IF v_nombreTentative = 9 THEN
			SET p_Result = "Erreur : nombre maximal de tentative atteint";
            ROLLBACK;
            LEAVE block_label;
        END IF;
        
        
        IF v_codeConfirmMailStocke <> p_codeConfirmMail THEN
			-- Code fourni errone
			SET v_nombreTentative = v_nombreTentative + 1;
			SET p_Result = CONCAT("Erreur : code non valide -> ", p_codeConfirmMail, " nombre tentative = ", v_nombreTentative);
            
            -- On met a jour la valkeur stockée
            UPDATE Compte
            SET oldpasswordsArray = CONCAT(v_codeConfirmMailStocke,",",v_nombreTentative)
            WHERE email = p_email;
            commit;
            LEAVE block_label;
        END IF;
     -- Le code est valide, on confirme le mail
     UPDATE Compte
     SET 	isValidated = 1,
				oldpasswordsArray = ""
     WHERE email = p_email;
     
     Commit;
     SET p_Result = "OK";
      -- fin d'un bloc labellisé
    END block_label ;
END$$
DELIMITER ;
select 1;
DROP PROCEDURE IF EXISTS ApplyLogin;
DELIMITER $$

CREATE PROCEDURE applyLogin(
    IN p_email VARCHAR(100),
    IN p_statutLogin INT, -- 0 pour échec, 1 pour succès
    IN p_message VARCHAR(255),
    IN p_maxTentative INT, -- Nombre maximum de tentatives
    IN p_numTentativeConnexionKO INT -- Nombre actuel de tentatives échouées
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Gestion des erreurs SQL : rollback et log
        ROLLBACK;
        CALL logTrace(CONCAT('Erreur interne : ', p_message));
    END;

    START TRANSACTION;

    -- Si le login a échoué
    IF p_statutLogin = 0 THEN
        -- Incrémenter le nombre de tentatives
        SET p_numTentativeConnexionKO = p_numTentativeConnexionKO + 1;

        -- Vérifier si le nombre maximum de tentatives est dépassé
        IF p_numTentativeConnexionKO >= p_maxTentative THEN
            -- Bloquer le compte
            UPDATE Compte
            SET isValidated = -1,
                numTentativeConnexionKO = p_numTentativeConnexionKO
            WHERE email = p_email;

            CALL logTrace(CONCAT(p_email, ' Erreur : compte bloqué après trop de tentatives.'));
        ELSE
            -- Mettre à jour le nombre de tentatives
            UPDATE Compte
            SET numTentativeConnexionKO = p_numTentativeConnexionKO
            WHERE email = p_email;

            CALL logTrace(p_message);
        END IF;

    -- Si le login est réussi
    ELSEIF p_statutLogin = 1 THEN
        -- Réinitialiser les tentatives et mettre à jour la date de connexion
        UPDATE Compte
        SET numTentativeConnexionKO = 0,
            dateDerniereConnexion = NOW()
        WHERE email = p_email;

        -- Enregistrer une trace dans les connexions
        INSERT INTO Connexions (dateConnexion, email)
        VALUES (NOW(), p_email);
    END IF;

    COMMIT;
END$$

DELIMITER ;
select 1;
DROP PROCEDURE IF EXISTS PurgeOldUsers;
DELIMITER $$

CREATE PROCEDURE PurgeOldUsers(
    IN p_seconds INT -- Le délai en secondes
)
-- Supprime en cascade toutes les utilisateurs qui ont un timestampcreate vieux de plus de p_seconds, supprime son compte ses reservations, et ses SeatsForTarif
-- Est destiné a etre executé en batch a intervalle régulier

BEGIN
    DECLARE v_current_time TIMESTAMP;
    DECLARE num_ligne INT;
    
-- Gestion des erreurs SQL
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	 BEGIN
        -- En cas d'erreur SQL, effectuer un rollback
        ROLLBACK;
        CALL logTrace('PurgeOldUsers: ROLLBACK déclenché en raison d\'une erreur SQL : ');
	END;

    -- Obtenez l'heure actuelle
    SET v_current_time = CURRENT_TIMESTAMP;

    -- Supprimez les tables temporaires si elles existent déjà
    DROP TEMPORARY TABLE IF EXISTS TempUsersToDelete;
    DROP TEMPORARY TABLE IF EXISTS TempReservationToDelete;
    DROP TEMPORARY TABLE IF EXISTS TempSeatsForTarifToDelete;

    -- Démarrez une transaction
    START TRANSACTION;

    -- Création d'une table temporaire pour stocker les utilisateurs à supprimer
    CREATE TEMPORARY TABLE TempUsersToDelete AS
    SELECT email, id
    FROM Utilisateur
    WHERE TIMESTAMPDIFF(SECOND, timeStampCreate, v_current_time) > p_seconds;

    -- Création d'une table temporaire pour stocker les reservations à supprimer
    CREATE TEMPORARY TABLE TempReservationToDelete AS
    SELECT id
    FROM Reservation
    WHERE Utilisateurid IN (SELECT id FROM TempUsersToDelete);

    -- Création d'une table temporaire pour stocker les SeatsForTarif à supprimer
    CREATE TEMPORARY TABLE TempSeatsForTarifToDelete AS
    SELECT ReservationId
    FROM SeatsForTarif
    WHERE ReservationId IN (SELECT id FROM TempReservationToDelete);

    -- Log et debug
    -- Suppression des SeatsForTarif
    set num_ligne = (select count(*) from TempSeatsForTarifToDelete);
    CALL logTrace(CONCAT("SeatsForTarif : suppression en cours -> ",num_ligne));
    DELETE FROM SeatsForTarif
    WHERE ReservationId IN (SELECT ReservationId FROM TempSeatsForTarifToDelete);
    
    -- Suppression des Reservations
    set num_ligne = (select count(*) from TempReservationToDelete);
    CALL logTrace(CONCAT("Reservation : suppression en cours -> ",num_ligne));
    DELETE FROM Reservation
    WHERE id IN (SELECT id FROM TempReservationToDelete);

    -- Suppression des utilisateurs
    set num_ligne = (select count(*) from TempUsersToDelete);
    CALL logTrace(CONCAT("utilisateurs : suppression en cours -> ",num_ligne));
    DELETE FROM Utilisateur
    WHERE id IN (SELECT id FROM TempUsersToDelete);

    -- Suppression des comptes
    set num_ligne = (select count(*) from TempUsersToDelete);
    CALL logTrace(CONCAT("comptes : suppression en cours -> ",num_ligne));
    DELETE FROM Compte
    WHERE email IN (SELECT email FROM TempUsersToDelete);

    -- Supprimez les tables temporaires
    DROP TEMPORARY TABLE IF EXISTS TempUsersToDelete;
    DROP TEMPORARY TABLE IF EXISTS TempReservationToDelete;
    DROP TEMPORARY TABLE IF EXISTS TempSeatsForTarifToDelete;

    -- Validez la transaction
    COMMIT;

    CALL logTrace('PurgeOldUsers validée avec succès.');
END$$

DELIMITER ;
select 1;
DROP PROCEDURE IF EXISTS ConfirmReserve;
DELIMITER $$
CREATE PROCEDURE ConfirmReserve(
    IN p_reservationId VARCHAR(100),
    OUT p_Result VARCHAR(255)
)
-- Confirmation d'une reservation : consiste a mettre le timeStampCreate à null
-- Retour "OK" ou "Erreur : erreur interne procedure." ou "Erreur :reservation Id non valide." ou "Warning : reservation deja confirmee"

 BEGIN
     
     DECLARE v_reservartion_exist INT;
     DECLARE v_timeStampCreate timestamp;
     
     -- Gestion des erreurs
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- En cas d'erreur SQL, effectuer un rollback
        ROLLBACK;
        SET p_Result =  "Erreur : erreur interne procedure";
	END;
    START transaction;
    
     -- Début d'un bloc labellisé
    block_label: BEGIN
    
	-- Recherche de la reservation
	set v_reservartion_exist = (
    SELECT Count(*)
	FROM Reservation
	WHERE Reservation.id = p_reservationId)
    ;

	IF v_reservartion_exist = 0 THEN
		SET p_Result = CONCAT("Erreur :reservation Id non valide -> ", p_reservationId);
		ROLLBACK;
		LEAVE block_label;
	END IF;
        
	-- Recherche du timeStamp
	set v_timeStampCreate = (
    SELECT timeStampCreate
	FROM Reservation
	WHERE Reservation.id = p_reservationId)
    ;
        
	IF v_timeStampCreate is null THEN
		SET p_Result = CONCAT("Warning : reservation deja confirmee -> ", p_reservationId);
		ROLLBACK;
		LEAVE block_label;
	END IF;
    
     UPDATE Reservation
     SET timeStampCreate = NULL
     WHERE id = p_reservationId;
     
     Commit;
     SET p_Result = "OK";
      -- Début d'un bloc labellisé
    END block_label ;
	END$$
    DELIMITER ;
select 1;

-- Hors Visual Paradigm
DROP PROCEDURE IF EXISTS CancelReserve;
DELIMITER $$
CREATE PROCEDURE CancelReserve(
    IN p_reservationId VARCHAR(100) ,-- L'Id de la reservation a annuler
    OUT p_Result VARCHAR(100)
)
-- Place la reseration a l'état ReserveCanceled si la reservation n'a pas deja été annulé et si elle est antérieure à la date courante
-- Recredite le nombre de places et de places PMR sur la seance
-- Retour = "OK" ou "Erreur : "
BEGIN
    
    
    DECLARE v_reservationid VARCHAR(100);
    DECLARE v_seanceId VARCHAR(100);
    DECLARE v_utilisateurId VARCHAR(100);
    DECLARE v_stateReservation VARCHAR(100);
    DECLARE v_numberPlaces  INT DEFAULT 0;
    DECLARE v_numberPMR  INT DEFAULT 0;
	DECLARE v_timeStampCreate TIMESTAMP;
    
     DECLARE v_dateJour ,  v_hourbeginHHSMM VARCHAR(100);
    
    
     -- Gestion des erreurs
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	-- En cas d'erreur SQL, effectuer un rollback
	 ROLLBACK;
	 CALL logTrace('CancelReserve: ROLLBACK : ');
     SET p_Result = 'Erreur : Erreur interne SQL';
	END;

	block_label: BEGIN
    
    SET p_Result = 'OK';
    
	START TRANSACTION ;
    
    -- Recherche de la reservation
    SELECT Seanceid, UtilisateurId, numberPMR, timeStampCreate, stateReservation
    INTO v_seanceId, v_utilisateurId, v_numberPMR, v_timeStampCreate, v_stateReservation
	FROM Reservation
	WHERE Reservation.id = p_reservationId
    ;
    
    -- Recherche de la Seance associee
    SELECT dateJour, hourbeginHHSMM
    INTO v_dateJour, v_hourbeginHHSMM
    FROM Seance
    WHERE Seance.id = v_seanceId 
    ;

	IF v_seanceId is null THEN
		ROLLBACK;
		SET p_Result = CONCAT("Erreur : reservation Id non valide -> ", p_reservationId);
		LEAVE block_label;
	END IF;
    
    IF v_stateReservation =  'ReserveCanceled'  THEN
		ROLLBACK;
		SET p_Result = CONCAT("Warning : reservation deja annulée -> ", p_reservationId);
		LEAVE block_label;
	END IF;
    
     IF STR_TO_DATE(CONCAT(v_dateJour, ' ', v_hourBeginHHSMM), '%Y-%m-%d %H:%i') < NOW()  THEN
		ROLLBACK;
		SET p_Result = CONCAT("Erreur : reservation sur une date passee -> ", v_dateJour, " à ", v_hourBeginHHSMM);
		LEAVE block_label;
	END IF;
    
    -- Récupération des nombres de places reserves
    select count(*) into v_numberPlaces from SeatsForTarif WHERE ReservationId = p_reservationId;
    
    -- Mise à jour des places disponibles
    UPDATE SEANCE
    SET numFreeSeats = NumFreeSeats + v_numberPlaces,
			numFreePMR = numFreePMR + v_numberPMR
    WHERE seance.id = v_seanceId;
    
    -- Mise à jour de la reservation
    UPDATE Reservation
    SET stateReservation = "ReserveCanceled"
    where id = p_reservationId
    ;
    
    COMMIT;
    END block_label ;
END$$

DELIMITER ;
select 1;



DROP PROCEDURE IF EXISTS PurgeOldReservations;
DELIMITER $$
CREATE PROCEDURE PurgeOldReservations(
    IN p_seconds INT -- Le délai en secondes
)
-- Supprime en cascade toutes les reservations qui ont un timestampcreate vieux de plus de p_seconds
-- Est destiné a etre executé en batch a intervalle régulier
BEGIN
    
    DECLARE v_current_time TIMESTAMP;
    DECLARE num_ligne INT DEFAULT 0;
    
     -- Gestion des erreurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	-- En cas d'erreur SQL, effectuer un rollback
		ROLLBACK;
		CALL logTrace('PurgeOldReservations: ROLLBACK : ');
	END;

    -- Stockage l'heure actuelle
    SET v_current_time = NOW();
    
     -- Supprimez les tables temporaires si elles existent déjà
    DROP TEMPORARY TABLE IF EXISTS TempReservationsToDelete;
    DROP TEMPORARY TABLE IF EXISTS TempSeatsForTarifToDelete;

	BEGIN
    
	START TRANSACTION ;
    -- Crétion d une table temporaire pour stocker les résultats
    CREATE TEMPORARY TABLE TempReservationsToDelete AS
    SELECT id
    FROM Reservation
    WHERE TIMESTAMPDIFF(SECOND, timeStampCreate, v_current_time) > p_seconds;
    
    -- Création d'une table temporaire pour stocker les SeatsForTarif à supprimer
    CREATE TEMPORARY TABLE TempSeatsForTarifToDelete AS
    SELECT TarifQualiteid
    FROM SeatsForTarif
    WHERE ReservationId IN (SELECT id FROM TempReservationsToDelete);

	-- Désactiver le mode sécurisé
	SET SQL_SAFE_UPDATES = 0;

     -- Suppression des SeatsForTarif
     set num_ligne = (select count(*) from TempSeatsForTarifToDelete);
     CALL logTrace(CONCAT("SeatsForTarif : suppression en cours -> ",num_ligne));
     DELETE FROM SeatsForTarif
     WHERE SeatsForTarif.ReservationId IN (SELECT ReservationId FROM TempSeatsForTarifToDelete);
     
     -- Réactiver le mode sécurisé
	SET SQL_SAFE_UPDATES = 1;
    
    -- Suppression des Reservations
    set num_ligne = (select count(*) from TempReservationsToDelete);
    CALL logTrace(CONCAT("Reservation : suppression en cours -> ",num_ligne));
    DELETE FROM Reservation
    WHERE id IN (SELECT id FROM TempReservationsToDelete );

    -- On supprime les tables temporaires
    DROP TEMPORARY TABLE IF EXISTS TempReservationsToDelete;
    DROP TEMPORARY TABLE IF EXISTS TempSeatsForTarifToDelete;
    COMMIT;
    
    END;
END$$

DELIMITER ;
select 1;
DROP PROCEDURE IF EXISTS LogTrace;
DELIMITER $$
CREATE PROCEDURE logTrace(
    IN p_message TEXT -- Le message à enregistrer
)
BEGIN
    -- Insérer le message dans la table LogTrace
    INSERT INTO TableTrace (message)
    VALUES (p_message);
END$$

DELIMITER ;
select 1;
