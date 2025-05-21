import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from './config/configLog';
import sanitizeQueryMiddleware from './middlewares/sanitiseQueryMiddleware';
import fileUpload from 'express-fileupload';
import compression from 'compression';

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
export function loadEnv(): void {
  const possiblePaths = [
    path.resolve(__dirname, '../../env/.env'), // dev (src/server.ts)
    path.resolve(__dirname, '../env/.env'),    // prod Docker (dist/server.js)
    path.resolve(process.cwd(), 'env/.env'),   // fallback général
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(`✅ Fichier .env chargé depuis : ${envPath}`);
      return;
    }
  }
  console.error('❌ Aucun fichier .env trouvé');
}
loadEnv();
logger.info("Version env après chargement :" + process.env.MAJEURE + " - " + process.env.MINEURE + " - " + process.env.BUILD);


// Connexion à la base MongoDB
import { connectDBMongo , modeExec , urlString, versionCourante} from './config/config';

console.log(`🛠️ Mode actuel : ${modeExec} avec version ${JSON.stringify(versionCourante)}`);

connectDBMongo()

const app = express();

// Suppression de la signature
app.disable('x-powered-by');

app.use(cookieParser()); // ✅ Important

// ✅ Middleware pour la compression
// 🔹 Active la compression gzip
app.use(compression());

// Middleware pour bloquer les embarquements de iFRAME
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN"); 
  next();
});
// Content-Security-Policy (CSP)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self';");
  next();
});

// Middleware de protection contre les injections
app.use(sanitizeQueryMiddleware); // Appliquer à toutes les routes

// ✅ Middleware pour tester l'origine (DEBUG)
// app.use((req, res, next) => {
//   console.log("Requête depuis :", req.headers.origin);
//   next();
// });

// ✅ Middleware pour gérer l'upload de fichiers
app.use(fileUpload({
  // Options facultatives
  parseNested: true,
  useTempFiles: false,
  createParentPath: true,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limite à 1MB
}));

// ✅ Middleware JSON (Obligatoire pour Express)
app.use(express.json());


import filmRoutes from './routes/filmRoutes';
import cinemaRoutes from './routes/cinemaRoutes';
import salleRoutes from './routes/salleRoute';
import seanceRoutes from './routes/seanceRoutes';
import seanceseuleRoutes from './routes/seanceseuleRoutes'
import reservationRoutes from './routes/reservationRoutes';
import utilisateurRoutes from './routes/utilisateurRoutes';
import incidentRoutes from './routes/incidentRoutes'

import mailRoutes from './routes/mailRoutes';
import loginRoutes from './routes/publicLoginRoutes';

app.use('/api/films', filmRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/seancesseules', seanceseuleRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/utilisateur', utilisateurRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/mail', mailRoutes);

// Route pour servir les fichiers statics
// cas particulier le mode developpement PROD et STAGING pareil
const frontPath = (modeExec === 'developpement')
  ? path.join(__dirname, '../../frontend/public/')
  : path.join(__dirname, '../public');

console.log(`🔍 Fichiers front servis depuis : ${frontPath}`);

// Rediriger la racine vers visiteur.html
app.get('/', (req, res) => {
  res.redirect('/visiteur.html');
});

app.use(express.static(frontPath));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontPath));
// });

// Dev ou PROD
let httpsPort = 3500;
let httpPort = 3000;
if (modeExec === 'stagging') {
  httpsPort = 3600
  httpPort = 3100
}


if (modeExec === 'production') {
  const sslKeyPath = process.env.SSL_KEY_PATH || '/usr/src/app/ssl/private.key';
  const sslCertPath = process.env.SSL_CERT_PATH || '/usr/src/app/ssl/certificate.crt';

  const privateKey = fs.readFileSync(sslKeyPath, 'utf8');
  const certificate = fs.readFileSync(sslCertPath, 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(httpsPort, () => {
    console.log(`✅ Serveur HTTPS (production) démarré sur ${urlString}:${httpsPort}`);
  });

  const httpServer = http.createServer((req, res) => {
    const host = req.headers['host']?.split(':')[0] || 'localhost';
    res.writeHead(301, { Location: `https://${host}:${httpsPort}${req.url}` });
    res.end();
  });
  httpServer.listen(httpPort, () => {
    console.log(`🚀 Serveur HTTP (redirection vers HTTPS) démarré sur le port ${httpPort}`);
  });
} else {
  app.listen(httpsPort, () => {
    console.log(`🛠️ Serveur HTTP (développement ou staging) démarré sur le port ${httpsPort}`);
  });
}

logger.info('Serveur TypeScript en cours d’exécution...');  