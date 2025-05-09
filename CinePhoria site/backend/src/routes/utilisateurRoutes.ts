import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { validateBodyShape } from '../middlewares/validateBodyShape';
import logger from '../config/configLog'

import { UtilisateurController } from '../controllers/utilisateurController';

const router = Router();

// POST /api/utilisateur
logger.info('Declaration route /api/utilisateur/');
router.post('/create', UtilisateurController.createUtilisateur);

router.post('/confirmUtilisateur',
        validateBodyShape({
        id: 'string',
        password: 'string',
        displayName: 'string'
}), UtilisateurController.confirmUtilisateur);

validateBodyShape({
    id: 'string',
    password: 'string',
    displayName: 'string'
}),


router.post('/confirmCompte', UtilisateurController.confirmCompte);
router.post('/askresetpwd', UtilisateurController.sendCodeReset);
router.post('/resetpwd', UtilisateurController.validateChangePwd);

// (Futur) GET /api/reservation/:id
// router.get('/:id', authenticateJWT, UtilisateurController.getUtilisateurById);


router.post('/createEmploye', authenticateJWT, UtilisateurController.createEmploye);
router.get('/getemployes', authenticateJWT, UtilisateurController.getEmployesComptes);
router.put('/updateemploye', authenticateJWT, UtilisateurController.updateEmploye );

router.get('/getemploye/:matricule', authenticateJWT, UtilisateurController.getEmployeByMatricule);

router.delete('/deleteemploye/:matricule', authenticateJWT, UtilisateurController.deleteEmployeByMatricule);


// GET /api/utilisateur
router.get('/:ident', UtilisateurController.getUtilisateur);

// (Futur) GET /api/reservation/:email
router.get('/mail/:email', UtilisateurController.getUtilisateurByMail);


export default router;