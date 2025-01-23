import { Router} from 'express';
import { AuthController } from '../controllers/authController'

const router = Router();
router.post('/', AuthController.login);
router.post('/confirm')
export default router;