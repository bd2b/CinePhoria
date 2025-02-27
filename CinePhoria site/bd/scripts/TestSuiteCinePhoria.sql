-- TODO
-- Faire un test de login avec administrateur , password
-- 1) test bon pwd -> result OK, dateDerniereConnexion mise à jour, entrée dans Connexions
-- 2) test pwd erreur -> KO , dans trace message 
-- 3) test de blocage
-- TODO
-- faire un test sur cancelObservation
-- id incorrecte, date de la seance dans le passé, deja cancelé
-- TODO
-- dans ConfirmReserve on met stateReservation à ReserveConfirmed


-- Test CheckAvailabilityAndReserve

DROP PROCEDURE IF EXISTS Test_CheckAvailabilityAndReserve;

DELIMITER $$
CREATE PROCEDURE Test_CheckAvailabilityAndReserve()

-- CREATE PROCEDURE CheckAvailabilityAndReserve(
--    IN p_email VARCHAR(100),
--    IN p_SeanceId VARCHAR(100),
--    IN p_TarifSeats JSON,
--    IN p_PMRSeats INT,
--    OUT p_Result VARCHAR(255) -- Chaine ("StatutEmail", "StatutReservation")
-- )
-- Création d'une reservation avec des places sur tarif et un nombre de place PMR
-- La reservation doit etre confirmée en mettant à null timeStampCreate
-- Resultat = chaine de caractere composé de 
-- statut, utilisateurId et de reservationId dans lequel statut= 'Compte Provisoire' ou 'Compte Confirme' 
-- ou d'un chaine de caractère avec Erreur :
-- Suppression du parametre utilisateurID : si le mail n'existe pas dans compte, on cree un utilisateur a la volee
BEGIN

DECLARE v_ResultTest VARCHAR(100) DEFAULT "";

block_procedure: BEGIN
DECLARE v_email VARCHAR(100);
DECLARE v_SeanceId VARCHAR(100);
DECLARE v_UtilisateurId VARCHAR(100);
DECLARE v_TarifSeats VARCHAR(255);
DECLARE v_PMRSeats INT;
DECLARE v_Result VARCHAR(255);

DECLARE v_qualite VARCHAR(100);
DECLARE v_nombreDeTarif INT DEFAULT 0;
DECLARE v_tarifQualiteId1 VARCHAR(100);
DECLARE v_tarifQualiteId2 VARCHAR(100);

DECLARE v_IsValid INT DEFAULT 0;
DECLARE v_conforme INT DEFAULT 0;

DECLARE v_newReservation VARCHAR(100);
DECLARE v_numCount INT DEFAULT 0;

CALL LogTrace("Test_CheckAvailabilityAndReserve - debut");

-- Cas1 : l'utilisateur existe mais n'est pas confirme
-- Creation de l'utilisateur
set v_email = CONCAT(UUID(),"@gmail.com");
CALL CreateUtilisateur( v_email, "password", "Zorro", v_Result);
set v_UtilisateurId = v_Result;

-- Utilisation de la premiere séance
SELECT id, qualite
FROM Seance
LIMIT 1 
INTO v_SeanceId , v_qualite ;

-- Combien a t on de tarif pour la qualite sachant qu'on faite le test avec les deux premiers
SELECT COUNT(*)  FROM TarifQualite  WHERE TarifQualite.qualite = v_qualite INTO v_nombreDeTarif ;

-- On recupere l'id du premier tarif
set v_tarifQualiteId1 = (  SELECT id FROM TarifQualite  WHERE TarifQualite.qualite = v_qualite LIMIT 1);

-- Init JSON
set v_TarifSeats ='{';
set v_TarifSeats = CONCAT(v_TarifSeats,'"',v_tarifQualiteId1,'": "2"');

IF v_nombreDeTarif > 1 THEN
	-- On recupere l'id du deuxième tarif
	set v_tarifQualiteId2 = ( SELECT id FROM TarifQualite  WHERE TarifQualite.qualite = v_qualite LIMIT 2 OFFSET 1 );
	set v_TarifSeats = CONCAT(v_TarifSeats,',"',v_tarifQualiteId2,'": "3"');
END IF;

-- end JSON
set v_TarifSeats =CONCAT(v_TarifSeats,'}');

set v_PMRSeats = 0;
call CheckAvailabilityAndReserve( v_email, v_SeanceId, v_TarifSeats, v_PMRSeats, v_Result);
-- Verification que l'on a un resultat compose du statut Provisoire et de deux UUID separé par une ,
set v_conforme = (
SELECT v_Result
REGEXP '^Compte Provisoire,[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12},[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AS v_IsValid
)
;

IF v_conforme = 1 THEN
	SET v_ResultTest = "OK";
ELSE
	SET v_ResultTest = "KO";
    call LogTrace(CONCAT("Test_CheckAvailabilityAndReserve : Erreur = ",v_Result));
    LEAVE block_procedure;
END IF;

-- Verification de la creation de reservation et des SeatsForTarif
set v_newReservation = SUBSTRING_INDEX(SUBSTRING_INDEX(v_Result, ',', 3), ',', -1);

set v_numCount = 0;
SET v_numCount = (select count(*) from Reservation where id = v_newReservation);
if v_numCount <> 1 then
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_CheckAvailabilityAndReserve : reservation cree =  KO");
    LEAVE block_procedure;
end if;

set v_numCount = 0;
SET v_numCount = (select count(*) from SeatsForTarif where reservationId = v_newReservation);
if v_numCount = 0 then
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_CheckAvailabilityAndReserve : SeatsForTarif cree =  KO");
    LEAVE block_procedure;
end if;

-- cas 2 l'utilisateur existe mais est confirme

call confirmUtilisateur(v_UtilisateurId,"password","Compte test suite", v_Result);
if v_Result <> "OK" then
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_CheckAvailabilityAndReserve : Cas 2 confirmation utilisateur =  KO");
    LEAVE block_procedure;
end if;
call CheckAvailabilityAndReserve( v_email, v_SeanceId, v_TarifSeats, v_PMRSeats, v_Result);

-- Verification que l'on a un resultat compose du statut confirme et de deux UUID separé par une ,
set v_conforme = (
SELECT v_Result
REGEXP '^Compte Confirme,[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12},[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AS v_IsValid
)
;
IF v_conforme = 1 THEN
	SET v_ResultTest = "OK";
ELSE
	SET v_ResultTest = "KO";
    call LogTrace(CONCAT("Test_CheckAvailabilityAndReserve : Cas 2 reponse non conforme  =  KO",v_Result));
    LEAVE block_procedure;
END IF;

-- cas 3 l'utilisateur n'existe pas
call CheckAvailabilityAndReserve( CONCAT(UUID(),'@gmail2.com'), v_SeanceId, v_TarifSeats, v_PMRSeats, v_Result);

-- Verification que l'on a un resultat compose du statut Provisoire et de deux UUID separé par une ,
set v_conforme = (
SELECT v_Result
REGEXP '^Compte Provisoire,[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12},[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AS v_IsValid
)
;
IF v_conforme = 1 THEN
	SET v_ResultTest = "OK";
ELSE
	SET v_ResultTest = "KO";
    call LogTrace(CONCAT("Test_CheckAvailabilityAndReserve : Cas 3 reponse non conforme  =  KO",v_Result));
    LEAVE block_procedure;
END IF;

END block_procedure;

CALL LogTrace(CONCAT("Test_CheckAvailabilityAndReserve = ", v_ResultTest));
END$$

DELIMITER ;

Call Test_CheckAvailabilityAndReserve();

-- Test ConfirmReserve

DROP PROCEDURE IF EXISTS Test_ConfirmReserve;

DELIMITER $$
CREATE PROCEDURE Test_ConfirmReserve()
-- CREATE PROCEDURE ConfirmReserve(
--     IN p_reservationId VARCHAR(100),
--     OUT p_Result VARCHAR(255)
-- )
-- Confirmation d'une reservation : consiste a mettre le timeStampCreate à null
-- Retour "OK" ou "Erreur : erreur interne procedure." ou "Erreur :reservation Id non valide." ou "Warning : reservation deja confirmee"


BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "";

block_procedure: BEGIN

DECLARE v_newReservation VARCHAR(100);
DECLARE v_ResultConfirmation VARCHAR(100) DEFAULT "";
DECLARE v_timeStampTest TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CALL LogTrace("Test_ConfirmReserve - debut");

-- Recupération d'une reservation non confirme
SET v_newReservation = (select id from Reservation where timeStampCreate is null Limit 1);

-- Confirmation de la reservation
CALL ConfirmReserve(v_newReservation, v_ResultConfirmation);
set v_timeStampTest = (select timeStampCreate from reservation where id = v_newReservation);
if v_timeStampTest is not null  then
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_ConfirmReserve : timestamp not null =  KO");
    LEAVE block_procedure;
END IF;	

SET v_ResultTest = "OK";
END block_procedure;

CALL LogTrace(CONCAT("Test_ConfirmReserve = ", v_ResultTest));
END$$

DELIMITER ;

Call Test_ConfirmReserve();


-- Test PurgeOldReservations

DROP PROCEDURE IF EXISTS Test_PurgeOldReservations;

DELIMITER $$
CREATE PROCEDURE Test_PurgeOldReservations()
-- CREATE PROCEDURE PurgeOldReservations(
--     IN p_seconds INT -- Le délai en secondes
-- )
-- -- Supprime en cascade toutes les reservations qui ont un timestampcreate vieux de plus de p_seconds
-- -- Est destiné a etre executé en batch a intervalle régulier

BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "OK";

block_procedure: BEGIN

DECLARE v_seconds INT DEFAULT 1;
DECLARE v_current_time TIMESTAMP;
DECLARE v_num_ligne INT DEFAULT 0;
DECLARE v_reservationId VARCHAR(100);

CALL LogTrace("Test_PurgeOldReservations - debut");

-- On compte combien il y a de reservation en cours
set v_num_ligne = (SELECT COUNT(*) FROM Reservation WHERE timeStampCreate is not null );
if v_num_ligne = 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_PurgeOldReservations : test impossible car pas de reservations a purger =  KO");
    LEAVE block_procedure;
END IF;

-- On prend une reservation temoin pour vérifier que la purge a été faite
set v_reservationId = (SELECT id FROM Reservation WHERE TIMESTAMPDIFF(SECOND, timeStampCreate, v_current_time) > v_seconds LIMIT 1);

CALL PurgeOldReservations(v_seconds);

set v_current_time = (SELECT timeStampCreate FROM Reservation WHERE id = v_reservationId );
if v_current_time is not null THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_PurgeOldReservations :le timeStampCreate de la reservation temoin n'est pas nulle =  KO");
    LEAVE block_procedure;
END IF;

END block_procedure;
CALL LogTrace(CONCAT("Test_PurgeOldReservations = ", v_ResultTest));
END$$

DELIMITER ;

DO SLEEP(2);
Call Test_PurgeOldReservations();

-- Test CreateUtilisateur

DROP PROCEDURE IF EXISTS Test_CreateUtilisateur;

DELIMITER $$
CREATE PROCEDURE Test_CreateUtilisateur()
-- CREATE PROCEDURE CreateUtilisateur(
--     IN p_email VARCHAR(100),
--     IN p_passwordText VARCHAR(100),
--     IN p_displayName VARCHAR(100),
--     OUT p_Result VARCHAR(255) 
-- )
-- -- Création d'un utilisateur qui engendre la creation d'un compte. L'utilisateur est créer à confirmer en mettant le timeStampCreate à null , de meme le compte avec isValidated = 0
-- -- Retour utilisateurId ou "Erreur : erreur interne procedure." ou "Erreur : email existant." ou "Erreur : utilisateur existant"

BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "OK";

block_procedure: BEGIN

DECLARE v_emailUnique VARCHAR(100) DEFAULT UUID();
DECLARE v_UtilisateurId VARCHAR(100);
DECLARE v_exist INT DEFAULT 0 ;

CALL LogTrace("Test_CreateUtilisateur - debut");

call CreateUtilisateur (v_emailUnique, 'password', 'Diego',v_UtilisateurId);

-- Verif utilisateur
set v_exist = (SELECT COUNT(*) FROM Utilisateur WHERE id = v_UtilisateurId);
if v_exist <> 1 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_CreateUtilisateur : utilisateur absent =  KO");
    LEAVE block_procedure;
END IF;

-- Verif Compte
set v_exist = (SELECT COUNT(*) FROM Compte WHERE email = v_emailUnique);
if v_exist <> 1 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_CreateUtilisateur : compte absent =  KO");
    LEAVE block_procedure;
END IF;

END block_procedure;
CALL LogTrace(CONCAT("Test_CreateUtilisateur = ", v_ResultTest));
END$$

DELIMITER ;

Call Test_CreateUtilisateur();

-- Test confirmUtilisateur

DROP PROCEDURE IF EXISTS Test_confirmUtilisateur;

DELIMITER $$
CREATE PROCEDURE Test_confirmUtilisateur()
-- CREATE PROCEDURE ConfirmUtilisateur(
--     IN p_utilisateurId VARCHAR(100),
--     IN p_displayName VARCHAR(100),
--     IN p_password VARCHAR(100),  -- doit etre verifié et hashé à la source
--      OUT p_Result VARCHAR(255)
--      )
     -- L'utilisateur est confirmé en mettant le timeStampCreate a null et le compte est valider en mettant isValidated à 1
     -- On met à jour le displayName de l'utilisateur
     -- Retour "OK" ou "Erreur : xxxxxxxxx" ou "Warning : yyyyyyyyy"
	 -- xxx = "erreur interne procedure." , "utilisateurId non valide." 
     -- yyy = "utilisateur deja confirme."

BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "OK";
CALL LogTrace("Test_confirmUtilisateur et Compte - debut");

block_procedure: BEGIN
DECLARE v_email VARCHAR(100) ;
DECLARE v_UtilisateurId VARCHAR(100);
DECLARE v_exist INT DEFAULT 0 ;
DECLARE v_Result VARCHAR(100);
DECLARE v_timeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
DECLARE v_codeConfirmMail VARCHAR(100);


-- On regarde si il y a des utilisateurs à confirmer
SET v_exist = (SELECT COUNT(*) FROM Utilisateur WHERE timeStampCreate is not null);
if v_exist = 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_confirmUtilisateur : pas de compte à confirmer =  KO");
    LEAVE block_procedure;
END IF;

set v_UtilisateurId = ( SELECT id FROM Utilisateur WHERE timeStampCreate is not null LIMIT 1);

call ConfirmUtilisateur(v_UtilisateurId,"password","Compte test suite",v_Result);

if v_Result <> "OK" THEN
	SET v_ResultTest = "KO";
	CALL LogTrace(CONCAT("Test_confirmUtilisateur : erreur procedure =  KO ", v_Result));
    LEAVE block_procedure;
END IF;

-- On verifie que Utilisateur et compte sont bien confirmés
set v_timeStamp = (SELECT timeStampCreate FROM Utilisateur WHERE id = v_UtilisateurId);
if v_timeStamp is not null THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_confirmUtilisateur : utilisateur toujours a confirmer =  KO");
    LEAVE block_procedure;
END IF;


-- Verifier confirmCompte
set v_email = (SELECT email FROM Utilisateur WHERE id = v_UtilisateurId);
set v_codeConfirmMail = (SELECT oldpasswordsarray FROM Compte WHERE email = v_email);
set v_codeConfirmMail = LEFT(v_codeConfirmMail,6);

-- Premier appel qui doit donner KO
call ConfirmCompte(v_email, '000000',v_Result);

if LEFT(v_Result,6) <> 'Erreur' THEN
	SET v_ResultTest = "KO";
    CALL LogTrace("Test_confirmCompte : confirmation Compte devrait etre KO =  KO");
    LEAVE block_procedure;
END IF;

-- Deuxieme appel qui doit etre OK
call ConfirmCompte(v_email, v_codeConfirmMail,v_Result);
if LEFT(v_Result,6) <> 'OK' THEN
	SET v_ResultTest = "KO";
    CALL LogTrace("Test_confirmCompte : confirmation Compte devrait etre OK =  KO");
    LEAVE block_procedure;
END IF;


set v_exist = (SELECT isValidated FROM Compte WHERE email IN (SELECT email FROM Utilisateur WHERE id = v_UtilisateurId));
if v_exist = 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_confirmUtilisateur : compte toujours a confirmer =  KO");
    LEAVE block_procedure;
END IF;

END block_procedure;
CALL LogTrace(CONCAT("Test_confirmUtilisateur et Compte = ", v_ResultTest));
END$$

DELIMITER ;

Call Test_confirmUtilisateur();

-- Test PurgeOldUsers

DROP PROCEDURE IF EXISTS Test_PurgeOldUsers;

DELIMITER $$
CREATE PROCEDURE Test_PurgeOldUsers()
-- CREATE PROCEDURE PurgeOldUsers(
--     IN p_seconds INT -- Le délai en secondes
-- )
-- -- Supprime en cascade toutes les utilisateurs qui ont un timestampcreate vieux de plus de p_seconds, supprime son compte ses reservations, et ses SeatsForTarif
-- Est destiné a etre executé en batch a intervalle régulier

BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "OK";
CALL LogTrace("Test_PurgeOldUsers - debut");

block_procedure: BEGIN

DECLARE v_email VARCHAR(100) ;
DECLARE v_UtilisateurId VARCHAR(100);
DECLARE v_exist INT DEFAULT 0 ;
DECLARE v_Result VARCHAR(100);
DECLARE v_timeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DECLARE v_seconds INT DEFAULT 1;

DECLARE v_num_ligne INT DEFAULT 0;
DECLARE v_reservationId VARCHAR(100);
DECLARE v_tarifQualiteId VARCHAR(100);


-- On regarde si il y a des utilisateurs à purger
SET v_exist = (SELECT COUNT(*) FROM Utilisateur WHERE timeStampCreate is not null);
if v_exist = 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_PurgeOldUsers : pas d'utilisateur à purger =  KO");
    LEAVE block_procedure;
END IF;

-- On prend un utilisateur temoin pour vérifier que la purge a été faite
set v_UtilisateurId = (SELECT id FROM Utilisateur WHERE TIMESTAMPDIFF(SECOND, timeStampCreate, v_timeStamp) > v_seconds LIMIT 1);

-- On prend une de ses reservations pour verifier la suppression
set v_reservationId = (SELECT id FROM Reservation WHERE utilisateurId = v_UtilisateurId LIMIT 1);

-- On prend un de ses SeatsForTarif pour vérifier la suppression
set v_tarifQualiteId = (SELECT tarifQualiteId FROM SeatsForTarif WHERE ReservationId = v_reservationId LIMIT 1);

call PurgeOldUsers(v_seconds);

SET v_exist = (SELECT COUNT(*) FROM Utilisateur WHERE id = v_UtilisateurId);
if v_exist > 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_PurgeOldUsers : utilisateur non supprime =  KO");
    LEAVE block_procedure;
END IF;

SET v_exist = (SELECT COUNT(*) FROM Reservation WHERE id = v_reservationId);
if v_exist > 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_PurgeOldUsers : reservation non supprime =  KO");
    LEAVE block_procedure;
END IF;

SET v_exist = (SELECT COUNT(*) FROM SeatsForTarif WHERE tarifQualiteId = v_tarifQualiteId);
if v_exist > 0 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_PurgeOldUsers : seatsForTarif non supprime =  KO");
    LEAVE block_procedure;
END IF;

END block_procedure;
CALL LogTrace(CONCAT("Test_PurgeOldUsers = ", v_ResultTest));
END$$

DELIMITER ;
-- Pour repeupler
Call Test_CheckAvailabilityAndReserve();
DO SLEEP(2);
Call Test_PurgeOldUsers();

