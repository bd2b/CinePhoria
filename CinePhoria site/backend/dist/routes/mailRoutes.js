"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailController_1 = require("../controllers/mailController");
const express_1 = require("express");
const configLog_1 = __importDefault(require("../config/configLog"));
const router = (0, express_1.Router)();
configLog_1.default.info('Declaration route /api/mail/');
router.post('/sendmailcontact', mailController_1.MailController.sendMail);
exports.default = router;
