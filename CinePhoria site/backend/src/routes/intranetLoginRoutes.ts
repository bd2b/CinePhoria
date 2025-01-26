import { Router} from 'express';
import { SessionController  } from '../controllers/sessionController'
import logger from '../config/configLog';

const router = Router();
// POST /api/intranet
logger.info('Declaration route /api/intranet/');
router.post('/', SessionController.login);
router.post('/logout', SessionController.logout);

export default router;