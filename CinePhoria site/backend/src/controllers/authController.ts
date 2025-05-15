import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { UtilisateurDAO } from '../dao/UtilisateurDAO';
import { AuthDAO } from '../dao/AuthDAO';
import logger from '../config/configLog';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';

// Durée de vie
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '15m'; // ex. 15 minutes
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d'; // ex. 7 jours
logger.info("Delai JWT = " + ACCESS_TOKEN_EXPIRATION + " " + REFRESH_TOKEN_EXPIRATION);
import { versionCourante } from '../config/config';
import { MajSite } from '../shared-models/MajSite';


export class AuthController {

  /**
   * POST /api/login
   * Le user envoie { compte, password }
   * -> Vérification
   * -> Renvoi { accessToken } et , refreshToken dans les cookie   */
  static async login(req: Request, res: Response): Promise<void> {
    logger.info("Controller = ", JSON.stringify(req.body));
    const { compte, password } = req.body;

    // Vérification des identifiants (ex. via DAO)
    const resultText = await UtilisateurDAO.login(compte, password);
    if (resultText !== 'OK') {
      if (resultText === 'KO : Compte bloqué') {
        res.status(401).json({ message: 'Compte bloqué suite trop d\'erreurs' });
      } else {
        res.status(401).json({ message: 'Erreur de mail ou de mot de passe' });
      }
      return;
    }
    logger.info("typeof access = " + typeof ACCESS_TOKEN_EXPIRATION + " = " + ACCESS_TOKEN_EXPIRATION);
    logger.info("typeof refresh = " + typeof REFRESH_TOKEN_EXPIRATION + " = " + REFRESH_TOKEN_EXPIRATION);

    // Vérification et parsing correct des durées d'expiration
    const accessExp = parseInt(ACCESS_TOKEN_EXPIRATION, 10);
    const refreshExp = parseInt(REFRESH_TOKEN_EXPIRATION, 10);

    if (isNaN(accessExp) || isNaN(refreshExp)) {
      throw new Error("ACCESS_TOKEN_EXPIRATION or REFRESH_TOKEN_EXPIRATION is not a valid number");
    }

    // Générer un access token
    const accessToken = jwt.sign(
      { compte },
      JWT_ACCESS_SECRET,
      { expiresIn: accessExp }
    );
    // Générer un refresh token
    const refreshToken = jwt.sign(
      { compte },
      JWT_REFRESH_SECRET,
      { expiresIn: refreshExp }
    );

    // Stocker refreshToken dans un cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      // TODO a voir quand on sera en https
      httpOnly: true,   // empêche l'accès en JavaScript => plus sûr
      secure: true,    // mettre true si HTTPS en production
      sameSite: 'none',
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en ms
    });

    // Renvoyer l'accessToken dans le body (ou dans l'en-tête)
    res.json({ accessToken });
  }

  /**
   * POST /api/login/refresh
   * Le user envoie le refreshToken via le cookie HttpOnly
   * On vérifie que le refreshToken est encore valide => renvoyer un nouveau accessToken
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.cookies;

    const accessExp = parseInt(ACCESS_TOKEN_EXPIRATION, 10);

    if (isNaN(accessExp)) {
      throw new Error("ACCESS_TOKEN_EXPIRATION is not a valid number");
    }

    if (!refreshToken) {
      res.status(401).json({ message: 'Aucun refresh token' });
      return;
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {


      if (err) {
        res.status(403).json({ message: 'Refresh token invalide ou expiré' });
        return;
      }
      // Générer un nouveau accessToken
      const compte = (decoded as any).compte;
      const payload = {
        compte,
        jti: crypto.randomUUID()
      };

      const newAccessToken = jwt.sign(payload, JWT_ACCESS_SECRET,
        {
          expiresIn: accessExp
         
        });

      res.json({ accessToken: newAccessToken });
    });
  }

  /**
 * POST /api/login/logout
 * Reçoit { refreshToken }, on le supprime du store => invalidation
 */
  static async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({ message: 'Aucun refresh token' });
      return;
    }

    // 2) Invalider le cookie côté client
    res.cookie('refreshToken', '', {
      // TODO a voir quand on sera en https
      httpOnly: true,
      secure: true,  // en prod => true si HTTPS
      sameSite: 'none',
      expires: new Date(0) // date expirée
    });

    // 3) Réponse
    res.json({ message: 'Logout effectué, refresh token révoqué' });

    return; // S'assure que la fonction respecte `Promise<void>`
  }

  // Renvoi la version issue du .env
  static async getVersion(req: Request, res: Response) {
    try {
      const version = await AuthDAO.getVersion();
      logger.info(JSON.stringify(version))
      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async pushVersion(req: Request, res: Response) {
    try {
      // On récupère les données dans req.body

      const data = req.body;
      logger.info("Creation d'une mise a jour avec data = ", data);

      // On construit une Maj
      const majToCreate = new MajSite(data);
      // Appel du DAO
      const result = await AuthDAO.pushVersion(majToCreate);

      // On renvoie l’ID ou un message
      res.status(201).json({ message: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async simplePushVersion(message: string) {
    const majSite = new MajSite({ message: message });
    logger.info(`Nouvelle Version =  + ${message}`)
    await AuthDAO.pushVersion(majSite);
  }
}
