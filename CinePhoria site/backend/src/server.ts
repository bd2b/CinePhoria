import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
// console.log(process.env);

import express from 'express';

import filmRoutes from './routes/filmRoutes';
import cinemaRoutes from './routes/cinemaRoutes';
import seanceRoutes from './routes/seanceRoutes';
import reservationRoutes from './routes/reservationRoutes';


import loginRoutes from './routes/publicLoginRoutes';
import intranetLoginRoutes from './routes/intranetLoginRoutes';

import cors from 'cors';
import logger  from './config/configLog';
import session from 'express-session'; // pour la gestion de session si besoin

import sanitizeQueryMiddleware from './middlewares/sanitiseQueryMiddleware'


const app = express();
app.use(express.json());
app.use(cors());

import { sessionTK } from './config/config';
// Gestion de session pour les employes
app.use(session(sessionTK));

// Middleware de protection contre les injections
app.use(sanitizeQueryMiddleware); // Appliquer à toutes les routes

// Middleware pour parser les requêtes JSON
app.use(express.json());

app.use('/api/films', filmRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/seances', seanceRoutes);

app.use('/api/login', loginRoutes);
app.use('/api/intranet', intranetLoginRoutes);
app.use('/api/reservation', reservationRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Backend démarré sur le port ${PORT}`);
});

logger.info('Serveur TypeScript en cours d’exécution...');  