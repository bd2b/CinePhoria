"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
// src/services/QRCode.ts
const canvas_1 = require("canvas");
const qrcode_1 = __importDefault(require("qrcode"));
const configLog_1 = __importDefault(require("../config/configLog"));
class QRCodeService {
    static drawImage(qrCanvas, centerImage, factor) {
        const h = qrCanvas.height;
        const cs = h * factor;
        const co = (h - cs) / 2;
        const ctx = qrCanvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(centerImage, 0, 0, centerImage.width, centerImage.height, co, co, cs, cs);
        }
    }
    static async generateQRCode(text, width = 300, height = 300) {
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const ctx = canvas.getContext('2d');
        // Génération du QR Code
        await qrcode_1.default.toCanvas(canvas, text, {
            errorCorrectionLevel: 'H',
            color: {
                dark: "#000000",
                light: "#ffffff",
            }
        });
        configLog_1.default.info("2");
        return canvas.toBuffer();
    }
    static async generateQRCodeWithImage(text, imagePath = './camera-qr.png', width = 300, height = 300, factor = 0.15 // Taille de l'image par rapport au QR Code
    ) {
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const ctx = canvas.getContext('2d');
        // Générer le QR Code sous forme de modules
        const qrData = await qrcode_1.default.create(text, {
            errorCorrectionLevel: 'H', // Nécessaire pour supporter une image
        });
        const cellSize = width / qrData.modules.size; // Taille d'une cellule
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height); // Fond blanc
        // Dessiner chaque module du QR Code
        qrData.modules.data.forEach((value, index) => {
            const row = Math.floor(index / qrData.modules.size);
            const col = index % qrData.modules.size;
            if (value) {
                // Vérifier si c'est un des trois "yeux" et lui attribuer une couleur spéciale
                if ((row < 7 && col < 7) || // Coin haut gauche
                    (row < 7 && col >= qrData.modules.size - 7) || // Coin haut droit
                    (row >= qrData.modules.size - 7 && col < 7) // Coin bas gauche
                ) {
                    ctx.fillStyle = "#daa520"; // Rouge pour les yeux
                }
                else {
                    ctx.fillStyle = "#2C3E50"; // Noir pour le reste
                }
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        });
        // Charger l'image à insérer au centre
        const centerImage = await (0, canvas_1.loadImage)(imagePath);
        // Définir la taille et la position de l'image centrale
        const imgSize = width * factor;
        const imgX = (width - imgSize) / 2;
        const imgY = (height - imgSize) / 2;
        // Dessiner l'image au centre du QR Code
        ctx.drawImage(centerImage, imgX, imgY, imgSize, imgSize);
        // Retourner le buffer de l'image finale
        return canvas.toBuffer();
    }
}
exports.QRCodeService = QRCodeService;
