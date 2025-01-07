
// Nécessite que l'ensemble soit chargé en amont dans server.ts
// import dotenv from 'dotenv';
// import path from 'path';
// Charger les variables d'environnement depuis le fichier .env
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const currentEnv = process.env.NODE_ENV || 'development';
console.log(`Environnement actif : '${currentEnv}'`);

// Exporter la configuration de la base de données
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydatabase'
};
console.log('Configuration DB chargée :', dbConfig);

export const sessionTK = {
    secret: process.env.SESSION_SECRET || 'secretsession',
    resave: false,
    saveUninitialized: false,
}
console.log('Configuration secret Session :', sessionTK);

export const jwtTK = process.env.JWT_SECRET || 'secretjws';
console.log('Configuration secret JWS :', jwtTK);


// Autres configs (port, secrets JWT, etc.)
// export const SERVER_PORT = process.env.SERVER_PORT || 3000;
// 

