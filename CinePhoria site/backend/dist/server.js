"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const configLog_1 = __importDefault(require("./config/configLog"));
const sanitiseQueryMiddleware_1 = __importDefault(require("./middlewares/sanitiseQueryMiddleware"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const compression_1 = __importDefault(require("compression"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
function loadEnv() {
    const possiblePaths = [
        path_1.default.resolve(__dirname, '../../env/.env'), // dev (src/server.ts)
        path_1.default.resolve(__dirname, '../env/.env'), // prod Docker (dist/server.js)
        path_1.default.resolve(process.cwd(), 'env/.env'), // fallback général
    ];
    for (const envPath of possiblePaths) {
        if (fs_1.default.existsSync(envPath)) {
            dotenv_1.default.config({ path: envPath });
            console.log(`✅ Fichier .env chargé depuis : ${envPath}`);
            return;
        }
    }
    console.error('❌ Aucun fichier .env trouvé');
}
loadEnv();
configLog_1.default.info("Version env après chargement :" + process.env.MAJEURE + " - " + process.env.MINEURE + " - " + process.env.BUILD);
// Connexion à la base MongoDB
const config_1 = require("./config/config");
console.log(`🛠️ Mode actuel : ${config_1.modeExec} avec version ${JSON.stringify(config_1.versionCourante)}`);
(0, config_1.connectDBMongo)();
const app = (0, express_1.default)();
// Suppression de la signature
app.disable('x-powered-by');
app.use((0, cookie_parser_1.default)()); // ✅ Important
// ✅ Middleware pour la compression
// 🔹 Active la compression gzip
app.use((0, compression_1.default)());
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
app.use(sanitiseQueryMiddleware_1.default); // Appliquer à toutes les routes
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
const incidentRoutes_1 = __importDefault(require("./routes/incidentRoutes"));
const mailRoutes_1 = __importDefault(require("./routes/mailRoutes"));
const publicLoginRoutes_1 = __importDefault(require("./routes/publicLoginRoutes"));
app.use('/api/films', filmRoutes_1.default);
app.use('/api/cinemas', cinemaRoutes_1.default);
app.use('/api/salles', salleRoute_1.default);
app.use('/api/seances', seanceRoutes_1.default);
app.use('/api/seancesseules', seanceseuleRoutes_1.default);
app.use('/api/reservation', reservationRoutes_1.default);
app.use('/api/utilisateur', utilisateurRoutes_1.default);
app.use('/api/incidents', incidentRoutes_1.default);
app.use('/api/login', publicLoginRoutes_1.default);
app.use('/api/mail', mailRoutes_1.default);
// Route pour servir les fichiers statics
// cas particulier le mode developpement PROD et STAGING pareil
const frontPath = (config_1.modeExec === 'developpement')
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
// Dev ou PROD
let httpsPort = 3500;
let httpPort = 3000;
if (config_1.modeExec === 'stagging') {
    httpsPort = 3600;
    httpPort = 3100;
}
if (config_1.modeExec === 'production') {
    const sslKeyPath = process.env.SSL_KEY_PATH || '/usr/src/app/ssl/private.key';
    const sslCertPath = process.env.SSL_CERT_PATH || '/usr/src/app/ssl/certificate.crt';
    const privateKey = fs_1.default.readFileSync(sslKeyPath, 'utf8');
    const certificate = fs_1.default.readFileSync(sslCertPath, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https_1.default.createServer(credentials, app);
    httpsServer.listen(httpsPort, () => {
        console.log(`✅ Serveur HTTPS (production) démarré sur ${config_1.urlString}:${httpsPort}`);
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
        console.log(`🛠️ Serveur HTTP (développement ou staging) démarré sur le port ${httpsPort}`);
    });
}
configLog_1.default.info('Serveur TypeScript en cours d’exécution...');
