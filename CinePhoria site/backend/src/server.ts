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
dotenv.config({ path: './.env' });
logger.info("Valeurs env après chargement :" + process.env.MAJEURE + process.env.MINEURE + process.env.BUILD);





// Connexion à la base MongoDB
import { connectDBMongo , modeExec , versionCourante} from './config/config';

console.log(`🛠️ Mode actuel : ${modeExec} avec version ${JSON.stringify(versionCourante)}`);

connectDBMongo()

const app = express();

// Suppression de la signature
app.disable('x-powered-by');

app.use(cookieParser()); // ✅ Important

// ✅ Middleware pour la compression
// 🔹 Active la compression gzip (ou brotli si le client le supporte)
app.use(compression());


// 🔵 CORS doit venir immédiatement après l'initialisation d'app
// app.use(cors({
//   origin: (origin, callback) => {

//     if (!origin) {
//       // Les requêtes sans Origin sont acceptées
//       callback(null, true);
//     } else if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
//       // Accepté pour développement
//       logger.info("Origine 222= " + origin)
//       callback(null, true);
//     } else if (origin.startsWith('https://cinephoria.bd2db.com')) {
//       callback(null, true);
//     } else {
//       //  callback(null, true);
//       // ----- callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: "GET,POST,PUT,DELETE,OPTIONS",
//   allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
// }));

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


// ✅ Configuration CORS pour accepter localhost:3000
// app.use(cors({
//   origin: 'http://localhost:3500', // Autorise uniquement le frontend
//   credentials: true, // Permet les cookies et sessions si besoin
//   methods: "GET,POST,PUT,DELETE,OPTIONS",
//   allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
// }));

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || origin.startsWith('http://localhost')) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: "GET,POST,PUT,DELETE,OPTIONS",
//   allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
// }));

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

app.use('/api/mail', mailRoutes);

app.use('/api/login', loginRoutes);

// Route pour servir les fichiers statics
const frontPath = (modeExec === 'développement')
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

const httpsPort = 3500;
const httpPort = 3000;

if (modeExec === 'production') {
  const sslKeyPath = process.env.SSL_KEY_PATH || '/usr/src/app/ssl/private.key';
  const sslCertPath = process.env.SSL_CERT_PATH || '/usr/src/app/ssl/certificate.crt';

  const privateKey = fs.readFileSync(sslKeyPath, 'utf8');
  const certificate = fs.readFileSync(sslCertPath, 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(httpsPort, () => {
    console.log(`✅ Serveur HTTPS (production) démarré sur le port ${httpsPort}`);
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
    console.log(`🛠️ Serveur HTTP (développement) démarré sur le port ${httpsPort}`);
  });
}

logger.info('Serveur TypeScript en cours d’exécution...');  