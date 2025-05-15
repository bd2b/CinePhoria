"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilisateurDAO = void 0;
exports.isUUID = isUUID;
exports.validateEmail = validateEmail;
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("../config/config");
const configLog_1 = __importDefault(require("../config/configLog"));
async function hashPassword(password) {
    const saltRounds = 10; // Plus le nombre est élevé, plus c'est sécurisé mais plus lent
    return await bcrypt.hash(password, saltRounds);
}
/**
 * Vérification d'un mot de passe
 * @param password en clair
 * @param hashedPassword password hasché
 * @returns boolean
 */
async function isPasswordEqual(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
/**
 * Fonction de vérification d'UUID
 */
function isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str.trim());
}
/**
   * Vérifie la validité d'un email.
   * @param email - L'email à valider.
   * @returns boolean - True si l'email est valide, sinon False.
   */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
;
class UtilisateurDAO {
    static async createUtilisateur(email, password, displayName) {
        const passwordHashed = await hashPassword(password);
        const connection = await config_1.dbPool.getConnection();
        try {
            // Exécution de la procédure stockée avec @result
            const results = await connection.query(`CALL CreateUtilisateur(?, ?, ?, @result);
         SELECT @result AS result;`, [email, passwordHashed, displayName]);
            configLog_1.default.info("Execution de la procedure CreateUtilisateur ");
            configLog_1.default.info("Paramètres :", { email, displayName }, "et mot de passe hashé");
            // Forcer TypeScript à comprendre la structure des résultats
            const callResults = results; // Correction du typage
            const selectResult = callResults[0][1];
            // Vérification et extraction du résultat
            if (selectResult && selectResult.length > 0 && selectResult[0].result) {
                const utilisateurId = selectResult[0].result;
                configLog_1.default.info("Résultat = " + utilisateurId);
                // Retourner uniquement la chaîne utilisateurId
                return utilisateurId;
            }
            else {
                configLog_1.default.error("Erreur : Résultat non disponible.");
                throw new Error('Erreur : Résultat non disponible.');
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans CreateUtilisateur', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    ;
    static async changePWD(email, newPWD) {
        const connection = await config_1.dbPool.getConnection();
        const passwordHashed = await hashPassword(newPWD);
        try {
            const result = connection.query(`UPDATE Compte 
          SET passwordText = ?,
              datePassword = NOW(),
              oldPasswordsArray = CONCAT(oldPasswordsArray,',',passwordText)
          WHERE email = ?`, [passwordHashed, email]);
            configLog_1.default.info("Execution de la procedure changePWD ");
            configLog_1.default.info("Paramètres :", { email }, "et mot de passe hashé");
            configLog_1.default.info("Result :", JSON.stringify(result));
        }
        catch (error) {
            configLog_1.default.error('Erreur dans CreateUtilisateur', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    static async getCodeConfirm(email, typeConfirm) {
        const connection = await config_1.dbPool.getConnection();
        try {
            const [rows] = await connection.query(`SELECT codeConfirm , numTry, dateCreateCode
            FROM CodesConfirm
            WHERE email  = ? AND typeConfirm = ?
			      `, [email, typeConfirm]);
            configLog_1.default.info("Execution de la requete " + `SELECT codeConfirm , numTry, dateCreateCode FROM CodesConfirm WHERE email  = ${email} AND typeConfirm = ${typeConfirm})`);
            return rows;
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
        }
        catch (error) {
            configLog_1.default.error('Erreur dans select getCodeConfirm', error);
            throw new Error('Erreur dans select getCodeConfirm.');
        }
        finally {
            connection.release();
        }
        ;
    }
    static async createCodeConfirm(email, typeConfirm) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // Exécution de la procédure stockée avec @result
            const results = await connection.query(`CALL CreateCodeConfirm(?, ?, @result);
         SELECT @result AS result;`, [email, typeConfirm]);
            configLog_1.default.info("Execution de la procedure CreateCodeConfirm ");
            configLog_1.default.info("Paramètres :", { email, typeConfirm });
            // Forcer TypeScript à comprendre la structure des résultats
            const callResults = results; // Correction du typage
            const selectResult = callResults[0][1];
            // Vérification et extraction du résultat
            if (selectResult && selectResult.length > 0 && selectResult[0].result) {
                const codeConfirm = selectResult[0].result;
                configLog_1.default.info("Résultat = " + codeConfirm);
                // Retourner uniquement la chaîne utilisateurId
                return codeConfirm;
            }
            else {
                configLog_1.default.error("Erreur : Résultat non disponible.");
                throw new Error('Erreur : Résultat non disponible.');
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans createCodeConfirm', error);
            throw new Error('Erreur dans createCodeConfirm.');
        }
        finally {
            connection.release();
        }
        ;
    }
    static async verifyCodeConfirm(email, typeConfirm, codeConfirm) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // Exécution de la procédure stockée avec @result
            const results = await connection.query(`CALL VerifyCodeConfirm(?, ?, ?, @result);
         SELECT @result AS result;`, [email, typeConfirm, codeConfirm]);
            configLog_1.default.info("Execution de la procedure VerifyCodeConfirm ");
            configLog_1.default.info("Paramètres :", { email, typeConfirm, codeConfirm });
            // Forcer TypeScript à comprendre la structure des résultats
            const callResults = results; // Correction du typage
            const selectResult = callResults[0][1];
            // Vérification et extraction du résultat
            if (selectResult && selectResult.length > 0 && selectResult[0].result) {
                const resultVerify = selectResult[0].result;
                configLog_1.default.info("Résultat = " + resultVerify);
                // Retourner uniquement la chaîne utilisateurId
                return resultVerify;
            }
            else {
                configLog_1.default.error("Erreur : Résultat non disponible.");
                throw new Error('Erreur : Résultat non disponible.');
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans verifyCodeConfirm', error);
            throw new Error('Erreur dans verifyCodeConfirm.');
        }
        finally {
            connection.release();
        }
        ;
    }
    static async confirmUtilisateur(utilisateurId, password, displayName) {
        const passwordHashed = await hashPassword(password);
        configLog_1.default.info("Je hash : " + password + " = " + passwordHashed);
        const connection = await config_1.dbPool.getConnection();
        try {
            // Exécution de la procédure stockée avec @result
            const results = await connection.query(`CALL ConfirmUtilisateur(?, ?, ?, @result);
         SELECT @result AS result;`, [utilisateurId, passwordHashed, displayName]);
            configLog_1.default.info("Execution de la procedure ConfirmUtilisateur ");
            configLog_1.default.info("Parametre = " + utilisateurId + " , " + passwordHashed + " , " + displayName);
            // Forcer TypeScript à comprendre la structure des résultats
            const callResults = results; // Correction du typage
            const selectResult = callResults[0][1];
            // Vérification et extraction du résultat
            if (selectResult && selectResult.length > 0 && selectResult[0].result) {
                const statut = selectResult[0].result;
                configLog_1.default.info("Résultat = " + statut);
                // Retourner uniquement la chaîne utilisateurId
                return statut;
            }
            else {
                configLog_1.default.error("Erreur : Résultat non disponible.");
                throw new Error('Erreur : Résultat non disponible.');
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans CreateUtilisateur', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    static async confirmCompte(email, codeConfirm) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // Exécution de la procédure stockée avec @result
            const results = await connection.query(`CALL ConfirmCompte(?, ?, @result);
         SELECT @result AS result;`, [email, codeConfirm]);
            configLog_1.default.info("Execution de la procedure ConfirmCompte ");
            configLog_1.default.info("Parametre =", { email, codeConfirm });
            // Forcer TypeScript à comprendre la structure des résultats
            const callResults = results; // Correction du typage
            const selectResult = callResults[0][1];
            // Vérification et extraction du résultat
            if (selectResult && selectResult.length > 0 && selectResult[0].result) {
                const statut = selectResult[0].result;
                configLog_1.default.info("Résultat = " + statut);
                // Retourner uniquement la chaîne utilisateurId
                return statut;
            }
            else {
                configLog_1.default.error("Erreur : Résultat non disponible.");
                throw new Error('Erreur : Résultat non disponible.');
            }
        }
        catch (error) {
            configLog_1.default.error('Erreur dans ConfirmCompte', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    static async findById(id) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT id, Compte.email as email, displayName, dateDerniereConnexion, datePassword, oldPasswordsArray FROM Utilisateur INNER JOIN Compte ON Compte.email = Utilisateur.email WHERE id = ? ;', [id]);
        connection.release();
        const data = rows[0];
        return data ? data : null;
    }
    /**
     * Recherche de la valeur de ViewComptePersonne correspondant à ident
     * @param ident peut etre utilisateur.id, compte.email, employe.matricule
     * @returns
     */
    static async findByIdent(ident) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        let requete = "";
        if (validateEmail(ident)) {
            requete = 'SELECT * FROM ViewComptePersonne WHERE email = ? ;';
            configLog_1.default.info("Recherche par email = " + ident);
        }
        else if (isUUID(ident)) {
            requete = 'SELECT * FROM ViewComptePersonne WHERE utilisateurid = ? ;';
            configLog_1.default.info("Recherche par id = " + ident);
        }
        else {
            requete = 'SELECT * FROM ViewComptePersonne WHERE matricule = ? ;';
            configLog_1.default.info("Recherche par matricule = " + ident);
        }
        const [rows] = await connection.execute(requete, [ident]);
        connection.release();
        const data = rows;
        return data ? data : [];
    }
    static async findByMail(email) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const [rows] = await connection.execute('SELECT id, Compte.email as email, displayName, dateDerniereConnexion, datePassword, oldPasswordsArray FROM Utilisateur INNER JOIN Compte ON Compte.email = Utilisateur.email WHERE Utilisateur.email = ? ;', [email]);
        connection.release();
        const data = rows[0];
        return data ? data : null;
    }
    static async login(compte, password) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // Étape 1 : Récupérer les informations du compte
            const [rows] = await connection.execute(`SELECT passwordText, isValidated, numTentativeConnexionKO 
         FROM Compte 
         WHERE email = ?`, [compte]);
            const compteData = rows[0]; // Premier résultat
            if (!compteData) {
                configLog_1.default.info(`Compte inexistant pour ${compte}`);
                await connection.execute(`CALL applyLogin(?, 0, ?, ?, ?)`, [compte, 'Erreur : login - compte inexistant', config_1.nombreTentativeLoginKO, 0]);
                return 'KO : Compte inexistant';
            }
            const { passwordText, isValidated, numTentativeConnexionKO } = compteData;
            // Étape 2 : Vérifier les états du compte
            if (isValidated === -1) {
                configLog_1.default.info(`Compte bloqué pour ${compte}`);
                await connection.execute(`CALL applyLogin(?, 0, ?, ?, ?)`, [compte, 'Erreur : login - compte bloqué', config_1.nombreTentativeLoginKO, numTentativeConnexionKO]);
                return 'KO : Compte bloqué';
            }
            if (isValidated === 0) {
                configLog_1.default.info(`Compte non validé pour ${compte}`);
                await connection.execute(`CALL applyLogin(?, 0, ?, ?, ?)`, [compte, 'Erreur : login - compte non validé', config_1.nombreTentativeLoginKO, numTentativeConnexionKO]);
                return 'KO : Compte non validé';
            }
            const isPasswordCorrect = await bcrypt.compare(password, passwordText);
            if (!isPasswordCorrect) {
                configLog_1.default.info(`Mot de passe incorrect pour ${compte}`);
                // Appeler la procédure stockée pour gérer les tentatives ou bloquer le compte
                await connection.execute(`CALL applyLogin(?, 0, ?, ?, ?)`, [compte, 'Erreur : login - mot de passe incorrect', config_1.nombreTentativeLoginKO, numTentativeConnexionKO]);
                return 'KO : Mot de passe incorrect';
            }
            // Étape 4 : Login réussi
            await connection.execute(`CALL applyLogin(?, 1, NULL, ?, 0)`, [compte, config_1.nombreTentativeLoginKO]);
            configLog_1.default.info(`Connexion réussie pour ${compte}`);
            return 'OK';
        }
        catch (error) {
            configLog_1.default.error('Erreur dans login', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    static async createEmploye(email, password, isAdministrateur, firstnameEmploye, lastnameEmploye, matricule, listCinemas) {
        const passwordHashed = await hashPassword(password);
        const connection = await config_1.dbPool.getConnection();
        const isAdministrateurNumber = isAdministrateur === "true" ? 1 : 0;
        const matriculeNumber = parseInt(matricule, 10);
        const listCinemasString = listCinemas || '';
        try {
            // Exécution de la procédure stockée avec @result
            const requete = `CALL CreateEmploye(${email}, ${passwordHashed}, ${isAdministrateurNumber}, 
      ${firstnameEmploye}, ${lastnameEmploye}, ${matriculeNumber}, ${listCinemasString}, @result);
      SELECT @result AS result;`;
            configLog_1.default.info(`Requete =  ${requete}`);
            const [results] = await connection.query(`CALL CreateEmploye(?, ?, ?, ?, ?, ?, ?, @result);
         SELECT @result AS result;`, [email, passwordHashed,
                isAdministrateurNumber, firstnameEmploye,
                lastnameEmploye, matriculeNumber, listCinemasString]);
            configLog_1.default.info("Execution de la procedure CreateEmploye ");
            configLog_1.default.info("Paramètres :", [email, passwordHashed,
                isAdministrateurNumber, firstnameEmploye,
                lastnameEmploye, matriculeNumber, listCinemasString], "et mot de passe hashé");
            //logger.info("Apres requete");
            // Forcer TypeScript à comprendre la structure des résultats
            //logger.info(`Resultat = ${JSON.stringify(results)}`);
            const callResults = results;
            const flatResults = callResults.flat(Infinity);
            const retour = flatResults.find((item) => item && typeof item === 'object' && 'result' in item)?.result;
            return retour || 'Erreur : Résultat non disponible dans retour.';
        }
        catch (error) {
            configLog_1.default.error('Erreur dans CreateUtilisateur', error);
            throw new Error('Erreur lors de l’exécution de la procédure stockée.');
        }
        finally {
            connection.release();
        }
    }
    ;
    // Update
    static async updateEmploye(email, // Non mise à jour
    password, // == "" -> pas de mise à jour
    isAdministrateur, firstnameEmploye, lastnameEmploye, matricule, listCinemas) {
        const passwordHashed = (password === "") ? "" : (await hashPassword(password));
        const connection = await config_1.dbPool.getConnection();
        const isAdministrateurNumber = isAdministrateur === "true" ? 1 : 0;
        try {
            configLog_1.default.info(`Mise à jour l'employe ${matricule}`);
            // Début de la transaction
            await connection.beginTransaction();
            // Supprimer les lignes existantes pour le matricule donné
            await connection.execute(`DELETE FROM Employe_Cinema WHERE matricule=?`, [matricule]);
            // Insérer de nouvelles lignes issues de la chaîne listCinemas
            const cinemas = listCinemas?.split(',');
            if (cinemas) {
                for (const cinema of cinemas) {
                    await connection.execute(`INSERT INTO Employe_Cinema (nameCinema, matricule) VALUES (?, ?)`, [cinema.trim(), matricule]);
                }
            }
            // Mettre à jour du mot de passe si fournis
            if (passwordHashed !== "")
                await connection.execute(`UPDATE Compte SET
            passwordText=?
             WHERE email=?`, [passwordHashed,
                    email]);
            // Mettre à jour les détails de l'employé
            await connection.execute(`UPDATE Employe SET
             isAdministrateur=?, lastnameEmploye=?, firstnameEmploye=?
             WHERE matricule=?`, [isAdministrateurNumber,
                lastnameEmploye || "",
                firstnameEmploye || "",
                matricule]);
            // Valider la transaction
            await connection.commit();
            connection.release();
            return true;
        }
        catch (err) {
            // Annuler la transaction en cas d'erreur
            await connection.rollback();
            connection.release();
            configLog_1.default.error('Erreur update employe:', err);
            throw err;
        }
    }
    /**
     * Recherche des employés v la valeur de ViewComptePersonne correspondant à ident
     * @param ident peut etre utilisateur.id, compte.email, employe.matricule
     * @returns
     */
    static async getEmployesComptes() {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        let requete = 'SELECT * FROM ViewComptePersonne WHERE matricule IS NOT NULL;';
        const [rows] = await connection.execute(requete);
        connection.release();
        const data = rows;
        return data ? data : [];
    }
    static async getEmployeByMatricule(matricule) {
        const connection = await config_1.dbPool.getConnection();
        configLog_1.default.info('Connexion réussie à la base de données');
        const requete = 'SELECT * FROM ViewComptePersonne WHERE matricule = ?;';
        const [rows] = await connection.execute((requete), [matricule]);
        connection.release();
        const data = rows[0];
        return data ? data : null;
    }
    // Delete
    static async deleteEmployeByMatricule(matricule) {
        const connection = await config_1.dbPool.getConnection();
        try {
            // Récupération de l'email
            const requete = 'select email from Employe where matricule = ?;';
            const [rows] = await connection.execute((requete), [matricule]);
            const emailObj = rows[0];
            configLog_1.default.info(`Suppression de l'Employe : matricule = ${matricule}, email = ${JSON.stringify(emailObj)} soit ${emailObj.email}`);
            configLog_1.default.info(`Suppression de l'Employe_Cinema ${matricule}`);
            // Début de la transaction
            await connection.beginTransaction();
            const [result1] = await connection.execute('DELETE FROM Employe_Cinema WHERE matricule = ?', [matricule]);
            const rowsAffected1 = result1.affectedRows || 0;
            if (rowsAffected1 === 0) {
                throw new Error(`Erreur: suppression Employe_Cinema = ${matricule}`);
            }
            ;
            configLog_1.default.info(`Suppression de l'Employe ${matricule}`);
            const [result2] = await connection.execute('DELETE FROM Employe WHERE matricule = ?', [matricule]);
            const rowsAffected2 = result2.affectedRows || 0;
            if (rowsAffected2 === 0) {
                throw new Error(`Erreur: suppression Employe = ${matricule}`);
            }
            ;
            configLog_1.default.info(`Suppression du compte ${emailObj.email}`);
            const [result3] = await connection.execute('DELETE FROM Compte WHERE email = ?', [emailObj.email]);
            const rowsAffected3 = result2.affectedRows || 0;
            if (rowsAffected2 === 0) {
                throw new Error(`Erreur: suppression Compte = ${emailObj.email}`);
            }
            ;
            // Valider la transaction
            await connection.commit();
            return true;
        }
        catch (err) {
            await connection.rollback();
            configLog_1.default.error('Erreur delete Employe:', err);
            throw Error(`Impossible de supprimer Employer : ${err}`);
        }
        finally {
            connection.release();
        }
    }
}
exports.UtilisateurDAO = UtilisateurDAO;
;
