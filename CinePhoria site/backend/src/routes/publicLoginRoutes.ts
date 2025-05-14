import { Router } from 'express';
import { AuthController } from '../controllers/authController'
import { authenticateJWT } from '../middlewares/authMiddleware';
import logger from '../config/configLog';

const router = Router();
// POST /api/login
logger.info('Declaration route /api/login/');

// api de login
router.post('/', AuthController.login);

// api de logout
router.get('/logout', AuthController.logout);


// api de verification de logging
router.get('/isLogged', authenticateJWT,
  (req, res) => {
    const user = (req as any).user;
    res.send(user)
  })

// api de renouvellement de accessToken via refreshToken
router.post('/refresh', AuthController.refresh)

// api de verification du refreshToken en httpOnly 
router.get('/refresh-token-status', authenticateJWT, (req, res) => {
  res.json({ message: "Refresh Token valide" });
});

// api de recupération de la version, build et date de mise à jour
router.get('/version',  AuthController.getVersion);

// api de push d'une maj version, build, date de mise à jour, message
router.post('/pushversion',  authenticateJWT, AuthController.pushVersion);

export default router;


