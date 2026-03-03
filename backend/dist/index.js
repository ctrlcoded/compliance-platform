"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./infrastructure/server/app");
const env_1 = require("./infrastructure/config/env");
const logger_1 = require("./infrastructure/logger");
const startServer = () => {
    try {
        app_1.app.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`Server is running in ${env_1.env.NODE_ENV} mode on port ${env_1.env.PORT}`);
        });
    }
    catch (err) {
        logger_1.logger.fatal(err, 'Failed to start server');
        process.exit(1);
    }
};
startServer();
process.on('unhandledRejection', (err) => {
    logger_1.logger.fatal(err, 'Unhandled Rejection');
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    logger_1.logger.fatal(err, 'Uncaught Exception');
    process.exit(1);
});
