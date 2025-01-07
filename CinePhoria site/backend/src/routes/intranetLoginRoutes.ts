import { Router} from 'express';
import { SessionController  } from '../controllers/sessionController'

const router = Router();
router.post('/', SessionController.login);
router.post('/logout', SessionController.logout);

export default router;