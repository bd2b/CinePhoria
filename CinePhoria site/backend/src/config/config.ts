
// Nécessite que l'ensemble soit chargé en amont dans server.ts
// import dotenv from 'dotenv';
// import path from 'path';
// Charger les variables d'environnement depuis le fichier .env
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import logger from '../config/configLog';
import mongoose from 'mongoose';
import mysql from 'mysql2/promise'; 

// Exporter le mode d'exécution
export const modeExec = process.env.ENVIRONNEMENT;
logger.info(`Execution en mode ${modeExec}`);

export const urlString = process.env.URLSTRING;
logger.info(`URL = ${urlString}`);

// Exporter la version
export const versionCourante = {
  majeure: parseInt(process.env.MAJEURE || "0", 10),
  mineure: parseInt(process.env.MINEURE || "0", 10),
  build: parseInt(process.env.BUILD || "0", 10)
}

// Exporter la configuration de la base de données
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydatabase',
  multipleStatements: true, // Autorise plusieurs requêtes dans une seule commande
  timezone: 'Europe/Paris'
};

// Exporter la configuration de l'envoi de mail, lue depuis les variables d'environnement
export const mailConfig = {
  STARTTLS: process.env.STARTTLS || 'true',         // ex. 'true' ou 'false'
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.free.fr',
  SMTP_PORT: process.env.SMTP_PORT || '465',
  SMTP_USER: process.env.SMTP_USER || 'yyyyyy',
  SMTP_PASS: process.env.SMTP_PASS || 'xxxxxxx',
  SMTP_FROM: 'CINEPHORIA<cinephoria@free.fr>'
};

// copie de l'objet pour masquer la valeur de "password"
const maskeddbConfig = {
  ...dbConfig,
  password: "*".repeat(dbConfig.password.length), // Remplace la valeur par des étoiles
};
logger.info('Configuration DB chargée :' + JSON.stringify(maskeddbConfig));



export const jwtTK = process.env.JWT_SECRET || 'secretjws';
// copie de l'objet pour masquer la valeur
const masquedjwtTK = "*".repeat(jwtTK.length); // Remplace la valeur par des étoiles
logger.info('Configuration secret JWS :' + masquedjwtTK);

export const nombreTentativeLoginKO = parseInt(process.env.MAX_TENTATIVE_LOGIN_KO_BEFORE_BLOCKED || '3', 10);

export const ConfigMongo = {
  mongoUri: process.env.MONGO_URI || '',
};
logger.info("Mongo URI", ConfigMongo);

export const connectDBMongo = async () => {
  try {
    await mongoose.connect(ConfigMongo.mongoUri);
    logger.info('MongoDB connecté.');
  } catch (error) {
    logger.error('Erreur connexion MongoDB :', error);
  }
};



// Ajout de la nouvelle exportation dbPool
export const dbPool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: dbConfig.multipleStatements,
  timezone: dbConfig.timezone,
});

