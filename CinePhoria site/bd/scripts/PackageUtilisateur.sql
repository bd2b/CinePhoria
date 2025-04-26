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
        
	-- Début de la transaction
    START TRANSACTION;
    
    INSERT INTO Compte
		(email,  isValidated, passwordText, datePassword, oldpasswordsArray) 
	VALUES 
		(p_email, 0, p_passwordText, NOW(), "")
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

DROP PROCEDURE IF EXISTS confirmUtilisateur;

DELIMITER $$
CREATE PROCEDURE confirmUtilisateur(
    IN p_utilisateurId VARCHAR(100),
     OUT p_Result VARCHAR(255)
     )
     -- L'utilisateur est confirmé en mettant le timeStampCreate a null et le compte est valider en mettant isValidated à 1
     -- Retour "OK" ou "Erreur : erreur interne procedure." ou "Erreur : utilisateurId non valide." ou "Warning : Utilisateur deja confirme."
     
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
     SET timeStampCreate = NULL
     WHERE email = v_email;
     
     UPDATE Compte
     SET isValidated = 1
     WHERE email = v_email;
     
     Commit;
     SET p_Result = "OK";
      -- Début d'un bloc labellisé
    END block_label ;
END$$
DELIMITER ;
    
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

call PurgeOldUsers(2);
