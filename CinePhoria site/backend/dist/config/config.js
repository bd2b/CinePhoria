"use strict";
// Nécessite que l'ensemble soit chargé en amont dans server.ts
// import dotenv from 'dotenv';
// import path from 'path';
// Charger les variables d'environnement depuis le fichier .env
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = exports.connectDBMongo = exports.ConfigMongo = exports.nombreTentativeLoginKO = exports.jwtTK = exports.mailConfig = exports.dbConfig = exports.versionCourante = exports.modeExec = void 0;
const configLog_1 = __importDefault(require("../config/configLog"));
const mongoose_1 = __importDefault(require("mongoose"));
const promise_1 = __importDefault(require("mysql2/promise"));
// Exporter le mode d'exécution
exports.modeExec = process.env.DEVELOPPEMENT === 'true' ? 'développement' : 'production';
// Exporter la version
exports.versionCourante = {
    majeure: parseInt(process.env.MAJEURE || "0", 10),
    mineure: parseInt(process.env.MINEURE || "0", 10),
    build: parseInt(process.env.BUILD || "0", 10)
};
// Exporter la configuration de la base de données
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mydatabase',
    multipleStatements: true, // Autorise plusieurs requêtes dans une seule commande
    timezone: 'Europe/Paris'
};
// Exporter la configuration de l'envoi de mail, lue depuis les variables d'environnement
exports.mailConfig = {
    STARTTLS: process.env.STARTTLS || 'true', // ex. 'true' ou 'false'
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.free.fr',
    SMTP_PORT: process.env.SMTP_PORT || '465',
    SMTP_USER: process.env.SMTP_USER || 'yyyyyy',
    SMTP_PASS: process.env.SMTP_PASS || 'xxxxxxx',
    SMTP_FROM: 'CINEPHORIA<cinephoria@free.fr>'
};
// copie de l'objet pour masquer la valeur de "password"
const maskeddbConfig = {
    ...exports.dbConfig,
    password: "*".repeat(exports.dbConfig.password.length), // Remplace la valeur par des étoiles
};
configLog_1.default.info('Configuration DB chargée :' + JSON.stringify(maskeddbConfig));
exports.jwtTK = process.env.JWT_SECRET || 'secretjws';
// copie de l'objet pour masquer la valeur
const masquedjwtTK = "*".repeat(exports.jwtTK.length); // Remplace la valeur par des étoiles
configLog_1.default.info('Configuration secret JWS :' + masquedjwtTK);
exports.nombreTentativeLoginKO = parseInt(process.env.MAX_TENTATIVE_LOGIN_KO_BEFORE_BLOCKED || '3', 10);
exports.ConfigMongo = {
    mongoUri: process.env.MONGO_URI || '',
};
const connectDBMongo = async () => {
    try {
        await mongoose_1.default.connect(exports.ConfigMongo.mongoUri);
        configLog_1.default.info('MongoDB connecté.');
    }
    catch (error) {
        configLog_1.default.error('Erreur connexion MongoDB :', error);
    }
};
exports.connectDBMongo = connectDBMongo;
// Ajout de la nouvelle exportation dbPool
exports.dbPool = promise_1.default.createPool({
    host: exports.dbConfig.host,
    user: exports.dbConfig.user,
    password: exports.dbConfig.password,
    database: exports.dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: exports.dbConfig.multipleStatements,
    timezone: exports.dbConfig.timezone,
});
