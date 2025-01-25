import * as bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/config';
import logger from '../config/configLog';
import { UtilisateurCompte } from '../shared-models/Utilisateur';


async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Plus le nombre est élevé, plus c'est sécurisé mais plus lent
  return await bcrypt.hash(password, saltRounds);
}
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
      logger.info("Paramètres :", { email, passwordHashed, displayName });

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



  static async confirmUtilisateur(
    utilisateurId: string,
    password: string,
    displayName: string
  ): Promise<string> {
    const passwordHashed = await hashPassword(password);
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Exécution de la procédure stockée avec @result
      const results = await connection.query(
        `CALL ConfirmUtilisateur(?, ?, ?, @result);
         SELECT @result AS result;`,
        [utilisateurId, passwordHashed, displayName]
      );
      logger.info("Execution de la procedure ConfirmUtilisateur ")
      logger.info("Parametre =", [utilisateurId, passwordHashed, displayName]);
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


  static async findById(id: string): Promise<UtilisateurCompte | null> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    const [rows] = await connection.execute('select id, compte.email as email, displayName, dateDerniereConnexion, datePassword, oldPasswordsArray from Utilisateur inner join Compte on compte.email = utilisateur.email  where id = ? ;', [id]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? data as UtilisateurCompte : null;
  }

  static async findByMail(email: string): Promise<UtilisateurCompte | null> {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Connexion réussie à la base de données');
    const [rows] = await connection.execute('select id, compte.email as email, displayName, dateDerniereConnexion, datePassword, oldPasswordsArray from Utilisateur inner join Compte on compte.email = utilisateur.email  where utilisateur.email = ? ;', [email]);
    await connection.end();

    const data = (rows as any[])[0];
    return data ? data as UtilisateurCompte : null;
  }
};

