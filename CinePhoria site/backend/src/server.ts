import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';


import cors from 'cors';
import logger  from './config/configLog';

import sanitizeQueryMiddleware from './middlewares/sanitiseQueryMiddleware'

const app = express();

// Middleware de protection contre les injections
 app.use(sanitizeQueryMiddleware); // Appliquer à toutes les routes

const PORT = process.env.PORT || 3000;

// ✅ Configuration CORS pour accepter localhost:3000
app.use(cors({
  origin: 'http://127.0.0.1:3000', // Autorise uniquement le frontend
  credentials: true, // Permet les cookies et sessions si besoin
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));

// ✅ Middleware pour tester l'origine (DEBUG)
// app.use((req, res, next) => {
//   console.log("Requête depuis :", req.headers.origin);
//   next();
// });

// ✅ Middleware JSON (Obligatoire pour Express)
app.use(express.json());

import filmRoutes from './routes/filmRoutes';
import cinemaRoutes from './routes/cinemaRoutes';
import seanceRoutes from './routes/seanceRoutes';
import reservationRoutes from './routes/reservationRoutes';
import utilisateurRoutes from'./routes/utilisateurRoutes';

import mailRoutes from './routes/mailRoutes';
import loginRoutes from './routes/publicLoginRoutes';

app.use('/api/films', filmRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/utilisateur', utilisateurRoutes);

app.use('/api/mail', mailRoutes);

app.use('/api/login', loginRoutes);



app.listen(PORT, () => {
  logger.info(`Backend démarré sur le port ${PORT}`);
});

logger.info('Serveur TypeScript en cours d’exécution...');  