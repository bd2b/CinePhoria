"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config"); // Importer la configuration de la base de données
console.log(JSON.stringify(config_1.dbConfig));
console.log("1");
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const dbConfigLocal = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mydatabase',
};
class Film {
    constructor(data) {
        Object.assign(this, data);
    }
}
class TestDAO {
    static async findAll() {
        console.log("2");
        console.log(JSON.stringify(dbConfigLocal));
        console.log("3");
        const connection = await promise_1.default.createConnection(dbConfigLocal); // Utilise dbConfig ici
        console.log('Connexion réussie, exécution de la requête : SELECT * FROM Film');
        const [rows] = await connection.execute('SELECT * FROM Film');
        await connection.end();
        return rows.map(row => new Film(row));
    }
}
async function main() {
    try {
        console.log('Début du test de connexion');
        const films = await TestDAO.findAll();
        console.log('Films récupérés :', JSON.stringify(films, null, 2));
    }
    catch (error) {
        console.error('Erreur lors du test de connexion :', error);
    }
}
main();
