
// Nécessite que l'ensemble soit chargé en amont dans server.ts
// import dotenv from 'dotenv';
// import path from 'path';
// Charger les variables d'environnement depuis le fichier .env
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import logger from '../config/configLog'

export const currentEnv = process.env.NODE_ENV || 'development';
logger.info(`Environnement actif : '${currentEnv}'`);

// Exporter la configuration de la base de données
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydatabase',
  multipleStatements: true // Autorise plusieurs requêtes dans une seule commande
};

// copie de l'objet pour masquer la valeur de "password"
const maskeddbConfig = {
  ...dbConfig,
  password: "*".repeat(dbConfig.password.length), // Remplace la valeur par des étoiles
};
logger.info('Configuration DB chargée :' + JSON.stringify(maskeddbConfig));



export const sessionTK = {
    secret: process.env.SESSION_SECRET || 'secretsession',
    resave: false,
    saveUninitialized: false,
}
// copie de l'objet pour masquer la valeur de "secret"
const maskedSessionTK = {
  ...sessionTK,
  secret: "*".repeat(sessionTK.secret.length), // Remplace la valeur par des étoiles
};
logger.info('Configuration secret Session :' + JSON.stringify(maskedSessionTK));


export const jwtTK = process.env.JWT_SECRET || 'secretjws';
// copie de l'objet pour masquer la valeur
const masquedjwtTK = "*".repeat(jwtTK.length); // Remplace la valeur par des étoiles
logger.info('Configuration secret JWS :'+ masquedjwtTK);



// Autres configs (port, secrets JWT, etc.)
// export const SERVER_PORT = process.env.SERVER_PORT || 3000;
// 

