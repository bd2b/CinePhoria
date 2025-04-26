"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' });
const mysql2_1 = __importDefault(require("mysql2"));
const dbConfiglocal = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, // Assurez-vous que cette variable est correcte
};
console.log('Configuration DB:', dbConfiglocal);
const connexion = mysql2_1.default.createConnection(dbConfiglocal);
connexion.connect((err) => {
    if (err) {
        console.error('Erreur de connexion :', err);
        return;
    }
    console.log('Connexion réussie !');
    connexion.query('SELECT * FROM Film', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête :', error);
        }
        else {
            console.log('Résultats :', results);
        }
        connexion.end();
    });
});
