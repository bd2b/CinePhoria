import { Router} from 'express';
import { AuthController } from '../controllers/authController'
import logger from '../config/configLog';

const router = Router();
// POST /api/login
logger.info('Declaration route /api/login/');
router.post('/', AuthController.login);
export default router;