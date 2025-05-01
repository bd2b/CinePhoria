"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cinemaController_1 = require("../controllers/cinemaController");
const configLog_1 = __importDefault(require("../config/configLog"));
const authenticateOrigin_1 = require("../middlewares/authenticateOrigin");
const router = (0, express_1.Router)();
// /api/films
configLog_1.default.info('Declaration route /api/cinemas/');
router.get('/', authenticateOrigin_1.authenticateOrigin, cinemaController_1.CinemaController.getAllCinemas);
exports.default = router;
