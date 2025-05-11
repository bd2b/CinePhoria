import { MailController } from '../controllers/mailController'
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog';

const router = Router();
logger.info('Declaration route /api/mail/');
router.post('/sendmailcontact',  MailController.sendMailContact);

export default router;