// src/services/QRCode.ts
import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import logger from '../config/configLog'
import { modeExec } from '../config/config';
import path from 'path';

export class QRCodeService {
  private static drawImage(qrCanvas: HTMLCanvasElement, centerImage: HTMLImageElement, factor: number): void {
    const h = qrCanvas.height;
    const cs = h * factor;
    const co = (h - cs) / 2;
    const ctx = qrCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(centerImage, 0, 0, centerImage.width, centerImage.height, co, co, cs, cs);
    }
  }

  public static async generateQRCode(text: string, width = 300, height = 300): Promise<Buffer> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Génération du QR Code
    await QRCode.toCanvas(canvas, text, {
      errorCorrectionLevel: 'H',
      color: {
        dark: "#000000",
        light: "#ffffff",
      }
    });
    logger.info("2");
    return canvas.toBuffer();
  }

  public static async generateQRCodeWithImage(
    text: string,
    imagePath = '',
    width = 300,
    height = 300,
    factor = 0.15 // Taille de l'image par rapport au QR Code
  ): Promise<Buffer> {
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Générer le QR Code sous forme de modules
    const qrData = await QRCode.create(text, {
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
        if (
          (row < 7 && col < 7) || // Coin haut gauche
          (row < 7 && col >= qrData.modules.size - 7) || // Coin haut droit
          (row >= qrData.modules.size - 7 && col < 7) // Coin bas gauche
        ) {
          ctx.fillStyle = "#daa520"; // Rouge pour les yeux
        } else {
          ctx.fillStyle = "#2C3E50"; // Noir pour le reste
        }
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    });

    // Charger l'image à insérer au centre
    let imagePathVar = imagePath
    if (imagePathVar === '') {
      imagePathVar = path.join(__dirname, '../assets/camera-qr.png');
      logger.info("Chargement de l'image depuis : " + imagePathVar);
    }
    const centerImage = await loadImage(imagePathVar);
    if (centerImage) { logger.info("Pas d'acces à l'image") }

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