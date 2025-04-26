"use strict";
/**
 * Exemple d'utilisation de fichier log a partir du module winston
 */
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require('winston');
const logger2 = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'backend-CinePhoria' },
    transports: [
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf((info) => {
        return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    })),
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            format: winston.format.json(), // Format JSON pour les fichiers
        }),
        new winston.transports.File({
            filename: 'combined.log',
            format: winston.format.json(),
        }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), // Ajoute des couleurs dans la console
            winston.format.simple() // Format texte brut pour la console
            ),
        }),
    ],
});
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple(),
//   }));
// }
//
// Logging
//
// logger.log({
//     level: 'info',
//     message: 'Hello distributed log files!'
//   });
// logger.info('Hello again distributed logs');
// logger.log('silly', "127.0.0.1 - there's no place like home");
// logger.log('debug', "127.0.0.1 - there's no place like home");
// logger.log('verbose', "127.0.0.1 - there's no place like home");
// logger.log('info', "127.0.0.1 - there's no place like home");
// logger.log('warn', "127.0.0.1 - there's no place like home");
// logger.log('error', "127.0.0.1 - there's no place like home");
// logger.info("127.0.0.1 - there's no place like home");
// logger.warn("127.0.0.1 - there's no place like home");
// logger.error("127.0.0.1 - there's no place like home");
exports.default = logger;
