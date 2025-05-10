-- Script pour gérer les nombres de places libres de séance en tenant compte de la capacité de la salle et des réservations
-- Visualiser les écarts de places
SELECT 
  s.id AS seanceId,
  sa.id AS salleId,
  sa.capacity,
  s.numFreeSeats,
  IFNULL(res.totalReserved, 0) AS totalReserved,
  sa.capacity - IFNULL(res.totalReserved, 0) AS expectedFreeSeats
FROM Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT r.Seanceid, SUM(st.numberSeats) AS totalReserved
  FROM Reservation r
  JOIN SeatsForTarif st ON r.id = st.ReservationId
  GROUP BY r.Seanceid
) AS res ON res.Seanceid = s.id
WHERE s.numFreeSeats != sa.capacity - IFNULL(res.totalReserved, 0);


-- Visualiser les nombres de places calculées avant update
SELECT 
  s.id AS seanceId,
  sa.id AS salleId,
  sa.capacity,
  IFNULL(res.totalReserved, 0) AS totalReserved,
  sa.capacity - IFNULL(res.totalReserved, 0) AS computedFreeSeats
FROM Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT r.Seanceid, SUM(st.numberSeats) AS totalReserved
  FROM Reservation r
  JOIN SeatsForTarif st ON r.id = st.ReservationId
  GROUP BY r.Seanceid
) AS res ON res.Seanceid = s.id;


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

-- Visualiser les écarts de places PMR
SELECT 
  s.id AS seanceId,
  sa.id AS salleId,
  sa.numPMR AS totalPMRCapacity,
  s.numFreePMR,
  IFNULL(res.totalReservedPMR, 0) AS totalReservedPMR,
  sa.numPMR - IFNULL(res.totalReservedPMR, 0) AS expectedFreePMR
FROM Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT Seanceid, SUM(numberPMR) AS totalReservedPMR
  FROM Reservation
  GROUP BY Seanceid
) AS res ON res.Seanceid = s.id
WHERE s.numFreePMR != sa.numPMR - IFNULL(res.totalReservedPMR, 0);

-- Visualiser les nombres de places PMR calculées avant update
SELECT 
  s.id AS seanceId,
  sa.id AS salleId,
  sa.numPMR AS totalPMRCapacity,
  s.numFreePMR,
  IFNULL(res.totalReservedPMR, 0) AS totalReservedPMR,
  sa.numPMR - IFNULL(res.totalReservedPMR, 0) AS expectedFreePMR
FROM Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT Seanceid, SUM(numberPMR) AS totalReservedPMR
  FROM Reservation
  GROUP BY Seanceid
) AS res ON res.Seanceid = s.id;


-- Mettre à jour les nombre de places PMR
UPDATE Seance s
JOIN Salle sa ON s.Salleid = sa.id
LEFT JOIN (
  SELECT Seanceid, SUM(numberPMR) AS totalReservedPMR
  FROM Reservation
  GROUP BY Seanceid
) AS res ON res.Seanceid = s.id
SET s.numFreePMR = sa.numPMR - IFNULL(res.totalReservedPMR, 0);


-- Selectin des écarts par rapport aux sieges absents PAS UTILE
SELECT 
  s.id AS seanceId,
  sa.id AS salleId,
  s.numFreeSeats AS currentFreeSeats,
  CASE
    WHEN sa.seatsAbsents IS NULL OR sa.seatsAbsents = '' THEN 0
    ELSE LENGTH(sa.seatsAbsents) - LENGTH(REPLACE(sa.seatsAbsents, ',', '')) + 1
  END AS totalSeatsAbsent,
  s.numFreeSeats 
    - CASE
        WHEN sa.seatsAbsents IS NULL OR sa.seatsAbsents = '' THEN 0
        ELSE LENGTH(sa.seatsAbsents) - LENGTH(REPLACE(sa.seatsAbsents, ',', '')) + 1
      END AS expectedFreeSeats
FROM Seance s
JOIN Salle sa ON s.Salleid = sa.id
WHERE s.numFreeSeats != s.numFreeSeats 
  - CASE
      WHEN sa.seatsAbsents IS NULL OR sa.seatsAbsents = '' THEN 0
      ELSE LENGTH(sa.seatsAbsents) - LENGTH(REPLACE(sa.seatsAbsents, ',', '')) + 1
    END;
    
    -- Visualisation des modifications à faire PAS UTILE
    SELECT 
  s.id AS seanceId,
  sa.id AS salleId,
  s.numFreeSeats AS currentFreeSeats,
  CASE
    WHEN sa.seatsAbsents IS NULL OR sa.seatsAbsents = '' THEN 0
    ELSE LENGTH(sa.seatsAbsents) - LENGTH(REPLACE(sa.seatsAbsents, ',', '')) + 1
  END AS totalSeatsAbsent,
  s.numFreeSeats 
    - CASE
        WHEN sa.seatsAbsents IS NULL OR sa.seatsAbsents = '' THEN 0
        ELSE LENGTH(sa.seatsAbsents) - LENGTH(REPLACE(sa.seatsAbsents, ',', '')) + 1
      END AS expectedFreeSeats
FROM Seance s
JOIN Salle sa ON s.Salleid = sa.id;

-- Update à faire pour les sieges absents PAS UTILE
UPDATE Seance s
JOIN Salle sa ON s.Salleid = sa.id
SET s.numFreeSeats = s.numFreeSeats
  - CASE
      WHEN sa.seatsAbsents IS NULL OR sa.seatsAbsents = '' THEN 0
      ELSE LENGTH(sa.seatsAbsents) - LENGTH(REPLACE(sa.seatsAbsents, ',', '')) + 1
    END;

