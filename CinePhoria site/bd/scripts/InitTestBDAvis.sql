SET NAMES utf8mb4;
DROP PROCEDURE IF EXISTS initSeanceAvis;
DELIMITER $$

CREATE PROCEDURE initSeanceAvis()
BEGIN
  DECLARE u1 VARCHAR(100);
  DECLARE u2 VARCHAR(100);
  DECLARE u3 VARCHAR(100);

  DECLARE s_id VARCHAR(100);
  DECLARE s_date DATE;
  DECLARE s_qualite VARCHAR(100);
  DECLARE res_id VARCHAR(100);

  DECLARE d INT DEFAULT 0; -- jours passés
  DECLARE r INT;           -- compteur de réservation par jour
  DECLARE nb_places INT DEFAULT 1;

  DECLARE state VARCHAR(50);
  DECLARE pmr INT DEFAULT 0;
  DECLARE must_review INT DEFAULT 0;
  DECLARE friandise INT DEFAULT 0;

  DECLARE current_user_var VARCHAR(100);

  -- Récupérer les utilisateurs concernés
  SELECT id INTO u1 FROM Utilisateur WHERE email = 'djamila@7art.fr' LIMIT 1;
  SELECT id INTO u2 FROM Utilisateur WHERE email = 'jean@7art.fr' LIMIT 1;
  SELECT id INTO u3 FROM Utilisateur WHERE email = 'kevin@7art.fr' LIMIT 1;

  user_loop: WHILE d < 20 DO
    -- Récupère 10 séances aléatoires pour la date d = aujourd’hui - d
    DROP TEMPORARY TABLE IF EXISTS tmp_seance_ids;
    CREATE TEMPORARY TABLE tmp_seance_ids AS
      SELECT id, filmId, dateJour, qualite
      FROM Seance
      WHERE dateJour = CURDATE() - INTERVAL d DAY
      ORDER BY RAND()
      LIMIT 10; -- ← à augmenter on fait plus de 10 résas par jour

    SET r = 0;

    res_loop: WHILE r < 10 DO -- ← à augmenter on fait plus de 10 résas par jour
      -- Choix utilisateur cyclique
      SET current_user_var = CASE MOD(r, 3)
        WHEN 0 THEN u1
        WHEN 1 THEN u2
        ELSE u3
      END;

      -- Cyclique DoneEvaluated / DoneUnevaluated
      SET state = IF(MOD(r, 2) = 0, 'DoneUnevaluated', 'DoneEvaluated');
      SET pmr = MOD(r, 2);
      SET must_review = MOD(r + 1, 3); -- pour se décaller de l'état.
      SET friandise = IF(MOD(r, 5) = 0, 1, 0);
      SET res_id = UUID();

      -- Choisir la séance correspondante
      SELECT id, dateJour, qualite INTO s_id, s_date, s_qualite
      FROM tmp_seance_ids LIMIT 1 OFFSET r;

      -- Préparer note et évaluation si nécessaire
      SET @note = ROUND(RAND() * 5, 1);
      SET @evaluation = CASE
        WHEN @note >= 4 THEN 'Excellent film, très immersif et visuellement réussi.'
        WHEN @note >= 3 THEN 'Bon moment, quelques longueurs mais acteurs convaincants.'
        WHEN @note >= 2 THEN 'Moyen, intrigue faible mais beaux décors.'
        WHEN @note >= 1 THEN 'Décevant, trop lent malgré une bonne idée de base.'
        ELSE 'Mauvais, je ne recommande pas.'
      END;

      -- Insertion Reservation
      INSERT INTO Reservation
        (id, Utilisateurid, Seanceid, stateReservation, numberPMR, evaluation,
         isEvaluationMustBeReview, note, isPromoFriandise, numberSeatsRestingBeforPromoFriandise,
         timeStampCreate, seatsReserved, imageQRCode)
      VALUES
        (res_id, current_user_var, s_id, state, pmr,
         IF(state = 'DoneEvaluated', @evaluation, NULL),
  --       must_review, IF(state = 'DoneEvaluated', @note, NULL),
         must_review, IF(state = 'DoneEvaluated', @note, NULL),
         friandise, FLOOR(RAND()*10),
         DATE_SUB(s_date, INTERVAL 1 DAY), '', '');

      -- Génération des SeatsForTarif
      IF nb_places = 1 THEN
        INSERT INTO SeatsForTarif (TarifQualiteid, ReservationId, numberSeats)
        SELECT id, res_id, 1 FROM TarifQualite
        WHERE qualite = s_qualite LIMIT 1;

      ELSEIF nb_places = 2 THEN
        INSERT INTO SeatsForTarif (TarifQualiteid, ReservationId, numberSeats)
        SELECT id, res_id, 1 FROM TarifQualite
        WHERE qualite = s_qualite LIMIT 2;

      ELSE -- 3 places
        INSERT INTO SeatsForTarif (TarifQualiteid, ReservationId, numberSeats)
        SELECT id, res_id, 2 FROM TarifQualite
        WHERE qualite = s_qualite LIMIT 1;

        INSERT INTO SeatsForTarif (TarifQualiteid, ReservationId, numberSeats)
        SELECT id, res_id, 1 FROM TarifQualite
        WHERE qualite = s_qualite LIMIT 1 OFFSET 1;
      END IF;

      -- Incrémenter nombre de places (1 → 2 → 3 → 1 ...)
      SET nb_places = IF(nb_places = 3, 1, nb_places + 1);
      SET r = r + 1;
    END WHILE;

    DROP TEMPORARY TABLE tmp_seance_ids;
    SET d = d + 1;
  END WHILE;
  
  SET SQL_SAFE_UPDATES = 0;

-- Mettre à jour les nombre de places
UPDATE Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT r.Seanceid, SUM(st.numberSeats) AS totalReserved
  FROM Reservation r
  JOIN SeatsForTarif st ON r.id = st.ReservationId
  GROUP BY r.Seanceid
) AS res ON res.Seanceid = s.id
SET s.numFreeSeats = sa.capacity - IFNULL(res.totalReserved, 0);

    
-- Mettre à jour les nombre de places PMR
UPDATE Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT Seanceid, SUM(numberPMR) AS totalReservedPMR
  FROM Reservation
  GROUP BY Seanceid
) AS res ON res.Seanceid = s.id
SET s.numFreePMR = sa.numPMR - IFNULL(res.totalReservedPMR, 0);

SET SQL_SAFE_UPDATES = 1;

  
END$$

DELIMITER ;

-- Appel de la procédure
CALL initSeanceAvis();