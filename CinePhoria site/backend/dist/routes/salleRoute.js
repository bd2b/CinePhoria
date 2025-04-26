"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salleController_1 = require("../controllers/salleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const configLog_1 = __importDefault(require("../config/configLog"));
const router = (0, express_1.Router)();
// /api/salles
configLog_1.default.info('Declaration route GET /api/salles/');
router.get('/', authMiddleware_1.authenticateJWT, salleController_1.SalleController.getAllSalles);
configLog_1.default.info('Declaration route POST /api/salles');
router.post('/', authMiddleware_1.authenticateJWT, salleController_1.SalleController.createSalle);
configLog_1.default.info('Declaration route GET /api/salles/:id');
router.get('/:id', authMiddleware_1.authenticateJWT, salleController_1.SalleController.getSalleById);
configLog_1.default.info('Declaration route GET /api/salles/cinema/:cinema');
router.get('/cinema/:cinema', authMiddleware_1.authenticateJWT, salleController_1.SalleController.getSalleByCinema);
configLog_1.default.info('Declaration route PUT /api/salles/:id');
router.put('/:id', authMiddleware_1.authenticateJWT, salleController_1.SalleController.updateSalle);
configLog_1.default.info('Declaration route DELETE /api/salles/:id');
router.delete('/:id', authMiddleware_1.authenticateJWT, salleController_1.SalleController.deleteSalle);
exports.default = router;
