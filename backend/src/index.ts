import { app } from './infrastructure/server/app';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/logger';

const startServer = () => {
    try {
        app.listen(env.PORT, () => {
            logger.info(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        });
    } catch (err) {
        logger.fatal(err, 'Failed to start server');
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (err) => {
    logger.fatal(err, 'Unhandled Rejection');
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.fatal(err, 'Uncaught Exception');
    process.exit(1);
});
