"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const configLog_1 = __importDefault(require("./config/configLog"));
const sanitiseQueryMiddleware_1 = __importDefault(require("./middlewares/sanitiseQueryMiddleware"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' });
const mode = process.env.DEVELOPPEMENT === 'true' ? 'développement' : 'production';
console.log(`🛠️ Mode actuel : ${mode}`);
// Connexion à la base MongoDB
const config_1 = require("./config/config");
(0, config_1.connectDBMongo)();
const app = (0, express_1.default)();
// Middleware de protection contre les injections
app.use(sanitiseQueryMiddleware_1.default); // Appliquer à toutes les routes
const PORT = process.env.PORT || 3000;
// ✅ Configuration CORS pour accepter localhost:3000
app.use((0, cors_1.default)({
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
// ✅ Middleware pour gérer l'upload de fichiers
app.use((0, express_fileupload_1.default)({
    // Options facultatives
    parseNested: true,
    useTempFiles: false,
    createParentPath: true,
    limits: { fileSize: 1 * 1024 * 1024 }, // Limite à 1MB
}));
// ✅ Middleware JSON (Obligatoire pour Express)
app.use(express_1.default.json());
const filmRoutes_1 = __importDefault(require("./routes/filmRoutes"));
const cinemaRoutes_1 = __importDefault(require("./routes/cinemaRoutes"));
const salleRoute_1 = __importDefault(require("./routes/salleRoute"));
const seanceRoutes_1 = __importDefault(require("./routes/seanceRoutes"));
const seanceseuleRoutes_1 = __importDefault(require("./routes/seanceseuleRoutes"));
const reservationRoutes_1 = __importDefault(require("./routes/reservationRoutes"));
const utilisateurRoutes_1 = __importDefault(require("./routes/utilisateurRoutes"));
const mailRoutes_1 = __importDefault(require("./routes/mailRoutes"));
const publicLoginRoutes_1 = __importDefault(require("./routes/publicLoginRoutes"));
app.use('/api/films', filmRoutes_1.default);
app.use('/api/cinemas', cinemaRoutes_1.default);
app.use('/api/salles', salleRoute_1.default);
app.use('/api/seances', seanceRoutes_1.default);
app.use('/api/seancesseules', seanceseuleRoutes_1.default);
app.use('/api/reservation', reservationRoutes_1.default);
app.use('/api/utilisateur', utilisateurRoutes_1.default);
app.use('/api/mail', mailRoutes_1.default);
app.use('/api/login', publicLoginRoutes_1.default);
app.listen(PORT, () => {
    configLog_1.default.info(`Backend démarré sur le port ${PORT}`);
});
configLog_1.default.info('Serveur TypeScript en cours d’exécution...');
