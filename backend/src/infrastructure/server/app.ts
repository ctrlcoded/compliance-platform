import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from '../logger';
import { complianceRouter } from '../../adapters/inbound/http/routes/compliance.routes';
import { routesRouter } from '../../adapters/inbound/http/routes/routes.routes';
import { bankingRouter } from '../../adapters/inbound/http/routes/banking.routes';
import { poolsRouter } from '../../adapters/inbound/http/routes/pools.routes';
import { errorHandler } from '../../adapters/inbound/http/middlewares/errorHandler';
import { globalRateLimiter } from '../../adapters/inbound/http/middlewares/rateLimiter';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Global Rate Limiting
app.use(globalRateLimiter);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// API Routes
app.use('/api/v1/compliance', complianceRouter);
app.use('/api/v1/routes', routesRouter);
app.use('/api/v1/banking', bankingRouter);
app.use('/api/v1/pools', poolsRouter);

// Error Handling (Must be last)
app.use(errorHandler);
