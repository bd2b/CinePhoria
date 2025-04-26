"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seanceseuleController_1 = require("../controllers/seanceseuleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const configLog_1 = __importDefault(require("../config/configLog"));
const router = (0, express_1.Router)();
// /api/salles
configLog_1.default.info('Declaration route GET /api/seancesseules/');
router.get('/', authMiddleware_1.authenticateJWT, seanceseuleController_1.SeanceSeuleController.getAllSeanceSeules);
configLog_1.default.info('Declaration route POST /api/seancesseules');
router.post('/', authMiddleware_1.authenticateJWT, seanceseuleController_1.SeanceSeuleController.createSeanceSeule);
configLog_1.default.info('Declaration route GET /api/seancesseules/:id');
router.get('/:id', authMiddleware_1.authenticateJWT, seanceseuleController_1.SeanceSeuleController.getSeanceSeuleById);
configLog_1.default.info('Declaration route PUT /api/seancesseules/:id');
router.put('/:id', authMiddleware_1.authenticateJWT, seanceseuleController_1.SeanceSeuleController.updateSeanceSeule);
configLog_1.default.info('Declaration route DELETE /api/seancesseules/:id');
router.delete('/:id', authMiddleware_1.authenticateJWT, seanceseuleController_1.SeanceSeuleController.deleteSeanceSeule);
exports.default = router;
