"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incidentController_1 = require("../controllers/incidentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const configLog_1 = __importDefault(require("../config/configLog"));
const router = (0, express_1.Router)();
// /api/incidents
configLog_1.default.info('Declaration route GET /api/incidents/');
router.get('/', authMiddleware_1.authenticateJWT, incidentController_1.IncidentController.getAllIncidents);
configLog_1.default.info('Declaration route POST /api/incidents');
router.post('/', authMiddleware_1.authenticateJWT, incidentController_1.IncidentController.createIncident);
configLog_1.default.info('Declaration route GET /api/incidents/:id');
router.get('/:id', authMiddleware_1.authenticateJWT, incidentController_1.IncidentController.getIncidentById);
configLog_1.default.info('Declaration route PUT /api/incidents/:id');
router.put('/:id', authMiddleware_1.authenticateJWT, incidentController_1.IncidentController.updateIncident);
configLog_1.default.info('Declaration route DELETE /api/incidents/:id');
router.delete('/:id', authMiddleware_1.authenticateJWT, incidentController_1.IncidentController.deleteIncident);
exports.default = router;
