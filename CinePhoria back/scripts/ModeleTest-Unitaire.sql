-- Test XXXX

DROP PROCEDURE IF EXISTS Test_XXXX;

DELIMITER $$
CREATE PROCEDURE Test_XXXX()

BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "OK";
CALL LogTrace("Test_XXXX - debut");

block_procedure: BEGIN







END block_procedure;
CALL LogTrace(CONCAT("Test_XXXX = ", v_ResultTest));
END$$

DELIMITER ;

Call Test_XXXX();