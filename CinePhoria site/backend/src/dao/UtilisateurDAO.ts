import * as bcrypt from 'bcrypt';
import mysql, { FieldPacket } from 'mysql2/promise';
import { dbConfig, nombreTentativeLoginKO } from '../config/config';
import logger from '../config/configLog';
import { UtilisateurCompte, ComptePersonne } from '../shared-models/Utilisateur';


async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Plus le nombre est élevé, plus c'est sécurisé mais plus lent
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Vérification d'un mot de passe
 * @param password en clair
 * @param hashedPassword password hasché
 * @returns boolean
 */
async function isPasswordEqual(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Fonction de vérification d'UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str.trim());
}

/**
   * Vérifie la validité d'un email.
   * @param email - L'email à valider.
   * @returns boolean - True si l'email est valide, sinon False.
   */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
export class UtilisateurDAO {

  static async createUtilisateur(
    email: string,
    password: string,
    displayName: string
  ): Promise<string> {  // Retour uniquement de la chaîne de caractères
    const passwordHashed = await hashPassword(password);
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Exécution de la procédure stockée avec @result
      const results = await connection.query(
        `CALL CreateUtilisateur(?, ?, ?, @result);
         SELECT @result AS result;`,
        [email, passwordHashed, displayName]
      );
      logger.info("Execution de la procedure CreateUtilisateur ")
      logger.info("Paramètres :", { email, displayName }, "et mot de passe hashé");

      // Forcer TypeScript à comprendre la structure des résultats
      const callResults = results as any[][];  // Correction du typage
      const selectResult = callResults[0][1] as Array<{ result: string }>;

      // Vérification et extraction du résultat
      if (selectResult && selectResult.length > 0 && selectResult[0].result) {
        const utilisateurId = selectResult[0].result;
        logger.info("Résultat = " + utilisateurId);

        // Retourner uniquement la chaîne utilisateurId
        return utilisateurId;
      } else {
        logger.error("Erreur : Résultat non disponible.");
        throw new Error('Erreur : Résultat non disponible.');
      }
    } catch (error) {
      logger.error('Erreur dans CreateUtilisateur', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  };

  static async changePWD(email: string, newPWD: string): Promise<void> {
    const connection = await mysql.createConnection(dbConfig);
    const passwordHashed = await hashPassword(newPWD);
    try {
      const result = connection.query(
        `UPDATE Compte 
          SET passwordText = ?,
              datePassword = NOW(),
              oldPasswordsArray = CONCAT(oldPasswordsArray,',',passwordText)
          WHERE email = ?`, [passwordHashed, email]
      );
      logger.info("Execution de la procedure changePWD ")
      logger.info("Paramètres :", { email }, "et mot de passe hashé");
      logger.info("Result :", JSON.stringify(result));

    } catch (error) {
      logger.error('Erreur dans CreateUtilisateur', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  }



  static async getCodeConfirm(
    email: string, typeConfirm: string
  ): Promise<{ codeConfirm: string, numTry: number, dateCreateCode: Date }[]> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.query(
        `SELECT codeConfirm , numTry, dateCreateCode
            FROM CodesConfirm
            WHERE email  = ? AND typeConfirm = ?
			      `,
        [email, typeConfirm]);
      logger.info("Execution de la requete " + `SELECT codeConfirm , numTry, dateCreateCode FROM CodesConfirm WHERE email  = ${email} AND typeConfirm = ${typeConfirm})`);
      return (rows as any[]);

      // // Forcer TypeScript à comprendre la structure des résultats
      // const callResults = results as any[][];  // Correction du typage
      // const selectResult = callResults[0][1] as Array<{ codeStocke: string }>;

      // // Vérification et extraction du résultat
      // if (selectResult && selectResult.length > 0 && selectResult[0].codeStocke) {
      //   const codeConfMail = selectResult[0].codeStocke;
      //   logger.info("Code trouve = " + codeConfMail);

      //   // Retourner uniquement la chaîne utilisateurId
      //   return codeConfMail;
      // } else {
      //   return "Compte sans code";
      // }
    } catch (error) {
      logger.error('Erreur dans select getCodeConfirm', error);
      throw new Error('Erreur dans select getCodeConfirm.');
    } finally {
      await connection.end();
    };
  }

  static async createCodeConfirm(
    email: string, typeConfirm: string
  ): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const results = await connection.query(
        `CALL CreateCodeConfirm(?, ?, @result);
         SELECT @result AS result;`,
        [email, typeConfirm]
      );
      logger.info("Execution de la procedure CreateCodeConfirm ")
      logger.info("Paramètres :", { email, typeConfirm });

      // Forcer TypeScript à comprendre la structure des résultats
      const callResults = results as any[][];  // Correction du typage
      const selectResult = callResults[0][1] as Array<{ result: string }>;

      // Vérification et extraction du résultat
      if (selectResult && selectResult.length > 0 && selectResult[0].result) {
        const codeConfirm = selectResult[0].result;
        logger.info("Résultat = " + codeConfirm);

        // Retourner uniquement la chaîne utilisateurId
        return codeConfirm;
      } else {
        logger.error("Erreur : Résultat non disponible.");
        throw new Error('Erreur : Résultat non disponible.');
      }
    } catch (error) {
      logger.error('Erreur dans createCodeConfirm', error);
      throw new Error('Erreur dans createCodeConfirm.');
    }
    finally {
      await connection.end();
    };

  }

  static async verifyCodeConfirm(
    email: string, typeConfirm: string, codeConfirm: string
  ): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const results = await connection.query(
        `CALL VerifyCodeConfirm(?, ?, ?, @result);
         SELECT @result AS result;`,
        [email, typeConfirm, codeConfirm]
      );
      logger.info("Execution de la procedure VerifyCodeConfirm ")
      logger.info("Paramètres :", { email, typeConfirm, codeConfirm });

      // Forcer TypeScript à comprendre la structure des résultats
      const callResults = results as any[][];  // Correction du typage
      const selectResult = callResults[0][1] as Array<{ result: string }>;

      // Vérification et extraction du résultat
      if (selectResult && selectResult.length > 0 && selectResult[0].result) {
        const resultVerify = selectResult[0].result;
        logger.info("Résultat = " + resultVerify);

        // Retourner uniquement la chaîne utilisateurId
        return resultVerify;
      } else {
        logger.error("Erreur : Résultat non disponible.");
        throw new Error('Erreur : Résultat non disponible.');
      }
    } catch (error) {
      logger.error('Erreur dans verifyCodeConfirm', error);
      throw new Error('Erreur dans verifyCodeConfirm.');
    }
    finally {
      await connection.end();
    };

  }

  static async confirmUtilisateur(
    utilisateurId: string,
    password: string,
    displayName: string
  ): Promise<string> {
    const passwordHashed = await hashPassword(password);
    logger.info("Je hash : " + password + " = " + passwordHashed);
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const results = await connection.query(
        `CALL ConfirmUtilisateur(?, ?, ?, @result);
         SELECT @result AS result;`,
        [utilisateurId, passwordHashed, displayName]
      );
      logger.info("Execution de la procedure ConfirmUtilisateur ")
      logger.info("Parametre = " + utilisateurId + " , " + passwordHashed + " , " + displayName);
      // Forcer TypeScript à comprendre la structure des résultats
      const callResults = results as any[][];  // Correction du typage
      const selectResult = callResults[0][1] as Array<{ result: string }>;

      // Vérification et extraction du résultat
      if (selectResult && selectResult.length > 0 && selectResult[0].result) {
        const statut = selectResult[0].result;
        logger.info("Résultat = " + statut);

        // Retourner uniquement la chaîne utilisateurId
        return statut;
      } else {
        logger.error("Erreur : Résultat non disponible.");
        throw new Error('Erreur : Résultat non disponible.');
      }
    } catch (error) {
      logger.error('Erreur dans CreateUtilisateur', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  }

  static async confirmCompte(
    email: string,
    codeConfirm: string
  ): Promise<string> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const results = await connection.query(
        `CALL ConfirmCompte(?, ?, @result);
         SELECT @result AS result;`,
        [email, codeConfirm]
      );
      logger.info("Execution de la procedure ConfirmCompte ")
      logger.info("Parametre =", { email, codeConfirm });
      // Forcer TypeScript à comprendre la structure des résultats
      const callResults = results as any[][];  // Correction du typage
      const selectResult = callResults[0][1] as Array<{ result: string }>;

      // Vérification et extraction du résultat
      if (selectResult && selectResult.length > 0 && selectResult[0].result) {
        const statut = selectResult[0].result;
        logger.info("Résultat = " + statut);

        // Retourner uniquement la chaîne utilisateurId
        return statut;
      } else {
        logger.error("Erreur : Résultat non disponible.");
        throw new Error('Erreur : Résultat non disponible.');
      }
    } catch (error) {
      logger.error('Erreur dans ConfirmCompte', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  }


  static async findById(id: string): Promise<UtilisateurCompte | null> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    const [rows] = await connection.execute('SELECT id, Compte.email as email, displayName, dateDerniereConnexion, datePassword, oldPasswordsArray FROM Utilisateur INNER JOIN Compte ON Compte.email = Utilisateur.email WHERE id = ? ;', [id]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? data as UtilisateurCompte : null;
  }

  /**
   * Recherche de la valeur de ViewComptePersonne correspondant à ident
   * @param ident peut etre utilisateur.id, compte.email, employe.matricule
   * @returns 
   */
  static async findByIdent(ident: string): Promise<ComptePersonne[] | []> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    let requete = ""
    if (validateEmail(ident)) {
      requete = 'SELECT * FROM ViewComptePersonne WHERE email = ? ;';
      logger.info("Recherche par email = " + ident);
    } else if (isUUID(ident)) {
      requete = 'SELECT * FROM ViewComptePersonne WHERE utilisateurid = ? ;';
      logger.info("Recherche par id = " + ident);
    } else {
      requete = 'SELECT * FROM ViewComptePersonne WHERE matricule = ? ;';
      logger.info("Recherche par matricule = " + ident);
    }
    const [rows] = await connection.execute(requete, [ident]);
    await connection.end();

    const data = (rows as any[]);
    return data ? data as ComptePersonne[] : [];
  }

  static async findByMail(email: string): Promise<UtilisateurCompte | null> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    const [rows] = await connection.execute('SELECT id, Compte.email as email, displayName, dateDerniereConnexion, datePassword, oldPasswordsArray FROM Utilisateur INNER JOIN Compte ON Compte.email = Utilisateur.email WHERE Utilisateur.email = ? ;', [email]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? data as UtilisateurCompte : null;
  }

  static async login(
    compte: string,
    password: string
  ): Promise<string> {
    logger.info("debut dao login", compte, password);
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Étape 1 : Récupérer les informations du compte
      const [rows] = await connection.execute(
        `SELECT passwordText, isValidated, numTentativeConnexionKO 
         FROM Compte 
         WHERE email = ?`,
        [compte]
      );

      const compteData = (rows as any[])[0]; // Premier résultat
      logger.info("Apres select");
      if (!compteData) {
        logger.info(`Compte inexistant pour ${compte}`);
        await connection.execute(
          `CALL applyLogin(?, 0, ?, ?, ?)`,
          [compte, 'Erreur : login - compte inexistant', nombreTentativeLoginKO, 0]
        );
        return 'KO : Compte inexistant';
      }

      const { passwordText, isValidated, numTentativeConnexionKO } = compteData;

      // Étape 2 : Vérifier les états du compte
      if (isValidated === -1) {
        logger.info(`Compte bloqué pour ${compte}`);
        await connection.execute(
          `CALL applyLogin(?, 0, ?, ?, ?)`,
          [compte, 'Erreur : login - compte bloqué', nombreTentativeLoginKO, numTentativeConnexionKO]
        );
        return 'KO : Compte bloqué';
      }

      if (isValidated === 0) {
        logger.info(`Compte non validé pour ${compte}`);
        await connection.execute(
          `CALL applyLogin(?, 0, ?, ?, ?)`,
          [compte, 'Erreur : login - compte non validé', nombreTentativeLoginKO, numTentativeConnexionKO]
        );
        return 'KO : Compte non validé';
      }

      const isPasswordCorrect = await bcrypt.compare(password, passwordText);
      if (!isPasswordCorrect) {
        logger.info(`Mot de passe incorrect pour ${compte}`);

        // Appeler la procédure stockée pour gérer les tentatives ou bloquer le compte
        await connection.execute(
          `CALL applyLogin(?, 0, ?, ?, ?)`,
          [compte, 'Erreur : login - mot de passe incorrect', nombreTentativeLoginKO, numTentativeConnexionKO]
        );

        return 'KO : Mot de passe incorrect';
      }

      // Étape 4 : Login réussi
      await connection.execute(
        `CALL applyLogin(?, 1, NULL, ?, 0)`,
        [compte, nombreTentativeLoginKO]
      );
      logger.info(`Connexion réussie pour ${compte}`);

      return 'OK';
    } catch (error) {
      logger.error('Erreur dans login', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  }

  static async createEmploye(
    email: string,
    password: string,
    isAdministrateur: string,
    firstnameEmploye: string,
    lastnameEmploye: string,
    matricule: string,
    listCinemas: string | undefined
  ): Promise<string> {  // Retour uniquement de la chaîne de caractères
    const passwordHashed = await hashPassword(password);
    const connection = await mysql.createConnection(dbConfig);
    const isAdministrateurNumber = isAdministrateur === "true" ? 1 : 0;
    const matriculeNumber = parseInt(matricule, 10);
    const listCinemasString = listCinemas || '';

    try {
      // Exécution de la procédure stockée avec @result
      const requete = `CALL CreateEmploye(${email}, ${passwordHashed}, ${isAdministrateurNumber}, 
      ${firstnameEmploye}, ${lastnameEmploye}, ${matriculeNumber}, ${listCinemasString}, @result);
      SELECT @result AS result;`;
      logger.info(`Requete =  ${requete}`);
      const [results] = await connection.query(
        `CALL CreateEmploye(?, ?, ?, ?, ?, ?, ?, @result);
         SELECT @result AS result;`,
        [email, passwordHashed,
          isAdministrateurNumber, firstnameEmploye,
          lastnameEmploye, matriculeNumber, listCinemasString]
      );
      logger.info("Execution de la procedure CreateEmploye ")
      logger.info("Paramètres :", [email, passwordHashed,
        isAdministrateurNumber, firstnameEmploye,
        lastnameEmploye, matriculeNumber, listCinemasString], "et mot de passe hashé");

      //logger.info("Apres requete");
      // Forcer TypeScript à comprendre la structure des résultats
      //logger.info(`Resultat = ${JSON.stringify(results)}`);

      const callResults = results as any[];
      const flatResults = callResults.flat(Infinity);
      const retour = flatResults.find((item: any) => item && typeof item === 'object' && 'result' in item)?.result;
      
      return retour || 'Erreur : Résultat non disponible dans retour.';
      
    } catch (error) {
      logger.error('Erreur dans CreateUtilisateur', error);
      throw new Error('Erreur lors de l’exécution de la procédure stockée.');
    } finally {
      await connection.end();
    }
  };

  // Update

  static async updateEmploye(
    email: string, // Non mise à jour
    password: string, // == "" -> pas de mise à jour
    isAdministrateur: string,
    firstnameEmploye: string,
    lastnameEmploye: string,
    matricule: number,
    listCinemas: string): Promise<boolean> {

    const passwordHashed = (password === "") ? "" : (await hashPassword(password))!;


    const connection = await mysql.createConnection(dbConfig);
    const isAdministrateurNumber = isAdministrateur === "true" ? 1 : 0;

    try {
      logger.info(`Mise à jour l'employe ${matricule}`);

      // Début de la transaction
      await connection.beginTransaction();

      // Supprimer les lignes existantes pour le matricule donné
      await connection.execute(
        `DELETE FROM Employe_Cinema WHERE matricule=?`,
        [matricule]
      );

      // Insérer de nouvelles lignes issues de la chaîne listCinemas
      const cinemas = listCinemas?.split(',');
      if (cinemas) {
        for (const cinema of cinemas) {
          await connection.execute(
            `INSERT INTO Employe_Cinema (nameCinema, matricule) VALUES (?, ?)`,
            [cinema.trim(), matricule]
          );
        }
      }
      // Mettre à jour du mot de passe si fournis
      if (passwordHashed !== "")
        await connection.execute(
          `UPDATE Compte SET
            passwordText=?
             WHERE email=?`,
          [passwordHashed,
            email]
        );

      // Mettre à jour les détails de l'employé
      await connection.execute(
        `UPDATE Employe SET
             isAdministrateur=?, lastnameEmploye=?, firstnameEmploye=?
             WHERE matricule=?`,
        [isAdministrateurNumber,
        lastnameEmploye || "",
        firstnameEmploye || "",
          matricule]
      );

      // Valider la transaction
      await connection.commit();
      await connection.end();
      return true;
    } catch (err) {
      // Annuler la transaction en cas d'erreur
      await connection.rollback();
      await connection.end();
      logger.error('Erreur update employe:', err);
      throw err;
    }

  }


  /**
   * Recherche des employés v la valeur de ViewComptePersonne correspondant à ident
   * @param ident peut etre utilisateur.id, compte.email, employe.matricule
   * @returns 
   */
  static async getEmployesComptes(): Promise<ComptePersonne[] | []> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    let requete = 'SELECT * FROM ViewComptePersonne WHERE matricule IS NOT NULL;';

    const [rows] = await connection.execute(requete);
    await connection.end();

    const data = (rows as any[]);
    return data ? data as ComptePersonne[] : [];
  }


  static async getEmployeByMatricule(matricule: string): Promise<ComptePersonne | null> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    const requete = 'SELECT * FROM ViewComptePersonne WHERE matricule = ?;';
    const [rows] = await connection.execute((requete), [matricule]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? data as ComptePersonne : null;
  }

  // Delete
  static async deleteEmployeByMatricule(matricule: number): Promise<boolean> {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Récupération de l'email
      const requete = 'select email from Employe where matricule = ?;';
      const [rows] = await connection.execute((requete), [matricule]);
      const emailObj = (rows as any[])[0] as { email: string };
      logger.info(`Suppression de l'Employe : matricule = ${matricule}, email = ${JSON.stringify(emailObj)} soit ${emailObj.email}`);

      logger.info(`Suppression de l'Employe_Cinema ${matricule}`);
      // Début de la transaction
      await connection.beginTransaction();
      const [result1] = await connection.execute(
        'DELETE FROM Employe_Cinema WHERE matricule = ?',
        [matricule]
      );
      const rowsAffected1 = (result1 as any).affectedRows || 0;
      if (rowsAffected1 === 0) {
        throw new Error(`Erreur: suppression Employe_Cinema = ${matricule}`);
      };

      logger.info(`Suppression de l'Employe ${matricule}`);
      const [result2] = await connection.execute(
        'DELETE FROM Employe WHERE matricule = ?',
        [matricule]
      );
      const rowsAffected2 = (result2 as any).affectedRows || 0;
      if (rowsAffected2 === 0) {
        throw new Error(`Erreur: suppression Employe = ${matricule}`);
      };

      logger.info(`Suppression du compte ${emailObj.email}`);
      const [result3] = await connection.execute(
        'DELETE FROM Compte WHERE email = ?',
        [emailObj.email]
      );
      const rowsAffected3 = (result2 as any).affectedRows || 0;
      if (rowsAffected2 === 0) {
        throw new Error(`Erreur: suppression Compte = ${emailObj.email}`);
      };
    // Valider la transaction
      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      logger.error('Erreur delete Employe:', err);
      throw Error(`Impossible de supprimer Employer : ${err}`);
    } finally {
      await connection.end();
    }
  }

};
