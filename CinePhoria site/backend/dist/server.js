"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const configLog_1 = __importDefault(require("./config/configLog"));
const sanitiseQueryMiddleware_1 = __importDefault(require("./middlewares/sanitiseQueryMiddleware"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' });
configLog_1.default.info("Valeurs env après chargement :" + process.env.MAJEURE + process.env.MINEURE + process.env.BUILD);
// Connexion à la base MongoDB
const config_1 = require("./config/config");
console.log(`🛠️ Mode actuel : ${config_1.modeExec} avec version ${JSON.stringify(config_1.versionCourante)}`);
(0, config_1.connectDBMongo)();
const app = (0, express_1.default)();
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
// Middleware de protection contre les injections
app.use(sanitiseQueryMiddleware_1.default); // Appliquer à toutes les routes
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
// Route pour servir les fichiers statics
const frontPath = (config_1.modeExec === 'développement')
    ? path_1.default.join(__dirname, '../../frontend/public/')
    : path_1.default.join(__dirname, '../public');
console.log(`🔍 Fichiers front servis depuis : ${frontPath}`);
// Rediriger la racine vers visiteur.html
app.get('/', (req, res) => {
    res.redirect('/visiteur.html');
});
app.use(express_1.default.static(frontPath));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontPath));
// });
const httpsPort = 3500;
const httpPort = 3000;
if (config_1.modeExec === 'production') {
    const sslKeyPath = process.env.SSL_KEY_PATH || '/usr/src/app/ssl/private.key';
    const sslCertPath = process.env.SSL_CERT_PATH || '/usr/src/app/ssl/certificate.crt';
    const privateKey = fs_1.default.readFileSync(sslKeyPath, 'utf8');
    const certificate = fs_1.default.readFileSync(sslCertPath, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https_1.default.createServer(credentials, app);
    httpsServer.listen(httpsPort, () => {
        console.log(`✅ Serveur HTTPS (production) démarré sur le port ${httpsPort}`);
    });
    const httpServer = http_1.default.createServer((req, res) => {
        const host = req.headers['host']?.split(':')[0] || 'localhost';
        res.writeHead(301, { Location: `https://${host}:${httpsPort}${req.url}` });
        res.end();
    });
    httpServer.listen(httpPort, () => {
        console.log(`🚀 Serveur HTTP (redirection vers HTTPS) démarré sur le port ${httpPort}`);
    });
}
else {
    app.listen(httpsPort, () => {
        console.log(`🛠️ Serveur HTTP (développement) démarré sur le port ${httpsPort}`);
    });
}
// app.listen(PORT, () => {
//   logger.info(`Backend démarré sur le port ${PORT}`);
// });
configLog_1.default.info('Serveur TypeScript en cours d’exécution...');
