-- Test XXXX

DROP PROCEDURE IF EXISTS Test_XXXX;

DELIMITER $$
CREATE PROCEDURE Test_XXXX()

BEGIN
DECLARE v_ResultTest VARCHAR(100) DEFAULT "OK";
CALL LogTrace("Test_XXXX - debut");

block_procedure: BEGIN
DECLARE v_exist INT DEFAULT 0;

-- Appel de XXXX


-- Verification
set v_exist = (SELECT COUNT(*) FROM zzzzzzz WHERE ttttttt);
if v_exist <> 1 THEN
	SET v_ResultTest = "KO";
	CALL LogTrace("Test_XXXX : yyyyyyyy  =  KO");
    LEAVE block_procedure;
END IF;


END block_procedure;
CALL LogTrace(CONCAT("Test_XXXX = ", v_ResultTest));
END$$

DELIMITER ;

Call Test_XXXX();
