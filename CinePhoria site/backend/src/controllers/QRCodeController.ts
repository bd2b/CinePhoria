import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { QRCodeService } from '../services/QRCode';
import { text } from 'stream/consumers';

const writeFileAsync = promisify(fs.writeFile);

export async function generateQRCode (textQRCode: string) {
    // Utilisation de QRCodeService pour générer l'image
    
    const qrCodeBuffer = await QRCodeService.generateQRCodeWithImage(textQRCode);

    const fileName = `qrcode-${Date.now()}.png`;
    const filePath = path.join(__dirname, '../../public/qrcodes', fileName);

    await writeFileAsync(filePath, qrCodeBuffer);

}
export class QRCodeController {
  static async createQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { textContent } = req.body;
      if (!textContent) {
        res.status(400).json({ error: 'textContent is required' });
        return;
      }
      await generateQRCode(textContent)

      res.json({ message: 'QR Code generated' });
    } catch (error) {
      console.error('Error generating QR Code:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}