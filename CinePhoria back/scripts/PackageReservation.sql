

DROP PROCEDURE IF EXISTS CheckAvailabilityAndReserve;

DELIMITER $$
CREATE PROCEDURE CheckAvailabilityAndReserve(
    IN p_email VARCHAR(100),
    IN p_SeanceId VARCHAR(100),
    IN p_UtilisateurId VARCHAR(100),
    IN p_TarifSeats JSON,
    IN p_PMRSeats INT,
    OUT p_Result VARCHAR(255) -- Chaine ("StatutEmail", "StatutReservation")
)
-- Création d'une reservation avec des places sur tarif et un nombre de place PMR
-- La reservation doit etre confirmée en mettant à null timeStampCreate
-- Resultat = chaine de caractere composé de utilisateurId et de reservationId ou d'un chaine de caractère avec Erreur :

BEGIN
    DECLARE v_utilisateur_exist INT;
    DECLARE v_utilisateurID VARCHAR(100);
    DECLARE v_available_seats INT;
    DECLARE v_available_pmr INT;
    DECLARE v_alert_status VARCHAR(100);
    DECLARE v_statut_email VARCHAR(100) DEFAULT "Erreur : email pas evalue";
    DECLARE v_statut_reservation VARCHAR(100);
    DECLARE v_newReservationId VARCHAR(100) DEFAULT UUID();

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
		SET p_Result =  CONCAT(v_statut_email, ",", "Erreur : erreur interne.");
	END;
    
    -- Calculer le nombre de clés dans le JSON
    SET v_key_count = JSON_LENGTH(JSON_KEYS(p_TarifSeats));
    
    -- Initialiser la somme totale de place
    SET v_total_sum = 0;

    -- Initialiser le résultat de la procedure
    SET p_Result = "Ok";
	
    -- Début de la transaction
    START TRANSACTION;
    
    -- Début d'un bloc labellisé
    block_label: BEGIN

        -- Récupérer l'alerte de disponibilité et le nombre de places disponibles et verrouillage de la ligne
        SELECT numFreeSeats, numFreePMR, alertAvailibility
        INTO v_available_seats, v_available_pmr, v_alert_status
        FROM Seance
        WHERE id = p_SeanceId
        FOR UPDATE;
        
  --      DO SLEEP(10); -- Simule une attente de 10 secondes

        -- Recherche de l'email et de l'id Utilisateur
        SET v_utilisateur_exist = (
            SELECT COUNT(*)
            FROM Utilisateur
            WHERE Utilisateur.email = p_email
        );

        IF v_utilisateur_exist = 0 THEN
            SET v_statut_email = "Erreur : email inconnu";
        ELSE
            SET v_utilisateurID = (
                SELECT id
                FROM Utilisateur
                WHERE Utilisateur.email = p_email
            );
            SET v_statut_email = v_utilisateurID;
        END IF;

		-- Si on n'a pas de JSON bien forme
        IF v_key_count = 0 THEN
            SET v_statut_reservation = "Erreur : parametre invalide";
            SET p_Result = CONCAT(v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;


        -- Si la séance est "Sold out", renvoyer directement "Pas assez de place"
        IF v_alert_status = 'Sold out' THEN
            SET v_statut_reservation = "Erreur : pas assez de place";
            SET p_Result = CONCAT(v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;

        -- Parcourir les clés pour calculer la somme
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

			-- Ajouter la valeur à la somme totale
			SET v_total_sum = v_total_sum + v_current_value;

			-- Passer à la clé suivante
			SET v_key_index = v_key_index + 1;
		END WHILE;
 
        -- Vérifier la disponibilité des places générales
        IF v_total_sum > v_available_seats THEN
            SET v_statut_reservation = "Erreur : pas assez de place";
            SET p_Result = CONCAT(v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;

        -- Vérifier la disponibilité des places PMR
        IF p_PMRSeats > v_available_pmr THEN
            SET v_statut_reservation = "Erreur : pas assez de place PMR";
            SET p_Result = CONCAT(v_statut_email, ",", v_statut_reservation);
            ROLLBACK;
            LEAVE block_label;
        END IF;

        -- Si les places sont disponibles, les réserver en mettant à jour la table Seance
		UPDATE Seance
			SET 
				numFreeSeats = numFreeSeats - v_total_sum,
				numFreePMR = numFreePMR - p_PMRSeats
			WHERE id = p_SeanceId
            ;

			-- Générer une nouvelle réservation
			INSERT INTO Reservation
				(Id, Utilisateurid, seanceid, stateReservation, numberPMR,timeStampCreate)
			VALUES
				(v_newReservationId, p_UtilisateurId, p_SeanceId, "future", p_PMRSeats, CURRENT_TIMESTAMP);
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
			SET p_Result = CONCAT(v_statut_email, ",", v_statut_reservation);
		
        
		END block_label;
END $$
DELIMITER ;

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
